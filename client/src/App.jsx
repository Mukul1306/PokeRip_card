import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import RipPack from "./pages/RipPack";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import AdminCards from "./pages/admin/AdminCards";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPacks from "./pages/admin/AdminPacks";
import AdminPackOdds from "./pages/admin/AdminPackOdds";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminKyc from "./pages/admin/AdminKyc";

import Kyc from "./pages/Kyc";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC WEBSITE
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            RIP
        ========================= */}

        <Route
          path="/rip/:packId"
          element={<RipPack />}
        />

        {/* =========================
            USER
        ========================= */}

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

        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* /admin */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* /admin/users */}
          <Route
            path="users"
            element={<AdminUsers />}
          />

          {/* /admin/kyc */}
          <Route
            path="kyc"
            element={<AdminKyc />}
          />

          {/* /admin/cards */}
          <Route
            path="cards"
            element={<AdminCards />}
          />

          {/* /admin/packs */}
          <Route
            path="packs"
            element={<AdminPacks />}
          />

          {/* /admin/odds */}
          <Route
            path="odds"
            element={<AdminPackOdds />}
          />

          {/* /admin/inventory */}
          <Route
            path="inventory"
            element={<AdminInventory />}
          />

          {/* /admin/orders */}
          <Route
            path="orders"
            element={<AdminOrders />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;