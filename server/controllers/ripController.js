const mongoose = require("mongoose");

// =====================================================
// MODELS
// =====================================================

const User = require("../models/User");
const UserPack = require("../models/UserPack");
const UserPackCard = require("../models/UserPackCard");
const Pack = require("../models/Pack");
const CardInventory = require("../models/CardInventory");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Redemption = require("../models/Redemption");

// =====================================================
// CONSTANTS
// =====================================================

const SHIPPING_FEE = 5;

const USER_SELL_PERCENT = 0.80;

const ADMIN_FEE_PERCENT = 0.20;


// =====================================================
// HELPER
// Get logged-in user ID
// =====================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};


// =====================================================
// RIP CARD
//
// POST /api/rip/:userPackId
//
// Reveals one card from the user's pack.
//
// User then has 5 minutes to:
// SELL
// OR
// SHIP
// =====================================================

const ripCard = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = getUserId(req);

    const { userPackId } = req.params;

    // =================================================
    // AUTHENTICATION
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

    session.startTransaction();

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
      Number(userPack.cardsRemaining || 0) <= 0
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
          "name tcgId number rarity imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
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
    // GET VALID PACK CARDS
    // =================================================

    const packCards =
      (pack.cards || []).filter(
        (packCard) =>
          packCard.card &&
          Number(
            packCard.quantity || 0
          ) > 0 &&
          Number(
            packCard.pullWeight || 0
          ) > 0
      );

    if (
      packCards.length === 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "No cards configured in this pack",
      });
    }

    // =================================================
    // CARD IDS
    // =================================================

    const cardIds =
      packCards.map(
        (packCard) =>
          packCard.card._id
      );

    // =================================================
    // FIND AVAILABLE INVENTORY
    // =================================================

    const inventories =
      await CardInventory.find({
        card: {
          $in: cardIds,
        },

        available: {
          $gt: 0,
        },
      }).session(session);

    if (
      inventories.length === 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "No cards are currently available in inventory",
      });
    }

    // =================================================
    // INVENTORY MAP
    // =================================================

    const inventoryMap =
      new Map();

    inventories.forEach(
      (inventory) => {
        inventoryMap.set(
          String(
            inventory.card
          ),
          inventory
        );
      }
    );

    // =================================================
    // CARDS WITH STOCK ONLY
    // =================================================

    const availableCards =
      packCards.filter(
        (packCard) =>
          inventoryMap.has(
            String(
              packCard.card._id
            )
          )
      );

    if (
      availableCards.length === 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Cards from this pack are currently out of stock",
      });
    }

    // =================================================
    // TOTAL PULL WEIGHT
    // =================================================

    const totalWeight =
      availableCards.reduce(
        (total, packCard) =>
          total +
          Number(
            packCard.pullWeight || 0
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

    // =================================================
    // WEIGHTED RANDOM CARD
    // =================================================

    let random =
      Math.random() *
      totalWeight;

    let selectedPackCard =
      null;

    for (
      const packCard
      of availableCards
    ) {
      random -= Number(
        packCard.pullWeight || 0
      );

      if (
        random <= 0
      ) {
        selectedPackCard =
          packCard;

        break;
      }
    }

    // =================================================
    // FALLBACK
    // =================================================

    if (
      !selectedPackCard
    ) {
      selectedPackCard =
        availableCards[
          availableCards.length - 1
        ];
    }

    const selectedCard =
      selectedPackCard.card;

    // =================================================
    // SELECTED INVENTORY
    // =================================================

    const selectedInventory =
      inventoryMap.get(
        String(
          selectedCard._id
        )
      );

    if (
      !selectedInventory ||
      Number(
        selectedInventory.available
      ) <= 0
    ) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Selected card is no longer available",
      });
    }

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
    // MARKET PRICE
    // =================================================

    const marketPrice =
      Number(
        selectedCard.price || 0
      );

    // =================================================
    // REVEAL TIME
    // =================================================

    const revealedAt =
      new Date();

    // =================================================
    // 5 MINUTE DEADLINE
    // =================================================

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
          userPack.cardsRemaining || 0
        ) - 1
      );

    userPack.cardsRipped =
      Number(
        userPack.cardsRipped || 0
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
            user: userId,

            userPack:
              userPack._id,

            card:
              selectedCard._id,

            marketPrice,

            status:
              "REVEALED",

            revealedAt,

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

          imageSmall:
            selectedCard.imageSmall,

          imageLarge:
            selectedCard.imageLarge,

          set:
            selectedCard.set,

          price:
            selectedCard.price,

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
      },
    });

  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Abort transaction error:",
        abortError
      );
    }

    console.error(
      "Rip card error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to reveal card",
    });

  } finally {
    await session.endSession();
  }
};


