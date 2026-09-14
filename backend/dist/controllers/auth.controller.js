"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Identifiants invalides" });
        if (user.password) {
            const match = await bcryptjs_1.default.compare(password, user.password);
            if (!match)
                return res.status(401).json({ message: "Mot de passe incorrect" });
            res.json({
                id: user.id,
                email: user.email,
                name: user.name
            });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.auth = auth;
