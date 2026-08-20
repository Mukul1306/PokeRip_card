const express = require("express");

const {
  getAllOrders,
  getOrderById,
} = require(
  "../controllers/orderController"
);

const router =
  express.Router();


router.get(
  "/",
  getAllOrders
);


router.get(
  "/:id",
  getOrderById
);


module.exports = router;