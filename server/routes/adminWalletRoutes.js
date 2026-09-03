const express = require("express");

const router =
  express.Router();

const adminOnly =
  require("../middleware/adminOnly");

const {
  getWalletRequests,
  getAdminWalletSummary,
  approveWalletRequest,
  rejectWalletRequest,
} = require("../controllers/adminWalletController");


// =====================================================
// ADMIN WALLET SUMMARY
//
// GET /api/admin/wallet/summary
// =====================================================

router.get(
  "/summary",
  adminOnly,
  getAdminWalletSummary
);


// =====================================================
// GET WALLET REQUESTS
//
// GET /api/admin/wallet/requests
// =====================================================

router.get(
  "/requests",
  adminOnly,
  getWalletRequests
);


// =====================================================
// APPROVE
//
// PUT /api/admin/wallet/requests/:id/approve
// =====================================================

router.put(
  "/requests/:id/approve",
  adminOnly,
  approveWalletRequest
);


// =====================================================
// REJECT
//
// PUT /api/admin/wallet/requests/:id/reject
// =====================================================

router.put(
  "/requests/:id/reject",
  adminOnly,
  rejectWalletRequest
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;