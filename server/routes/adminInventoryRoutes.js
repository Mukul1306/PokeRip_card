const express = require("express");
const multer = require("multer");

const router = express.Router();

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
  getPokeWalletImage,
  refreshCardPrice,

  // =====================================================
  // CATEGORY CONTROLLERS
  // =====================================================
  getInventoryCategories,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} = require("../controllers/adminInventoryController");

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedImage =
      file.mimetype.startsWith("image/");

    const allowedSpreadsheet = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ].includes(file.mimetype);

    if (
      allowedImage ||
      allowedSpreadsheet
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image, CSV, XLS, and XLSX files are allowed"
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
// =====================================================
// INVENTORY CATEGORIES
// =====================================================
// =====================================================

// GET ALL CATEGORIES
// GET /api/admin/inventory/categories
//
// Used for:
// - Category cards
// - Category name
// - Min price
// - Max price
// - Total cards
// =====================================================

router.get(
  "/categories",
  adminOnly,
  getInventoryCategories
);

// =====================================================
// CREATE NEW CATEGORY
// POST /api/admin/inventory/categories
//
// Body:
// {
//   "name": "Gold",
//   "slug": "gold",
//   "description": "Gold category",
//   "image": "",
//   "minPrice": 20,
//   "maxPrice": 50,
//   "status": "ACTIVE",
//   "sortOrder": 4
// }
// =====================================================

router.post(
  "/categories",
  adminOnly,
  createInventoryCategory
);

// =====================================================
// UPDATE CATEGORY
// PUT /api/admin/inventory/categories/:categoryId
//
// Body can contain:
// {
//   "name": "Gold",
//   "slug": "gold",
//   "description": "...",
//   "image": "",
//   "minPrice": 20,
//   "maxPrice": 50,
//   "status": "ACTIVE",
//   "sortOrder": 4
// }
// =====================================================

router.put(
  "/categories/:categoryId",
  adminOnly,
  updateInventoryCategory
);

// =====================================================
// DELETE CATEGORY
// DELETE /api/admin/inventory/categories/:categoryId
// =====================================================

router.delete(
  "/categories/:categoryId",
  adminOnly,
  deleteInventoryCategory
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
// GET POKEWALLET CARD IMAGE
// GET /api/admin/inventory/image/:id
// =====================================================

router.get(
  "/image/:id",
  getPokeWalletImage
);

// =====================================================
// SCAN / IMPORT CARD
// POST /api/admin/inventory/scan
//
// Supports:
// - Single image
// - Folder of images
// - CSV
// - XLS
// - XLSX
// =====================================================

router.post(
  "/scan",
  adminOnly,

  upload.fields([
    {
      name: "cardImage",
      maxCount: 1,
    },
    {
      name: "cardFile",
      maxCount: 1,
    },
  ]),

  (req, res, next) => {

    // =================================================
    // IMAGE
    // =================================================

    if (
      req.files?.cardImage?.length
    ) {
      req.file =
        req.files.cardImage[0];

      req.uploadType =
        "image";
    }

    // =================================================
    // CSV / EXCEL
    // =================================================

    else if (
      req.files?.cardFile?.length
    ) {
      req.file =
        req.files.cardFile[0];

      req.uploadType =
        "spreadsheet";
    }

    // =================================================
    // NO FILE
    // =================================================

    else {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a card image, CSV, or Excel file.",
      });
    }

    next();
  },

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
// REFRESH CARD PRICE
// POST /api/admin/inventory/:cardId/refresh-price
// =====================================================

router.post(
  "/:cardId/refresh-price",
  adminOnly,
  refreshCardPrice
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

    // =================================================
    // MULTER ERROR
    // =================================================

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

    // =================================================
    // INVALID FILE TYPE
    // =================================================

    if (
      error?.message ===
      "Only image, CSV, XLS, and XLSX files are allowed"
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

// =====================================================
// EXPORT
// =====================================================

module.exports = router;