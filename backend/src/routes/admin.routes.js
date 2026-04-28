import express from "express";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

// 📊 ADMIN STATS
router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: "open" });
    const operators = await User.countDocuments({ role: "operator" });

    res.json({
      users,
      tickets,
      openTickets,
      operators,
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