const express = require("express");

const {
  ripCard,
  sellCard,
  shipCard,
} = require("../controllers/ripController");

const protect = require("../middleware/auth");

const router = express.Router();

// =====================================================
// RIP ONE CARD
// POST /api/rip/:userPackId
// =====================================================

router.post(
  "/:userPackId",
  protect,
  ripCard
);

// =====================================================
// SELL / RIP IT
// POST /api/rip/:userPackId/sell
// =====================================================

router.post(
  "/:userPackId/sell",
  protect,
  sellCard
);

// =====================================================
// SHIP CARD
// POST /api/rip/:userPackId/ship
// =====================================================

router.post(
  "/:userPackId/ship",
  protect,
  shipCard
);

module.exports = router;