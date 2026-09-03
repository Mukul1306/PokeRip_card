const mongoose = require("mongoose");

const Shipment = require("../models/Shipment");
const Redemption = require("../models/Redemption");
const UserPackCard = require("../models/UserPackCard");
const User = require("../models/User");
const Card = require("../models/Card");
const Pack = require("../models/Pack");
const UserPack = require("../models/UserPack");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getAdminId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.admin?._id ||
    req.admin?.id ||
    null
  );
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const populateShipment = (query) => {
  return query
    .populate({
      path: "user",
      select: "name email username phone",
    })
    .populate({
      path: "userPackCard",
      populate: {
        path: "card",
        select:
          "name tcgId number rarity imageSmall imageLarge price priceCurrency priceSource priceLastUpdated",
      },
    })
    .populate({
      path: "card",
      select:
        "name tcgId number rarity imageSmall imageLarge price priceCurrency priceSource priceLastUpdated",
    })
    .populate({
      path: "pack",
      select: "name packPrice image",
    })
    .populate({
      path: "userPack",
      select: "cardsRemaining cardsRipped purchasedAt pack",
    })
    .populate({
      path: "redemption",
      select:
        "redemptionNumber status shippingFee shippingAddress requestedAt approvedAt rejectedAt rejectionReason shipment",
    });
};

const populateRedemption = (query) => {
  return query
    .populate({
      path: "user",
      select: "name email username phone",
    })
    .populate({
      path: "userPackCard",
      populate: {
        path: "card",
        select:
          "name tcgId number rarity imageSmall imageLarge price priceCurrency priceSource priceLastUpdated",
      },
    })
    .populate({
      path: "userPack",
      select: "cardsRemaining cardsRipped purchasedAt pack",
    })
    .populate({
      path: "pack",
      select: "name packPrice image",
    })
    .populate({
      path: "shipment",
      select:
        "shipmentNumber status carrier trackingNumber trackingUrl estimatedDeliveryAt",
    });
};

// =====================================================
// GET SHIPMENTS
// GET /api/admin/shipping
// =====================================================

