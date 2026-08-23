const express = require("express");

const {
  getMyCollection,
  getMyCollectionPack,
} = require("../controllers/collectionController");

const protect = require("../middleware/auth");

const router = express.Router();

// All purchased packs
router.get(
  "/",
  protect,
  getMyCollection
);

// One purchased pack
router.get(
  "/:userPackId",
  protect,
  getMyCollectionPack
);

module.exports = router;