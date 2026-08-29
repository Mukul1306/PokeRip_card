const mongoose = require("mongoose");
const axios = require("axios");
const { createWorker } = require("tesseract.js");
const XLSX = require("xlsx");
const CardInventory = require("../models/CardInventory");
const Card = require("../models/Card");
const PackCategory = require("../models/PackCategory");

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
          "name tcgId imageSmall imageLarge rarity set number price priceCurrency priceSource priceLastUpdated"
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
        "name tcgId imageSmall imageLarge rarity set number price priceCurrency priceSource priceLastUpdated"
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

// Delete the associated Card document too
await Card.deleteOne({
  _id: cardId,
});

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
    number,
    setName,
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
  query = `id:"${tcgId}"`;
} else if (name && number) {
  const cleanName = name
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  query = `name:"${cleanName}" number:"${number}"`;
} else if (name) {
  const cleanName = name
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  query = `name:"${cleanName}"`;
} else {
  return null;
}
console.log("Pokemon TCG API query:", query);

     const response = await axios.get(
  "https://api.pokemontcg.io/v2/cards",
  {
    params: {
      q: query,
      pageSize: 10,
    },
    headers: {
      "X-Api-Key": apiKey,
    },
    timeout: 30000,
  }
);

      return (
        response.data?.data?.[0] ||
        null
      );
    } catch (error) {
  console.error("========== POKEMON API ERROR ==========");
  console.error("Status:", error.response?.status);
  console.error("Data:", JSON.stringify(error.response?.data, null, 2));
  console.error("URL:", error.config?.url);
  console.error("Params:", error.config?.params);
  console.error("Message:", error.message);
  console.error("=======================================");

  throw error;
}
  };

  // =====================================================
// GET CARD PRICE FROM POKEMON TCG API
// =====================================================

const getPokemonCardPrice = async (tcgId) => {
  try {
    const apiKey =
      process.env.POKEMON_TCG_API_KEY;

    if (!apiKey) {
      throw new Error(
        "POKEMON_TCG_API_KEY is missing"
      );
    }

    if (!tcgId) {
      return null;
    }

    const response = await axios.get(
      `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(tcgId)}`,
      {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    const card =
      response.data?.data;

    if (!card) {
      return null;
    }

    const prices =
      card?.tcgplayer?.prices || {};

    const availablePrices = [];

    for (const [variant, data] of Object.entries(
      prices
    )) {
      const marketPrice =
        Number(data?.market);

      if (
        Number.isFinite(marketPrice) &&
        marketPrice > 0
      ) {
        availablePrices.push({
          variant,
          price: marketPrice,
        });
      }
    }

    if (!availablePrices.length) {
      return null;
    }

    // Use the highest available market price
    const selectedPrice =
      availablePrices.reduce(
        (highest, current) =>
          current.price > highest.price
            ? current
            : highest
      );

    return {
      price: selectedPrice.price,
      variant: selectedPrice.variant,
      currency: "USD",
      source: "Pokemon TCG API / TCGPlayer",
      lastUpdated: new Date(),
      variants: availablePrices,
    };

  } catch (error) {
    console.error(
      "Pokemon TCG price error:",
      error.response?.data ||
        error.message
    );

    return null;
  }
};

// =====================================================
// REFRESH CARD PRICE
// POST /api/admin/inventory/:cardId/refresh-price
// =====================================================

const refreshCardPrice = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Validate Card ID
    if (
      !mongoose.Types.ObjectId.isValid(cardId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid card ID",
      });
    }

    // Find card
    const card =
      await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Card must have a TCG ID
    if (!card.tcgId) {
      return res.status(400).json({
        success: false,
        message:
          "Card does not have a Pokémon TCG API ID",
      });
    }

    // Fetch current price
    const priceData =
      await getPokemonCardPrice(
        card.tcgId
      );

    if (!priceData) {
      return res.status(404).json({
        success: false,
        message:
          "Current price not available for this card",
      });
    }

    // Update price
    card.price =
      priceData.price;

    card.priceCurrency =
      priceData.currency || "USD";

    card.priceSource =
      priceData.source || "";

    card.priceLastUpdated =
      priceData.lastUpdated ||
      new Date();

    await card.save();

    return res.status(200).json({
      success: true,
      message:
        "Card price updated successfully",

      data: {
        cardId: card._id,
        price: card.price,
        priceCurrency:
          card.priceCurrency,
        priceSource:
          card.priceSource,
        priceLastUpdated:
          card.priceLastUpdated,
      },
    });

  } catch (error) {
    console.error(
      "Refresh card price error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to refresh card price",
    });
  }
};

