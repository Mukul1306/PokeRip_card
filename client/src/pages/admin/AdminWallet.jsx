import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminWallet() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [type, setType] = useState("ALL");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/wallet/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests");
      }

      setRequests(data.data?.requests || []);
    } catch (error) {
      console.error("Wallet requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      setProcessing(requestId);

      const response = await fetch(
        `${API_URL}/api/admin/wallet/requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${action} request`
        );
      }

      await fetchRequests();
    } catch (error) {
      console.error("Wallet action error:", error);
      alert(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests =
    type === "ALL"
      ? requests
      : requests.filter(
          (item) => item.type === type
        );

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-black">
            Wallet Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage user deposits and withdrawal requests
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#238bdc]/10">
          <Wallet
            size={21}
            className="text-[#238bdc]"
          />
        </div>

      </div>

      {/* FILTER */}

      <div className="mb-5 flex gap-2">

        {["ALL", "DEPOSIT", "WITHDRAWAL"].map(
          (item) => (
            <button
              key={item}
              onClick={() => setType(item)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                type === item
                  ? "bg-[#238bdc] text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {item}
            </button>
          )
        )}

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-[#238bdc]"
            />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center">

            <Wallet
              size={35}
              className="text-gray-300"
            />

            <p className="mt-3 text-sm font-bold">
              No wallet requests
            </p>

          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b bg-gray-50">

                <tr>
                  <th className="px-5 py-4 text-xs font-black">
                    USER
                  </th>

                  <th className="px-5 py-4 text-xs font-black">
                    TYPE
                  </th>

                  <th className="px-5 py-4 text-xs font-black">
                    AMOUNT
                  </th>

                  <th className="px-5 py-4 text-xs font-black">
                    STATUS
                  </th>

                  <th className="px-5 py-4 text-xs font-black">
                    DATE
                  </th>

                  <th className="px-5 py-4 text-xs font-black">
                    ACTION
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredRequests.map((request) => (

                  <tr
                    key={request._id}
                    className="border-b last:border-0"
                  >

                    {/* USER */}

                    <td className="px-5 py-4">

                      <div className="font-bold">
                        {request.user?.name || "Unknown"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {request.user?.email || "-"}
                      </div>

                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        {request.type === "DEPOSIT" ? (
                          <ArrowDownToLine
                            size={16}
                            className="text-green-500"
                          />
                        ) : (
                          <ArrowUpFromLine
                            size={16}
                            className="text-red-500"
                          />
                        )}

                        <span className="text-xs font-black">
                          {request.type}
                        </span>

                      </div>

                    </td>

                    {/* AMOUNT */}

                    <td className="px-5 py-4">

                      <span className="font-black">
                        ${Number(request.amount || 0).toFixed(2)}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          request.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : request.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status}
                      </span>

                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4 text-xs text-gray-500">

                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleString()
                        : "-"}

                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">

                      {request.status === "PENDING" ? (

                        <div className="flex gap-2">

                          <button
                            disabled={
                              processing === request._id
                            }
                            onClick={() =>
                              handleAction(
                                request._id,
                                "approve"
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white"
                          >
                            <Check size={14} />
                            Approve
                          </button>

                          <button
                            disabled={
                              processing === request._id
                            }
                            onClick={() =>
                              handleAction(
                                request._id,
                                "reject"
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white"
                          >
                            <X size={14} />
                            Reject
                          </button>

                        </div>

                      ) : (

                        <span className="text-xs text-gray-400">
                          Completed
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}