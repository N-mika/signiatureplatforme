import { Router } from "express";
import { createDocument, getDocumentByToken, getDocumentFile, signDocument } from "../controllers/document.controller";

import { upload } from "../middleware/upload.middleware";
const router = Router();

// Upload d'un document PDF
router.post("/upload", upload.single("pdf"), createDocument);

// Récupérer un document avec son token
router.get("/sign/:token", getDocumentByToken);

// Accès sécurisé au fichier PDF
router.get("/file/:token", getDocumentFile);

// Signer le document
router.post("/sign/:token", signDocument);

export default router;