// =====================================================
// REFRESH ALL CARD PRICES
// =====================================================

const refreshAllCardPrices = async () => {
  try {
    const cards = await Card.find({
      tcgId: {
        $exists: true,
        $ne: "",
      },
    });

    console.log(
      `Starting daily price update for ${cards.length} cards`
    );

    let updated = 0;
    let failed = 0;

    for (const card of cards) {
      try {
        const priceData =
          await getPokemonCardPrice(
            card.tcgId
          );

        if (!priceData) {
          failed++;
          continue;
        }

        card.price =
          priceData.price;

        card.priceCurrency =
          priceData.currency || "USD";

        card.priceSource =
          priceData.source || "";

        card.priceLastUpdated =
          priceData.lastUpdated ||
          new Date();

        await card.save();

        updated++;

        console.log(
          `Updated ${card.name}: $${card.price}`
        );

        // Small delay to avoid API rate limits
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );

      } catch (error) {
        failed++;

        console.error(
          `Failed to update ${card.name}:`,
          error.message
        );
      }
    }

    console.log(
      `Daily price update completed. Updated: ${updated}, Failed: ${failed}`
    );

    return {
      total: cards.length,
      updated,
      failed,
    };

  } catch (error) {
    console.error(
      "Daily price update error:",
      error.message
    );

    throw error;
  }
};

// =====================================================
// OCR - RECOGNIZE CARD TEXT FROM IMAGE
// =====================================================

const recognizePokemonCard = async (
  imageBuffer,
  mimetype
) => {
  try {
    console.log("Starting OCR...");

    const worker = await createWorker("eng");

    const {
      data: { text },
    } = await worker.recognize(imageBuffer);

    await worker.terminate();

    console.log("========== OCR TEXT ==========");
    console.log(text);
    console.log("==============================");

    if (!text || !text.trim()) {
      return null;
    }

    return {
      rawText: text,
    };

  } catch (error) {
    console.error(
      "OCR error:",
      error.message
    );

    throw error;
  }
};

  // =====================================================
// RECOGNIZE POKEMON CARD FROM IMAGE
// =====================================================

// const recognizePokemonCard = async (imageBuffer, mimetype) => {
//   try {
//     const apiKey =
//       process.env.POKEWALLET_API_KEY

//    if (!apiKey) {
//   throw new Error(
//     "POKEWALLET_API_KEY is missing"
//   );
// }

//     const FormData = require("form-data");

//     const form = new FormData();

//     form.append(
//       "image",
//       imageBuffer,
//       {
//         filename: "card.jpg",
//         contentType: mimetype,
//       }
//     );

//     form.append("limit", "10");

//     const response = await axios.post(
//       "https://api.tcgapis.com/api/v1/recognize",
//       form,
//       {
//         headers: {
//           ...form.getHeaders(),
//           "x-api-key": apiKey,
//         },

//         timeout: 30000,
//       }
//     );

//     const results =
//       response.data?.results || [];

//     if (!results.length) {
//       return null;
//     }

//     // Highest-confidence result
//     const bestMatch = results[0];

//     console.log(
//       "Card recognition result:",
//       bestMatch
//     );

//     return bestMatch;

//   } catch (error) {
//     console.error(
//       "Card recognition error:",
//       error.response?.data ||
//         error.message
//     );

//     throw error;
//   }
// };
// =====================================================
// FIND CARD IN POKEWALLET API
// =====================================================



