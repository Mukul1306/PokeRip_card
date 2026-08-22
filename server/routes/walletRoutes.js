const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth");

const {
  getWallet,
  createDepositRequest,
  createWithdrawalRequest,
  getWalletTransactions,
} = require("../controllers/walletController");

// =====================================================
// GET WALLET
// =====================================================

router.get(
  "/",
  protect,
  getWallet
);

// =====================================================
// DEPOSIT REQUEST
// =====================================================

router.post(
  "/deposit",
  protect,
  createDepositRequest
);

// =====================================================
// WITHDRAW REQUEST
// =====================================================

router.post(
  "/withdraw",
  protect,
  createWithdrawalRequest
);

// =====================================================
// TRANSACTIONS
// =====================================================

router.get(
  "/transactions",
  protect,
  getWalletTransactions
);

module.exports = router;