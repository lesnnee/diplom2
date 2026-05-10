import express from "express";
import { getSpecialists, getUsersByRole } from "../controllers/user.controller.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Роут для специалистов (с authenticate и authorizeRoles)
router.get("/specialists", authenticate, authorizeRoles("admin", "operator"), getSpecialists);

// ✅ Роут по роли
router.get("/by-role", authenticate, authorizeRoles("admin", "operator"), getUsersByRole);

// ✅ Получить всех пользователей (admin)
router.get("/", authenticate, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export default router;