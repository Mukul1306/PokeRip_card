const express = require("express");

const {
  getAllPacks,
  getPackById,
  createPack,
  updatePack,
  updatePackStatus,
  deletePack,
} = require("../controllers/adminPackController");

const router = express.Router();

router.get("/", getAllPacks);

router.get("/:id", getPackById);

router.post("/", createPack);

router.patch("/:id", updatePack);

router.patch(
  "/:id/status",
  updatePackStatus
);

router.delete("/:id", deletePack);

module.exports = router;