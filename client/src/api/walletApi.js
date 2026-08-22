const API_URL = "http://localhost:5000/api/wallet";

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Common headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// =====================================================
// GET WALLET
// GET /api/wallet
// =====================================================

export const getWallet = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load wallet");
  }

  return data;
};

// =====================================================
// GET BALANCE
// GET /api/wallet/balance
// =====================================================

export const getWalletBalance = async () => {
  const response = await fetch(
    `${API_URL}/balance`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load balance"
    );
  }

  return data;
};

// =====================================================
// ADD MONEY
// POST /api/wallet/add
// =====================================================

export const addMoney = async (amount) => {
  const response = await fetch(
    `${API_URL}/add`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        amount: Number(amount),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to add money"
    );
  }

  return data;
};

// =====================================================
// DEDUCT MONEY
// POST /api/wallet/deduct
// =====================================================

export const deductMoney = async (amount) => {
  const response = await fetch(
    `${API_URL}/deduct`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        amount: Number(amount),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to deduct money"
    );
  }

  return data;
};

// =====================================================
// GET TRANSACTIONS
// GET /api/wallet/transactions
// =====================================================

export const getTransactions = async () => {
  const response = await fetch(
    `${API_URL}/transactions`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load transactions"
    );
  }

  return data;
};