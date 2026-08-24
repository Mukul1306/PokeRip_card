const mongoose = require("mongoose");
const axios = require("axios");
const { createWorker } = require("tesseract.js");

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
    const apiKey =
      process.env.POKEWALLET_API_KEY;

    console.log(
      "PokéWallet key loaded:",
      !!apiKey
    );

    if (!apiKey) {
      throw new Error(
        "POKEWALLET_API_KEY is missing"
      );
    }

    // -------------------------------------------------
    // NORMALIZE OCR DATA
    // -------------------------------------------------

    const normalizedName =
      String(name || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const normalizedSetCode =
      String(setCode || "")
        .toUpperCase()
        .trim();

    const normalizedNumber =
      String(number || "")
        .split("/")[0]
        .replace(/^0+/, "")
        .trim();

    console.log(
      "PokéWallet search data:",
      {
        name: normalizedName,
        setCode: normalizedSetCode,
        number: normalizedNumber,
      }
    );

    // -------------------------------------------------
    // SEARCH POKEWALLET
    // -------------------------------------------------

    // If OCR found the name, search by name.
    // Otherwise search using set code + number.
    const searchQuery =
      normalizedName ||
      `${normalizedSetCode} ${normalizedNumber}`;

    if (!searchQuery.trim()) {
      console.log(
        "No usable search data"
      );

      return null;
    }

    console.log(
      "Searching PokéWallet for:",
      searchQuery
    );

    const response =
      await axios.get(
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
      "PokéWallet search results:",
      results.length
    );

    if (!results.length) {
      return null;
    }

    // -------------------------------------------------
    // STEP 1: FILTER BY SET CODE
    // -------------------------------------------------

    let candidates = results;

    if (normalizedSetCode) {

      const setMatches =
        candidates.filter((item) => {

          const cardInfo =
            item.card_info || {};

          const resultSetCode =
            String(
              cardInfo.set_code || ""
            )
              .toUpperCase()
              .trim();

          return (
            resultSetCode ===
            normalizedSetCode
          );
        });

      console.log(
        "Set code matches:",
        setMatches.length
      );

      if (setMatches.length > 0) {
        candidates = setMatches;
      }
    }

    // -------------------------------------------------
    // STEP 2: FILTER BY CARD NUMBER
    // -------------------------------------------------

    if (normalizedNumber) {

      const numberMatches =
        candidates.filter((item) => {

          const cardInfo =
            item.card_info || {};

          const resultNumber =
            String(
              cardInfo.card_number || ""
            )
              .split("/")[0]
              .replace(/^0+/, "")
              .trim();

          return (
            resultNumber ===
            normalizedNumber
          );
        });

      console.log(
        "Set + number matches:",
        numberMatches.length
      );

      if (numberMatches.length > 0) {

        const selectedCard =
          numberMatches[0];

        console.log(
          "SELECTED BY SET + NUMBER:",
          {
            name:
              selectedCard.card_info?.name,

            number:
              selectedCard.card_info?.card_number,

            setName:
              selectedCard.card_info?.set_name,

            setCode:
              selectedCard.card_info?.set_code,

            id:
              selectedCard.id,
          }
        );

        return selectedCard;
      }
    }

    // -------------------------------------------------
    // STEP 3: TRY NAME MATCH
    // -------------------------------------------------

    if (normalizedName) {

      const nameMatches =
        candidates.filter((item) => {

          const cardInfo =
            item.card_info || {};

          const resultName =
            String(
              cardInfo.name || ""
            )
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim();

          return (
            resultName ===
              normalizedName ||

            resultName.includes(
              normalizedName
            ) ||

            normalizedName.includes(
              resultName
            )
          );
        });

      console.log(
        "Name matches:",
        nameMatches.length
      );

      if (nameMatches.length > 0) {

        const selectedCard =
          nameMatches[0];

        console.log(
          "SELECTED BY NAME:",
          {
            name:
              selectedCard.card_info?.name,

            number:
              selectedCard.card_info?.card_number,

            setName:
              selectedCard.card_info?.set_name,

            setCode:
              selectedCard.card_info?.set_code,

            id:
              selectedCard.id,
          }
        );

        return selectedCard;
      }
    }

    // -------------------------------------------------
    // NO MATCH
    // -------------------------------------------------

    console.log(
      "No matching PokéWallet card found:",
      {
        name,
        setCode,
        number,
      }
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
  /#\s*(\d{1,3}(?:\/\d{1,3})?)/
);

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

  const gradeMatch =
    ocrText.match(
      /\b([A-Z][A-Z0-9.'’& -]{2,40})\s+(?:NM-MT|NM|LP|MP|HP|DMG|MINT)\b/i
    );

  if (gradeMatch) {

    name =
      gradeMatch[1]
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

if (!card) {
  card = await Card.create({
    name: cardName,

    tcgId: `${cardInfo.set_code || "UNKNOWN"}-${cardNumber}`,

    // PokéWallet image proxy
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

    pokeWallet:
      pokeWalletCard,
  });
}

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
};
