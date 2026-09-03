import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
  Package,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  Wallet,
  Percent,
} from "lucide-react";

// =====================================================
// API
// =====================================================

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// =====================================================
// HELPERS
// =====================================================

const getImage = (card) => {
  if (!card) return "";

  const candidates = [
    card.imageLarge,
    card.imageSmall,
    card.image,
    card.images?.large,
    card.images?.small,
  ];

  const image = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  if (!image) return "";

  const cleanImage = image.trim();

  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://") ||
    cleanImage.startsWith("data:")
  ) {
    return cleanImage;
  }

  if (cleanImage.startsWith("//")) {
    return `https:${cleanImage}`;
  }

  if (cleanImage.startsWith("/")) {
    return `${API_BASE}${cleanImage}`;
  }

  return `${API_BASE}/${cleanImage}`;
};

// =====================================================
// STABLE CARD IMAGE
// =====================================================

function CardImage({
  card,
  className,
  alt = "Card",
}) {
  const primaryImage = getImage(card);

  const fallbackCard = card
    ? {
        ...card,
        imageLarge: "",
        imageSmall:
          card.imageSmall ||
          card.image ||
          "",
      }
    : null;

  const fallbackImage = getImage(
    fallbackCard
  );

  const [src, setSrc] =
    useState(primaryImage);

  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    setSrc(primaryImage);
    setFailed(false);
  }, [primaryImage]);

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#f0f1f2]`}
      >
        <CreditCard
          size={24}
          className="text-[#9b9ea4]"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable="false"
      onError={() => {
        if (
          fallbackImage &&
          src !== fallbackImage
        ) {
          setSrc(fallbackImage);
          return;
        }

        setFailed(true);
      }}
    />
  );
}

// =====================================================
// DATE
// =====================================================

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// =====================================================
// MONEY
// =====================================================

const formatMoney = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `$${number.toFixed(2)}`;
};

// =====================================================
// GET USER
// =====================================================

const getUserName = (user) => {
  if (!user) {
    return "Unknown User";
  }

  return (
    user.name ||
    user.username ||
    user.email ||
    "Unknown User"
  );
};

// =====================================================
// PACK NAME
// =====================================================

const getPackName = (sale) => {
  return (
    sale?.userPack?.pack?.name ||
    sale?.pack?.name ||
    sale?.packName ||
    "Unknown Pack"
  );
};

// =====================================================
// PACK CARD COUNT
// =====================================================

const getPackCardCount = (sale) => {
  return (
    sale?.userPack?.cardsTotal ||
    sale?.userPack?.pack?.cardsPerPack ||
    sale?.cardsTotal ||
    "—"
  );
};

// =====================================================
// CARD PRICE
//
// Supports the current Card model:
// card.price
//
// Also supports values controller may send later.
// =====================================================

const getCardPrice = (sale) => {
  const values = [
    sale?.cardPrice,
    sale?.marketPrice,
    sale?.cardValue,
    sale?.salePrice,
    sale?.price,
    sale?.card?.price,
  ];

  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== ""
  );

  return Number.isFinite(Number(value))
    ? Number(value)
    : null;
};

// =====================================================
// PACK PRICE
//
// Supports several possible backend structures.
// =====================================================

const getPackPrice = (sale) => {
  const values = [
    sale?.packPrice,
    sale?.purchasePrice,
    sale?.userPack?.purchasePrice,
    sale?.userPack?.price,
    sale?.userPack?.packPrice,
    sale?.userPack?.pack?.price,
    sale?.pack?.price,
  ];

  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== ""
  );

  return Number.isFinite(Number(value))
    ? Number(value)
    : null;
};

// =====================================================
// USER GETS
//
// If backend sends userGets, use it.
// Otherwise calculate 80% from card price.
// =====================================================

const getUserGets = (sale) => {
  const explicitValues = [
    sale?.userGets,
    sale?.userPayout,
    sale?.payout,
  ];

  const explicit = explicitValues.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== ""
  );

  if (
    explicit !== undefined &&
    Number.isFinite(Number(explicit))
  ) {
    return Number(explicit);
  }

  const cardPrice = getCardPrice(sale);

  if (cardPrice === null) {
    return null;
  }

  return cardPrice * 0.8;
};

