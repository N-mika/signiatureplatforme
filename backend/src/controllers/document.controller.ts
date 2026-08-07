import { Request, Response } from "express";
import path from "path";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import Document from "../models/document.model";
import { generateSignatureToken } from "../services/token.service";

// Créer un document et uploader un PDF

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, recipientEmail, signaturePositions } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Le fichier PDF est obligatoire" });
    }
    if (!title || !recipientEmail || !signaturePositions) {
      return res.status(400).json({ message: "Titre, email et positions de signature obligatoires" });
    }
    const signatureToken = generateSignatureToken();
    const document = await Document.create({
      title,
      recipientEmail,
      originalFile: {
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype
      },
      signatureToken,
      signaturePositions: JSON.parse(signaturePositions),
      status: "En attente"
    });
    return res.status(201).json({ message: "Document créé avec succès", document });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error
    });
  }
};

// Récupérer un document avec le token

export const getDocumentByToken = async (req: Request, res: Response) => {
  try {

    const { token } = req.params;

    const document = await Document.findOne({
      signatureToken: token
    });

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable"
      });
    }

    return res.json(document);

  } catch (error) {

    return res.status(500).json({
      message: "Erreur serveur",
      error
    });

  }
};

// Servir le PDF de manière sécurisée
export const getDocumentFile = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const document = await Document.findOne({ signatureToken: token });
    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }
    if (document.tokenUsed && document.signedFile) {
      console.log(document.signedFile);
      console.log(path.resolve(document.signedFile.path));
      return res.sendFile(path.resolve(document.signedFile.path));
    }
    return res.sendFile(path.resolve(document.originalFile.path));
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};
// Signer le document (version préparation)


export const signDocument = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    let { signatureImage, signaturePositions } = req.body;

    const document = await Document.findOne({ signatureToken: token });

    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    if (document.tokenUsed) {
      return res.status(403).json({ message: "Document déjà signé" });
    }

    if (!signatureImage) {
      return res.status(400).json({ message: "Signature obligatoire" });
    }

    if (!signaturePositions) {
      return res.status(400).json({
        message: "Position de signature obligatoire"
      });
    }

    if (typeof signaturePositions === "string") {
      try {
        signaturePositions = JSON.parse(signaturePositions);
      } catch (error) {
        return res.status(400).json({ message: "Position de signature invalide" });
      }
    }

    const { page: pageNumber, x, y, width, height, pdfWidth, pdfHeight } = signaturePositions;

    if (pageNumber === undefined || x === undefined || y === undefined || width === undefined || height === undefined) {
      return res.status(400).json({ message: "Données de position incomplètes" });
    }

    if (!fs.existsSync(document.originalFile.path)) {
      return res.status(404).json({ message: "Fichier PDF original introuvable" });
    }

    const pdfBytes = fs.readFileSync(document.originalFile.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pageIndex = Number(pageNumber) - 1;

    if (
      pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()
    ) {
      return res.status(400).json({ message: "Numéro de page invalide" });
    }

    const page = pdfDoc.getPage(pageIndex);

    const signatureBase64 = signatureImage.replace(/^data:image\/png;base64,/, "");
    const signatureBytes = Buffer.from(signatureBase64, "base64");
    const signature = await pdfDoc.embedPng(signatureBytes);

    const { width: realPdfWidth, height: realPdfHeight } = page.getSize();

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

      pdfY = realPdfHeight - (Number(y) * scaleY) - pdfSignatureHeight;
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
    document.tokenUsed = true;
    document.signedAt = new Date();

    await document.save();
    return res.status(200).json({ message: "Document signé avec succès", document });

  } catch (error) {
    console.error("Erreur signature PDF :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};