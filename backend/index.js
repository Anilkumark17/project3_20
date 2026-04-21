const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const courseRoutes = require("./src/routes/courseRoutes");

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
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
});

module.exports = app;
