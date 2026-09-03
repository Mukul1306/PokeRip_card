import { useEffect, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";


// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_OPTIONS = [
  "ALL",
  "REVEALED",
  "SOLD",
  "SHIPPING",
  "SHIPPED",
];


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Openings() {
  // ===================================================
  // STATS
  // ===================================================

  const [stats, setStats] = useState({
    today: 0,
    thisMonth: 0,
    total: 0,
    pending: 0,
    expired: 0,
    sold: 0,
    shipping: 0,
    shipped: 0,
  });


  // ===================================================
  // HISTORY
  // ===================================================

  const [openings, setOpenings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState("ALL");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });


  // ===================================================
  // DETAILS MODAL
  // ===================================================

  const [selectedOpening, setSelectedOpening] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState("");


  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    fetchStats();
  }, []);


  useEffect(() => {
    fetchOpenings();
  }, [page, status, search]);


  // ===================================================
  // FETCH STATS
  // ===================================================

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }


      const response = await fetch(
        `${API_URL}/api/admin/report/openings/stats`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load opening statistics"
        );
      }


      setStats(
        result.data || {}
      );

    } catch (error) {
      console.error(
        "Opening stats error:",
        error
      );

      setError(
        error.message ||
        "Unable to load opening statistics"
      );

    } finally {
      setStatsLoading(false);
    }
  };


  // ===================================================
  // FETCH OPENING HISTORY
  // ===================================================

  const fetchOpenings = async () => {
    try {
      setLoading(true);

      setError("");

      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }


      const params =
        new URLSearchParams();

      params.set(
        "page",
        page
      );

      params.set(
        "limit",
        20
      );


      if (
        status &&
        status !== "ALL"
      ) {
        params.set(
          "status",
          status
        );
      } else {
        params.set(
          "status",
          "ALL"
        );
      }


      if (
        search.trim()
      ) {
        params.set(
          "search",
          search.trim()
        );
      }


      const response =
        await fetch(
          `${API_URL}/api/admin/report/openings?${params.toString()}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load opening history"
        );
      }


      setOpenings(
        result.data?.openings ||
        []
      );


      setPagination(
        result.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );

    } catch (error) {
      console.error(
        "Opening history error:",
        error
      );

      setError(
        error.message ||
        "Unable to load opening history"
      );

    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // VIEW DETAILS
  // ===================================================

  const handleViewDetails = async (
    openingId
  ) => {
    try {
      setDetailsLoading(true);

      setDetailsError("");

      setSelectedOpening(null);


      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }


      const response =
        await fetch(
          `${API_URL}/api/admin/report/openings/${openingId}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load opening details"
        );
      }


      setSelectedOpening(
        result.data
      );

    } catch (error) {
      console.error(
        "Opening details error:",
        error
      );

      setDetailsError(
        error.message ||
        "Unable to load opening details"
      );

    } finally {
      setDetailsLoading(false);
    }
  };


  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = () => {
    fetchStats();

    fetchOpenings();
  };


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };


  // ===================================================
  // STATUS
  // ===================================================

  const handleStatusChange = (
    event
  ) => {
    setStatus(
      event.target.value
    );

    setPage(1);
  };


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "—";
    }
  };


  // ===================================================
  // FORMAT MONEY
  // ===================================================

  const formatMoney = (
    value
  ) => {
    const amount =
      Number(value || 0);

    return `$${amount.toFixed(2)}`;
  };


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    setSelectedOpening(null);

    setDetailsError("");
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (
    loading &&
    openings.length === 0
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif]">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
        `}</style>

        <div className="flex items-center gap-3 text-[#505258]">

          <RefreshCw
            size={20}
            className="animate-spin text-[#238bdc]"
          />

          <span className="text-sm font-bold">
            Loading openings...
          </span>

        </div>
      </div>
    );
  }


  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-screen bg-[#dedfe1] px-5 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-[#101114] sm:px-8 lg:px-12">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');

        .opening-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .opening-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .opening-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,.15);
          border-radius: 20px;
        }
      `}</style>


      <div className="space-y-8">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-[10px] font-black tracking-[.25em] text-[#238bdc]">
              CARD MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101114] sm:text-4xl">
              Openings
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium text-[#505258]">
              Track every card revealed from packs,
              including users, cards, packs, sell
              activity and shipping information.
            </p>

          </div>


          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#238bdc] px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-[#177bc9]"
          >

            <RefreshCw
              size={15}
              className={
                loading ||
                statsLoading
                  ? "animate-spin"
                  : ""
              }
            />

            REFRESH

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-[#d9232e]"
            />

            <div>

              <p className="text-xs font-black text-[#d9232e]">
                Unable to load openings
              </p>

              <p className="mt-1 text-xs font-medium text-[#505258]">
                {error}
              </p>

            </div>

          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


          <OpeningStatCard
            title="Cards Opened Today"
            value={
              statsLoading
                ? "..."
                : stats.today
            }
            description="Cards revealed today"
            icon={CalendarDays}
          />


          <OpeningStatCard
            title="Cards This Month"
            value={
              statsLoading
                ? "..."
                : stats.thisMonth
            }
            description="Cards revealed this month"
            icon={PackageCheck}
          />


          <OpeningStatCard
            title="Total Cards Revealed"
            value={
              statsLoading
                ? "..."
                : stats.total
            }
            description="All card reveals"
            icon={Package}
          />


          <OpeningStatCard
            title="Pending Decision"
            value={
              statsLoading
                ? "..."
                : stats.pending
            }
            description="Waiting for SELL / SHIP"
            icon={Clock3}
          />

        </div>


        {/* =================================================
            SECONDARY STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-3">


          <MiniStat
            label="Sold"
            value={
              statsLoading
                ? "..."
                : stats.sold
            }
            icon={ShoppingBag}
          />


          <MiniStat
            label="Shipping"
            value={
              statsLoading
                ? "..."
                : stats.shipping
            }
            icon={Truck}
          />


          <MiniStat
            label="Shipped"
            value={
              statsLoading
                ? "..."
                : stats.shipped
            }
            icon={PackageCheck}
          />

        </div>


        {/* =================================================
            HISTORY
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-black/10 bg-[#e5e6e8] shadow-sm">


          {/* HEADER */}

          <div className="border-b border-black/10 px-6 py-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


              <div>

                <h2 className="text-sm font-black text-[#101114]">
                  Card Reveal History
                </h2>

                <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                  Every card opened from the platform.
                </p>

              </div>


              <div className="flex flex-col gap-3 sm:flex-row">


                {/* SEARCH */}

                <div className="relative">

                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62646a]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={
                      handleSearchChange
                    }
                    placeholder="Search user or card..."
                    className="h-10 w-full rounded-xl border border-black/10 bg-white/60 pl-9 pr-3 text-xs font-semibold text-[#101114] outline-none transition placeholder:text-[#8a8c91] focus:border-[#238bdc] sm:w-64"
                  />

                </div>


                {/* STATUS */}

                <select
                  value={status}
                  onChange={
                    handleStatusChange
                  }
                  className="h-10 rounded-xl border border-black/10 bg-white/60 px-3 text-xs font-bold text-[#101114] outline-none focus:border-[#238bdc]"
                >

                  {STATUS_OPTIONS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item === "ALL"
                          ? "All Status"
                          : item}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>


          {/* TABLE */}

          <div className="opening-scroll overflow-x-auto">

            <table className="w-full min-w-[1000px] border-collapse">

              <thead>

                <tr className="border-b border-black/10">

                  <th className="px-6 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    CARD
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    USER
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    PACK
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    VALUE
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    REVEALED
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-black tracking-wider text-[#62646a]">
                    STATUS
                  </th>

                  <th className="px-6 py-4 text-right text-[9px] font-black tracking-wider text-[#62646a]">
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {openings.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center"
                    >

                      <Package
                        size={30}
                        className="mx-auto text-[#62646a]"
                      />

                      <p className="mt-3 text-sm font-black text-[#101114]">
                        No openings found
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                        Try changing your search or status filter.
                      </p>

                    </td>

                  </tr>

                ) : (

                  openings.map(
                    (opening) => (

                      <OpeningRow
                        key={
                          opening._id
                        }
                        opening={
                          opening
                        }
                        onView={
                          handleViewDetails
                        }
                        formatDate={
                          formatDate
                        }
                        formatMoney={
                          formatMoney
                        }
                      />

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* PAGINATION */}

          <div className="flex flex-col gap-3 border-t border-black/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[10px] font-bold text-[#62646a]">

              {pagination.total > 0
                ? `Showing ${
                    (pagination.page - 1) *
                      pagination.limit +
                    1
                  }–${Math.min(
                    pagination.page *
                      pagination.limit,
                    pagination.total
                  )} of ${
                    pagination.total
                  } openings`
                : "No openings"}

            </p>


            <div className="flex items-center gap-2">

              <button
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        current - 1,
                        1
                      )
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white/50 text-[#505258] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronLeft
                  size={16}
                />

              </button>


              <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#238bdc] px-3 text-[10px] font-black text-white">

                {pagination.page}

              </div>


              <button
                disabled={
                  page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white/50 text-[#505258] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronRight
                  size={16}
                />

              </button>

            </div>

          </div>

        </section>

      </div>


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {(detailsLoading ||
        selectedOpening ||
        detailsError) && (

        <OpeningDetailsModal
          loading={
            detailsLoading
          }
          data={
            selectedOpening
          }
          error={
            detailsError
          }
          onClose={
            closeModal
          }
          formatDate={
            formatDate
          }
          formatMoney={
            formatMoney
          }
        />

      )}

    </div>
  );
}


// =====================================================
// OPENING STAT CARD
// =====================================================

function OpeningStatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/50 p-5 shadow-sm transition hover:border-[#238bdc]">

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">

          <Icon size={18} />

        </div>

      </div>


      <p className="mt-6 text-[10px] font-bold text-[#62646a]">
        {title}
      </p>


      <p className="mt-1 text-2xl font-black text-[#101114]">
        {value}
      </p>


      <p className="mt-1 text-[9px] font-medium text-[#62646a]">
        {description}
      </p>

    </div>
  );
}


// =====================================================
// MINI STAT
// =====================================================

function MiniStat({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/40 p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[#62646a]">

          <Icon size={17} />

        </div>

        <div>

          <p className="text-[9px] font-bold tracking-wide text-[#62646a]">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-[#101114]">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// OPENING TABLE ROW
// =====================================================

function OpeningRow({
  opening,
  onView,
  formatDate,
  formatMoney,
}) {
  const card =
    opening.card;

  const user =
    opening.user;

  const userPack =
    opening.userPack;

  const pack =
    userPack?.pack;


  return (
    <tr className="border-b border-black/5 transition hover:bg-white/30">


      {/* CARD */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">

            {card?.imageSmall ? (

              <img
                src={
                  card.imageSmall.startsWith(
                    "http"
                  )
                    ? card.imageSmall
                    : `${API_URL}${card.imageSmall}`
                }
                alt={
                  card?.name ||
                  "Card"
                }
                className="h-full w-full object-cover"
              />

            ) : (

              <div className="flex h-full items-center justify-center text-[#62646a]">

                <Package
                  size={16}
                />

              </div>

            )}

          </div>


          <div className="min-w-0">

            <p className="max-w-[220px] truncate text-xs font-black text-[#101114]">
              {card?.name ||
                "Unknown Card"}
            </p>

            <p className="mt-1 text-[9px] font-medium text-[#62646a]">
              {card?.number
                ? `#${card.number}`
                : "No card number"}
            </p>

            <p className="mt-1 max-w-[180px] truncate text-[9px] font-medium text-[#62646a]">
              {card?.rarity ||
                "Unknown rarity"}
            </p>

          </div>

        </div>

      </td>


      {/* USER */}

      <td className="px-4 py-4">

        <div>

          <p className="text-xs font-black text-[#101114]">
            {user?.name ||
              "Unknown User"}
          </p>

          <p className="mt-1 max-w-[190px] truncate text-[9px] font-medium text-[#62646a]">
            {user?.email ||
              "No email"}
          </p>

        </div>

      </td>


      {/* PACK */}

      <td className="px-4 py-4">

        <div>

          <p className="text-xs font-black text-[#101114]">
            {pack?.name ||
              "Unknown Pack"}
          </p>

          <p className="mt-1 text-[9px] font-medium text-[#62646a]">
            {pack?.category?.name ||
              "No category"}
          </p>

        </div>

      </td>


      {/* VALUE */}

      <td className="px-4 py-4">

        <p className="text-xs font-black text-[#101114]">
          {formatMoney(
            opening.marketPrice
          )}
        </p>

      </td>


      {/* REVEALED */}

      <td className="px-4 py-4">

        <p className="text-[10px] font-bold text-[#101114]">
          {formatDate(
            opening.revealedAt
          )}
        </p>

      </td>


      {/* STATUS */}

      <td className="px-4 py-4">

        <StatusBadge
          status={
            opening.status
          }
        />

      </td>


      {/* ACTION */}

      <td className="px-6 py-4 text-right">

        <button
          onClick={() =>
            onView(
              opening._id
            )
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#101114] px-3 py-2 text-[9px] font-black text-white transition hover:bg-[#238bdc]"
        >

          <Eye
            size={13}
          />

          DETAILS

        </button>

      </td>

    </tr>
  );
}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}) {
  let className =
    "bg-black/5 text-[#62646a]";

  if (
    status ===
    "SOLD"
  ) {
    className =
      "bg-green-500/10 text-green-700";
  }

  if (
    status ===
    "SHIPPING"
  ) {
    className =
      "bg-orange-500/10 text-orange-700";
  }

  if (
    status ===
    "SHIPPED"
  ) {
    className =
      "bg-blue-500/10 text-blue-700";
  }

  if (
    status ===
    "REVEALED"
  ) {
    className =
      "bg-purple-500/10 text-purple-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black tracking-wide ${className}`}
    >
      {status ||
        "UNKNOWN"}
    </span>
  );
}


// =====================================================
// DETAILS MODAL
// =====================================================

function OpeningDetailsModal({
  loading,
  data,
  error,
  onClose,
  formatDate,
  formatMoney,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">


      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-[#dedfe1] shadow-2xl">


        {/* MODAL HEADER */}

        <div className="flex items-center justify-between border-b border-black/10 bg-[#e5e6e8] px-6 py-5">

          <div>

            <p className="text-[9px] font-black tracking-[.2em] text-[#238bdc]">
              OPENING DETAILS
            </p>

            <h2 className="mt-1 text-lg font-black text-[#101114]">
              Card Reveal Information
            </h2>

          </div>


          <button
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-[#505258] transition hover:bg-black/10 hover:text-[#101114]"
          >

            <X
              size={18}
            />

          </button>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="flex min-h-[400px] items-center justify-center">

            <div className="flex items-center gap-3 text-[#505258]">

              <RefreshCw
                size={20}
                className="animate-spin text-[#238bdc]"
              />

              <span className="text-xs font-bold">
                Loading opening details...
              </span>

            </div>

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="flex min-h-[400px] items-center justify-center p-8">

              <div className="max-w-md text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-[#d9232e]">

                  <AlertCircle
                    size={22}
                  />

                </div>

                <p className="mt-4 text-sm font-black text-[#101114]">
                  Unable to load details
                </p>

                <p className="mt-2 text-xs font-medium text-[#62646a]">
                  {error}
                </p>

              </div>

            </div>

          )}


        {/* DETAILS */}

        {!loading &&
          !error &&
          data && (

            <div className="opening-scroll max-h-[calc(92vh-90px)] overflow-y-auto p-6">


              {/* =========================================
                  USER + CARD
              ========================================= */}

              <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">


                {/* USER */}

                <DetailSection
                  title="User Information"
                  icon={User}
                >

                  <DetailRow
                    label="Name"
                    value={
                      data.user?.name
                    }
                  />

                  <DetailRow
                    label="Login Email"
                    value={
                      data.user?.email
                    }
                  />

                  <DetailRow
                    label="Phone"
                    value={
                      data.user?.phone ||
                      data.user?.mobile
                    }
                  />

                  <DetailRow
                    label="User ID"
                    value={
                      data.user?._id
                    }
                  />

                  <DetailRow
                    label="Account Status"
                    value={
                      data.user?.status
                    }
                  />

                  <DetailRow
                    label="Account Created"
                    value={
                      formatDate(
                        data.user
                          ?.accountCreatedAt
                      )
                    }
                  />

                </DetailSection>


                {/* CARD */}

                <DetailSection
                  title="Card Information"
                  icon={Package}
                >

                  <div className="flex gap-5">


                    {/* IMAGE */}

                    <div className="h-44 w-32 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">

                      {data.card
                        ?.imageLarge ? (

                        <img
                          src={
                            data.card.imageLarge.startsWith(
                              "http"
                            )
                              ? data.card.imageLarge
                              : `${API_URL}${data.card.imageLarge}`
                          }
                          alt={
                            data.card?.name ||
                            "Card"
                          }
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-[#62646a]">

                          <Package
                            size={24}
                          />

                        </div>

                      )}

                    </div>


                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">

                      <p className="text-base font-black text-[#101114]">
                        {data.card?.name ||
                          "Unknown Card"}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#62646a]">
                        {data.card?.set?.name ||
                          data.card?.set?.series ||
                          "Pokemon Card"}
                      </p>


                      <div className="mt-4 space-y-2">

                        <DetailRow
                          label="Card Number"
                          value={
                            data.card?.number
                          }
                        />

                        <DetailRow
                          label="Rarity"
                          value={
                            data.card?.rarity
                          }
                        />

                        <DetailRow
                          label="Market Price"
                          value={
                            formatMoney(
                              data.card?.marketPrice
                            )
                          }
                        />

                        <DetailRow
                          label="Current Price"
                          value={
                            formatMoney(
                              data.card?.currentPrice
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                </DetailSection>

              </div>


              {/* =========================================
                  PACK
              ========================================= */}

              <div className="mt-5">

                <DetailSection
                  title="Pack Information"
                  icon={PackageCheck}
                >

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <DetailBox
                      label="Pack Name"
                      value={
                        data.userPack?.pack?.name
                      }
                    />

                    <DetailBox
                      label="Pack Price"
                      value={
                        data.userPack?.pack?.price !==
                        undefined
                          ? formatMoney(
                              data.userPack.pack.price
                            )
                          : "—"
                      }
                    />

                    <DetailBox
                      label="Category"
                      value={
                        data.userPack?.pack
                          ?.category?.name
                      }
                    />

                    <DetailBox
                      label="Pack Status"
                      value={
                        data.userPack?.pack
                          ?.status
                      }
                    />

                  </div>


                  <div className="mt-4 grid gap-4 md:grid-cols-4">

                    <DetailBox
                      label="Packs Purchased"
                      value={
                        data.userPack?.quantity
                      }
                    />

                    <DetailBox
                      label="Total Cards"
                      value={
                        data.userPack?.cardsTotal
                      }
                    />

                    <DetailBox
                      label="Cards Remaining"
                      value={
                        data.userPack?.cardsRemaining
                      }
                    />

                    <DetailBox
                      label="Cards Ripped"
                      value={
                        data.userPack?.cardsRipped
                      }
                    />

                  </div>

                </DetailSection>

              </div>


              {/* =========================================
                  OPENING
              ========================================= */}

              <div className="mt-5">

                <DetailSection
                  title="Opening Information"
                  icon={Clock3}
                >

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <DetailBox
                      label="Opening ID"
                      value={
                        data.opening?._id
                      }
                    />

                    <DetailBox
                      label="Status"
                      value={
                        <StatusBadge
                          status={
                            data.opening?.status
                          }
                        />
                      }
                    />

                    <DetailBox
                      label="Revealed At"
                      value={
                        formatDate(
                          data.opening
                            ?.revealedAt
                        )
                      }
                    />

                    <DetailBox
                      label="Decision Deadline"
                      value={
                        formatDate(
                          data.opening
                            ?.decisionDeadline
                        )
                      }
                    />

                  </div>

                </DetailSection>

              </div>


              {/* =========================================
                  FINANCIAL
              ========================================= */}

              <div className="mt-5">

                <DetailSection
                  title="Financial Information"
                  icon={ShoppingBag}
                >

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <DetailBox
                      label="Card Value"
                      value={
                        formatMoney(
                          data.financial
                            ?.cardValue
                        )
                      }
                    />

                    <DetailBox
                      label="User Received"
                      value={
                        data.financial
                          ?.userSellAmount !==
                        null &&
                        data.financial
                          ?.userSellAmount !==
                        undefined
                          ? formatMoney(
                              data.financial
                                .userSellAmount
                            )
                          : "—"
                      }
                    />

                    <DetailBox
                      label="Admin Fee"
                      value={
                        data.financial
                          ?.adminFee !==
                        null &&
                        data.financial
                          ?.adminFee !==
                        undefined
                          ? formatMoney(
                              data.financial
                                .adminFee
                            )
                          : "—"
                      }
                    />

                    <DetailBox
                      label="Shipping Fee"
                      value={
                        formatMoney(
                          data.financial
                            ?.shippingFee
                        )
                      }
                    />

                  </div>


                  <div className="mt-4 grid gap-4 md:grid-cols-2">

                    <DetailBox
                      label="User Percentage"
                      value={
                        data.financial
                          ?.userPercentage !==
                        null &&
                        data.financial
                          ?.userPercentage !==
                        undefined
                          ? `${data.financial.userPercentage}%`
                          : "—"
                      }
                    />

                    <DetailBox
                      label="Platform Percentage"
                      value={
                        data.financial
                          ?.adminPercentage !==
                        null &&
                        data.financial
                          ?.adminPercentage !==
                        undefined
                          ? `${data.financial.adminPercentage}%`
                          : "—"
                      }
                    />

                  </div>

                </DetailSection>

              </div>


              {/* =========================================
                  SHIPPING
              ========================================= */}

              {data.shippingAddress && (

                <div className="mt-5">

                  <DetailSection
                    title="Shipping Information"
                    icon={Truck}
                  >

                    <div className="grid gap-4 md:grid-cols-2">

                      <DetailBox
                        label="Shipping Status"
                        value={
                          <StatusBadge
                            status={
                              data.opening
                                ?.status
                            }
                          />
                        }
                      />

                      <DetailBox
                        label="Shipping Fee"
                        value={
                          formatMoney(
                            data.opening
                              ?.shippingFee
                          )
                        }
                      />

                    </div>


                    <div className="mt-5 rounded-xl border border-black/5 bg-white/40 p-5">

                      <p className="text-[9px] font-black tracking-[.15em] text-[#238bdc]">
                        DELIVERY ADDRESS
                      </p>


                      <div className="mt-4 grid gap-4 md:grid-cols-2">


                        <DetailRow
                          label="Full Name"
                          value={
                            data.shippingAddress
                              ?.fullName
                          }
                        />

                        <DetailRow
                          label="Email"
                          value={
                            data.shippingAddress
                              ?.email
                          }
                        />

                        <DetailRow
                          label="Phone"
                          value={
                            data.shippingAddress
                              ?.phone
                          }
                        />

                        <DetailRow
                          label="Country"
                          value={
                            data.shippingAddress
                              ?.country
                          }
                        />

                        <DetailRow
                          label="Address Line 1"
                          value={
                            data.shippingAddress
                              ?.addressLine1
                          }
                        />

                        <DetailRow
                          label="Address Line 2"
                          value={
                            data.shippingAddress
                              ?.addressLine2 ||
                            "—"
                          }
                        />

                        <DetailRow
                          label="City"
                          value={
                            data.shippingAddress
                              ?.city
                          }
                        />

                        <DetailRow
                          label="State"
                          value={
                            data.shippingAddress
                              ?.state
                          }
                        />

                        <DetailRow
                          label="Postal Code"
                          value={
                            data.shippingAddress
                              ?.postalCode
                          }
                        />

                      </div>

                    </div>

                  </DetailSection>

                </div>

              )}


              {/* =========================================
                  TRANSACTION INFORMATION
              ========================================= */}

              {data.transactions && (

                <div className="mt-5">

                  <DetailSection
                    title="Transaction Information"
                    icon={WalletIcon}
                  >

                    <div className="grid gap-4 md:grid-cols-3">

                      <TransactionBox
                        title="SELL"
                        transaction={
                          data.transactions
                            .sell
                        }
                        formatDate={
                          formatDate
                        }
                        formatMoney={
                          formatMoney
                        }
                      />


                      <TransactionBox
                        title="ADMIN FEE"
                        transaction={
                          data.transactions
                            .adminFee
                        }
                        formatDate={
                          formatDate
                        }
                        formatMoney={
                          formatMoney
                        }
                      />


                      <TransactionBox
                        title="SHIPPING"
                        transaction={
                          data.transactions
                            .shipping
                        }
                        formatDate={
                          formatDate
                        }
                        formatMoney={
                          formatMoney
                        }
                      />

                    </div>

                  </DetailSection>

                </div>

              )}

            </div>

          )}

      </div>

    </div>
  );
}


// =====================================================
// DETAIL SECTION
// =====================================================

function DetailSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-[#e5e6e8] p-5 shadow-sm">

      <div className="mb-5 flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#238bdc]/10 text-[#238bdc]">

          <Icon
            size={16}
          />

        </div>

        <h3 className="text-xs font-black text-[#101114]">
          {title}
        </h3>

      </div>


      {children}

    </section>
  );
}


// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex flex-col gap-1">

      <span className="text-[8px] font-bold uppercase tracking-wide text-[#62646a]">
        {label}
      </span>

      <span className="break-all text-[11px] font-black text-[#101114]">
        {value ||
          "—"}
      </span>

    </div>
  );
}


// =====================================================
// DETAIL BOX
// =====================================================

function DetailBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white/40 p-4">

      <p className="text-[8px] font-bold uppercase tracking-wide text-[#62646a]">
        {label}
      </p>

      <div className="mt-2 break-all text-[11px] font-black text-[#101114]">
        {value ||
          "—"}
      </div>

    </div>
  );
}


// =====================================================
// TRANSACTION BOX
// =====================================================

function TransactionBox({
  title,
  transaction,
  formatDate,
  formatMoney,
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white/40 p-4">

      <p className="text-[9px] font-black tracking-wide text-[#238bdc]">
        {title}
      </p>


      {!transaction ? (

        <p className="mt-4 text-[10px] font-bold text-[#62646a]">
          No transaction
        </p>

      ) : (

        <div className="mt-4 space-y-3">

          <DetailRow
            label="Amount"
            value={
              formatMoney(
                transaction.amount
              )
            }
          />

          <DetailRow
            label="Status"
            value={
              transaction.status
            }
          />

          <DetailRow
            label="Created"
            value={
              formatDate(
                transaction.createdAt
              )
            }
          />

          {transaction.note && (

            <DetailRow
              label="Note"
              value={
                transaction.note
              }
            />

          )}

        </div>

      )}

    </div>
  );
}


// =====================================================
// WALLET ICON
// =====================================================

function WalletIcon({
  size = 18,
}) {
  return (
    <ShoppingBag
      size={size}
    />
  );
}