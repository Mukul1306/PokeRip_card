import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Truck,
  CalendarDays,
  PackageCheck,
  Package,
  CheckCircle2,
  CircleAlert,
  X,
  Eye,
  Check,
  Ban,
  ExternalLink,
  User,
  CreditCard,
  MapPin,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


// =====================================================
// CONFIG
// =====================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SHIPPING_API = `${API_BASE}/api/admin/shipping`;

const PAGE_SIZE = 5;


// =====================================================
// HELPERS
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
};


const getImage = (shipment) => {
  return (
    shipment?.card?.imageLarge ||
    shipment?.card?.imageSmall ||
    shipment?.card?.image ||
    shipment?.userPackCard?.card?.imageLarge ||
    shipment?.userPackCard?.card?.imageSmall ||
    shipment?.userPackCard?.card?.image ||
    shipment?.cardImage ||
    shipment?.imageLarge ||
    shipment?.imageSmall ||
    shipment?.image ||
    ""
  );
};

const resolveImageUrl = (value) => {
  if (!value) return "";
  const text = String(value);
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith("//")) return `https:${text}`;
  if (text.startsWith("/")) return `${API_BASE}${text}`;
  return text;
};

function CardImage({ shipment, className = "", alt = "Card" }) {
  const source = getImage(shipment);
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    if (!source) {
      setSrc("");
      return () => {};
    }

    const absolute = resolveImageUrl(source);

    // Public/external images can be rendered directly.
    if (/^https?:\/\//i.test(String(source))) {
      setSrc(absolute);
      return () => {};
    }

    // Backend image endpoints may require the admin bearer token.
    const loadProtectedImage = async () => {
      try {
        const token = getToken();
        const response = await fetch(absolute, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (!response.ok) throw new Error("Unable to load card image");

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(absolute);
      }
    };

    loadProtectedImage();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  if (!src) {
    return <CreditCard size={22} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}


const getCardName = (shipment) => {
  return (
    shipment?.card?.name ||
    shipment?.cardName ||
    shipment?.userPackCard?.card?.name ||
    "Unknown Card"
  );
};


const getCardNumber = (shipment) => {
  return (
    shipment?.card?.number ||
    shipment?.cardNumber ||
    shipment?.userPackCard?.card?.number ||
    "-"
  );
};


const getRarity = (shipment) => {
  return (
    shipment?.card?.rarity ||
    shipment?.rarity ||
    shipment?.userPackCard?.card?.rarity ||
    "-"
  );
};


const getSetName = (shipment) => {
  return (
    shipment?.card?.set?.name ||
    shipment?.set?.name ||
    shipment?.setName ||
    shipment?.userPackCard?.card?.set?.name ||
    "-"
  );
};


const getTcgId = (shipment) => {
  return (
    shipment?.card?.tcgId ||
    shipment?.tcgId ||
    shipment?.userPackCard?.card?.tcgId ||
    "-"
  );
};


const getArtist = (shipment) => {
  return (
    shipment?.card?.artist ||
    shipment?.artist ||
    shipment?.userPackCard?.card?.artist ||
    "-"
  );
};


const getUserName = (shipment) => {
  return (
    shipment?.user?.username ||
    shipment?.user?.name ||
    shipment?.username ||
    shipment?.recipient?.name ||
    "Unknown User"
  );
};


const getUserEmail = (shipment) => {
  return (
    shipment?.user?.email ||
    shipment?.email ||
    shipment?.recipient?.email ||
    "-"
  );
};


const getPackName = (shipment) => {
  return (
    shipment?.userPack?.pack?.name ||
    shipment?.pack?.name ||
    shipment?.packName ||
    shipment?.userPack?.name ||
    "Unknown Pack"
  );
};


const getTrackingNumber = (shipment) => {
  return (
    shipment?.trackingNumber ||
    shipment?.tracking ||
    "-"
  );
};


const getCarrier = (shipment) => {
  return shipment?.carrier || "Not assigned";
};


const getShippingStatus = (shipment) => {
  return (
    shipment?.status ||
    shipment?.shippingStatus ||
    "PENDING"
  );
};


const getShipmentId = (shipment) => {
  return (
    shipment?._id ||
    shipment?.id ||
    shipment?.shipmentId ||
    ""
  );
};


const getDate = (shipment) => {
  return (
    shipment?.createdAt ||
    shipment?.shippedAt ||
    shipment?.updatedAt ||
    shipment?.date ||
    shipment?.soldAt ||
    null
  );
};


const formatMoney = (value, currency = "USD") => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};


const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
};


const isApproved = (shipment) => {
  const status = normalizeStatus(
    shipment?.approvalStatus ||
      shipment?.adminStatus ||
      shipment?.reviewStatus
  );

  return (
    status === "APPROVED" ||
    status === "SHIPPING_APPROVED"
  );
};


const isRejected = (shipment) => {
  const status = normalizeStatus(
    shipment?.approvalStatus ||
      shipment?.adminStatus ||
      shipment?.reviewStatus
  );

  return (
    status === "REJECTED" ||
    status === "SHIPPING_REJECTED"
  );
};


const isRealShipment = (shipment) => {
  const status = normalizeStatus(
    shipment?.status ||
      shipment?.shippingStatus
  );

  return [
    "READY_TO_SHIP",
    "READY",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "DELIVERY_FAILED",
    "FAILED",
    "CANCELLED",
  ].includes(status);
};

const canTakeAction = (shipment) => {
  if (!shipment) return false;

  const approvalStatus = normalizeStatus(
    shipment?.approvalStatus ||
      shipment?.adminStatus ||
      shipment?.reviewStatus
  );

  const redemptionStatus = normalizeStatus(
    shipment?.redemptionData?.status ||
      shipment?.redemption?.status
  );

  const shipmentStatus = normalizeStatus(
    shipment?.status ||
      shipment?.shippingStatus
  );

  if (
    approvalStatus === "APPROVED" ||
    approvalStatus === "SHIPPING_APPROVED" ||
    approvalStatus === "REJECTED" ||
    approvalStatus === "SHIPPING_REJECTED" ||
    redemptionStatus === "APPROVED" ||
    redemptionStatus === "REJECTED"
  ) {
    return false;
  }

  // A real Shipment is already past the approval stage.
  // Approve/Reject is only for pending redemption requests.
  if (isRealShipment(shipment)) {
    return false;
  }

  return (
    shipment?.isRedemptionRequest === true &&
    (
      approvalStatus === "PENDING" ||
      redemptionStatus === "PENDING" ||
      shipmentStatus === "PENDING"
    )
  );
};


// =====================================================
// COMPONENT
// =====================================================