const findPokeWalletCard = async ({
  name,
  setCode,
  number,
}) => {
  try {
    const apiKey = process.env.POKEWALLET_API_KEY;

    if (!apiKey) {
      throw new Error("POKEWALLET_API_KEY is missing");
    }

    // =====================================================
    // NORMALIZE INPUT
    // =====================================================

    const normalizedName = String(name || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    const normalizedSetCode = String(setCode || "")
      .toUpperCase()
      .trim();

    const normalizedNumber = String(number || "")
      .split("/")[0]
      .replace(/^0+/, "")
      .trim();

    console.log("=================================");
    console.log("CARD MATCH INPUT");
    console.log({
      name: normalizedName,
      setCode: normalizedSetCode,
      number: normalizedNumber,
    });
    console.log("=================================");

    // =====================================================
    // WE NEED STRONG IDENTIFICATION
    // =====================================================

    if (!normalizedSetCode || !normalizedNumber) {
      console.log(
        "Not enough information to identify exact card."
      );

      return null;
    }

    // =====================================================
    // SEARCH USING SET + NUMBER
    // =====================================================

    const searchQuery =
      `${normalizedSetCode} ${normalizedNumber}`;

    console.log(
      "Searching PokéWallet:",
      searchQuery
    );

    const response = await axios.get(
      "https://api.pokewallet.io/search",
      {
        params: {
          q: searchQuery,
          limit: 100,
        },

        headers: {
          "X-API-Key": apiKey,
        },

        timeout: 30000,
      }
    );

    const results =
      response.data?.results || [];

    console.log(
      "PokéWallet results:",
      results.length
    );

    if (!results.length) {
      console.log(
        "No PokéWallet results."
      );

      return null;
    }

    // =====================================================
    // EXACT SET + NUMBER MATCH
    // =====================================================

    const exactMatches = results.filter(
      (item) => {
        const cardInfo =
          item.card_info || {};

        const resultSetCode =
          String(
            cardInfo.set_code || ""
          )
            .toUpperCase()
            .trim();

        const resultNumber =
          String(
            cardInfo.card_number || ""
          )
            .split("/")[0]
            .replace(/^0+/, "")
            .trim();

        return (
          resultSetCode ===
            normalizedSetCode &&
          resultNumber ===
            normalizedNumber
        );
      }
    );

    console.log(
      "EXACT SET + NUMBER MATCHES:",
      exactMatches.length
    );

    // =====================================================
    // EXACTLY ONE MATCH
    // =====================================================

    if (exactMatches.length === 1) {
      const selectedCard =
        exactMatches[0];

      console.log(
        "✅ EXACT CARD SELECTED:",
        {
          id: selectedCard.id,

          name:
            selectedCard.card_info?.name,

          number:
            selectedCard.card_info?.card_number,

          setCode:
            selectedCard.card_info?.set_code,

          setName:
            selectedCard.card_info?.set_name,
        }
      );

      return selectedCard;
    }

    // =====================================================
    // MULTIPLE MATCHES
    // =====================================================

    if (exactMatches.length > 1) {
      console.log(
        "⚠️ Multiple exact cards found."
      );

      // Try exact name as a SECOND confirmation
      if (normalizedName) {
        const nameMatches =
          exactMatches.filter(
            (item) => {
              const resultName =
                String(
                  item.card_info?.name ||
                    ""
                )
                  .toLowerCase()
                  .replace(/\s+/g, " ")
                  .trim();

              return (
                resultName ===
                normalizedName
              );
            }
          );

        console.log(
          "Exact name confirmations:",
          nameMatches.length
        );

        if (nameMatches.length === 1) {
          return nameMatches[0];
        }
      }

      console.log(
        "❌ Cannot safely determine card."
      );

      return null;
    }

    // =====================================================
    // NO EXACT MATCH
    // =====================================================

    console.log(
      "❌ No exact set + number match."
    );

    console.log(
      "Will NOT fallback to name."
    );

    return null;

  } catch (error) {
    console.error(
      "PokéWallet API error:",
      error.response?.data ||
        error.message
    );

    return null;
  }
};

// =====================================================
// READ CSV / EXCEL FILE
// =====================================================

const readInventorySpreadsheet = (buffer) => {
  try {
    const workbook =
      XLSX.read(buffer, {
        type: "buffer",
      });

    const firstSheet =
      workbook.SheetNames[0];

    if (!firstSheet) {
      throw new Error(
        "Spreadsheet does not contain a sheet"
      );
    }

    const worksheet =
      workbook.Sheets[firstSheet];

    const rows =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: "",
        }
      );

    return rows;

  } catch (error) {
    console.error(
      "Spreadsheet read error:",
      error.message
    );

    throw new Error(
      "Unable to read CSV/Excel file"
    );
  }
};
// =====================================================
// CREATE CARD FROM POKEMON TCG DATA
// =====================================================

