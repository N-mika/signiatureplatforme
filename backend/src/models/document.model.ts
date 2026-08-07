import mongoose, { Document } from "mongoose";

interface PdfFile {
  name: string;
  path: string;
  size: number;
  type: string;
}
interface SignaturePosition {
  page: number,
  x: number,
  y: number,
  width: number,
  height: number
  pdfWidth: number,
  pdfHeight: number
};

export interface IDocument extends Document {
  title: string;
  recipientEmail: string;
  originalFile: PdfFile;
  signedFile?: PdfFile;
  signatureToken: string;
  signaturePositions: SignaturePosition;
  tokenUsed: boolean;
  status: string;
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
  });

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
const documentSchema = new mongoose.Schema<IDocument>({

  title: {
    type: String,
    required: true
  },

  recipientEmail: {
    type: String,
    required: true
  },

  originalFile: {
    type: pdfFileSchema,
    required: true
  },


  signedFile: {
    type: pdfFileSchema,
  },

  signatureToken: {
    type: String,
    required: true,
    unique: true
  },
  signaturePositions: {
    type: signaturePositionSchema,
    required: true
  },
  tokenUsed: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: "En attente"
  },

  signedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});


export default mongoose.model<IDocument>("Document", documentSchema);