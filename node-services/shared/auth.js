const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_KEY || "dev-secret-key-change-me";

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

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