const createCardFromPokemonData =
  async (pokemonCard,pokeWalletCard) => {
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
  `/api/admin/inventory/image/${pokeWalletCard.id}?size=low`,

imageLarge:
  `/api/admin/inventory/image/${pokeWalletCard.id}?size=high`,
    rarity:
      pokemonCard.rarity ||
      "",

    set:
      pokemonCard.set?.name ||
      "",

    number:
      pokemonCard.number ||
      "",

    // PokéWallet data
    pokeWallet: pokeWalletCard || {},
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
// IMAGE OR SPREADSHEET REQUIRED
// -------------------------------------------------

if (!req.file) {
  return res.status(400).json({
    success: false,
    message:
      "Card image, CSV, or Excel file is required",
  });
}

// -------------------------------------------------
// CSV / EXCEL IMPORT
// -------------------------------------------------

if (
  req.uploadType ===
  "spreadsheet"
) {
  const rows =
    readInventorySpreadsheet(
      req.file.buffer
    );

  if (!rows.length) {
    return res.status(400).json({
      success: false,
      message:
        "CSV/Excel file is empty",
    });
  }

  console.log(
    `Starting spreadsheet import for ${rows.length} rows`
  );

  const results = [];

  for (
    let i = 0;
    i < rows.length;
    i++
  ) {
    const row = rows[i];

    try {
      console.log(
        `Processing row ${i + 1}/${rows.length}`,
        row
      );

      // -------------------------------------------------
      // READ CSV / EXCEL COLUMNS
      // -------------------------------------------------

      const rowName =
        String(
          row.name ||
          row.Name ||
          row.cardName ||
          row["Card Name"] ||
          ""
        ).trim();

      const rowSet =
        String(
          row.set ||
          row.Set ||
          row.setCode ||
          row["Set Code"] ||
          ""
        ).trim();

      const rowNumber =
        String(
          row.number ||
          row.Number ||
          row.cardNumber ||
          row["Card Number"] ||
          ""
        ).trim();

      const quantity =
        Math.max(
          1,
          Number(
            row.quantity ||
            row.Quantity ||
            1
          )
        );

      // -------------------------------------------------
      // VALIDATE ROW
      // -------------------------------------------------

      if (!rowSet || !rowNumber) {
        results.push({
          row: i + 1,
          success: false,
          message:
            "Set and card number are required",
        });

        continue;
      }

      // -------------------------------------------------
      // FIND CARD IN POKEWALLET
      // -------------------------------------------------

      const pokeWalletCard =
        await findPokeWalletCard({
          name: rowName,
          setCode: rowSet,
          number: rowNumber,
        });

      if (!pokeWalletCard) {
        results.push({
          row: i + 1,
          success: false,
          message:
            "Card not found in PokéWallet",
          name: rowName,
          set: rowSet,
          number: rowNumber,
        });

        continue;
      }

      console.log(
        "PokéWallet card found:",
        pokeWalletCard.id
      );

      // -------------------------------------------------
      // CARD INFORMATION
      // -------------------------------------------------

      const cardInfo =
        pokeWalletCard.card_info || {};

      const cardName =
        cardInfo.name ||
        rowName ||
        "Unknown Card";

      const cardNumber =
        cardInfo.card_number ||
        rowNumber;

      // -------------------------------------------------
      // CHECK EXISTING CARD
      // -------------------------------------------------

      let card =
        await Card.findOne({
          "pokeWallet.id":
            pokeWalletCard.id,
        });

      // -------------------------------------------------
      // GET PRICE
      // -------------------------------------------------

      let priceData = null;

      const tcgPrices =
        pokeWalletCard?.tcgplayer?.prices;

      if (tcgPrices) {
        const prices =
          Array.isArray(tcgPrices)
            ? tcgPrices
            : [tcgPrices];

        const validPrices =
          prices
            .map((p) => ({
              price: Number(
                p?.market_price ??
                p?.market ??
                p?.avg ??
                0
              ),
            }))
            .filter(
              (p) =>
                Number.isFinite(
                  p.price
                ) &&
                p.price > 0
            );

        if (validPrices.length) {
          const selectedPrice =
            validPrices.reduce(
              (highest, current) =>
                current.price >
                highest.price
                  ? current
                  : highest
            );

          priceData = {
            price:
              selectedPrice.price,
            currency: "USD",
            source:
              "PokéWallet / TCGPlayer",
            lastUpdated:
              new Date(),
          };
        }
      }

      // -------------------------------------------------
      // CREATE CARD IF NEEDED
      // -------------------------------------------------

      if (!card) {
        card =
          await Card.create({
            name: cardName,

            tcgId:
              pokeWalletCard.id,

            imageSmall:
              `/api/admin/inventory/image/${pokeWalletCard.id}?size=low`,

            imageLarge:
              `/api/admin/inventory/image/${pokeWalletCard.id}?size=high`,

            rarity:
              cardInfo.rarity ||
              "",

            set: {
              id:
                cardInfo.set_id ||
                "",
              name:
                cardInfo.set_name ||
                "",
            },

            number:
              cardNumber,

            price:
              priceData?.price ??
              null,

            priceCurrency:
              priceData?.currency ||
              "USD",

            priceSource:
              priceData?.source ||
              "",

            priceLastUpdated:
              priceData?.lastUpdated ||
              null,

            pokeWallet:
              pokeWalletCard,
          });

        console.log(
          "Created card:",
          cardName
        );
      }

      // -------------------------------------------------
      // FIND / CREATE INVENTORY
      // -------------------------------------------------

      let inventory =
        await CardInventory.findOne({
          card: card._id,
        });

      if (!inventory) {
        inventory =
          await CardInventory.create({
            card: card._id,

            available:
              quantity,

            reserved: 0,

            consumed: 0,
          });
      } else {
        inventory.available +=
          quantity;

        await inventory.save();
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      results.push({
        row: i + 1,
        success: true,
        name: cardName,
        set: rowSet,
        number: cardNumber,
        quantity,
        price:
          card.price,
        cardId:
          card._id,
      });

      console.log(
        `Row ${i + 1} imported successfully`
      );

      // Small delay between API requests
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 300)
      );

    } catch (error) {
      console.error(
        `Row ${i + 1} failed:`,
        error.message
      );

      results.push({
        row: i + 1,
        success: false,
        message:
          error.message,
      });
    }
  }

  // -------------------------------------------------
  // IMPORT SUMMARY
  // -------------------------------------------------

  const successful =
    results.filter(
      (item) => item.success
    ).length;

  const failed =
    results.length -
    successful;

  return res.status(200).json({
    success: true,

    message:
      "CSV/Excel import completed",

    total:
      rows.length,

    successful,

    failed,

    results,
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

      let {
  tcgId,
  name,
} = req.body;

if (!tcgId && !name && !req.file) {
  return res.status(400).json({
    success: false,
    message: "Card image, tcgId, or name is required",
  });
}

let detectedCardNumber = "";

let detectedSetCode = "";

// -------------------------------------------------
// IDENTIFY CARD FROM IMAGE
// -------------------------------------------------

if (!tcgId && !name && req.file) {
  const recognition =
    await recognizePokemonCard(
      req.file.buffer,
      req.file.mimetype
    );

  if (!recognition) {
    return res.status(404).json({
      success: false,
      message:
        "Unable to identify the Pokémon card from image",
    });
  }

  console.log(
    "Recognized card:",
    recognition
  );

  // ---------------------------------------------
  // EXTRACT CARD NAME FROM OCR TEXT
  // ---------------------------------------------

  const ocrText =
    recognition.rawText || "";

    // ---------------------------------------------
// EXTRACT CARD NUMBER FROM OCR
// ---------------------------------------------

const numberMatch = ocrText.match(
  /#\s*(\d{1,3})(?:\s*\/\s*(\d{1,3}))?/i
);

if (numberMatch) {
  detectedCardNumber = numberMatch[1].trim();

  console.log(
    "Detected card number:",
    detectedCardNumber
  );
}

if (numberMatch) {
  detectedCardNumber = numberMatch[1].trim();

  console.log(
    "Detected card number:",
    detectedCardNumber
  );
}
// -------------------------------------------------
// DETECT SET CODE FROM PSA LABEL
// Example:
// 2024 POKEMON PAF EN
// 2025 POKEMON DRI EN
// -------------------------------------------------


const setMatch = ocrText.match(
  /\bPOKEMON\s+([A-Z0-9]{2,4})\s+EN\b/i
);

if (setMatch) {
  detectedSetCode =
    setMatch[1].toUpperCase();

  console.log(
    "Detected set code:",
    detectedSetCode
  );
}

  console.log(
    "OCR text for card detection:",
    ocrText
  );

 // -------------------------------------------------
// DETECT CARD NAME
// -------------------------------------------------

// Pattern 1: cards such as Mew ex
const nameMatch = ocrText.match(
  /\b([A-Z][A-Z0-9.'’& -]{2,40})\s+(ex|EX)\b/i
);

if (nameMatch) {
  name =
    `${nameMatch[1].trim()} ${nameMatch[2]}`
      .trim();

  console.log(
    "Detected card name:",
    name
  );
}

// -------------------------------------------------
// Pattern 2: PSA LABEL
// Example:
// ETHAN'S TYPHLOSION NM-MT
// BLAZIKEN MINT
// -------------------------------------------------

if (!name) {

 const gradeMatch = ocrText.match(
  /\b([A-Z][A-Z0-9.'’&-]*(?:\s+[A-Z][A-Z0-9.'’&-]*){0,4})\s+(MINT|NM-MT|NM|LP|MP|HP|DMG)\b/i
);

if (gradeMatch) {
  name = gradeMatch[1]
    .replace(/\s+/g, " ")
    .trim();

  console.log(
    "Detected card name:",
    name
  );
}
}

// -------------------------------------------------
// NAME NOT DETECTED
// -------------------------------------------------

if (!name) {
  console.log(
    "Card name not detected by OCR."
  );

  console.log(
    "Continuing with set code + card number."
  );
}
      

// -------------------------------------------------
// SEARCH CARD IN POKEWALLET
// -------------------------------------------------

const pokeWalletCard =
  await findPokeWalletCard({
    name,
    number: detectedCardNumber,
    setCode: detectedSetCode,
  });

if (!pokeWalletCard) {
  return res.status(404).json({
    success: false,
    message: "Card not found in PokéWallet",
  });
}

console.log("PokéWallet card found:", pokeWalletCard);

console.log(
  "PokéWallet image data:",
  JSON.stringify(pokeWalletCard.images, null, 2)
);
// -------------------------------------------------
// CHECK IF CARD ALREADY EXISTS
// -------------------------------------------------

const cardInfo =
  pokeWalletCard.card_info || {};

const cardName =
  cardInfo.name ||
  name;

const cardNumber =
  cardInfo.card_number ||
  "";

const cardSet =
  cardInfo.set_name ||
  "";

// -------------------------------------------------
// CHECK IF CARD ALREADY EXISTS
// -------------------------------------------------

// Use PokéWallet ID as the unique card ID
// Find card using PokéWallet ID
let card = await Card.findOne({
  "pokeWallet.id": pokeWalletCard.id,
});

if (card) {
  // Check whether this card is already in inventory
  const existingInventory = await CardInventory.findOne({
    card: card._id,
  });

  if (existingInventory) {
    return res.status(409).json({
      success: false,
      message: "Card is already in inventory",
    });
  }

  // Card exists but inventory was deleted.
  // Reuse the existing card instead of creating duplicate Card.
  console.log("Card exists but inventory does not. Reusing card:", card._id);
}

// -------------------------------------------------
// CREATE CARD IF IT DOES NOT EXIST
// -------------------------------------------------

// if (!card) {

//  const pokemonCard =
//   await findPokemonCard({
//     tcgId: "",
//     name: cardName,
//     number: cardNumber,
//     setName: cardSet,
//   });

// const actualTcgId =
//   pokemonCard?.id || "";

// // Get live market price
// const priceData =
//   await getPokemonCardPrice(
//     actualTcgId
//   );

//   console.log(
//     "Pokemon TCG price:",
//     priceData
//   );

// -------------------------------------------------
// USE POKEWALLET DATA DIRECTLY
// -------------------------------------------------

const actualTcgId =
  pokeWalletCard.id || "";

// Get live price directly from PokéWallet
let priceData = null;

const tcgPrices =
  pokeWalletCard?.tcgplayer?.prices;

if (tcgPrices) {
  // PokéWallet can return either an object
  // or an array depending on the card.
  const prices = Array.isArray(tcgPrices)
    ? tcgPrices
    : [tcgPrices];

  const validPrices = prices
    .map((p) => ({
      price: Number(
        p?.market_price ??
        p?.market ??
        p?.avg ??
        0
      ),
      variant:
        p?.variant_type ||
        "normal",
    }))
    .filter(
      (p) =>
        Number.isFinite(p.price) &&
        p.price > 0
    );

  if (validPrices.length) {
    const selectedPrice =
      validPrices.reduce(
        (highest, current) =>
          current.price >
          highest.price
            ? current
            : highest
      );

    priceData = {
      price: selectedPrice.price,
      currency: "USD",
      source:
        "PokéWallet / TCGPlayer",
      lastUpdated: new Date(),
    };
  }
}

// Fallback to CardMarket if TCGPlayer
// price is not available.
if (
  !priceData &&
  Array.isArray(
    pokeWalletCard?.cardmarket?.prices
  )
) {
  const validPrices =
    pokeWalletCard.cardmarket.prices
      .map((p) => ({
        price: Number(
          p?.avg ??
          p?.trend ??
          p?.low ??
          0
        ),
      }))
      .filter(
        (p) =>
          Number.isFinite(p.price) &&
          p.price > 0
      );

  if (validPrices.length) {
    const selectedPrice =
      validPrices.reduce(
        (highest, current) =>
          current.price >
          highest.price
            ? current
            : highest
      );

    priceData = {
      price: selectedPrice.price,
      currency: "EUR",
      source:
        "PokéWallet / CardMarket",
      lastUpdated: new Date(),
    };
  }
}

console.log(
  "PokéWallet live price:",
  priceData
);

  card = await Card.create({

    name: cardName,

    tcgId: actualTcgId,

    imageSmall:
      `/api/admin/inventory/image/${pokeWalletCard.id}?size=low`,

    imageLarge:
      `/api/admin/inventory/image/${pokeWalletCard.id}?size=high`,

    rarity:
      cardInfo.rarity || "",

    set: {
      id: cardInfo.set_id || "",
      name: cardInfo.set_name || "",
    },

    number:
      cardNumber,

    // =========================
    // CARD PRICE
    // =========================

    price:
      priceData?.price ?? null,

    priceCurrency:
      priceData?.currency || "USD",

    priceSource:
      priceData?.source || "",

    priceLastUpdated:
      priceData?.lastUpdated || null,

    pokeWallet:
      pokeWalletCard,
  });


// -------------------------------------------------
// FIND OR CREATE CARD
// -------------------------------------------------

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

        // PokéWallet information
      pokeWallet:
        pokeWalletCard,
      },
    });
    }
    } catch (error) {
      console.error("=================================");
      console.error("SCAN AND ADD CARD ERROR");
      console.error("Message:", error.message);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Stack:", error.stack);
      console.error("=================================");

      return res.status(500).json({
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Unable to scan and add card",
      });
    }
  };
  // =====================================================