// =====================================================
// SELL CARD
//
// POST /api/rip/:userPackId/sell
//
// 80% → USER
// 20% → ADMIN
//
// Card → INVENTORY
// =====================================================

const sellCard = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      getUserId(req);

    const {
      userPackId,
    } = req.params;

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

    session.startTransaction();

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
          "User pack not found",
      });
    }

    // =================================================
    // FIND REVEALED CARD
    // =================================================

    const userPackCard =
      await UserPackCard.findOne({
        user: userId,

        userPack:
          userPackId,

        status:
          "REVEALED",
      })
        .sort({
          revealedAt: -1,
        })
        .populate(
          "card",
          "name tcgId number rarity imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
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
    // CARD VALUE
    // =================================================

    const cardValue =
      Number(
        userPackCard.marketPrice || 0
      );

    if (
      !Number.isFinite(
        cardValue
      ) ||
      cardValue <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid card sale value",
      });
    }

    // =================================================
    // USER 80%
    // =================================================

    const userAmount =
      Number(
        (
          cardValue *
          USER_SELL_PERCENT
        ).toFixed(2)
      );

    // =================================================
    // ADMIN 20%
    // =================================================

    const adminFee =
      Number(
        (
          cardValue *
          ADMIN_FEE_PERCENT
        ).toFixed(2)
      );

    // =================================================
    // FIND USER WALLET
    // =================================================

    let userWallet =
      await Wallet.findOne({
        user: userId,
      }).session(session);

    // =================================================
    // CREATE USER WALLET IF MISSING
    // =================================================

    if (!userWallet) {
      userWallet =
        new Wallet({
          user: userId,
          balance: 0,
        });

      await userWallet.save({
        session,
      });
    }

    // =================================================
    // FIND ACTIVE ADMIN
    // =================================================

    const adminUser =
      await User.findOne({
        role: "ADMIN",
        status: "ACTIVE",
      })
        .sort({
          createdAt: 1,
        })
        .session(session);

    if (!adminUser) {
      await session.abortTransaction();

      return res.status(500).json({
        success: false,
        message:
          "Active admin account not found",
      });
    }

    // =================================================
    // FIND ADMIN WALLET
    // =================================================

    let adminWallet =
      await Wallet.findOne({
        user:
          adminUser._id,
      }).session(session);

    // =================================================
    // CREATE ADMIN WALLET
    // =================================================

    if (!adminWallet) {
      adminWallet =
        new Wallet({
          user:
            adminUser._id,

          balance:
            0,
        });

      await adminWallet.save({
        session,
      });
    }

    // =================================================
    // CREDIT USER 80%
    // =================================================

    userWallet.balance =
      Number(
        (
          Number(
            userWallet.balance || 0
          ) +
          userAmount
        ).toFixed(2)
      );

    await userWallet.save({
      session,
    });

    // =================================================
    // CREDIT ADMIN 20%
    // =================================================

    adminWallet.balance =
      Number(
        (
          Number(
            adminWallet.balance || 0
          ) +
          adminFee
        ).toFixed(2)
      );

    await adminWallet.save({
      session,
    });

    // =================================================
    // USER SELL TRANSACTION
    // =================================================

    await WalletTransaction.create(
      [
        {
          user:
            userId,

          type:
            "SELL",

          amount:
            userAmount,

          status:
            "APPROVED",

          note:
            `Card sold for $${cardValue.toFixed(
              2
            )}. User received 80%.`,

          referenceId:
            userPackCard._id,

          referenceType:
            "UserPackCard",

          processedAt:
            now,
        },
      ],
      {
        session,
      }
    );

    // =================================================
    // ADMIN FEE TRANSACTION
    // =================================================

    await WalletTransaction.create(
      [
        {
          user:
            adminUser._id,

          type:
            "ADMIN_FEE",

          amount:
            adminFee,

          status:
            "APPROVED",

          note:
            `20% platform fee from card sale of $${cardValue.toFixed(
              2
            )}.`,

          referenceId:
            userPackCard._id,

          referenceType:
            "UserPackCard",

          processedAt:
            now,
        },
      ],
      {
        session,
      }
    );

    // =================================================
    // FIND CARD INVENTORY
    // =================================================

    const inventory =
      await CardInventory.findOne({
        card:
          userPackCard.card._id,
      }).session(session);

    if (!inventory) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Card inventory record not found",
      });
    }

    // =================================================
    // RETURN CARD TO INVENTORY
    // =================================================

    inventory.available =
      Number(
        inventory.available || 0
      ) + 1;

    inventory.consumed =
      Math.max(
        0,
        Number(
          inventory.consumed || 0
        ) - 1
      );

    inventory.status =
      inventory.available > 0
        ? "ACTIVE"
        : "OUT_OF_STOCK";

    await inventory.save({
      session,
    });

    // =================================================
    // UPDATE USER PACK CARD
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
        cardValue,

        userAmount,

        adminFee,

        walletBalance:
          Number(
            userWallet.balance
          ),

        adminWalletBalance:
          Number(
            adminWallet.balance
          ),

        userPackCard: {
          _id:
            userPackCard._id,

          status:
            userPackCard.status,

          marketPrice:
            userPackCard.marketPrice,

          soldAt:
            userPackCard.soldAt,

          revealedAt:
            userPackCard.revealedAt,

          decisionDeadline:
            userPackCard.decisionDeadline,

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

                  imageSmall:
                    userPackCard.card.imageSmall,

                  imageLarge:
                    userPackCard.card.imageLarge,

                  set:
                    userPackCard.card.set,

                  price:
                    userPackCard.card.price,
                }
              : null,
        },

        inventory: {
          available:
            inventory.available,

          reserved:
            inventory.reserved,

          consumed:
            inventory.consumed,

          status:
            inventory.status,
        },
      },
    });

  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Abort transaction error:",
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
// SHIP CARD
//
// POST /api/rip/:userPackId/ship
//
// User pays $5.
//
// Address is saved.
//
// Card is NOT returned to inventory.
//
// Status → SHIPPING
//
// Redemption is created with:
// status → PENDING
// =====================================================

