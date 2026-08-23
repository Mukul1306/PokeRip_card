const mongoose = require("mongoose");

const Order = require("../models/Order");
const Pack = require("../models/Pack");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const UserPack = require("../models/UserPack");

// =====================================================
// TEST PURCHASE
// POST /api/orders/test
// =====================================================

const createTestOrder = async (
  req,
  res
) => {
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


    const qty = Number(quantity);


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


    const pack =
      await Pack.findById(packId);


    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }


    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    // This assumes your auth middleware puts
    // the logged-in user's ID in req.user.id

    const userId =
      req.user?.id ||
      req.user?._id;


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }


    const user =
      await User.findById(userId);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // -------------------------------------------------
    // GET PACK PRICE
    // -------------------------------------------------

    const price =
      Number(
        pack.price ||
        pack.packPrice ||
        0
      );


    const totalAmount =
      price * qty;


    // -------------------------------------------------
    // CREATE TEST ORDER
    // -------------------------------------------------

    const order =
      await Order.create({
        user: user._id,

        pack: pack._id,

        quantity: qty,

        amount: totalAmount,

        currency: "INR",

        paymentMethod: "TEST",

        paymentStatus: "PAID",

        orderStatus: "COMPLETED",
      });


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
          "name price image description"
        );


    return res.status(201).json({

      success: true,

      message:
        "Test purchase successful",

      data: {
        order:
          populatedOrder,
      },

    });

  } catch (error) {

    console.error(
      "Create test order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET ALL ORDERS - ADMIN
// GET /api/admin/orders
// =====================================================

const getAllOrders = async (
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

    const paymentStatus =
      req.query.paymentStatus || "";

    const orderStatus =
      req.query.orderStatus || "";


    const skip =
      (page - 1) * limit;


    const filter = {};


    if (
      paymentStatus &&
      [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ].includes(paymentStatus)
    ) {
      filter.paymentStatus =
        paymentStatus;
    }


    if (
      orderStatus &&
      [
        "PENDING",
        "COMPLETED",
        "CANCELLED",
      ].includes(orderStatus)
    ) {
      filter.orderStatus =
        orderStatus;
    }


    // Search user name/email/order number

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
            $in: users.map(
              (user) =>
                user._id
            ),
          },
        },
      ];
    }


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
          "name price image"
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


    return res.status(200).json({

      success: true,

      data: {

        orders,

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
// GET ORDER BY ID
// GET /api/admin/orders/:id
// =====================================================

const getOrderById = async (
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
        message: "Invalid order ID",
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
          "name price image description"
        );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: {
        order,
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

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { packId, quantity = 1 } = req.body;

    const qty = Number(quantity);

    if (!packId) {
      return res.status(400).json({
        success: false,
        message: "Pack ID is required",
      });
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // Start transaction
    session.startTransaction();

    // =================================================
    // GET PACK
    // =================================================

    const pack = await Pack.findById(packId).session(session);

    if (!pack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    if (pack.status !== "PUBLISHED") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This pack is not available",
      });
    }

    const packPrice = Number(pack.price || 0);
    const totalAmount = packPrice * qty;

    if (totalAmount <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid pack price",
      });
    }

    // =================================================
    // GET USER WALLET
    // =================================================

    const wallet = await Wallet.findOne({
      user: userId,
    }).session(session);

    if (!wallet) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // =================================================
    // CHECK BALANCE
    // =================================================

    if (Number(wallet.balance) < totalAmount) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required $${totalAmount.toFixed(
          2
        )}`,
      });
    }

    // =================================================
    // DEDUCT WALLET
    // =================================================

    wallet.balance =
      Number(wallet.balance) - totalAmount;

    await wallet.save({ session });

    // =================================================
    // CREATE ORDER
    // =================================================

    const order = await Order.create(
      [
        {
          user: userId,
          pack: pack._id,
          quantity: qty,
          amount: totalAmount,

          paymentStatus: "PAID",

          // Keep this if your Order model has it
         orderStatus: "COMPLETED",

          paymentMethod: "WALLET",
        },
      ],
      { session }
    );

// =====================================================
// CREATE USER PACK
// =====================================================

// Total physical cards available inside the pack
const cardsTotal = pack.cards.reduce(
  (total, packCard) =>
    total + Number(packCard.quantity || 0),
  0
);

const cardsRemaining = cardsTotal;

await UserPack.create(
  [
    {
      user: userId,
      pack: pack._id,
      quantity: qty,

      cardsTotal,
      cardsRemaining,
      cardsRipped: 0,

      status: "AVAILABLE",
    },
  ],
  { session }
);


    // =================================================
    // WALLET TRANSACTION
    // =================================================

    await WalletTransaction.create(
      [
        {
          user: userId,
          type: "PURCHASE",
          amount: totalAmount,
          status: "APPROVED",
          note: `Purchased ${qty} x ${pack.name}`,
        },
      ],
      { session }
    );

    // =================================================
    // COMMIT EVERYTHING
    // =================================================

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Pack purchased successfully",

      data: {
        order: order[0],
        walletBalance: wallet.balance,
      },
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to purchase pack",
    });

  } finally {
    session.endSession();
  }
};




module.exports = {
  createTestOrder,
  getAllOrders,
  getOrderById,
  createOrder,
};