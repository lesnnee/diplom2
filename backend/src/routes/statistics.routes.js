import express from "express";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tickets = await Ticket.countDocuments();

    const open = await Ticket.countDocuments({ status: { $ne: "done" } });
    const closed = await Ticket.countDocuments({ status: "done" });

    // ======================
    // 📈 REAL TIMELINE
    // ======================

    const allTickets = await Ticket.find();

    const timelineMap = {};

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate()}.${d.getMonth() + 1}`;
    };

    // CREATED
    allTickets.forEach((t) => {
      const date = formatDate(t.createdAt);

      if (!timelineMap[date]) {
        timelineMap[date] = {
          date,
          created: 0,
          closed: 0,
        };
      }

      timelineMap[date].created++;
    });

    // CLOSED
    allTickets
      .filter((t) => t.status === "done")
      .forEach((t) => {
        const date = formatDate(t.closedAt || t.updatedAt);

        if (!timelineMap[date]) {
          timelineMap[date] = {
            date,
            created: 0,
            closed: 0,
          };
        }

        timelineMap[date].closed++;
      });

    // сортировка по дате
    const timeline = Object.values(timelineMap).sort((a, b) => {
      const [d1, m1] = a.date.split(".");
      const [d2, m2] = b.date.split(".");

      return new Date(2026, m1 - 1, d1) - new Date(2026, m2 - 1, d2);
    });

    // ======================
    // 🥧 CATEGORIES
    // ======================

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

    // 📊 specialists weekly stats
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const specialistStats = await Ticket.aggregate([
  {
    $match: {
      status: "done",
      closedAt: { $gte: weekAgo },
      assignedTo: { $ne: null },
    },
  },
  {
    $group: {
      _id: "$assignedTo",
      count: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $project: {
      name: "$user.name",
      value: "$count",
      _id: 0,
    },
  },
  {
    $sort: { value: -1 },
  },
]);

const doneTickets = await Ticket.find({ status: "done" });

let sla = {
  fast: 0,      // < 1h
  normal: 0,    // 1h - 24h
  slow: 0,      // 1d - 3d
  verySlow: 0,  // > 3d
};

doneTickets.forEach((t) => {
  const time = new Date(t.closedAt) - new Date(t.createdAt);
  const hours = time / 1000 / 60 / 60;

  if (hours < 1) sla.fast++;
  else if (hours < 24) sla.normal++;
  else if (hours < 72) sla.slow++;
  else sla.verySlow++;
});

const slaStats = [
  { name: "<1h", value: sla.fast },
  { name: "1-24h", value: sla.normal },
  { name: "1-3d", value: sla.slow },
  { name: ">3d", value: sla.verySlow },
];

const specialists = await User.find({
  role: {
    $in: [
      "operator",
      "it_support",
      "network_admin",
      "sysadmin",
      "security",
      "hardware_support",
    ],
  },
});

const overload = await Promise.all(
  specialists.map(async (u) => {
    const active = await Ticket.countDocuments({
      assignedTo: u._id,
      status: { $ne: "done" },
    });

    return {
      name: u.name,
      activeTickets: active,
    };
  })
);

    res.json({
      users,
      tickets,
      open,
      closed,
      timeline,
      categories,
      specialistStats,
      slaStats,
      overload
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;