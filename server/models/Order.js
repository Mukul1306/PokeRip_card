const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["TEST", "STRIPE"],
      default: "TEST",
    },

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

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

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


// Generate order number automatically

orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    this.orderNumber =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(
        1000 + Math.random() * 9000
      );
  }
});


module.exports = mongoose.model(
  "Order",
  orderSchema
);