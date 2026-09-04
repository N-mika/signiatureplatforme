import { Request, Response } from "express";
import Document from "../models/document.model";
import { supabase } from "../supabase";

export const downloadSignedDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable"
      });
    }

    if (!document.signedFile?.path) {
      return res.status(404).json({ message: "Le document n'est pas encore signé" });
    }

    const filePath = document.signedFile.path;

    const { data, error } = await supabase.storage.from("aesnasignature").download(filePath);

    if (error || !data) {
      console.error("Erreur Supabase :", error);

      return res.status(404).json({ message: "Fichier signé introuvable" });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader("Content-Type", document.signedFile.type || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.signedFile.name}"`
    );
    res.setHeader("Content-Length", buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error("Erreur downloadSignedDocument :", error);

    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};