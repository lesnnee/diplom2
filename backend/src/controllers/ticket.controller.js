// controllers/ticket.controller.js
import Ticket from "../models/Ticket.js";

// Заглушка ML-классификатора
async function mockMLClassifier(description) {
  // Имитация "умной" обработки
  if (description.toLowerCase().includes("wifi")) return { category: "network", priority: 2 };
  if (description.toLowerCase().includes("virus")) return { category: "security", priority: 1 };
  if (description.toLowerCase().includes("printer")) return { category: "hardware", priority: 3 };

  return { category: "unknown", priority: 3 };
}

// -------------------------------------------------------
// 1. Создать тикет (только user)
// -------------------------------------------------------
export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId; 

    // ML обработка
    const ml = await mockMLClassifier(description);

    // Определение исполнителя по категории
    const categoryToRole = {
      software: "it_support",
      network: "network_admin",
      infrastructure: "sysadmin",
      security: "security",
      hardware: "hardware_support",
      unknown: "operator",
    };

    const assignedTo = categoryToRole[ml.category] || "operator";

    const ticket = await Ticket.create({
      userId,
      title,
      description,
      category: ml.category,
      priority: ml.priority,
      assignedTo,
    });

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 2. Мои тикеты (user)
// -------------------------------------------------------
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 3. Все тикеты (operator / admin)
// -------------------------------------------------------
export const getAllTickets = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

    const tickets = await Ticket.find(filters)
      .populate("userId")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 4. Тикеты по категории для специалиста
// -------------------------------------------------------
export const getTicketsByCategory = async (req, res) => {
  try {
    const role = req.user.role; // роль исполнителя
    const category = req.params.category;

    // Проверка: пользователь запрашивает свою категорию?
    const roleToCategory = {
      it_support: "software",
      network_admin: "network",
      sysadmin: "infrastructure",
      security: "security",
      hardware_support: "hardware",
    };

    if (roleToCategory[role] !== category) {
      return res.status(403).json({ error: "Access denied: wrong category" });
    }

    const tickets = await Ticket.find({ category }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 5. Обновить статус тикета
// -------------------------------------------------------
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    const allowedRoles = ["operator", "admin", "it_support", "sysadmin", "network_admin", "security", "hardware_support"];
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

// -------------------------------------------------------
// 6. Корректировка ML (operator / admin)
// -------------------------------------------------------
export const mlCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, priority } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { category, priority },
      { new: true }
    );

    res.json({ message: "ML corrected", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 7. Назначить тикет вручную
// -------------------------------------------------------
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

// -------------------------------------------------------
// 8. Добавить комментарий
// -------------------------------------------------------
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.comments.push({
      userId: req.user.id,
      message,
    });

    await ticket.save();

    res.json({ message: "Comment added", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------
// 9. Закрыть тикет
// -------------------------------------------------------
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

// -------------------------------------------------------
// 10. Удалить тикет (admin)
// -------------------------------------------------------
export const deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};