"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signDocument = void 0;
const document_model_1 = __importDefault(require("../models/document.model"));
const supabase_1 = require("../supabase");
const pdf_lib_1 = require("pdf-lib");
const signDocument = async (req, res) => {
    try {
        const { token } = req.params;
        const { signatureImage } = req.body;
        const document = await document_model_1.default.findOne({
            $or: [
                { "signers.president.signatureToken": token },
                { "signers.member.signatureToken": token }
            ]
        });
        if (!document) {
            return res.status(404).json({ message: "Document introuvable" });
        }
        let signerRole;
        if (document.signers.president.signatureToken === token) {
            signerRole = "president";
        }
        else {
            signerRole = "member";
        }
        const signer = document.signers[signerRole];
        if (signer.tokenUsed || signer.signed) {
            return res.status(403).json({ message: "Vous avez déjà signé ce document" });
        }
        if (!signatureImage) {
            return res.status(400).json({ message: "Signature obligatoire" });
        }
        const { page: pageNumber, x, y, width, height, pdfWidth, pdfHeight } = signer.position;
        const workingPath = `working/${document.originalFile.path.split("/").pop()}`;
        const bothSigned = document.signers.president.signed && document.signers.member.signed;
        const sourcePath = bothSigned ? workingPath : document.signers.president.signed || document.signers.member.signed
            ? workingPath
            : document.originalFile.path;
        console.log(" PDF source :", sourcePath);
        const { data: pdfFile, error: downloadError } = await supabase_1.supabase.storage.from("aesnasignature").download(sourcePath);
        if (downloadError || !pdfFile) {
            console.error(" Erreur téléchargement PDF :", downloadError);
            return res.status(404).json({ message: "Fichier PDF introuvable dans Supabase" });
        }
        const pdfBytes = Buffer.from(await pdfFile.arrayBuffer());
        const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const pageIndex = Number(pageNumber) - 1;
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
            return res.status(400).json({
                message: "Numéro de page invalide"
            });
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
        }
        else {
            pdfY = realPdfHeight - Number(y) - pdfSignatureHeight;
        }
        page.drawImage(signature, { x: pdfX, y: pdfY, width: pdfSignatureWidth, height: pdfSignatureHeight });
        const newPdfBytes = await pdfDoc.save();
        signer.tokenUsed = true;
        signer.signed = true;
        signer.signedAt = new Date();
        const isBothSigned = document.signers.president.signed && document.signers.member.signed;
        if (isBothSigned) {
            const signedPath = `signed/${document.id}-signed.pdf`;
            console.log(" Upload PDF signé :", signedPath);
            const { error: uploadError } = await supabase_1.supabase.storage.from("aesnasignature").upload(signedPath, newPdfBytes, { contentType: "application/pdf", upsert: true });
            if (uploadError) {
                console.error(" Erreur upload PDF signé :", uploadError);
                return res.status(500).json({ message: "Erreur lors de l'enregistrement du PDF signé" });
            }
            document.signedFile = {
                name: `signed-${document.originalFile.name}`,
                path: signedPath,
                size: newPdfBytes.length,
                type: "application/pdf"
            };
            document.status = "Signé";
            document.signedAt = new Date();
            await document.save();
            const { error: deleteError } = await supabase_1.supabase.storage.from("aesnasignature").remove([workingPath]);
            if (deleteError) {
                console.warn("Impossible de supprimer le fichier working :", deleteError.message);
            }
            return res.status(200).json({ message: "Document signé par le Président et le Membre", status: "Signé", document });
        }
        console.log("Upload PDF intermédiaire :", workingPath);
        const { error: uploadWorkingError } = await supabase_1.supabase.storage.from("aesnasignature").upload(workingPath, newPdfBytes, { contentType: "application/pdf", upsert: true });
        if (uploadWorkingError) {
            console.error(" Erreur upload PDF intermédiaire :", uploadWorkingError);
            return res.status(500).json({ message: "Erreur lors de l'enregistrement du PDF" });
        }
        document.status = "En cours";
        await document.save();
        return res.status(200).json({
            message: `${signer.role === "president" ? "Président" : "Membre"} a signé le document`,
            status: "En cours",
            document
        });
    }
    catch (error) {
        console.error(" Erreur signature PDF :", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};
exports.signDocument = signDocument;
