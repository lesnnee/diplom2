import express from "express";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tickets = await Ticket.countDocuments();

    const open = await Ticket.countDocuments({ status: "open" });
    const closed = await Ticket.countDocuments({ status: "done" });

    // 📈 fake timeline (пока)
    const timeline = [
      { date: "Mon", created: 5, closed: 2 },
      { date: "Tue", created: 8, closed: 6 },
      { date: "Wed", created: 4, closed: 3 },
      { date: "Thu", created: 10, closed: 7 },
      { date: "Fri", created: 6, closed: 5 },
    ];

    // 🥧 categories
    const categories = await Ticket.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      users,
      tickets,
      open,
      closed,
      timeline,
      categories,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;