import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI as string
    );

    console.log("MongoDB connecté");

  } catch (error) {
    console.error("Erreur MongoDB", error);
    process.exit(1);
  }
};