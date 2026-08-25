import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Document from "../models/document.model";

export const downloadSignedDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    console.log("📥 ID document :", id);

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable",
      });
    }

    if (!document.signedFile) {
      return res.status(404).json({
        message: "Le document n'est pas encore signé",
      });
    }

    const filePath = path.resolve(document.signedFile.path);

    console.log("📁 Fichier signé :", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Le fichier signé est introuvable",
      });
    }

    return res.download(
      filePath,
      document.signedFile.name
    );

  } catch (error) {
    console.error("❌ Erreur downloadSignedDocument :", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};