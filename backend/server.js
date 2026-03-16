require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const ingredientsRoutes = require("./routes/ingredients");
const analyzeRoutes = require("./routes/analyze");
const logsRoutes = require("./routes/logs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/logs", logsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NutriAI Pro Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🌿 NutriAI Pro Backend running on http://localhost:${PORT}`);
});
