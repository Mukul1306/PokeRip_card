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
} from "lucide-react";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function AdminOrders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

  const [selectedOrder, setSelectedOrder] =
    useState(null);


  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );


      const params =
        new URLSearchParams({
          page,
          limit: 20,
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


      const response =
        await fetch(
          `${API_URL}/api/admin/orders?${params.toString()}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load orders"
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

    } catch (error) {

      console.error(
        "Orders error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchOrders();
  }, [
    page,
    paymentStatus,
    orderStatus,
  ]);


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch =
    (e) => {

      e.preventDefault();

      setPage(1);

      fetchOrders();
    };


  return (
    <div className="space-y-7">


      {/* HEADER */}

      <div>

        <p className="text-[10px] font-black tracking-[0.25em] text-[#238bdc]">
          SALES MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Orders
        </h1>

        <p className="mt-2 text-sm text-[#505258]">
          View and manage all pack purchases.
        </p>

      </div>


      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">


        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-black/10 p-5 lg:flex-row lg:items-center lg:justify-between">


          <form
            onSubmit={handleSearch}
            className="relative"
          >

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search order, user..."
              className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-4 text-xs font-semibold outline-none focus:border-[#238bdc] lg:w-72"
            />

          </form>


          <div className="flex gap-2">

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPage(1);
                setPaymentStatus(
                  e.target.value
                );
              }}
              className="h-10 rounded-xl border border-black/10 bg-white px-3 text-[10px] font-black outline-none"
            >

              <option value="">
                All Payments
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="REFUNDED">
                Refunded
              </option>

            </select>


            <select
              value={orderStatus}
              onChange={(e) => {
                setPage(1);
                setOrderStatus(
                  e.target.value
                );
              }}
              className="h-10 rounded-xl border border-black/10 bg-white px-3 text-[10px] font-black outline-none"
            >

              <option value="">
                All Orders
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

            </select>

          </div>

        </div>


        {/* CONTENT */}

        {loading ? (

          <div className="flex min-h-[350px] items-center justify-center">

            <Loader2
              size={30}
              className="animate-spin text-[#238bdc]"
            />

          </div>

        ) : orders.length === 0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center text-center">

            <ShoppingBag
              size={36}
              className="text-[#aaa]"
            />

            <h3 className="mt-4 text-sm font-black">
              No orders found
            </h3>

            <p className="mt-2 text-xs text-[#777]">
              Test purchases will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>

                <tr className="border-b border-black/10 text-left">

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    ORDER
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    USER
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    PACK
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    AMOUNT
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    PAYMENT
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    STATUS
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    DATE
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (order) => (

                    <tr
                      key={
                        order._id
                      }
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                      className="cursor-pointer border-b border-black/5 transition hover:bg-white"
                    >

                      <td className="px-6 py-4">

                        <p className="text-xs font-black">
                          {
                            order.orderNumber
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#888]">
                          TEST
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <p className="text-xs font-black">
                          {
                            order.user
                              ?.name ||
                            "Unknown"
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#888]">
                          {
                            order.user
                              ?.email ||
                            "-"
                          }
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          {order.pack
                            ?.image && (

                            <img
                              src={
                                order
                                  .pack
                                  .image
                              }
                              alt={
                                order
                                  .pack
                                  .name
                              }
                              className="h-12 w-9 rounded-md object-cover"
                            />

                          )}

                          <div>

                            <p className="text-xs font-black">
                              {
                                order.pack
                                  ?.name ||
                                "Unknown Pack"
                              }
                            </p>

                            <p className="mt-1 text-[9px] text-[#888]">
                              Qty:{" "}
                              {
                                order.quantity
                              }
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-6 py-4">

                        <p className="text-xs font-black">
                          ₹
                          {Number(
                            order.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-[9px] font-black text-blue-700">
                          {
                            order.paymentMethod
                          }
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <div className="space-y-1">

                          <StatusBadge
                            value={
                              order.paymentStatus
                            }
                          />

                          <StatusBadge
                            value={
                              order.orderStatus
                            }
                          />

                        </div>

                      </td>


                      <td className="px-6 py-4">

                        <p className="text-[10px] font-bold text-[#555]">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* PAGINATION */}

        {!loading &&
          orders.length > 0 && (

            <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">

              <p className="text-[10px] font-bold text-[#777]">
                Page {page} of{" "}
                {totalPages}
              </p>

              <div className="flex gap-2">

                <button
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (p) =>
                        Math.max(
                          1,
                          p - 1
                        )
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 disabled:opacity-30"
                >
                  <ChevronLeft
                    size={14}
                  />
                </button>


                <button
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (p) =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 disabled:opacity-30"
                >
                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

            </div>

          )}

      </section>


      {/* ORDER DETAIL MODAL */}

      {selectedOrder && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="w-full max-w-lg rounded-3xl bg-[#f5f5f5] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex justify-between">

              <div>

                <p className="text-[9px] font-black tracking-widest text-[#238bdc]">
                  ORDER DETAILS
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {
                    selectedOrder.orderNumber
                  }
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5"
              >
                <X size={16} />
              </button>

            </div>


            <div className="mt-6 space-y-4">

              <Detail
                label="User"
                value={
                  selectedOrder
                    .user?.name
                }
              />

              <Detail
                label="Email"
                value={
                  selectedOrder
                    .user?.email
                }
              />

              <Detail
                label="Pack"
                value={
                  selectedOrder
                    .pack?.name
                }
              />

              <Detail
                label="Quantity"
                value={
                  selectedOrder.quantity
                }
              />

              <Detail
                label="Amount"
                value={`₹${Number(
                  selectedOrder.amount
                ).toLocaleString(
                  "en-IN"
                )}`}
              />

              <Detail
                label="Payment"
                value={
                  selectedOrder
                    .paymentMethod
                }
              />

              <Detail
                label="Payment Status"
                value={
                  selectedOrder
                    .paymentStatus
                }
              />

              <Detail
                label="Order Status"
                value={
                  selectedOrder
                    .orderStatus
                }
              />

              <Detail
                label="Date"
                value={new Date(
                  selectedOrder.createdAt
                ).toLocaleString(
                  "en-IN"
                )}
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =====================================================
// STATUS
// =====================================================

function StatusBadge({
  value,
}) {

  const styles = {
    PAID:
      "bg-green-100 text-green-700",

    COMPLETED:
      "bg-green-100 text-green-700",

    PENDING:
      "bg-yellow-100 text-yellow-700",

    FAILED:
      "bg-red-100 text-red-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    REFUNDED:
      "bg-purple-100 text-purple-700",
  };


  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[8px] font-black ${
        styles[value] ||
        "bg-black/5 text-[#555]"
      }`}
    >
      {value}
    </span>
  );
}


// =====================================================
// DETAIL
// =====================================================

function Detail({
  label,
  value,
}) {

  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-3">

      <span className="text-[10px] font-black text-[#777]">
        {label}
      </span>

      <span className="text-xs font-black">
        {value || "-"}
      </span>

    </div>
  );
}