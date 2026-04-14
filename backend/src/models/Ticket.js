import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    status: {
      type: String,
      enum: ["new", "in_progress", "waiting_user", "done", "rejected"],
      default: "new",
    },

    category: {
      type: String,
      enum: [
        "software",
        "network",
        "infrastructure",
        "security",
        "hardware",
        "unknown",
      ],
      default: "unknown",
    },

    priority: { type: Number, min: 1, max: 5, default: 3 },

    // 🔥 ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    history: [
      {
        action: String,
        oldValue: String,
        newValue: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);