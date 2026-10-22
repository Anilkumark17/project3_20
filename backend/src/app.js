const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env");
const { sql } = require("./db");
const { clerk, requireAuth, ensureUser } = require("./middleware/auth");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./services/auth/routes");
const profileRoutes = require("./services/profile/routes");
const courseRoutes = require("./services/courses/routes");
const dashboardRoutes = require("./services/dashboard/routes");
const recommendationRoutes = require("./services/recommendations/routes");
const ragRoutes = require("./services/rag/routes");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "ICA Backend API is running", version: "2.0.0" });
});

app.get("/health", async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: "ok", database: "up", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", database: "down", timestamp: new Date().toISOString() });
  }
});

app.use(clerk());

// Public catalog (writes inside are admin-guarded)
app.use("/api/courses", courseRoutes);

// Everything else requires a signed-in user with a local users row
const authed = [requireAuth, ensureUser];
app.use("/api/auth", authed, authRoutes);
app.use("/api/profile", authed, profileRoutes);
app.use("/api/dashboard", authed, dashboardRoutes);
app.use("/api/recommendations", authed, recommendationRoutes);
app.use("/api/rag", authed, ragRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
