import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendSignatureEmail = async (
  email: string,
  title: string,
  role: "president" | "member",
  token: string
) => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL n'est pas configuré");
  }

  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER n'est pas configuré");
  }

  if (!process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_PASSWORD n'est pas configuré");
  }

  const signatureUrl = `${frontendUrl}/signdocument/${token}`;

  const roleLabel =
    role === "president"
      ? "Président"
      : "Membre";

  await transporter.sendMail({
    from: `"Signature Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Document à signer - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h2>Document à signer</h2>

        <p>Bonjour,</p>

        <p>
          Vous êtes invité à signer le document :
          <strong>${title}</strong>.
        </p>

        <p>
          Votre rôle :
          <strong>${roleLabel}</strong>
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${signatureUrl}"
            style="
              display: inline-block;
              padding: 14px 24px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Signer le document
          </a>
        </div>

        <p style="color: #666; font-size: 13px;">
          Ce lien est personnel et vous permet d'accéder à votre signature.
        </p>

      </div>
    `
  });
};

transporter.verify()
  .then(() => {
    console.log("✅ Connexion SMTP réussie !");
    console.log("EMAIL_USER :", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASSWORD configuré :",
      !!process.env.EMAIL_PASSWORD
    );
  })
  .catch((error) => {
    console.error("❌ Connexion SMTP échouée :", error);
  });