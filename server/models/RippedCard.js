const mongoose = require("mongoose");

const rippedCardSchema = new mongoose.Schema(
  {
    // User who owns the revealed card
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Purchased UserPack
    userPack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPack",
      required: true,
      index: true,
    },

    // Original card from Pack
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    // Price/value when the card was revealed
    marketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    // What the user decides to do with the card
    action: {
      type: String,
      enum: ["PENDING", "SELL", "SHIP"],
      default: "PENDING",
    },

    // Amount user receives when selling
    sellAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Admin's 20% share
    adminAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Shipping fee
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Shipping address if user chooses SHIP
    shippingAddress: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      postalCode: {
        type: String,
        default: "",
      },
    },

    // Shipping status
    shippingStatus: {
      type: String,
      enum: [
        "NOT_REQUIRED",
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "NOT_REQUIRED",
    },

    // When the card was sold
    soldAt: {
      type: Date,
      default: null,
    },

    // When the card was shipped
    shippedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RippedCard",
  rippedCardSchema
);