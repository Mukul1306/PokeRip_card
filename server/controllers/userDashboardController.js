const Pack = require("../models/Pack");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
// =====================================================
// GET USER DASHBOARD
// GET /api/user/dashboard
// =====================================================

const getUserDashboard = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // =================================================
// USER WALLET
// =================================================

let wallet = await Wallet.findOne({
  user: userId,
});

if (!wallet) {
  wallet = await Wallet.create({
    user: userId,
    balance: 0,
  });
}

const walletBalance = Number(wallet.balance || 0);

    // =================================================
    // GET PUBLISHED PACKS
    // =================================================

    const packs = await Pack.find({
      status: "PUBLISHED",
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        createdAt: -1,
      })
      .lean();



    // =================================================
    // USER ORDERS
    // =================================================

    const orders = await Order.find({
      user: userId,
    })
      .populate(
        "pack",
        "name price image description category"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    // =================================================
    // PAID ORDERS
    // =================================================

    const paidOrders =
      orders.filter(
        (order) =>
          order.paymentStatus === "PAID"
      );

    // =================================================
    // TOTAL PACKS
    // =================================================

    const totalPacks =
      paidOrders.reduce(
        (total, order) =>
          total +
          Number(
            order.quantity || 0
          ),
        0
      );

    // =================================================
    // TOTAL SPENT
    // =================================================

    const totalSpent =
      paidOrders.reduce(
        (total, order) =>
          total +
          Number(
            order.amount || 0
          ),
        0
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
  packs,
  orders,

  // IMPORTANT
  walletBalance,

  stats: {
    totalPacks,
    totalOrders: orders.length,
    totalSpent,

    totalOpenings: 0,
    collectionCount: 0,

    walletBalance,
  },
},
    });

  } catch (error) {

    console.error(
      "User dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUserDashboard,
};