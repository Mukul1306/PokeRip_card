const express = require("express");

const {
  getUserDashboard,
} = require("../controllers/userDashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getUserDashboard
);

module.exports = router;