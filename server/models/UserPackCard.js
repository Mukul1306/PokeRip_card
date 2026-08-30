const mongoose = require("mongoose");

// =====================================================
// USER PACK CARD SCHEMA
// =====================================================

const userPackCardSchema = new mongoose.Schema(
  {
    // =================================================
    // USER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // USER PACK
    // =================================================

    userPack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPack",
      required: true,
      index: true,
    },

    // =================================================
    // CARD
    // =================================================

    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    // =================================================
    // MARKET PRICE
    // Price when card is revealed
    // =================================================

    marketPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // CARD STATUS
    // =================================================

    status: {
      type: String,

      enum: [
        "REVEALED",
        "SOLD",
        "SHIPPING",
        "SHIPPED",
      ],

      default: "REVEALED",
    },

    // =================================================
    // CARD REVEAL TIME
    // =================================================

    revealedAt: {
      type: Date,
      default: Date.now,
    },

    // =================================================
    // 5-MINUTE DECISION DEADLINE
    //
    // User has 5 minutes to choose:
    //
    // SELL
    // OR
    // SHIP
    //
    // After this time the card should automatically
    // be sold and the money credited to the wallet.
    // =================================================

    decisionDeadline: {
      type: Date,
      required: true,
      index: true,
    },

    // =================================================
    // SOLD TIME
    // =================================================

    soldAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // SHIPPING FEE
    //
    // Store the fee charged when user chooses SHIP.
    // Default is 0 because the fee is only charged
    // when shipping is selected.
    // =================================================

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // SHIPPING TIME
    // =================================================

    shippedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Quickly find cards waiting for SELL / SHIP decision
userPackCardSchema.index({
  user: 1,
  status: 1,
});

// Useful for the automatic 5-minute expiry scheduler
userPackCardSchema.index({
  status: 1,
  decisionDeadline: 1,
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "UserPackCard",
  userPackCardSchema
);