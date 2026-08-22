const express = require("express");

const {
  registerUser,
  loginUser,
  requestPasswordChange,
  resetPassword,
} = require("../controllers/authController");

const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// Logged-in user requests password change email
router.post(
  "/request-password-change",
  auth,
  requestPasswordChange
);

// User opens reset link from email
router.post(
  "/reset-password/:token",
  resetPassword
);

module.exports = router;