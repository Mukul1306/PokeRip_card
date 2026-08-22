const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");




// =====================================================
// GET MY WALLET
// GET /api/wallet
// =====================================================

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({
      user: userId,
    });

    // Create wallet automatically for first-time user
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        wallet,
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load wallet",
    });
  }
};

// =====================================================
// CREATE DEPOSIT REQUEST
// POST /api/wallet/deposit
// =====================================================

const createDepositRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const { amount, note } = req.body;

    const depositAmount = Number(amount);

    if (
      !Number.isFinite(depositAmount) ||
      depositAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid deposit amount",
      });
    }

    // Optional maximum
    if (depositAmount > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Deposit amount is too large",
      });
    }

    // Check existing pending deposit
    const existingRequest =
      await WalletTransaction.findOne({
        user: userId,
        type: "DEPOSIT",
        status: "PENDING",
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending deposit request",
      });
    }

    const transaction =
      await WalletTransaction.create({
        user: userId,
        type: "DEPOSIT",
        amount: depositAmount,
        status: "PENDING",
        note: note || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Deposit request submitted successfully",
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.error(
      "Create deposit request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create deposit request",
    });
  }
};

// =====================================================
// CREATE WITHDRAWAL REQUEST
// POST /api/wallet/withdraw
// =====================================================

const createWithdrawalRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const { amount, note } = req.body;

    const withdrawalAmount = Number(amount);

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid withdrawal amount",
      });
    }

    const wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (
      withdrawalAmount >
      Number(wallet.balance)
    ) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // Prevent multiple pending withdrawals
    const existingRequest =
      await WalletTransaction.findOne({
        user: userId,
        type: "WITHDRAWAL",
        status: "PENDING",
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending withdrawal request",
      });
    }

    const transaction =
      await WalletTransaction.create({
        user: userId,
        type: "WITHDRAWAL",
        amount: withdrawalAmount,
        status: "PENDING",
        note: note || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted successfully",
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.error(
      "Create withdrawal request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create withdrawal request",
    });
  }
};

// =====================================================
// GET MY TRANSACTIONS
// GET /api/wallet/transactions
// =====================================================

const getWalletTransactions = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const transactions =
      await WalletTransaction.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

    return res.status(200).json({
      success: true,
      data: {
        transactions,
      },
    });
  } catch (error) {
    console.error(
      "Get wallet transactions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load wallet transactions",
    });
  }
};

module.exports = {
  getWallet,
  createDepositRequest,
  createWithdrawalRequest,
  getWalletTransactions,
};