export default function AdminShipping() {

  // ===================================================
  // STATE
  // ===================================================

  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [carrierFilter, setCarrierFilter] =
    useState("ALL");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [appliedFrom, setAppliedFrom] =
    useState("");

  const [appliedTo, setAppliedTo] =
    useState("");

  const [page, setPage] = useState(1);

  const [selectedShipment, setSelectedShipment] =
    useState(null);

  const [actionShipment, setActionShipment] =
    useState(null);

  const [actionType, setActionType] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(false);


  // ===================================================
  // FETCH SHIPMENTS
  // ===================================================

  const fetchShipments = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(
        SHIPPING_API,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const result =
        await response.json();

      // -----------------------------------------------
      // Support different backend response structures
      // -----------------------------------------------

      const data =
        result?.data?.shipments ||
        result?.shipments ||
        result?.data ||
        [];

      setShipments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Fetch shipping error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load shipments"
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    fetchShipments();

  }, []);


  // ===================================================
  // CARRIERS
  // ===================================================

  const carriers = useMemo(() => {
    const defaultCarriers = [
      "FedEx",
      "DHL",
      "UPS",
      "Blue Dart",
      "Delhivery",
      "DTDC",
      "India Post",
      "Ekart",
      "Other",
    ];

    const values = shipments
      .map((item) => getCarrier(item))
      .filter((value) => value && value !== "Not assigned");

    return [...new Set([...defaultCarriers, ...values])];
  }, [shipments]);


  // ===================================================
  // FILTER DATA
  // ===================================================

  const filteredShipments =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();

      return shipments.filter(
        (shipment) => {

          // -------------------------------------------
          // SEARCH
          // -------------------------------------------

          if (searchValue) {

            const searchable = [
              getShipmentId(
                shipment
              ),

              getCardName(
                shipment
              ),

              getCardNumber(
                shipment
              ),

              getUserName(
                shipment
              ),

              getUserEmail(
                shipment
              ),

              getPackName(
                shipment
              ),

              getTrackingNumber(
                shipment
              ),

              getCarrier(
                shipment
              ),
            ]
              .join(" ")
              .toLowerCase();

            if (
              !searchable.includes(
                searchValue
              )
            ) {
              return false;
            }
          }


          // -------------------------------------------
          // STATUS
          // -------------------------------------------

          if (
            statusFilter !== "ALL"
          ) {

            const currentStatus =
              normalizeStatus(
                getShippingStatus(
                  shipment
                )
              );

            if (
              currentStatus !==
              normalizeStatus(
                statusFilter
              )
            ) {
              return false;
            }
          }


          // -------------------------------------------
          // CARRIER
          // -------------------------------------------

          if (
            carrierFilter !==
            "ALL"
          ) {

            if (
              getCarrier(
                shipment
              ) !==
              carrierFilter
            ) {
              return false;
            }
          }


          // -------------------------------------------
          // DATE FILTER
          // -------------------------------------------

          const shipmentDate =
            getDate(shipment);

          if (
            appliedFrom ||
            appliedTo
          ) {

            if (!shipmentDate) {
              return false;
            }

            const date =
              new Date(
                shipmentDate
              );

            date.setHours(
              0,
              0,
              0,
              0
            );

            if (appliedFrom) {

              const from =
                new Date(
                  `${appliedFrom}T00:00:00`
                );

              if (
                date < from
              ) {
                return false;
              }
            }

            if (appliedTo) {

              const to =
                new Date(
                  `${appliedTo}T23:59:59`
                );

              if (
                date > to
              ) {
                return false;
              }
            }
          }


          return true;
        }
      );

    }, [
      shipments,
      search,
      statusFilter,
      carrierFilter,
      appliedFrom,
      appliedTo,
    ]);


  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredShipments.length /
          PAGE_SIZE
      )
    );


  const paginatedShipments =
    filteredShipments.slice(
      (page - 1) *
        PAGE_SIZE,

      page *
        PAGE_SIZE
    );


  useEffect(() => {

    if (page > totalPages) {
      setPage(totalPages);
    }

  }, [
    page,
    totalPages,
  ]);


  // ===================================================
  // APPLY DATE
  // ===================================================

  const applyDateFilter = () => {

    setAppliedFrom(
      dateFrom
    );

    setAppliedTo(
      dateTo
    );

    setPage(1);
  };


  // ===================================================
  // CLEAR FILTER
  // ===================================================

  const clearFilters = () => {

    setSearch("");

    setStatusFilter(
      "ALL"
    );

    setCarrierFilter(
      "ALL"
    );

    setDateFrom("");

    setDateTo("");

    setAppliedFrom("");

    setAppliedTo("");

    setPage(1);
  };


  // ===================================================
  // APPROVE / REJECT
  // ===================================================

  const openAction = (
    shipment,
    type
  ) => {

    setActionShipment(
      shipment
    );

    setActionType(type);
  };


  const closeAction = () => {

    if (actionLoading) {
      return;
    }

    setActionShipment(
      null
    );

    setActionType(
      null
    );
  };


  const handleAction = async () => {

    if (
      !actionShipment ||
      !actionType
    ) {
      return;
    }

    try {

      setActionLoading(
        true
      );

      const token =
        getToken();

      const shipmentId =
        getShipmentId(
          actionShipment
        );

      // -----------------------------------------------
      // Endpoint
      // -----------------------------------------------

      const endpoint =
        `${SHIPPING_API}/${shipmentId}/${
          actionType === "approve"
            ? "approve"
            : "reject"
        }`;

      const response =
        await fetch(
          endpoint,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      if (!response.ok) {

        const body =
          await response
            .json()
            .catch(
              () => ({})
            );

        throw new Error(
          body?.message ||
            "Unable to update shipment"
        );
      }

      // -----------------------------------------------
      // Update local table immediately
      // -----------------------------------------------

      setShipments(
        (previous) =>
          previous.map(
            (item) => {

              if (
                getShipmentId(
                  item
                ) !==
                shipmentId
              ) {
                return item;
              }

              return {
                ...item,

                approvalStatus:
                  actionType ===
                  "approve"
                    ? "APPROVED"
                    : "REJECTED",

                adminStatus:
                  actionType ===
                  "approve"
                    ? "APPROVED"
                    : "REJECTED",

                reviewStatus:
                  actionType ===
                  "approve"
                    ? "APPROVED"
                    : "REJECTED",
              };
            }
          )
      );


      // -----------------------------------------------
      // Update popup if open
      // -----------------------------------------------

      setSelectedShipment(
        (previous) => {

          if (
            !previous ||
            getShipmentId(
              previous
            ) !==
              shipmentId
          ) {
            return previous;
          }

          return {
            ...previous,

            approvalStatus:
              actionType ===
              "approve"
                ? "APPROVED"
                : "REJECTED",

            adminStatus:
              actionType ===
              "approve"
                ? "APPROVED"
                : "REJECTED",

            reviewStatus:
              actionType ===
              "approve"
                ? "APPROVED"
                : "REJECTED",
          };
        }
      );


      closeAction();

      // Refresh from the backend so approval/rejection is reflected
      // immediately and an approved request becomes the real Shipment.
      await fetchShipments(true);

    } catch (err) {

      console.error(
        "Shipping action error:",
        err
      );

      alert(
        err?.message ||
          "Unable to update shipment"
      );

    } finally {

      setActionLoading(
        false
      );
    }
  };


  // ===================================================
  // STATISTICS
  // ===================================================

  const now =
    new Date();


  const todayStart =
    new Date(
      now
    );

  todayStart.setHours(
    0,
    0,
    0,
    0
  );


  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  const shippedToday =
    shipments.filter(
      (shipment) => {

        const date =
          getDate(shipment);

        if (!date) {
          return false;
        }

        const value =
          new Date(date);

        return (
          value >=
          todayStart &&
          normalizeStatus(
            getShippingStatus(shipment)
          ) === "SHIPPED"
        );
      }
    ).length;


  const shippedMonth =
    shipments.filter(
      (shipment) => {

        const date =
          getDate(shipment);

        if (!date) {
          return false;
        }

        const value =
          new Date(date);

        return (
          value >=
          monthStart &&
          normalizeStatus(
            getShippingStatus(shipment)
          ) === "SHIPPED"
        );
      }
    ).length;


  const shippedAll =
    shipments.filter(
      (shipment) =>
        normalizeStatus(
          getShippingStatus(shipment)
        ) === "SHIPPED"
    ).length;


  const delivered =
    shipments.filter(
      (shipment) =>
        normalizeStatus(
          getShippingStatus(
            shipment
          )
        ) ===
        "DELIVERED"
    ).length;


  const deliveryFailed =
    shipments.filter(
      (shipment) =>
        [
          "FAILED",
          "DELIVERY_FAILED",
          "DELIVERY_FAIL",
        ].includes(
          normalizeStatus(
            getShippingStatus(
              shipment
            )
          )
        )
    ).length;


  // ===================================================
  // UPDATE DETAILS FROM MODAL
  // ===================================================

  const handleShipmentUpdated = (updatedShipment) => {
    if (!updatedShipment) return;

    const updatedId = getShipmentId(updatedShipment);

    setShipments((previous) =>
      previous.map((item) =>
        getShipmentId(item) === updatedId
          ? { ...item, ...updatedShipment }
          : item
      )
    );

    setSelectedShipment(updatedShipment);
  };


  // ===================================================
  // STATUS LABEL
  // ===================================================

  const statusLabel = (
    status
  ) => {

    const normalized =
      normalizeStatus(
        status
      );

    switch (
      normalized
    ) {

      case "READY_TO_SHIP":
        return "READY TO SHIP";

      case "READY":
        return "READY TO SHIP";

      case "PROCESSING":
        return "PROCESSING";

      case "SHIPPED":
        return "SHIPPED";

      case "DELIVERED":
        return "DELIVERED";

      case "FAILED":
      case "DELIVERY_FAILED":
        return "DELIVERY FAILED";

      case "REJECTED":
        return "REJECTED";

      default:
        return (
          String(
            status ||
              "PENDING"
          )
            .replace(
              /_/g,
              " "
            )
            .toUpperCase()
        );
    }
  };


  // ===================================================
  // STATUS CLASS
  // ===================================================

  const statusClass = (
    status
  ) => {

    const normalized =
      normalizeStatus(
        status
      );

    if (
      normalized ===
      "DELIVERED"
    ) {
      return "status delivered";
    }

    if (
      normalized ===
      "SHIPPED"
    ) {
      return "status shipped";
    }

    if (
      normalized ===
      "READY_TO_SHIP" ||
      normalized ===
      "READY"
    ) {
      return "status ready";
    }

    if (
      normalized ===
      "REJECTED"
    ) {
      return "status rejected";
    }

    if (
      normalized ===
        "FAILED" ||
      normalized ===
        "DELIVERY_FAILED"
    ) {
      return "status failed";
    }

    return "status pending";
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="shipping-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="shipping-header">

        <div>

          <div className="eyebrow">
            LOGISTICS MANAGEMENT
          </div>

          <h1>
            Shipping
          </h1>

          <p>
            Manage card shipments,
            tracking and delivery status.
          </p>

        </div>


        <button
          className="refresh-btn"
          onClick={() =>
            fetchShipments(true)
          }
          disabled={
            refreshing
          }
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="stats-grid">

        <StatCard
          icon={
            <Truck size={22} />
          }
          title="TOTAL CARDS SHIPPED TODAY"
          value={
            shippedToday
          }
          subtitle="Cards"
          type="blue"
        />

        <StatCard
          icon={
            <CalendarDays
              size={22}
            />
          }
          title="TOTAL CARDS SHIPPED THIS MONTH"
          value={
            shippedMonth
          }
          subtitle="Cards"
          type="green"
        />

        <StatCard
          icon={
            <PackageCheck
              size={22}
            />
          }
          title="TOTAL CARDS SHIPPED TILL NOW"
          value={
            shippedAll
          }
          subtitle="Cards"
          type="purple"
        />

        <StatCard
          icon={
            <CheckCircle2
              size={22}
            />
          }
          title="DELIVERED"
          value={
            delivered
          }
          subtitle="Cards"
          type="blue"
        />

        <StatCard
          icon={
            <CircleAlert
              size={22}
            />
          }
          title="DELIVERY FAILED"
          value={
            deliveryFailed
          }
          subtitle="Cards"
          type="red"
        />

      </div>


      {/* =================================================
          FILTER SECTION
      ================================================= */}

      <div className="filter-box">

        <div className="search-wrapper">

          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search shipment, card, recipient, tracking number..."
            value={
              search
            }
            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setPage(1);
            }}
          />

        </div>


        <select
          value={
            statusFilter
          }
          onChange={(e) => {

            setStatusFilter(
              e.target.value
            );

            setPage(1);
          }}
        >

          <option value="ALL">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="READY_TO_SHIP">
            Ready to Ship
          </option>

          <option value="PROCESSING">
            Processing
          </option>

          <option value="PACKED">
            Packed
          </option>

          <option value="SHIPPED">
            Shipped
          </option>

          <option value="DELIVERED">
            Delivered
          </option>

          <option value="DELIVERY_FAILED">
            Delivery Failed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>

          <option value="REJECTED">
            Rejected
          </option>

        </select>


        <select
          value={
            carrierFilter
          }
          onChange={(e) => {

            setCarrierFilter(
              e.target.value
            );

            setPage(1);
          }}
        >

          <option value="ALL">
            All Carriers
          </option>

          {carriers.map(
            (carrier) => (
              <option
                key={carrier}
                value={carrier}
              >
                {carrier}
              </option>
            )
          )}

        </select>


        <div className="date-range">

          <input
            type="date"
            value={
              dateFrom
            }
            onChange={(e) =>
              setDateFrom(
                e.target.value
              )
            }
          />

          <span>
            →
          </span>

          <input
            type="date"
            value={
              dateTo
            }
            onChange={(e) =>
              setDateTo(
                e.target.value
              )
            }
          />

        </div>


        <button
          className="apply-btn"
          onClick={
            applyDateFilter
          }
        >
          Apply
        </button>


        <button
          className="clear-btn"
          onClick={
            clearFilters
          }
        >
          Clear
        </button>

      </div>


      {/* =================================================
          ACTIVE DATE
      ================================================= */}

      {(appliedFrom ||
        appliedTo) && (

        <div className="filter-info">

          Showing:

          <strong>
            {" "}

            {appliedFrom
              ? formatDate(
                  appliedFrom
                )
              : "Beginning"}

            {" → "}

            {appliedTo
              ? formatDate(
                  appliedTo
                )
              : "Today"}

          </strong>

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="error-box">

          {error}

        </div>

      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-card">

        <div className="table-scroll">

          <table>

            <thead>

              <tr>

                <th>
                  SHIPMENT
                </th>

                <th>
                  CARD
                </th>

                <th>
                  RECIPIENT
                </th>

                <th>
                  CARRIER
                </th>

                <th>
                  TRACKING
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  DATE
                </th>

                <th>
                  ACTIONS
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="8"
                    className="empty-cell"
                  >
                    Loading shipments...
                  </td>

                </tr>

              ) : paginatedShipments.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="empty-cell"
                  >
                    No shipments found.
                  </td>

                </tr>

              ) : (

                paginatedShipments.map(
                  (shipment) => {


                    const approved =
                      isApproved(
                        shipment
                      );

                    const rejected =
                      isRejected(
                        shipment
                      );

                    const actionAvailable =
                      canTakeAction(
                        shipment
                      );

                    return (

                      <tr
                        key={
                          getShipmentId(
                            shipment
                          )
                        }
                      >

                        {/* SHIPMENT */}

                        <td>

                          <div className="shipment-id">

                            <strong>
                              {
                                shipment?.shipmentNumber ||
                                (shipment?.isRedemptionRequest
                                  ? `REQ-${shipment?.redemptionNumber || String(getShipmentId(shipment)).slice(-10)}`
                                  : `SHP-${String(getShipmentId(shipment)).slice(-16)}`)
                              }
                            </strong>

                            <small>
                              {
                                formatDateTime(
                                  getDate(
                                    shipment
                                  )
                                )
                              }
                            </small>

                          </div>

                        </td>


                        {/* CARD */}

                        <td>

                          <div className="card-cell">

                            <div className="card-thumb">

                              <CardImage
                                shipment={shipment}
                                className="card-image-fill"
                                alt={getCardName(shipment)}
                              />

                            </div>


                            <div>

                              <strong>
                                {
                                  getCardName(
                                    shipment
                                  )
                                }
                              </strong>

                              <small>
                                #
                                {
                                  getCardNumber(
                                    shipment
                                  )
                                }
                              </small>

                              <span className="rarity">
                                {
                                  getRarity(
                                    shipment
                                  )
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* RECIPIENT */}

                        <td>

                          <div className="recipient">

                            <strong>
                              {
                                getUserName(
                                  shipment
                                )
                              }
                            </strong>

                            <small>
                              {
                                getUserEmail(
                                  shipment
                                )
                              }
                            </small>

                          </div>

                        </td>


                        {/* CARRIER */}

                        <td>

                          <strong className="carrier">
                            {
                              getCarrier(
                                shipment
                              )
                            }
                          </strong>

                        </td>


                        {/* TRACKING */}

                        <td>

                          <div className="tracking">

                            <strong>
                              {
                                getTrackingNumber(
                                  shipment
                                )
                              }
                            </strong>

                            {shipment?.trackingUrl && (

                              <a
                                href={
                                  shipment.trackingUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                Track Package
                              </a>

                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              statusClass(
                                getShippingStatus(
                                  shipment
                                )
                              )
                            }
                          >
                            <span className="status-dot" />

                            {
                              statusLabel(
                                getShippingStatus(
                                  shipment
                                )
                              )
                            }
                          </span>

                        </td>


                        {/* DATE */}

                        <td>

                          <span className="date-cell">
                            {
                              formatDate(
                                getDate(
                                  shipment
                                )
                              )
                            }
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="actions">

                            {actionAvailable ? (

                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    openAction(
                                      shipment,
                                      "approve"
                                    )
                                  }
                                >

                                  <Check
                                    size={14}
                                  />

                                  Approve

                                </button>


                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    openAction(
                                      shipment,
                                      "reject"
                                    )
                                  }
                                >

                                  <X
                                    size={14}
                                  />

                                  Reject

                                </button>
                              </>

                            ) : approved ? (

                              <span className="decision approved">
                                <CheckCircle2 size={14} />
                                Approved
                              </span>

                            ) : rejected ? (

                              <span className="decision rejected">
                                <Ban size={14} />
                                Rejected
                              </span>

                            ) : (

                              <span className="decision neutral">
                                No Action
                              </span>

                            )}


                            <button
                              className="details-btn"
                              onClick={() =>
                                setSelectedShipment(
                                  shipment
                                )
                              }
                            >

                              <Eye
                                size={14}
                              />

                              Details

                            </button>

                          </div>

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
            TABLE FOOTER
        ================================================= */}

        <div className="table-footer">

          <span>

            Showing{" "}

            {filteredShipments.length ===
            0
              ? 0
              : (page - 1) *
                  PAGE_SIZE +
                1}

            {" – "}

            {Math.min(
              page *
                PAGE_SIZE,
              filteredShipments.length
            )}

            {" "}
            of{" "}

            {
              filteredShipments.length
            }

          </span>


          <div className="pagination">

            <button
              disabled={
                page === 1
              }
              onClick={() =>
                setPage(
                  (value) =>
                    Math.max(
                      1,
                      value - 1
                    )
                )
              }
            >

              <ChevronLeft
                size={17}
              />

            </button>


            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) => {

                const pageNumber =
                  index + 1;

                return (

                  <button
                    key={
                      pageNumber
                    }
                    className={
                      pageNumber ===
                      page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPage(
                        pageNumber
                      )
                    }
                  >
                    {
                      pageNumber
                    }
                  </button>

                );
              }
            )}


            <button
              disabled={
                page ===
                totalPages
              }
              onClick={() =>
                setPage(
                  (value) =>
                    Math.min(
                      totalPages,
                      value + 1
                    )
                )
              }
            >

              <ChevronRight
                size={17}
              />

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          DETAILS POPUP
      ================================================= */}

      {selectedShipment && (

        <DetailsModal
          shipment={
            selectedShipment
          }
          onUpdated={handleShipmentUpdated}
          onClose={() =>
            setSelectedShipment(
              null
            )
          }
        />

      )}


      {/* =================================================
          APPROVE / REJECT POPUP
      ================================================= */}

      {actionShipment && (

        <ActionModal
          shipment={
            actionShipment
          }
          type={
            actionType
          }
          loading={
            actionLoading
          }
          onCancel={
            closeAction
          }
          onConfirm={
            handleAction
          }
        />

      )}


      {/* =================================================
          STYLES
      ================================================= */}

      <style>{CSS}</style>

    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  type,
}) {

  return (

    <div className="stat-card">

      <div>

        <div className="stat-title">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-subtitle">
          {subtitle}
        </div>

      </div>


      <div
        className={`stat-icon ${type}`}
      >
        {icon}
      </div>

    </div>
  );
}


