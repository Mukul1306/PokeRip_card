const Pack = require("../models/Pack");
const Order = require("../models/Order");

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

    // DEBUG
    console.log(
      "USER DASHBOARD PACKS:",
      packs.length
    );
    console.log("=================================");
console.log("USER DASHBOARD PACK COUNT:", packs.length);
console.log("PACKS:", packs);
console.log("=================================");

    console.log(
      packs.map((pack) => ({
        id: pack._id,
        name: pack.name,
        price: pack.price,
        status: pack.status,
      }))
    );

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

        stats: {
          totalPacks,
          totalOrders: orders.length,
          totalSpent,

          // We will connect these later
          totalOpenings: 0,
          collectionCount: 0,
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