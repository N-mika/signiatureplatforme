"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateUser = exports.getAllUser = exports.getUserById = exports.createUser = void 0;
const crypto_1 = require("crypto");
const user_1 = __importDefault(require("../models/user"));
const email_service_1 = require("../services/email.service");
const token_service_1 = require("../services/token.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        console.log(name, email);
        if (!name || !email) {
            return res.status(400).json({
                message: "Le nom et l'email sont obligatoires"
            });
        }
        const existingUser = await user_1.default.findOne({ email });
        // if (existingUser) {
        //   return res.status(400).json({
        //     message: "Cet email est déjà utilisé"
        //   });
        // }
        const invitationToken = (0, token_service_1.generateSignatureToken)();
        const user = await user_1.default.create({
            id: (0, crypto_1.randomUUID)(),
            name,
            email,
            password: null,
            isActif: false,
            invitationToken
        });
        const invitationLink = `${process.env.FRONTEND_URL}/admin/${invitationToken}`;
        await (0, email_service_1.sendInvitation)(email, invitationLink, name);
        return res.status(201).json({
            message: "Administrateur créé et invitation envoyée",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActif: user.isActif
            }
        });
    }
    catch (error) {
        console.error("Erreur création utilisateur :", error);
        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
exports.createUser = createUser;
const getUserById = async (req, res) => {
    const { token } = req.params;
    try {
        if (!token) {
            return res.status(400).json({
                message: "Token requis",
            });
        }
        const user = await user_1.default.findOne({
            invitationToken: token,
        });
        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable",
            });
        }
        return res.status(200).json({
            id: user.id,
            isActif: user.isActif,
            email: user.email,
            name: user.name,
        });
    }
    catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        return res.status(500).json({
            message: "Erreur serveur",
        });
    }
};
exports.getUserById = getUserById;
const getAllUser = async (req, res) => {
    try {
        const users = await user_1.default
            .find()
            .select("-password");
        return res.status(200).json(users);
    }
    catch (error) {
        console.error("Erreur récupération utilisateurs :", error);
        return res.status(500).json({
            message: "Erreur serveur",
        });
    }
};
exports.getAllUser = getAllUser;
const activateUser = async (req, res) => {
    const { password, id } = req.body;
    console.log(password, id);
    try {
        if (!id) {
            return res.status(400).json({
                message: "L'identifiant de l'utilisateur est requis.",
            });
        }
        if (!password) {
            return res.status(400).json({
                message: "Le mot de passe est requis.",
            });
        }
        const user = await user_1.default.findOne({ id: id });
        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable.",
            });
        }
        if (user.isActif) {
            return res.status(400).json({
                message: "Ce compte est déjà actif.",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        user.password = hashedPassword;
        user.isActif = true;
        await user.save();
        return res.status(200).json({
            message: "Compte activé avec succès.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActif: user.isActif,
            },
        });
    }
    catch (error) {
        console.error("Erreur lors de l'activation du compte :", error);
        return res.status(500).json({
            message: "Erreur serveur lors de l'activation du compte.",
        });
    }
};
exports.activateUser = activateUser;
