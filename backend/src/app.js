import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";

dotenv.config({ path: "../.env" });

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* =========================
   FIX PATH HERE (IMPORTANT)
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ========================= */

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

export default app;