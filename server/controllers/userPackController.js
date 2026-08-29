const mongoose = require("mongoose");

const Pack = require("../models/Pack");


// =====================================================
// GET ALL PUBLISHED PACKS
// GET /api/user/packs
// =====================================================

const getPublishedPacks = async (
  req,
  res
) => {
  try {
    const packs = await Pack.find({
      status: "PUBLISHED",
    })
      .populate("category")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,

      data: {
        packs,
      },
    });
  } catch (error) {
    console.error(
      "Get published packs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load packs",
    });
  }
};


// =====================================================
// GET SINGLE PACK
// GET /api/user/packs/:packId
// =====================================================

const getPackById = async (
  req,
  res
) => {
  try {
    const { packId } = req.params;

    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        packId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack =
      await Pack.findOne({
        _id: packId,
        status: "PUBLISHED",
      })
        .populate("category")
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
      },
    });
  } catch (error) {
    console.error(
      "Get pack by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load pack",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getPublishedPacks,
  getPackById,
};