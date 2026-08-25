const express = require("express");

const router = express.Router();

const {
  getAdminReport,
} = require("../controllers/adminReportController");


// =====================================================
// ADMIN REPORT
// GET /api/admin/report
// =====================================================

router.get(
  "/",
  getAdminReport
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;