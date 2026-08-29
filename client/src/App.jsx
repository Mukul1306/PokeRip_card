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

// Public pack pages
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

        {/* Home -> Start Ripping -> /packs */}

        <Route
          path="/packs"
          element={<Packs />}
        />


        {/* /packs -> View Pack -> /packs/:packId */}

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

          {/* ===============================================
              /admin
          =============================================== */}

          <Route
            index
            element={<AdminDashboard />}
          />


          {/* ===============================================
              /admin/users
          =============================================== */}

          <Route
            path="users"
            element={<AdminUsers />}
          />


          {/* ===============================================
              /admin/kyc
          =============================================== */}

          <Route
            path="kyc"
            element={<AdminKyc />}
          />


          {/* ===============================================
              /admin/cards
          =============================================== */}

          <Route
            path="cards"
            element={<AdminCards />}
          />


          {/* ===============================================
              /admin/packs
          =============================================== */}

          <Route
            path="packs"
            element={<AdminPacks />}
          />


          {/* ===============================================
              /admin/odds
          =============================================== */}

          <Route
            path="odds"
            element={<AdminPackOdds />}
          />


          {/* ===============================================
              /admin/inventory
          =============================================== */}

          <Route
            path="inventory"
            element={<AdminInventory />}
          />


          {/* ===============================================
              /admin/orders
          =============================================== */}

          <Route
            path="orders"
            element={<AdminOrders />}
          />


          {/* ===============================================
              /admin/wallet
          =============================================== */}

          <Route
            path="wallet"
            element={<AdminWallet />}
          />


          {/* ===============================================
              /admin/reports
          =============================================== */}

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