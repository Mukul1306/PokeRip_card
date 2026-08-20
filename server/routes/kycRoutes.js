const express = require("express");

const router =
  express.Router();

const {
  startKyc,
  getMyKycStatus,
} = require("../controllers/kycController");

const authMiddleware =
  require("../middleware/authMiddleware");


// Start Persona verification
router.post(
  "/start",
  authMiddleware,
  startKyc
);


// Get current user's KYC
router.get(
  "/status",
  authMiddleware,
  getMyKycStatus
);


module.exports = router;