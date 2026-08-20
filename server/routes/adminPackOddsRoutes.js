const express = require("express");

const {
  getPackOdds,
  updatePackOdds,
} = require("../controllers/adminPackOddsController");

const router = express.Router();

router.get(
  "/:packId",
  getPackOdds
);

router.patch(
  "/:packId",
  updatePackOdds
);

module.exports = router;