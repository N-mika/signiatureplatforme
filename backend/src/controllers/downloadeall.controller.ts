import { Request, Response } from "express";
import fs from "fs";
import path from "path";
// import archiver from "archiver";
import archiver = require("archiver");
import Document from "../models/document.model";

export const downloadAllSignedDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const documents = await Document.find({
      signedFile: { $exists: true, $ne: null },
    });

    if (documents.length === 0) {
      return res.status(404).json({
        message: "Aucun document signé trouvé",
      });
    }

    // Préparer la réponse HTTP
    res.setHeader(
      "Content-Type",
      "application/zip"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="documents-signes.zip"'
    );

    // Création de l'archive
    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    // Gestion des erreurs
    archive.on("error", (error) => {
      console.error(
        "❌ Erreur création ZIP :",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          message: "Erreur lors de la création du ZIP",
        });
      } else {
        res.end();
      }
    });

    // Envoyer directement le ZIP vers le navigateur
    archive.pipe(res);

    // Ajouter les fichiers signés
    for (const document of documents) {
      if (!document.signedFile?.path) {
        continue;
      }

      const filePath = path.resolve(
        document.signedFile.path
      );

      if (!fs.existsSync(filePath)) {
        console.warn(
          `⚠️ Fichier introuvable : ${filePath}`
        );

        continue;
      }

      archive.file(filePath, {
        name: document.signedFile.name,
      });
    }

    // Finaliser le ZIP
    await archive.finalize();

  } catch (error) {
    console.error(
      "❌ Erreur downloadAllSignedDocuments :",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Erreur serveur",
      });
    }
  }
};