const mongoose = require("mongoose");
const Pack = require("../models/Pack");

// =====================================================
// GET USER PACK DETAILS
// GET /api/user/packs/:id
// =====================================================

const getUserPackById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack = await Pack.findOne({
      _id: id,
      status: "PUBLISHED",
    })
      .populate(
        "category",
        "name slug image"
      )
      .lean();

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        pack,

        // Wallet will be connected later
        walletBalance: 0,
      },
    });

  } catch (error) {

    console.error(
      "Get user pack error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUserPackById,
};