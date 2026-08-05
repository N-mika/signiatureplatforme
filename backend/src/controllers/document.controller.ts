import { Request, Response } from "express";
import path from "path";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import Document from "../models/document.model";
import { generateSignatureToken } from "../services/token.service";

// Créer un document et uploader un PDF

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, recipientEmail } = req.body;
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).json({ message: "Le fichier PDF est obligatoire" });
    }
    if (!title || !recipientEmail) {
      return res.status(400).json({
        message: "Titre et email obligatoires"
      });
    }
    const signatureToken = generateSignatureToken();
    const document = await Document.create({
      title, recipientEmail,
      originalFile: {
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype
      },
      signatureToken,
      status: "En attente"
    });
    return res.status(201).json({
      message: "Document créé avec succès",
      document
    });
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
    const { signatureImage } = req.body;

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
    // 1 - Charger le PDF original

    const pdfBytes = fs.readFileSync(document.originalFile.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // 2 - Convertir l'image Base64 en PNG

    const signatureBase64 = signatureImage.replace(/^data:image\/png;base64,/, "");
    const signatureBytes = Buffer.from(signatureBase64, "base64");

    // 3 - Ajouter la signature

    const signature = await pdfDoc.embedPng(signatureBytes);
    const page = pdfDoc.getPage(0);
    page.drawImage(signature, { x: 400, y: 50, width: 120, height: 60 });
    // 4 - Générer le nouveau PDF
    const newPdfBytes = await pdfDoc.save();
    // 5 - Créer le dossier signed
    const signedFolder = path.join("src/uploads", "signed");
    if (!fs.existsSync(signedFolder)) {
      fs.mkdirSync(signedFolder, { recursive: true });
    }
    const signedPath = path.join(signedFolder, `signed-${document.originalFile.name}`);
    // 6 - Enregistrer le PDF signé
    fs.writeFileSync(signedPath, newPdfBytes);
    // 7 - Mise à jour MongoDB
    document.signedFile = {
      name: `signed-${document.originalFile.name}`,
      path: signedPath,
      size: newPdfBytes.length,
      type: "application/pdf"
    };
    document.status = "Signé";
    document.tokenUsed = true;
    document.signedAt = new Date();

    await document.save();
    return res.json({ message: "Document signé avec succès", document });
  } catch (error) {
    console.log("Erreur signature PDF :", error)
    return res.status(500).json({ message: "Erreur serveur", error });
  }

};