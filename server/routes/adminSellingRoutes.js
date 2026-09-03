const express = require("express");

const {
  getSoldCards,
} = require("../controllers/adminSellingController");

const protect = require("../middleware/auth");

const router = express.Router();


// =====================================================
// ADMIN SELLING / SALES
// =====================================================
//
// GET /api/admin/sales
//
// Supported:
//
// /api/admin/sales?preset=today
//
// /api/admin/sales?preset=month
//
// /api/admin/sales?preset=all
//
// /api/admin/sales?preset=custom
// &from=2026-09-01
// &to=2026-09-10
//
// /api/admin/sales?search=charizard
//
// /api/admin/sales?preset=all&page=1&limit=20
//
// =====================================================


// =====================================================
// GET SOLD CARDS
// =====================================================

router.get(
  "/",
  protect,
  getSoldCards
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;