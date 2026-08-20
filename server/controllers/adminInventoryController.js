const mongoose = require("mongoose");
const axios = require("axios");

const CardInventory = require("../models/CardInventory");
const Card = require("../models/Card");

// =====================================================
// GET INVENTORY
// GET /api/admin/inventory
// =====================================================

const getInventory = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const search =
      req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    // -------------------------------------------------
    // SEARCH CARD
    // -------------------------------------------------

    let cardFilter = {};

    if (search) {
      cardFilter = {
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            tcgId: {
              $regex: search,
              $options: "i",
            },
          },
          {
            number: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      };
    }

    const matchingCards =
      await Card.find(cardFilter)
        .select("_id");

    const cardIds =
      matchingCards.map(
        (card) => card._id
      );

    // -------------------------------------------------
    // INVENTORY FILTER
    // -------------------------------------------------

    const filter = search
      ? {
          card: {
            $in: cardIds,
          },
        }
      : {};

    // -------------------------------------------------
    // GET INVENTORY
    // -------------------------------------------------

    const [
      inventory,
      total,
    ] = await Promise.all([
      CardInventory.find(filter)
        .populate(
          "card",
          "name tcgId imageSmall imageLarge rarity set number"
        )
        .sort({
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      CardInventory.countDocuments(
        filter
      ),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        inventory,

        pagination: {
          page,
          limit,
          total,

          totalPages:
            Math.ceil(
              total / limit
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get inventory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load inventory",
    });
  }
};

// =====================================================
// INVENTORY SUMMARY
// GET /api/admin/inventory/summary
// =====================================================

const getInventorySummary = async (
  req,
  res
) => {
  try {
    const result =
      await CardInventory.aggregate([
        {
          $group: {
            _id: null,

            available: {
              $sum: {
                $ifNull: [
                  "$available",
                  0,
                ],
              },
            },

            reserved: {
              $sum: {
                $ifNull: [
                  "$reserved",
                  0,
                ],
              },
            },

            consumed: {
              $sum: {
                $ifNull: [
                  "$consumed",
                  0,
                ],
              },
            },

            cards: {
              $sum: 1,
            },
          },
        },
      ]);

    const summary =
      result[0] || {
        available: 0,
        reserved: 0,
        consumed: 0,
        cards: 0,
      };

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(
      "Inventory summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load inventory summary",
    });
  }
};

// =====================================================
// GET CARDS FOR INVENTORY
// GET /api/admin/inventory/cards
// =====================================================

const getCardsForInventory = async (
  req,
  res
) => {
  try {
    const cards =
      await Card.find({})
        .select(
          "name tcgId imageSmall imageLarge rarity set number"
        )
        .sort({
          name: 1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      data: {
        cards,
      },
    });
  } catch (error) {
    console.error(
      "Get cards for inventory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load cards",
    });
  }
};

// =====================================================
// GET SINGLE CARD
// GET /api/admin/inventory/card/:cardId
// =====================================================

const getInventoryCard = async (
  req,
  res
) => {
  try {
    const { cardId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        cardId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid card ID",
      });
    }

    const card =
      await Card.findById(cardId)
        .lean();

    if (!card) {
      return res.status(404).json({
        success: false,
        message:
          "Card not found",
      });
    }

    const inventory =
      await CardInventory.findOne({
        card: cardId,
      }).lean();

    return res.status(200).json({
      success: true,

      data: {
        card,
        inventory,
      },
    });
  } catch (error) {
    console.error(
      "Get inventory card error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load card",
    });
  }
};

// =====================================================
// CREATE / UPDATE INVENTORY
// PUT /api/admin/inventory/:cardId
// =====================================================

const updateInventory = async (
  req,
  res
) => {
  try {
    const { cardId } =
      req.params;

    const {
      available,
    } = req.body;

    // -------------------------------------------------
    // VALIDATE CARD ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        cardId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid card ID",
      });
    }

    // -------------------------------------------------
    // FIND CARD
    // -------------------------------------------------

    const card =
      await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message:
          "Card not found",
      });
    }

    // -------------------------------------------------
    // VALIDATE QUANTITY
    // -------------------------------------------------

    const quantity =
      Number(available);

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available quantity must be a whole number greater than or equal to 0",
      });
    }

    // -------------------------------------------------
    // FIND / CREATE INVENTORY
    // -------------------------------------------------

    let inventory =
      await CardInventory.findOne({
        card: cardId,
      });

    if (!inventory) {
      inventory =
        new CardInventory({
          card: cardId,

          available:
            quantity,

          reserved: 0,

          consumed: 0,
        });
    } else {
      inventory.available =
        quantity;
    }

    await inventory.save();

    // -------------------------------------------------
    // POPULATE
    // -------------------------------------------------

    const populated =
      await CardInventory.findById(
        inventory._id
      ).populate(
        "card",
        "name tcgId imageSmall imageLarge rarity set number"
      );

    return res.status(200).json({
      success: true,

      message:
        "Inventory updated successfully",

      data: populated,
    });
  } catch (error) {
    console.error(
      "Update inventory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update inventory",
    });
  }
};

// =====================================================
// DELETE INVENTORY
// DELETE /api/admin/inventory/:cardId
// =====================================================

