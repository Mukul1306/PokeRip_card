const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
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
    // TRANSACTION TYPE
    // =====================================================

    type: {
      type: String,

      enum: [
        // Money added to user's wallet
        "DEPOSIT",

        // Money removed from user's wallet
        "WITHDRAWAL",

        // Pack purchase
        "PURCHASE",

        // User sells revealed card
        // User receives 80% of card value
        "SELL",

        // Platform/admin receives 20% fee
        "ADMIN_FEE",

        // User pays $5 shipping fee
        "SHIPPING",
      ],

      required: true,

      index: true,
    },

    // =====================================================
    // AMOUNT
    // =====================================================

    amount: {
      type: Number,

      required: true,

      min: 0.01,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,

      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],

      default: "PENDING",

      index: true,
    },

    // =====================================================
    // NOTE
    // =====================================================

    note: {
      type: String,

      default: "",

      trim: true,
    },

    // =====================================================
    // REJECTION REASON
    // =====================================================

    rejectionReason: {
      type: String,

      default: null,
    },

    // =====================================================
    // PROCESSED BY ADMIN
    // =====================================================

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },

    // =====================================================
    // PROCESSED TIME
    // =====================================================

    processedAt: {
      type: Date,

      default: null,
    },

    // =====================================================
    // OPTIONAL REFERENCE
    //
    // Useful for connecting transaction to:
    // - UserPackCard
    // - Order
    // - UserPack
    // =====================================================

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,

      default: null,
      index: true,
    },

    // =====================================================
    // REFERENCE TYPE
    // =====================================================

    referenceType: {
      type: String,

      enum: [
        "UserPackCard",
        "Order",
        "UserPack",
        null,
      ],

      default: null,
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
  "WalletTransaction",
  walletTransactionSchema
);