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

    // 🔥 теперь роли НЕ фиксированные
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

    // 🧠 метрики (можно кешировать или считать динамически)
    activeTickets: {
      type: Number,
      default: 0,
    },

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

const User = mongoose.model("User", userSchema);
export default User;