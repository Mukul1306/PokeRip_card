import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Wallet,
  BadgeIndianRupee,
  ExternalLink,
  CalendarDays,
  IndianRupee,
  PieChart,
  RefreshCw,
  Calendar,
} from "lucide-react";


// =====================================================
// API
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// =====================================================
// HELPERS
// =====================================================

function money(value) {
  const amount = Number(value || 0);

  return `$${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// =====================================================
// IMAGE HELPER
// =====================================================

function getCardImage(card) {
  return (
    card?.imageLarge ||
    card?.imageSmall ||
    card?.images?.large ||
    card?.images?.small ||
    ""
  );
}

// Card image URLs stored by the backend are often relative paths like
// /api/admin/inventory/image/<pokewallet-id>. That endpoint is protected,
// so a normal <img src="..."> cannot send the Authorization header.
// We fetch protected images with the admin token and create a blob URL.
function normalizeImageUrl(image) {
  if (!image) return "";

  const value = String(image).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
}


function getPackImage(pack) {
  if (!pack) {
    return "";
  }

  return (
    pack.image ||
    pack.imageUrl ||
    pack.coverImage ||
    pack.thumbnail ||
    ""
  );
}


// =====================================================
// MAIN
// =====================================================

export default function AdminOrders() {

  // ===================================================
  // STATE
  // ===================================================

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [orderStatus, setOrderStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [packSearch, setPackSearch] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [cardName, setCardName] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [cardImageUrls, setCardImageUrls] =
    useState({});

  // ===================================================
  // PACK PURCHASE STATISTICS
  // ===================================================

  const [orderStats, setOrderStats] = useState({
    today: {
      packs: 0,
      value: 0,
      orders: 0,
    },
    month: {
      packs: 0,
      value: 0,
      orders: 0,
    },
    tillNow: {
      packs: 0,
      value: 0,
      orders: 0,
    },
  });


  // ===================================================
  // LOAD CARD IMAGES WITH AUTHENTICATION
  // ===================================================
  useEffect(() => {
    let cancelled = false;
    const createdObjectUrls = [];

    const loadImages = async () => {
      const cards = [];

      for (const order of orders || []) {
        const card = order?.openedCard?.card;
        const raw = getCardImage(card);
        if (raw) cards.push(raw);
      }

      const selectedCard = selectedOrder?.openedCard?.card;
      const selectedRaw = getCardImage(selectedCard);
      if (selectedRaw) cards.push(selectedRaw);

      const uniqueImages = [...new Set(cards)];
      if (!uniqueImages.length) return;

      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

      const loaded = {};

      await Promise.all(
        uniqueImages.map(async (raw) => {
          const url = normalizeImageUrl(raw);

          // Public/external image URL.
          if (
            url.startsWith("https://") &&
            !url.startsWith(`${API_URL}/`)
          ) {
            loaded[raw] = url;
            return;
          }

          try {
            const response = await fetch(url, {
              method: "GET",
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
            });

            if (!response.ok) {
              console.error(
                "Card image request failed:",
                response.status,
                url
              );
              loaded[raw] = "";
              return;
            }

            const blob = await response.blob();
            if (!blob.size) {
              loaded[raw] = "";
              return;
            }

            const objectUrl = URL.createObjectURL(blob);
            createdObjectUrls.push(objectUrl);
            loaded[raw] = objectUrl;
          } catch (error) {
            console.error(
              "Card image load error:",
              error,
              url
            );
            loaded[raw] = "";
          }
        })
      );

      if (!cancelled) {
        setCardImageUrls((previous) => ({
          ...previous,
          ...loaded,
        }));
      }
    };

    loadImages();

    return () => {
      cancelled = true;
      createdObjectUrls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [orders, selectedOrder]);

  // ===================================================
  // FETCH PACK PURCHASE STATISTICS
  // ===================================================

  const fetchOrderStats = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        "";

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/admin/orders/stats`,
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
          data.message ||
          "Unable to load order statistics."
        );
      }

      setOrderStats(
        data.data || {
          today: {
            packs: 0,
            value: 0,
            orders: 0,
          },
          month: {
            packs: 0,
            value: 0,
            orders: 0,
          },
          tillNow: {
            packs: 0,
            value: 0,
            orders: 0,
          },
        }
      );
    } catch (err) {
      console.error(
        "Order statistics error:",
        err
      );
    }
  };


  // ===================================================
  // FETCH ORDERS
  // ===================================================

  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      // ------------------------------------------------
      // ADMIN TOKEN FIRST
      // ------------------------------------------------

      const token =
        localStorage.getItem(
          "adminToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }

      // ------------------------------------------------
      // QUERY
      // ------------------------------------------------

      const params =
        new URLSearchParams({
          page: String(page),
          limit: "7",
        });

      if (search.trim()) {

        params.append(
          "search",
          search.trim()
        );

      }

      if (paymentStatus) {

        params.append(
          "paymentStatus",
          paymentStatus
        );

      }

      if (orderStatus) {

        params.append(
          "orderStatus",
          orderStatus
        );

      }

      // ------------------------------------------------
      // REQUEST
      // ------------------------------------------------

      const response =
        await fetch(
          `${API_URL}/api/admin/orders?${params.toString()}`,
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

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load orders."
        );

      }

      setOrders(
        data.data?.orders ||
        []
      );

      setTotalPages(
        data.data?.pagination
          ?.totalPages || 1
      );

      setTotalOrders(
        data.data?.pagination?.totalOrders ||
        data.data?.pagination?.total ||
        0
      );

    } catch (err) {

      console.error(
        "Orders error:",
        err
      );

      setError(
        err.message ||
        "Unable to load orders."
      );

      setOrders([]);

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // INITIAL / FILTER FETCH
  // ===================================================

  useEffect(() => {

    fetchOrders();
    fetchOrderStats();

  }, [
    page,
    paymentStatus,
    orderStatus,
  ]);


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch =
    (event) => {

      event.preventDefault();

      setPage(1);

      fetchOrders();

    };


  // ===================================================
  // OPEN ORDER
  // ===================================================

  const openOrder =
    async (order) => {

      // ------------------------------------------------
      // We already have complete order data from the
      // new backend.
      // ------------------------------------------------

      setSelectedOrder(order);

      // ------------------------------------------------
      // Try to fetch the latest detail from backend.
      // This ensures the modal has the newest card,
      // shipping and sale information.
      // ------------------------------------------------

      if (!order?._id) {
        return;
      }

      try {

        setDetailsLoading(true);

        const token =
          localStorage.getItem(
            "adminToken"
          ) ||
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/admin/orders/${order._id}`,
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

        const data =
          await response.json();

        if (response.ok) {

          const freshOrder =
            data.data?.order;

          if (freshOrder) {

            setSelectedOrder(
              freshOrder
            );

          }

        }

      } catch (err) {

        console.error(
          "Order detail error:",
          err
        );

      } finally {

        setDetailsLoading(false);

      }

    };


  // ===================================================
  // CLOSE ORDER
  // ===================================================

  const closeOrder = () => {

    setSelectedOrder(
      null
    );

  };


    // ===================================================
  // RETURN UI
  // ===================================================

  const visibleOrders = orders.filter((order) => {
    if (!filtersApplied) return true;
    const pack = order.pack || {};
    const card = order.openedCard?.card || {};
    const fulfillment = String(order.fulfillmentStatus || order.openedCard?.status || "NOT_OPENED").toUpperCase();
    const packText = `${pack.name || ""} ${pack.title || ""}`.toLowerCase();
    const cardText = `${card.name || ""} ${card.number || ""}`.toLowerCase();
    const orderPrice = Number(order.amount || 0);
    const matchesPack = !packSearch.trim() || packText.includes(packSearch.trim().toLowerCase());
    const matchesCard = !cardName || cardText.includes(cardName.toLowerCase());
    const matchesFulfillment = !fulfillmentFilter || fulfillment === fulfillmentFilter;
    let matchesPrice = true;
    if (priceRange === "UNDER_25") matchesPrice = orderPrice < 25;
    if (priceRange === "25_50") matchesPrice = orderPrice >= 25 && orderPrice <= 50;
    if (priceRange === "50_100") matchesPrice = orderPrice > 50 && orderPrice <= 100;
    if (priceRange === "OVER_100") matchesPrice = orderPrice > 100;
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const created = new Date(order.createdAt);
      if (!Number.isNaN(created.getTime())) {
        const day = created.toISOString().slice(0, 10);
        if (dateFrom && day < dateFrom) matchesDate = false;
        if (dateTo && day > dateTo) matchesDate = false;
      }
    }
    return matchesPack && matchesCard && matchesFulfillment && matchesPrice && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.24em] text-[#238bdc]">SALES MANAGEMENT</p>
          <h1 className="mt-2 text-[28px] font-black leading-none tracking-tight text-[#111827]">Orders</h1>
          <p className="mt-2 text-[12px] font-medium text-[#667085]">View pack purchases, opened cards and order details.</p>
        </div>
        <button type="button" onClick={() => { fetchOrders(); fetchOrderStats(); }} className="flex h-10 items-center gap-2 rounded-xl border border-[#e3e7ee] bg-white px-4 text-[11px] font-black text-[#344054] shadow-sm transition hover:bg-[#fafbfc]">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<ShoppingBag size={25} strokeWidth={2} />} iconClass="bg-[#eaf3ff] text-[#1976ff]" title="TOTAL PACKS PURCHASED TODAY" value={orderStats.today.packs} subtitle={money(orderStats.today.value)} />
        <StatCard icon={<CalendarDays size={25} strokeWidth={2} />} iconClass="bg-[#eaf9f0] text-[#16a05d]" title="TOTAL PACKS PURCHASED THIS MONTH" value={orderStats.month.packs} subtitle={money(orderStats.month.value)} />
        <StatCard icon={<PieChart size={25} strokeWidth={2} />} iconClass="bg-[#f4eaff] text-[#8737ef]" title="TOTAL PACKS PURCHASED TILL NOW" value={orderStats.tillNow.packs} subtitle={money(orderStats.tillNow.value)} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
        <div className="grid gap-5 px-5 py-4 xl:grid-cols-[320px_1fr_160px_160px] xl:items-end">
          <div>
            <label className="mb-2 block text-[10px] font-black text-[#475467]">Date Range</label>
            <div className="flex h-9 items-center rounded-lg border border-[#dfe4ec] bg-white px-3">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[11px] font-bold text-[#344054] outline-none" />
              <span className="px-2 text-[12px] font-black text-[#667085]">→</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[11px] font-bold text-[#344054] outline-none" />
              <Calendar size={14} className="ml-2 shrink-0 text-[#667085]" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black text-[#475467]">Search Order / User</label>
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number or customer..." className="h-9 w-full rounded-lg border border-[#dfe4ec] bg-white pl-9 pr-3 text-[11px] font-semibold text-[#344054] outline-none placeholder:text-[#98a2b3] focus:border-[#238bdc]" /></div>
          </div>
          <select value={paymentStatus} onChange={(e) => { setPage(1); setPaymentStatus(e.target.value); }} className="h-9 rounded-lg border border-[#dfe4ec] bg-white px-3 text-[10px] font-black text-[#344054] outline-none"><option value="">All Payments</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option></select>
          <select value={orderStatus} onChange={(e) => { setPage(1); setOrderStatus(e.target.value); }} className="h-9 rounded-lg border border-[#dfe4ec] bg-white px-3 text-[10px] font-black text-[#344054] outline-none"><option value="">All Orders</option><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option></select>
        </div>
        <div className="border-t border-[#edf0f4] px-5 py-4">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_auto_auto] lg:items-end">
            <div><label className="mb-2 block text-[10px] font-black text-[#475467]">Search Pack (by name)</label><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={packSearch} onChange={(e) => setPackSearch(e.target.value)} placeholder="Search by pack name..." className="h-9 w-full rounded-lg border border-[#dfe4ec] bg-white pl-9 pr-3 text-[11px] font-semibold outline-none placeholder:text-[#98a2b3] focus:border-[#238bdc]" /></div></div>
            <div><label className="mb-2 block text-[10px] font-black text-[#475467]">Price Range</label><select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="h-9 w-full rounded-lg border border-[#dfe4ec] bg-white px-3 text-[10px] font-black text-[#344054] outline-none"><option value="">All Prices</option><option value="UNDER_25">Under $25</option><option value="25_50">$25 - $50</option><option value="50_100">$50 - $100</option><option value="OVER_100">Over $100</option></select></div>
            <div><label className="mb-2 block text-[10px] font-black text-[#475467]">Card Name</label><select value={cardName} onChange={(e) => setCardName(e.target.value)} className="h-9 w-full rounded-lg border border-[#dfe4ec] bg-white px-3 text-[10px] font-black text-[#344054] outline-none"><option value="">All Cards</option>{[...new Set(orders.map(o => o.openedCard?.card?.name).filter(Boolean))].map(name => <option key={name} value={name}>{name}</option>)}</select></div>
            <div><label className="mb-2 block text-[10px] font-black text-[#475467]">Fulfillment</label><select value={fulfillmentFilter} onChange={(e) => setFulfillmentFilter(e.target.value)} className="h-9 w-full rounded-lg border border-[#dfe4ec] bg-white px-3 text-[10px] font-black text-[#344054] outline-none"><option value="">All Fulfillments</option><option value="NOT_OPENED">Not Opened</option><option value="READY_TO_SHIP">Ready to Ship</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="SOLD">Sold</option></select></div>
            <button type="button" onClick={() => { setPage(1); setFiltersApplied(true); }} className="h-9 rounded-lg bg-[#1677f2] px-6 text-[10px] font-black text-white shadow-sm hover:bg-[#0868df]">Apply</button>
            <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); setPackSearch(""); setPriceRange(""); setCardName(""); setFulfillmentFilter(""); setFiltersApplied(false); setSearch(""); setPaymentStatus(""); setOrderStatus(""); setPage(1); }} className="h-9 rounded-lg border border-[#dfe4ec] bg-white px-6 text-[10px] font-black text-[#344054] hover:bg-[#f8fafc]">Clear</button>
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">

          {error}

        </div>

      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (

          <div className="flex min-h-[350px] items-center justify-center">

            <Loader2
              size={30}
              className="animate-spin text-[#238bdc]"
            />

          </div>

        ) : visibleOrders.length === 0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

            <ShoppingBag
              size={40}
              className="text-[#aaa]"
            />

            <h3 className="mt-4 text-sm font-black">
              No orders found
            </h3>

            <p className="mt-2 max-w-sm text-xs text-[#777]">
              Pack purchases will appear here.
              Open an order to see the purchased pack
              and order details.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead>

                <tr className="border-b border-black/10 text-left">

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    ORDER
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    CUSTOMER
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    PACK
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    OPENED CARD
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    ORDER VALUE
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    PAYMENT
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    FULFILLMENT
                  </th>

                  <th className="px-5 py-3 text-[9px] font-black tracking-[0.08em] text-[#667085]">
                    DATE
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleOrders.map(
                  (order) => {

                    const card =
                      order.openedCard
                        ?.card;

                    const cardImage =
                      getCardImage(
                        card
                      );

                    const fulfillment =
                      order.fulfillmentStatus ||
                      (
                        order.openedCard
                          ?.status ||
                        "NOT_OPENED"
                      );

                    return (

                      <tr
                        key={
                          order._id
                        }
                        onClick={() =>
                          openOrder(
                            order
                          )
                        }
                        className="cursor-pointer border-b border-[#eef0f3] transition hover:bg-[#fbfcfe]"
                      >

                        {/* =================================
                            ORDER
                        ================================= */}

                        <td className="px-5 py-3">

                          <p className="text-xs font-black">
                            {
                              order.orderNumber ||
                              order._id
                            }
                          </p>

                          <p className="mt-1 text-[9px] text-[#888]">
                            {order.paymentMethod ||
                              "—"}
                          </p>

                        </td>


                        {/* =================================
                            CUSTOMER
                        ================================= */}

                        <td className="px-5 py-3">

                          <p className="text-xs font-black">
                            {
                              order.user?.name ||
                              "Unknown"
                            }
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-[9px] text-[#888]">
                            {
                              order.user?.email ||
                              "-"
                            }
                          </p>

                        </td>


                        {/* =================================
                            PACK
                        ================================= */}

                        <td className="px-5 py-3">

                          <div className="flex items-center gap-3">

                            {getPackImage(
                              order.pack
                            ) ? (

                              <img
                                src={
                                  getPackImage(
                                    order.pack
                                  )
                                }
                                alt={
                                  order.pack?.name ||
                                  "Pack"
                                }
                                className="h-12 w-9 rounded-md object-cover"
                              />

                            ) : (

                              <div className="flex h-12 w-9 items-center justify-center rounded-md bg-black/5">

                                <Package
                                  size={16}
                                  className="text-[#999]"
                                />

                              </div>

                            )}

                            <div>

                              <p className="max-w-[150px] truncate text-xs font-black">
                                {
                                  order.pack?.name ||
                                  "Unknown Pack"
                                }
                              </p>

                              <p className="mt-1 text-[9px] text-[#888]">
                                Qty:{" "}
                                {
                                  order.quantity ||
                                  1
                                }
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* =================================
                            OPENED CARD
                        ================================= */}

                        <td className="px-5 py-3">

                          {card ? (

                            <div className="flex items-center gap-3">

                              {cardImage ? (

                                <img
                                  src={
                                    cardImageUrls[cardImage] ||
                                    ""
                                  }
                                  alt={
                                    card.name ||
                                    "Card"
                                  }
                                  className="h-14 w-10 rounded-md object-cover shadow-sm"
                                />

                              ) : (

                                <div className="flex h-14 w-10 items-center justify-center rounded-md bg-black/5">

                                  <CreditCard
                                    size={16}
                                    className="text-[#999]"
                                  />

                                </div>

                              )}

                              <div>

                                <p className="max-w-[170px] truncate text-xs font-black">
                                  {
                                    card.name ||
                                    "Unknown Card"
                                  }
                                </p>

                                <p className="mt-1 text-[9px] text-[#888]">
                                  {card.number
                                    ? `#${card.number}`
                                    : ""}
                                  {card.rarity
                                    ? ` • ${card.rarity}`
                                    : ""}
                                </p>

                                <p className="mt-1 text-[9px] font-black text-[#238bdc]">
                                  {money(
                                    order.openedCard
                                      ?.marketPrice
                                  )}
                                </p>

                              </div>

                            </div>

                          ) : (

                            <div className="flex items-center gap-2">

                              <div className="flex h-10 w-8 items-center justify-center rounded-md bg-black/5">

                                <Package
                                  size={14}
                                  className="text-[#aaa]"
                                />

                              </div>

                              <span className="text-[9px] font-black text-[#999]">
                                NOT OPENED
                              </span>

                            </div>

                          )}

                        </td>


                        {/* =================================
                            ORDER VALUE
                        ================================= */}

                        <td className="px-5 py-3">

                          <p className="text-xs font-black">
                            {money(
                              order.amount
                            )}
                          </p>

                          {order.openedCard
                            ?.shippingFee >
                            0 && (

                            <p className="mt-1 text-[9px] font-bold text-[#888]">
                              + Shipping{" "}
                              {money(
                                order.openedCard
                                  ?.shippingFee
                              )}
                            </p>

                          )}

                        </td>


                        {/* =================================
                            PAYMENT
                        ================================= */}

                        <td className="px-5 py-3">

                          <div className="space-y-1">

                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1.5 text-[9px] font-black text-blue-700">
                              {
                                order.paymentMethod ||
                                "—"
                              }
                            </span>

                            <div>
                              <StatusBadge
                                value={
                                  order.paymentStatus
                                }
                              />
                            </div>

                          </div>

                        </td>


                        {/* =================================
                            FULFILLMENT
                        ================================= */}

                        <td className="px-5 py-3">

                          <StatusBadge
                            value={
                              fulfillment
                            }
                          />

                        </td>


                        {/* =================================
                            DATE
                        ================================= */}

                        <td className="px-5 py-3">

                          <p className="text-[10px] font-bold text-[#555]">
                            {
                              formatDate(
                                order.createdAt
                              )
                            }
                          </p>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading && visibleOrders.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#edf0f4] px-5 py-3">
            <p className="text-[10px] font-bold text-[#667085]">
              Showing {((page - 1) * 7) + 1}–{Math.min(page * 7, totalOrders || page * 7)} of {totalOrders || visibleOrders.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe4ec] bg-white text-[#667085] disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black ${page === pageNumber ? "bg-[#1677f2] text-white" : "border border-[#dfe4ec] bg-white text-[#344054]"}`}>
                  {pageNumber}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe4ec] bg-white text-[#667085] disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </section>


      {/* =================================================
          ORDER DETAIL MODAL
      ================================================= */}

      {selectedOrder && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={
            closeOrder
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[#f4f4f5] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#f4f4f5]/95 px-6 py-5 backdrop-blur">

              <div>

                <p className="text-[9px] font-black tracking-[0.2em] text-[#238bdc]">
                  ORDER DETAILS
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {
                    selectedOrder.orderNumber ||
                    selectedOrder._id
                  }
                </h2>

                <p className="mt-1 text-[10px] font-semibold text-[#777]">
                  {
                    formatDateTime(
                      selectedOrder.createdAt
                    )
                  }
                </p>

              </div>


              <button
                onClick={
                  closeOrder
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 transition hover:bg-black/10"
              >

                <X
                  size={17}
                />

              </button>

            </div>


            {/* =============================================
                MODAL BODY
            ============================================= */}

            <div className="space-y-5 p-5 sm:p-6">

              {/* =========================================
                  CUSTOMER + ORDER SUMMARY
              ========================================= */}

              <div className="grid gap-5 lg:grid-cols-2">

                {/* CUSTOMER */}

                <InfoCard
                  icon={
                    <User
                      size={17}
                    />
                  }
                  title="CUSTOMER"
                >

                  <InfoRow
                    label="Name"
                    value={
                      selectedOrder.user?.name
                    }
                  />

                  <InfoRow
                    label="Email"
                    value={
                      selectedOrder.user?.email
                    }
                  />

                  <InfoRow
                    label="Quantity"
                    value={
                      selectedOrder.quantity
                    }
                  />

                </InfoCard>


                {/* PAYMENT */}

                <InfoCard
                  icon={
                    <CreditCard
                      size={17}
                    />
                  }
                  title="PAYMENT"
                >

                  <InfoRow
                    label="Payment Method"
                    value={
                      selectedOrder.paymentMethod
                    }
                  />

                  <InfoRow
                    label="Payment Status"
                    value={
                      selectedOrder.paymentStatus
                    }
                  />

                  <InfoRow
                    label="Order Status"
                    value={
                      selectedOrder.orderStatus
                    }
                  />

                  <InfoRow
                    label="Pack Amount"
                    value={
                      money(
                        selectedOrder.amount
                      )
                    }
                  />

                </InfoCard>

              </div>


              {/* =========================================
                  PACK
              ========================================= */}

              <InfoCard
                icon={
                  <Package
                    size={17}
                  />
                }
                title="PURCHASED PACK"
              >

                <div className="flex flex-col gap-5 sm:flex-row">

                  {/* PACK IMAGE */}

                  <div className="shrink-0">

                    {getPackImage(
                      selectedOrder.pack
                    ) ? (

                      <img
                        src={
                          getPackImage(
                            selectedOrder.pack
                          )
                        }
                        alt={
                          selectedOrder.pack?.name ||
                          "Pack"
                        }
                        className="h-40 w-28 rounded-xl object-cover shadow-md"
                      />

                    ) : (

                      <div className="flex h-40 w-28 items-center justify-center rounded-xl bg-black/5">

                        <Package
                          size={30}
                          className="text-[#aaa]"
                        />

                      </div>

                    )}

                  </div>


                  {/* PACK DETAILS */}

                  <div className="flex-1">

                    <h3 className="text-lg font-black">
                      {
                        selectedOrder.pack?.name ||
                        "Unknown Pack"
                      }
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                      <InfoRow
                        label="Pack Price"
                        value={
                          money(
                            selectedOrder.pack?.packPrice ??
                            selectedOrder.pack?.price ??
                            (
                              Number(
                                selectedOrder.amount
                              ) /
                              Math.max(
                                Number(
                                  selectedOrder.quantity
                                ) || 1,
                                1
                              )
                            )
                          )
                        }
                      />

                      <InfoRow
                        label="Quantity"
                        value={
                          selectedOrder.quantity
                        }
                      />

                      <InfoRow
                        label="Order Total"
                        value={
                          money(
                            selectedOrder.amount
                          )
                        }
                      />

                      <InfoRow
                        label="User Pack"
                        value={
                          selectedOrder.userPack
                            ? "CREATED"
                            : "NOT LINKED"
                        }
                      />

                    </div>

                  </div>

                </div>

              </InfoCard>


              {/* =========================================
                  ACTUAL OPENED CARD
              ========================================= */}

              <InfoCard
                icon={
                  <CreditCard
                    size={17}
                  />
                }
                title="OPENED CARD"
              >

                {selectedOrder.openedCard?.card ? (

                  <div className="flex flex-col gap-6 lg:flex-row">

                    {/* CARD IMAGE */}

                    <div className="shrink-0">

                      {getCardImage(
                        selectedOrder.openedCard.card
                      ) ? (

                        <img
                          src={
                            cardImageUrls[
                              getCardImage(
                                selectedOrder.openedCard.card
                              )
                            ] ||
                            ""
                          }
                          alt={
                            selectedOrder.openedCard.card.name ||
                            "Opened card"
                          }
                          className="mx-auto h-[310px] w-[220px] rounded-2xl object-cover shadow-xl"
                        />

                      ) : (

                        <div className="flex h-[310px] w-[220px] items-center justify-center rounded-2xl bg-black/5">

                          <CreditCard
                            size={40}
                            className="text-[#aaa]"
                          />

                        </div>

                      )}

                    </div>


                    {/* CARD INFORMATION */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>

                          <p className="text-[9px] font-black tracking-widest text-[#238bdc]">
                            REVEALED CARD
                          </p>

                          <h3 className="mt-1 text-2xl font-black">
                            {
                              selectedOrder.openedCard.card.name
                            }
                          </h3>

                        </div>

                        <StatusBadge
                          value={
                            selectedOrder.openedCard.status
                          }
                        />

                      </div>


                      <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <InfoRow
                          label="Card Number"
                          value={
                            selectedOrder.openedCard.card.number ||
                            "-"
                          }
                        />

                        <InfoRow
                          label="Rarity"
                          value={
                            selectedOrder.openedCard.card.rarity ||
                            "-"
                          }
                        />

                        <InfoRow
                          label="Artist"
                          value={
                            selectedOrder.openedCard.card.artist ||
                            "-"
                          }
                        />

                        <InfoRow
                          label="TCG ID"
                          value={
                            selectedOrder.openedCard.card.tcgId ||
                            "-"
                          }
                        />

                        <InfoRow
                          label="Market Price"
                          value={
                            money(
                              selectedOrder.openedCard.marketPrice
                            )
                          }
                        />

                        <InfoRow
                          label="Revealed"
                          value={
                            formatDateTime(
                              selectedOrder.openedCard.revealedAt
                            )
                          }
                        />

                      </div>


                      {/* SET */}

                      {selectedOrder.openedCard.card.set
                        ?.name && (

                        <div className="mt-5 rounded-xl border border-black/5 bg-white/60 p-4">

                          <p className="text-[8px] font-black tracking-widest text-[#888]">
                            SET
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {
                              selectedOrder.openedCard.card.set.name
                            }
                          </p>

                          {selectedOrder.openedCard.card.set.series && (

                            <p className="mt-1 text-[10px] font-semibold text-[#777]">
                              {
                                selectedOrder.openedCard.card.set.series
                              }
                            </p>

                          )}

                        </div>

                      )}

                    </div>

                  </div>

                ) : (

                  <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 p-8 text-center">

                    <Package
                      size={32}
                      className="mx-auto text-[#aaa]"
                    />

                    <p className="mt-3 text-sm font-black">
                      Card not opened yet
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-[#888]">
                      The actual revealed card will
                      appear here after the pack is ripped.
                    </p>

                  </div>

                )}

              </InfoCard>


              {/* =========================================
                  SHIPPING
              ========================================= */}

              <InfoCard
                icon={
                  <Truck
                    size={17}
                  />
                }
                title="SHIPPING"
              >

                {selectedOrder.shipping?.hasShipping ? (

                  <div className="space-y-5">

                    {/* SHIPPING STATUS */}

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 p-4">

                      <div>

                        <p className="text-[8px] font-black tracking-widest text-[#888]">
                          SHIPPING STATUS
                        </p>

                        <div className="mt-2">

                          <StatusBadge
                            value={
                              selectedOrder.shipping.status ||
                              selectedOrder.openedCard?.status ||
                              "SHIPPING"
                            }
                          />

                        </div>

                      </div>


                      <div className="text-right">

                        <p className="text-[8px] font-black tracking-widest text-[#888]">
                          SHIPPING CHARGE
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {money(
                            selectedOrder.shipping.fee
                          )}
                        </p>

                      </div>

                    </div>


                    {/* ADDRESS */}

                    {selectedOrder.shipping.address && (

                      <div className="rounded-xl border border-black/5 bg-white/60 p-4">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={15}
                            className="text-[#238bdc]"
                          />

                          <p className="text-[9px] font-black tracking-widest text-[#777]">
                            DELIVERY ADDRESS
                          </p>

                        </div>

                        <div className="mt-4 space-y-1 text-xs font-semibold">

                          <p className="font-black">
                            {
                              selectedOrder.shipping.address.fullName ||
                              "-"
                            }
                          </p>

                          <p>
                            {
                              selectedOrder.shipping.address.addressLine1 ||
                              "-"
                            }
                          </p>

                          {selectedOrder.shipping.address.addressLine2 && (

                            <p>
                              {
                                selectedOrder.shipping.address.addressLine2
                              }
                            </p>

                          )}

                          <p>
                            {
                              selectedOrder.shipping.address.city ||
                              "-"
                            }
                            {", "}
                            {
                              selectedOrder.shipping.address.state ||
                              "-"
                            }
                            {" - "}
                            {
                              selectedOrder.shipping.address.postalCode ||
                              "-"
                            }
                          </p>

                          <p>
                            {
                              selectedOrder.shipping.address.country ||
                              "India"
                            }
                          </p>

                          <p className="pt-2">
                            Phone:{" "}
                            {
                              selectedOrder.shipping.address.phone ||
                              "-"
                            }
                          </p>

                          <p>
                            Email:{" "}
                            {
                              selectedOrder.shipping.address.email ||
                              "-"
                            }
                          </p>

                        </div>

                      </div>

                    )}


                    {/* SHIPMENT */}

                    {selectedOrder.shipping.shipment && (

                      <div className="rounded-xl bg-white/60 p-4">

                        <p className="text-[8px] font-black tracking-widest text-[#888]">
                          SHIPMENT
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">

                          <InfoRow
                            label="Shipment ID"
                            value={
                              selectedOrder.shipping.shipment._id ||
                              "-"
                            }
                          />

                          <InfoRow
                            label="Tracking Number"
                            value={
                              selectedOrder.shipping.shipment.trackingNumber ||
                              "-"
                            }
                          />

                          <InfoRow
                            label="Carrier"
                            value={
                              selectedOrder.shipping.shipment.carrier ||
                              "-"
                            }
                          />

                          <InfoRow
                            label="Status"
                            value={
                              selectedOrder.shipping.shipment.status ||
                              "-"
                            }
                          />

                        </div>

                      </div>

                    )}

                  </div>

                ) : (

                  <div className="rounded-xl bg-white/50 p-5">

                    <p className="text-xs font-black">
                      No shipping request
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-[#888]">
                      This card has not been sent for shipping.
                    </p>

                  </div>

                )}

              </InfoCard>


              {/* =========================================
                  CARD SALE / 80-20
              ========================================= */}

              <InfoCard
                icon={
                  <Wallet
                    size={17}
                  />
                }
                title="CARD SALE & 80 / 20 SPLIT"
              >

                {selectedOrder.sale?.hasSale ? (

                  <div className="space-y-4">

                    {/* TOTAL */}

                    <div className="rounded-2xl bg-[#111214] p-5 text-white">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-[8px] font-black tracking-widest text-white/50">
                            CARD SOLD VALUE
                          </p>

                          <p className="mt-1 text-2xl font-black">
                            {
                              money(
                                selectedOrder.sale.soldAmount
                              )
                            }
                          </p>

                        </div>

                        <BadgeIndianRupee
                          size={28}
                          className="text-white/60"
                        />

                      </div>

                    </div>


                    {/* 80 / 20 */}

                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* USER */}

                      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-[8px] font-black tracking-widest text-green-700">
                              USER PAYOUT
                            </p>

                            <p className="mt-1 text-2xl font-black text-green-800">
                              {
                                money(
                                  selectedOrder.sale.userPayout
                                )
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-green-200 px-3 py-1 text-[9px] font-black text-green-800">
                            80%
                          </span>

                        </div>

                        <p className="mt-3 text-[10px] font-semibold text-green-700">
                          Amount credited to user's wallet.
                        </p>

                      </div>


                      {/* ADMIN */}

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-[8px] font-black tracking-widest text-blue-700">
                              ADMIN COMMISSION
                            </p>

                            <p className="mt-1 text-2xl font-black text-blue-800">
                              {
                                money(
                                  selectedOrder.sale.adminCommission
                                )
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-blue-200 px-3 py-1 text-[9px] font-black text-blue-800">
                            20%
                          </span>

                        </div>

                        <p className="mt-3 text-[10px] font-semibold text-blue-700">
                          Platform commission from card sale.
                        </p>

                      </div>

                    </div>


                    {/* TRANSACTIONS */}

                    <div className="rounded-xl bg-white/60 p-4">

                      <p className="text-[8px] font-black tracking-widest text-[#888]">
                        SALE TRANSACTIONS
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">

                        <InfoRow
                          label="User SELL Transaction"
                          value={
                            selectedOrder.sale.sellTransaction
                              ? money(
                                  selectedOrder.sale.sellTransaction.amount
                                )
                              : "-"
                          }
                        />

                        <InfoRow
                          label="Admin Fee Transaction"
                          value={
                            selectedOrder.sale.adminFeeTransaction
                              ? money(
                                  selectedOrder.sale.adminFeeTransaction.amount
                                )
                              : "-"
                          }
                        />

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="rounded-xl bg-white/50 p-5">

                    <p className="text-xs font-black">
                      Card has not been sold
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-[#888]">
                      When the user sells this revealed
                      card, the 80% user payout and 20%
                      admin commission will appear here.
                    </p>

                  </div>

                )}

              </InfoCard>


              {/* =========================================
                  FINANCIAL SUMMARY
              ========================================= */}

              <InfoCard
                icon={
                  <BadgeIndianRupee
                    size={17}
                  />
                }
                title="FINANCIAL SUMMARY"
              >

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <SummaryBox
                    label="PACK PURCHASE"
                    value={
                      money(
                        selectedOrder.amount
                      )
                    }
                  />

                  <SummaryBox
                    label="CARD MARKET VALUE"
                    value={
                      money(
                        selectedOrder.openedCard
                          ?.marketPrice
                      )
                    }
                  />

                  <SummaryBox
                    label="SHIPPING"
                    value={
                      money(
                        selectedOrder.shipping
                          ?.fee
                      )
                    }
                  />

                  <SummaryBox
                    label="USER PAYOUT"
                    value={
                      money(
                        selectedOrder.sale
                          ?.userPayout
                      )
                    }
                  />

                </div>

              </InfoCard>


              {/* =========================================
                  TIMELINE
              ========================================= */}

              <InfoCard
                icon={
                  <ExternalLink
                    size={17}
                  />
                }
                title="ORDER TIMELINE"
              >

                <div className="space-y-4">

                  <TimelineItem
                    title="Pack Purchased"
                    date={
                      selectedOrder.createdAt
                    }
                    active
                  />

                  {selectedOrder.openedCard && (

                    <TimelineItem
                      title="Card Revealed"
                      date={
                        selectedOrder.openedCard.revealedAt
                      }
                      active
                    />

                  )}

                  {selectedOrder.openedCard?.soldAt && (

                    <TimelineItem
                      title="Card Sold"
                      date={
                        selectedOrder.openedCard.soldAt
                      }
                      active
                    />

                  )}

                  {selectedOrder.openedCard?.shippedAt && (

                    <TimelineItem
                      title="Card Shipped"
                      date={
                        selectedOrder.openedCard.shippedAt
                      }
                      active
                    />

                  )}

                  {selectedOrder.redemption && (

                    <TimelineItem
                      title="Redemption Created"
                      date={
                        selectedOrder.redemption.createdAt
                      }
                      active
                    />

                  )}

                </div>

              </InfoCard>

            </div>


            {/* =============================================
                LOADING OVERLAY
            ============================================= */}

            {detailsLoading && (

              <div className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center">

                <div className="rounded-xl bg-black px-4 py-3 text-xs font-black text-white shadow-xl">

                  <div className="flex items-center gap-2">

                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Loading latest order details...

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, iconClass, title, value, subtitle }) {
  const valueClass = iconClass.includes("blue") ? "text-[#1677f2]" : iconClass.includes("green") ? "text-[#16a05d]" : "text-[#8737ef]";
  return (
    <div className="rounded-xl border border-[#e3e7ee] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-[0.1em] text-[#667085]">{title}</p>
          <p className="mt-2 text-[25px] font-black leading-none tracking-tight text-[#172033]">{Number(value || 0).toLocaleString("en-IN")}</p>
          <p className="mt-1 text-[10px] font-semibold text-[#667085]">Orders</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#e8ebf0] pt-3">
        <span className="text-[10px] font-semibold text-[#667085]">Total Value</span>
        <span className={`text-[13px] font-black ${valueClass}`}>{subtitle}</span>
      </div>
    </div>
  );
}


// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  icon,
  title,
  children,
}) {

  return (

    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">

      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">

        <span className="text-[#238bdc]">
          {icon}
        </span>

        <p className="text-[9px] font-black tracking-[0.15em] text-[#666]">
          {title}
        </p>

      </div>

      <div className="p-5">
        {children}
      </div>

    </section>

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

    <div className="rounded-xl border border-black/5 bg-white/50 px-3 py-3">

      <p className="text-[8px] font-black tracking-wider text-[#888]">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-black text-[#202124]">
        {value || "-"}
      </p>

    </div>

  );

}


// =====================================================
// SUMMARY BOX
// =====================================================

function SummaryBox({
  label,
  value,
}) {

  return (

    <div className="rounded-xl bg-white/70 p-4">

      <p className="text-[8px] font-black tracking-widest text-[#888]">
        {label}
      </p>

      <p className="mt-2 text-lg font-black">
        {value}
      </p>

    </div>

  );

}


// =====================================================
// TIMELINE
// =====================================================

function TimelineItem({
  title,
  date,
  active = false,
}) {

  return (

    <div className="flex items-start gap-3">

      <div
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
          active
            ? "bg-[#238bdc]"
            : "bg-black/10"
        }`}
      />

      <div className="flex-1">

        <p className="text-xs font-black">
          {title}
        </p>

        <p className="mt-1 text-[9px] font-semibold text-[#888]">
          {formatDateTime(
            date
          )}
        </p>

      </div>

    </div>

  );

}


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  value,
}) {

  const normalized =
    String(
      value || ""
    ).toUpperCase();


  const styles = {

    PAID:
      "bg-green-100 text-green-700",

    COMPLETED:
      "bg-green-100 text-green-700",

    APPROVED:
      "bg-green-100 text-green-700",

    REVEALED:
      "bg-yellow-100 text-yellow-700",

    SHIPPING:
      "bg-orange-100 text-orange-700",

    SHIPPED:
      "bg-blue-100 text-blue-700",

    SOLD:
      "bg-purple-100 text-purple-700",

    DELIVERED:
      "bg-green-100 text-green-700",

    PENDING:
      "bg-yellow-100 text-yellow-700",

    FAILED:
      "bg-red-100 text-red-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    REFUNDED:
      "bg-purple-100 text-purple-700",

    NOT_OPENED:
      "bg-black/5 text-[#555]",

    NOT_LINKED:
      "bg-black/5 text-[#555]",

  };


  return (

    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[8px] font-black ${
        styles[normalized] ||
        "bg-black/5 text-[#555]"
      }`}
    >

      {normalized
        .replaceAll(
          "_",
          " "
        )}

    </span>

  );

}