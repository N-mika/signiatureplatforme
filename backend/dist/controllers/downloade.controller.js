"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadSignedDocument = void 0;
const document_model_1 = __importDefault(require("../models/document.model"));
const supabase_1 = require("../supabase");
const downloadSignedDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await document_model_1.default.findById(id);
        if (!document) {
            return res.status(404).json({
                message: "Document introuvable"
            });
        }
        if (!document.signedFile?.path) {
            return res.status(404).json({ message: "Le document n'est pas encore signé" });
        }
        const filePath = document.signedFile.path;
        const { data, error } = await supabase_1.supabase.storage.from("aesnasignature").download(filePath);
        if (error || !data) {
            console.error("Erreur Supabase :", error);
            return res.status(404).json({ message: "Fichier signé introuvable" });
        }
        const buffer = Buffer.from(await data.arrayBuffer());
        res.setHeader("Content-Type", document.signedFile.type || "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${document.signedFile.name}"`);
        res.setHeader("Content-Length", buffer.length);
        return res.send(buffer);
    }
    catch (error) {
        console.error("Erreur downloadSignedDocument :", error);
        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
exports.downloadSignedDocument = downloadSignedDocument;
