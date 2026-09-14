"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const signaturePositionSchema = new mongoose_1.default.Schema({
    page: {
        type: Number,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    pdfWidth: {
        type: Number,
        required: true
    },
    pdfHeight: {
        type: Number,
        required: true
    }
}, {
    _id: false
});
const pdfFileSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {
    _id: false
});
const signerSchema = new mongoose_1.default.Schema({
    role: {
        type: String,
        enum: ["president", "member"],
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    signatureToken: {
        type: String,
        required: true
    },
    tokenUsed: {
        type: Boolean,
        default: false
    },
    position: {
        type: signaturePositionSchema,
        required: true
    },
    signed: {
        type: Boolean,
        default: false
    },
    signedAt: {
        type: Date,
        default: null
    }
}, {
    _id: false
});
const documentSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    originalFile: {
        type: pdfFileSchema,
        required: true
    },
    signedFile: {
        type: pdfFileSchema,
        default: null
    },
    signers: {
        president: {
            type: signerSchema,
            required: true
        },
        member: {
            type: signerSchema,
            required: true
        }
    },
    status: {
        type: String,
        enum: ["En attente", "En cours", "Signé"],
        default: "En attente"
    },
    signedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("Document", documentSchema);
