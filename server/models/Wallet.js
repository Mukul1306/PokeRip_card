const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      default: "Wallet transaction",
    },

    reference: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    transactions: [
      walletTransactionSchema,
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Wallet",
  walletSchema
);