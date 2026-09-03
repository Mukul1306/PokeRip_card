const express = require("express");

const {
  getAllOrders,
  getOrderStats,
  getOrderById,
} = require("../controllers/orderController");

const router = express.Router();

// GET ALL ORDERS
router.get(
  "/",
  getAllOrders
);

// GET ORDER STATISTICS
// IMPORTANT: keep this BEFORE /:id
router.get(
  "/stats",
  getOrderStats
);

// GET SINGLE ORDER
router.get(
  "/:id",
  getOrderById
);

module.exports = router;