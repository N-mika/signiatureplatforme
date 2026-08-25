import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization" , "Access-Control-Allow-Origin"],
}));
app.use(express.json());

app.use("/", documentRoutes);

export default app;