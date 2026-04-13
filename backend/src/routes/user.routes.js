import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// получить всех пользователей (admin)
router.get("/", authenticate, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export default router;