// GET POKEWALLET CARD IMAGE
// GET /api/admin/inventory/image/:id
// =====================================================

const getPokeWalletImage = async (req, res) => {
  try {
    const { id } = req.params;
    const size = req.query.size === "high" ? "high" : "low";

    const apiKey = process.env.POKEWALLET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "POKEWALLET_API_KEY is missing",
      });
    }

    console.log("Loading PokéWallet image:");
    console.log("Card ID:", id);
    console.log("Size:", size);

    // Try PokéWallet image endpoint
    const response = await axios.get(
      `https://api.pokewallet.io/images/${encodeURIComponent(id)}`,
      {
        params: {
          size,
        },
        headers: {
          "X-API-Key": apiKey,
          Accept: "image/jpeg,image/png,image/webp",
        },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );

    console.log(
      "PokéWallet image status:",
      response.status
    );

    console.log(
      "Content-Type:",
      response.headers["content-type"]
    );

    if (!response.data || !response.data.length) {
      throw new Error(
        "PokéWallet returned an empty image"
      );
    }

    res.set(
      "Content-Type",
      response.headers["content-type"] ||
        "image/jpeg"
    );

    res.set(
      "Cache-Control",
      "public, max-age=3600"
    );

    return res.send(response.data);

  } catch (error) {
    console.error(
      "========== POKEWALLET IMAGE ERROR =========="
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "URL:",
      error.config?.url
    );

    console.error(
      "Params:",
      error.config?.params
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "============================================="
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message: "Unable to load card image",
    });
  }
};



