const express = require("express");

const router = express.Router();

const adminOnly = require("../middleware/adminOnly");

const {
  getWalletRequests,
  approveWalletRequest,
  rejectWalletRequest,
} = require("../controllers/adminWalletController");

// =====================================================
// GET WALLET REQUESTS
// =====================================================

router.get(
  "/requests",
  adminOnly,
  getWalletRequests
);

// =====================================================
// APPROVE
// =====================================================

router.put(
  "/requests/:id/approve",
  adminOnly,
  approveWalletRequest
);

// =====================================================
// REJECT
// =====================================================

router.put(
  "/requests/:id/reject",
  adminOnly,
  rejectWalletRequest
);

module.exports = router;