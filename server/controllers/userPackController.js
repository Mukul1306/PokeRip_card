const mongoose = require("mongoose");

const Pack = require("../models/Pack");
const CardInventory = require("../models/CardInventory");

// =====================================================
// GET ALL PUBLISHED PACKS
// GET /api/user/packs
// =====================================================

const getPublishedPacks = async (req, res) => {
  try {
    const packs = await Pack.find({
      status: "PUBLISHED",
    })
      .populate("category")
      .populate(
        "cards.card",
        "name tcgId imageSmall imageLarge set rarity number price priceCurrency priceSource priceLastUpdated"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    // =================================================
    // CHECK INVENTORY FOR EACH PACK
    // =================================================

    const packsWithInventory = await Promise.all(
      packs.map(async (pack) => {
        if (!pack.cards || pack.cards.length === 0) {
          return {
            ...pack,
            inventory: {
              available: false,
              availableCards: 0,
              requiredCards: 0,
            },
          };
        }

        const cardIds = pack.cards
          .map((packCard) => packCard.card?._id)
          .filter(Boolean);

        const inventoryRecords =
          await CardInventory.find({
            card: {
              $in: cardIds,
            },
          }).lean();

        const inventoryMap = new Map(
          inventoryRecords.map((item) => [
            item.card.toString(),
            Number(item.available || 0),
          ])
        );

        // ---------------------------------------------
        // Calculate how many cards are actually available
        // ---------------------------------------------

        let availableCards = 0;
        let requiredCards = 0;

        for (const packCard of pack.cards) {
          const quantity = Number(
            packCard.quantity || 1
          );

          requiredCards += quantity;

          const cardId =
            packCard.card?._id?.toString();

          const available =
            inventoryMap.get(cardId) || 0;

          availableCards += Math.min(
            available,
            quantity
          );
        }

        const inventoryAvailable =
          availableCards >= requiredCards;

        return {
          ...pack,

          inventory: {
            available: inventoryAvailable,
            availableCards,
            requiredCards,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,

      data: {
        packs: packsWithInventory,
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

const getPackById = async (req, res) => {
  try {
    const { packId } = req.params;

    // =================================================
    // VALIDATE OBJECT ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(packId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    // =================================================
    // GET PACK
    // =================================================

    const pack =
      await Pack.findOne({
        _id: packId,
        status: "PUBLISHED",
      })
        .populate("category")
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number price priceCurrency priceSource priceLastUpdated"
        )
        .lean();

    // =================================================
    // PACK NOT FOUND
    // =================================================

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    // =================================================
    // GET PACK CARD IDS
    // =================================================

    const cardIds = (pack.cards || [])
      .map((packCard) => {
        return packCard.card?._id;
      })
      .filter(Boolean);

    // =================================================
    // NO CARDS IN PACK
    // =================================================

    if (cardIds.length === 0) {
      return res.status(200).json({
        success: true,

        data: {
          pack,

          inventory: {
            available: false,
            availableCards: 0,
            requiredCards: 0,
            cards: [],
          },
        },
      });
    }

    // =================================================
    // GET INVENTORY
    // =================================================

    const inventoryRecords =
      await CardInventory.find({
        card: {
          $in: cardIds,
        },
      })
        .populate(
          "card",
          "name tcgId imageSmall imageLarge set rarity number price priceCurrency priceSource priceLastUpdated"
        )
        .lean();

    // =================================================
    // CREATE INVENTORY MAP
    // =================================================

    const inventoryMap = new Map();

    for (const inventory of inventoryRecords) {
      if (!inventory.card) {
        continue;
      }

      inventoryMap.set(
        inventory.card._id.toString(),
        inventory
      );
    }

    // =================================================
    // CHECK EACH PACK CARD
    // =================================================

    let availableCards = 0;
    let requiredCards = 0;

    const inventoryDetails = [];

    for (const packCard of pack.cards || []) {
      const quantity = Number(
        packCard.quantity || 1
      );

      requiredCards += quantity;

      const cardId =
        packCard.card?._id?.toString();

      const inventory =
        inventoryMap.get(cardId);

      const available = Number(
        inventory?.available || 0
      );

      const cardAvailable =
        available >= quantity;

      if (cardAvailable) {
        availableCards += quantity;
      } else {
        availableCards += Math.min(
          available,
          quantity
        );
      }

      inventoryDetails.push({
        card: packCard.card,

        required: quantity,

        available,

        reserved: Number(
          inventory?.reserved || 0
        ),

        consumed: Number(
          inventory?.consumed || 0
        ),

        availableForPack:
          cardAvailable,
      });
    }

    // =================================================
    // FINAL INVENTORY STATUS
    // =================================================

    const inventoryAvailable =
      availableCards >= requiredCards;

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        pack,

        inventory: {
          available: inventoryAvailable,

          availableCards,

          requiredCards,

          cards: inventoryDetails,
        },
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