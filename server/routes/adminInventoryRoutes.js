const express = require("express");
const multer = require("multer");

const router =
  express.Router();

const adminOnly =
  require("../middleware/adminOnly");

const {
  getInventory,
  getInventorySummary,
  getCardsForInventory,
  getInventoryCard,
  updateInventory,
  deleteInventory,
  scanAndAddCard,
} = require("../controllers/adminInventoryController");


// =====================================================
// MULTER
// =====================================================

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter:
      (req, file, cb) => {
        if (
          file.mimetype.startsWith(
            "image/"
          )
        ) {
          cb(null, true);
        } else {
          cb(
            new Error(
              "Only image files are allowed"
            )
          );
        }
      },
  });

// =====================================================
// GET INVENTORY
// GET /api/admin/inventory
// =====================================================

router.get(
  "/",
  adminOnly,
  getInventory
);

// =====================================================
// INVENTORY SUMMARY
// GET /api/admin/inventory/summary
// =====================================================

router.get(
  "/summary",
  adminOnly,
  getInventorySummary
);

// =====================================================
// CARDS FOR ADD INVENTORY
// GET /api/admin/inventory/cards
// =====================================================

router.get(
  "/cards",
  adminOnly,
  getCardsForInventory
);

// =====================================================
// GET SINGLE INVENTORY CARD
// GET /api/admin/inventory/card/:cardId
// =====================================================

router.get(
  "/card/:cardId",
  adminOnly,
  getInventoryCard
);

// =====================================================
// SCAN CARD IMAGE
// POST /api/admin/inventory/scan
//
// Form-data:
//
// cardImage = image
// tcgId = optional
// name = optional
// =====================================================

router.post(
  "/scan",
  adminOnly,
  upload.single(
    "cardImage"
  ),
  scanAndAddCard
);

// =====================================================
// UPDATE INVENTORY
// PUT /api/admin/inventory/:cardId
// =====================================================

router.put(
  "/:cardId",
  adminOnly,
  updateInventory
);

// =====================================================
// DELETE INVENTORY
// DELETE /api/admin/inventory/:cardId
// =====================================================

router.delete(
  "/:cardId",
  adminOnly,
  deleteInventory
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (
      error?.message ===
      "Only image files are allowed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    next(error);
  }
);

module.exports =
  router;