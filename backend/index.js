const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/services/auth/routes");
const profileRoutes = require("./src/services/profile/routes");
const courseRoutes = require("./src/services/courses/routes");
const dashboardRoutes = require("./src/services/dashboard/routes");
const recommendationRoutes = require("./src/services/recommendations/routes");
const ragRoutes = require("./src/services/rag/routes");

const courseCache = require("./src/config/courseCache");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ 
    message: "ICA Backend API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      profile: "/api/profile",
      courses: "/api/courses",
      dashboard: "/api/dashboard",
      recommendations: "/api/recommendations",
      rag: "/api/rag",
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/rag", ragRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

app.listen(PORT, async () => {
  await courseCache.load();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
});

module.exports = app;
