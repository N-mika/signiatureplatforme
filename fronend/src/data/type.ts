export interface SignaturePosition {
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  pdfWidth: number,
  pdfHeight: number
};

export type User = {
  id: string
  email: string;
  password: string;
}

export type DocumentStatus = "En attente" | "Signé" | "Expiré";

export interface PdfFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface Document {
  id: string;
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
