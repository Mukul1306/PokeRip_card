const mongoose = require("mongoose");

const Order = require("../models/Order");
const Pack = require("../models/Pack");
const User = require("../models/User");


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


module.exports = {
  createTestOrder,
  getAllOrders,
  getOrderById,
};