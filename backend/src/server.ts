import dotenv from "dotenv";

dotenv.config();
import app from "./app";
import { connectDatabase } from "./config/database";
import { initUser } from "./config/initUser";

connectDatabase();
initUser();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur ${PORT}`);
  }
);