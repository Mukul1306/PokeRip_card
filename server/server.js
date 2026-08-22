require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const adminRoutes =
  require("./routes/adminRoutes");

const adminUserRoutes =
  require("./routes/adminUserRoutes");

const adminCardRoutes =
  require("./routes/adminCardRoutes");

const adminPackCategoryRoutes =
  require("./routes/adminPackCategoryRoutes");

const adminPackRoutes =
  require("./routes/adminPackRoutes");

const adminPackOddsRoutes =
  require("./routes/adminPackOddsRoutes");
const adminInventoryRoutes =
  require("./routes/adminInventoryRoutes");
const orderRoutes =
  require("./routes/orderRoutes");
const kycRoutes =
  require("./routes/kycRoutes");
const adminOrderRoutes =
  require("./routes/adminOrderRoutes");
const userDashboardRoutes =
  require("./routes/userDashboardRoutes");
const userPackRoutes =
  require("./routes/userPackRoutes");
const app = express();
const adminKycRoutes =
  require("./routes/adminKycRoutes");
const walletRoutes =
  require("./routes/walletRoutes");
// =====================================================
// DEBUG ENV
// =====================================================

console.log(
  "Pokemon API key loaded:",
  !!process.env.POKEMON_TCG_API_KEY
);


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());


// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PokeRip API is running",
  });
});


// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);


// =====================================================
// ADMIN
// =====================================================

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

app.use(
  "/api/admin/cards",
  adminCardRoutes
);

app.use(
  "/api/admin/pack-categories",
  adminPackCategoryRoutes
);

app.use(
  "/api/admin/packs",
  adminPackRoutes
);

app.use(
  "/api/admin/odds",
  adminPackOddsRoutes
);

app.use(
  "/api/admin/inventory",
  adminInventoryRoutes
);
app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);
app.use(
  "/api/user/dashboard",
  userDashboardRoutes
);
app.use(
  "/api/user/packs",
  userPackRoutes
);

app.use(
  "/api/kyc",
  kycRoutes
);
app.use(
  "/api/admin/kyc",
  adminKycRoutes
);

app.use(
  "/api/wallet",
  walletRoutes
);










app.get("/api/test-packs", async (req, res) => {
  try {
    const Pack = require("./models/Pack");

    const packs = await Pack.find({});

    res.json({
      success: true,
      count: packs.length,
      packs: packs.map((pack) => ({
        id: pack._id,
        name: pack.name,
        status: pack.status,
        price: pack.price,
      })),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});