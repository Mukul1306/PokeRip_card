const express = require("express");

const {
  createOrder,
  createTestOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/auth");

const router = express.Router();


// =====================================================
// REAL PACK PURCHASE
// POST /api/orders
// =====================================================

router.post(
  "/",
  protect,
  createOrder
);


// =====================================================
// TEST PURCHASE
// POST /api/orders/test
// =====================================================

router.post(
  "/test",
  protect,
  createTestOrder
);


module.exports = router;