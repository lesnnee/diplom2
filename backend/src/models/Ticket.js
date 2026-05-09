import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: { type: String, required: true },

    status: {
      type: String,
      enum: ["new", "in_progress", "waiting_user", "done", "rejected"],
      default: "new",
    },

    category: {
      type: String,
      default: "unknown",
    },

    // 🆕 ML Prediction Data (добавлено)
    mlPrediction: {
      predictedCategory: { type: String, default: null },
      confidence: { type: Number, min: 0, max: 1, default: null },
      autoApproved: { type: Boolean, default: false },
      threshold: { type: Number, default: 0.9 },
      predictedAt: { type: Date, default: null },
      probabilities: {
        type: Map,
        of: Number,
        default: {}
      }
    },

    correction: {
      category: { type: String, default: null },
      priority: { type: Number, min: 1, max: 5, default: null },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      correctedAt: { type: Date, default: null },
      correctedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      originalMlCategory: { type: String, default: null }, // 🆕 сохраняем что предлагала ML
      reason: { type: String, default: null } // 🆕 причина коррекции
    },

    priority: { type: Number, min: 1, max: 5, default: 3 },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    closedAt: {
      type: Date,
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

// 🆕 Индексы для быстрого поиска
TicketSchema.index({ "mlPrediction.autoApproved": 1 });
TicketSchema.index({ "mlPrediction.confidence": -1 });
TicketSchema.index({ "correction.correctedAt": 1 });

export default mongoose.model("Ticket", TicketSchema);