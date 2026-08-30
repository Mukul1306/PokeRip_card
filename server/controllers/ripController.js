const mongoose = require("mongoose");

const UserPack = require("../models/UserPack");
const UserPackCard = require("../models/UserPackCard");
const Pack = require("../models/Pack");
const CardInventory = require("../models/CardInventory");
const Wallet = require("../models/Wallet");

// =====================================================
// RIP ONE CARD
// POST /api/rip/:userPackId
// =====================================================

const ripCard = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    const { userPackId } = req.params;

    // =================================================
    // AUTH
    // =================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // =================================================
    // VALIDATE USER PACK ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(userPackId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user pack ID",
      });
    }

    await session.startTransaction();

    // =================================================
    // FIND USER PACK
    // =================================================

    const userPack =
      await UserPack.findOne({
        _id: userPackId,
        user: userId,
      }).session(session);

    if (!userPack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Pack not found in your collection",
      });
    }

    // =================================================
    // CHECK REMAINING CARDS
    // =================================================

    if (
      Number(
        userPack.cardsRemaining || 0
      ) <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "No cards remaining in this pack",
      });
    }

    // =================================================
    // GET ORIGINAL PACK
    // =================================================

    const pack =
      await Pack.findById(
        userPack.pack
      )
        .populate(
          "cards.card",
          "name tcgId number rarity image imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
        .session(session);

    if (!pack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Original pack not found",
      });
    }

    // =================================================
    // GET PACK CARDS
    // =================================================

    const packCards =
      Array.isArray(pack.cards)
        ? pack.cards.filter(
            (packCard) =>
              packCard.card &&
              Number(
                packCard.quantity || 0
              ) > 0 &&
              Number(
                packCard.pullWeight || 0
              ) > 0
          )
        : [];

    if (packCards.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "No cards configured in this pack",
      });
    }

    // =================================================
    // CARD IDS FROM PACK
    // =====================================================

    const cardIds =
      packCards
        .map(
          (packCard) =>
            packCard.card?._id
        )
        .filter(Boolean);

    const tcgIds =
      packCards
        .map(
          (packCard) =>
            packCard.card?.tcgId
        )
        .filter(Boolean);

    // =================================================
    // DEBUG
    // =================================================

    console.log(
      "========================================"
    );

    console.log(
      "RIP INVENTORY CHECK"
    );

    console.log(
      "Pack:",
      pack.name
    );

    console.log(
      "Pack ID:",
      String(pack._id)
    );

    console.log(
      "Pack cards:",
      packCards.map(
        (item) => ({
          cardId:
            String(
              item.card._id
            ),

          name:
            item.card.name,

          tcgId:
            item.card.tcgId,

          quantity:
            item.quantity,

          pullWeight:
            item.pullWeight,
        })
      )
    );

    console.log(
      "========================================"
    );

    // =================================================
    // FIND INVENTORY
    // =================================================

    let inventories =
      await CardInventory.find({
        card: {
          $in: cardIds,
        },
      })
        .populate(
          "card",
          "name tcgId number rarity image imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
        .session(session);

    // =================================================
    // FALLBACK TO TCG ID
    // =================================================

    if (
      inventories.length === 0 &&
      tcgIds.length > 0
    ) {
      const allInventories =
        await CardInventory.find({})
          .populate(
            "card",
            "name tcgId number rarity image imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
          )
          .session(session);

      inventories =
        allInventories.filter(
          (inventory) =>
            inventory.card &&
            inventory.card.tcgId &&
            tcgIds.includes(
              inventory.card.tcgId
            )
        );
    }

    // =================================================
    // LOG INVENTORY
    // =================================================

    console.log(
      "INVENTORY FOUND:",
      inventories.map(
        (inventory) => ({
          inventoryId:
            String(
              inventory._id
            ),

          cardId:
            inventory.card
              ? String(
                  inventory.card._id
                )
              : null,

          name:
            inventory.card?.name ||
            null,

          tcgId:
            inventory.card?.tcgId ||
            null,

          available:
            Number(
              inventory.available ||
              0
            ),

          reserved:
            Number(
              inventory.reserved ||
              0
            ),

          consumed:
            Number(
              inventory.consumed ||
              0
            ),
        })
      )
    );

    // =================================================
    // NO INVENTORY RECORD
    // =================================================

    if (
      inventories.length === 0
    ) {
      await session.abortTransaction();

      console.error(
        "NO INVENTORY RECORD FOUND"
      );

      return res.status(400).json({
        success: false,

        message:
          "No inventory record exists for the cards in this pack",

        debug: {
          packId:
            String(pack._id),

          packName:
            pack.name,

          cards:
            packCards.map(
              (packCard) => ({
                cardId:
                  String(
                    packCard.card._id
                  ),

                name:
                  packCard.card.name,

                tcgId:
                  packCard.card.tcgId ||
                  null,

                quantity:
                  packCard.quantity,

                pullWeight:
                  packCard.pullWeight,
              })
            ),
        },
      });
    }

    // =================================================
    // INVENTORY MAP
    // =====================================================

    const inventoryByCardId =
      new Map();

    const inventoryByTcgId =
      new Map();

    inventories.forEach(
      (inventory) => {
        if (!inventory.card) {
          return;
        }

        inventoryByCardId.set(
          String(
            inventory.card._id
          ),
          inventory
        );

        if (
          inventory.card.tcgId
        ) {
          inventoryByTcgId.set(
            String(
              inventory.card.tcgId
            ),
            inventory
          );
        }
      }
    );

    // =================================================
    // BUILD AVAILABLE CARD POOL
    // =====================================================

    const availableCards = [];

    const inventoryDebug = [];

    for (
      const packCard of packCards
    ) {
      const card =
        packCard.card;

      let inventory =
        inventoryByCardId.get(
          String(card._id)
        );

      // Fallback using TCG ID
      if (
        !inventory &&
        card.tcgId
      ) {
        inventory =
          inventoryByTcgId.get(
            String(
              card.tcgId
            )
          );
      }

      inventoryDebug.push({
        cardId:
          String(card._id),

        name:
          card.name,

        tcgId:
          card.tcgId ||
          null,

        inventoryFound:
          Boolean(inventory),

        available:
          inventory
            ? Number(
                inventory.available ||
                0
              )
            : 0,

        reserved:
          inventory
            ? Number(
                inventory.reserved ||
                0
              )
            : 0,

        consumed:
          inventory
            ? Number(
                inventory.consumed ||
                0
              )
            : 0,
      });

      if (
        inventory &&
        Number(
          inventory.available || 0
        ) > 0
      ) {
        availableCards.push({
          packCard,
          inventory,
        });
      }
    }

    console.log(
      "CARD INVENTORY MATCH RESULT:",
      inventoryDebug
    );

    // =================================================
    // NO AVAILABLE CARDS
    // =================================================

    if (
      availableCards.length === 0
    ) {
      await session.abortTransaction();

      console.error(
        "NO AVAILABLE CARD"
      );

      return res.status(400).json({
        success: false,

        message:
          "No cards are currently available in inventory",

        debug: {
          packId:
            String(pack._id),

          packName:
            pack.name,

          cards:
            inventoryDebug,
        },
      });
    }

    // =================================================
    // WEIGHTED RANDOM
    // =================================================

    const totalWeight =
      availableCards.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.packCard
              .pullWeight || 0
          ),
        0
      );

    if (
      totalWeight <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid card pull weights",
      });
    }

    let random =
      Math.random() *
      totalWeight;

    let selectedItem =
      null;

    for (
      const item of
        availableCards
    ) {
      random -= Number(
        item.packCard
          .pullWeight || 0
      );

      if (
        random <= 0
      ) {
        selectedItem =
          item;

        break;
      }
    }

    // =================================================
    // SAFETY FALLBACK
    // =================================================

    if (!selectedItem) {
      selectedItem =
        availableCards[
          availableCards.length -
            1
        ];
    }

    const selectedPackCard =
      selectedItem.packCard;

    const selectedCard =
      selectedPackCard.card;

    const selectedInventory =
      selectedItem.inventory;

    // =================================================
    // CONSUME ONE INVENTORY CARD
    // =================================================

    const updatedInventory =
      await CardInventory.findOneAndUpdate(
        {
          _id:
            selectedInventory._id,

          available: {
            $gt: 0,
          },
        },

        {
          $inc: {
            available: -1,
            consumed: 1,
          },
        },

        {
          new: true,
          session,
        }
      );

    if (
      !updatedInventory
    ) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Card was taken by another user. Please try again.",
      });
    }

    // =================================================
    // CARD MARKET PRICE
    // =================================================

    const marketPrice =
      Number(
        selectedCard.price ||
        0
      );

    // =================================================
    // 5 MINUTE DECISION WINDOW
    // =================================================

    const revealedAt =
      new Date();

    const decisionDeadline =
      new Date(
        revealedAt.getTime() +
          5 * 60 * 1000
      );

    // =================================================
    // UPDATE USER PACK
    // =================================================

    userPack.cardsRemaining =
      Math.max(
        0,
        Number(
          userPack.cardsRemaining ||
          0
        ) - 1
      );

    userPack.cardsRipped =
      Number(
        userPack.cardsRipped ||
        0
      ) + 1;

    if (
      Number(
        userPack.cardsRemaining
      ) === 0
    ) {
      userPack.status =
        "COMPLETED";
    }

    await userPack.save({
      session,
    });

    // =================================================
    // CREATE USER PACK CARD
    // =================================================

    const createdCards =
      await UserPackCard.create(
        [
          {
            user:
              userId,

            userPack:
              userPack._id,

            card:
              selectedCard._id,

            marketPrice:
              marketPrice,

            status:
              "REVEALED",

            revealedAt:
              revealedAt,

            decisionDeadline:
              decisionDeadline,
          },
        ],
        {
          session,
        }
      );

    const userPackCard =
      createdCards[0];

    // =================================================
    // COMMIT
    // =================================================

    await session.commitTransaction();

    console.log(
      "========================================"
    );

    console.log(
      "CARD REVEALED"
    );

    console.log(
      "Card:",
      selectedCard.name
    );

    console.log(
      "Image:",
      selectedCard.imageLarge ||
        selectedCard.image ||
        selectedCard.imageSmall
    );

    console.log(
      "Price:",
      marketPrice
    );

    console.log(
      "Inventory available:",
      updatedInventory.available
    );

    console.log(
      "========================================"
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Card revealed successfully",

      data: {
        card: {
          _id:
            selectedCard._id,

          name:
            selectedCard.name,

          tcgId:
            selectedCard.tcgId,

          number:
            selectedCard.number,

          rarity:
            selectedCard.rarity,

          image:
            selectedCard.image,

          imageSmall:
            selectedCard.imageSmall,

          imageLarge:
            selectedCard.imageLarge,

          set:
            selectedCard.set,

          price:
            marketPrice,

          priceCurrency:
            selectedCard.priceCurrency,

          priceSource:
            selectedCard.priceSource,

          priceLastUpdated:
            selectedCard.priceLastUpdated,
        },

        userPackCard: {
          _id:
            userPackCard._id,

          status:
            userPackCard.status,

          marketPrice:
            userPackCard.marketPrice,

          revealedAt:
            userPackCard.revealedAt,

          decisionDeadline:
            userPackCard.decisionDeadline,
        },

        pack: {
          _id:
            userPack._id,

          cardsTotal:
            userPack.cardsTotal,

          cardsRemaining:
            userPack.cardsRemaining,

          cardsRipped:
            userPack.cardsRipped,

          status:
            userPack.status,
        },

        inventory: {
          available:
            updatedInventory.available,

          reserved:
            updatedInventory.reserved,

          consumed:
            updatedInventory.consumed,
        },
      },
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Transaction abort error:",
        abortError
      );
    }

    console.error(
      "========================================"
    );

    console.error(
      "RIP CARD ERROR:"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to rip card",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// SELL REVEALED CARD
// POST /api/rip/:userPackId/sell
// =====================================================

const sellCard = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    const { userPackId } =
      req.params;

    // =================================================
    // AUTH
    // =================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated",
      });
    }

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        userPackId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user pack ID",
      });
    }

    await session.startTransaction();

    // =================================================
    // FIND REVEALED CARD
    // IMPORTANT:
    // POPULATE CARD SO IMAGE IS AVAILABLE
    // =================================================

    const userPackCard =
      await UserPackCard.findOne({
        user: userId,

        userPack:
          userPackId,

        status:
          "REVEALED",
      })
        .populate(
          "card",
          "name tcgId number rarity image imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
        .sort({
          revealedAt: -1,
        })
        .session(session);

    if (!userPackCard) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "No revealed card is waiting for a decision",
      });
    }

    // =================================================
    // CHECK 5 MINUTE WINDOW
    // =================================================

    const now =
      new Date();

    if (
      userPackCard.decisionDeadline &&
      now >
        new Date(
          userPackCard.decisionDeadline
        )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "The 5-minute decision window has expired",

        expired: true,
      });
    }

    // =================================================
    // SELL AMOUNT
    // =================================================

    const sellAmount =
      Number(
        userPackCard.marketPrice ||
        0
      );

    if (
      !Number.isFinite(
        sellAmount
      ) ||
      sellAmount < 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Invalid card sale value",
      });
    }

    // =================================================
    // GET / CREATE WALLET
    // =================================================

    let wallet =
      await Wallet.findOne({
        user: userId,
      }).session(session);

    if (!wallet) {
      wallet =
        new Wallet({
          user: userId,

          balance:
            0,
        });
    }

    // =================================================
    // CREDIT WALLET
    // =================================================

    wallet.balance =
      Number(
        wallet.balance || 0
      ) + sellAmount;

    await wallet.save({
      session,
    });

    // =================================================
    // UPDATE CARD
    // =================================================

    userPackCard.status =
      "SOLD";

    userPackCard.soldAt =
      now;

    await userPackCard.save({
      session,
    });

    // =================================================
    // COMMIT
    // =================================================

    await session.commitTransaction();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Card sold successfully",

      data: {
        soldAmount:
          sellAmount,

        walletBalance:
          Number(
            wallet.balance
          ),

        // IMPORTANT:
        // Return card + image after SELL
        userPackCard: {
          _id:
            userPackCard._id,

          status:
            userPackCard.status,

          marketPrice:
            userPackCard.marketPrice,

          revealedAt:
            userPackCard.revealedAt,

          decisionDeadline:
            userPackCard.decisionDeadline,

          soldAt:
            userPackCard.soldAt,

          card:
            userPackCard.card
              ? {
                  _id:
                    userPackCard.card._id,

                  name:
                    userPackCard.card.name,

                  tcgId:
                    userPackCard.card.tcgId,

                  number:
                    userPackCard.card.number,

                  rarity:
                    userPackCard.card.rarity,

                  image:
                    userPackCard.card.image,

                  imageSmall:
                    userPackCard.card.imageSmall,

                  imageLarge:
                    userPackCard.card.imageLarge,

                  set:
                    userPackCard.card.set,

                  price:
                    userPackCard.card.price,

                  priceCurrency:
                    userPackCard.card.priceCurrency,

                  priceSource:
                    userPackCard.card.priceSource,

                  priceLastUpdated:
                    userPackCard.card.priceLastUpdated,
                }
              : null,
        },
      },
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Transaction abort error:",
        abortError
      );
    }

    console.error(
      "Sell card error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to sell card",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// SHIP REVEALED CARD
// POST /api/rip/:userPackId/ship
// =====================================================

const shipCard = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    const { userPackId } =
      req.params;

    const SHIPPING_FEE =
      5;

    // =================================================
    // AUTH
    // =================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated",
      });
    }

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        userPackId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user pack ID",
      });
    }

    await session.startTransaction();

    // =================================================
    // FIND REVEALED CARD
    // IMPORTANT:
    // POPULATE CARD SO IMAGE IS AVAILABLE
    // =================================================

    const userPackCard =
      await UserPackCard.findOne({
        user: userId,

        userPack:
          userPackId,

        status:
          "REVEALED",
      })
        .populate(
          "card",
          "name tcgId number rarity image imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
        .sort({
          revealedAt: -1,
        })
        .session(session);

    if (!userPackCard) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,

        message:
          "No revealed card is waiting for a decision",
      });
    }

    // =================================================
    // CHECK DEADLINE
    // =================================================

    const now =
      new Date();

    if (
      userPackCard.decisionDeadline &&
      now >
        new Date(
          userPackCard.decisionDeadline
        )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "The 5-minute decision window has expired",

        expired: true,
      });
    }

    // =================================================
    // FIND WALLET
    // =================================================

    const wallet =
      await Wallet.findOne({
        user: userId,
      }).session(session);

    if (!wallet) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Wallet not found",
      });
    }

    // =================================================
    // CURRENT BALANCE
    // =================================================

    const currentBalance =
      Number(
        wallet.balance || 0
      );

    // =================================================
    // CHECK SHIPPING FEE
    // =================================================

    if (
      currentBalance <
      SHIPPING_FEE
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Insufficient wallet balance for $5 shipping fee",

        required:
          SHIPPING_FEE,

        walletBalance:
          currentBalance,
      });
    }

    // =================================================
    // DEDUCT SHIPPING FEE
    // =================================================

    wallet.balance =
      currentBalance -
      SHIPPING_FEE;

    await wallet.save({
      session,
    });

    // =================================================
    // UPDATE CARD
    // =================================================

    userPackCard.status =
      "SHIPPING";

    await userPackCard.save({
      session,
    });

    // =================================================
    // COMMIT
    // =================================================

    await session.commitTransaction();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Card added to shipping",

      data: {
        shippingFee:
          SHIPPING_FEE,

        walletBalance:
          Number(
            wallet.balance
          ),

        // IMPORTANT:
        // Return card + image after SHIP
        userPackCard: {
          _id:
            userPackCard._id,

          status:
            userPackCard.status,

          marketPrice:
            userPackCard.marketPrice,

          revealedAt:
            userPackCard.revealedAt,

          decisionDeadline:
            userPackCard.decisionDeadline,

          shippingFee:
            SHIPPING_FEE,

          card:
            userPackCard.card
              ? {
                  _id:
                    userPackCard.card._id,

                  name:
                    userPackCard.card.name,

                  tcgId:
                    userPackCard.card.tcgId,

                  number:
                    userPackCard.card.number,

                  rarity:
                    userPackCard.card.rarity,

                  image:
                    userPackCard.card.image,

                  imageSmall:
                    userPackCard.card.imageSmall,

                  imageLarge:
                    userPackCard.card.imageLarge,

                  set:
                    userPackCard.card.set,

                  price:
                    userPackCard.card.price,

                  priceCurrency:
                    userPackCard.card.priceCurrency,

                  priceSource:
                    userPackCard.card.priceSource,

                  priceLastUpdated:
                    userPackCard.card.priceLastUpdated,
                }
              : null,
        },
      },
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Transaction abort error:",
        abortError
      );
    }

    console.error(
      "Ship card error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to ship card",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  ripCard,
  sellCard,
  shipCard,
};