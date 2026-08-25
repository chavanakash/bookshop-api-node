const AuthService = require("../services/AuthService");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = AuthService.verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
