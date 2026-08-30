import dotenv from "dotenv";
import app from "./app";
import { connectDatabase } from "./config/database";
import { initUser } from "./config/initUser";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    await initUser();

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur :", error);
    process.exit(1);
  }
};

startServer();