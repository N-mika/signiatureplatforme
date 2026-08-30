export type User = {
  id: string
  email: string;
  password?: string;
  name : string;
}
export type UserConnected = {
  user : User,
  isConnected : boolean
} 
export interface DocumentSigner {
  role: SignerRole;
  email: string;
  signed: boolean;
  signedAt: string | null;
}
export type SignerRole = "president" | "member";

export type DocumentStatus = "En attente" | "En cours" | "Signé";

export interface PdfFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

export interface Signer {
  role: SignerRole;
  email: string;

  signatureToken: string;
  tokenUsed: boolean;

  position: SignaturePosition;

  signed: boolean;
  signedAt: string | null;
}

export interface Signers {
  president: Signer;
  member: Signer;
}

export interface Document {
  _id: string;
  title: string;
  originalFile: PdfFile;
  signedFile?: PdfFile | null;
  signers: Signers;
  status: DocumentStatus;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  token : string;
}

export interface SignDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  signer: DocumentSigner;
  originalFile: PdfFile;
  signedFile?: PdfFile | null;
}