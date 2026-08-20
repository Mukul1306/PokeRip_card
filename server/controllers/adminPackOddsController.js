const mongoose = require("mongoose");
const Pack = require("../models/Pack");

// =====================================================
// GET ODDS FOR A PACK
// GET /api/admin/odds/:packId
// =====================================================

const getPackOdds = async (req, res) => {
  try {
    const { packId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack = await Pack.findById(packId)
      .populate(
        "category",
        "name slug"
      )
      .populate(
        "cards.card",
        "name tcgId imageSmall imageLarge set rarity number"
      );

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    const totalWeight = pack.cards.reduce(
      (total, item) =>
        total + Number(item.pullWeight || 0),
      0
    );

    const cards = pack.cards.map((item) => {
      const weight = Number(
        item.pullWeight || 0
      );

      const chance =
        totalWeight > 0
          ? (weight / totalWeight) * 100
          : 0;

      return {
        card: item.card,
        pullWeight: weight,
        quantity: item.quantity || 0,
        chance: Number(chance.toFixed(4)),
      };
    });

    return res.status(200).json({
      success: true,

      data: {
        pack: {
          _id: pack._id,
          name: pack.name,
          price: pack.price,
          status: pack.status,
          category: pack.category,
        },

        cards,

        totalWeight,

        totalChance:
          totalWeight > 0 ? 100 : 0,
      },
    });
  } catch (error) {
    console.error(
      "Get pack odds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE ODDS
// PATCH /api/admin/odds/:packId
// =====================================================

const updatePackOdds = async (req, res) => {
  try {
    const { packId } = req.params;
    const { cards } = req.body;

    if (!mongoose.Types.ObjectId.isValid(packId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    if (!Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: "Cards must be an array",
      });
    }

    const pack = await Pack.findById(packId);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    // ---------------------------------------------
    // Make sure cards belong to this pack
    // ---------------------------------------------

    const existingCardIds =
      pack.cards.map((item) =>
        item.card.toString()
      );

    for (const item of cards) {
      if (
        !mongoose.Types.ObjectId.isValid(
          item.card
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid card ID",
        });
      }

      if (
        !existingCardIds.includes(
          item.card.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Card does not belong to this pack",
        });
      }

      const weight = Number(
        item.pullWeight
      );

      if (
        !Number.isFinite(weight) ||
        weight < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Pull weight must be 0 or greater",
        });
      }
    }

    // ---------------------------------------------
    // Update weights
    // ---------------------------------------------

    const updatedCards =
      pack.cards.map((packCard) => {
        const incoming = cards.find(
          (item) =>
            item.card.toString() ===
            packCard.card.toString()
        );

        if (!incoming) {
          return packCard;
        }

        packCard.pullWeight =
          Number(
            incoming.pullWeight
          );

        return packCard;
      });

    pack.cards = updatedCards;

    await pack.save();

    const populatedPack =
      await Pack.findById(pack._id)
        .populate(
          "category",
          "name slug"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number"
        );

    const totalWeight =
      populatedPack.cards.reduce(
        (total, item) =>
          total +
          Number(
            item.pullWeight || 0
          ),
        0
      );

    return res.status(200).json({
      success: true,

      message:
        "Pack odds updated successfully",

      data: {
        pack: populatedPack,

        totalWeight,

        totalChance:
          totalWeight > 0 ? 100 : 0,
      },
    });
  } catch (error) {
    console.error(
      "Update pack odds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getPackOdds,
  updatePackOdds,
};