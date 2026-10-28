import { Request, Response } from "express";
import { randomUUID } from "crypto";
import UserShema from "../models/user";
import { sendInvitation } from "../services/email.service";
import { generateSignatureToken } from "../services/token.service";
import bcrypt from 'bcrypt'

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Le nom et l'email sont obligatoires"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Un seul compte par adresse email.
    const existingUser = await UserShema.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé par un autre administrateur."
      });
    }

    const invitationToken = generateSignatureToken();

    const user = await UserShema.create({
      id: randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      password: null,
      isActif: false,
      invitationToken
    });

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const invitationLink = `${frontendUrl}/create-password/${invitationToken}`;

    // L'échec d'envoi de l'email ne doit pas annuler la création du compte :
    // l'administrateur peut copier le lien d'invitation depuis l'interface.
    let emailSent = true;

    try {
      await sendInvitation(normalizedEmail, invitationLink, user.name);
    } catch (emailError) {
      emailSent = false;
      console.error("Erreur envoi invitation :", emailError);
    }

    return res.status(201).json({
      message: emailSent
        ? "Administrateur créé et invitation envoyée"
        : "Administrateur créé, mais l'email d'invitation n'a pas pu être envoyé.",
      emailSent,
      invitationLink,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActif: user.isActif
      }
    });
  } catch (error) {
    console.error("Erreur création utilisateur :", error);

    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserShema.findOne({ id });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    if (user.id === "admin") {
      return res.status(400).json({
        message: "Le compte administrateur principal ne peut pas être supprimé.",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message: "Utilisateur supprimé.",
    });
  } catch (error) {
    console.error("Erreur suppression utilisateur :", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({
        message: "Token requis",
      });
    }

    const user = await UserShema.findOne({
      invitationToken: token,
    });


    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    return res.status(200).json({
      id : user.id,
      isActif : user.isActif,
      email : user.email,
      name : user.name,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await UserShema
      .find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
export const activateUser = async (req: Request, res: Response) => {
  const { password, id } = req.body;
  console.log(password, id);
  try {
    if (!id) {
      return res.status(400).json({
        message: "L'identifiant de l'utilisateur est requis.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Le mot de passe est requis.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const user = await UserShema.findOne({ id: id });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    if (user.isActif) {
      return res.status(400).json({
        message: "Ce compte est déjà actif.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.isActif = true;
    // Le lien d'invitation ne doit plus fonctionner après activation.
    user.invitationToken = null;

    await user.save();

    return res.status(200).json({
      message: "Compte activé avec succès.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActif: user.isActif,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'activation du compte :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'activation du compte.",
    });
  }
};