import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    // 🔥 роли специалистов
    role: {
      type: String,
      default: "user",
    },

    company: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },

    lastLogin: { type: Date },

    isActive: { type: Boolean, default: true },

    preferences: { type: Object },

    // 🧠 СЧЁТЧИК АКТИВНЫХ ТИКЕТОВ (для балансировки нагрузки)
    activeTickets: {
      type: Number,
      default: 0,
    },

    // 🧠 МАССИВ ID НАЗНАЧЕННЫХ ТИКЕТОВ (альтернативный способ)
    assignedTickets: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Ticket",
      default: [],
    },

    // 📊 МЕТРИКИ ДЛЯ SCORE
    resolvedTickets: {
      type: Number,
      default: 0,
    },

    avgResolutionTime: {
      type: Number,
      default: 0, // minutes
    },

    successRate: {
      type: Number,
      default: 0, // %
    },
  },
  { timestamps: true }
);

// 🧠 ИНДЕКСЫ ДЛЯ БЫСТРОГО ПОИСКА
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ activeTickets: 1 });

const User = mongoose.model("User", userSchema);
export default User;