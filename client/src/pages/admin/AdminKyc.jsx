import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminKyc() {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    notStarted: 0,
    rejected: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH STATS
  // ==========================================

  const fetchStats = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token || token.split(".").length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const response = await fetch(
      `${API_URL}/api/admin/kyc/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch KYC stats"
      );
    }

    setStats(
      data.data || {
        total: 0,
        verified: 0,
        pending: 0,
        notStarted: 0,
        rejected: 0,
      }
    );
  };

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token || token.split(".").length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const response = await fetch(
      `${API_URL}/api/admin/kyc/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch KYC users"
      );
    }

    // IMPORTANT
    // Backend response:
    // { success: true, data: { users: [...] } }

    setUsers(data.data?.users || []);
  };

  // ==========================================
  // LOAD
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchStats(),
        fetchUsers(),
      ]);
    } catch (error) {
      console.error("KYC admin error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const status =
      user.kyc?.status || "NOT_STARTED";

    const matchesFilter =
      filter === "ALL" || status === filter;

    const text =
      `${user.name || ""} ${user.email || ""} ${
        user.mobile || ""
      } ${user.kyc?.inquiryId || ""}`.toLowerCase();

    const matchesSearch =
      text.includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // ==========================================
  // STATUS
  // ==========================================

  const getStatus = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          label: "Verified",
          className:
            "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "PENDING":
        return {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700",
          icon: <Clock3 size={15} />,
        };

      case "REJECTED":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-700",
          icon: <XCircle size={15} />,
        };

      case "REQUIRES_RETRY":
        return {
          label: "Retry Required",
          className:
            "bg-orange-100 text-orange-700",
          icon: <AlertCircle size={15} />,
        };

      default:
        return {
          label: "Not Started",
          className:
            "bg-gray-100 text-gray-600",
          icon: <ShieldCheck size={15} />,
        };
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw
          className="animate-spin text-[#2698F3]"
          size={28}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================
          TITLE
      ===================================== */}

      <div>
        <h1 className="text-2xl font-extrabold">
          KYC Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage user identity verification.
        </p>
      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<ShieldCheck size={20} />}
        />

        <StatCard
          title="Verified"
          value={stats.verified}
          icon={<CheckCircle2 size={20} />}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock3 size={20} />}
        />

        <StatCard
          title="Not Started"
          value={stats.notStarted}
          icon={<AlertCircle size={20} />}
        />

        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle size={20} />}
        />

      </div>

      {/* =====================================
          TABLE
      ===================================== */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        {/* SEARCH + FILTER */}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search name, email, mobile or inquiry ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#2698F3]"
            />

          </div>

          <div className="flex flex-wrap gap-2">

            {[
              ["ALL", "All"],
              ["VERIFIED", "Verified"],
              ["PENDING", "Pending"],
              ["NOT_STARTED", "Not Started"],
              ["REJECTED", "Rejected"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  filter === value
                    ? "bg-[#2698F3] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}

          </div>

        </div>

        {/* =====================================
            TABLE
        ===================================== */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-gray-100 text-left">

                <th className="px-4 py-3 text-xs font-bold text-gray-400">
                  USER
                </th>

                <th className="px-4 py-3 text-xs font-bold text-gray-400">
                  CONTACT
                </th>

                <th className="px-4 py-3 text-xs font-bold text-gray-400">
                  STATUS
                </th>

                <th className="px-4 py-3 text-xs font-bold text-gray-400">
                  PROVIDER
                </th>

                <th className="px-4 py-3 text-xs font-bold text-gray-400">
                  INQUIRY ID
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No KYC users found.
                  </td>
                </tr>

              ) : (

                filteredUsers.map((user) => {

                  const status =
                    user.kyc?.status ||
                    "NOT_STARTED";

                  const statusData =
                    getStatus(status);

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >

                      {/* USER */}

                      <td className="px-4 py-4">

                        <div className="font-bold text-sm">
                          {user.name || "Unnamed User"}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          ID: {user._id}
                        </div>

                      </td>

                      {/* CONTACT */}

                      <td className="px-4 py-4">

                        <div className="text-sm">
                          {user.email || "-"}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {user.mobile || "-"}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusData.className}`}
                        >
                          {statusData.icon}
                          {statusData.label}
                        </span>

                      </td>

                      {/* PROVIDER */}

                      <td className="px-4 py-4 text-sm font-medium">

                        {user.kyc?.provider || "-"}

                      </td>

                      {/* INQUIRY */}

                      <td className="px-4 py-4">

                        <span className="font-mono text-xs text-gray-500">
                          {user.kyc?.inquiryId || "-"}
                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* COUNT */}

        <div className="mt-4 text-xs text-gray-400">
          Showing {filteredUsers.length} of{" "}
          {users.length} users
        </div>

      </div>

    </div>
  );
}


// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f3ff] text-[#2698F3]">
          {icon}
        </div>

      </div>

    </div>
  );
}