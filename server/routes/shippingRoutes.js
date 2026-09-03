const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth");

const {
  getShipments,
  getShipmentStats,
  getShipmentById,
  updateShipment,
  createShipmentFromRedemption,
  approveShippingRequest,
  rejectShippingRequest,
  cancelShipment,
} = require("../controllers/shippingController");

// Get shipments / pending shipping requests
router.get("/", protect, getShipments);

// Shipping statistics
router.get("/stats", protect, getShipmentStats);

// Create shipment from approved redemption
router.post(
  "/from-redemption/:redemptionId",
  protect,
  createShipmentFromRedemption
);

// Approve shipping request
router.patch(
  "/:id/approve",
  protect,
  approveShippingRequest
);

// Reject shipping request + refund shipping fee
router.patch(
  "/:id/reject",
  protect,
  rejectShippingRequest
);

// Get shipment/request details
router.get(
  "/:id",
  protect,
  getShipmentById
);

// Update shipment status/tracking/etc.
router.patch(
  "/:id",
  protect,
  updateShipment
);

// Cancel shipment
router.patch(
  "/:id/cancel",
  protect,
  cancelShipment
);

module.exports = router;