import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config({ path: "../.env" });
connectDB();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

export default app;
