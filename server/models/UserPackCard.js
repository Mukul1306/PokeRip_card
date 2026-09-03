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
    // =================================================

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // SHIPPING ADDRESS
    // =================================================
    //
    // This is saved when the user selects SHIP.
    //
    // Example:
    //
    // shippingAddress: {
    //   fullName: "Shubham Sharma",
    //   email: "example@gmail.com",
    //   phone: "9876543210",
    //   addressLine1: "123 Main Street",
    //   addressLine2: "Near ABC School",
    //   city: "Jaipur",
    //   state: "Rajasthan",
    //   postalCode: "302001",
    //   country: "India"
    // }
    //
    // =================================================

    shippingAddress: {

      fullName: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      addressLine1: {
        type: String,
        default: "",
        trim: true,
      },

      addressLine2: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      postalCode: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },

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

// Quickly find user's cards by status

userPackCardSchema.index({
  user: 1,
  status: 1,
});


// =====================================================
// EXPIRY INDEX
// =====================================================

// Used by the 5-minute automatic sell scheduler

userPackCardSchema.index({
  status: 1,
  decisionDeadline: 1,
});


// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.model(
    "UserPackCard",
    userPackCardSchema
  );