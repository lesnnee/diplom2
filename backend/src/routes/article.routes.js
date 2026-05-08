import express from "express";

import {
    createArticle,
    getArticles,
    getKnowledgeArticles,
} from "../controllers/article.controller.js";

import { authenticate } from "../middleware/authMiddleware.js";

import Article from "../models/Article.js";

const router = express.Router();

// ======================
// GET ALL ARTICLES
// ======================

router.get("/", authenticate, getArticles);

router.get("/knowledge", authenticate, getKnowledgeArticles);

// ======================
// CREATE ARTICLE
// ======================

router.post("/", authenticate, createArticle);

// ======================
// GET ONE ARTICLE
// ======================

router.get("/:id", authenticate, async (req, res) => {

  try {

    const article = await Article.findById(req.params.id)
      .populate("createdBy", "name");

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    // views +1
    article.views += 1;

    await article.save();

    res.json(article);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

export default router;