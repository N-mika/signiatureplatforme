import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();

// Origines autorisées : le frontend déployé + les origines de développement local.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://signature-aesna.vercel.app",
  "https://aesnasignaturecartemembre.vercel.app",
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/", documentRoutes);

export default app;