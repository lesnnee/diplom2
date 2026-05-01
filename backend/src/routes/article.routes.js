import express from "express";
import { getArticles } from "../controllers/article.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/knowledge", authenticate, getArticles);

export default router;