const mongoose = require("mongoose");

const packCardSchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    // Probability weight used later by the
    // backend reveal algorithm.
    pullWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    // Number of copies available for this pack.
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const packSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackCategory",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cards: {
      type: [packCardSchema],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "PAUSED",
        "ARCHIVED",
      ],
      default: "DRAFT",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pack", packSchema);