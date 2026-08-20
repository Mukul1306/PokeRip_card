const express = require("express");

const {
  createTestOrder,
} = require(
  "../controllers/orderController"
);

const router =
  express.Router();


// TEST PURCHASE

router.post(
  "/test",
  createTestOrder
);


module.exports = router;