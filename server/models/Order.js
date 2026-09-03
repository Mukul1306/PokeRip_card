const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
    // USER PACK
    //
    // The UserPack created from this specific order.
    //
    // This allows us to connect:
    //
    // ORDER
    //   ↓
    // USER PACK
    //   ↓
    // USER PACK CARD
    //   ↓
    // ACTUAL REVEALED CARD
    //
    // This is important when the same user purchases
    // the same pack multiple times.
    // =====================================================

    userPack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPack",
      default: null,
      index: true,
    },

    // =====================================================
    // QUANTITY
    // =====================================================

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // =====================================================
    // ORDER AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================================
    // CURRENCY
    // =====================================================

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    paymentMethod: {
      type: String,

      enum: [
        "TEST",
        "STRIPE",
        "WALLET",
      ],

      default: "TEST",
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    paymentStatus: {
      type: String,

      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],

      default: "PENDING",
    },

    // =====================================================
    // ORDER STATUS
    // =====================================================

    orderStatus: {
      type: String,

      enum: [
        "PENDING",
        "COMPLETED",
        "CANCELLED",
      ],

      default: "PENDING",
    },

    // =====================================================
    // ORDER NUMBER
    // =====================================================

    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);


// =====================================================
// GENERATE ORDER NUMBER AUTOMATICALLY
// =====================================================

orderSchema.pre(
  "save",
  function () {

    if (!this.orderNumber) {

      this.orderNumber =
        "ORD-" +
        Date.now() +
        "-" +
        Math.floor(
          1000 +
          Math.random() * 9000
        );

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );