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
// ADMIN SELLING ROUTES
// =====================================================

const adminSellingRoutes =
  require("./routes/adminSellingRoutes");


// =====================================================
// SHIPPING ROUTES
// =====================================================

const shippingRoutes =
  require("./routes/shippingRoutes");


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

console.log(
  "PokeWallet API key loaded:",
  !!process.env.POKEWALLET_API_KEY
);


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  express.json()
);


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


// =====================================================
// ADMIN REPORT
// =====================================================

app.use(
  "/api/admin/report",
  adminReportRoutes
);


// =====================================================
// ADMIN SELLING
// =====================================================
//
// GET
// /api/admin/sales
//
// GET
// /api/admin/sales?preset=today
//
// GET
// /api/admin/sales?preset=month
//
// GET
// /api/admin/sales?preset=all
//
// GET
// /api/admin/sales?from=2026-09-01&to=2026-09-10
//
// =====================================================

app.use(
  "/api/admin/sales",
  adminSellingRoutes
);


// =====================================================
// SHIPPING
// =====================================================
//
// GET
// /api/admin/shipping
//
// GET
// /api/admin/shipping/stats
//
// GET
// /api/admin/shipping/:id
//
// POST
// /api/admin/shipping/from-redemption/:redemptionId
//
// PATCH
// /api/admin/shipping/:id
//
// PATCH
// /api/admin/shipping/:id/cancel
//
// =====================================================

app.use(
  "/api/admin/shipping",
  shippingRoutes
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


// =====================================================
// COLLECTION
// =====================================================

app.use(
  "/api/collection",
  collectionRoutes
);


// =====================================================
// ADMIN WALLET
// =====================================================

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
          packs.map(
            (pack) => ({
              id:
                pack._id,

              name:
                pack.name,

              status:
                pack.status,

              price:
                pack.price,
            })
          ),
      });

    } catch (error) {

      console.error(
        "Test packs error:",
        error
      );


      res.status(500).json({
        success: false,

        message:
          error.message,
      });

    }

  }
);


// =====================================================
// SERVER START FUNCTION
// =====================================================

const PORT =
  process.env.PORT || 5000;


// =====================================================
// START SERVER
//
// MongoDB connects BEFORE:
//
// 1. Server starts
// 2. Price scheduler starts
// 3. RIP expiry scheduler starts
//
// =====================================================

const startServer =
  async () => {

    try {

      // ===============================================
      // CONNECT DATABASE
      // ===============================================

      console.log(
        "Connecting to MongoDB..."
      );


      await connectDB();


      console.log(
        "MongoDB connected successfully."
      );


      // ===============================================
      // DAILY CARD PRICE UPDATE
      //
      // 2:00 AM IST
      // ===============================================

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
          timezone:
            "Asia/Kolkata",
        }
      );


      console.log(
        "Daily price scheduler is active."
      );


      console.log(
        "Next automatic price update: 2:00 AM IST."
      );


      // ===============================================
      // RIP EXPIRY SCHEDULER
      //
      // Runs every 10 seconds.
      //
      // Automatically sells cards whose
      // 5-minute decision deadline expired.
      // ===============================================

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


      console.log(
        "RIP 5-minute expiry scheduler is active."
      );


      console.log(
        "RIP expiry checks run every 10 seconds."
      );


      // ===============================================
      // START HTTP SERVER
      // ===============================================

      app.listen(
        PORT,

        () => {

          console.log(
            "========================================"
          );


          console.log(
            `Server running on port ${PORT}`
          );


          console.log(
            "MongoDB connection is ready."
          );


          console.log(
            "All services started successfully."
          );


          console.log(
            "========================================"
          );

        }
      );

    } catch (error) {

      // ===============================================
      // DATABASE / STARTUP ERROR
      // ===============================================

      console.error(
        "========================================"
      );


      console.error(
        "SERVER STARTUP FAILED"
      );


      console.error(
        "========================================"
      );


      console.error(
        error
      );


      console.error(
        "========================================"
      );


      console.error(
        "MongoDB connection could not be established."
      );


      console.error(
        "Server was NOT started."
      );


      console.error(
        "Please check your MongoDB connection."
      );


      console.error(
        "========================================"
      );


      process.exit(1);

    }

  };


// =====================================================
// START
// =====================================================

startServer();