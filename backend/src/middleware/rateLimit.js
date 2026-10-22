const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const keyByUser = (req) => req.userId || ipKeyGenerator(req.ip);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const ragLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: keyByUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many questions in a short time. Please wait a minute and try again." },
});

const recommendationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 6,
  keyGenerator: keyByUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Recommendations were refreshed too often. Please wait a minute." },
});

module.exports = { apiLimiter, ragLimiter, recommendationLimiter };