// =====================================================
// INVENTORY PRICE CATEGORIES
// =====================================================

// GET /api/admin/inventory/categories
const getInventoryCategories = async (req, res) => {
  try {
    const categories = await PackCategory.find({})
      .sort({ sortOrder: 1, minPrice: 1, name: 1 })
      .lean();

    const result = await Promise.all(
      categories.map(async (category) => {
        const filter = {
          price: {
            $gte: Number(category.minPrice || 0),
          },
        };

        if (
          category.maxPrice !== null &&
          category.maxPrice !== undefined &&
          category.maxPrice !== ""
        ) {
          filter.price.$lte = Number(category.maxPrice);
        }

        const cards = await Card.find(filter)
          .select("_id")
          .lean();

        const cardCount =
          await CardInventory.countDocuments({
            card: {
              $in: cards.map((card) => card._id),
            },
          });

        return {
          ...category,
          cardCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        categories: result,
      },
    });
  } catch (error) {
    console.error(
      "Get inventory categories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load inventory categories",
    });
  }
};

// POST /api/admin/inventory/categories
const createInventoryCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description = "",
      image = "",
      minPrice,
      maxPrice = null,
      status = "ACTIVE",
      sortOrder = 0,
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanSlug = String(slug || "")
      .trim()
      .toLowerCase();

    const minimum = Number(minPrice);

    const maximum =
      maxPrice === null ||
      maxPrice === undefined ||
      maxPrice === ""
        ? null
        : Number(maxPrice);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message:
          "Category name is required",
      });
    }

    if (!cleanSlug) {
      return res.status(400).json({
        success: false,
        message:
          "Category slug is required",
      });
    }

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price must be a valid number greater than or equal to 0",
      });
    }

    if (
      maximum !== null &&
      (
        !Number.isFinite(maximum) ||
        maximum < minimum
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum price must be empty or greater than or equal to minimum price",
      });
    }

    if (
      !["ACTIVE", "INACTIVE"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category status",
      });
    }

    const duplicateName =
      await PackCategory.findOne({
        name: cleanName,
      });

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message:
          "Category name already exists",
      });
    }

    const duplicateSlug =
      await PackCategory.findOne({
        slug: cleanSlug,
      });

    if (duplicateSlug) {
      return res.status(409).json({
        success: false,
        message:
          "Category slug already exists",
      });
    }

    const category =
      await PackCategory.create({
        name: cleanName,
        slug: cleanSlug,
        description:
          String(description || "").trim(),
        image:
          String(image || "").trim(),
        minPrice: minimum,
        maxPrice: maximum,
        status,
        sortOrder:
          Number(sortOrder) || 0,
      });

    return res.status(201).json({
      success: true,
      message:
        "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error(
      "Create inventory category error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Category name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create inventory category",
    });
  }
};

