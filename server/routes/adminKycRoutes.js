const express = require("express");

const router = express.Router();

const {
  getKycUsers,
  getKycStats,
} = require("../controllers/adminKycController");

const adminOnly = require("../middleware/adminOnly");

// =====================================================
// ADMIN KYC
// =====================================================

router.get(
  "/users",
  adminOnly,
  getKycUsers
);

router.get(
  "/stats",
  adminOnly,
  getKycStats
);

module.exports = router;