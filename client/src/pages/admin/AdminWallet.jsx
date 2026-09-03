import { useEffect, useState } from "react";

import {
  Check,
  X,
  Loader2,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  CalendarDays,
} from "lucide-react";


// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// ADMIN WALLET
// =====================================================

export default function AdminWallet() {

  // ===================================================
  // REQUESTS
  // ===================================================

  const [requests, setRequests] =
    useState([]);

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] =
    useState(false);

  const [processing, setProcessing] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  // ===================================================
  // FILTERS
  // ===================================================

  const [type, setType] =
    useState("ALL");

  const [status, setStatus] =
    useState("ALL");

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] =
    useState("");

  // ===================================================
  // PAGINATION
  // ===================================================

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  // ===================================================
  // SELECTED REQUEST
  // ===================================================

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  // ===================================================
  // ADMIN SUMMARY
  // ===================================================

  const [adminSummary, setAdminSummary] =
    useState({
      adminBalance: 0,
      totalAdminFees: 0,
      totalSellAmount: 0,
      totalShippingFees: 0,
      totalPending: 0,

      counts: {
        adminFeeTransactions: 0,
        sellTransactions: 0,
        shippingTransactions: 0,
        pendingTransactions: 0,
      },
    });


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {

    return localStorage.getItem(
      "adminToken"
    );
  };


  // =====================================================
  // FETCH ADMIN WALLET SUMMARY
  // =====================================================

  const fetchAdminSummary = async () => {

    try {

      const token =
        getToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/wallet/summary`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.message ||
          "Unable to load admin wallet summary"
        );
      }

      setAdminSummary(
        result.data || {
          adminBalance: 0,
          totalAdminFees: 0,
          totalSellAmount: 0,
          totalShippingFees: 0,
          totalPending: 0,

          counts: {
            adminFeeTransactions: 0,
            sellTransactions: 0,
            shippingTransactions: 0,
            pendingTransactions: 0,
          },
        }
      );

    } catch (error) {

      console.error(
        "Admin wallet summary error:",
        error
      );
    }
  };


  // =====================================================
  // FETCH WALLET REQUESTS
  // =====================================================

  const fetchRequests = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);
      }

      setError("");

      const token =
        getToken();

      if (!token) {

        throw new Error(
          "Admin authentication token not found. Please login again."
        );
      }

      // ================================================
      // QUERY PARAMS
      // ================================================

      const params =
        new URLSearchParams();

      params.append(
        "status",
        status
      );

      params.append(
        "type",
        type
      );

      params.append(
        "page",
        pagination.page
      );

      params.append(
        "limit",
        pagination.limit
      );

      // ================================================
      // REQUEST
      // ================================================

      const response =
        await fetch(
          `${API_URL}/api/admin/wallet/requests?${params.toString()}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.message ||
          "Unable to load wallet requests"
        );
      }

      // ================================================
      // REQUESTS
      // ================================================

      setRequests(
        result.data?.requests ||
        []
      );

      // ================================================
      // PAGINATION
      // ================================================

      if (
        result.data?.pagination
      ) {

        setPagination(
          result.data.pagination
        );
      }

      // ================================================
      // ADMIN SUMMARY
      // ================================================

      await fetchAdminSummary();

    } catch (error) {

      console.error(
        "Wallet requests error:",
        error
      );

      setError(
        error.message ||
        "Unable to load wallet requests"
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

    fetchRequests();

  }, [
    type,
    status,
    pagination.page,
  ]);


  // =====================================================
  // REFRESH
  // =====================================================

  const refreshRequests =
    async () => {

      await fetchRequests(
        true
      );

      await fetchAdminSummary();
    };


  // =====================================================
  // FILTER TYPE
  // =====================================================

  const handleTypeChange = (
    selectedType
  ) => {

    setType(
      selectedType
    );

    setPagination(
      (previous) => ({
        ...previous,
        page: 1,
      })
    );
  };


  // =====================================================
  // FILTER STATUS
  // =====================================================

  const handleStatusChange = (
    selectedStatus
  ) => {

    setStatus(
      selectedStatus
    );

    setPagination(
      (previous) => ({
        ...previous,
        page: 1,
      })
    );
  };


  // =====================================================
  // APPROVE REQUEST
  // =====================================================

  const approveRequest =
    async (request) => {

      // ================================================
      // AUTOMATIC TRANSACTIONS
      // ================================================

      if (
        [
          "SELL",
          "ADMIN_FEE",
          "SHIPPING",
        ].includes(
          request.type
        )
      ) {

        alert(
          `${request.type} transactions are automatically approved.`
        );

        return;
      }

      // ================================================
      // CONFIRM
      // ================================================

      const confirmed =
        window.confirm(
          `Are you sure you want to approve this ${request.type.toLowerCase()} request for $${Number(
            request.amount || 0
          ).toFixed(2)}?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setProcessing(
          request._id
        );

        const token =
          getToken();

        if (!token) {

          throw new Error(
            "Admin authentication token not found. Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/admin/wallet/requests/${request._id}/approve`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to approve wallet request"
          );
        }

        alert(
          result.message ||
          "Wallet request approved successfully"
        );

        await fetchRequests(
          true
        );

      } catch (error) {

        console.error(
          "Approve wallet request error:",
          error
        );

        alert(
          error.message ||
          "Unable to approve wallet request"
        );

      } finally {

        setProcessing(
          null
        );
      }
    };


  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const rejectRequest =
    async (request) => {

      // ================================================
      // AUTOMATIC TRANSACTIONS
      // ================================================

      if (
        [
          "SELL",
          "ADMIN_FEE",
          "SHIPPING",
        ].includes(
          request.type
        )
      ) {

        alert(
          `${request.type} transactions cannot be rejected manually.`
        );

        return;
      }

      // ================================================
      // REASON
      // ================================================

      const rejectionReason =
        window.prompt(
          "Enter rejection reason:"
        );

      if (
        rejectionReason ===
        null
      ) {

        return;
      }

      const reason =
        rejectionReason.trim();

      if (!reason) {

        alert(
          "Please enter a rejection reason."
        );

        return;
      }

      try {

        setProcessing(
          request._id
        );

        const token =
          getToken();

        if (!token) {

          throw new Error(
            "Admin authentication token not found. Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/admin/wallet/requests/${request._id}/reject`,
            {
              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  rejectionReason:
                    reason,
                }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to reject wallet request"
          );
        }

        alert(
          result.message ||
          "Wallet request rejected successfully"
        );

        await fetchRequests(
          true
        );

      } catch (error) {

        console.error(
          "Reject wallet request error:",
          error
        );

        alert(
          error.message ||
          "Unable to reject wallet request"
        );

      } finally {

        setProcessing(
          null
        );
      }
    };


  // =====================================================
  // PAGINATION
  // =====================================================

  const previousPage =
    () => {

      if (
        pagination.page <=
        1
      ) {

        return;
      }

      setPagination(
        (previous) => ({
          ...previous,

          page:
            previous.page -
            1,
        })
      );
    };


  const nextPage =
    () => {

      if (
        pagination.page >=
        pagination.totalPages
      ) {

        return;
      }

      setPagination(
        (previous) => ({
          ...previous,

          page:
            previous.page +
            1,
        })
      );
    };


  // =====================================================
  // HELPERS
  // =====================================================

  const formatAmount =
    (amount) => {

      return `$${Number(
        amount || 0
      ).toFixed(2)}`;
    };


  const formatDate =
    (date) => {

      if (!date) {
        return "-";
      }

      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "-";
      }

      return parsedDate.toLocaleString();
    };


  const getStatusClass =
    (requestStatus) => {

      if (
        requestStatus ===
        "PENDING"
      ) {

        return "bg-yellow-100 text-yellow-700";
      }

      if (
        requestStatus ===
        "APPROVED"
      ) {

        return "bg-green-100 text-green-700";
      }

      if (
        requestStatus ===
        "REJECTED"
      ) {

        return "bg-red-100 text-red-700";
      }

      return "bg-gray-100 text-gray-600";
    };


  // =====================================================
  // TYPE CLASS
  // =====================================================

  const getTypeClass =
    (transactionType) => {

      switch (
        transactionType
      ) {

        case "DEPOSIT":

          return "bg-green-100 text-green-700";

        case "SELL":

          return "bg-blue-100 text-blue-700";

        case "ADMIN_FEE":

          return "bg-purple-100 text-purple-700";

        case "SHIPPING":

          return "bg-orange-100 text-orange-700";

        case "WITHDRAWAL":

          return "bg-red-100 text-red-700";

        default:

          return "bg-gray-100 text-gray-600";
      }
    };


  // =====================================================
  // TYPE ICON
  // =====================================================

  const getTypeIcon =
    (transactionType) => {

      if (
        transactionType ===
        "DEPOSIT"
      ) {

        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">

            <ArrowDownToLine
              size={16}
              className="text-green-600"
            />

          </div>
        );
      }


      if (
        transactionType ===
        "SELL"
      ) {

        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">

            <ArrowDownToLine
              size={16}
              className="text-blue-600"
            />

          </div>
        );
      }


      if (
        transactionType ===
        "ADMIN_FEE"
      ) {

        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">

            <Wallet
              size={16}
              className="text-purple-600"
            />

          </div>
        );
      }


      if (
        transactionType ===
        "SHIPPING"
      ) {

        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">

            <ArrowUpFromLine
              size={16}
              className="text-orange-600"
            />

          </div>
        );
      }


      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">

          <ArrowUpFromLine
            size={16}
            className="text-red-600"
          />

        </div>
      );
    };


  // =====================================================
  // SUMMARY COUNTS
  // =====================================================

  const pendingCount =
    requests.filter(
      (request) =>
        request.status ===
        "PENDING"
    ).length;


  const approvedCount =
    requests.filter(
      (request) =>
        request.status ===
        "APPROVED"
    ).length;


  const rejectedCount =
    requests.filter(
      (request) =>
        request.status ===
        "REJECTED"
    ).length;


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

              <Wallet
                size={22}
              />

            </div>


            <div>

              <h1 className="text-2xl font-bold">
                Wallet Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage wallet transactions,
                card sales, fees, and shipping
                charges.
              </p>

            </div>

          </div>

        </div>


        <button
          onClick={
            refreshRequests
          }
          disabled={
            loading ||
            refreshing
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <RefreshCw
            size={17}
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

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

        </div>

      )}


      {/* =================================================
          ADMIN EARNINGS SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Admin Fees Earned"
          value={formatAmount(
            adminSummary.totalAdminFees
          )}
          icon={
            <Wallet
              size={21}
            />
          }
        />


        <SummaryCard
          title="Card Sales"
          value={formatAmount(
            adminSummary.totalSellAmount
          )}
          icon={
            <ArrowDownToLine
              size={21}
            />
          }
        />


        <SummaryCard
          title="Shipping Fees"
          value={formatAmount(
            adminSummary.totalShippingFees
          )}
          icon={
            <ArrowUpFromLine
              size={21}
            />
          }
        />


        <SummaryCard
          title="Total Transactions"
          value={pagination.total}
          icon={
            <RefreshCw
              size={21}
            />
          }
        />

      </div>


      {/* =================================================
          ADDITIONAL COUNTS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          title="Pending"
          value={pendingCount}
          icon={
            <Clock3
              size={21}
            />
          }
        />


        <SummaryCard
          title="Approved"
          value={approvedCount}
          icon={
            <CheckCircle2
              size={21}
            />
          }
        />


        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          icon={
            <XCircle
              size={21}
            />
          }
        />

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">


          {/* =============================================
              TYPE
          ============================================= */}

          <div>

            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Transaction Type
            </p>


            <div className="flex flex-wrap gap-2">

              {[
                "ALL",
                "DEPOSIT",
                "WITHDRAWAL",
                "SELL",
                "ADMIN_FEE",
                "SHIPPING",
              ].map(
                (item) => (

                  <button
                    key={item}
                    onClick={() =>
                      handleTypeChange(
                        item
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      type === item
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >

                    {item}

                  </button>

                )
              )}

            </div>

          </div>


          {/* =============================================
              STATUS
          ============================================= */}

          <div>

            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Status
            </p>


            <div className="flex flex-wrap gap-2">

              {[
                "ALL",
                "PENDING",
                "APPROVED",
                "REJECTED",
              ].map(
                (item) => (

                  <button
                    key={item}
                    onClick={() =>
                      handleStatusChange(
                        item
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      status === item
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >

                    {item}

                  </button>

                )
              )}

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="border-b bg-gray-50">

              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">

                <th className="px-6 py-4">
                  User
                </th>

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Amount
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y">

              {/* =========================================
                  LOADING
              ========================================= */}

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >

                    <div className="flex flex-col items-center justify-center">

                      <Loader2
                        size={28}
                        className="animate-spin text-gray-500"
                      />

                      <p className="mt-3 text-sm text-gray-500">
                        Loading wallet transactions...
                      </p>

                    </div>

                  </td>

                </tr>

              ) : requests.length === 0 ? (

                /* =========================================
                   EMPTY
                ========================================= */

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <Wallet
                        size={34}
                        className="text-gray-300"
                      />

                      <p className="mt-3 font-semibold text-gray-600">
                        No wallet transactions found.
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Try changing the filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                /* =========================================
                   REQUESTS
                ========================================= */

                requests.map(
                  (request) => {

                    const isProcessing =
                      processing ===
                      request._id;


                    const automaticTransaction =
                      [
                        "SELL",
                        "ADMIN_FEE",
                        "SHIPPING",
                      ].includes(
                        request.type
                      );


                    return (

                      <tr
                        key={
                          request._id
                        }
                        className="hover:bg-gray-50"
                      >

                        {/* =================================
                            USER
                        ================================= */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                              <User
                                size={18}
                                className="text-gray-500"
                              />

                            </div>


                            <div>

                              <p className="font-semibold">

                                {request.user
                                  ?.name ||
                                  "Unknown User"}

                              </p>


                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">

                                <Mail
                                  size={12}
                                />

                                {request.user
                                  ?.email ||
                                  "-"}

                              </p>


                              {(request.user
                                ?.mobile ||
                                request.user
                                  ?.phone) && (

                                <p className="mt-1 text-xs text-gray-400">

                                  {request.user
                                    ?.mobile ||
                                    request.user
                                      ?.phone}

                                </p>

                              )}

                            </div>

                          </div>

                        </td>


                        {/* =================================
                            TYPE
                        ================================= */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            {getTypeIcon(
                              request.type
                            )}


                            <div>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getTypeClass(
                                  request.type
                                )}`}
                              >
                                {request.type}
                              </span>


                              {request.type ===
                                "ADMIN_FEE" && (

                                <p className="mt-1 text-[10px] text-gray-400">
                                  Platform fee
                                </p>

                              )}


                              {request.type ===
                                "SELL" && (

                                <p className="mt-1 text-[10px] text-gray-400">
                                  Card sale
                                </p>

                              )}


                              {request.type ===
                                "SHIPPING" && (

                                <p className="mt-1 text-[10px] text-gray-400">
                                  Shipping charge
                                </p>

                              )}

                            </div>

                          </div>

                        </td>


                        {/* =================================
                            AMOUNT
                        ================================= */}

                        <td className="px-6 py-4">

                          <span
                            className={`font-bold ${
                              request.type ===
                                "ADMIN_FEE" ||
                              request.type ===
                                "SELL"
                                ? "text-green-600"
                                : request.type ===
                                  "SHIPPING" ||
                                  request.type ===
                                  "WITHDRAWAL"
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >

                            {formatAmount(
                              request.amount
                            )}

                          </span>

                        </td>


                        {/* =================================
                            STATUS
                        ================================= */}

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusClass(
                              request.status
                            )}`}
                          >

                            {
                              request.status
                            }

                          </span>

                        </td>


                        {/* =================================
                            DATE
                        ================================= */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2 text-xs text-gray-500">

                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              request.createdAt
                            )}

                          </div>

                        </td>


                        {/* =================================
                            ACTIONS
                        ================================= */}

                        <td className="px-6 py-4">

                          {request.status ===
                            "PENDING" &&
                          !automaticTransaction ? (

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  approveRequest(
                                    request
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {isProcessing ? (

                                  <Loader2
                                    size={
                                      14
                                    }
                                    className="animate-spin"
                                  />

                                ) : (

                                  <Check
                                    size={
                                      14
                                    }
                                  />

                                )}

                                Approve

                              </button>


                              <button
                                onClick={() =>
                                  rejectRequest(
                                    request
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {isProcessing ? (

                                  <Loader2
                                    size={
                                      14
                                    }
                                    className="animate-spin"
                                  />

                                ) : (

                                  <X
                                    size={
                                      14
                                    }
                                  />

                                )}

                                Reject

                              </button>

                            </div>

                          ) : (

                            <div className="flex justify-end">

                              <button
                                onClick={() =>
                                  setSelectedRequest(
                                    request
                                  )
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                              >
                                View Details
                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading &&
        pagination.totalPages > 0 && (

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-gray-500">

            Page{" "}

            <span className="font-bold text-gray-900">

              {pagination.page}

            </span>

            {" "}of{" "}

            <span className="font-bold text-gray-900">

              {pagination.totalPages}

            </span>

            {" · "}

            {pagination.total}
            {" "}total transactions

          </p>


          <div className="flex gap-2">

            <button
              onClick={
                previousPage
              }
              disabled={
                pagination.page <=
                1
              }
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>


            <button
              onClick={
                nextPage
              }
              disabled={
                pagination.page >=
                pagination.totalPages
              }
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedRequest && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedRequest(
              null
            )
          }
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ===========================================
                MODAL HEADER
            =========================================== */}

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Transaction Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Wallet transaction information
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedRequest(
                    null
                  )
                }
                className="rounded-lg p-2 hover:bg-gray-100"
              >

                <X
                  size={19}
                />

              </button>

            </div>


            {/* ===========================================
                DETAILS
            =========================================== */}

            <div className="mt-6 space-y-4">

              <DetailRow
                label="Transaction ID"
                value={
                  selectedRequest._id
                }
              />


              <DetailRow
                label="User"
                value={
                  selectedRequest
                    .user?.name ||
                  "-"
                }
              />


              <DetailRow
                label="Email"
                value={
                  selectedRequest
                    .user?.email ||
                  "-"
                }
              />


              <DetailRow
                label="Mobile"
                value={
                  selectedRequest
                    .user?.mobile ||
                  selectedRequest
                    .user?.phone ||
                  "-"
                }
              />


              <DetailRow
                label="Type"
                value={
                  selectedRequest.type
                }
              />


              <DetailRow
                label="Amount"
                value={
                  formatAmount(
                    selectedRequest.amount
                  )
                }
              />


              <DetailRow
                label="Status"
                value={
                  selectedRequest.status
                }
              />


              <DetailRow
                label="Created At"
                value={
                  formatDate(
                    selectedRequest.createdAt
                  )
                }
              />


              {selectedRequest.note && (

                <DetailRow
                  label="Note"
                  value={
                    selectedRequest.note
                  }
                />

              )}


              {selectedRequest.rejectionReason && (

                <DetailRow
                  label="Rejection Reason"
                  value={
                    selectedRequest.rejectionReason
                  }
                />

              )}


              {selectedRequest.processedAt && (

                <DetailRow
                  label="Processed At"
                  value={
                    formatDate(
                      selectedRequest.processedAt
                    )
                  }
                />

              )}


              {selectedRequest.processedBy && (

                <DetailRow
                  label="Processed By"
                  value={
                    selectedRequest
                      .processedBy
                      ?.name ||
                    selectedRequest
                      .processedBy
                      ?.email ||
                    "-"
                  }
                />

              )}


              {/* =========================================
                  AUTOMATIC TRANSACTION INFORMATION
              ========================================= */}

              {selectedRequest.type ===
                "ADMIN_FEE" && (

                <div className="rounded-xl bg-purple-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                    Platform Revenue
                  </p>

                  <p className="mt-1 text-sm font-semibold text-purple-800">
                    This is the 20% platform fee from a card sale.
                  </p>

                </div>

              )}


              {selectedRequest.type ===
                "SELL" && (

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                    Card Sale
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    The user received 80% of the card's market value.
                  </p>

                </div>

              )}


              {selectedRequest.type ===
                "SHIPPING" && (

                <div className="rounded-xl bg-orange-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
                    Shipping
                  </p>

                  <p className="mt-1 text-sm font-semibold text-orange-800">
                    $5 shipping fee charged to the user.
                  </p>

                </div>

              )}

            </div>


            {/* ===========================================
                CLOSE
            =========================================== */}

            <button
              onClick={() =>
                setSelectedRequest(
                  null
                )
              }
              className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Close
            </button>

          </div>

        </div>

      )}

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

    <div className="rounded-2xl bg-white p-5 shadow-sm">

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
// DETAIL ROW
// =====================================================

function DetailRow({
  label,
  value,
}) {

  return (

    <div className="flex items-start justify-between gap-5 border-b border-gray-100 pb-3">

      <span className="text-sm font-semibold text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] break-all text-right text-sm font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}