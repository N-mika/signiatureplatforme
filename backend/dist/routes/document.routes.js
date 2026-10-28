"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const downloade_controller_1 = require("../controllers/downloade.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const signedocument_controller_1 = require("../controllers/signedocument.controller");
const router = (0, express_1.Router)();
// Upload d'un document PDF
router.post("/createdocument", document_controller_1.createDocument);
// Récupérer un document avec son token
router.get("/sign/:token", document_controller_1.getDocumentByToken);
// écupérer tous les documents
router.get("/alldocument", document_controller_1.getAllDocument);
// Accès sécurisé au fichier PDF
router.get("/file/:token", document_controller_1.getDocumentFile);
// Signer le document
router.post("/sign/:token", signedocument_controller_1.signDocument);
// Telechargee un ducument 
router.get("/file/signed/:id", downloade_controller_1.downloadSignedDocument);
// Prend l'information du document 
router.get("/document/:id", document_controller_1.getDocumentById);
// authantification utilisateur 
router.post("/auth", auth_controller_1.auth);
// Creer utilisateur
router.post("/invitadmin", user_controller_1.createUser);
// prend utilisaateur 
router.get("/getuser/:token", user_controller_1.getUserById);
// Activer un compte 
router.put("/activateuser", user_controller_1.activateUser);
router.get("/getalluser", user_controller_1.getAllUser);
router.delete("/user/:id", user_controller_1.deleteUser);
exports.default = router;
