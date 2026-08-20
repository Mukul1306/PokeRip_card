const express = require("express");

const {
  getUserPackById,
} = require(
  "../controllers/userPackController"
);

const router =
  express.Router();

router.get(
  "/:id",
  getUserPackById
);

module.exports = router;