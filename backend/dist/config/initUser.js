"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const initUser = async () => {
    const password = '0000';
    const existUser = await user_1.default.findOne({ id: 'admin' });
    if (!existUser) {
        const user = await user_1.default.create({
            id: "admin",
            email: "michaelnadrasana@gmail.com",
            password: await bcrypt_1.default.hash(password, 10),
            name: "Mika Tikeo",
            isActif: true
        });
        console.log('Utilisateur initier', user);
    }
};
exports.initUser = initUser;
