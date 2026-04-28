import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const assigned = await Ticket.countDocuments({
      assignedTo: userId,
    });

    const inProgress = await Ticket.countDocuments({
      assignedTo: userId,
      status: "in_progress",
    });

    const done = await Ticket.countDocuments({
      assignedTo: userId,
      status: "done",
    });

    const total = await Ticket.countDocuments({
      assignedTo: userId,
    });

    const loadPercent = total
      ? Math.round((inProgress / total) * 100)
      : 0;

    res.json({
      assigned,
      inProgress,
      doneToday: done,
      loadPercent,
    });

  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;