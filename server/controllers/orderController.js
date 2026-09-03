const mongoose = require("mongoose");

const Order = require("../models/Order");
const Pack = require("../models/Pack");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const UserPack = require("../models/UserPack");
const UserPackCard = require("../models/UserPackCard");
const Redemption = require("../models/Redemption");

// =====================================================
// HELPERS
// =====================================================

// -----------------------------------------------------
// GET USER ID FROM AUTH
// -----------------------------------------------------

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

// -----------------------------------------------------
// GET PACK PRICE
// -----------------------------------------------------

const getPackPrice = (pack) => {
  return Number(
    pack?.packPrice ??
    pack?.price ??
    0
  );
};

// -----------------------------------------------------
// GET LATEST REVEALED CARD FOR USER PACK
//
// IMPORTANT:
//
// An order can contain many possible cards in the pack,
// but the Order page should show only the actual card
// that was opened/revealed.
//
// Therefore we take the newest UserPackCard.
// -----------------------------------------------------

const getLatestUserPackCard = async (
  userPackId
) => {
  if (!userPackId) {
    return null;
  }

  return UserPackCard.findOne({
    userPack: userPackId,
  })
    .sort({
      revealedAt: -1,
      createdAt: -1,
    })
    .populate(
      "card",
      [
        "tcgId",
        "name",
        "number",
        "rarity",
        "artist",
        "price",
        "priceCurrency",
        "priceSource",
        "priceLastUpdated",
        "imageSmall",
        "imageLarge",
        "set",
        "tcgplayer",
        "cardmarket",
      ].join(" ")
    )
    .lean();
};

// -----------------------------------------------------
// GET LATEST REDEMPTION
// -----------------------------------------------------

const getLatestRedemption = async (
  userPackCardId
) => {
  if (!userPackCardId) {
    return null;
  }

  return Redemption.findOne({
    userPackCard: userPackCardId,
  })
    .sort({
      createdAt: -1,
    })
    .populate(
      "shipment"
    )
    .lean();
};

// -----------------------------------------------------
// GET SELL / ADMIN FEE TRANSACTIONS
//
// SELL:
//   User receives 80%
//
// ADMIN_FEE:
//   Platform receives 20%
//
// Both transactions reference the same
// UserPackCard.
// -----------------------------------------------------

