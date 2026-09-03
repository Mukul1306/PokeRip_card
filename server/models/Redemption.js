const mongoose = require("mongoose");


// =====================================================
// REDEMPTION SCHEMA
//
// A redemption represents a user's request to receive
// a revealed physical card.
//
// FLOW:
//
// PENDING
//    ↓
// APPROVED
//
// OR
//
// PENDING
//    ↓
// REJECTED
//
// After APPROVED, the redemption is handed over to
// the Shipping module.
// =====================================================

const redemptionSchema = new mongoose.Schema(
  {
    // =================================================
    // REDEMPTION NUMBER
    // =================================================

    redemptionNumber: {
      type: String,
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
    // This is the actual card the user revealed.
    // =================================================

    userPackCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPackCard",
      required: true,
      unique: true,
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
    // Store the value at the time of redemption.
    // =================================================

    marketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },


    // =================================================
    // SHIPPING FEE
    // =================================================

    shippingFee: {
      type: Number,
      min: 0,
      default: 0,
    },


    // =================================================
    // SHIPPING ADDRESS
    //
    // Snapshot of the address at the time of
    // redemption.
    //
    // We keep a copy here even though UserPackCard
    // also contains the address.
    //
    // This prevents the redemption history from
    // changing if the user later changes their
    // profile/address.
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
    // REDEMPTION STATUS
    //
    // IMPORTANT:
    //
    // Redemption only handles the user's request and
    // admin approval.
    //
    // Shipping has its own status system.
    // =================================================

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


    // =================================================
    // REJECTION REASON
    // =================================================

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },


    // =================================================
    // ADMIN WHO PROCESSED REQUEST
    // =================================================

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    // =================================================
    // PROCESSED TIME
    // =================================================

    processedAt: {
      type: Date,
      default: null,
    },


    // =================================================
    // SHIPPING REFERENCE
    //
    // After redemption is approved, the Shipping
    // module can create a shipment and store its ID.
    // =================================================

    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
      index: true,
    },


    // =================================================
    // COMPLETION TIME
    //
    // Optional. This can be used later when the
    // shipment is delivered.
    // =================================================

    completedAt: {
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


// Find user's redemptions quickly

redemptionSchema.index({
  user: 1,
  status: 1,
});


// Admin filtering

redemptionSchema.index({
  status: 1,
  createdAt: -1,
});


// Card history

redemptionSchema.index({
  card: 1,
  createdAt: -1,
});


// User card history

redemptionSchema.index({
  userPackCard: 1,
});


// =====================================================
// AUTOMATIC REDEMPTION NUMBER
// =====================================================

redemptionSchema.pre(
  "save",
  function () {
    if (!this.redemptionNumber) {
      this.redemptionNumber =
        "RED-" +
        Date.now() +
        "-" +
        Math.floor(
          1000 +
            Math.random() *
              9000
        );
    }
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "Redemption",
    redemptionSchema
  );