const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ResetToken = require("../models/passwordResetToken");
const { sendPasswordResetEmail } = require("../utils/email");

// helper: sign JWT + set cookie
function issueToken(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  // Cookies for local dev (http), set secure:true & sameSite:'none' when you deploy on https
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    issueToken(res, user._id);
    const safeUser = { id: user._id, name: user.name, email: user.email };
    return res.status(201).json({ data: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    issueToken(res, user._id);
    const safeUser = { id: user._id, name: user.name, email: user.email };
    return res.json({ data: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.logout = async (_req, res) => {
  // Clear cookie
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  return res.json({ message: "Logged out" });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// --------- Forgot / Reset Password (dev-friendly) ---------

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: "If that email exists, a reset link was created" });
    }

    // Remove old tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Create token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await ResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const base = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${base}/reset-password/${rawToken}`;

    // Send reset email and log the URL
    await sendPasswordResetEmail(user.email, resetUrl);
    
    return res.json({
      message: "If that email exists, a reset link was sent",
      // Only in development:
      resetUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};
    if (!token) return res.status(400).json({ error: "Token required" });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await ResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!record) return res.status(400).json({ error: "Invalid or expired token" });

    const user = await User.findById(record.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    // Invalidate all reset tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
