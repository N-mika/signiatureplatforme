import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/", documentRoutes);

export default app;