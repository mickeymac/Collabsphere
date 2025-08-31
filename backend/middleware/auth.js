const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    // Prefer HTTP-only cookie; fallback to Authorization: Bearer <token>
    const bearer = req.headers.authorization?.split(" ")[1];
    const token = req.cookies?.token || bearer;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
