const { clerkMiddleware, getAuth, clerkClient } = require("@clerk/express");
const { env } = require("../config/env");
const { HttpError } = require("../utils/httpError");
const userRepository = require("../services/auth/repository");

// Verifies the Clerk session JWT (Authorization: Bearer <token>) on every request.
// authorizedParties guards against tokens minted for other origins.
const clerk = () => clerkMiddleware({ authorizedParties: env.corsOrigins });

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return next(new HttpError(401, "Authentication required"));
  req.userId = userId;
  next();
}

/** Ensures the `:clerkId` route param belongs to the signed-in user. */
function requireSelf(param = "clerkId") {
  return (req, res, next) => {
    if (req.params[param] !== req.userId) return next(new HttpError(403, "You can only access your own data"));
    next();
  };
}

const provisionCache = new Map(); // clerkId -> expiry timestamp
const PROVISION_TTL_MS = 5 * 60 * 1000;

/**
 * Makes sure a local `users` row exists for the Clerk user, creating it from the
 * Clerk profile on first contact. Removes the race where a page queries the API
 * before the client-side /auth/sync call has completed.
 */
async function ensureUser(req, res, next) {
  const cached = provisionCache.get(req.userId);
  if (cached && cached > Date.now()) return next();

  let user = await userRepository.findByClerkId(req.userId);
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(req.userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || "";
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null;
    try {
      user = await userRepository.create({ clerkId: req.userId, email, name });
    } catch (err) {
      // Concurrent first requests can race on the unique clerk_id; the row now exists.
      user = await userRepository.findByClerkId(req.userId);
      if (!user) throw err;
    }
  }
  provisionCache.set(req.userId, Date.now() + PROVISION_TTL_MS);
  next();
}

/** Admins are Clerk users with publicMetadata.role === "admin". */
async function requireAdmin(req, res, next) {
  const user = await clerkClient.users.getUser(req.userId);
  if (user.publicMetadata?.role !== "admin") return next(new HttpError(403, "Admin access required"));
  next();
}

module.exports = { clerk, requireAuth, requireSelf, ensureUser, requireAdmin };
