import { Request, Response } from "express";
import { randomUUID } from "crypto";
import UserShema from "../models/user";
import { sendInvitation } from "../services/email.service";
import { generateSignatureToken } from "../services/token.service";
import bcrypt from 'bcrypt'

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    console.log(name, email)

    if (!name || !email) {
      return res.status(400).json({
        message: "Le nom et l'email sont obligatoires"
      });
    }

    const existingUser = await UserShema.findOne({ email });

    // if (existingUser) {
    //   return res.status(400).json({
    //     message: "Cet email est déjà utilisé"
    //   });
    // }

    const invitationToken = generateSignatureToken();

    const user = await UserShema.create({
      id: randomUUID(),
      name,
      email,
      password: null,
      isActif: false,
      invitationToken
    });

    const invitationLink = `${process.env.FRONTEND_URL}/admin/${invitationToken}`;
    await sendInvitation(email, invitationLink, name);

    return res.status(201).json({
      message: "Administrateur créé et invitation envoyée",
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
      .select("-password");

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