// =====================================================
// COMMISSION
//
// If backend sends commission, use it.
// Otherwise calculate 20% from card price.
// =====================================================

const getCommission = (sale) => {
  const explicitValues = [
    sale?.commission,
    sale?.platformCommission,
  ];

  const explicit = explicitValues.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== ""
  );

  if (
    explicit !== undefined &&
    Number.isFinite(Number(explicit))
  ) {
    return Number(explicit);
  }

  const cardPrice = getCardPrice(sale);

  if (cardPrice === null) {
    return null;
  }

  return cardPrice * 0.2;
};

// =====================================================
// COMPONENT
// =====================================================

function AdminSelling() {
  // ===================================================
  // DATA
  // ===================================================

  const [sales, setSales] = useState([]);

  // ===================================================
  // STATS
  // ===================================================

  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    total: 0,
  });

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] =
    useState("");

  // ===================================================
  // SEARCH
  // ===================================================

  const [search, setSearch] =
    useState("");

  // ===================================================
  // DATE PRESET
  // ===================================================

  const [preset, setPreset] =
    useState("today");

  // ===================================================
  // CUSTOM DATE
  // ===================================================

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  // ===================================================
  // APPLIED FILTERS
  // ===================================================

  const [appliedFilters, setAppliedFilters] =
    useState({
      search: "",
      preset: "today",
      from: "",
      to: "",
    });

  // ===================================================
  // PAGINATION
  // ===================================================

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(20);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

  // ===================================================
  // SELECTED SALE
  // ===================================================

  const [selectedSale, setSelectedSale] =
    useState(null);

  // ===================================================
  // AUTH
  // ===================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (!token) {
      return {};
    }

    return {
      Authorization:
        `Bearer ${token}`,
    };
  };

  // ===================================================
  // FETCH SALES
  // ===================================================

  const fetchSales = useCallback(
    async ({
      filters = appliedFilters,
      currentPage = page,
      showLoader = true,
    } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const params = {
          page: currentPage,
          limit,
          search:
            filters.search || "",
          preset:
            filters.preset || "today",
        };

        if (
          filters.preset === "custom"
        ) {
          if (filters.from) {
            params.from =
              filters.from;
          }

          if (filters.to) {
            params.to =
              filters.to;
          }
        }

        const response =
          await axios.get(
            `${API_BASE}/api/admin/sales`,
            {
              params,
              headers:
                getHeaders(),
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to load selling data"
          );
        }

        const data =
          response.data?.data || {};

        setSales(
          Array.isArray(
            data.sales
          )
            ? data.sales
            : []
        );

        setStats({
          today:
            Number(
              data.stats?.today ||
                0
            ),

          month:
            Number(
              data.stats?.month ||
                0
            ),

          total:
            Number(
              data.stats?.total ||
                0
            ),
        });

        setPagination({
          page:
            Number(
              data.pagination?.page ||
                currentPage
            ),

          limit:
            Number(
              data.pagination?.limit ||
                limit
            ),

          total:
            Number(
              data.pagination?.total ||
                0
            ),

          totalPages:
            Number(
              data.pagination?.totalPages ||
                0
            ),
        });
      } catch (err) {
        console.error(
          "Fetch selling error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load selling data"
        );

        setSales([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      appliedFilters,
      page,
      limit,
    ]
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchSales({
      filters:
        appliedFilters,
      currentPage:
        page,
      showLoader: true,
    });
  }, [fetchSales]);

  // ===================================================
  // APPLY
  // ===================================================

  const handleApply = () => {
    if (
      preset === "custom" &&
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      setError(
        "From date cannot be after To date."
      );

      return;
    }

    const nextFilters = {
      search:
        search.trim(),

      preset,

      from:
        preset === "custom"
          ? fromDate
          : "",

      to:
        preset === "custom"
          ? toDate
          : "",
    };

    setAppliedFilters(
      nextFilters
    );

    setPage(1);

    fetchSales({
      filters:
        nextFilters,

      currentPage: 1,

      showLoader: true,
    });
  };

  // ===================================================
  // CLEAR
  // ===================================================

  const handleClear = () => {
    setSearch("");
    setPreset("today");
    setFromDate("");
    setToDate("");

    const nextFilters = {
      search: "",
      preset: "today",
      from: "",
      to: "",
    };

    setAppliedFilters(
      nextFilters
    );

    setPage(1);

    fetchSales({
      filters:
        nextFilters,

      currentPage: 1,

      showLoader: true,
    });
  };

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchSales({
        filters:
          appliedFilters,

        currentPage:
          page,

        showLoader: false,
      });
    };

  // ===================================================
  // PAGE CHANGE
  // ===================================================

  const changePage = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages
    ) {
      return;
    }

    setPage(nextPage);

    fetchSales({
      filters:
        appliedFilters,

      currentPage:
        nextPage,

      showLoader: true,
    });
  };

  // ===================================================
  // PRESET
  // ===================================================

  const handlePresetChange = (
    value
  ) => {
    setPreset(value);

    if (
      value !== "custom"
    ) {
      setFromDate("");
      setToDate("");
    }
  };

  // ===================================================
  // RANGE LABEL
  // ===================================================

  const rangeLabel =
    useMemo(() => {
      if (
        appliedFilters.preset ===
        "today"
      ) {
        return "Today";
      }

      if (
        appliedFilters.preset ===
        "month"
      ) {
        return "This Month";
      }

      if (
        appliedFilters.preset ===
        "all"
      ) {
        return "All Time";
      }

      if (
        appliedFilters.preset ===
        "custom"
      ) {
        return "Custom Range";
      }

      return "Today";
    }, [appliedFilters]);

  // ===================================================
  // PAGE NUMBERS
  // ===================================================

  const pageNumbers =
    useMemo(() => {
      const totalPages =
        pagination.totalPages;

      const currentPage =
        pagination.page;

      if (!totalPages) {
        return [];
      }

      const pages = [];

      let start =
        Math.max(
          1,
          currentPage - 2
        );

      let end =
        Math.min(
          totalPages,
          currentPage + 2
        );

      if (
        end - start < 4
      ) {
        if (start === 1) {
          end =
            Math.min(
              totalPages,
              5
            );
        }

        if (
          end === totalPages
        ) {
          start =
            Math.max(
              1,
              totalPages - 4
            );
        }
      }

      for (
        let i = start;
        i <= end;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }, [pagination]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <div className="mx-auto max-w-[1500px] px-6 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#147fe8]">
              MANAGEMENT
            </p>

            <h1 className="text-4xl font-black tracking-tight text-[#101114]">
              Selling
            </h1>

            <p className="mt-2 text-sm text-[#72757b]">
              View and manage cards sold by users.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#dfe2e6] bg-white px-5 py-3 text-sm font-semibold text-[#202329] shadow-sm transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* TODAY */}

          <div className="rounded-2xl border border-[#e2e4e7] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e9f4ff] text-[#147fe8]">
                <CreditCard
                  size={25}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#70747b]">
                  Cards Sold Today
                </p>

                <p className="mt-1 text-3xl font-black text-[#101114]">
                  {stats.today}
                </p>

                <p className="mt-1 text-xs text-[#8a8d92]">
                  Cards sold today
                </p>
              </div>

            </div>
          </div>

          {/* MONTH */}

          <div className="rounded-2xl border border-[#e2e4e7] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#ecfaef] text-[#20a547]">
                <Calendar
                  size={25}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#70747b]">
                  Cards Sold This Month
                </p>

                <p className="mt-1 text-3xl font-black text-[#101114]">
                  {stats.month}
                </p>

                <p className="mt-1 text-xs text-[#8a8d92]">
                  Cards sold this month
                </p>
              </div>

            </div>
          </div>

          {/* ALL */}

          <div className="rounded-2xl border border-[#e2e4e7] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f1eaff] text-[#7b2eea]">
                <CheckCircle2
                  size={25}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#70747b]">
                  Total Cards Sold
                </p>

                <p className="mt-1 text-3xl font-black text-[#101114]">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs text-[#8a8d92]">
                  All time cards sold
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-5 rounded-2xl border border-[#e2e4e7] bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">

              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92969c]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleApply();
                  }
                }}
                placeholder="Search by card, user, pack or card number..."
                className="h-12 w-full rounded-xl border border-[#e1e3e6] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#9b9ea4] focus:border-[#147fe8]"
              />

            </div>

            {/* PRESET */}

            <select
              value={preset}
              onChange={(event) =>
                handlePresetChange(
                  event.target.value
                )
              }
              className="h-12 min-w-[155px] rounded-xl border border-[#e1e3e6] bg-white px-4 text-sm font-semibold text-[#25282d] outline-none focus:border-[#147fe8]"
            >
              <option value="today">
                Today
              </option>

              <option value="month">
                This Month
              </option>

              <option value="all">
                All Time
              </option>

              <option value="custom">
                Custom Range
              </option>
            </select>

            {/* FROM */}

            {preset ===
              "custom" && (
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d9197]"
                />

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                  className="h-12 rounded-xl border border-[#e1e3e6] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#147fe8]"
                />
              </div>
            )}

            {/* TO */}

            {preset ===
              "custom" && (
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d9197]"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                  className="h-12 rounded-xl border border-[#e1e3e6] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#147fe8]"
                />
              </div>
            )}

            {/* APPLY */}

            <button
              type="button"
              onClick={handleApply}
              className="h-12 rounded-xl bg-[#147fe8] px-6 text-sm font-bold text-white transition hover:bg-[#086fce]"
            >
              Apply
            </button>

            {/* CLEAR */}

            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl border border-[#dfe2e6] bg-white px-6 text-sm font-semibold text-[#30343a] transition hover:bg-[#f7f7f7]"
            >
              Clear
            </button>

          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-[#777b82]">
              Showing:

              <span className="ml-1 font-semibold text-[#30343a]">
                {rangeLabel}
              </span>

              {appliedFilters.search && (
                <span>
                  {" "}
                  · Search:{" "}
                  <span className="font-semibold text-[#30343a]">
                    {appliedFilters.search}
                  </span>
                </span>
              )}
            </p>
          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-[#e1e3e6] bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px]">

              <thead>
                <tr className="border-b border-[#e6e7e9] bg-[#fafbfc]">

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Card
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Pack
                  </th>

                  {/* NEW */}

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Sold
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Commission
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    User Gets
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#70747b]">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-16 text-center"
                    >
                      <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-[#147fe8]"
                      />

                      <p className="mt-3 text-sm text-[#777b82]">
                        Loading sold cards...
                      </p>
                    </td>
                  </tr>
                ) : sales.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f1f2]">
                        <Package
                          size={25}
                          className="text-[#92969c]"
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-[#33363b]">
                        No sold cards found
                      </p>

                      <p className="mt-1 text-xs text-[#85898f]">
                        Try changing the date range or search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sales.map(
                    (sale) => {
                      const card =
                        sale.card;

                      const user =
                        sale.user;

                      const cardPrice =
                        getCardPrice(
                          sale
                        );

                      const commission =
                        getCommission(
                          sale
                        );

                      const userGets =
                        getUserGets(
                          sale
                        );

                      const packPrice =
                        getPackPrice(
                          sale
                        );

                      return (
                        <tr
                          key={
                            sale._id
                          }
                          className="border-b border-[#eeeeef] transition hover:bg-[#fafcff]"
                        >

                          {/* CARD */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <CardImage
                                card={card}
                                alt={
                                  card?.name ||
                                  "Card"
                                }
                                className="h-16 w-12 shrink-0 rounded-lg border border-[#dedfe2] object-cover shadow-sm"
                              />

                              <div className="min-w-0">

                                <p className="max-w-[270px] truncate text-sm font-bold text-[#181a1e]">
                                  {card?.name ||
                                    "Unknown Card"}

                                  {card?.number
                                    ? ` – ${card.number}`
                                    : ""}
                                </p>

                                <p className="mt-1 text-xs text-[#7d8188]">
                                  {card
                                    ?.set
                                    ?.name ||
                                    "Unknown Set"}
                                </p>

                                {card?.rarity && (
                                  <span className="mt-1 inline-block rounded-full bg-[#f1e8ff] px-2 py-0.5 text-[10px] font-semibold text-[#7524cf]">
                                    {
                                      card.rarity
                                    }
                                  </span>
                                )}

                                {/* CARD PRICE */}

                                <p className="mt-1 text-xs font-bold text-[#202329]">
                                  Card Price:{" "}
                                  {formatMoney(
                                    cardPrice
                                  )}
                                </p>

                              </div>
                            </div>

                          </td>

                          {/* USER */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-[#25282d]">
                              {getUserName(
                                user
                              )}
                            </p>

                            <p className="mt-1 text-xs text-[#888c92]">
                              {user?.email ||
                                "—"}
                            </p>

                          </td>

                          {/* PACK */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-[#25282d]">
                              {getPackName(
                                sale
                              )}
                            </p>

                            <span className="mt-1 inline-block rounded-full bg-[#eaf4ff] px-2 py-1 text-[10px] font-semibold text-[#147fe8]">
                              {getPackCardCount(
                                sale
                              )}{" "}
                              Cards
                            </span>

                            <p className="mt-1 text-xs font-semibold text-[#555a61]">
                              Pack:{" "}
                              {formatMoney(
                                packPrice
                              )}
                            </p>

                          </td>

                          {/* SOLD */}

                          <td className="px-5 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f8eb] px-3 py-1.5 text-[11px] font-bold text-[#16823a]">
                              <CheckCircle2
                                size={13}
                              />

                              SOLD
                            </span>

                          </td>

                          {/* COMMISSION */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-[#c75b16]">
                              {formatMoney(
                                commission
                              )}
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-[#85898f]">
                              20%
                            </p>

                          </td>

                          {/* USER GETS */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-[#16823a]">
                              {formatMoney(
                                userGets
                              )}
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-[#85898f]">
                              80%
                            </p>

                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-[#30343a]">
                              {formatDate(
                                sale.soldAt
                              )}
                            </p>

                            <p className="mt-1 text-xs text-[#85898f]">
                              {sale.soldAt
                                ? new Date(
                                    sale.soldAt
                                  ).toLocaleTimeString(
                                    "en-GB",
                                    {
                                      hour: "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )
                                : "—"}
                            </p>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSale(
                                  sale
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#dfe2e6] bg-white px-4 py-2 text-xs font-bold text-[#34373c] transition hover:border-[#147fe8] hover:text-[#147fe8]"
                            >
                              <Eye
                                size={14}
                              />

                              Details
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            pagination.total >
              0 && (
              <div className="flex items-center justify-between border-t border-[#e7e8ea] px-5 py-4">

                <p className="text-xs text-[#777b82]">
                  Showing{" "}

                  <span className="font-semibold text-[#34373c]">
                    {Math.min(
                      (pagination.page -
                        1) *
                        pagination.limit +
                        1,
                      pagination.total
                    )}
                  </span>

                  {" "}to{" "}

                  <span className="font-semibold text-[#34373c]">
                    {Math.min(
                      pagination.page *
                        pagination.limit,
                      pagination.total
                    )}
                  </span>

                  {" "}of{" "}

                  <span className="font-semibold text-[#34373c]">
                    {pagination.total}
                  </span>

                  {" "}sold cards
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      pagination.page <=
                      1
                    }
                    onClick={() =>
                      changePage(
                        pagination.page -
                          1
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe2e6] bg-white text-[#44474d] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  {pageNumbers.map(
                    (pageNumber) => (
                      <button
                        key={
                          pageNumber
                        }
                        type="button"
                        onClick={() =>
                          changePage(
                            pageNumber
                          )
                        }
                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-bold transition ${
                          pageNumber ===
                          pagination.page
                            ? "border-[#147fe8] bg-[#147fe8] text-white"
                            : "border-[#dfe2e6] bg-white text-[#44474d] hover:border-[#147fe8] hover:text-[#147fe8]"
                        }`}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      changePage(
                        pagination.page +
                          1
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe2e6] bg-white text-[#44474d] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>

                </div>

              </div>
            )}

        </div>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedSale(
                null
              );
            }
          }}
        >

          <div className="flex max-h-[92vh] w-full max-w-[950px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-[#e5e6e8] px-6 py-5">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#147fe8]">
                  SOLD CARD DETAILS
                </p>

                <h2 className="mt-1 text-xl font-black text-[#111317]">
                  {selectedSale.card
                    ?.name ||
                    "Unknown Card"}

                  {selectedSale.card
                    ?.number
                    ? ` – ${selectedSale.card.number}`
                    : ""}
                </h2>

                <p className="mt-1 text-xs text-[#83878d]">
                  Sold{" "}
                  {formatDateTime(
                    selectedSale.soldAt
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSale(
                    null
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f2f3] text-[#41444a] transition hover:bg-[#e7e8ea]"
              >
                <X
                  size={19}
                />
              </button>

            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="overflow-y-auto p-6">

              {/* =================================================
                  CARD + SALE
              ================================================= */}

              <div className="grid gap-5 lg:grid-cols-2">

                {/* CARD INFORMATION */}

                <section className="rounded-2xl border border-[#e1e3e6] bg-white">

                  <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                    <CreditCard
                      size={17}
                      className="text-[#147fe8]"
                    />

                    <h3 className="text-sm font-bold text-[#25282d]">
                      Card Information
                    </h3>

                  </div>

                  <div className="p-5">

                    <div className="flex gap-5">

                      <CardImage
                        card={
                          selectedSale.card
                        }
                        alt={
                          selectedSale
                            .card
                            ?.name ||
                          "Card"
                        }
                        className="h-64 w-44 shrink-0 rounded-xl border border-[#dedfe2] object-cover shadow-md"
                      />

                      <div className="min-w-0 flex-1">

                        <p className="text-lg font-black text-[#15171b]">
                          {
                            selectedSale
                              .card
                              ?.name ||
                            "Unknown Card"
                          }
                        </p>

                        <p className="mt-1 text-sm text-[#777b82]">
                          {
                            selectedSale
                              .card
                              ?.set
                              ?.name ||
                            "Unknown Set"
                          }
                        </p>

                        {selectedSale
                          .card
                          ?.rarity && (
                          <span className="mt-2 inline-block rounded-full bg-[#f1e8ff] px-2.5 py-1 text-[10px] font-bold text-[#7524cf]">
                            {
                              selectedSale
                                .card
                                .rarity
                            }
                          </span>
                        )}

                        <div className="mt-5 space-y-3">

                          <InfoRow
                            label="Card Number"
                            value={
                              selectedSale
                                .card
                                ?.number ||
                              "—"
                            }
                          />

                          <InfoRow
                            label="TCG ID"
                            value={
                              selectedSale
                                .card
                                ?.tcgId ||
                              "—"
                            }
                          />

                          <InfoRow
                            label="Artist"
                            value={
                              selectedSale
                                .card
                                ?.artist ||
                              "—"
                            }
                          />

                          {/* CARD PRICE */}

                          <div className="rounded-xl border border-[#dcecff] bg-[#f5faff] p-4">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#147fe8]">
                              Card Price
                            </p>

                            <p className="mt-1 text-2xl font-black text-[#111317]">
                              {formatMoney(
                                getCardPrice(
                                  selectedSale
                                )
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </section>

                {/* SALE INFORMATION */}

                <section className="rounded-2xl border border-[#e1e3e6] bg-white">

                  <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                    <Clock
                      size={17}
                      className="text-[#147fe8]"
                    />

                    <h3 className="text-sm font-bold text-[#25282d]">
                      Sale Information
                    </h3>

                  </div>

                  <div className="space-y-5 p-5">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-[#85898f]">
                        Status
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f8eb] px-3 py-1.5 text-[11px] font-bold text-[#16823a]">

                        <CheckCircle2
                          size={13}
                        />

                        SOLD

                      </span>

                    </div>

                    <InfoRow
                      label="Sold Date"
                      value={formatDateTime(
                        selectedSale.soldAt
                      )}
                    />

                    <InfoRow
                      label="User Pack Card ID"
                      value={
                        selectedSale._id ||
                        "—"
                      }
                    />

                    <InfoRow
                      label="User Pack ID"
                      value={
                        selectedSale
                          .userPack
                          ?._id ||
                        "—"
                      }
                    />

                  </div>

                </section>

              </div>

              {/* =================================================
                  FINANCIAL BREAKDOWN
              ================================================= */}

              <section className="mt-5 rounded-2xl border border-[#e1e3e6] bg-white">

                <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                  <Wallet
                    size={17}
                    className="text-[#147fe8]"
                  />

                  <h3 className="text-sm font-bold text-[#25282d]">
                    Financial Breakdown
                  </h3>

                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">

                  {/* CARD PRICE */}

                  <div className="rounded-xl border border-[#e1e3e6] bg-[#fafbfc] p-5">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#96999f]">
                      Card Price
                    </p>

                    <p className="mt-2 text-2xl font-black text-[#111317]">
                      {formatMoney(
                        getCardPrice(
                          selectedSale
                        )
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#85898f]">
                      Market/card selling value
                    </p>

                  </div>

                  {/* USER GETS */}

                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                        User Gets
                      </p>

                      <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                        80%
                      </span>

                    </div>

                    <p className="mt-2 text-2xl font-black text-green-700">
                      {formatMoney(
                        getUserGets(
                          selectedSale
                        )
                      )}
                    </p>

                    <p className="mt-1 text-xs text-green-700">
                      80% credited to user
                    </p>

                  </div>

                  {/* COMMISSION */}

                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                        Platform Commission
                      </p>

                      <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                        20%
                      </span>

                    </div>

                    <p className="mt-2 text-2xl font-black text-orange-700">
                      {formatMoney(
                        getCommission(
                          selectedSale
                        )
                      )}
                    </p>

                    <p className="mt-1 text-xs text-orange-700">
                      20% platform commission
                    </p>

                  </div>

                </div>

              </section>

              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              <section className="mt-5 rounded-2xl border border-[#e1e3e6] bg-white">

                <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                  <User
                    size={17}
                    className="text-[#147fe8]"
                  />

                  <h3 className="text-sm font-bold text-[#25282d]">
                    User Information
                  </h3>

                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">

                  <InfoBox
                    label="Name"
                    value={getUserName(
                      selectedSale.user
                    )}
                  />

                  <InfoBox
                    label="Email"
                    value={
                      selectedSale
                        .user
                        ?.email ||
                      "—"
                    }
                  />

                  <InfoBox
                    label="User ID"
                    value={
                      selectedSale
                        .user
                        ?._id ||
                      "—"
                    }
                  />

                </div>

              </section>

              {/* =================================================
                  PACK INFORMATION
              ================================================= */}

              <section className="mt-5 rounded-2xl border border-[#e1e3e6] bg-white">

                <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                  <Package
                    size={17}
                    className="text-[#147fe8]"
                  />

                  <h3 className="text-sm font-bold text-[#25282d]">
                    Pack Information
                  </h3>

                </div>

                <div className="grid gap-4 p-5 md:grid-cols-4">

                  <InfoBox
                    label="Pack Name"
                    value={getPackName(
                      selectedSale
                    )}
                  />

                  {/* PACK PURCHASE PRICE */}

                  <InfoBox
                    label="Pack Purchase Price"
                    value={formatMoney(
                      getPackPrice(
                        selectedSale
                      )
                    )}
                  />

                  <InfoBox
                    label="Cards in Pack"
                    value={getPackCardCount(
                      selectedSale
                    )}
                  />

                  <InfoBox
                    label="Purchased"
                    value={formatDateTime(
                      selectedSale
                        .userPack
                        ?.purchasedAt
                    )}
                  />

                </div>

              </section>

              {/* =================================================
                  CARD TIMELINE
              ================================================= */}

              <section className="mt-5 rounded-2xl border border-[#e1e3e6] bg-white">

                <div className="flex items-center gap-2 border-b border-[#e8e9eb] px-5 py-4">

                  <Clock
                    size={17}
                    className="text-[#147fe8]"
                  />

                  <h3 className="text-sm font-bold text-[#25282d]">
                    Card Timeline
                  </h3>

                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">

                  <InfoBox
                    label="Revealed At"
                    value={formatDateTime(
                      selectedSale
                        .revealedAt
                    )}
                  />

                  <InfoBox
                    label="Sold At"
                    value={formatDateTime(
                      selectedSale
                        .soldAt
                    )}
                  />

                </div>

              </section>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#96999f]">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-[#30343a]">
        {value || "—"}
      </p>
    </div>
  );
}

// =====================================================
// INFO BOX
// =====================================================

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#e6e7e9] bg-[#fafbfc] p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-[#96999f]">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-[#30343a]">
        {value || "—"}
      </p>

    </div>
  );
}

// =====================================================
// EXPORT
// =====================================================

export default AdminSelling;