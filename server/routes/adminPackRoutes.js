const express = require("express");

const upload = require("../middleware/upload");

const {
  getAllPacks,
  getPackById,
  createPack,
  updatePack,
  updatePackStatus,
  deletePack,
} = require("../controllers/adminPackController");

const router = express.Router();

// =====================================================
// GET ALL PACKS
// GET /api/admin/packs
// =====================================================

router.get(
  "/",
  getAllPacks
);

// =====================================================
// GET PACK BY ID
// GET /api/admin/packs/:id
// =====================================================

router.get(
  "/:id",
  getPackById
);

// =====================================================
// CREATE PACK + IMAGE UPLOAD
// POST /api/admin/packs
// =====================================================

router.post(
  "/",
  upload.single("image"),
  createPack
);

// =====================================================
// UPDATE PACK + IMAGE UPLOAD
// PATCH /api/admin/packs/:id
// =====================================================

router.patch(
  "/:id",
  upload.single("image"),
  updatePack
);

// =====================================================
// UPDATE PACK STATUS
//
// PATCH /api/admin/packs/:id/status
//
// Body:
// {
//   "status": "ARCHIVED"
// }
//
// OR
//
// {
//   "status": "PUBLISHED"
// }
//
// Used for:
// DRAFT
// PUBLISHED
// PAUSED
// ARCHIVED
// =====================================================

router.patch(
  "/:id/status",
  updatePackStatus
);

// =====================================================
// PERMANENTLY DELETE PACK
//
// DELETE /api/admin/packs/:id
//
// IMPORTANT:
// This is now a REAL DELETE.
// Archive / Unarchive will use the status endpoint above.
// =====================================================

router.delete(
  "/:id",
  deletePack
);

module.exports = router;