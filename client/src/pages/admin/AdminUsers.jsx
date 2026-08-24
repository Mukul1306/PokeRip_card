import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserRound,
  Mail,
  ShieldCheck,
  ShieldOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  MoreHorizontal,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
  });

  // =====================================================
  // GET USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const params = new URLSearchParams({
        page,
        limit: 20,
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(
        `${API_URL}/api/admin/users?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch users"
        );
      }

      setUsers(data.data?.users || []);

      setPagination(
        data.data?.pagination || {
          page: 1,
          limit: 20,
          totalUsers: 0,
          totalPages: 0,
        }
      );

      setStats(
        data.data?.stats || {
          totalUsers:
            data.data?.pagination?.totalUsers || 0,
          activeUsers: 0,
          suspendedUsers: 0,
        }
      );
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // SUSPEND / ACTIVATE
  // =====================================================

  const handleStatusChange = async (user) => {
    const nextStatus =
      user.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    try {
      setActionLoading(user._id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update user"
        );
      }

      // Update table immediately
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      // Refresh stats
      fetchUsers();
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(user._id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete user"
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );

      fetchUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 font-['Plus_Jakarta_Sans',sans-serif] text-[#101114]">
      {/* Import Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* HEADER */}
      <div>
        <p className="text-[10px] font-black tracking-[0.25em] text-[#238bdc]">
          USER MANAGEMENT
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#101114] sm:text-4xl">
              Users
            </h1>

            <p className="mt-2 text-sm font-medium text-[#505258]">
              Manage registered RipIt users.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-black/10 bg-white/40 px-4 py-2.5 shadow-sm sm:self-auto">
            <Users
              size={16}
              className="text-[#238bdc]"
            />

            <span className="text-xs font-bold text-[#101114]">
              {pagination.totalUsers} users
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
        />

        <StatCard
          icon={ShieldCheck}
          title="Active Users"
          value={stats.activeUsers}
        />

        <StatCard
          icon={ShieldOff}
          title="Suspended Users"
          value={stats.suspendedUsers}
        />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#505258]"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name or email..."
          className="h-12 w-full rounded-xl border border-black/10 bg-white/40 pl-11 pr-4 text-sm font-medium text-[#101114] outline-none transition placeholder:text-[#505258]/60 focus:border-[#238bdc] focus:bg-white/70"
        />
      </div>

      {/* USERS TABLE & MOBILE CARDS */}
      <section className="overflow-hidden rounded-2xl border border-black/10 bg-[#e5e6e8] shadow-sm">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-black text-[#101114]">
              All Users
            </h2>

            <p className="mt-1 text-[10px] font-medium text-[#505258]">
              Registered customer accounts
            </p>
          </div>

          <MoreHorizontal
            size={18}
            className="text-[#505258]"
          />
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2
              size={28}
              className="animate-spin text-[#238bdc]"
            />
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5">
              <Users
                size={23}
                className="text-[#505258]"
              />
            </div>

            <h3 className="mt-4 text-sm font-black text-[#101114]">
              No users found
            </h3>

            <p className="mt-1 text-xs font-medium text-[#505258]">
              Try changing your search query.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-black/10 text-left">
                    <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#505258]">
                      USER
                    </th>

                    <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#505258]">
                      EMAIL
                    </th>

                    <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#505258]">
                      STATUS
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-black tracking-wider text-[#505258]">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="border-b border-black/5 transition hover:bg-white/30"
                    >
                      {/* USER */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
                            <UserRound size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#101114]">
                              {user.name || "Unknown User"}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-[#505258]">
                              ID: {user._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail
                            size={14}
                            className="text-[#505258]"
                          />

                          <span className="text-xs font-medium text-[#101114]">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === user._id}
                            onClick={() => handleStatusChange(user)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              user.status === "ACTIVE"
                                ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                            }`}
                          >
                            {actionLoading === user._id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : user.status === "ACTIVE" ? (
                              <ShieldOff size={13} />
                            ) : (
                              <ShieldCheck size={13} />
                            )}

                            {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === user._id}
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center justify-center rounded-lg bg-red-500/10 p-2 text-[#d9232e] transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="divide-y divide-black/5 md:hidden">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
                        <UserRound size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#101114]">
                          {user.name || "Unknown User"}
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium text-[#505258]">
                          ID: {user._id.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={user.status} />
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-[#505258]">
                    <Mail size={14} className="shrink-0 text-[#505258]" />
                    <span className="truncate font-medium text-[#101114]">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                    <button
                      type="button"
                      disabled={actionLoading === user._id}
                      onClick={() => handleStatusChange(user)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        user.status === "ACTIVE"
                          ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                      }`}
                    >
                      {actionLoading === user._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : user.status === "ACTIVE" ? (
                        <ShieldOff size={14} />
                      ) : (
                        <ShieldCheck size={14} />
                      )}

                      {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === user._id}
                      onClick={() => handleDelete(user)}
                      className="inline-flex items-center justify-center rounded-lg bg-red-500/10 px-3 py-2 text-[#d9232e] transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-black/10 px-5 py-4 sm:px-6">
            <p className="text-[10px] font-medium text-[#505258]">
              Page{" "}
              <span className="font-bold text-[#101114]">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#101114]">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => Math.max(current - 1, 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white/40 text-[#505258] transition hover:bg-white/80 hover:text-[#101114] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, pagination.totalPages)
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white/40 text-[#505258] transition hover:bg-white/80 hover:text-[#101114] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/50 p-5 shadow-sm transition hover:border-[#238bdc]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-5 text-[10px] font-bold text-[#505258]">{title}</p>

      <p className="mt-1 text-2xl font-black text-[#101114]">{value}</p>
    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black ${
        isActive
          ? "bg-emerald-500/10 text-emerald-700"
          : "bg-amber-500/10 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      {isActive ? "ACTIVE" : "SUSPENDED"}
    </span>
  );
}