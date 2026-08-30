const mongoose = require("mongoose");

const userPackSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // PACK
    // =====================================================

    pack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pack",
      required: true,
    },

    // =====================================================
    // NUMBER OF PACKS PURCHASED
    // =====================================================

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // =====================================================
    // TOTAL CARDS AVAILABLE
    // =====================================================

    cardsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // CARDS STILL AVAILABLE TO RIP
    // =====================================================

    cardsRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // CARDS ALREADY REVEALED
    // =====================================================

    cardsRipped: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // USER PACK STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "COMPLETED",
      ],
      default: "AVAILABLE",
    },

    // =====================================================
    // PURCHASE DATE
    // =====================================================

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "UserPack",
  userPackSchema
);