import express from "express";
import { createTicket, getAssignedTickets, getLogs } from "../controllers/ticket.controller.js";
import { fixMultipartEncoding } from "../middleware/fixMultipartEncoding.js";
import upload from "../middleware/upload.js";

import {
  addComment,
  assignTicket,
  closeTicket,
  deleteTicket,
  getAllTickets,
  getKnowledgeTickets,
  getMyTickets,
  getTicketById,
  getTicketsByCategory,
  mlCorrection,
  updateStatus
} from "../controllers/ticket.controller.js";

import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


// =======================================================
// ROLES (единый список для чистоты)
// =======================================================
const allRoles = [
  "user",
  "operator",
  "admin",
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support",
];


// =======================================================
// CREATE TICKET
// =======================================================
router.post(
  "/",
  authenticate,
  authorizeRoles("user"),
  upload.array("files", 5), // максимум 5 файлов
  fixMultipartEncoding,
  createTicket
);

router.get("/logs", getLogs);

// =======================================================
// MY TICKETS (user)
// =======================================================
router.get(
  "/my",
  authenticate,
  authorizeRoles("user"),
  getMyTickets
);

router.get(
  "/assigned",
  authenticate,
  authorizeRoles(
    "operator",
    "admin",
    "it_support",
    "network_admin",
    "sysadmin",
    "security",
    "hardware_support"
  ),
  getAssignedTickets
);

router.get(
  "/knowledge",
  authenticate,
  authorizeRoles(
    "operator",
    "admin",
    "it_support",
    "network_admin",
    "sysadmin",
    "security",
    "hardware_support"
  ),
  getKnowledgeTickets
);

// =======================================================
// CATEGORY TICKETS (specialists)
// =======================================================
router.get(
  "/category/:category",
  authenticate,
  authorizeRoles(
    "it_support",
    "network_admin",
    "sysadmin",
    "security",
    "hardware_support",
    "operator",
    "admin"
  ),
  getTicketsByCategory
);


// =======================================================
// ALL TICKETS (operator / admin)
// =======================================================
router.get(
  "/",
  authenticate,
  authorizeRoles("operator", "admin"),
  getAllTickets
);


// =======================================================
// GET TICKET BY ID (universal, internal checks in controller)
// =======================================================
router.get(
  "/:id",
  authenticate,
  getTicketById
);


// =======================================================
// UPDATE STATUS
// =======================================================
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    "operator",
    "admin",
    "it_support",
    "network_admin",
    "sysadmin",
    "security",
    "hardware_support"
  ),
  updateStatus
);


// =======================================================
// ML CORRECTION (feedback loop)
// =======================================================
router.patch(
  "/:id/ml-correction",
  authenticate,
  authorizeRoles("operator", "admin"),
  mlCorrection
);


// =======================================================
// ASSIGN TICKET
// =======================================================
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("operator", "admin"),
  assignTicket
);


// =======================================================
// ADD COMMENT
// =======================================================
router.post(
  "/:id/comment",
  authenticate,
  authorizeRoles(...allRoles),
  addComment
);


// =======================================================
// CLOSE TICKET
// =======================================================
router.patch(
  "/:id/close",
  authenticate,
  authorizeRoles(
    "operator",
    "admin",
    "it_support",
    "network_admin",
    "sysadmin",
    "security",
    "hardware_support"
  ),
  closeTicket
);


// =======================================================
// DELETE TICKET (admin only)
// =======================================================
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteTicket
);



export default router;

