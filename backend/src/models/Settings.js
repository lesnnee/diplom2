import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    roles: {
      type: [String],
      default: [
        "user",
        "operator",
        "admin",
        "it_support",
        "network_admin",
        "sysadmin",
        "security",
        "hardware_support",
      ],
    },

    categories: {
      type: [String],
      default: [
        "software",
        "network",
        "infrastructure",
        "security",
        "hardware",
        "unknown",
      ],
    },

    priorities: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);