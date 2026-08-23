const mongoose = require("mongoose");

const userPackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pack",
      required: true,
    },

    // Number of packs purchased
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Total cards available inside this purchased pack
    cardsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Cards still available to rip
    cardsRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Cards already revealed
    cardsRipped: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "COMPLETED"],
      default: "AVAILABLE",
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPack", userPackSchema);