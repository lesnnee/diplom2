import express from "express";

const router = express.Router();

// 📊 GET ALL SETTINGS
router.get("/", async (req, res) => {
  res.json({
    roles: ["user", "operator", "admin"],
    categories: ["network", "software", "hardware", "security"],
    priorities: ["low", "medium", "high", "critical"],
  });
});


// ➕ ROLES
router.post("/roles", async (req, res) => {
  const { role } = req.body;
  // add to DB or config
  res.json({ message: "Role added", role });
});

router.delete("/roles/:id", async (req, res) => {
  res.json({ message: "Role deleted" });
});


// ➕ CATEGORIES
router.post("/categories", async (req, res) => {
  const { category } = req.body;
  res.json({ message: "Category added", category });
});

router.delete("/categories/:id", async (req, res) => {
  res.json({ message: "Category deleted" });
});


// ➕ PRIORITIES
router.post("/priorities", async (req, res) => {
  const { priority } = req.body;
  res.json({ message: "Priority added", priority });
});

router.delete("/priorities/:id", async (req, res) => {
  res.json({ message: "Priority deleted" });
});

export default router;