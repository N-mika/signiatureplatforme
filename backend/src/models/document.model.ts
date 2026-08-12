import mongoose, { Document } from "mongoose";

interface PdfFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

interface Signer {
  role: "president" | "member";
  email: string;

  signatureToken: string;
  tokenUsed: boolean;

  position: SignaturePosition;

  signed: boolean;
  signedAt?: Date | null;
}

export interface IDocument extends Document {
  title: string;

  originalFile: PdfFile;
  signedFile?: PdfFile;

  signers: {
    president: Signer;
    member: Signer;
  };

  status: "En attente" | "En cours" | "Signé";

  signedAt?: Date | null;
}

const signaturePositionSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false
  }
);

const pdfFileSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false
  }
);

const signerSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false
  }
);

const documentSchema = new mongoose.Schema<IDocument>(
  {
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
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDocument>(
  "Document",
  documentSchema
);