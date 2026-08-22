const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");


// =====================================================
// GET WALLET
// GET /api/wallet
// =====================================================

const getWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({
      user: userId,
    });

    // Create wallet automatically
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        transactions: [],
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
// GET WALLET BALANCE
// GET /api/wallet/balance
// =====================================================

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
      },
    });

  } catch (error) {
    console.error(
      "Wallet balance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get wallet balance",
    });
  }
};


// =====================================================
// ADD MONEY
// POST /api/wallet/add
// =====================================================

const addMoney = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      amount,
      reason = "Wallet top-up",
      reference = null,
    } = req.body;

    const money = Number(amount);

    if (
      !Number.isFinite(money) ||
      money <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (money > 100000) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum wallet top-up is ₹100000",
      });
    }

    let wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    wallet.balance += money;

    wallet.transactions.unshift({
      type: "CREDIT",
      amount: money,
      balanceAfter: wallet.balance,
      reason,
      reference,
    });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "Money added successfully",
      data: {
        balance: wallet.balance,
        transaction:
          wallet.transactions[0],
      },
    });

  } catch (error) {
    console.error(
      "Add money error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to add money",
    });
  }
};


// =====================================================
// DEDUCT MONEY
// POST /api/wallet/deduct
// =====================================================

const deductMoney = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      amount,
      reason = "Wallet payment",
      reference = null,
    } = req.body;

    const money = Number(amount);

    if (
      !Number.isFinite(money) ||
      money <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    /*
      Atomic update prevents two requests
      from spending the same balance.
    */

    const wallet = await Wallet.findOneAndUpdate(
      {
        user: userId,
        balance: {
          $gte: money,
        },
      },
      {
        $inc: {
          balance: -money,
        },
      },
      {
        new: true,
      }
    );

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    wallet.transactions.unshift({
      type: "DEBIT",
      amount: money,
      balanceAfter: wallet.balance,
      reason,
      reference,
    });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "Money deducted successfully",
      data: {
        balance: wallet.balance,
        transaction:
          wallet.transactions[0],
      },
    });

  } catch (error) {
    console.error(
      "Deduct money error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to deduct money",
    });
  }
};


// =====================================================
// TRANSACTION HISTORY
// GET /api/wallet/transactions
// =====================================================

const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await Wallet.findOne({
      user: userId,
    }).lean();

    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0,
          transactions: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        transactions:
          wallet.transactions || [],
      },
    });

  } catch (error) {
    console.error(
      "Wallet transactions error:",
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
  getWalletBalance,
  addMoney,
  deductMoney,
  getTransactions,
};