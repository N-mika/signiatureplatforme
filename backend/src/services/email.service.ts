import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error(
    "EMAIL_USER ou EMAIL_PASSWORD n'est pas configuré"
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: emailUser,
    pass: emailPassword
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const info = await transporter.sendMail({
    from: `Signature Carte membre AESNA <${emailUser}>`,
    to,
    subject,
    html
  });

  console.log("✅ Email envoyé avec succès :", info.messageId);

  return info;
};

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

  const signatureUrl = `${frontendUrl}/signdocument/${token}`;

  const roleLabel =
    role === "president" ? "Président" : "Membre";

  await sendEmail(
    email,
    `Document à signer - ${title}`,
    `
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
  );
};

export const sendInvitation = async (
  email: string,
  invitationLink: string,
  name: string
) => {
  await sendEmail(
    email,
    "Invitation - Signature Carte membre AESNA",
    `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Bienvenue ${name} 👋</h2>

        <p>
          Vous avez été invité à rejoindre la plateforme
          <strong>Signature Carte membre AESNA</strong>
          en tant qu'administrateur.
        </p>

        <p>
          Cliquez sur le bouton ci-dessous pour créer votre mot de passe.
        </p>

        <a
          href="${invitationLink}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #059669;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Créer mon mot de passe
        </a>

        <p style="margin-top: 20px; color: #777;">
          Si vous n'avez pas été invité, vous pouvez ignorer cet email.
        </p>
      </div>
    `
  );
};
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();

    console.log("✅ Connexion Gmail SMTP réussie");
  } catch (error) {
    console.error("❌ Connexion Gmail SMTP échouée :", error);
  }
}