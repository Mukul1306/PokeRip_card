import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CreditCard,
  Package,
  PackageCheck,
  ShoppingBag,
  Users,
  WalletCards,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setDashboard(result.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(error.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
        `}</style>
        <div className="flex items-center gap-3 text-[#505258]">
          <Loader2 size={20} className="animate-spin text-[#238bdc]" />
          <span className="text-sm font-bold">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
        `}</style>
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-[#d9232e]">
            <AlertCircle size={22} />
          </div>

          <h2 className="mt-4 text-lg font-black text-[#101114]">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm font-medium text-[#505258]">{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-5 rounded-xl bg-[#238bdc] px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#177bc9]"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dedfe1] px-5 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-[#101114] sm:px-8 lg:px-12">
      {/* Import image font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      <div className="space-y-8">
        {/* PAGE HEADING */}
        <div>
          <p className="text-[10px] font-black tracking-[.25em] text-[#238bdc]">
            DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101114] sm:text-4xl">
            Overview
          </h1>

          <p className="mt-2 text-sm font-medium text-[#505258]">
            Here's what's happening across PokeRip.
          </p>
        </div>

        {/* REAL USER STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={dashboard?.totalUsers ?? 0}
            icon={Users}
            description="Registered customers"
          />

          <StatCard
            title="Active Users"
            value={dashboard?.activeUsers ?? 0}
            icon={Users}
            description="Currently active"
          />

          <StatCard
            title="Suspended Users"
            value={dashboard?.suspendedUsers ?? 0}
            icon={Users}
            description="Currently suspended"
          />

          <StatCard
            title="Total Orders"
            value="—"
            icon={ShoppingBag}
            description="Orders module coming soon"
            disabled
          />
        </div>

        {/* PLATFORM STATUS */}
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          {/* Sales */}
          <section className="rounded-2xl border border-black/10 bg-[#e5e6e8] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#101114]">
                  Sales Overview
                </h2>

                <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                  Sales data will appear after the Orders and Payments modules
                  are completed.
                </p>
              </div>
            </div>

            <div className="flex h-56 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
                  <CreditCard size={21} />
                </div>

                <p className="mt-4 text-sm font-bold text-[#101114]">
                  Sales analytics coming soon
                </p>

                <p className="mt-1 max-w-sm text-[10px] font-medium leading-5 text-[#62646a]">
                  This section will use real order and payment data once those
                  backend modules are available.
                </p>
              </div>
            </div>
          </section>

          {/* PLATFORM STATUS */}
          <section className="rounded-2xl border border-black/10 bg-[#e5e6e8] p-6 shadow-sm">
            <h2 className="text-sm font-black text-[#101114]">
              Platform Status
            </h2>

            <p className="mt-1 text-[10px] font-medium text-[#62646a]">
              Current backend modules
            </p>

            <div className="mt-6 space-y-3">
              <StatusItem
                icon={Users}
                label="Users"
                value={dashboard?.totalUsers ?? 0}
                active
              />

              <StatusItem icon={Package} label="Packs" value="—" />

              <StatusItem
                icon={PackageCheck}
                label="Pack Openings"
                value="—"
              />

              <StatusItem icon={WalletCards} label="Redemptions" value="—" />

              <StatusItem icon={ShoppingBag} label="Shipments" value="—" />
            </div>
          </section>
        </div>

        {/* RECENT ORDERS */}
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-[#e5e6e8] shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <div>
              <h2 className="text-sm font-black text-[#101114]">
                Recent Orders
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                Order management will be connected later.
              </p>
            </div>

            <button
              disabled
              className="flex cursor-not-allowed items-center gap-1 text-[10px] font-bold text-[#62646a] opacity-50"
            >
              VIEW ALL
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex min-h-40 items-center justify-center py-8">
            <div className="text-center">
              <ShoppingBag size={24} className="mx-auto text-[#62646a]" />

              <p className="mt-3 text-sm font-bold text-[#101114]">
                No order data available yet
              </p>

              <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                Orders will appear here after the Orders backend is
                implemented.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  disabled = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        disabled
          ? "border-black/5 bg-white/20 opacity-50"
          : "border-black/10 bg-white/50 hover:border-[#238bdc]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-6 text-[10px] font-bold text-[#62646a]">{title}</p>

      <p className="mt-1 text-2xl font-black text-[#101114]">{value}</p>

      <p className="mt-1 text-[9px] font-medium text-[#62646a]">{description}</p>
    </div>
  );
}

/* ==========================================
   PLATFORM STATUS
========================================== */

function StatusItem({ icon: Icon, label, value, active = false }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/40 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            active
              ? "bg-green-500/20 text-green-700"
              : "bg-black/5 text-[#62646a]"
          }`}
        >
          <Icon size={16} />
        </div>

        <span className="text-xs font-bold text-[#101114]">{label}</span>
      </div>

      <span
        className={`text-sm font-black ${
          active ? "text-[#101114]" : "text-[#62646a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}