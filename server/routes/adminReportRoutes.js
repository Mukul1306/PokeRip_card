const express = require("express");

const router = express.Router();

const {
  getAdminReport,
  getOpeningStats,
  getOpeningHistory,
  getOpeningDetails,
} = require("../controllers/adminReportController");

// =====================================================
// ADMIN REPORT
// GET /api/admin/report
// =====================================================

router.get(
  "/",
  getAdminReport
);

// =====================================================
// OPENING STATS
//
// GET /api/admin/report/openings/stats
//
// Returns:
// - Cards opened today
// - Cards opened this month
// - Total cards revealed
// - Cards waiting for decision
// =====================================================

router.get(
  "/openings/stats",
  getOpeningStats
);

// =====================================================
// OPENING HISTORY
//
// GET /api/admin/report/openings
//
// Supports:
// ?page=1
// ?limit=20
// ?status=ALL
// ?search=charizard
//
// =====================================================

router.get(
  "/openings",
  getOpeningHistory
);

// =====================================================
// OPENING DETAILS
//
// GET /api/admin/report/openings/:id
//
// Shows complete information about:
// - User
// - Login email
// - Card
// - Pack
// - Reveal
// - Sell
// - Shipping
// =====================================================

router.get(
  "/openings/:id",
  getOpeningDetails
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;