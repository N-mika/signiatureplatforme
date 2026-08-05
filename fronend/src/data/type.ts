export type User = {
  id : string
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
  tokenUsed: boolean;
  status: DocumentStatus;
  createdAt: string;
  signedAt?: string | null;
}