const express = require("express");

const {
  ripCard,
  sellCard,
  shipCard,
} = require("../controllers/ripController");

const protect =
  require("../middleware/auth");

const router =
  express.Router();


// =====================================================
// RIP ONE CARD
//
// POST /api/rip/:userPackId
//
// Example:
// POST /api/rip/64abc123...
//
// Purpose:
// - Reveal one card
// - Decrease cardsRemaining
// - Create UserPackCard
// - Start 5-minute decision timer
// =====================================================

router.post(
  "/:userPackId",
  protect,
  ripCard
);


// =====================================================
// SELL / RIP IT
//
// POST /api/rip/:userPackId/sell
//
// Example:
// POST /api/rip/64abc123.../sell
//
// Purpose:
// - Sell revealed card
// - User receives 80%
// - Platform receives 20%
// - Card is returned to inventory
// - UserPackCard status becomes SOLD
// =====================================================

router.post(
  "/:userPackId/sell",
  protect,
  sellCard
);


// =====================================================
// SHIP CARD
//
// POST /api/rip/:userPackId/ship
//
// Example:
// POST /api/rip/64abc123.../ship
//
// Purpose:
// - User chooses to ship card
// - Charge $5 shipping fee
// - Save shipping address
// - Card status becomes SHIPPING
// - Card is NOT returned to inventory
// =====================================================

router.post(
  "/:userPackId/ship",
  protect,
  shipCard
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;