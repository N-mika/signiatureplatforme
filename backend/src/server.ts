import dotenv from "dotenv";
import app from "./app";
import { connectDatabase } from "./config/database";
import { initUser } from "./config/initUser";
import { verifyEmailConnection } from "./services/email.service";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Sur Vercel, on exporte juste l'app pour que Vercel puisse l'utiliser comme serverless function.
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const startServer = async () => {
    try {
      await connectDatabase();

      await initUser();
      await verifyEmailConnection();

      app.listen(PORT, () => {
        console.log(`Serveur lancé sur ${PORT}`);
      });
    } catch (error) {
      console.error("Erreur lors du démarrage du serveur :", error);
      process.exit(1);
    }
  };

  startServer();
}

export default app;