// =====================================================
// DETAILS MODAL
// =====================================================

function DetailsModal({
  shipment,
  onClose,
  onUpdated,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    shipment?.status || "READY_TO_SHIP"
  );
  const [carrier, setCarrier] = useState(shipment?.carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(
    shipment?.trackingNumber || ""
  );
  const [trackingUrl, setTrackingUrl] = useState(
    shipment?.trackingUrl || ""
  );
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState(
    shipment?.estimatedDeliveryAt
      ? new Date(shipment.estimatedDeliveryAt).toISOString().slice(0, 10)
      : ""
  );
  const [notes, setNotes] = useState(shipment?.notes || "");
  const [failureReason, setFailureReason] = useState(
    shipment?.failureReason || ""
  );

  useEffect(() => {
    setSelectedStatus(shipment?.status || "READY_TO_SHIP");
    setCarrier(shipment?.carrier || "");
    setTrackingNumber(shipment?.trackingNumber || "");
    setTrackingUrl(shipment?.trackingUrl || "");
    setEstimatedDeliveryAt(
      shipment?.estimatedDeliveryAt
        ? new Date(shipment.estimatedDeliveryAt).toISOString().slice(0, 10)
        : ""
    );
    setNotes(shipment?.notes || "");
    setFailureReason(shipment?.failureReason || "");
    setError("");
  }, [shipment]);

  if (!shipment) return null;

  const image = getImage(shipment);
  const address = shipment?.shippingAddress || shipment?.recipient?.address || {};
  const isPendingRequest =
    shipment?.isRedemptionRequest ||
    normalizeStatus(shipment?.status) === "PENDING";

  const shipmentNumber =
    shipment?.shipmentNumber ||
    (isPendingRequest
      ? `REQ-${shipment?.redemptionNumber || String(getShipmentId(shipment)).slice(-10)}`
      : `SHP-${String(getShipmentId(shipment)).slice(-16)}`);

  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  const carrierOptions = [
    "FedEx",
    "DHL",
    "UPS",
    "Blue Dart",
    "Delhivery",
    "DTDC",
    "India Post",
    "Ekart",
    "Other",
  ];

  if (carrier && !carrierOptions.includes(carrier)) {
    carrierOptions.unshift(carrier);
  }

  async function handleUpdate() {
    if (isPendingRequest) {
      setError("Approve the shipping request first, then update shipment details.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();
      const response = await fetch(
        `${SHIPPING_API}/${getShipmentId(shipment)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            status: selectedStatus,
            carrier: carrier.trim(),
            trackingNumber: trackingNumber.trim(),
            trackingUrl: trackingUrl.trim(),
            estimatedDeliveryAt: estimatedDeliveryAt || null,
            notes: notes.trim(),
            failureReason: failureReason.trim(),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update shipment");
      }

      const updated = result.shipment || result.data?.shipment;
      if (updated && onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err?.message || "Unable to update shipment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="details-modal">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">SHIPMENT DETAILS</div>
            <h2>{shipmentNumber}</h2>
            <p>{formatDateTime(shipment.createdAt || shipment.requestedAt)}</p>
          </div>
          <button className="close-modal" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <DetailSection icon={<CreditCard size={16} />} title="Card Information">
            <div className="detail-card-layout">
              <div className="large-card-image">
                <CardImage
                  shipment={shipment}
                  className="large-card-image-fill"
                  alt={getCardName(shipment)}
                />
              </div>
              <div className="card-main-info">
                <h3>{getCardName(shipment)}</h3>
                <p>{getSetName(shipment)}</p>
                <span className="rarity purple">{getRarity(shipment)}</span>
                <div className="detail-grid">
                  <InfoItem label="Card Number" value={getCardNumber(shipment)} />
                  <InfoItem label="TCG ID" value={getTcgId(shipment)} />
                  <InfoItem label="Artist" value={getArtist(shipment)} />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection icon={<User size={16} />} title="Recipient Information">
            <div className="three-column">
              <InfoBox label="Name" value={getUserName(shipment)} />
              <InfoBox label="Email" value={getUserEmail(shipment)} />
              <InfoBox
                label="Phone"
                value={shipment?.phone || shipment?.recipient?.phone || address?.phone || "-"}
              />
            </div>
          </DetailSection>

          <DetailSection icon={<MapPin size={16} />} title="Delivery Address">
            <div className="address-box">
              <strong>{address?.fullName || getUserName(shipment)}</strong>
              <span>{address?.email || getUserEmail(shipment)}</span>
              <span>{address?.phone || "-"}</span>
              {addressLines.length ? (
                addressLines.map((line, index) => <span key={index}>{line}</span>)
              ) : (
                <span>No address available</span>
              )}
            </div>
          </DetailSection>

          <DetailSection icon={<Truck size={16} />} title="Shipping Information">
            {isPendingRequest && (
              <div className="pending-edit-notice">
                This is a pending shipping request. Approve it first to create the shipment and enable status, carrier and tracking updates.
              </div>
            )}

            <div className="shipping-edit-grid">
              <label className="edit-field">
                <span>Status</span>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  disabled={isPendingRequest || saving}
                >
                  <option value="READY_TO_SHIP">Ready to Ship</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="PACKED">Packed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="DELIVERY_FAILED">Delivery Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>

              <label className="edit-field">
                <span>Carrier</span>
                <select
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  disabled={isPendingRequest || saving}
                >
                  <option value="">Select Carrier</option>
                  {carrierOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="edit-field">
                <span>Shipment ID</span>
                <input value={shipmentNumber} readOnly />
              </label>

              <label className="edit-field">
                <span>Tracking Number</span>
                <input
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Enter tracking number"
                  disabled={isPendingRequest || saving}
                />
              </label>

              <label className="edit-field">
                <span>Estimated Delivery</span>
                <input
                  type="date"
                  value={estimatedDeliveryAt}
                  onChange={(event) => setEstimatedDeliveryAt(event.target.value)}
                  disabled={isPendingRequest || saving}
                />
              </label>
            </div>

            <label className="edit-field full-width-field">
              <span>Tracking URL</span>
              <input
                value={trackingUrl}
                onChange={(event) => setTrackingUrl(event.target.value)}
                placeholder="https://..."
                disabled={isPendingRequest || saving}
              />
            </label>

            <label className="edit-field full-width-field">
              <span>Notes</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Internal shipping notes..."
                disabled={isPendingRequest || saving}
              />
            </label>

            {selectedStatus === "DELIVERY_FAILED" && (
              <label className="edit-field full-width-field">
                <span>Failure Reason</span>
                <textarea
                  rows={2}
                  value={failureReason}
                  onChange={(event) => setFailureReason(event.target.value)}
                  placeholder="Why did delivery fail?"
                  disabled={isPendingRequest || saving}
                />
              </label>
            )}
          </DetailSection>

          <DetailSection icon={<Package size={16} />} title="Pack Information">
            <div className="three-column">
              <InfoBox label="Pack" value={getPackName(shipment)} />
              <InfoBox
                label="Market Value"
                value={
                  shipment?.marketPrice !== undefined && shipment?.marketPrice !== null
                    ? formatMoney(shipment.marketPrice, shipment?.card?.priceCurrency || "USD")
                    : "-"
                }
              />
              <InfoBox
                label="Shipping Fee"
                value={
                  shipment?.shippingFee !== undefined && shipment?.shippingFee !== null
                    ? formatMoney(shipment.shippingFee, shipment?.card?.priceCurrency || "USD")
                    : "-"
                }
              />
            </div>
          </DetailSection>

          <DetailSection icon={<CalendarDays size={16} />} title="Shipment Timeline">
            <div className="three-column">
              <InfoBox label="Created" value={formatDateTime(shipment.createdAt || shipment.requestedAt)} />
              <InfoBox label="Processing" value={formatDateTime(shipment.processingAt)} />
              <InfoBox label="Packed" value={formatDateTime(shipment.packedAt)} />
              <InfoBox label="Shipped" value={formatDateTime(shipment.shippedAt)} />
              <InfoBox label="Delivered" value={formatDateTime(shipment.deliveredAt)} />
              <InfoBox label="Failed" value={formatDateTime(shipment.deliveryFailedAt)} />
            </div>
          </DetailSection>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer-actions">
          <button className="details-footer-btn" onClick={onClose} disabled={saving}>Close</button>
          <button
            className="save-shipment-btn"
            onClick={handleUpdate}
            disabled={saving || isPendingRequest}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


function DetailSection({
  icon,
  title,
  children,
}) {

  return (

    <section className="detail-section">

      <div className="section-heading">

        {icon}

        <strong>
          {title}
        </strong>

      </div>

      <div className="section-content">

        {children}

      </div>

    </section>
  );
}


// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value,
}) {

  return (

    <div className="info-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "-"}
      </strong>

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

    <div className="info-box">

      <span>
        {label}
      </span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
}


// =====================================================
// ACTION MODAL
// =====================================================

function ActionModal({
  shipment,
  type,
  loading,
  onCancel,
  onConfirm,
}) {

  const approve =
    type === "approve";


  return (

    <div className="modal-overlay">

      <div className="action-modal">

        <div
          className={
            `action-icon ${
              approve
                ? "action-green"
                : "action-red"
            }`
          }
        >

          {approve ? (
            <CheckCircle2
              size={27}
            />
          ) : (
            <Ban
              size={27}
            />
          )}

        </div>


        <h2>

          {approve
            ? "Approve Shipping Request?"
            : "Reject Shipping Request?"}

        </h2>


        <p>

          {approve
            ? "Are you sure you want to approve this shipping request?"
            : "Are you sure you want to reject this shipping request?"}

        </p>


        <div className="action-card">

          <div className="action-card-image">

            <CardImage
              shipment={shipment}
              className="action-card-image-fill"
              alt={getCardName(shipment)}
            />

          </div>


          <div>

            <strong>
              {
                getCardName(
                  shipment
                )
              }
            </strong>

            <span>
              {
                getSetName(
                  shipment
                )
              }
            </span>

            <small>
              {
                getCardNumber(
                  shipment
                )
              }
            </small>

          </div>

        </div>


        <div className="action-buttons">

          <button
            className="cancel-action"
            onClick={
              onCancel
            }
            disabled={
              loading
            }
          >
            Cancel
          </button>


          <button
            className={
              approve
                ? "confirm-approve"
                : "confirm-reject"
            }
            onClick={
              onConfirm
            }
            disabled={
              loading
            }
          >

            {loading
              ? "Processing..."
              : approve
              ? "Approve Shipment"
              : "Reject Shipment"}

          </button>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// STATUS TEXT
// =====================================================

function statusText(
  status
) {

  return String(
    status ||
      "PENDING"
  )
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


// =====================================================
// CSS
// =====================================================

const CSS = `

* {
  box-sizing: border-box;
}

.shipping-page {
  width: 100%;
  min-height: 100%;
  padding: 38px 42px 50px;
  background: #f5f6f8;
  color: #101828;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* =====================================================
   HEADER
===================================================== */

.shipping-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
}

.eyebrow,
.modal-eyebrow {
  color: #147fe8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 7px;
}

.shipping-header h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.7px;
}

.shipping-header p {
  margin: 8px 0 0;
  color: #718096;
  font-size: 14px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 17px;
  border: 1px solid #e0e4e9;
  background: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(16,24,40,.05);
}

.refresh-btn:hover {
  background: #f9fafb;
}

.refresh-btn:disabled {
  opacity: .65;
  cursor: default;
}


/* =====================================================
   STATS
===================================================== */

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  min-height: 130px;
  padding: 20px;
  border-radius: 15px;
  border: 1px solid #e1e5ea;
  background: #fff;
  box-shadow:
    0 1px 3px rgba(16,24,40,.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.stat-title {
  max-width: 180px;
  color: #687386;
  font-size: 9px;
  line-height: 1.55;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.stat-value {
  margin-top: 11px;
  font-size: 29px;
  line-height: 1;
  font-weight: 800;
  color: #101828;
}

.stat-subtitle {
  margin-top: 7px;
  color: #8993a2;
  font-size: 12px;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  color: #087ff5;
  background: #eaf4ff;
}

.stat-icon.green {
  color: #16a34a;
  background: #eaf9ef;
}

.stat-icon.purple {
  color: #8b5cf6;
  background: #f0eaff;
}

.stat-icon.red {
  color: #ef4444;
  background: #ffeded;
}


/* =====================================================
   FILTERS
===================================================== */

.filter-box {
  display: grid;
  grid-template-columns:
    minmax(260px, 1fr)
    130px
    130px
    auto
    72px
    62px;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e2e6eb;
  border-radius: 15px;
  background: #fff;
  box-shadow:
    0 1px 3px rgba(16,24,40,.05);
  margin-bottom: 9px;
}

.search-wrapper {
  height: 42px;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  color: #8b95a4;
  background: #fff;
}

.search-wrapper input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #111827;
}

.search-wrapper input::placeholder {
  color: #9aa3af;
}

.filter-box select {
  height: 42px;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  padding: 0 11px;
  background: #fff;
  color: #202938;
  font-size: 12px;
  font-weight: 600;
  outline: none;
}

.date-range {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  background: #fff;
}

.date-range input {
  width: 122px;
  border: 0;
  outline: none;
  background: transparent;
  color: #273244;
  font-size: 11px;
}

.date-range span {
  color: #7c8795;
}

.apply-btn {
  height: 42px;
  border: 0;
  border-radius: 9px;
  background: #1685e8;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.apply-btn:hover {
  background: #0877d9;
}

.clear-btn {
  height: 42px;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  background: #fff;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.clear-btn:hover {
  background: #f7f8fa;
}

.filter-info {
  margin: 8px 0 10px;
  color: #7a8595;
  font-size: 11px;
}

.filter-info strong {
  color: #273244;
}

.error-box {
  padding: 12px 15px;
  margin: 10px 0;
  border: 1px solid #fecaca;
  border-radius: 9px;
  color: #b91c1c;
  background: #fff1f2;
  font-size: 12px;
}


/* =====================================================
   TABLE
===================================================== */

.table-card {
  border: 1px solid #e1e5ea;
  border-radius: 15px;
  background: #fff;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(16,24,40,.06);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1250px;
  border-collapse: collapse;
}

thead {
  background: #fbfcfd;
}

th {
  height: 45px;
  padding: 0 14px;
  border-bottom: 1px solid #e5e8ec;
  color: #697586;
  text-align: left;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

td {
  height: 88px;
  padding: 11px 14px;
  border-bottom: 1px solid #edf0f3;
  vertical-align: middle;
  font-size: 12px;
}

tbody tr:hover {
  background: #fcfdff;
}

.empty-cell {
  height: 150px;
  text-align: center;
  color: #8b95a4;
}


/* =====================================================
   TABLE CELLS
===================================================== */

.shipment-id {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.shipment-id strong {
  color: #182230;
  font-size: 11px;
}

.shipment-id small {
  color: #8c96a4;
  font-size: 9px;
}

.card-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.card-thumb {
  width: 42px;
  height: 58px;
  flex: 0 0 42px;
  border-radius: 7px;
  border: 1px solid #e0e4e9;
  background: #f3f5f7;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a8b2;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-cell > div:last-child {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.card-cell strong {
  color: #1b2533;
  font-size: 11px;
  font-weight: 750;
}

.card-cell small {
  color: #7e8997;
  font-size: 9px;
}

.rarity {
  display: inline-flex;
  padding: 3px 6px;
  border-radius: 20px;
  background: #f0e7ff;
  color: #7c3aed;
  font-size: 8px;
  font-weight: 700;
}

.recipient {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recipient strong {
  color: #182230;
  font-size: 11px;
}

.recipient small {
  color: #8993a2;
  font-size: 9px;
}

.carrier {
  color: #263241;
  font-size: 11px;
}

.tracking {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tracking strong {
  font-size: 10px;
  color: #293443;
}

.tracking a {
  color: #1685e8;
  font-size: 9px;
  text-decoration: none;
  font-weight: 650;
}

.tracking a:hover {
  text-decoration: underline;
}

.date-cell {
  color: #4d5968;
  font-size: 10px;
  white-space: nowrap;
}


/* =====================================================
   STATUS
===================================================== */

.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 8px;
  font-weight: 800;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status.ready {
  color: #c47b00;
  background: #fff3d8;
}

.status.pending {
  color: #087ce6;
  background: #eaf4ff;
}

.status.processing {
  color: #6d28d9;
  background: #f0e9ff;
}

.status.shipped {
  color: #2563eb;
  background: #eaf1ff;
}

.status.delivered {
  color: #12924a;
  background: #e7f8ee;
}

.status.rejected,
.status.failed {
  color: #dc2626;
  background: #ffeaea;
}


/* =====================================================
   ACTIONS
===================================================== */

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 31px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.approve-btn {
  color: #12924a;
  border: 1px solid #b8efd0;
  background: #f4fff8;
}

.approve-btn:hover {
  background: #e9faef;
}

.reject-btn {
  color: #dc2626;
  border: 1px solid #fecaca;
  background: #fff7f7;
}

.reject-btn:hover {
  background: #ffeded;
}

.details-btn {
  color: #344054;
  border: 1px solid #dfe4ea;
  background: #fff;
}

.details-btn:hover {
  background: #f7f8fa;
}

.decision {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 8px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 750;
}

.decision.approved {
  color: #12924a;
  background: #eaf9ef;
}

.decision.rejected {
  color: #dc2626;
  background: #ffeded;
}


/* =====================================================
   FOOTER
===================================================== */

.table-footer {
  min-height: 55px;
  padding: 0 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7d8795;
  font-size: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination button {
  width: 29px;
  height: 29px;
  border: 1px solid #e0e4e9;
  border-radius: 7px;
  background: #fff;
  color: #4b5563;
  font-size: 10px;
  cursor: pointer;
}

.pagination button.active {
  border-color: #1685e8;
  background: #1685e8;
  color: #fff;
}

.pagination button:disabled {
  opacity: .4;
  cursor: default;
}


/* =====================================================
   MODAL
===================================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, .56);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
}

.details-modal {
  width: min(900px, 96vw);
  max-height: 90vh;
  overflow: hidden;
  border-radius: 17px;
  background: #fff;
  box-shadow:
    0 24px 70px rgba(0,0,0,.24);
  display: flex;
  flex-direction: column;
}

.modal-header {
  min-height: 92px;
  padding: 19px 23px;
  border-bottom: 1px solid #e7eaee;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -.3px;
}

.modal-header p {
  margin: 5px 0 0;
  color: #8a94a3;
  font-size: 10px;
}

.close-modal {
  width: 35px;
  height: 35px;
  border: 0;
  border-radius: 9px;
  background: #f1f3f5;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-modal:hover {
  background: #e9ecef;
}

.modal-body {
  overflow-y: auto;
  padding: 18px 22px 25px;
  background: #fafbfc;
}


/* =====================================================
   DETAIL SECTIONS
===================================================== */

.detail-section {
  margin-bottom: 14px;
  border: 1px solid #e0e5ea;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.section-heading {
  min-height: 43px;
  padding: 0 16px;
  border-bottom: 1px solid #e7eaee;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #182230;
  font-size: 12px;
}

.section-heading svg {
  color: #1685e8;
}

.section-content {
  padding: 16px;
}


/* =====================================================
   CARD DETAIL
===================================================== */

.detail-card-layout {
  display: flex;
  gap: 17px;
}

.large-card-image {
  width: 135px;
  height: 190px;
  flex: 0 0 135px;
  border: 1px solid #e0e4e9;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.large-card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.card-main-info {
  flex: 1;
}

.card-main-info h3 {
  margin: 1px 0 5px;
  font-size: 18px;
}

.card-main-info p {
  margin: 0 0 8px;
  color: #7c8795;
  font-size: 11px;
}

.purple {
  margin-bottom: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.info-item {
  min-height: 63px;
  padding: 10px;
  border: 1px solid #e5e8ec;
  border-radius: 9px;
  background: #fff;
}

.info-item span {
  display: block;
  margin-bottom: 7px;
  color: #8b95a4;
  font-size: 8px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .6px;
}

.info-item strong {
  color: #273244;
  font-size: 11px;
  word-break: break-word;
}


/* =====================================================
   INFO BOXES
===================================================== */

.three-column {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 11px;
}

.info-box {
  min-height: 62px;
  padding: 11px;
  border: 1px solid #e4e8ed;
  border-radius: 9px;
  background: #fff;
}

.info-box span {
  display: block;
  margin-bottom: 7px;
  color: #8b95a4;
  font-size: 8px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .6px;
}

.info-box strong {
  color: #293443;
  font-size: 11px;
  word-break: break-word;
}

.shipping-detail-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 11px;
}

.small-status {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 20px;
  background: #fff2d8;
  color: #bd7600;
  font-size: 8px;
  font-weight: 800;
}

.small-status.green {
  color: #12924a;
  background: #e8f9ee;
}

.tracking-link-box {
  margin-top: 11px;
  padding: 11px;
  border: 1px solid #e4e8ed;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tracking-link-box span {
  color: #8b95a4;
  font-size: 8px;
  font-weight: 750;
  text-transform: uppercase;
}

.tracking-link-box a {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #1685e8;
  font-size: 10px;
  text-decoration: none;
  word-break: break-all;
}

.address-box,
.notes-box {
  padding: 13px;
  border: 1px solid #e4e8ed;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #596575;
  font-size: 11px;
}

.address-box strong {
  color: #202938;
  margin-bottom: 2px;
}

.notes-box {
  line-height: 1.6;
}


/* =====================================================
   ACTION MODAL
===================================================== */

.action-modal {
  width: min(430px, 94vw);
  border-radius: 16px;
  background: #fff;
  padding: 25px;
  box-shadow:
    0 25px 70px rgba(0,0,0,.25);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.action-green {
  color: #16a34a;
  background: #eaf9ef;
}

.action-red {
  color: #dc2626;
  background: #ffeded;
}

.action-modal h2 {
  margin: 0;
  font-size: 19px;
}

.action-modal > p {
  margin: 7px 0 18px;
  color: #788394;
  font-size: 12px;
  line-height: 1.5;
}

.action-card {
  padding: 12px;
  border: 1px solid #e3e7eb;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 19px;
}

.action-card-image {
  width: 43px;
  height: 57px;
  border-radius: 6px;
  overflow: hidden;
  background: #f2f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.action-card-image img,
.action-card-image-fill {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.action-card > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.action-card strong {
  font-size: 11px;
}

.action-card span,
.action-card small {
  color: #818b98;
  font-size: 9px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-buttons button {
  height: 38px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-action {
  border: 1px solid #dfe4e9;
  background: #fff;
  color: #4b5563;
}

.confirm-approve {
  border: 0;
  color: #fff;
  background: #16a34a;
}

.confirm-reject {
  border: 0;
  color: #fff;
  background: #ef4444;
}

.action-buttons button:disabled {
  opacity: .6;
  cursor: default;
}


/* =====================================================
   EDITABLE SHIPPING DETAILS
===================================================== */

.shipping-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.edit-field span {
  color: #7b8795;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.edit-field input,
.edit-field select,
.edit-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  background: #fff;
  color: #273244;
  font-size: 11px;
  font-weight: 600;
  outline: none;
  padding: 10px 11px;
}

.edit-field textarea {
  resize: vertical;
}

.edit-field input:focus,
.edit-field select:focus,
.edit-field textarea:focus {
  border-color: #1685e8;
}

.edit-field input:disabled,
.edit-field select:disabled,
.edit-field textarea:disabled {
  background: #f5f6f7;
  cursor: not-allowed;
}

.full-width-field {
  width: 100%;
}

.pending-edit-notice {
  margin-bottom: 12px;
  padding: 11px 12px;
  border: 1px solid #fed7aa;
  border-radius: 9px;
  background: #fff7ed;
  color: #9a5b00;
  font-size: 10px;
  line-height: 1.5;
}

.modal-error {
  margin: 0 22px 12px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 10px;
  font-weight: 700;
}

.modal-footer-actions {
  display: flex;
  gap: 9px;
  padding: 13px 22px;
  border-top: 1px solid #e7eaee;
  background: #fff;
}

.details-footer-btn,
.save-shipment-btn {
  min-width: 120px;
  height: 38px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.details-footer-btn {
  border: 1px solid #dfe4ea;
  background: #fff;
  color: #4b5563;
}

.save-shipment-btn {
  border: 0;
  background: #1685e8;
  color: #fff;
}

.save-shipment-btn:disabled,
.details-footer-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.card-image-fill,
.large-card-image-fill {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1350px) {

  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .filter-box {
    grid-template-columns:
      1fr
      130px
      130px
      auto
      72px
      62px;
  }

}

@media (max-width: 900px) {

  .shipping-page {
    padding: 25px 20px;
  }

  .shipping-header {
    gap: 15px;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-box {
    grid-template-columns:
      1fr 1fr;
  }

  .date-range {
    grid-column: span 2;
  }

  .three-column,
  .shipping-detail-grid,
  .detail-grid {
    grid-template-columns:
      1fr;
  }

}

@media (max-width: 600px) {

  .shipping-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-box {
    grid-template-columns: 1fr;
  }

  .date-range {
    grid-column: auto;
  }

  .modal-overlay {
    padding: 8px;
  }

  .details-modal {
    max-height: 96vh;
  }

  .detail-card-layout {
    flex-direction: column;
  }

  .shipping-edit-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer-actions {
    flex-direction: column;
  }

  .details-footer-btn,
  .save-shipment-btn {
    width: 100%;
  }

}


/* =====================================================
   ANIMATION
===================================================== */

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {

  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }

}
`;
