const mongoose = require("mongoose");

const packCategorySchema = new mongoose.Schema(
  {
    // =========================================
    // CATEGORY NAME
    // =========================================
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // =========================================
    // SLUG
    // =========================================
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================================
    // DESCRIPTION
    // =========================================
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================
    // CATEGORY IMAGE
    // =========================================
    image: {
      type: String,
      default: "",
    },

    // =========================================
    // PRICE RANGE
    // =========================================
    minPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    maxPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // =========================================
    // STATUS
    // =========================================
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    // =========================================
    // DISPLAY ORDER
    // =========================================
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PackCategory",
  packCategorySchema
);