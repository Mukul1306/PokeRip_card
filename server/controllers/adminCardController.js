const mongoose = require("mongoose");

const Card = require("../models/Card");

const {
  searchPokemonCards,
  getPokemonCardById,
} = require("../services/pokemonTcgService");


// =====================================================
// SEARCH POKEMON TCG API
// GET /api/admin/cards/search
// =====================================================

const searchCards = async (req, res) => {
  try {
    const search =
      req.query.search?.trim() || "";

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const pageSize = Math.min(
      parseInt(req.query.pageSize) || 20,
      50
    );

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const result =
      await searchPokemonCards({
        search,
        page,
        pageSize,
      });

    const cards = result.data || [];

    // Check which cards are already saved
    const ids = cards.map(
      (card) => card.id
    );

    const savedCards =
      await Card.find({
        tcgId: {
          $in: ids,
        },
      })
        .select("tcgId")
        .lean();

    const savedIds = new Set(
      savedCards.map(
        (card) => card.tcgId
      )
    );

    const formattedCards =
      cards.map((card) => ({
        id: card.id,

        name: card.name,

        supertype:
          card.supertype || "",

        subtypes:
          card.subtypes || [],

        hp: card.hp || "",

        types:
          card.types || [],

        number:
          card.number || "",

        rarity:
          card.rarity || "",

        artist:
          card.artist || "",

        images: {
          small:
            card.images?.small || "",

          large:
            card.images?.large || "",
        },

        set: {
          id:
            card.set?.id || "",

          name:
            card.set?.name || "",

          series:
            card.set?.series || "",

          printedTotal:
            card.set?.printedTotal ?? null,

          total:
            card.set?.total ?? null,

          releaseDate:
            card.set?.releaseDate || "",

          symbol:
            card.set?.images?.symbol || "",

          logo:
            card.set?.images?.logo || "",
        },

        tcgplayer:
          card.tcgplayer || null,

        alreadyAdded:
          savedIds.has(card.id),
      }));

    return res.status(200).json({
      success: true,

      data: {
        cards: formattedCards,

        pagination: {
          page:
            result.page || page,

          pageSize:
            result.pageSize || pageSize,

          totalCount:
            result.totalCount || 0,

          totalPages: Math.ceil(
            (result.totalCount || 0) /
              pageSize
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Search Pokemon cards error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to search Pokémon TCG cards",
    });
  }
};


// =====================================================
// ADD CARD TO DATABASE
// POST /api/admin/cards
// =====================================================

const addCard = async (req, res) => {
  try {
    const { tcgId } = req.body;

    if (!tcgId) {
      return res.status(400).json({
        success: false,
        message: "tcgId is required",
      });
    }

    // Already exists?
    const existingCard =
      await Card.findOne({
        tcgId,
      });

    if (existingCard) {
      return res.status(409).json({
        success: false,
        message:
          "This card is already in your library",
        card: existingCard,
      });
    }

    // Fetch latest card data
    const pokemonCard =
      await getPokemonCardById(tcgId);

    if (!pokemonCard) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    const card =
      await Card.create({
        tcgId: pokemonCard.id,

        name: pokemonCard.name,

        supertype:
          pokemonCard.supertype || "",

        subtypes:
          pokemonCard.subtypes || [],

        hp:
          pokemonCard.hp || "",

        types:
          pokemonCard.types || [],

        number:
          pokemonCard.number || "",

        rarity:
          pokemonCard.rarity || "",

        artist:
          pokemonCard.artist || "",

        imageSmall:
          pokemonCard.images?.small || "",

        imageLarge:
          pokemonCard.images?.large || "",

        set: {
          id:
            pokemonCard.set?.id || "",

          name:
            pokemonCard.set?.name || "",

          series:
            pokemonCard.set?.series || "",

          printedTotal:
            pokemonCard.set?.printedTotal ??
            null,

          total:
            pokemonCard.set?.total ?? null,

          releaseDate:
            pokemonCard.set?.releaseDate || "",

          symbol:
            pokemonCard.set?.images?.symbol ||
            "",

          logo:
            pokemonCard.set?.images?.logo ||
            "",
        },

        tcgplayer:
          pokemonCard.tcgplayer || null,

        legalities:
          pokemonCard.legalities || {},

        addedBy:
          req.user?._id || null,

        status: "ACTIVE",
      });

    return res.status(201).json({
      success: true,

      message:
        "Card added to library successfully",

      card,
    });
  } catch (error) {
    console.error(
      "Add card error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This card is already in your library",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to add card",
    });
  }
};


// =====================================================
// GET SAVED CARD LIBRARY
// GET /api/admin/cards
// =====================================================

const getSavedCards = async (
  req,
  res
) => {
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

    const skip =
      (page - 1) * limit;

    const filter = {
      status: "ACTIVE",
    };

    if (search) {
      filter.$or = [
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
          "set.name": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [
      cards,
      totalCards,
    ] = await Promise.all([
      Card.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Card.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        cards,

        pagination: {
          page,
          limit,
          totalCards,

          totalPages:
            Math.ceil(
              totalCards / limit
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get saved cards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET SAVED CARD BY ID
// GET /api/admin/cards/:id
// =====================================================

const getCardById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid card ID",
      });
    }

    const card =
      await Card.findOne({
        _id: id,
        status: "ACTIVE",
      });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    return res.status(200).json({
      success: true,
      card,
    });
  } catch (error) {
    console.error(
      "Get card error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// DELETE / ARCHIVE CARD
// DELETE /api/admin/cards/:id
// =====================================================

const deleteCard = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid card ID",
      });
    }

    const card =
      await Card.findOne({
        _id: id,
      });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // For now archive instead of
    // physically deleting.
    card.status = "ARCHIVED";

    await card.save();

    return res.status(200).json({
      success: true,
      message:
        "Card removed from library",
    });
  } catch (error) {
    console.error(
      "Delete card error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  searchCards,
  addCard,
  getSavedCards,
  getCardById,
  deleteCard,
};