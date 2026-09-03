const mongoose = require("mongoose");

// =====================================================
// SHIPMENT SCHEMA
//
// A Shipment represents the physical delivery of a
// card after a Redemption has been approved.
//
// FLOW:
//
// REDEMPTION
//     ↓
// APPROVED
//     ↓
// SHIPMENT CREATED
//     ↓
// READY_TO_SHIP
//     ↓
// PROCESSING
//     ↓
// PACKED
//     ↓
// SHIPPED
//     ↓
// DELIVERED
//
// OR:
//
// DELIVERY_FAILED
// CANCELLED
// =====================================================

const shipmentSchema = new mongoose.Schema(
  {
    // =================================================
    // SHIPMENT NUMBER
    // =================================================

    shipmentNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // =================================================
    // REDEMPTION
    //
    // The redemption that created this shipment.
    // =================================================

    redemption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Redemption",
      required: true,
      unique: true,
      index: true,
    },

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
    // USER PACK CARD
    //
    // Actual revealed card being shipped.
    // =================================================

    userPackCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPackCard",
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
    // PACK
    // =================================================

    pack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pack",
      required: true,
    },

    // =================================================
    // CARD MARKET PRICE
    //
    // Snapshot of card value at shipment creation.
    // =================================================

    marketPrice: {
      type: Number,
      default: 0,
      min: 0,
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
    //
    // Snapshot from Redemption.
    // =================================================

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine2: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },

    // =================================================
    // SHIPMENT STATUS
    // =================================================

    status: {
      type: String,

      enum: [
        "READY_TO_SHIP",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "DELIVERY_FAILED",
        "CANCELLED",
      ],

      default: "READY_TO_SHIP",

      index: true,
    },

    // =================================================
    // CARRIER
    // =================================================

    carrier: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // TRACKING NUMBER
    // =================================================

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // =================================================
    // TRACKING URL
    // =================================================

    trackingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // SHIPPING NOTES
    // =================================================

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // ADMIN WHO PROCESSED SHIPMENT
    // =================================================

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =================================================
    // PROCESSING TIME
    // =================================================

    processingAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // PACKED TIME
    // =================================================

    packedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // SHIPPED TIME
    // =================================================

    shippedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // ESTIMATED DELIVERY DATE
    // =================================================

    estimatedDeliveryAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // DELIVERED TIME
    // =================================================

    deliveredAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // DELIVERY FAILED TIME
    // =================================================

    deliveryFailedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // DELIVERY FAILURE REASON
    // =================================================

    failureReason: {
      type: String,
      default: null,
      trim: true,
    },

    // =================================================
    // CANCELLED TIME
    // =================================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // CANCELLATION REASON
    // =================================================

    cancellationReason: {
      type: String,
      default: null,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);


// =====================================================
// INDEXES
// =====================================================

// Admin shipping table

shipmentSchema.index({
  status: 1,
  createdAt: -1,
});


// User shipment history

shipmentSchema.index({
  user: 1,
  createdAt: -1,
});


// Carrier + tracking lookup

shipmentSchema.index({
  carrier: 1,
  trackingNumber: 1,
});


// Card shipment history

shipmentSchema.index({
  card: 1,
  createdAt: -1,
});


// =====================================================
// AUTOMATIC SHIPMENT NUMBER
// =====================================================

shipmentSchema.pre(
  "save",
  function () {
    if (!this.shipmentNumber) {
      this.shipmentNumber =
        "SHP-" +
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
    "Shipment",
    shipmentSchema
  );