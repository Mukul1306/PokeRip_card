const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

// =====================================================
// GET WALLET REQUESTS
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

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Number(limit) || 20,
        100
      );

    // =================================================
    // BUILD QUERY
    // =================================================

    const query = {};

    if (
      status !== "ALL"
    ) {
      query.status =
        status;
    }

    if (
      type !== "ALL"
    ) {
      query.type =
        type;
    }

    // =================================================
    // TOTAL
    // =================================================

    const total =
      await WalletTransaction.countDocuments(
        query
      );

    // =================================================
    // REQUESTS
    // =================================================

    const requests =
      await WalletTransaction.find(
        query
      )
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
        .limit(
          limitNumber
        )
        .lean();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      data: {

        requests,

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
// GET ADMIN WALLET SUMMARY
//
// GET /api/admin/wallet/summary
//
// Returns:
//
// - Total admin fees
// - Total sell amount
// - Total shipping fees
// - Number of sold cards
// - Number of shipping transactions
// =====================================================

const getAdminWalletSummary = async (
  req,
  res
) => {

  try {

    // =================================================
    // ADMIN FEE
    // =================================================

    const adminFeeResult =
      await WalletTransaction.aggregate([

        {
          $match: {
            type:
              "ADMIN_FEE",

            status:
              "APPROVED",
          },
        },

        {
          $group: {

            _id:
              null,

            total:
              {
                $sum:
                  "$amount",
              },

            count:
              {
                $sum:
                  1,
              },
          },
        },
      ]);

    // =================================================
    // SELL TOTAL
    // =================================================

    const sellResult =
      await WalletTransaction.aggregate([

        {
          $match: {

            type:
              "SELL",

            status:
              "APPROVED",
          },
        },

        {
          $group: {

            _id:
              null,

            total:
              {
                $sum:
                  "$amount",
              },

            count:
              {
                $sum:
                  1,
              },
          },
        },
      ]);

    // =================================================
    // SHIPPING TOTAL
    // =================================================

    const shippingResult =
      await WalletTransaction.aggregate([

        {
          $match: {

            type:
              "SHIPPING",

            status:
              "APPROVED",
          },
        },

        {
          $group: {

            _id:
              null,

            total:
              {
                $sum:
                  "$amount",
              },

            count:
              {
                $sum:
                  1,
              },
          },
        },
      ]);

    // =================================================
    // PENDING
    // =================================================

    const pendingResult =
      await WalletTransaction.aggregate([

        {
          $match: {

            status:
              "PENDING",
          },
        },

        {
          $group: {

            _id:
              null,

            total:
              {
                $sum:
                  "$amount",
              },

            count:
              {
                $sum:
                  1,
              },
          },
        },
      ]);

    // =================================================
    // EXTRACT RESULTS
    // =================================================

    const adminFees =
      adminFeeResult[0] || {
        total: 0,
        count: 0,
      };

    const sells =
      sellResult[0] || {
        total: 0,
        count: 0,
      };

    const shipping =
      shippingResult[0] || {
        total: 0,
        count: 0,
      };

    const pending =
      pendingResult[0] || {
        total: 0,
        count: 0,
      };

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      data: {

        adminBalance:
          Number(
            adminFees.total || 0
          ),

        totalAdminFees:
          Number(
            adminFees.total || 0
          ),

        totalSellAmount:
          Number(
            sells.total || 0
          ),

        totalShippingFees:
          Number(
            shipping.total || 0
          ),

        totalPending:
          Number(
            pending.total || 0
          ),

        counts: {

          adminFeeTransactions:
            Number(
              adminFees.count || 0
            ),

          sellTransactions:
            Number(
              sells.count || 0
            ),

          shippingTransactions:
            Number(
              shipping.count || 0
            ),

          pendingTransactions:
            Number(
              pending.count || 0
            ),
        },
      },
    });

  } catch (error) {

    console.error(
      "Get admin wallet summary error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load admin wallet summary",
    });
  }
};


// =====================================================
// APPROVE WALLET REQUEST
//
// PUT /api/admin/wallet/requests/:id/approve
// =====================================================

