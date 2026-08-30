require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const connectDB = require("./config/db");

// =====================================================
// PRICE UPDATE CONTROLLER
// =====================================================

const {
  refreshAllCardPrices,
} = require("./controllers/adminInventoryController");

// =====================================================
// RIP EXPIRY SERVICE
// Automatically sells revealed cards after 5 minutes
// =====================================================

const {
  processExpiredRipCards,
} = require("./services/ripExpiryService");

// =====================================================
// ROUTES
// =====================================================

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

const adminKycRoutes =
  require("./routes/adminKycRoutes");

const walletRoutes =
  require("./routes/walletRoutes");

const collectionRoutes =
  require("./routes/collectionRoutes");

const adminWalletRoutes =
  require("./routes/adminWalletRoutes");

const ripRoutes =
  require("./routes/ripRoutes");
  const adminReportRoutes =
  require("./routes/adminReportRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

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
// DAILY CARD PRICE UPDATE
// Runs every day at 2:00 AM IST
// =====================================================

cron.schedule(
  "0 2 * * *",
  async () => {
    console.log(
      "========================================"
    );

    console.log(
      "Starting daily Pokemon card price update..."
    );

    console.log(
      "========================================"
    );

    try {
      const result =
        await refreshAllCardPrices();

      console.log(
        "Daily price update result:",
        result
      );

      console.log(
        "========================================"
      );
    } catch (error) {
      console.error(
        "Daily price update failed:",
        error.message
      );

      console.log(
        "========================================"
      );
    }
  },
  {
    timezone: "America/New_York",
  }
);

// =====================================================
// RIP CARD EXPIRY CHECK
//
// Runs every 10 seconds.
//
// If a revealed card has passed its 5-minute
// decision deadline and the user did not choose
// SELL or SHIP, it is automatically sold.
//
// =====================================================

cron.schedule(
  "*/10 * * * * *",
  async () => {
    try {
      await processExpiredRipCards();
    } catch (error) {
      console.error(
        "RIP expiry check failed:",
        error.message
      );
    }
  }
);

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

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "PokeRip API is running",
    });
  }
);

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
  "/api/admin/report",
  adminReportRoutes
);
// =====================================================
// ORDERS
// =====================================================

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

// =====================================================
// USER
// =====================================================

app.use(
  "/api/user/dashboard",
  userDashboardRoutes
);

app.use(
  "/api/user/packs",
  userPackRoutes
);

// =====================================================
// KYC
// =====================================================

app.use(
  "/api/kyc",
  kycRoutes
);

app.use(
  "/api/admin/kyc",
  adminKycRoutes
);

// =====================================================
// WALLET
// =====================================================

app.use(
  "/api/wallet",
  walletRoutes
);

app.use(
  "/api/collection",
  collectionRoutes
);

app.use(
  "/api/admin/wallet",
  adminWalletRoutes
);

// =====================================================
// RIP
// =====================================================

app.use(
  "/api/rip",
  ripRoutes
);

// =====================================================
// TEST PACKS
// =====================================================

app.get(
  "/api/test-packs",
  async (req, res) => {
    try {
      const Pack =
        require("./models/Pack");

      const packs =
        await Pack.find({});

      res.json({
        success: true,

        count:
          packs.length,

        packs:
          packs.map((pack) => ({
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
        message:
          error.message,
      });
    }
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      "Daily price scheduler is active."
    );

    console.log(
      "Next automatic price update: 2:00 AM IST."
    );

    console.log(
      "RIP 5-minute expiry scheduler is active."
    );

    console.log(
      "RIP expiry checks run every 10 seconds."
    );
  }
);