const shipCard = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      getUserId(req);

    const {
      userPackId,
    } = req.params;

    // =================================================
    // ADDRESS
    // =================================================

    const {
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = req.body || {};

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

    // =================================================
    // VALIDATE ADDRESS
    // =================================================

    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete shipping address is required",
      });
    }

    // =================================================
    // VALIDATE EMAIL
    // =================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        String(email).trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid email address",
      });
    }

    // =================================================
    // START TRANSACTION
    // =================================================

    session.startTransaction();

    // =================================================
    // FIND USER PACK
    // =================================================

    const userPack =
      await UserPack.findOne({
        _id:
          userPackId,

        user:
          userId,
      })
        .session(session);

    if (!userPack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "User pack not found",
      });
    }

    // =================================================
    // FIND REVEALED CARD
    // =================================================

    const userPackCard =
      await UserPackCard.findOne({
        user:
          userId,

        userPack:
          userPackId,

        status:
          "REVEALED",
      })
        .sort({
          revealedAt: -1,
        })
        .populate(
          "card",
          "name tcgId number rarity imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
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
    // CHECK EXISTING REDEMPTION
    // =================================================

    const existingRedemption =
      await Redemption.findOne({
        userPackCard:
          userPackCard._id,
      }).session(session);

    if (existingRedemption) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "A redemption already exists for this card",
      });
    }

    // =================================================
    // FIND USER WALLET
    // =================================================

    const wallet =
      await Wallet.findOne({
        user:
          userId,
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
    // CHECK $5
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
    // DEDUCT $5
    // =================================================

    wallet.balance =
      Number(
        (
          currentBalance -
          SHIPPING_FEE
        ).toFixed(2)
      );

    await wallet.save({
      session,
    });

    // =================================================
    // SHIPPING TRANSACTION
    // =================================================

    await WalletTransaction.create(
      [
        {
          user:
            userId,

          type:
            "SHIPPING",

          amount:
            SHIPPING_FEE,

          status:
            "APPROVED",

          note:
            `Shipping fee for ${
              userPackCard.card?.name ||
              "Pokemon card"
            }`,

          referenceId:
            userPackCard._id,

          referenceType:
            "UserPackCard",

          processedAt:
            now,
        },
      ],
      {
        session,
      }
    );

    // =================================================
    // SAVE SHIPPING ADDRESS
    // =================================================

    userPackCard.shippingAddress = {
      fullName:
        String(
          fullName
        ).trim(),

      email:
        String(
          email
        ).trim(),

      phone:
        String(
          phone
        ).trim(),

      addressLine1:
        String(
          addressLine1
        ).trim(),

      addressLine2:
        String(
          addressLine2 || ""
        ).trim(),

      city:
        String(
          city
        ).trim(),

      state:
        String(
          state
        ).trim(),

      postalCode:
        String(
          postalCode
        ).trim(),

      country:
        String(
          country
        ).trim(),
    };

    // =================================================
    // SAVE SHIPPING FEE
    // =================================================

    userPackCard.shippingFee =
      SHIPPING_FEE;

    // =================================================
    // CHANGE STATUS
    // =================================================

    userPackCard.status =
      "SHIPPING";

    // Do NOT set shippedAt here.
    // It should remain null until actually shipped.

    userPackCard.shippedAt =
      null;

    // =================================================
    // SAVE USER PACK CARD
    // =================================================

    await userPackCard.save({
      session,
    });

    // =================================================
    // CREATE REDEMPTION
    //
    // This creates the admin redemption record.
    //
    // Initial status:
    // PENDING
    //
    // Admin can later:
    // PENDING → APPROVED
    // PENDING → REJECTED
    // =================================================

    const redemption =
      new Redemption({
        user:
          userId,

        userPackCard:
          userPackCard._id,

        userPack:
          userPack._id,

        card:
          userPackCard.card._id,

        pack:
          userPack.pack,

        marketPrice:
          Number(
            userPackCard.marketPrice || 0
          ),

        shippingFee:
          SHIPPING_FEE,

        shippingAddress: {
          fullName:
            userPackCard
              .shippingAddress
              .fullName,

          email:
            userPackCard
              .shippingAddress
              .email,

          phone:
            userPackCard
              .shippingAddress
              .phone,

          addressLine1:
            userPackCard
              .shippingAddress
              .addressLine1,

          addressLine2:
            userPackCard
              .shippingAddress
              .addressLine2,

          city:
            userPackCard
              .shippingAddress
              .city,

          state:
            userPackCard
              .shippingAddress
              .state,

          postalCode:
            userPackCard
              .shippingAddress
              .postalCode,

          country:
            userPackCard
              .shippingAddress
              .country,
        },

        status:
          "PENDING",

        rejectionReason:
          null,

        processedBy:
          null,

        processedAt:
          null,

        shipment:
          null,

        completedAt:
          null,
      });

    await redemption.save({
      session,
    });

    // =================================================
    // IMPORTANT
    //
    // DO NOT RETURN CARD TO INVENTORY.
    //
    // The card belongs to the user
    // and is waiting for shipment.
    // =================================================

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
        "Card submitted for redemption successfully",

      data: {
        redemption: {
          _id:
            redemption._id,

          redemptionNumber:
            redemption.redemptionNumber,

          status:
            redemption.status,

          createdAt:
            redemption.createdAt,
        },

        shippingFee:
          SHIPPING_FEE,

        walletBalance:
          Number(
            wallet.balance
          ),

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
            userPackCard.shippingFee,

          shippingAddress:
            userPackCard.shippingAddress,

          shippedAt:
            userPackCard.shippedAt,

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
                    userPackCard.card
                      .priceLastUpdated,
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
        "Abort transaction error:",
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
// EXPORT
// =====================================================

module.exports = {
  ripCard,
  sellCard,
  shipCard,
};