import { useEffect, useState } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet as WalletIcon,
  Loader2,
  Plus,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function Wallet() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [modal, setModal] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const token =
    localStorage.getItem("token");

  // =====================================================
  // FETCH WALLET
  // =====================================================

  const fetchWallet = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/wallet`,
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
            "Unable to load wallet"
        );
      }

      setBalance(
        Number(
          data.data?.wallet?.balance ||
            0
        )
      );
    } catch (error) {
      console.error(
        "Wallet error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  const fetchTransactions =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/wallet/transactions`,
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
              "Unable to load transactions"
          );
        }

        setTransactions(
          data.data?.transactions ||
            []
        );
      } catch (error) {
        console.error(
          "Transactions error:",
          error
        );
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchWallet();
    fetchTransactions();
  }, []);

  // =====================================================
  // SUBMIT DEPOSIT / WITHDRAWAL REQUEST
  // =====================================================

  const submitRequest =
    async () => {
      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        alert(
          "Please enter a valid amount"
        );
        return;
      }

      try {
        setSubmitting(true);

        const endpoint =
          modal === "deposit"
            ? "/api/wallet/deposit"
            : "/api/wallet/withdraw";

        const response =
          await fetch(
            `${API_URL}${endpoint}`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                amount:
                  numericAmount,
                note,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Request failed"
          );
        }

        alert(
          data.message ||
            "Request submitted"
        );

        setAmount("");
        setNote("");
        setModal(null);

        await fetchWallet();
        await fetchTransactions();
      } catch (error) {
        alert(error.message);
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const StatusIcon = ({
    status,
  }) => {
    if (
      status === "APPROVED"
    ) {
      return (
        <CheckCircle2
          size={15}
          className="text-green-500"
        />
      );
    }

    if (
      status === "REJECTED"
    ) {
      return (
        <XCircle
          size={15}
          className="text-red-500"
        />
      );
    }

    return (
      <Clock3
        size={15}
        className="text-orange-500"
      />
    );
  };

  // =====================================================
  // TRANSACTION HELPERS
  // =====================================================

  const getTransactionInfo = (
    transaction
  ) => {
    switch (transaction.type) {
      case "DEPOSIT":
        return {
          label: "Deposit",
          icon: (
            <ArrowDownLeft
              size={18}
              className="text-green-500"
            />
          ),
          iconBackground:
            "bg-green-50",
          amountColor:
            "text-green-500",
          prefix: "+",
        };

      case "WITHDRAWAL":
        return {
          label: "Withdrawal",
          icon: (
            <ArrowUpRight
              size={18}
              className="text-red-500"
            />
          ),
          iconBackground:
            "bg-red-50",
          amountColor:
            "text-red-500",
          prefix: "-",
        };

      case "PURCHASE":
        return {
          label: "Purchased",
          icon: (
            <WalletIcon
              size={18}
              className="text-blue-500"
            />
          ),
          iconBackground:
            "bg-blue-50",
          amountColor:
            "text-blue-500",
          prefix: "-",
        };

      default:
        return {
          label:
            transaction.type ||
            "Transaction",
          icon: (
            <WalletIcon
              size={18}
              className="text-gray-500"
            />
          ),
          iconBackground:
            "bg-gray-50",
          amountColor:
            "text-gray-500",
          prefix: "",
        };
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2
          size={30}
          className="animate-spin text-[#238bdc]"
        />
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      <main className="mx-auto min-h-screen w-full max-w-[520px] bg-[#f5f5f5] px-4 pb-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center gap-3 py-5">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft
              size={17}
            />
          </button>

          <h1 className="text-xl font-black">
            Wallet
          </h1>

        </header>


        {/* =================================================
            BALANCE
        ================================================= */}

        <section className="rounded-3xl bg-[#238bdc] p-6 text-white shadow-sm">

          <div className="flex items-center gap-2">

            <WalletIcon
              size={18}
            />

            <span className="text-xs font-bold opacity-80">
              Available Balance
            </span>

          </div>

          <div className="mt-3 text-4xl font-black">
            $
            {balance.toFixed(2)}
          </div>

        </section>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="mt-4 grid grid-cols-2 gap-3">

          <button
            onClick={() =>
              setModal("deposit")
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 font-black shadow-sm"
          >

            <Plus
              size={18}
              className="text-[#238bdc]"
            />

            Add Money

          </button>


          <button
            onClick={() =>
              setModal("withdraw")
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 font-black shadow-sm"
          >

            <ArrowUpRight
              size={18}
              className="text-red-500"
            />

            Withdraw

          </button>

        </section>


        {/* =================================================
            INFO
        ================================================= */}

        <div className="mt-4 rounded-2xl bg-white p-4 text-xs text-gray-500 shadow-sm">

          Deposit and withdrawal requests are
          reviewed by the admin. Your wallet
          balance changes only after approval.

        </div>


        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <section className="mt-6">

          <h2 className="mb-3 text-lg font-black">
            Transactions
          </h2>


          {transactions.length ===
          0 ? (

            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400">
              No transactions yet.
            </div>

          ) : (

            <div className="space-y-2">

              {transactions.map(
                (transaction) => {

                  const transactionInfo =
                    getTransactionInfo(
                      transaction
                    );

                  return (

                    <div
                      key={
                        transaction._id
                      }
                      className="rounded-2xl bg-white p-4 shadow-sm"
                    >

                      <div className="flex items-center justify-between">


                        {/* =================================================
                            LEFT SIDE
                        ================================================= */}

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${transactionInfo.iconBackground}`}
                          >
                            {
                              transactionInfo.icon
                            }
                          </div>


                          <div>

                            <p className="text-sm font-black">

                              {
                                transactionInfo.label
                              }

                            </p>


                            <p className="text-[10px] text-gray-400">

                              {transaction.createdAt
                                ? new Date(
                                    transaction.createdAt
                                  ).toLocaleString()
                                : "-"}

                            </p>


                            {/* PURCHASE NOTE */}

                            {transaction.type ===
                              "PURCHASE" &&
                              transaction.note && (

                                <p className="mt-1 max-w-[230px] truncate text-[10px] text-gray-400">

                                  {
                                    transaction.note
                                  }

                                </p>

                              )}


                            {/* OTHER NOTES */}

                            {transaction.type !==
                              "PURCHASE" &&
                              transaction.note && (

                                <p className="mt-1 max-w-[230px] truncate text-[10px] text-gray-400">

                                  {
                                    transaction.note
                                  }

                                </p>

                              )}

                          </div>

                        </div>


                        {/* =================================================
                            RIGHT SIDE
                        ================================================= */}

                        <div className="text-right">

                          <p
                            className={`text-sm font-black ${transactionInfo.amountColor}`}
                          >

                            {
                              transactionInfo.prefix
                            }

                            $
                            {Number(
                              transaction.amount ||
                                0
                            ).toFixed(2)}

                          </p>


                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold">

                            <StatusIcon
                              status={
                                transaction.status
                              }
                            />

                            {
                              transaction.status
                            }

                          </div>

                        </div>

                      </div>


                      {/* =================================================
                          REJECTION REASON
                      ================================================= */}

                      {transaction.rejectionReason && (

                        <p className="mt-3 rounded-xl bg-red-50 p-2 text-xs text-red-600">

                          {
                            transaction.rejectionReason
                          }

                        </p>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>


      {/* =================================================
          MODAL
      ================================================= */}

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-[430px] rounded-3xl bg-white p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-black">

                {modal === "deposit"
                  ? "Add Money"
                  : "Withdraw Money"}

              </h2>


              <button
                onClick={() =>
                  setModal(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
              >

                <X
                  size={16}
                />

              </button>

            </div>


            <p className="mt-2 text-xs text-gray-500">

              {modal === "deposit"
                ? "Submit a deposit request. Admin approval is required."
                : "Submit a withdrawal request. Admin approval is required."}

            </p>


            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="Enter amount"
              className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#238bdc]"
            />


            <textarea
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
              placeholder="Note (optional)"
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#238bdc]"
            />


            <button
              disabled={
                submitting
              }
              onClick={
                submitRequest
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#238bdc] py-3 text-sm font-black text-white disabled:opacity-50"
            >

              {submitting && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              Submit Request

            </button>

          </div>

        </div>

      )}

    </div>
  );
}