import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import Settings from "./models/Settings.js";

// ======================
// INIT SETTINGS
// ======================
const initSettings = async () => {
  try {
    const exists = await Settings.findOne();

    if (!exists) {
      await Settings.create({
        roles: [
          "user",
          "operator",
          "admin",
          "it_support",
          "network_admin",
          "sysadmin",
          "security",
          "hardware_support",
        ],

        categories: [
          "software",
          "network",
          "infrastructure",
          "security",
          "hardware",
          "unknown",
        ],

        priorities: [1, 2, 3, 4, 5],
      });

      console.log("✅ Settings initialized");
    } else {
      console.log("ℹ️ Settings already exist");
    }
  } catch (err) {
    console.error("❌ Settings init error:", err.message);
  }
};

// ======================
// SERVER + SOCKET
// ======================
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // dev frontend
    credentials: true,
  },
});

// make io accessible everywhere
app.set("io", io);

// ======================
// SOCKET EVENTS
// ======================
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join_ticket", (ticketId) => {
    socket.join(ticketId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ======================
// START SERVER (IMPORTANT FIX)
// ======================
const startServer = async () => {
  await initSettings();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();