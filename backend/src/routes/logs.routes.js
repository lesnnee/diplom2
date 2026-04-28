import express from "express";
import Log from "../models/Log.js";

const router = express.Router();

// GET ALL LOGS
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;