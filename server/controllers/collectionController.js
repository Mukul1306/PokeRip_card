const mongoose = require("mongoose");
const UserPack = require("../models/UserPack");


const getMyCollection = async (req, res) => {
  try {
    const userId = req.user.id;

    const userPacks = await UserPack.find({
      user: userId,
    })
      .populate({
        path: "pack",
        select: "name image price description cards",
      })
      .sort({ createdAt: -1 })
      .lean();

    const collection = userPacks.map((userPack) => {
      const pack = userPack.pack;

      // ---------------------------------------------
      // Calculate total cards inside the pack
      // ---------------------------------------------

      const totalCards = (pack?.cards || []).reduce(
        (total, cardItem) => {
          return total + Number(cardItem.quantity || 0);
        },
        0
      );

      // ---------------------------------------------
      // Cards already ripped
      // ---------------------------------------------

      const cardsRipped = Number(
        userPack.cardsRipped || 0
      );

      // ---------------------------------------------
      // Cards remaining
      // ---------------------------------------------

      const cardsRemaining = Math.max(
        totalCards - cardsRipped,
        0
      );

      // ---------------------------------------------
      // Status
      // ---------------------------------------------

      const status =
        cardsRemaining > 0
          ? "AVAILABLE"
          : "COMPLETED";

      return {
        _id: userPack._id,

        user: userPack.user,

        pack: {
          _id: pack?._id,
          name: pack?.name,
          image: pack?.image,
          price: pack?.price,
          description: pack?.description,
        },

        quantity: userPack.quantity,

        totalCards,

        cardsRipped,

        cardsRemaining,

        status,

        purchasedAt: userPack.purchasedAt,
      };
    });

    return res.status(200).json({
      success: true,

      data: {
        userPacks: collection,
      },
    });

  } catch (error) {
    console.error(
      "Collection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load collection",
    });
  }
};
// =====================================================
// GET ONE PURCHASED PACK
// GET /api/collection/:userPackId
// =====================================================

const getMyCollectionPack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userPackId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userPackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user pack ID",
      });
    }

    const userPack = await UserPack.findOne({
      _id: userPackId,
      user: userId,
    })
      .populate({
        path: "pack",
        select: "name image price description cards",
      })
      .lean();

    if (!userPack) {
      return res.status(404).json({
        success: false,
        message: "Purchased pack not found",
      });
    }

    const pack = userPack.pack;

    // Calculate total cards from Pack
    const totalCards = (pack?.cards || []).reduce(
      (total, cardItem) => {
        return total + Number(cardItem.quantity || 0);
      },
      0
    );

    const cardsRipped = Number(
      userPack.cardsRipped || 0
    );

    const cardsRemaining = Math.max(
      totalCards - cardsRipped,
      0
    );

    return res.status(200).json({
      success: true,

      data: {
        userPack: {
          ...userPack,

          cardsTotal: totalCards,
          cardsRipped,
          cardsRemaining,

          status:
            cardsRemaining > 0
              ? "AVAILABLE"
              : "COMPLETED",
        },
      },
    });
  } catch (error) {
    console.error(
      "Get collection pack error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load purchased pack",
    });
  }
};

module.exports = {
  getMyCollection,
  getMyCollectionPack,
};