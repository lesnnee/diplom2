// routes/ticket.routes.js
import express from "express";
import {
    addComment,
    assignTicket,
    closeTicket,
    createTicket,
    deleteTicket,
    getAllTickets,
    getMyTickets,
    getTicketsByCategory,
    mlCorrection,
    updateStatus,
} from "../controllers/ticket.controller.js";

import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------------------------------------------
// Создать тикет (только user)
// -------------------------------------------------------
router.post("/", authenticate, authorizeRoles("user"), createTicket);

// -------------------------------------------------------
// Мои тикеты (только user)
// -------------------------------------------------------
router.get("/my", authenticate, authorizeRoles("user"), getMyTickets);

// -------------------------------------------------------
// Все тикеты (operator / admin)
// -------------------------------------------------------
router.get("/", authenticate, authorizeRoles("operator", "admin"), getAllTickets);

// -------------------------------------------------------
// Тикеты по категории (специалисты)
// -------------------------------------------------------
router.get("/category/:category", authenticate, authorizeRoles(
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support",
  "operator",
  "admin"
), getTicketsByCategory);

// -------------------------------------------------------
// Обновление статуса тикета
// -------------------------------------------------------
router.patch("/:id/status", authenticate, authorizeRoles(
  "operator",
  "admin",
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support"
), updateStatus);

// -------------------------------------------------------
// ML корректировка (operator / admin)
// -------------------------------------------------------
router.patch("/:id/ml-correction", authenticate, authorizeRoles("operator", "admin"), mlCorrection);

// -------------------------------------------------------
// Назначение тикета (operator / admin)
// -------------------------------------------------------
router.patch("/:id/assign", authenticate, authorizeRoles("operator", "admin"), assignTicket);

// -------------------------------------------------------
// Добавление комментария
// -------------------------------------------------------
router.post("/:id/comment", authenticate, authorizeRoles(
  "user",
  "operator",
  "admin",
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support"
), addComment);

// -------------------------------------------------------
// Закрытие тикета
// -------------------------------------------------------
router.patch("/:id/close", authenticate, authorizeRoles(
  "operator",
  "admin",
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support"
), closeTicket);

// -------------------------------------------------------
// Удаление тикета (только admin)
// -------------------------------------------------------
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteTicket);

export default router;

