const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

// =====================================================
// GET ALL WALLET REQUESTS
// GET /api/admin/wallet/requests
// =====================================================

const getWalletRequests = async (
  req,
  res
) => {
  try {
    const {
      status = "ALL",
      type = "ALL",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Number(limit) || 20,
      100
    );

    const query = {};

    if (status !== "ALL") {
      query.status = status;
    }

    if (type !== "ALL") {
      query.type = type;
    }

    const total =
      await WalletTransaction.countDocuments(
        query
      );

    const requests =
      await WalletTransaction.find(query)
        .populate(
          "user",
          "name email mobile phone"
        )
        .populate(
          "processedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(limitNumber)
        .lean();

    return res.status(200).json({
      success: true,

      data: {
        requests,

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get wallet requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load wallet requests",
    });
  }
};

// =====================================================
// APPROVE WALLET REQUEST
// PUT /api/admin/wallet/requests/:id/approve
// =====================================================

const approveWalletRequest = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    session.startTransaction();

    const transaction =
      await WalletTransaction.findById(
        id
      ).session(session);

    if (!transaction) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Wallet request not found",
      });
    }

    // Prevent double approval
    if (transaction.status !== "PENDING") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Request is already ${transaction.status.toLowerCase()}`,
      });
    }

    let wallet =
      await Wallet.findOne({
        user: transaction.user,
      }).session(session);

    // Create wallet if required
    if (!wallet) {
      wallet = new Wallet({
        user: transaction.user,
        balance: 0,
      });

      await wallet.save({
        session,
      });
    }

    // =================================================
    // DEPOSIT
    // =================================================

    if (
      transaction.type === "DEPOSIT"
    ) {
      wallet.balance =
        Number(wallet.balance) +
        Number(transaction.amount);

      await wallet.save({
        session,
      });
    }

    // =================================================
    // WITHDRAWAL
    // =================================================

    if (
      transaction.type === "WITHDRAWAL"
    ) {
      if (
        Number(transaction.amount) >
        Number(wallet.balance)
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Insufficient wallet balance for this withdrawal",
        });
      }

      wallet.balance =
        Number(wallet.balance) -
        Number(transaction.amount);

      await wallet.save({
        session,
      });
    }

    transaction.status =
      "APPROVED";

    transaction.processedBy =
      req.user.id;

    transaction.processedAt =
      new Date();

    await transaction.save({
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        `${transaction.type} request approved successfully`,
      data: {
        transaction,
        wallet,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Approve wallet request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to approve wallet request",
    });
  } finally {
    session.endSession();
  }
};

// =====================================================
// REJECT WALLET REQUEST
// PUT /api/admin/wallet/requests/:id/reject
// =====================================================

const rejectWalletRequest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      rejectionReason = "",
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction =
      await WalletTransaction.findById(
        id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Wallet request not found",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Request is already ${transaction.status.toLowerCase()}`,
      });
    }

    transaction.status =
      "REJECTED";

    transaction.rejectionReason =
      rejectionReason ||
      "Request rejected by admin";

    transaction.processedBy =
      req.user.id;

    transaction.processedAt =
      new Date();

    await transaction.save();

    return res.status(200).json({
      success: true,
      message:
        "Wallet request rejected successfully",
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.error(
      "Reject wallet request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reject wallet request",
    });
  }
};

module.exports = {
  getWalletRequests,
  approveWalletRequest,
  rejectWalletRequest,
};