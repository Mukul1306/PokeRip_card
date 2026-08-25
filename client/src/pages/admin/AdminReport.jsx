import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingBag,
  Package,
  CreditCard,
  Boxes,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  ShieldCheck,
  FileText,
  TrendingUp,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  // =====================================================
  // FETCH REPORT
  // =====================================================

  const fetchReport = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/report`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to load admin report"
        );
      }

      if (!result.success) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to load admin report"
        );
      }

      setReport(result.data || null);
    } catch (err) {
      console.error(
        "Admin report error:",
        err
      );

      setError(
        err.message ||
          "Unable to load admin report"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchReport();
  }, []);

  // =====================================================
  // FORMATTERS
  // =====================================================

  const formatCurrency = (value) => {
    const number = Number(value) || 0;

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(number);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getUserName = (user) => {
    if (!user) return "Unknown User";

    return (
      user.name ||
      user.email ||
      "Unknown User"
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-orange-100 text-orange-700";

      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "SUSPENDED":
        return "bg-red-100 text-red-700";

      case "PUBLISHED":
        return "bg-blue-100 text-blue-700";

      case "DRAFT":
        return "bg-gray-100 text-gray-700";

      case "PAUSED":
        return "bg-orange-100 text-orange-700";

      case "ARCHIVED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
        return (
          <ArrowDownToLine
            size={18}
            className="text-green-600"
          />
        );

      case "WITHDRAWAL":
        return (
          <ArrowUpFromLine
            size={18}
            className="text-red-600"
          />
        );

      case "PURCHASE":
        return (
          <ShoppingBag
            size={18}
            className="text-blue-600"
          />
        );

      default:
        return (
          <Activity size={18} />
        );
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "bg-green-100";

      case "WITHDRAWAL":
        return "bg-red-100";

      case "PURCHASE":
        return "bg-blue-100";

      default:
        return "bg-gray-100";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={32}
            className="animate-spin"
          />

          <p className="text-sm text-gray-500">
            Loading admin report...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle
                size={28}
                className="text-red-600"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Unable to load report
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() =>
                fetchReport()
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        No report data found.
      </div>
    );
  }

  // =====================================================
  // SAFE DATA
  // =====================================================

  const users = report.users || {};

  const wallet = report.wallet || {};

  const packs = report.packs || {};

  const cards = report.cards || {};

  const inventory =
    report.inventory || {};

  const recentUsers =
    users.recent || [];

  const recentTransactions =
    wallet.recentTransactions || [];

  const recentPacks =
    packs.recent || [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <FileText size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Report
                </h1>

                <p className="text-sm text-gray-500">
                  Complete overview of your PokeRip platform
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              fetchReport(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Report"}
          </button>

        </div>


        {/* =================================================
            ADMIN INFO
        ================================================= */}

        {report.admin && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    {report.admin.name ||
                      "Administrator"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {report.admin.email || "-"}
                  </p>
                </div>

              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Role
                </p>

                <p className="font-semibold text-gray-900">
                  {report.admin.role ||
                    "ADMIN"}
                </p>
              </div>

            </div>

          </div>
        )}


        {/* =================================================
            USER SUMMARY
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center gap-2">
            <Users size={20} />
            <h2 className="text-lg font-bold">
              Users
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Total Users"
              value={formatNumber(
                users.total
              )}
              icon={<Users size={22} />}
            />

            <SummaryCard
              title="Active Users"
              value={formatNumber(
                users.active
              )}
              icon={
                <UserCheck size={22} />
              }
            />

            <SummaryCard
              title="Suspended Users"
              value={formatNumber(
                users.suspended
              )}
              icon={
                <UserX size={22} />
              }
            />

            <SummaryCard
              title="Recent Users"
              value={formatNumber(
                recentUsers.length
              )}
              icon={
                <Activity size={22} />
              }
            />

          </div>

        </section>


        {/* =================================================
            WALLET SUMMARY
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center gap-2">
            <Wallet size={20} />
            <h2 className="text-lg font-bold">
              Wallet
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Total Wallet Balance"
              value={formatCurrency(
                wallet.balance
                  ?.totalBalance
              )}
              icon={
                <Wallet size={22} />
              }
            />

            <SummaryCard
              title="Total Transactions"
              value={formatNumber(
                wallet.totalTransactions
              )}
              icon={
                <Activity size={22} />
              }
            />

            <SummaryCard
              title="Pending"
              value={formatNumber(
                wallet.pending
              )}
              icon={
                <Clock size={22} />
              }
            />

            <SummaryCard
              title="Approved"
              value={formatNumber(
                wallet.approved
              )}
              icon={
                <CheckCircle2
                  size={22}
                />
              }
            />

          </div>


          {/* WALLET TYPE CARDS */}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

            <WalletTypeCard
              title="Deposits"
              count={
                wallet.deposits
                  ?.count
              }
              amount={
                wallet.deposits
                  ?.amount
              }
              icon={
                <ArrowDownToLine
                  size={22}
                />
              }
              type="deposit"
            />

            <WalletTypeCard
              title="Withdrawals"
              count={
                wallet.withdrawals
                  ?.count
              }
              amount={
                wallet.withdrawals
                  ?.amount
              }
              icon={
                <ArrowUpFromLine
                  size={22}
                />
              }
              type="withdrawal"
            />

            <WalletTypeCard
              title="Purchases"
              count={
                wallet.purchases
                  ?.count
              }
              amount={
                wallet.purchases
                  ?.amount
              }
              icon={
                <ShoppingBag
                  size={22}
                />
              }
              type="purchase"
            />

          </div>

        </section>


        {/* =================================================
            PACKS
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center gap-2">
            <Package size={20} />
            <h2 className="text-lg font-bold">
              Packs
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <SummaryCard
              title="Total Packs"
              value={formatNumber(
                packs.total
              )}
              icon={
                <Package size={22} />
              }
            />

            <SummaryCard
              title="Published"
              value={formatNumber(
                packs.published
              )}
              icon={
                <CheckCircle2
                  size={22}
                />
              }
            />

            <SummaryCard
              title="Draft"
              value={formatNumber(
                packs.draft
              )}
              icon={
                <FileText size={22} />
              }
            />

            <SummaryCard
              title="Paused"
              value={formatNumber(
                packs.paused
              )}
              icon={
                <Clock size={22} />
              }
            />

            <SummaryCard
              title="Archived"
              value={formatNumber(
                packs.archived
              )}
              icon={
                <Boxes size={22} />
              }
            />

          </div>


          {/* PACK STOCK */}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

            <InfoCard
              title="Total Pack Stock"
              value={formatNumber(
                packs.stock
                  ?.totalStock
              )}
              icon={
                <Boxes size={22} />
              }
            />

            <InfoCard
              title="Total Pack Value"
              value={formatCurrency(
                packs.stock
                  ?.totalPackValue
              )}
              icon={
                <TrendingUp
                  size={22}
                />
              }
            />

          </div>

        </section>


        {/* =================================================
            CARDS + INVENTORY
        ================================================= */}

        <section>

          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            <h2 className="text-lg font-bold">
              Cards & Inventory
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

            <SummaryCard
              title="Total Cards"
              value={formatNumber(
                cards.total
              )}
              icon={
                <CreditCard
                  size={22}
                />
              }
            />

            <SummaryCard
              title="Active Cards"
              value={formatNumber(
                cards.active
              )}
              icon={
                <CheckCircle2
                  size={22}
                />
              }
            />

            <SummaryCard
              title="Archived Cards"
              value={formatNumber(
                cards.archived
              )}
              icon={
                <Boxes size={22} />
              }
            />

            <SummaryCard
              title="Available"
              value={formatNumber(
                inventory.available
              )}
              icon={
                <Package size={22} />
              }
            />

            <SummaryCard
              title="Reserved"
              value={formatNumber(
                inventory.reserved
              )}
              icon={
                <Clock size={22} />
              }
            />

            <SummaryCard
              title="Consumed"
              value={formatNumber(
                inventory.consumed
              )}
              icon={
                <ShoppingBag
                  size={22}
                />
              }
            />

          </div>

        </section>


        {/* =================================================
            RECENT TRANSACTIONS
        ================================================= */}

        <section className="rounded-2xl border bg-white shadow-sm">

          <div className="flex items-center justify-between border-b px-5 py-4">

            <div>
              <h2 className="font-bold">
                Recent Wallet Transactions
              </h2>

              <p className="text-xs text-gray-500">
                Latest deposits, withdrawals and purchases
              </p>
            </div>

            <Activity size={20} />

          </div>


          {recentTransactions.length ===
          0 ? (
            <EmptyState text="No transactions found." />
          ) : (
            <div className="divide-y">

              {recentTransactions.map(
                (transaction) => {

                  const user =
                    transaction.user;

                  return (
                    <div
                      key={
                        transaction._id
                      }
                      className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {getTransactionIcon(
                            transaction.type
                          )}
                        </div>

                        <div>

                          <div className="flex items-center gap-2">

                            <p className="font-semibold">
                              {transaction.type}
                            </p>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(
                                transaction.status
                              )}`}
                            >
                              {
                                transaction.status
                              }
                            </span>

                          </div>

                          <p className="text-sm text-gray-500">
                            {getUserName(
                              user
                            )}
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </p>

                        </div>

                      </div>


                      <div className="text-left md:text-right">

                        <p
                          className={`text-base font-bold ${
                            transaction.type ===
                            "DEPOSIT"
                              ? "text-green-600"
                              : transaction.type ===
                                "WITHDRAWAL"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {transaction.type ===
                          "DEPOSIT"
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </p>

                        {transaction.note && (
                          <p className="max-w-xs text-xs text-gray-400">
                            {
                              transaction.note
                            }
                          </p>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* =================================================
            RECENT USERS
        ================================================= */}

        <section className="rounded-2xl border bg-white shadow-sm">

          <div className="flex items-center justify-between border-b px-5 py-4">

            <div>
              <h2 className="font-bold">
                Recent Users
              </h2>

              <p className="text-xs text-gray-500">
                Latest registered users
              </p>
            </div>

            <Users size={20} />

          </div>


          {recentUsers.length ===
          0 ? (
            <EmptyState text="No users found." />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">

                  <tr>

                    <th className="px-5 py-3">
                      User
                    </th>

                    <th className="px-5 py-3">
                      Email
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Joined
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {recentUsers.map(
                    (user) => (

                      <tr
                        key={user._id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-bold">
                              {(
                                user.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="font-semibold">
                              {user.name ||
                                "Unknown"}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {user.email ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              user.status
                            )}`}
                          >
                            {
                              user.status
                            }
                          </span>

                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* =================================================
            RECENT PACKS
        ================================================= */}

        <section className="rounded-2xl border bg-white shadow-sm">

          <div className="flex items-center justify-between border-b px-5 py-4">

            <div>
              <h2 className="font-bold">
                Recent Packs
              </h2>

              <p className="text-xs text-gray-500">
                Recently created or updated packs
              </p>
            </div>

            <Package size={20} />

          </div>


          {recentPacks.length ===
          0 ? (
            <EmptyState text="No packs found." />
          ) : (
            <div className="divide-y">

              {recentPacks.map(
                (pack) => (

                  <div
                    key={pack._id}
                    className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >

                    <div>

                      <p className="font-semibold text-gray-900">
                        {pack.name ||
                          "Unnamed Pack"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {pack.category?.name ||
                          "No category"}
                      </p>

                    </div>


                    <div className="flex items-center gap-4">

                      {pack.price !==
                        undefined && (
                        <p className="font-bold">
                          {formatCurrency(
                            pack.price
                          )}
                        </p>
                      )}

                      {pack.status && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            pack.status
                          )}`}
                        >
                          {
                            pack.status
                          }
                        </span>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </section>


        {/* =================================================
            REPORT FOOTER
        ================================================= */}

        <div className="pb-6 text-center text-xs text-gray-400">
          PokeRip Admin Report
        </div>

      </div>
    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

      </div>

    </div>
  );
}


// =====================================================
// WALLET TYPE CARD
// =====================================================

function WalletTypeCard({
  title,
  count,
  amount,
  icon,
  type,
}) {
  const styles = {
    deposit: {
      wrapper:
        "border-green-200 bg-green-50",
      icon:
        "bg-green-100 text-green-700",
      amount:
        "text-green-700",
    },

    withdrawal: {
      wrapper:
        "border-red-200 bg-red-50",
      icon:
        "bg-red-100 text-red-700",
      amount:
        "text-red-700",
    },

    purchase: {
      wrapper:
        "border-blue-200 bg-blue-50",
      icon:
        "bg-blue-100 text-blue-700",
      amount:
        "text-blue-700",
    },
  };

  const style =
    styles[type] ||
    styles.purchase;

  return (
    <div
      className={`rounded-2xl border p-5 ${style.wrapper}`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.icon}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-gray-700">
            {title}
          </p>

          <p className="text-xs text-gray-500">
            {Number(count) || 0} transactions
          </p>

        </div>

      </div>

      <p
        className={`mt-4 text-xl font-bold ${style.amount}`}
      >
        {new Intl.NumberFormat(
          "en-IN",
          {
            style: "currency",
            currency: "INR",
          }
        ).format(
          Number(amount) || 0
        )}
      </p>

    </div>
  );
}


// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

      </div>

    </div>
  );
}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  text,
}) {
  return (
    <div className="px-5 py-12 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}