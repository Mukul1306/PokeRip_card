const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // USER INFORMATION
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // USER ROLE
    // =========================
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    // =========================
    // KYC
    // =========================
    kyc: {
      status: {
        type: String,
        enum: [
          "NOT_STARTED",
          "PENDING",
          "VERIFIED",
          "REJECTED",
          "REQUIRES_RETRY",
        ],
        default: "NOT_STARTED",
      },

      provider: {
        type: String,
        enum: ["PERSONA"],
        default: "PERSONA",
      },

      inquiryId: {
        type: String,
        default: null,
      },

      verificationId: {
        type: String,
        default: null,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },

      rejectionReason: {
        type: String,
        default: null,
      },
    },

    // =========================
    // PASSWORD RESET
    // =========================
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // =========================
    // ACCOUNT STATUS
    // =========================
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);