const getShipments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      carrier = "",
      from = "",
      to = "",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    // -------------------------------------------------
    // SHIPMENTS
    // -------------------------------------------------

    const shipmentQuery = {};

    // Pending requests are stored in Redemption,
    // not Shipment.
    if (status && status !== "PENDING") {
      shipmentQuery.status = status;
    }

    if (carrier) {
      shipmentQuery.carrier = {
        $regex: carrier,
        $options: "i",
      };
    }

    if (from || to) {
      shipmentQuery.createdAt = {};

      if (from) {
        shipmentQuery.createdAt.$gte = new Date(
          `${from}T00:00:00.000Z`
        );
      }

      if (to) {
        shipmentQuery.createdAt.$lte = new Date(
          `${to}T23:59:59.999Z`
        );
      }
    }

    let shipments = await populateShipment(
      Shipment.find(shipmentQuery).sort({
        createdAt: -1,
      })
    );

    // -------------------------------------------------
    // PENDING REDEMPTIONS
    // -------------------------------------------------

    let pendingRedemptions = [];

    if (!status || status === "PENDING") {
      const redemptionQuery = {
        status: "PENDING",
      };

      if (from || to) {
        redemptionQuery.createdAt = {};

        if (from) {
          redemptionQuery.createdAt.$gte = new Date(
            `${from}T00:00:00.000Z`
          );
        }

        if (to) {
          redemptionQuery.createdAt.$lte = new Date(
            `${to}T23:59:59.999Z`
          );
        }
      }

      pendingRedemptions = await populateRedemption(
        Redemption.find(redemptionQuery).sort({
          createdAt: -1,
        })
      );
    }

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    const normalizedSearch = String(search || "")
      .trim()
      .toLowerCase();

    const matchesSearch = (row) => {
      if (!normalizedSearch) {
        return true;
      }

      const userName =
        row.user?.name ||
        row.user?.username ||
        "";

      const userEmail = row.user?.email || "";

      const cardName =
        row.card?.name ||
        row.userPackCard?.card?.name ||
        "";

      const packName = row.pack?.name || "";

      const shipmentNumber =
        row.shipmentNumber || "";

      const trackingNumber =
        row.trackingNumber || "";

      const redemptionNumber =
        row.redemptionNumber || "";

      const text = [
        userName,
        userEmail,
        cardName,
        packName,
        shipmentNumber,
        trackingNumber,
        redemptionNumber,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedSearch);
    };

    shipments = shipments.filter(matchesSearch);

    // -------------------------------------------------
    // MAP PENDING REDEMPTIONS
    // -------------------------------------------------

    const pendingRows = pendingRedemptions
      .map((redemption) => {
        const card =
          redemption.userPackCard?.card || null;

        const pack =
          redemption.pack || null;

        const user =
          redemption.user || null;

        return {
          _id: redemption._id,

          redemption: redemption._id,

          redemptionId: redemption._id,

          shipmentNumber:
            redemption.redemptionNumber
              ? `REQ-${redemption.redemptionNumber}`
              : `REQ-${String(
                  redemption._id
                ).slice(-10)}`,

          redemptionNumber:
            redemption.redemptionNumber || "",

          approvalStatus: "PENDING",

          adminStatus: "PENDING",

          reviewStatus: "PENDING",

          status: "PENDING",

          shippingStatus: "PENDING",

          isRedemptionRequest: true,

          user,

          userPackCard:
            redemption.userPackCard || null,

          card,

          pack,

          userPack:
            redemption.userPack || null,

          shippingAddress:
            redemption.shippingAddress || {},

          marketPrice: safeNumber(
            redemption.userPackCard?.marketPrice,
            card?.price
          ),

          shippingFee: safeNumber(
            redemption.shippingFee,
            5
          ),

          carrier: "",

          trackingNumber: "",

          trackingUrl: "",

          notes: "",

          createdAt:
            redemption.createdAt ||
            redemption.requestedAt ||
            new Date(),

          updatedAt:
            redemption.updatedAt ||
            redemption.createdAt ||
            new Date(),

          redemptionData: redemption,
        };
      })
      .filter(matchesSearch);

    // -------------------------------------------------
    // COMBINE
    // -------------------------------------------------

    let combined;

    if (status === "PENDING") {
      // IMPORTANT:
      // PENDING should show ONLY pending requests.
      combined = pendingRows;
    } else if (!status) {
      combined = [
        ...pendingRows,
        ...shipments,
      ];
    } else {
      combined = shipments;
    }

    // -------------------------------------------------
    // SORT
    // -------------------------------------------------

    combined.sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const total = combined.length;

    const startIndex =
      (pageNumber - 1) * pageSize;

    const endIndex =
      startIndex + pageSize;

    const paginatedRows =
      combined.slice(
        startIndex,
        endIndex
      );

    return res.json({
      success: true,

      shipments: paginatedRows,

      data: paginatedRows,

      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,

        totalPages: Math.ceil(
          total / pageSize
        ),

        hasNextPage:
          endIndex < total,

        hasPrevPage:
          pageNumber > 1,
      },

      total,
    });
  } catch (error) {
    console.error(
      "GET ADMIN SHIPMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipments",
      error: error.message,
    });
  }
};

// =====================================================
// GET SHIPPING STATS
// GET /api/admin/shipping/stats
// =====================================================

const getShipmentStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      totalShipments,
      readyToShip,
      processing,
      packed,
      shipped,
      delivered,
      failed,
      cancelled,
      pendingRequests,
      shippedToday,
      shippedThisMonth,
    ] = await Promise.all([
      Shipment.countDocuments(),

      Shipment.countDocuments({
        status: "READY_TO_SHIP",
      }),

      Shipment.countDocuments({
        status: "PROCESSING",
      }),

      Shipment.countDocuments({
        status: "PACKED",
      }),

      Shipment.countDocuments({
        status: "SHIPPED",
      }),

      Shipment.countDocuments({
        status: "DELIVERED",
      }),

      Shipment.countDocuments({
        status: "DELIVERY_FAILED",
      }),

      Shipment.countDocuments({
        status: "CANCELLED",
      }),

      Redemption.countDocuments({
        status: "PENDING",
      }),

      Shipment.countDocuments({
        shippedAt: {
          $gte: startOfToday,
        },
      }),

      Shipment.countDocuments({
        shippedAt: {
          $gte: startOfMonth,
        },
      }),
    ]);

    return res.json({
      success: true,

      stats: {
        total: totalShipments,

        totalShipments,

        pending: pendingRequests,

        pendingRequests,

        readyToShip,

        processing,

        packed,

        shipped,

        delivered,

        failed,

        deliveryFailed: failed,

        cancelled,

        shippedToday,

        shippedThisMonth,

        today: shippedToday,

        month: shippedThisMonth,

        tillNow: totalShipments,
      },
    });
  } catch (error) {
    console.error(
      "GET SHIPPING STATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipping stats",
      error: error.message,
    });
  }
};

// =====================================================
// GET SHIPMENT BY ID
// GET /api/admin/shipping/:id
// =====================================================

