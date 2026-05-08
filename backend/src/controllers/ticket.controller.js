import axios from "axios";
import mongoose from "mongoose";
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

    return {
      category: "unknown",
      priority: 3,
      confidence: 0,
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
    const assignedTo = specialist?._id || null;

    let attachments = [];

    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        safeName: file.filename,
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
      attachments,
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
    const tickets = await Ticket.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 3. ALL TICKETS
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
// 4. CATEGORY TICKETS
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
      return res.status(403).json({ error: "Access denied" });
    }

    const tickets = await Ticket.find({ category })
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 5. UPDATE STATUS (🔥 FIXED)
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

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const oldStatus = ticket.status;

    // ======================
    // HISTORY
    // ======================
    ticket.history.push({
      action: "status_change",
      oldValue: oldStatus,
      newValue: status,
      changedBy: req.user.userId,
    });

    // ======================
    // CLOSED AT LOGIC
    // ======================
    if (status === "done") {
      ticket.closedAt = new Date();
    }

    if (status === "in_progress") {
      ticket.closedAt = null;
    }

    ticket.status = status;

    await ticket.save();

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 6. ML CORRECTION
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
      priority,
    });

    res.json({ message: "ML corrected", ticket });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 7. ASSIGN
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

    res.json({ message: "Ticket assigned", ticket });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 8. ADD COMMENT (FIXED SAFE CHECK)
// =======================================================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findById(id);

    if (ticket.status === "done") {
      return res.status(400).json({
        message: "Cannot comment on closed ticket",
      });
    }

    const newComment = {
      userId: req.user.userId,
      message,
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);
    await ticket.save();

    await ticket.populate("comments.userId", "name");

    const io = req.app.get("io");

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
    const ticket = await Ticket.findById(id);

    ticket.status = "done";
    ticket.closedAt = new Date();

    await ticket.save();

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 10. DELETE
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
// 11. GET BY ID
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

    if (role === "user" && ticket.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const roleToCategory = {
      it_support: "software",
      network_admin: "network",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    if (roleToCategory[role] && ticket.category !== roleToCategory[role]) {
      return res.status(403).json({ message: "Wrong category" });
    }

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 12. ASSIGNED
// =======================================================
export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      assignedTo: new mongoose.Types.ObjectId(req.user.userId),
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// =======================================================
// 13. KNOWLEDGE BASE
// =======================================================
export const getKnowledgeTickets = async (req, res) => {
  try {
    const roleCategoryMap = {
      network_admin: "network",
      it_support: "software",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    const category = roleCategoryMap[req.user.role];

    const tickets = await Ticket.find({
      status: "done",
      category,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// LOGS
// =======================================================
export const getLogs = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("history.changedBy", "name role")
      .sort({ updatedAt: -1 });

    const logs = tickets.flatMap((t) =>
      t.history.map((h) => ({
        ticketId: t._id,
        action: h.action,
        oldValue: h.oldValue,
        newValue: h.newValue,
        user: h.changedBy?.name,
        role: h.changedBy?.role,
        timestamp: h.timestamp,
      }))
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllKnowledgeTickets = async (req, res) => {
  try {

    const tickets = await Ticket.find({
      status: "done",
    })
      .populate("userId", "name")
      .sort({ closedAt: -1 });

    res.json(tickets);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load knowledge tickets",
    });
  }
};