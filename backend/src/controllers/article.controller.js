import Article from "../models/Article.js";

// ======================
// CREATE ARTICLE
// ======================

export const createArticle = async (req, res) => {

  try {

    const {
      title,
      content,
      category,
      tags,
    } = req.body;

    const article = await Article.create({
      title,
      content,
      category,
      tags,
      createdBy: req.user.id,
    });

    res.status(201).json(article);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

};

// ======================
// GET ARTICLES
// ======================

export const getArticles = async (req, res) => {

  try {

    const articles = await Article.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(articles);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

};

export const getKnowledgeArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};