import axios from "axios";
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { findBestSpecialist } from "../utils/smartRouting.js";


// =======================================================
// ML SERVICE CALL (HTTP ONLY)
// =======================================================
async function mlClassifier(description) {
  try {
    const res = await axios.post("http://localhost:8000/predict", {
      description,
    });

    console.log(`[ML] Category: ${res.data.category} (${res.data.confidence_category?.toFixed(2) || 'N/A'}), Priority: ${res.data.priority} (${res.data.confidence_priority?.toFixed(2) || 'N/A'})`);
    
    return res.data;
  } catch (err) {
    console.error("ML error:", err.message);
    
    return {
      category: "unknown",
      priority: 3,
      confidence_category: 0,
      confidence_priority: 0,
      auto_approved: false,
      error: err.message
    };
  }
}

// =======================================================
// 1. CREATE TICKET (с обновлением счётчиков специалиста)
// =======================================================
export const createTicket = async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.userId;

    const ml = await mlClassifier(description);

    const CONFIDENCE_THRESHOLD = 0.90;
    const isConfident = (ml.confidence_category || 0) >= CONFIDENCE_THRESHOLD;

    const categoryToRole = {
      software: "it_support",
      network: "network_admin",
      infrastructure: "sysadmin",
      security: "security",
      hardware: "hardware_support",
      unknown: "operator",
      manual_review: "operator"
    };

    let specialistRole;

    if (!isConfident || ml.category === "unknown" || ml.category === "manual_review") {
      specialistRole = "operator";
    } else {
      specialistRole = categoryToRole[ml.category] || "operator";
    }

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

    const routingMode = isConfident ? "auto" : "manual_review";
    
    // ✅ СНАЧАЛА создаём тикет
    const ticket = await Ticket.create({
      userId,
      description,
      category: ml.category,
      priority: ml.priority,
      assignedTo,
      attachments,
      routingMode,
      confidence: ml.confidence_category || 0,
      mlPrediction: {
        predictedCategory: ml.category,
        confidence: ml.confidence_category || 0,
        autoApproved: isConfident,
        threshold: CONFIDENCE_THRESHOLD,
        predictedAt: new Date(),
        probabilities: ml.category_probabilities || {},
        priorityPrediction: {
          value: ml.priority,
          confidence: ml.confidence_priority || 0,
          probabilities: ml.priority_probabilities || {}
        }
      }
    });

    // ✅ ПОТОМ обновляем счётчики специалиста (используя созданный ticket._id)
    if (assignedTo && specialistRole !== "operator") {
      await User.findByIdAndUpdate(assignedTo, {
        $inc: { activeTickets: 1 },
        $push: { assignedTickets: ticket._id }
      });
    }

    console.log(`[Ticket] Created #${ticket._id}, Category: ${ml.category} (${(ml.confidence_category || 0).toFixed(2)}), Priority: ${ml.priority} (${(ml.confidence_priority || 0).toFixed(2)}), Route: ${routingMode}, Assigned: ${specialistRole}`);

    res.status(201).json({
      message: "Ticket created",
      ticket: {
        id: ticket._id,
        category: ticket.category,
        priority: ticket.priority,
        routingMode: ticket.routingMode,
        confidence: ticket.confidence,
        autoApproved: isConfident,
        assignedTo: specialist?.name || null
      },
    });

  } catch (err) {
    console.error("Create ticket error:", err);
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
// 5. UPDATE STATUS (с обновлением счётчиков при закрытии)
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

    // ✅ Если тикет закрывается (done) - уменьшаем счётчики специалиста
    if (status === "done" && ticket.assignedTo && oldStatus !== "done") {
      await User.findByIdAndUpdate(ticket.assignedTo, {
        $inc: { activeTickets: -1 },
        $pull: { assignedTickets: ticket._id }
      });
    }

    // ✅ Если тикет возвращается в работу (in_progress) и был закрыт
    if (status === "in_progress" && oldStatus === "done" && ticket.assignedTo) {
      await User.findByIdAndUpdate(ticket.assignedTo, {
        $inc: { activeTickets: 1 },
        $push: { assignedTickets: ticket._id }
      });
    }

    ticket.history.push({
      action: "status_change",
      oldValue: oldStatus,
      newValue: status,
      changedBy: req.user.userId,
    });

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
    const { category, priority, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.correction = {
      category,
      priority,
      assignedTo,
      correctedAt: new Date(),
      correctedBy: req.user._id,
    };

    await ticket.save();

    axios.post("http://localhost:8000/feedback", {
      description: ticket.description,
      originalCategory: ticket.category,
      correctedCategory: category,
      priority,
    }).catch(err => {
      console.log("ML service error:", err.message);
    });

    res.json({
      message: "ML correction saved",
      ticket,
    });

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
// 8. ADD COMMENT
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
// 9. CLOSE TICKET (FIXED)
// =======================================================
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;

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


// =======================================================
// ALL KNOWLEDGE
// =======================================================
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