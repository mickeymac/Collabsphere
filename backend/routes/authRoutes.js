const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout); // optional: allow without auth too
router.get("/me", auth, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
