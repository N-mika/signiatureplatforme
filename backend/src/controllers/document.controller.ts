import { Request, Response } from "express";
import path from "path";
import { PDFDocument } from "pdf-lib";
import fs from "fs";

import Document from "../models/document.model";
import { generateSignatureToken } from "../services/token.service";
import { sendSignatureEmail } from "../services/email.service";
import { SIGNATURE_POSITIONS } from "../config/signatureposition";
import { supabase } from "../supabase";


/**
 * ---------------------------------------------------------
 * Créer un document
 * ---------------------------------------------------------
 */
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, presidentEmail, memberEmail, file } = req.body;

    if (!title || !presidentEmail || !memberEmail || !file) {
      return res.status(400).json({
        message: "Le titre, l'email du Président, le fichier et l'email du Membre sont obligatoires"
      });
    }

    const presidentToken = generateSignatureToken();
    const memberToken = generateSignatureToken();

    const document = await Document.create({
      title,

      originalFile: file,

      signers: {
        president: {
          role: "president",
          email: presidentEmail,
          signatureToken: presidentToken,
          tokenUsed: false,
          position: SIGNATURE_POSITIONS.president,
          signed: false,
          signedAt: null
        },

        member: {
          role: "member",
          email: memberEmail,
          signatureToken: memberToken,
          tokenUsed: false,
          position: SIGNATURE_POSITIONS.member,
          signed: false,
          signedAt: null
        }
      },

      status: "En attente",
      signedAt: null
    });

    await sendSignatureEmail(presidentEmail, title, "president", presidentToken);

    await sendSignatureEmail(memberEmail, title, "member", memberToken);

    return res.status(201).json({
      message: "Document créé et envoyé aux signataires",
      document,
      links: {
        president: `/sign/${presidentToken}`,
        member: `/sign/${memberToken}`
      }
    });
  } catch (error) {
    console.error("Erreur création document :", error);

    return res.status(500).json({
      message: "Erreur serveur",
      error
    });
  }
};

/**
 * ---------------------------------------------------------
 * Trouver le document grâce au token
 * ---------------------------------------------------------
 */
export const getDocumentByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const document = await Document.findOne({
      $or: [
        {
          "signers.president.signatureToken": token
        },
        {
          "signers.member.signatureToken": token
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable"
      });
    }

    /**
     * Identifier le signataire
     */
    let signerRole: "president" | "member";

    if (
      document.signers.president.signatureToken === token
    ) {
      signerRole = "president";
    } else {
      signerRole = "member";
    }

    const signer = document.signers[signerRole];

    return res.json({
      _id: document._id,
      title: document.title,

      status: document.status,

      signer: {
        role: signer.role,
        email: signer.email,
        signed: signer.signed,
        signedAt: signer.signedAt
      },

      originalFile: document.originalFile,

      signedFile: document.signedFile
    });
  } catch (error) {
    console.error(
      "Erreur récupération document :",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur",
      error
    });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable",
      });
    }

    return res.status(200).json(document);
  } catch (err) {
    console.error("Erreur getDocumentById :", err);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
/**
 * ---------------------------------------------------------
 * Servir le PDF
 * ---------------------------------------------------------
*/

export const getDocumentFile = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const document = await Document.findOne({
      $or: [
        { "signers.president.signatureToken": token },
        { "signers.member.signatureToken": token }
      ]
    });

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable"
      });
    }

    let filePath: string;
    // Document final
    if (document.signedFile?.path) {
      filePath = document.signedFile.path;
    } else {
      // Document en cours de signature
      const hasSignature = document.signers.president.signed ||  document.signers.member.signed;

      if (hasSignature) {
        const workingPath = `working/${document.originalFile.path.split("/").pop()}`;

        const { data: workingData, error: workingError } = await supabase.storage.from("aesnasignature").createSignedUrl(workingPath, 60 * 60);
        console.log("✅ URL signée générée pour le fichier intermédiaire :", workingPath);
        if (!workingError && workingData?.signedUrl) {
          filePath = workingPath;
        } else {
          // Si le working n'existe pas, on revient à l'original
          filePath = document.originalFile.path;
        }
      } else {
        // Aucune signature
        filePath = document.originalFile.path;
      }
    }

    console.log("Fichier demandé :", filePath);

    const { data, error } = await supabase.storage
      .from("aesnasignature")
      .createSignedUrl(filePath, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("Erreur URL signée :", error);

      return res.status(404).json({
        message: "Fichier PDF introuvable"
      });
    }

    console.log("URL signée générée");

    return res.status(200).json({
      url: data.signedUrl
    });

  } catch (error) {
    console.error("Erreur récupération fichier PDF :", error);

    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const getWorkingFilePath = (documentId: string) => {
  return path.join("src", "uploads", "working", `working-${documentId}.pdf`);
};

export const getAllDocument = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find();
    return res.status(200).json(documents);
  } catch (error) {
    console.error("Erreur récupération documents :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};
