const mongoose = require("mongoose");

// =====================================================
// MODELS
// =====================================================

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Pack = require("../models/Pack");
const Card = require("../models/Card");
const CardInventory = require("../models/CardInventory");
const UserPack = require("../models/UserPack");
const UserPackCard = require("../models/UserPackCard");


// =====================================================
// GET COMPLETE ADMIN REPORT
//
// GET /api/admin/report
// =====================================================

const getAdminReport = async (req, res) => {
  try {
    console.log("=================================");
    console.log("GENERATING ADMIN REPORT");
    console.log("=================================");

    // =================================================
    // ADMIN
    // =================================================

    let admin = null;

    try {
      if (req.user?.id) {
        admin = await User.findById(
          req.user.id
        )
          .select("-password")
          .lean();
      }
    } catch (error) {
      console.error(
        "Admin profile report error:",
        error.message
      );
    }

    // =================================================
    // USERS
    // =================================================

    const totalUsers =
      await User.countDocuments({
        role: "USER",
      });

    const activeUsers =
      await User.countDocuments({
        role: "USER",
        status: "ACTIVE",
      });

    const suspendedUsers =
      await User.countDocuments({
        role: "USER",
        status: "SUSPENDED",
      });

    const recentUsers =
      await User.find({
        role: "USER",
      })
        .select(
          "name email mobile phone status createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // =================================================
    // WALLET
    // =================================================

    const totalWalletTransactions =
      await WalletTransaction.countDocuments();

    const pendingWalletTransactions =
      await WalletTransaction.countDocuments({
        status: "PENDING",
      });

    const approvedWalletTransactions =
      await WalletTransaction.countDocuments({
        status: "APPROVED",
      });

    const rejectedWalletTransactions =
      await WalletTransaction.countDocuments({
        status: "REJECTED",
      });

    // =================================================
    // WALLET BY TYPE
    // =================================================

    const deposits =
      await WalletTransaction.aggregate([
        {
          $match: {
            type: "DEPOSIT",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
            amount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const withdrawals =
      await WalletTransaction.aggregate([
        {
          $match: {
            type: "WITHDRAWAL",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
            amount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const purchases =
      await WalletTransaction.aggregate([
        {
          $match: {
            type: "PURCHASE",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
            amount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    // =================================================
    // WALLET BALANCE
    // =================================================

    const walletBalance =
      await Wallet.aggregate([
        {
          $group: {
            _id: null,

            totalBalance: {
              $sum: {
                $ifNull: [
                  "$balance",
                  0,
                ],
              },
            },

            wallets: {
              $sum: 1,
            },
          },
        },
      ]);

    // =================================================
    // RECENT TRANSACTIONS
    // =================================================

    const recentTransactions =
      await WalletTransaction.find({})
        .populate(
          "user",
          "name email"
        )
        .populate(
          "processedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

    // =================================================
    // PACKS
    // =================================================

    const totalPacks =
      await Pack.countDocuments();

    const publishedPacks =
      await Pack.countDocuments({
        status: "PUBLISHED",
      });

    const draftPacks =
      await Pack.countDocuments({
        status: "DRAFT",
      });

    const pausedPacks =
      await Pack.countDocuments({
        status: "PAUSED",
      });

    const archivedPacks =
      await Pack.countDocuments({
        status: "ARCHIVED",
      });

    // =================================================
    // PACK STOCK
    // =================================================

    const packStock =
      await Pack.aggregate([
        {
          $group: {
            _id: null,

            totalStock: {
              $sum: {
                $ifNull: [
                  "$totalStock",
                  0,
                ],
              },
            },

            totalPackValue: {
              $sum: {
                $multiply: [
                  {
                    $ifNull: [
                      "$price",
                      0,
                    ],
                  },
                  {
                    $ifNull: [
                      "$totalStock",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      ]);

    const recentPacks =
      await Pack.find({})
        .populate(
          "category",
          "name slug image"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // =================================================
    // CARDS
    // =================================================

    const totalCards =
      await Card.countDocuments();

    const activeCards =
      await Card.countDocuments({
        status: "ACTIVE",
      });

    const archivedCards =
      await Card.countDocuments({
        status: "ARCHIVED",
      });

    // =================================================
    // INVENTORY
    // =================================================

    const inventory =
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

    // =================================================
    // CARD OPENING SUMMARY
    // =================================================

    const now = new Date();

    // Start of today
    const startOfToday =
      new Date(now);

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    // Start of this month
    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

    const totalCardReveals =
      await UserPackCard.countDocuments();

    const cardsOpenedToday =
      await UserPackCard.countDocuments({
        revealedAt: {
          $gte: startOfToday,
        },
      });

    const cardsOpenedThisMonth =
      await UserPackCard.countDocuments({
        revealedAt: {
          $gte: startOfMonth,
        },
      });

    const cardsWaitingForDecision =
      await UserPackCard.countDocuments({
        status: "REVEALED",

        decisionDeadline: {
          $gt: now,
        },
      });

    // =================================================
    // FINAL RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        // ---------------------------------------------
        // ADMIN
        // ---------------------------------------------

        admin,

        // ---------------------------------------------
        // USERS
        // ---------------------------------------------

        users: {
          total:
            totalUsers,

          active:
            activeUsers,

          suspended:
            suspendedUsers,

          recent:
            recentUsers,
        },

        // ---------------------------------------------
        // WALLET
        // ---------------------------------------------

        wallet: {
          totalTransactions:
            totalWalletTransactions,

          pending:
            pendingWalletTransactions,

          approved:
            approvedWalletTransactions,

          rejected:
            rejectedWalletTransactions,

          balance:
            walletBalance[0] || {
              totalBalance: 0,
              wallets: 0,
            },

          deposits:
            deposits[0] || {
              count: 0,
              amount: 0,
            },

          withdrawals:
            withdrawals[0] || {
              count: 0,
              amount: 0,
            },

          purchases:
            purchases[0] || {
              count: 0,
              amount: 0,
            },

          recentTransactions:
            recentTransactions,
        },

        // ---------------------------------------------
        // PACKS
        // ---------------------------------------------

        packs: {
          total:
            totalPacks,

          published:
            publishedPacks,

          draft:
            draftPacks,

          paused:
            pausedPacks,

          archived:
            archivedPacks,

          stock:
            packStock[0] || {
              totalStock: 0,
              totalPackValue: 0,
            },

          recent:
            recentPacks,
        },

        // ---------------------------------------------
        // CARDS
        // ---------------------------------------------

        cards: {
          total:
            totalCards,

          active:
            activeCards,

          archived:
            archivedCards,
        },

        // ---------------------------------------------
        // INVENTORY
        // ---------------------------------------------

        inventory:
          inventory[0] || {
            available: 0,
            reserved: 0,
            consumed: 0,
            cards: 0,
          },

        // ---------------------------------------------
        // OPENINGS
        // ---------------------------------------------

        openings: {
          today:
            cardsOpenedToday,

          thisMonth:
            cardsOpenedThisMonth,

          total:
            totalCardReveals,

          pending:
            cardsWaitingForDecision,
        },
      },
    });

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "ADMIN REPORT ERROR"
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "NAME:",
      error.name
    );

    console.error(
      "CODE:",
      error.code
    );

    console.error(
      "STACK:",
      error.stack
    );

    console.error(
      "================================="
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to generate admin report",

      ...(process.env.NODE_ENV !==
        "production" && {
        error:
          error.message,
      }),
    });
  }
};


// =====================================================
// GET OPENING STATISTICS
//
// GET /api/admin/report/openings/stats
// =====================================================

const getOpeningStats = async (
  req,
  res
) => {
  try {
    const now =
      new Date();

    // =================================================
    // START OF TODAY
    // =================================================

    const startOfToday =
      new Date(now);

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    // =================================================
    // START OF THIS MONTH
    // =================================================

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

    // =================================================
    // TODAY
    // =================================================

    const today =
      await UserPackCard.countDocuments({
        revealedAt: {
          $gte: startOfToday,
        },
      });

    // =================================================
    // THIS MONTH
    // =================================================

    const thisMonth =
      await UserPackCard.countDocuments({
        revealedAt: {
          $gte: startOfMonth,
        },
      });

    // =================================================
    // TOTAL
    // =================================================

    const total =
      await UserPackCard.countDocuments();

    // =================================================
    // PENDING DECISION
    // =================================================

    const pending =
      await UserPackCard.countDocuments({
        status: "REVEALED",

        decisionDeadline: {
          $gt: now,
        },
      });

    // =================================================
    // EXPIRED REVEALED CARDS
    //
    // Useful for admin monitoring
    // =================================================

    const expired =
      await UserPackCard.countDocuments({
        status: "REVEALED",

        decisionDeadline: {
          $lte: now,
        },
      });

    // =================================================
    // SOLD
    // =================================================

    const sold =
      await UserPackCard.countDocuments({
        status: "SOLD",
      });

    // =================================================
    // SHIPPING
    // =================================================

    const shipping =
      await UserPackCard.countDocuments({
        status: "SHIPPING",
      });

    // =================================================
    // SHIPPED
    // =================================================

    const shipped =
      await UserPackCard.countDocuments({
        status: "SHIPPED",
      });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        today,

        thisMonth,

        total,

        pending,

        expired,

        sold,

        shipping,

        shipped,
      },
    });

  } catch (error) {
    console.error(
      "Get opening stats error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load opening statistics",

      error:
        process.env.NODE_ENV !==
        "production"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// GET OPENING HISTORY
//
// GET /api/admin/report/openings
//
// Query:
// ?page=1
// ?limit=20
// ?status=ALL
// ?search=charizard
// =====================================================

const getOpeningHistory = async (
  req,
  res
) => {
  try {
    // =================================================
    // QUERY
    // =================================================

    const {
      page = 1,
      limit = 20,
      status = "ALL",
      search = "",
    } = req.query;

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );

    // =================================================
    // BASE QUERY
    // =================================================

    const query = {};

    // =================================================
    // STATUS FILTER
    // =================================================

    if (
      status &&
      status !== "ALL"
    ) {
      query.status =
        status;
    }

    // =================================================
    // SEARCH
    //
    // Search by:
    // - User name
    // - User email
    // - Card name
    //
    // We first find matching IDs.
    // =================================================

    if (
      search &&
      String(search).trim()
    ) {
      const searchText =
        String(search).trim();

      const regex =
        new RegExp(
          searchText,
          "i"
        );

      const [
        users,
        cards,
      ] =
        await Promise.all([
          User.find({
            role: "USER",

            $or: [
              {
                name: regex,
              },
              {
                email: regex,
              },
            ],
          })
            .select("_id")
            .lean(),

          Card.find({
            $or: [
              {
                name: regex,
              },
              {
                tcgId: regex,
              },
              {
                number: regex,
              },
            ],
          })
            .select("_id")
            .lean(),
        ]);

      const userIds =
        users.map(
          (user) =>
            user._id
        );

      const cardIds =
        cards.map(
          (card) =>
            card._id
        );

      query.$or = [
        {
          user: {
            $in: userIds,
          },
        },

        {
          card: {
            $in: cardIds,
          },
        },
      ];
    }

    // =================================================
    // TOTAL
    // =================================================

    const total =
      await UserPackCard.countDocuments(
        query
      );

    // =================================================
    // HISTORY
    // =================================================

    const openings =
      await UserPackCard.find(
        query
      )
        .populate(
          "user",
          "name email mobile phone status createdAt"
        )
        .populate(
          "card",
          "name tcgId number rarity imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated"
        )
        .populate({
          path: "userPack",
          select:
            "user pack quantity cardsTotal cardsRemaining cardsRipped status purchasedAt createdAt",
          populate: {
            path: "pack",
            select:
              "name price status image category totalStock cards",
            populate: {
              path: "category",
              select:
                "name slug image",
            },
          },
        })
        .sort({
          revealedAt: -1,
        })
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(
          limitNumber
        )
        .lean();

    // =================================================
    // FORMAT RESPONSE
    // =================================================

    const formattedOpenings =
      openings.map(
        (opening) => ({
          _id:
            opening._id,

          status:
            opening.status,

          marketPrice:
            opening.marketPrice,

          revealedAt:
            opening.revealedAt,

          decisionDeadline:
            opening.decisionDeadline,

          soldAt:
            opening.soldAt,

          shippingFee:
            opening.shippingFee,

          shippedAt:
            opening.shippedAt,

          // -------------------------------------------
          // USER
          // -------------------------------------------

          user:
            opening.user
              ? {
                  _id:
                    opening.user._id,

                  name:
                    opening.user.name,

                  email:
                    opening.user.email,

                  mobile:
                    opening.user.mobile,

                  phone:
                    opening.user.phone,

                  status:
                    opening.user.status,

                  createdAt:
                    opening.user.createdAt,
                }
              : null,

          // -------------------------------------------
          // CARD
          // -------------------------------------------

          card:
            opening.card
              ? {
                  _id:
                    opening.card._id,

                  name:
                    opening.card.name,

                  tcgId:
                    opening.card.tcgId,

                  number:
                    opening.card.number,

                  rarity:
                    opening.card.rarity,

                  imageSmall:
                    opening.card.imageSmall,

                  imageLarge:
                    opening.card.imageLarge,

                  set:
                    opening.card.set,

                  price:
                    opening.card.price,

                  priceCurrency:
                    opening.card.priceCurrency,

                  priceSource:
                    opening.card.priceSource,

                  priceLastUpdated:
                    opening.card.priceLastUpdated,
                }
              : null,

          // -------------------------------------------
          // USER PACK
          // -------------------------------------------

          userPack:
            opening.userPack
              ? {
                  _id:
                    opening.userPack._id,

                  quantity:
                    opening.userPack.quantity,

                  cardsTotal:
                    opening.userPack.cardsTotal,

                  cardsRemaining:
                    opening.userPack.cardsRemaining,

                  cardsRipped:
                    opening.userPack.cardsRipped,

                  status:
                    opening.userPack.status,

                  purchasedAt:
                    opening.userPack.purchasedAt,

                  pack:
                    opening.userPack.pack
                      ? {
                          _id:
                            opening.userPack.pack._id,

                          name:
                            opening.userPack.pack.name,

                          price:
                            opening.userPack.pack.price,

                          status:
                            opening.userPack.pack.status,

                          image:
                            opening.userPack.pack.image,

                          totalStock:
                            opening.userPack.pack.totalStock,

                          category:
                            opening.userPack.pack.category
                              ? {
                                  _id:
                                    opening.userPack.pack.category._id,

                                  name:
                                    opening.userPack.pack.category.name,

                                  slug:
                                    opening.userPack.pack.category.slug,

                                  image:
                                    opening.userPack.pack.category.image,
                                }
                              : null,
                        }
                      : null,
                }
              : null,

          // -------------------------------------------
          // SHIPPING
          // -------------------------------------------

          shippingAddress:
            opening.shippingAddress || null,
        })
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        openings:
          formattedOpenings,

        pagination: {
          page:
            pageNumber,

          limit:
            limitNumber,

          total,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },
      },
    });

  } catch (error) {
    console.error(
      "Get opening history error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load opening history",

      error:
        process.env.NODE_ENV !==
        "production"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// GET SINGLE OPENING DETAILS
//
// GET /api/admin/report/openings/:id
// =====================================================

const getOpeningDetails = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid opening ID",
      });
    }

    // =================================================
    // FIND OPENING
    // =================================================

    const opening =
      await UserPackCard.findById(
        id
      )
        .populate(
          "user",
          "name email mobile phone role status createdAt updatedAt"
        )
        .populate(
          "card",
          "name tcgId number rarity imageSmall imageLarge set price priceCurrency priceSource priceLastUpdated status createdAt"
        )
        .populate({
          path: "userPack",

          select:
            "user pack quantity cardsTotal cardsRemaining cardsRipped status purchasedAt createdAt updatedAt",

          populate: {
            path: "pack",

            select:
              "name description price currency status image category totalStock cards createdAt updatedAt",

            populate: {
              path: "category",

              select:
                "name slug image description",
            },
          },
        })
        .lean();

    // =================================================
    // NOT FOUND
    // =================================================

    if (!opening) {
      return res.status(404).json({
        success: false,

        message:
          "Opening record not found",
      });
    }

    // =================================================
    // FIND SELL TRANSACTION
    // =================================================

    const sellTransaction =
      await WalletTransaction.findOne({
        referenceId:
          opening._id,

        referenceType:
          "UserPackCard",

        type:
          "SELL",

        user:
          opening.user?._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // =================================================
    // FIND ADMIN FEE
    // =================================================

    const adminFeeTransaction =
      await WalletTransaction.findOne({
        referenceId:
          opening._id,

        referenceType:
          "UserPackCard",

        type:
          "ADMIN_FEE",
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // =================================================
    // FIND SHIPPING TRANSACTION
    // =================================================

    const shippingTransaction =
      await WalletTransaction.findOne({
        referenceId:
          opening._id,

        referenceType:
          "UserPackCard",

        type:
          "SHIPPING",

        user:
          opening.user?._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // =================================================
    // CARD VALUE
    // =================================================

    const cardValue =
      Number(
        opening.marketPrice || 0
      );

    // =================================================
    // USER SELL AMOUNT
    // =================================================

    let userSellAmount =
      sellTransaction
        ? Number(
            sellTransaction.amount ||
              0
          )
        : null;

    // If transaction doesn't exist
    // but card is SOLD, calculate 80%.

    if (
      userSellAmount === null &&
      opening.status ===
        "SOLD"
    ) {
      userSellAmount =
        Number(
          (
            cardValue *
            0.80
          ).toFixed(2)
        );
    }

    // =================================================
    // ADMIN FEE
    // =================================================

    let adminFee =
      adminFeeTransaction
        ? Number(
            adminFeeTransaction.amount ||
              0
          )
        : null;

    // Fallback for sold card

    if (
      adminFee === null &&
      opening.status ===
        "SOLD"
    ) {
      adminFee =
        Number(
          (
            cardValue *
            0.20
          ).toFixed(2)
        );
    }

    // =================================================
    // SHIPPING FEE
    // =================================================

    const shippingFee =
      shippingTransaction
        ? Number(
            shippingTransaction.amount ||
              0
          )
        : Number(
            opening.shippingFee ||
              0
          );

    // =================================================
    // FINAL RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        // =============================================
        // OPENING
        // =============================================

        opening: {
          _id:
            opening._id,

          status:
            opening.status,

          marketPrice:
            opening.marketPrice,

          revealedAt:
            opening.revealedAt,

          decisionDeadline:
            opening.decisionDeadline,

          soldAt:
            opening.soldAt,

          shippingFee:
            opening.shippingFee,

          shippedAt:
            opening.shippedAt,

          createdAt:
            opening.createdAt,

          updatedAt:
            opening.updatedAt,
        },

        // =============================================
        // USER
        // =============================================

        user:
          opening.user
            ? {
                _id:
                  opening.user._id,

                name:
                  opening.user.name,

                email:
                  opening.user.email,

                mobile:
                  opening.user.mobile,

                phone:
                  opening.user.phone,

                role:
                  opening.user.role,

                status:
                  opening.user.status,

                accountCreatedAt:
                  opening.user.createdAt,

                accountUpdatedAt:
                  opening.user.updatedAt,
              }
            : null,

        // =============================================
        // CARD
        // =============================================

        card:
          opening.card
            ? {
                _id:
                  opening.card._id,

                name:
                  opening.card.name,

                tcgId:
                  opening.card.tcgId,

                number:
                  opening.card.number,

                rarity:
                  opening.card.rarity,

                imageSmall:
                  opening.card.imageSmall,

                imageLarge:
                  opening.card.imageLarge,

                set:
                  opening.card.set,

                marketPrice:
                  opening.marketPrice,

                currentPrice:
                  opening.card.price,

                priceCurrency:
                  opening.card.priceCurrency,

                priceSource:
                  opening.card.priceSource,

                priceLastUpdated:
                  opening.card.priceLastUpdated,

                status:
                  opening.card.status,

                createdAt:
                  opening.card.createdAt,
              }
            : null,

        // =============================================
        // USER PACK
        // =============================================

        userPack:
          opening.userPack
            ? {
                _id:
                  opening.userPack._id,

                quantity:
                  opening.userPack.quantity,

                cardsTotal:
                  opening.userPack.cardsTotal,

                cardsRemaining:
                  opening.userPack.cardsRemaining,

                cardsRipped:
                  opening.userPack.cardsRipped,

                status:
                  opening.userPack.status,

                purchasedAt:
                  opening.userPack.purchasedAt,

                createdAt:
                  opening.userPack.createdAt,

                pack:
                  opening.userPack.pack
                    ? {
                        _id:
                          opening.userPack.pack._id,

                        name:
                          opening.userPack.pack.name,

                        description:
                          opening.userPack.pack.description,

                        price:
                          opening.userPack.pack.price,

                        currency:
                          opening.userPack.pack.currency,

                        status:
                          opening.userPack.pack.status,

                        image:
                          opening.userPack.pack.image,

                        totalStock:
                          opening.userPack.pack.totalStock,

                        category:
                          opening.userPack.pack.category
                            ? {
                                _id:
                                  opening.userPack.pack.category._id,

                                name:
                                  opening.userPack.pack.category.name,

                                slug:
                                  opening.userPack.pack.category.slug,

                                image:
                                  opening.userPack.pack.category.image,

                                description:
                                  opening.userPack.pack.category.description,
                              }
                            : null,
                      }
                    : null,
              }
            : null,

        // =============================================
        // SHIPPING ADDRESS
        // =============================================

        shippingAddress:
          opening.shippingAddress ||
          null,

        // =============================================
        // FINANCIAL
        // =============================================

        financial: {
          cardValue,

          userSellAmount,

          adminFee,

          shippingFee,

          userPercentage:
            userSellAmount !== null
              ? 80
              : null,

          adminPercentage:
            adminFee !== null
              ? 20
              : null,
        },

        // =============================================
        // TRANSACTIONS
        // =============================================

        transactions: {
          sell:
            sellTransaction,

          adminFee:
            adminFeeTransaction,

          shipping:
            shippingTransaction,
        },
      },
    });

  } catch (error) {
    console.error(
      "Get opening details error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load opening details",

      error:
        process.env.NODE_ENV !==
        "production"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAdminReport,

  getOpeningStats,

  getOpeningHistory,

  getOpeningDetails,
};