// PUT /api/admin/inventory/categories/:categoryId
const updateInventoryCategory = async (req, res) => {
  try {
    const { categoryId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        categoryId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category ID",
      });
    }

    const category =
      await PackCategory.findById(
        categoryId
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      minPrice,
      maxPrice,
      status,
      sortOrder,
    } = req.body;

    if (name !== undefined) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Category name is required",
        });
      }

      const duplicate =
        await PackCategory.findOne({
          name: cleanName,
          _id: {
            $ne: categoryId,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Category name already exists",
        });
      }

      category.name = cleanName;
    }

    if (slug !== undefined) {
      const cleanSlug =
        String(slug)
          .trim()
          .toLowerCase();

      if (!cleanSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Category slug is required",
        });
      }

      const duplicate =
        await PackCategory.findOne({
          slug: cleanSlug,
          _id: {
            $ne: categoryId,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Category slug already exists",
        });
      }

      category.slug = cleanSlug;
    }

    if (description !== undefined) {
      category.description =
        String(description || "")
          .trim();
    }

    if (image !== undefined) {
      category.image =
        String(image || "").trim();
    }

    if (minPrice !== undefined) {
      const minimum =
        Number(minPrice);

      if (
        !Number.isFinite(minimum) ||
        minimum < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum price must be a valid number greater than or equal to 0",
        });
      }

      category.minPrice =
        minimum;
    }

    if (maxPrice !== undefined) {
      if (
        maxPrice === null ||
        maxPrice === ""
      ) {
        category.maxPrice =
          null;
      } else {
        const maximum =
          Number(maxPrice);

        if (
          !Number.isFinite(maximum) ||
          maximum < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Maximum price must be a valid number",
          });
        }

        category.maxPrice =
          maximum;
      }
    }

    if (
      category.maxPrice !== null &&
      category.maxPrice !== undefined &&
      Number(category.maxPrice) <
        Number(category.minPrice)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum price must be greater than or equal to minimum price",
      });
    }

    if (status !== undefined) {
      if (
        !["ACTIVE", "INACTIVE"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category status",
        });
      }

      category.status = status;
    }

    if (sortOrder !== undefined) {
      const order =
        Number(sortOrder);

      if (!Number.isFinite(order)) {
        return res.status(400).json({
          success: false,
          message:
            "Sort order must be a valid number",
        });
      }

      category.sortOrder =
        order;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message:
        "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error(
      "Update inventory category error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Category name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update inventory category",
    });
  }
};

// DELETE /api/admin/inventory/categories/:categoryId
const deleteInventoryCategory = async (req, res) => {
  try {
    const { categoryId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        categoryId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category ID",
      });
    }

    const category =
      await PackCategory.findByIdAndDelete(
        categoryId
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete inventory category error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete inventory category",
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
  getPokeWalletImage,
  refreshCardPrice,
  refreshAllCardPrices,

  getInventoryCategories,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
};