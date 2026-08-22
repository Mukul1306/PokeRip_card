const express = require("express");

const router = express.Router();

const {
  getWallet,
  getWalletBalance,
  addMoney,
  deductMoney,
  getTransactions,
} = require("../controllers/walletController");

// Change this path to your actual authentication middleware
const auth = require("../middleware/auth");


// =====================================================
// WALLET
// =====================================================

router.get(
  "/",
  auth,
  getWallet
);


// =====================================================
// BALANCE
// =====================================================

router.get(
  "/balance",
  auth,
  getWalletBalance
);


// =====================================================
// ADD MONEY
// =====================================================

router.post(
  "/add",
  auth,
  addMoney
);


// =====================================================
// DEDUCT MONEY
// =====================================================

router.post(
  "/deduct",
  auth,
  deductMoney
);


// =====================================================
// TRANSACTIONS
// =====================================================

router.get(
  "/transactions",
  auth,
  getTransactions
);


module.exports = router;