import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Ticket from "./models/Ticket.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function exportData() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected!");

    // 🔥 БЕРЁМ ВСЕ ТИКЕТЫ (а не только correction)
    const tickets = await Ticket.find();

    console.log("Tickets found:", tickets.length);

    const dataset = tickets
      .filter((t) => t.description)
      .map((t) => ({
        text: t.description,
        label: t.correction?.category || t.category || "unknown",
        priority: t.correction?.priority || t.priority || 3,
      }));

    fs.writeFileSync(
      path.resolve("dataset.json"),
      JSON.stringify(dataset, null, 2)
    );

    console.log("Dataset created:", dataset.length);

    process.exit();
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    process.exit(1);
  }
}

exportData();