const approveWalletRequest =
  async (
    req,
    res
  ) => {

    const session =
      await mongoose.startSession();

    try {

      const { id } =
        req.params;

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
            "Invalid transaction ID",
        });
      }

      session.startTransaction();

      // =================================================
      // FIND TRANSACTION
      // =================================================

      const transaction =
        await WalletTransaction.findById(
          id
        ).session(
          session
        );

      if (!transaction) {

        await session.abortTransaction();

        return res.status(404).json({

          success: false,

          message:
            "Wallet request not found",
        });
      }

      // =================================================
      // PREVENT DOUBLE APPROVAL
      // =================================================

      if (
        transaction.status !==
        "PENDING"
      ) {

        await session.abortTransaction();

        return res.status(400).json({

          success: false,

          message:
            `Request is already ${transaction.status.toLowerCase()}`,
        });
      }

      // =================================================
      // SELL / ADMIN_FEE / SHIPPING
      //
      // These are already finalized by the
      // RIP controller.
      //
      // Admin should NOT approve them again.
      // =================================================

      if (
        [
          "SELL",
          "ADMIN_FEE",
          "SHIPPING",
        ].includes(
          transaction.type
        )
      ) {

        await session.abortTransaction();

        return res.status(400).json({

          success: false,

          message:
            `${transaction.type} transactions are automatically approved and do not require admin approval.`,
        });
      }

      // =================================================
      // FIND USER WALLET
      // =================================================

      let wallet =
        await Wallet.findOne({

          user:
            transaction.user,

        }).session(
          session
        );

      // =================================================
      // CREATE WALLET IF REQUIRED
      // =================================================

      if (!wallet) {

        wallet =
          new Wallet({

            user:
              transaction.user,

            balance:
              0,
          });

        await wallet.save({
          session,
        });
      }

      // =================================================
      // DEPOSIT
      // =================================================

      if (
        transaction.type ===
        "DEPOSIT"
      ) {

        wallet.balance =
          Number(
            wallet.balance
          ) +
          Number(
            transaction.amount
          );

        await wallet.save({
          session,
        });
      }

      // =================================================
      // WITHDRAWAL
      // =================================================

      if (
        transaction.type ===
        "WITHDRAWAL"
      ) {

        if (
          Number(
            transaction.amount
          ) >
          Number(
            wallet.balance
          )
        ) {

          await session.abortTransaction();

          return res.status(400).json({

            success: false,

            message:
              "Insufficient wallet balance for this withdrawal",
          });
        }

        wallet.balance =
          Number(
            wallet.balance
          ) -
          Number(
            transaction.amount
          );

        await wallet.save({
          session,
        });
      }

      // =================================================
      // UPDATE TRANSACTION
      // =================================================

      transaction.status =
        "APPROVED";

      transaction.processedBy =
        req.user.id;

      transaction.processedAt =
        new Date();

      await transaction.save({
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
          `${transaction.type} request approved successfully`,

        data: {

          transaction,

          wallet,
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
        "Approve wallet request error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to approve wallet request",
      });

    } finally {

      await session.endSession();
    }
  };


// =====================================================
// REJECT WALLET REQUEST
//
// PUT /api/admin/wallet/requests/:id/reject
// =====================================================

const rejectWalletRequest =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const {
        rejectionReason = "",
      } = req.body;

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
            "Invalid transaction ID",
        });
      }

      // =================================================
      // FIND TRANSACTION
      // =================================================

      const transaction =
        await WalletTransaction.findById(
          id
        );

      if (!transaction) {

        return res.status(404).json({

          success: false,

          message:
            "Wallet request not found",
        });
      }

      // =================================================
      // PREVENT DOUBLE PROCESSING
      // =================================================

      if (
        transaction.status !==
        "PENDING"
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Request is already ${transaction.status.toLowerCase()}`,
        });
      }

      // =================================================
      // SELL / ADMIN_FEE / SHIPPING
      //
      // These should never be manually rejected.
      // =================================================

      if (
        [
          "SELL",
          "ADMIN_FEE",
          "SHIPPING",
        ].includes(
          transaction.type
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            `${transaction.type} transactions cannot be rejected manually.`,
        });
      }

      // =================================================
      // UPDATE TRANSACTION
      // =================================================

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

      // =================================================
      // RESPONSE
      // =================================================

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


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  getWalletRequests,

  getAdminWalletSummary,

  approveWalletRequest,

  rejectWalletRequest,
};