const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    // First search actual shipment
    const shipment = await populateShipment(
      Shipment.findById(id)
    );

    if (shipment) {
      return res.json({
        success: true,
        shipment,
        data: shipment,
      });
    }

    // If not shipment, search redemption
    const redemption =
      await populateRedemption(
        Redemption.findById(id)
      );

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message:
          "Shipment or shipping request not found",
      });
    }

    const card =
      redemption.userPackCard?.card || null;

    const pendingShipment = {
      _id: redemption._id,

      redemption: redemption._id,

      redemptionId: redemption._id,

      shipmentNumber:
        redemption.redemptionNumber
          ? `REQ-${redemption.redemptionNumber}`
          : `REQ-${String(
              redemption._id
            ).slice(-10)}`,

      redemptionNumber:
        redemption.redemptionNumber || "",

      approvalStatus:
        redemption.status,

      status:
        redemption.status === "PENDING"
          ? "PENDING"
          : redemption.status,

      shippingStatus:
        redemption.status === "PENDING"
          ? "PENDING"
          : redemption.status,

      isRedemptionRequest: true,

      user: redemption.user,

      userPackCard:
        redemption.userPackCard,

      card,

      pack: redemption.pack,

      userPack:
        redemption.userPack,

      shippingAddress:
        redemption.shippingAddress || {},

      marketPrice: safeNumber(
        redemption.userPackCard?.marketPrice,
        card?.price
      ),

      shippingFee: safeNumber(
        redemption.shippingFee,
        5
      ),

      createdAt:
        redemption.createdAt ||
        redemption.requestedAt,

      updatedAt:
        redemption.updatedAt,
    };

    return res.json({
      success: true,
      shipment: pendingShipment,
      data: pendingShipment,
    });
  } catch (error) {
    console.error(
      "GET SHIPMENT BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipment",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SHIPMENT
// PATCH /api/admin/shipping/:id
// =====================================================

const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const shipment =
      await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const allowedFields = [
      "status",
      "carrier",
      "trackingNumber",
      "trackingUrl",
      "notes",
      "estimatedDeliveryAt",
      "failureReason",
      "cancellationReason",
    ];

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        shipment[field] =
          req.body[field];
      }
    }

    const adminId = getAdminId(req);

    if (adminId) {
      shipment.processedBy = adminId;
    }

    const now = new Date();

    if (
      shipment.status === "PROCESSING" &&
      !shipment.processingAt
    ) {
      shipment.processingAt = now;
    }

    if (
      shipment.status === "PACKED" &&
      !shipment.packedAt
    ) {
      shipment.packedAt = now;
    }

    if (
      shipment.status === "SHIPPED" &&
      !shipment.shippedAt
    ) {
      shipment.shippedAt = now;
    }

    if (
      shipment.status === "DELIVERED" &&
      !shipment.deliveredAt
    ) {
      shipment.deliveredAt = now;
    }

    if (
      shipment.status === "DELIVERY_FAILED" &&
      !shipment.deliveryFailedAt
    ) {
      shipment.deliveryFailedAt = now;
    }

    if (
      shipment.status === "CANCELLED" &&
      !shipment.cancelledAt
    ) {
      shipment.cancelledAt = now;
    }

    await shipment.save();

    const updatedShipment =
      await populateShipment(
        Shipment.findById(shipment._id)
      );

    return res.json({
      success: true,

      message:
        "Shipment updated successfully",

      shipment: updatedShipment,

      data: updatedShipment,
    });
  } catch (error) {
    console.error(
      "UPDATE SHIPMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};

// =====================================================
// APPROVE SHIPPING REQUEST
// PATCH /api/admin/shipping/:id/approve
// =====================================================

const approveShippingRequest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const adminId = getAdminId(req);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication required",
      });
    }

    // Find redemption
    let redemption =
      await Redemption.findById(id);

    // If shipment ID was supplied
    if (!redemption) {
      const existingShipment =
        await Shipment.findById(id);

      if (existingShipment?.redemption) {
        redemption =
          await Redemption.findById(
            existingShipment.redemption
          );
      }
    }

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message:
          "Shipping request not found",
      });
    }

    if (redemption.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Request has already been ${String(
            redemption.status
          ).toLowerCase()}`,
      });
    }

    const userPackCard =
      await UserPackCard.findById(
        redemption.userPackCard
      );

    if (!userPackCard) {
      return res.status(404).json({
        success: false,
        message:
          "User pack card not found",
      });
    }

    if (userPackCard.status !== "SHIPPING") {
      return res.status(400).json({
        success: false,
        message:
          `Card is not in SHIPPING status. Current status: ${userPackCard.status}`,
      });
    }

    // -------------------------------------------------
    // APPROVE REDEMPTION
    // -------------------------------------------------

    redemption.status = "APPROVED";

    redemption.processedBy = adminId;

    redemption.approvedAt = new Date();

    await redemption.save();

    // -------------------------------------------------
    // FIND EXISTING SHIPMENT
    // -------------------------------------------------

    let shipment =
      await Shipment.findOne({
        redemption: redemption._id,
      });

    // -------------------------------------------------
    // CREATE SHIPMENT
    // -------------------------------------------------

    if (!shipment) {
      const card =
        await Card.findById(
          userPackCard.card
        );

      const userPack =
        await UserPack.findById(
          userPackCard.userPack
        );

      let pack = null;

      if (userPack?.pack) {
        pack =
          await Pack.findById(
            userPack.pack
          );
      }

      shipment = new Shipment({
        redemption: redemption._id,

        user: redemption.user,

        userPackCard:
          redemption.userPackCard,

        card: userPackCard.card,

        userPack:
          redemption.userPack,

        pack:
          pack?._id ||
          redemption.pack ||
          userPack?.pack,

        marketPrice: safeNumber(
          userPackCard.marketPrice,
          card?.price
        ),

        shippingFee: safeNumber(
          redemption.shippingFee,
          5
        ),

        shippingAddress:
          redemption.shippingAddress || {},

        status: "READY_TO_SHIP",

        notes: "Approved by admin",
      });

      await shipment.save();

      redemption.shipment =
        shipment._id;

      await redemption.save();
    }

    const finalShipment =
      await populateShipment(
        Shipment.findById(
          shipment._id
        )
      );

    return res.json({
      success: true,

      message:
        "Shipping request approved successfully",

      shipment: finalShipment,

      data: finalShipment,
    });
  } catch (error) {
    console.error(
      "APPROVE SHIPPING REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve shipping request",
      error: error.message,
    });
  }
};

// =====================================================
// REJECT SHIPPING REQUEST
// PATCH /api/admin/shipping/:id/reject
// =====================================================

const rejectShippingRequest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      reason =
        "Shipping request rejected by admin",
    } = req.body || {};

    const adminId = getAdminId(req);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication required",
      });
    }

    // Find redemption
    let redemption =
      await Redemption.findById(id);

    if (!redemption) {
      const existingShipment =
        await Shipment.findById(id);

      if (existingShipment?.redemption) {
        redemption =
          await Redemption.findById(
            existingShipment.redemption
          );
      }
    }

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message:
          "Shipping request not found",
      });
    }

    if (redemption.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Request is already ${String(
            redemption.status
          ).toLowerCase()}`,
      });
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user =
      await User.findById(
        redemption.user
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // REFUND SHIPPING FEE
    // -------------------------------------------------

    const refundAmount = safeNumber(
      redemption.shippingFee,
      5
    );

    let wallet =
      await Wallet.findOne({
        user: user._id,
      });

    if (!wallet) {
      wallet = new Wallet({
        user: user._id,
        balance: 0,
      });

      await wallet.save();
    }

    const oldBalance = safeNumber(
      wallet.balance
    );

    wallet.balance =
      oldBalance + refundAmount;

    await wallet.save();

    // -------------------------------------------------
    // WALLET TRANSACTION
    // -------------------------------------------------

    const walletTransaction =
      new WalletTransaction({
        user: user._id,

        type: "DEPOSIT",

        amount: refundAmount,

        balanceBefore: oldBalance,

        balanceAfter: wallet.balance,

        description:
          "Shipping fee refund - shipping request rejected",

        reference: redemption._id,

        metadata: {
          redemptionId:
            redemption._id,

          reason,
        },
      });

    await walletTransaction.save();

    // -------------------------------------------------
    // UPDATE REDEMPTION
    // -------------------------------------------------

    redemption.status = "REJECTED";

    redemption.rejectionReason =
      reason;

    redemption.processedBy =
      adminId;

    redemption.rejectedAt =
      new Date();

    await redemption.save();

    // -------------------------------------------------
    // UPDATE CARD
    // -------------------------------------------------

    const userPackCard =
      await UserPackCard.findById(
        redemption.userPackCard
      );

    if (userPackCard) {
      userPackCard.status = "SOLD";

      await userPackCard.save();
    }

    // -------------------------------------------------
    // CANCEL EXISTING SHIPMENT
    // -------------------------------------------------

    if (redemption.shipment) {
      const shipment =
        await Shipment.findById(
          redemption.shipment
        );

      if (
        shipment &&
        shipment.status !== "DELIVERED"
      ) {
        shipment.status =
          "CANCELLED";

        shipment.cancelledAt =
          new Date();

        shipment.cancellationReason =
          reason;

        await shipment.save();
      }
    }

    return res.json({
      success: true,

      message:
        "Shipping request rejected and shipping fee refunded",

      refund: {
        amount: refundAmount,

        balance: wallet.balance,
      },

      redemption: {
        id: redemption._id,

        status: redemption.status,
      },
    });
  } catch (error) {
    console.error(
      "REJECT SHIPPING REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject shipping request",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE SHIPMENT FROM APPROVED REDEMPTION
// POST /api/admin/shipping/from-redemption/:redemptionId
// =====================================================

const createShipmentFromRedemption =
  async (req, res) => {
    try {
      const { redemptionId } =
        req.params;

      if (
        !isValidObjectId(
          redemptionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid redemption ID",
        });
      }

      const redemption =
        await Redemption.findById(
          redemptionId
        );

      if (!redemption) {
        return res.status(404).json({
          success: false,
          message:
            "Redemption not found",
        });
      }

      if (
        redemption.status !==
        "APPROVED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Redemption must be approved before creating shipment",
        });
      }

      // Check existing shipment
      let shipment =
        await Shipment.findOne({
          redemption:
            redemption._id,
        });

      if (shipment) {
        const populated =
          await populateShipment(
            Shipment.findById(
              shipment._id
            )
          );

        return res.json({
          success: true,

          message:
            "Shipment already exists",

          shipment: populated,

          data: populated,
        });
      }

      const userPackCard =
        await UserPackCard.findById(
          redemption.userPackCard
        );

      if (!userPackCard) {
        return res.status(404).json({
          success: false,
          message:
            "User pack card not found",
        });
      }

      const card =
        await Card.findById(
          userPackCard.card
        );

      const userPack =
        await UserPack.findById(
          userPackCard.userPack
        );

      let pack = null;

      if (userPack?.pack) {
        pack =
          await Pack.findById(
            userPack.pack
          );
      }

      shipment = new Shipment({
        redemption:
          redemption._id,

        user:
          redemption.user,

        userPackCard:
          redemption.userPackCard,

        card:
          userPackCard.card,

        userPack:
          redemption.userPack,

        pack:
          pack?._id ||
          redemption.pack ||
          userPack?.pack,

        marketPrice: safeNumber(
          userPackCard.marketPrice,
          card?.price
        ),

        shippingFee: safeNumber(
          redemption.shippingFee,
          5
        ),

        shippingAddress:
          redemption.shippingAddress ||
          {},

        status:
          "READY_TO_SHIP",

        notes:
          "Shipment created from approved redemption",
      });

      await shipment.save();

      redemption.shipment =
        shipment._id;

      await redemption.save();

      const populated =
        await populateShipment(
          Shipment.findById(
            shipment._id
          )
        );

      return res.status(201).json({
        success: true,

        message:
          "Shipment created successfully",

        shipment: populated,

        data: populated,
      });
    } catch (error) {
      console.error(
        "CREATE SHIPMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create shipment",
        error: error.message,
      });
    }
  };

