import { Request, Response } from "express";
import path from "path";
import { PDFDocument } from "pdf-lib";
import fs from "fs";

import Document from "../models/document.model";
import { generateSignatureToken } from "../services/token.service";
import { sendSignatureEmail } from "../services/email.service";

// Positions prédéfinies
const SIGNATURE_POSITIONS = {
  member: {
    page: 2,
    x: 35,
    y: 72,
    width: 75,
    height: 25,
    pdfWidth: 242.88,
    pdfHeight: 153
  },

  president: {
    page: 2,
    x: 175,
    y: 72,
    width: 75,
    height: 25,
    pdfWidth: 242.88,
    pdfHeight: 153
  }
};

/**
 * ---------------------------------------------------------
 * Créer un document
 * ---------------------------------------------------------
 */
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, presidentEmail, memberEmail } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Le fichier PDF est obligatoire"
      });
    }

    if (!title || !presidentEmail || !memberEmail) {
      return res.status(400).json({
        message: "Le titre, l'email du Président et l'email du Membre sont obligatoires"
      });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Le fichier doit être un PDF"
      });
    }

    const presidentToken = generateSignatureToken();
    const memberToken = generateSignatureToken();

    const document = await Document.create({
      title,

      originalFile: {
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype
      },

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
    console.log("EMAIL_USER :", process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD existe :", !!process.env.EMAIL_PASSWORD);
    await sendSignatureEmail(
      presidentEmail,
      title,
      "president",
      presidentToken
    );

    await sendSignatureEmail(
      memberEmail,
      title,
      "member",
      memberToken
    );

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

    const signer =
      document.signers[signerRole];

    return res.json({
      id: document._id,
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

/**
 * ---------------------------------------------------------
 * Servir le PDF
 * ---------------------------------------------------------
 */
export const getDocumentFile = async (
  req: Request,
  res: Response
) => {
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
     * Si le document final existe,
     * on affiche le document avec les deux signatures.
     */
    if (
      document.signedFile &&
      fs.existsSync(document.signedFile.path)
    ) {
      return res.sendFile(
        path.resolve(document.signedFile.path)
      );
    }

    /**
     * Si une première signature a déjà été effectuée,
     * on affiche le fichier de travail.
     */
    const workingPath = getWorkingFilePath(
      document.id
    );

    if (fs.existsSync(workingPath)) {
      return res.sendFile(
        path.resolve(workingPath)
      );
    }

    /**
     * Sinon on affiche l'original.
     */
    if (
      !fs.existsSync(document.originalFile.path)
    ) {
      return res.status(404).json({
        message: "Fichier PDF introuvable"
      });
    }

    return res.sendFile(
      path.resolve(document.originalFile.path)
    );
  } catch (error) {
    console.error(
      "Erreur récupération fichier PDF :",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur",
      error
    });
  }
};

/**
 * ---------------------------------------------------------
 * Signer le document
 * ---------------------------------------------------------
 */
export const signDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.params;

    const { signatureImage } = req.body;

    /**
     * Le token permet de retrouver
     * le document ET le signataire.
     */
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
     * Déterminer qui signe
     */
    let signerRole: "president" | "member";

    if (
      document.signers.president.signatureToken === token
    ) {
      signerRole = "president";
    } else {
      signerRole = "member";
    }

    const signer =
      document.signers[signerRole];

    /**
     * Vérifier si cette personne a déjà signé
     */
    if (signer.tokenUsed || signer.signed) {
      return res.status(403).json({
        message: "Vous avez déjà signé ce document"
      });
    }

    /**
     * Vérifier la signature
     */
    if (!signatureImage) {
      return res.status(400).json({
        message: "Signature obligatoire"
      });
    }

    /**
     * La position vient maintenant
     * directement de la base de données.
     */
    const {
      page: pageNumber,
      x,
      y,
      width,
      height,
      pdfWidth,
      pdfHeight
    } = signer.position;

    /**
     * Trouver le fichier à modifier.
     *
     * Si quelqu'un a déjà signé :
     *     working/documentId.pdf
     *
     * Sinon :
     *     originalFile
     */
    const workingPath = getWorkingFilePath(document.id);
    let sourcePath = document.originalFile.path;

    if (fs.existsSync(workingPath)) {
      sourcePath = workingPath;
    }

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        message: "Fichier PDF introuvable"
      });
    }
    const pdfBytes = fs.readFileSync(sourcePath);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    /**
     * Vérifier la page
     */
    const pageIndex = Number(pageNumber) - 1;

    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      return res.status(400).json({ message: "Numéro de page invalide" });
    }

    const page = pdfDoc.getPage(pageIndex);

    const { width: realPdfWidth, height: realPdfHeight } = page.getSize();
    const signatureBase64 = signatureImage.replace(/^data:image\/png;base64,/, "");
    const signatureBytes = Buffer.from(signatureBase64, "base64");
    const signature = await pdfDoc.embedPng(signatureBytes);

    let pdfX = Number(x);
    let pdfY = Number(y);

    let pdfSignatureWidth = Number(width);
    let pdfSignatureHeight = Number(height);

    if (pdfWidth && pdfHeight) {
      const scaleX = realPdfWidth / Number(pdfWidth);

      const scaleY = realPdfHeight / Number(pdfHeight);

      pdfX = Number(x) * scaleX;
      pdfSignatureWidth = Number(width) * scaleX;
      pdfSignatureHeight = Number(height) * scaleY;

      pdfY = realPdfHeight - Number(y) * scaleY - pdfSignatureHeight;
    } else {
      pdfY = realPdfHeight - Number(y) - pdfSignatureHeight;
    }

    page.drawImage(signature, {
      x: pdfX,
      y: pdfY,
      width: pdfSignatureWidth,
      height: pdfSignatureHeight
    });

    const newPdfBytes = await pdfDoc.save();
    signer.tokenUsed = true;
    signer.signed = true;
    signer.signedAt = new Date();

    const bothSigned = document.signers.president.signed && document.signers.member.signed;

    if (bothSigned) {
      const signedFolder = path.join("src", "uploads", "signed");

      if (!fs.existsSync(signedFolder)) {
        fs.mkdirSync(signedFolder, { recursive: true });
      }

      const signedFileName = `signed-${document.originalFile.name}`;
      const signedPath = path.join(signedFolder, signedFileName);
      fs.writeFileSync(signedPath, newPdfBytes);

      document.signedFile = {
        name: signedFileName,
        path: signedPath,
        size: newPdfBytes.length,
        type: "application/pdf"
      };

      document.status = "Signé";
      document.signedAt = new Date();

      if (fs.existsSync(workingPath)) {
        fs.unlinkSync(workingPath);
      }

      await document.save();

      return res.status(200).json({
        message:
          "Document signé par le Président et le Membre",
        status: "Signé",
        document
      });
    }

    const workingFolder = path.join("src", "uploads", "working");

    if (!fs.existsSync(workingFolder)) {
      fs.mkdirSync(workingFolder, { recursive: true });
    }

    fs.writeFileSync(workingPath, newPdfBytes);
    document.status = "En cours";

    await document.save();

    return res.status(200).json({
      message: `${signer.role === "president" ? "Président" : "Membre"} a signé le document`,
      status: "En cours",
      document
    });
  } catch (error) {
    console.error("Erreur signature PDF :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
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