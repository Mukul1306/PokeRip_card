const mongoose = require("mongoose");

const cardInventorySchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
      unique: true,
      index: true,
    },

    available: {
      type: Number,
      default: 0,
      min: 0,
    },

    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },

    consumed: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "OUT_OF_STOCK"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);


// Automatically update inventory status

cardInventorySchema.pre("save", function () {
  this.available = Math.max(
    0,
    this.available
  );

  this.reserved = Math.max(
    0,
    this.reserved
  );

  this.consumed = Math.max(
    0,
    this.consumed
  );

  this.status =
    this.available > 0
      ? "ACTIVE"
      : "OUT_OF_STOCK";
});


module.exports = mongoose.model(
  "CardInventory",
  cardInventorySchema
);