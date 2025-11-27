import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "user",
        "operator",
        "admin",
        "it_support",
        "network_admin",
        "sysadmin",
        "security",
        "hardware_support"
      ],
      default: "user",
    },
    company: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    preferences: { type: Object },
    assignedTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;