// =====================================================
// CANCEL SHIPMENT
// PATCH /api/admin/shipping/:id/cancel
// =====================================================

const cancelShipment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      reason =
        "Cancelled by admin",
    } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid shipment ID",
      });
    }

    const shipment =
      await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message:
          "Shipment not found",
      });
    }

    if (
      shipment.status ===
      "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivered shipment cannot be cancelled",
      });
    }

    shipment.status =
      "CANCELLED";

    shipment.cancelledAt =
      new Date();

    shipment.cancellationReason =
      reason;

    const adminId =
      getAdminId(req);

    if (adminId) {
      shipment.processedBy =
        adminId;
    }

    await shipment.save();

    if (shipment.userPackCard) {
      const userPackCard =
        await UserPackCard.findById(
          shipment.userPackCard
        );

      if (userPackCard) {
        userPackCard.status =
          "CANCELLED";

        await userPackCard.save();
      }
    }

    const populated =
      await populateShipment(
        Shipment.findById(
          shipment._id
        )
      );

    return res.json({
      success: true,

      message:
        "Shipment cancelled successfully",

      shipment: populated,

      data: populated,
    });
  } catch (error) {
    console.error(
      "CANCEL SHIPMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel shipment",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getShipments,
  getShipmentStats,
  getShipmentById,
  updateShipment,
  createShipmentFromRedemption,
  approveShippingRequest,
  rejectShippingRequest,
  cancelShipment,
};