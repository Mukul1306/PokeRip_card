const mongoose = require("mongoose");

const userPackCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userPack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPack",
      required: true,
      index: true,
    },

    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    // Price fetched when the card is revealed
    marketPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // What happened to this card
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

    revealedAt: {
      type: Date,
      default: Date.now,
    },

    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "UserPackCard",
  userPackCardSchema
);