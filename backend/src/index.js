require("dotenv").config();
const express = require("express");
const cors = require("cors");
const courseCache = require("./config/courseCache");
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./services/auth/routes");
const profileRoutes = require("./services/profile/routes");
const courseRoutes = require("./services/courses/routes");
const dashboardRoutes = require("./services/dashboard/routes");
const recommendationRoutes = require("./services/recommendations/routes");
const ragRoutes = require("./services/rag/routes");

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/rag", ragRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await courseCache.load();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
