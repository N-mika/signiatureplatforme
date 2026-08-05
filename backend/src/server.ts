import dotenv from "dotenv";

dotenv.config();
import app from "./app";
import { connectDatabase } from "./config/database";

connectDatabase();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur ${PORT}`);
  }
);