const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Pack = require("../models/Pack");
const Card = require("../models/Card");
const CardInventory = require("../models/CardInventory");


// =====================================================
// GET COMPLETE ADMIN REPORT
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

      },

    });

  } catch (error) {

    // =================================================
    // VERY IMPORTANT DEBUG
    // =================================================

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

      // Development debugging
      ...(process.env.NODE_ENV !==
        "production" && {
        error: error.message,
      }),

    });

  }
};


module.exports = {
  getAdminReport,
};