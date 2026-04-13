import app from "./app.js";
import userRoutes from "./routes/user.routes.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/api/users", userRoutes);