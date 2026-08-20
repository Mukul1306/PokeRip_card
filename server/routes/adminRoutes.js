const express = require("express");

const adminOnly = require("../middleware/adminMiddleware");

const {
  getAdminProfile,
  getAdminDashboard,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/profile",
  adminOnly,
  getAdminProfile
);

router.get(
  "/dashboard",
  adminOnly,
  getAdminDashboard
);

module.exports = router;