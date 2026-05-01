import Article from "../models/Article.js";

export const getArticles = async (req, res) => {
  try {
    const user = req.user;

    const roleCategoryMap = {
      network_admin: "network",
      it_support: "software",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    const category = roleCategoryMap[user.role];

    const articles = await Article.find({
      category: category,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};