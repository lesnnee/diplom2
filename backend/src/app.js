import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.routes.js";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import operatorRoutes from "./routes/operator.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import statsRoutes from "./routes/statistics.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config({ path: "../.env" });

connectDB();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* =========================
   STATIC FILES (uploads)
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/logs", logsRoutes);
app.use("/api/admin/statistics", statsRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

export default app;