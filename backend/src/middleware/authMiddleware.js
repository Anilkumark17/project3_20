// Auth Middleware (Clerk integration placeholder)
// Replace with actual Clerk or JWT verification logic.

const authMiddleware = (req, res, next) => {
  // TODO: Verify Clerk session token
  // const { userId } = getAuth(req);
  // if (!userId) return res.status(401).json({ error: "Unauthorized" });
  next();
};

module.exports = authMiddleware;
