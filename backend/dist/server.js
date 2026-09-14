"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const initUser_1 = require("./config/initUser");
const email_service_1 = require("./services/email.service");
// import { verifyMailer } from "./services/email.service";
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, initUser_1.initUser)();
        await (0, email_service_1.verifyEmailConnection)();
        app_1.default.listen(PORT, () => {
            console.log(`Serveur lancé sur ${PORT}`);
        });
    }
    catch (error) {
        console.error("Erreur lors du démarrage du serveur :", error);
        process.exit(1);
    }
};
startServer();
