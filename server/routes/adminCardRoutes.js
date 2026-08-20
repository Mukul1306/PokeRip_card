const express = require("express");

const {
  searchCards,
  addCard,
  getSavedCards,
  getCardById,
  deleteCard,
} = require("../controllers/adminCardController");

const router = express.Router();

router.get("/search", searchCards);

router.get("/", getSavedCards);

router.post("/", addCard);

router.get("/:id", getCardById);

router.delete("/:id", deleteCard);

module.exports = router;