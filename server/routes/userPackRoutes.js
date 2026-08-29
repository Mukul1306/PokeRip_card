const express = require("express");

const router = express.Router();

const {
  getPublishedPacks,
  getPackById,
} = require("../controllers/userPackController");


// =====================================================
// GET ALL PUBLISHED PACKS
// GET /api/user/packs
// =====================================================

router.get(
  "/",
  getPublishedPacks
);


// =====================================================
// GET SINGLE PUBLISHED PACK
// GET /api/user/packs/:packId
// =====================================================

router.get(
  "/:packId",
  getPackById
);


module.exports = router;