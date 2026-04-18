import app from "./app.js";
import userRoutes from "./routes/user.routes.js";
import express from "express";
import path from "path";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("src/uploads"));