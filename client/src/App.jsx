import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// ================================
// PUBLIC / USER PAGES
// ================================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RipPack from "./pages/RipPack";
import Kyc from "./pages/Kyc";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Wallet from "./pages/Wallet";
import BuyPack from "./pages/BuyPack";
import Collection from "./pages/Collection";
import PackReveal from "./pages/PackReveal";

// ================================
// PUBLIC PACK PAGES
// ================================
import Packs from "./pages/Packs";
import PackDetails from "./pages/PackDetails";

// ================================
// ADMIN
// ================================
import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCards from "./pages/admin/AdminCards";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPacks from "./pages/admin/AdminPacks";
import AdminPackOdds from "./pages/admin/AdminPackOdds";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminKyc from "./pages/admin/AdminKyc";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminReport from "./pages/admin/AdminReport";

// ================================
// ADMIN OPENINGS
// ================================
import Openings from "./pages/admin/Openings";

// ================================
// ADMIN SELLING
// ================================
import AdminSelling from "./pages/admin/AdminSelling";

// ================================
// ADMIN SHIPPING
// ================================
import AdminShipping from "./pages/admin/AdminShipping";


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC WEBSITE
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* =====================================================
            PUBLIC PACKS
        ===================================================== */}

        <Route
          path="/packs"
          element={<Packs />}
        />

        <Route
          path="/packs/:packId"
          element={<PackDetails />}
        />


        {/* =====================================================
            RIP
        ===================================================== */}

        <Route
          path="/rip/:packId"
          element={<RipPack />}
        />


        {/* =====================================================
            USER
        ===================================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/kyc"
          element={<Kyc />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/buy/:packId"
          element={<BuyPack />}
        />

        <Route
          path="/wallet"
          element={<Wallet />}
        />

        <Route
          path="/collection"
          element={<Collection />}
        />

        <Route
          path="/reveal/:userPackId"
          element={<PackReveal />}
        />


        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* =================================================
              ADMIN DASHBOARD
          ================================================= */}

          <Route
            index
            element={<AdminDashboard />}
          />


          {/* =================================================
              USERS
          ================================================= */}

          <Route
            path="users"
            element={<AdminUsers />}
          />


          {/* =================================================
              KYC
          ================================================= */}

          <Route
            path="kyc"
            element={<AdminKyc />}
          />


          {/* =================================================
              CARDS
          ================================================= */}

          <Route
            path="cards"
            element={<AdminCards />}
          />


          {/* =================================================
              PACKS
          ================================================= */}

          <Route
            path="packs"
            element={<AdminPacks />}
          />


          {/* =================================================
              PACK ODDS
          ================================================= */}

          <Route
            path="odds"
            element={<AdminPackOdds />}
          />


          {/* =================================================
              INVENTORY
          ================================================= */}

          <Route
            path="inventory"
            element={<AdminInventory />}
          />


          {/* =================================================
              ORDERS
          ================================================= */}

          <Route
            path="orders"
            element={<AdminOrders />}
          />


          {/* =================================================
              WALLET
          ================================================= */}

          <Route
            path="wallet"
            element={<AdminWallet />}
          />


          {/* =================================================
              OPENINGS
          ================================================= */}

          <Route
            path="openings"
            element={<Openings />}
          />


          {/* =================================================
              SELLING
          ================================================= */}

          <Route
            path="selling"
            element={<AdminSelling />}
          />


          {/* =================================================
              SHIPPING
          ================================================= */}

          <Route
            path="shipping"
            element={<AdminShipping />}
          />


          {/* =================================================
              REPORTS
          ================================================= */}

          <Route
            path="reports"
            element={<AdminReport />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default App;