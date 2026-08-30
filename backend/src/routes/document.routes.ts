import { Router } from "express";
import { createDocument, getAllDocument, getDocumentById, getDocumentByToken, getDocumentFile, signDocument } from "../controllers/document.controller";

import { upload } from "../middleware/upload.middleware";
import { downloadSignedDocument } from "../controllers/downloade.controller";
import { auth } from "../controllers/auth.controller";
import { activateUser, createUser, getAllUser, getUserById } from "../controllers/user.controller";
const router = Router();

// Upload d'un document PDF
router.post("/upload", upload.single("pdf"), createDocument);

// Récupérer un document avec son token
router.get("/sign/:token", getDocumentByToken);

// écupérer tous les documents
router.get("/alldocument", getAllDocument);

// Accès sécurisé au fichier PDF
router.get("/file/:token", getDocumentFile);

// Signer le document
router.post("/sign/:token", signDocument);

// Telechargee un ducument 
router.get("/file/signed/:id", downloadSignedDocument);

// Prend l'information du document 
router.get("/document/:id", getDocumentById);

// authantification utilisateur 
router.post("/auth", auth);
// Creer utilisateur
router.post("/invitadmin", createUser);
// prend utilisaateur 
router.get("/getuser/:token", getUserById);
// Activer un compte 
router.put("/activateuser",  activateUser);
router.get("/getalluser", getAllUser);
export default router;