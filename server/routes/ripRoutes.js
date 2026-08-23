const express = require("express");

const {
  ripCard,
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

module.exports = router;