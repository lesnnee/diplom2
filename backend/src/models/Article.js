import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    content: { type: String, required: true },

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

    tags: [String], // ["vpn", "wifi", "router"]

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sourceTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);