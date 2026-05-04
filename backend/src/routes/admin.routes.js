import express from "express";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

// 📊 ADMIN STATS
router.get("/stats", async (req, res) => {
  try {
    // ======================
    // BASIC COUNTS
    // ======================

    const users = await User.countDocuments();
    const ticketsCount = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $ne: "done" } });
    const operators = await User.countDocuments({ role: "operator" });

    // 👇 ВАЖНО: массив тикетов
    const tickets = await Ticket.find();

    // ======================
    // DONE tickets
    // ======================

    const doneTickets = tickets.filter(t => t.status === "done");

    // ======================
    // AVG RESOLUTION TIME
    // ======================

    let avgResolutionTime = 0;

    if (doneTickets.length > 0) {
      const totalTime = doneTickets.reduce((sum, t) => {
        const created = new Date(t.createdAt);
        const updated = new Date(t.updatedAt);

        return sum + (updated - created);
      }, 0);

      avgResolutionTime = Math.round(
        totalTime / doneTickets.length / 1000 / 60
      );
    }

    const avgMinutes = avgResolutionTime;

const hours = Math.floor(avgMinutes / 60);
const minutes = avgMinutes % 60;

const avgFormatted = `${hours}h ${minutes}m`;

    // ======================
    // SUCCESS RATE
    // ======================

    const successRate = tickets.length
      ? Math.round((doneTickets.length / tickets.length) * 100)
      : 0;

    // ======================
    // OVERLOADED USERS
    // ======================

    const usersList = await User.find({
      role: { $regex: "admin|operator|specialist" }
    });

    const overloadedUsers = usersList.filter((u) => {
      const active = tickets.filter(
        (t) =>
          t.assignedTo?.toString() === u._id.toString() &&
          t.status !== "done"
      );

      return active.length >= 10;
    }).length;

    // ======================
    // RESPONSE
    // ======================

    res.json({
      users,
      tickets: ticketsCount,
      openTickets,
      operators,

      avgResolutionTime,
      successRate,
      overloadedUsers,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ➕ CREATE USER
router.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✏️ UPDATE USER (role, name, email)
router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🗑 DELETE USER
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;