const deleteInventory =
  async (req, res) => {
    try {
      const { cardId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          cardId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid card ID",
        });
      }

      const result =
        await CardInventory.deleteOne({
          card: cardId,
        });

      if (
        result.deletedCount === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory record not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Inventory record deleted",
      });
    } catch (error) {
      console.error(
        "Delete inventory error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete inventory",
      });
    }
  };

// =====================================================
// FIND CARD IN POKEMON TCG API
// =====================================================

const findPokemonCard =
  async ({
    tcgId,
    name,
  }) => {
    try {
      const apiKey =
        process.env.POKEMON_TCG_API_KEY;

      if (!apiKey) {
        throw new Error(
          "POKEMON_TCG_API_KEY is missing"
        );
      }

      let query = "";

      if (tcgId) {
        query =
          `id:"${tcgId}"`;
      } else if (name) {
        query =
          `name:"${name}"`;
      } else {
        return null;
      }

      const response =
        await axios.get(
          "https://api.pokemontcg.io/v2/cards",
          {
            params: {
              q: query,
              pageSize: 1,
            },

            headers: {
              "X-Api-Key":
                apiKey,
            },

            timeout: 15000,
          }
        );

      return (
        response.data?.data?.[0] ||
        null
      );
    } catch (error) {
      console.error(
        "Pokemon TCG API error:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

// =====================================================
// CREATE CARD FROM POKEMON TCG DATA
// =====================================================

const createCardFromPokemonData =
  async (pokemonCard) => {
    if (!pokemonCard) {
      return null;
    }

    // -------------------------------------------------
    // CHECK EXISTING CARD
    // -------------------------------------------------

    let card =
      await Card.findOne({
        tcgId:
          pokemonCard.id,
      });

    if (card) {
      return card;
    }

    // -------------------------------------------------
    // CREATE NEW CARD
    // -------------------------------------------------

    card =
      await Card.create({
        name:
          pokemonCard.name ||
          "Unknown Card",

        tcgId:
          pokemonCard.id,

        imageSmall:
          pokemonCard.images?.small ||
          "",

        imageLarge:
          pokemonCard.images?.large ||
          "",

        rarity:
          pokemonCard.rarity ||
          "",

        set:
          pokemonCard.set?.name ||
          "",

        number:
          pokemonCard.number ||
          "",
      });

    return card;
  };

// =====================================================
// SCAN CARD IMAGE
// POST /api/admin/inventory/scan
//
// multipart/form-data
// field: cardImage
//
// Optional:
// tcgId
// name
// =====================================================

const scanAndAddCard =
  async (req, res) => {
    try {
      // -------------------------------------------------
      // IMAGE REQUIRED
      // -------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Card image is required",
        });
      }

      /*
       * IMPORTANT
       *
       * Pokemon TCG API does NOT perform
       * image recognition.
       *
       * Therefore the uploaded image must
       * first be processed by an image/card
       * recognition service.
       *
       * For testing, you can send:
       *
       * tcgId = "base1-4"
       *
       * OR
       *
       * name = "Charizard"
       *
       * along with the image.
       */

      const {
        tcgId,
        name,
      } = req.body;

      if (!tcgId && !name) {
        return res.status(400).json({
          success: false,

          message:
            "Card could not be identified. Provide tcgId or name from the card recognition service.",

          requiresRecognition: true,
        });
      }

      // -------------------------------------------------
      // SEARCH POKEMON TCG API
      // -------------------------------------------------

      const pokemonCard =
        await findPokemonCard({
          tcgId,
          name,
        });

      if (!pokemonCard) {
        return res.status(404).json({
          success: false,

          message:
            "Card not found in Pokemon TCG API",
        });
      }

      // -------------------------------------------------
      // FIND OR CREATE CARD
      // -------------------------------------------------

      const card =
        await createCardFromPokemonData(
          pokemonCard
        );

      if (!card) {
        return res.status(500).json({
          success: false,

          message:
            "Unable to create card",
        });
      }

      // -------------------------------------------------
      // FIND OR CREATE INVENTORY
      // -------------------------------------------------

      let inventory =
        await CardInventory.findOne({
          card: card._id,
        });

      let inventoryCreated =
        false;

      if (!inventory) {
        inventory =
          await CardInventory.create({
            card: card._id,

            available: 0,

            reserved: 0,

            consumed: 0,
          });

        inventoryCreated =
          true;
      }

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      const populated =
        await CardInventory.findById(
          inventory._id
        ).populate(
          "card",
          "name tcgId imageSmall imageLarge rarity set number"
        );

      return res.status(200).json({
        success: true,

        message:
          inventoryCreated
            ? "Card added to card library and inventory"
            : "Card already exists and inventory is ready",

        data: {
          card:
            populated.card,

          inventory:
            populated,

          inventoryCreated,

          cardCreated:
            card.createdAt?.getTime() ===
            card.updatedAt?.getTime(),
        },
      });
    } catch (error) {
      console.error(
        "Scan and add card error:",
        error.response?.data ||
          error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to scan and add card",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getInventory,
  getInventorySummary,
  getCardsForInventory,
  getInventoryCard,
  updateInventory,
  deleteInventory,
  scanAndAddCard,
};
