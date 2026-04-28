import axios from "axios";
import Ticket from "../models/Ticket.js";
import { findBestSpecialist } from "../utils/smartRouting.js";


// =======================================================
// ML SERVICE CALL
// =======================================================
async function mlClassifier(description) {
  try {
    const res = await axios.post("http://localhost:8000/predict", {
      description,
    });

    return res.data;
  } catch (err) {
    console.error("ML error:", err.message);

    // fallback
    return {
      category: "unknown",
      priority: 3,
      confidence: 0
    };
  }
}


// =======================================================
// 1. CREATE TICKET
// =======================================================
export const createTicket = async (req, res) => {
  try {
    const { description } = req.body;

    const userId = req.user.userId;

    // AI classification
    const ml = await mlClassifier(description);

    const categoryToRole = {
      software: "it_support",
      network: "network_admin",
      infrastructure: "sysadmin",
      security: "security",
      hardware: "hardware_support",
      unknown: "operator",
    };

    const specialistRole = categoryToRole[ml.category] || "operator";

const specialist = await findBestSpecialist(specialistRole);

const assignedTo = specialist?._id || "operator";
// обработка файлов
let attachments = [];

if (req.files && req.files.length > 0) {
  attachments = req.files.map((file) => ({
    filename: file.originalname,   // имя от пользователя (для UI)
    safeName: file.filename,       // реальное имя на диске
    url: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
  }));
}

   const ticket = await Ticket.create({
  userId,
  description,
  category: ml.category,
  priority: ml.priority,
  assignedTo,
  attachments, // 👈 ВАЖНО
});

    res.status(201).json({
      message: "Ticket created",
      ticket,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 2. USER TICKETS
// =======================================================
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const tickets = await Ticket.find({ userId })
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 3. ALL TICKETS (operator/admin)
// =======================================================
export const getAllTickets = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

    const tickets = await Ticket.find(filters)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 4. CATEGORY TICKETS (specialist)
// =======================================================
export const getTicketsByCategory = async (req, res) => {
  try {
    const role = req.user.role;
    const category = req.params.category;

    const roleToCategory = {
      it_support: "software",
      network_admin: "network",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    if (roleToCategory[role] && roleToCategory[role] !== category) {
      return res.status(403).json({
        error: "Access denied: wrong category",
      });
    }

    const tickets = await Ticket.find({ category })
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 5. UPDATE STATUS
// =======================================================
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    const allowedRoles = [
      "operator",
      "admin",
      "it_support",
      "network_admin",
      "sysadmin",
      "security",
      "hardware_support",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 6. ML CORRECTION (feedback)
// =======================================================
export const mlCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, priority } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { category, priority },
      { new: true }
    );

    await axios.post("http://localhost:8000/feedback", {
  description: ticket.description,
  category,
  priority
});

    res.json({
      message: "ML corrected",
      ticket,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 7. ASSIGN TICKET
// =======================================================
export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    );

    res.json({
      message: "Ticket assigned",
      ticket,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 8. ADD COMMENT
// =======================================================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findById(id);

    const newComment = {
      userId: req.user.userId,
      message,
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);
    await ticket.save();

    // 🔥 ВАЖНО — populate чтобы имя пришло
    await ticket.populate("comments.userId", "name");

    const io = req.app.get("io");

    // отправляем ВСЕМ в комнате тикета
    io.to(id).emit("new_comment", {
      ticketId: id,
      comment: ticket.comments[ticket.comments.length - 1],
    });

    res.json({ message: "Comment added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================================================
// 9. CLOSE TICKET
// =======================================================
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status: "done" },
      { new: true }
    );

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 10. DELETE TICKET (admin)
// =======================================================
export const deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: "Ticket deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 11. GET TICKET BY ID (secure)
// =======================================================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

const ticket = await Ticket.findById(id)
  .populate("userId", "name email")
  .populate("assignedTo", "name role")
  .populate("comments.userId", "name");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // USER → only own ticket
    if (role === "user" && ticket.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // SPECIALIST → only category access
    const roleToCategory = {
      it_support: "software",
      network_admin: "network",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    if (
      roleToCategory[role] &&
      ticket.category !== roleToCategory[role]
    ) {
      return res.status(403).json({ message: "Wrong category" });
    }

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};