const getSaleTransactions = async (
  userPackCardId
) => {
  if (!userPackCardId) {
    return {
      sellTransaction: null,
      adminFeeTransaction: null,
    };
  }

  const transactions =
    await WalletTransaction.find({
      referenceId: userPackCardId,
      referenceType: "UserPackCard",
      type: {
        $in: [
          "SELL",
          "ADMIN_FEE",
        ],
      },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  const sellTransaction =
    transactions.find(
      (transaction) =>
        transaction.type === "SELL"
    ) || null;

  const adminFeeTransaction =
    transactions.find(
      (transaction) =>
        transaction.type === "ADMIN_FEE"
    ) || null;

  return {
    sellTransaction,
    adminFeeTransaction,
  };
};

// -----------------------------------------------------
// BUILD ORDER DETAILS
//
// This keeps the database models separate while giving
// the frontend one complete object.
// -----------------------------------------------------

const buildOrderDetails = async (
  order
) => {
  const plainOrder =
    typeof order.toObject === "function"
      ? order.toObject()
      : order;

  let userPack = null;

  // ---------------------------------------------------
  // FIRST: use direct Order.userPack relationship
  // ---------------------------------------------------

  if (plainOrder.userPack) {
    userPack =
      await UserPack.findById(
        plainOrder.userPack
      ).lean();
  }

  // ---------------------------------------------------
  // FALLBACK FOR OLD ORDERS
  //
  // Old orders were created before userPack was added
  // to Order.
  //
  // We try to find the UserPack using the same user,
  // pack and approximate creation period.
  // ---------------------------------------------------

  if (
    !userPack &&
    plainOrder.user &&
    plainOrder.pack
  ) {
    const userId =
      plainOrder.user?._id ||
      plainOrder.user;

    const packId =
      plainOrder.pack?._id ||
      plainOrder.pack;

    const orderCreatedAt =
      plainOrder.createdAt
        ? new Date(
            plainOrder.createdAt
          )
        : null;

    const fallbackQuery = {
      user: userId,
      pack: packId,
    };

    if (
      orderCreatedAt &&
      !Number.isNaN(
        orderCreatedAt.getTime()
      )
    ) {
      fallbackQuery.createdAt = {
        $gte: new Date(
          orderCreatedAt.getTime() -
            5 * 60 * 1000
        ),
        $lte: new Date(
          orderCreatedAt.getTime() +
            5 * 60 * 1000
        ),
      };
    }

    userPack =
      await UserPack.findOne(
        fallbackQuery
      )
        .sort({
          createdAt: 1,
        })
        .lean();
  }

  // ---------------------------------------------------
  // GET ACTUAL REVEALED CARD
  // ---------------------------------------------------

  const openedCard =
    userPack
      ? await getLatestUserPackCard(
          userPack._id
        )
      : null;

  // ---------------------------------------------------
  // GET REDEMPTION
  // ---------------------------------------------------

  const redemption =
    openedCard
      ? await getLatestRedemption(
          openedCard._id
        )
      : null;

  // ---------------------------------------------------
  // GET SELL TRANSACTIONS
  // ---------------------------------------------------

  const {
    sellTransaction,
    adminFeeTransaction,
  } =
    openedCard
      ? await getSaleTransactions(
          openedCard._id
        )
      : {
          sellTransaction: null,
          adminFeeTransaction: null,
        };

  // ---------------------------------------------------
  // MARKET PRICE
  // ---------------------------------------------------

  const marketPrice =
    Number(
      openedCard?.marketPrice ??
      openedCard?.card?.price ??
      0
    );

  // ---------------------------------------------------
  // SALE AMOUNTS
  //
  // SELL transaction = 80%
  // ADMIN_FEE transaction = 20%
  // ---------------------------------------------------

  const userPayout =
    Number(
      sellTransaction?.amount ||
      0
    );

  const adminCommission =
    Number(
      adminFeeTransaction?.amount ||
      0
    );

  const saleTotal =
    userPayout +
    adminCommission;

  // ---------------------------------------------------
  // SHIPPING FEE
  //
  // Prefer UserPackCard shippingFee.
  // Fallback to Redemption shippingFee.
  // ---------------------------------------------------

  const shippingFee =
    Number(
      openedCard?.shippingFee ??
      redemption?.shippingFee ??
      0
    );

  // ---------------------------------------------------
  // CARD STATUS
  // ---------------------------------------------------

  const cardStatus =
    openedCard?.status ||
    null;

  // ---------------------------------------------------
  // BUSINESS STATUS
  // ---------------------------------------------------

  let fulfillmentStatus =
    "NOT_OPENED";

  if (openedCard) {
    if (
      cardStatus === "SOLD"
    ) {
      fulfillmentStatus =
        "SOLD";
    } else if (
      cardStatus === "SHIPPING"
    ) {
      fulfillmentStatus =
        "SHIPPING";
    } else if (
      cardStatus === "SHIPPED"
    ) {
      fulfillmentStatus =
        "SHIPPED";
    } else {
      fulfillmentStatus =
        "REVEALED";
    }
  }

  // ---------------------------------------------------
  // RETURN COMPLETE OBJECT
  // ---------------------------------------------------

  return {
    ...plainOrder,

    userPack,

    openedCard: openedCard
      ? {
          _id: openedCard._id,

          user: openedCard.user,

          userPack:
            openedCard.userPack,

          marketPrice,

          status: cardStatus,

          revealedAt:
            openedCard.revealedAt,

          decisionDeadline:
            openedCard.decisionDeadline,

          soldAt:
            openedCard.soldAt,

          shippedAt:
            openedCard.shippedAt,

          shippingFee,

          shippingAddress:
            openedCard.shippingAddress ||
            null,

          card:
            openedCard.card ||
            null,
        }
      : null,

    redemption: redemption
      ? {
          _id: redemption._id,

          redemptionNumber:
            redemption.redemptionNumber,

          status:
            redemption.status,

          shippingFee:
            Number(
              redemption.shippingFee ||
              0
            ),

          shippingAddress:
            redemption.shippingAddress ||
            null,

          rejectionReason:
            redemption.rejectionReason,

          processedAt:
            redemption.processedAt,

          shipment:
            redemption.shipment ||
            null,

          createdAt:
            redemption.createdAt,
        }
      : null,

    sale: {
      hasSale:
        !!sellTransaction,

      marketPrice,

      soldAmount:
        saleTotal > 0
          ? saleTotal
          : 0,

      userPayout,

      userPercentage:
        userPayout > 0
          ? 80
          : 0,

      adminCommission,

      adminPercentage:
        adminCommission > 0
          ? 20
          : 0,

      sellTransaction:
        sellTransaction
          ? {
              _id:
                sellTransaction._id,

              amount:
                Number(
                  sellTransaction.amount ||
                  0
                ),

              status:
                sellTransaction.status,

              note:
                sellTransaction.note,

              createdAt:
                sellTransaction.createdAt,
            }
          : null,

      adminFeeTransaction:
        adminFeeTransaction
          ? {
              _id:
                adminFeeTransaction._id,

              amount:
                Number(
                  adminFeeTransaction.amount ||
                  0
                ),

              status:
                adminFeeTransaction.status,

              note:
                adminFeeTransaction.note,

              createdAt:
                adminFeeTransaction.createdAt,
            }
          : null,
    },

    shipping: {
      hasShipping:
        !!redemption ||
        shippingFee > 0 ||
        cardStatus === "SHIPPING" ||
        cardStatus === "SHIPPED",

      fee: shippingFee,

      status:
        cardStatus === "SHIPPING"
          ? "SHIPPING"
          : cardStatus === "SHIPPED"
          ? "SHIPPED"
          : redemption?.status ||
            null,

      address:
        openedCard?.shippingAddress ||
        redemption?.shippingAddress ||
        null,

      shipment:
        redemption?.shipment ||
        null,
    },

    fulfillmentStatus,
  };
};

// =====================================================
// TEST PURCHASE
// POST /api/orders/test
// =====================================================
//
// Creates:
//   Order
//   UserPack
//
// AND links:
//   Order.userPack = UserPack._id
//
// This makes test orders compatible with the
// new Order details page.
// =====================================================

const createTestOrder = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      packId,
      quantity = 1,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        packId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const qty =
      Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be at least 1",
      });
    }

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated",
      });
    }

    session.startTransaction();

    const pack =
      await Pack.findById(
        packId
      ).session(session);

    if (!pack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    const user =
      await User.findById(
        userId
      ).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const price =
      getPackPrice(pack);

    const totalAmount =
      price * qty;

    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid pack price",
      });
    }

    // ---------------------------------------------------
    // CREATE USER PACK FIRST
    // ---------------------------------------------------

    const cardsPerPack =
      pack.cards.reduce(
        (
          total,
          packCard
        ) =>
          total +
          Number(
            packCard.quantity || 0
          ),
        0
      );

    const cardsTotal =
      cardsPerPack * qty;

    const createdUserPacks =
      await UserPack.create(
        [
          {
            user: user._id,

            pack: pack._id,

            quantity: qty,

            cardsTotal,

            cardsRemaining:
              cardsTotal,

            cardsRipped: 0,

            status:
              "AVAILABLE",
          },
        ],
        {
          session,
        }
      );

    const userPack =
      createdUserPacks[0];

    // ---------------------------------------------------
    // CREATE ORDER WITH USER PACK LINK
    // ---------------------------------------------------

    const createdOrders =
      await Order.create(
        [
          {
            user: user._id,

            pack: pack._id,

            userPack:
              userPack._id,

            quantity: qty,

            amount:
              totalAmount,

            currency: "INR",

            paymentMethod:
              "TEST",

            paymentStatus:
              "PAID",

            orderStatus:
              "COMPLETED",
          },
        ],
        {
          session,
        }
      );

    const order =
      createdOrders[0];

    // ---------------------------------------------------
    // WALLET TRANSACTION
    // ---------------------------------------------------

    await WalletTransaction.create(
      [
        {
          user: user._id,

          type: "PURCHASE",

          amount:
            totalAmount,

          status:
            "APPROVED",

          referenceId:
            order._id,

          referenceType:
            "Order",

          note:
            `Test purchase ${qty} x ${pack.name}`,
        },
      ],
      {
        session,
      }
    );

    await session.commitTransaction();

    // ---------------------------------------------------
    // POPULATED RESPONSE
    // ---------------------------------------------------

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "pack",
          "name packPrice price image description"
        )
        .populate(
          "userPack"
        );

    const completeOrder =
      await buildOrderDetails(
        populatedOrder
      );

    return res.status(201).json({
      success: true,

      message:
        "Test purchase successful",

      data: {
        order:
          completeOrder,
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
      "Create test order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// GET ALL ORDERS - ADMIN
// GET /api/admin/orders
// =====================================================
//
// Supports:
//
// ?page=1
// ?limit=20
// ?search=...
// ?paymentStatus=PAID
// ?orderStatus=COMPLETED
// =====================================================

const getAllOrders = async (
  req,
  res
) => {
  try {
    const page =
      Math.max(
        parseInt(
          req.query.page
        ) || 1,
        1
      );

    const limit =
      Math.min(
        parseInt(
          req.query.limit
        ) || 20,
        100
      );

    const search =
      req.query.search?.trim() ||
      "";

    const paymentStatus =
      req.query.paymentStatus ||
      "";

    const orderStatus =
      req.query.orderStatus ||
      "";

    const skip =
      (page - 1) * limit;

    const filter = {};

    // ---------------------------------------------------
    // PAYMENT STATUS
    // ---------------------------------------------------

    if (
      paymentStatus &&
      [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ].includes(
        paymentStatus
      )
    ) {
      filter.paymentStatus =
        paymentStatus;
    }

    // ---------------------------------------------------
    // ORDER STATUS
    // ---------------------------------------------------

    if (
      orderStatus &&
      [
        "PENDING",
        "COMPLETED",
        "CANCELLED",
      ].includes(
        orderStatus
      )
    ) {
      filter.orderStatus =
        orderStatus;
    }

    // ---------------------------------------------------
    // SEARCH USER / ORDER
    // ---------------------------------------------------

    if (search) {
      const users =
        await User.find({
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }).select("_id");

      filter.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          user: {
            $in:
              users.map(
                (user) =>
                  user._id
              ),
          },
        },
      ];
    }

    // ---------------------------------------------------
    // GET ORDERS
    // ---------------------------------------------------

    const [
      orders,
      totalOrders,
    ] = await Promise.all([
      Order.find(filter)
        .populate(
          "user",
          "name email"
        )
        .populate(
          "pack",
          "name packPrice price image description"
        )
        .populate(
          "userPack"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(
        filter
      ),
    ]);

    // ---------------------------------------------------
    // BUILD COMPLETE ORDERS
    // ---------------------------------------------------

    const completeOrders =
      await Promise.all(
        orders.map(
          (order) =>
            buildOrderDetails(
              order
            )
        )
      );

    return res.status(200).json({
      success: true,

      data: {
        orders:
          completeOrders,

        pagination: {
          page,

          limit,

          totalOrders,

          totalPages:
            Math.ceil(
              totalOrders /
              limit
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================================================
// GET PACK PURCHASE STATS - ADMIN
// GET /api/admin/orders/stats
// =====================================================
//
// Returns:
// - Packs purchased today
// - Packs purchased this month
// - Packs purchased till now
// - Total value for each period
//
// Only PAID + COMPLETED orders are included.
// =====================================================

const getOrderStats = async (
  req,
  res
) => {
  try {
    const now = new Date();

    // ---------------------------------------------------
    // START OF TODAY
    // ---------------------------------------------------

    const startOfToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    // ---------------------------------------------------
    // START OF CURRENT MONTH
    // ---------------------------------------------------

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    const baseMatch = {
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
    };

    // ---------------------------------------------------
    // TODAY
    // ---------------------------------------------------

    const todayStats =
      await Order.aggregate([
        {
          $match: {
            ...baseMatch,

            createdAt: {
              $gte: startOfToday,
              $lte: now,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalPacks: {
              $sum: {
                $ifNull: [
                  "$quantity",
                  1,
                ],
              },
            },

            totalValue: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },

            totalOrders: {
              $sum: 1,
            },
          },
        },
      ]);

    // ---------------------------------------------------
    // THIS MONTH
    // ---------------------------------------------------

    const monthStats =
      await Order.aggregate([
        {
          $match: {
            ...baseMatch,

            createdAt: {
              $gte: startOfMonth,
              $lte: now,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalPacks: {
              $sum: {
                $ifNull: [
                  "$quantity",
                  1,
                ],
              },
            },

            totalValue: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },

            totalOrders: {
              $sum: 1,
            },
          },
        },
      ]);

    // ---------------------------------------------------
    // TILL NOW
    // ---------------------------------------------------

    const tillNowStats =
      await Order.aggregate([
        {
          $match:
            baseMatch,
        },

        {
          $group: {
            _id: null,

            totalPacks: {
              $sum: {
                $ifNull: [
                  "$quantity",
                  1,
                ],
              },
            },

            totalValue: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },

            totalOrders: {
              $sum: 1,
            },
          },
        },
      ]);

    const today =
      todayStats[0] || {};

    const month =
      monthStats[0] || {};

    const tillNow =
      tillNowStats[0] || {};

    return res.status(200).json({
      success: true,

      data: {
        today: {
          packs:
            Number(
              today.totalPacks ||
              0
            ),

          value:
            Number(
              today.totalValue ||
              0
            ),

          orders:
            Number(
              today.totalOrders ||
              0
            ),
        },

        month: {
          packs:
            Number(
              month.totalPacks ||
              0
            ),

          value:
            Number(
              month.totalValue ||
              0
            ),

          orders:
            Number(
              month.totalOrders ||
              0
            ),
        },

        tillNow: {
          packs:
            Number(
              tillNow.totalPacks ||
              0
            ),

          value:
            Number(
              tillNow.totalValue ||
              0
            ),

          orders:
            Number(
              tillNow.totalOrders ||
              0
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get order stats error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load order statistics",
    });
  }
};

// =====================================================
// GET ORDER BY ID
// GET /api/admin/orders/:id
// =====================================================

const getOrderById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await Order.findById(id)
        .populate(
          "user",
          "name email"
        )
        .populate(
          "pack",
          "name packPrice price image description"
        )
        .populate(
          "userPack"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const completeOrder =
      await buildOrderDetails(
        order
      );

    return res.status(200).json({
      success: true,

      data: {
        order:
          completeOrder,
      },
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================
//
// REAL WALLET PURCHASE
//
// Creates:
//
// Wallet deduction
// Order
// UserPack
// Purchase transaction
//
// And links:
//
// Order.userPack
// =====================================================

const createOrder = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      getUserId(req);

    const {
      packId,
      quantity = 1,
    } = req.body;

    const qty =
      Number(quantity);

    // =================================================
    // VALIDATION
    // =================================================

    if (!packId) {
      return res.status(400).json({
        success: false,
        message:
          "Pack ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        packId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack ID",
      });
    }

    if (
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quantity",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated",
      });
    }

    // =================================================
    // START TRANSACTION
    // =================================================

    session.startTransaction();

    // =================================================
    // GET PACK
    // =================================================

    const pack =
      await Pack.findById(
        packId
      ).session(session);

    if (!pack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Pack not found",
      });
    }

    // =================================================
    // CHECK PACK STATUS
    // =================================================

    if (
      pack.status !==
      "PUBLISHED"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This pack is not available",
      });
    }

    // =================================================
    // REAL PACK PRICE
    // =================================================

    const packPrice =
      getPackPrice(pack);

    console.log(
      "========================================"
    );

    console.log(
      "PURCHASE PACK"
    );

    console.log(
      "Pack ID:",
      pack._id.toString()
    );

    console.log(
      "Pack Name:",
      pack.name
    );

    console.log(
      "pack.packPrice:",
      pack.packPrice
    );

    console.log(
      "pack.price:",
      pack.price
    );

    console.log(
      "Final pack price:",
      packPrice
    );

    console.log(
      "========================================"
    );

    const totalAmount =
      packPrice * qty;

    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid pack price",
      });
    }

    // =================================================
    // GET USER WALLET
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
    // CHECK BALANCE
    // =================================================

    if (
      Number(wallet.balance) <
      totalAmount
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Insufficient wallet balance. Required ₹${totalAmount.toFixed(
            2
          )}`,
      });
    }

    // =================================================
    // DEDUCT WALLET
    // =================================================

    wallet.balance =
      Number(wallet.balance) -
      totalAmount;

    await wallet.save({
      session,
    });

    // =================================================
    // CREATE USER PACK
    // =================================================

    // Total physical cards in ONE pack

    const cardsPerPack =
      pack.cards.reduce(
        (
          total,
          packCard
        ) =>
          total +
          Number(
            packCard.quantity || 0
          ),
        0
      );

    // Multiply by purchased quantity

    const cardsTotal =
      cardsPerPack * qty;

    const cardsRemaining =
      cardsTotal;

    const createdUserPacks =
      await UserPack.create(
        [
          {
            user: userId,

            pack: pack._id,

            quantity: qty,

            cardsTotal,

            cardsRemaining,

            cardsRipped: 0,

            status:
              "AVAILABLE",
          },
        ],
        {
          session,
        }
      );

    const userPack =
      createdUserPacks[0];

    // =================================================
    // CREATE ORDER
    // =================================================

    const createdOrders =
      await Order.create(
        [
          {
            user: userId,

            pack: pack._id,

            userPack:
              userPack._id,

            quantity: qty,

            amount:
              totalAmount,

            currency: "INR",

            paymentStatus:
              "PAID",

            orderStatus:
              "COMPLETED",

            paymentMethod:
              "WALLET",
          },
        ],
        {
          session,
        }
      );

    const order =
      createdOrders[0];

    // =================================================
    // WALLET TRANSACTION
    // =================================================

    await WalletTransaction.create(
      [
        {
          user: userId,

          type: "PURCHASE",

          amount:
            totalAmount,

          status:
            "APPROVED",

          referenceId:
            order._id,

          referenceType:
            "Order",

          note:
            `Purchased ${qty} x ${pack.name}`,
        },
      ],
      {
        session,
      }
    );

    // =================================================
    // COMMIT EVERYTHING
    // =================================================

    await session.commitTransaction();

    // =================================================
    // RESPONSE
    // =================================================

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "pack",
          "name packPrice price image description"
        )
        .populate(
          "userPack"
        );

    const completeOrder =
      await buildOrderDetails(
        populatedOrder
      );

    return res.status(201).json({
      success: true,

      message:
        "Pack purchased successfully",

      data: {
        order:
          completeOrder,

        userPack: {
          _id:
            userPack._id,

          user:
            userPack.user,

          pack:
            userPack.pack,

          quantity:
            userPack.quantity,

          cardsTotal:
            userPack.cardsTotal,

          cardsRemaining:
            userPack.cardsRemaining,

          cardsRipped:
            userPack.cardsRipped,

          status:
            userPack.status,

          purchasedAt:
            userPack.purchasedAt,
        },

        userPackId:
          userPack._id,

        walletBalance:
          Number(
            wallet.balance
          ),
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
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to purchase pack",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createTestOrder,
  getAllOrders,
  getOrderStats,
  getOrderById,
  createOrder,
};