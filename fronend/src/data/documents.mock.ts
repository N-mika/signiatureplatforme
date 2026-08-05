import type { Document } from "./type";

export const documentsMock: Document[] = [

  {
    id: "1",
    title: "Contrat de travail Jean Rakoto",
    recipientEmail: "jean.rakoto@email.com",

    originalFile: {
      name: "contrat-jean-rakoto.pdf",
      path: "uploads/originals/contrat-jean-rakoto.pdf",
      size: 245678,
      type: "application/pdf"
    },

    signatureToken: "token-jean-001",

    tokenUsed: true,

    status: "Signé",

    createdAt: "2026-08-01",

    signedAt: "2026-08-02",

    signedFile: {
      name: "contrat-jean-rakoto-signe.pdf",
      path: "uploads/signed/contrat-jean-rakoto-signe.pdf",
      size: 260456,
      type: "application/pdf"
    }
  },


  {
    id: "2",
    title: "Convention de prestation",
    recipientEmail: "client1@gmail.com",

    originalFile: {
      name: "convention-prestation.pdf",
      path: "uploads/originals/convention-prestation.pdf",
      size: 189432,
      type: "application/pdf"
    },

    signatureToken: "token-client-002",

    tokenUsed: false,

    status: "En attente",

    createdAt: "2026-08-02",

    signedAt: null
  },


  {
    id: "3",
    title: "Devis commercial",
    recipientEmail: "entreprise@test.com",

    originalFile: {
      name: "devis-commercial.pdf",
      path: "uploads/originals/devis-commercial.pdf",
      size: 324567,
      type: "application/pdf"
    },

    signatureToken: "token-devis-003",

    tokenUsed: true,

    status: "Signé",

    createdAt: "2026-07-28",

    signedAt: "2026-07-30",

    signedFile: {
      name: "devis-commercial-signe.pdf",
      path: "uploads/signed/devis-commercial-signe.pdf",
      size: 341245,
      type: "application/pdf"
    }
  },


  {
    id: "4",
    title: "Accord de confidentialité",
    recipientEmail: "contact@societe.com",

    originalFile: {
      name: "accord-confidentialite.pdf",
      path: "uploads/originals/accord-confidentialite.pdf",
      size: 156789,
      type: "application/pdf"
    },

    signatureToken: "token-accord-004",

    tokenUsed: false,

    status: "Expiré",

    createdAt: "2026-07-15",

    signedAt: null
  }

];