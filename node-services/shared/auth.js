const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_KEY || "dev-secret-key-change-me";

// A token is the signed proof that the user logged in.
// We store the role in the token so protected routes can check permissions.
function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

// Invalid or expired tokens return null instead of throwing into route handlers.
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

// Frontend sends tokens as: Authorization: Bearer <token>
// This helper extracts only the token part.
function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

// Express middleware: it runs before admin routes.
// If the user is not an admin, the real route handler never executes.
function requireAdmin(req, res, next) {
  const payload = verifyToken(getBearerToken(req));

  if (!payload) {
    return res.status(401).json({ error: "Missing token" });
  }

  if (payload.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  req.auth = payload;
  return next();
}

// Same pattern as requireAdmin, but for logged-in customers.
function requireCustomer(req, res, next) {
  const payload = verifyToken(getBearerToken(req));

  if (!payload) {
    return res.status(401).json({ error: "Missing token" });
  }

  if (payload.role !== "customer") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  req.auth = payload;
  return next();
}

module.exports = {
  generateToken,
  verifyToken,
  getBearerToken,
  requireAdmin,
  requireCustomer
};
