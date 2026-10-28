import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";


export const auth = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Identifiants invalides" });

    // Compte invité dont le mot de passe n'a pas encore été défini.
    if (!user.password)
      return res.status(401).json({ message: "Compte non activé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    return res.json({
      id: user.id,
      email: user.email,
      name : user.name
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
