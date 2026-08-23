import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function BuyPack() {
  const navigate = useNavigate();
  const { packId } = useParams();

  const [pack, setPack] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PACK + WALLET
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // -------------------------------
        // GET PACK
        // -------------------------------

        const packResponse = await fetch(
          `${API_URL}/api/user/packs/${packId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const packData = await packResponse.json();

        if (!packResponse.ok) {
          throw new Error(
            packData.message ||
              "Unable to load pack"
          );
        }

        setPack(
          packData.data?.pack ||
            packData.pack ||
            packData.data
        );

        // -------------------------------
        // GET WALLET
        // -------------------------------

        const walletResponse = await fetch(
          `${API_URL}/api/wallet`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const walletData =
          await walletResponse.json();

        if (!walletResponse.ok) {
          throw new Error(
            walletData.message ||
              "Unable to load wallet"
          );
        }

        setWalletBalance(
          Number(
            walletData.data?.wallet?.balance || 0
          )
        );
      } catch (err) {
        console.error(
          "Buy page error:",
          err
        );

        setError(
          err.message ||
            "Unable to load purchase page"
        );
      } finally {
        setLoading(false);
      }
    };

    if (packId) {
      loadData();
    }
  }, [packId, navigate]);

  // =====================================================
  // BUY PACK
  // =====================================================

  const handleBuy = async () => {
    if (!pack) return;

    const price = Number(pack.price || 0);

    if (walletBalance < price) {
      setError(
        "Insufficient wallet balance"
      );
      return;
    }

    try {
      setBuying(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            packId: pack._id,
            quantity: 1,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Purchase failed"
        );
      }

      // Purchase successful
      alert(
        "Pack purchased successfully!"
      );

      // Go to collection
      navigate("/collection");
    } catch (err) {
      console.error(
        "Purchase error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete purchase"
      );
    } finally {
      setBuying(false);
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
  // ERROR
  // =====================================================

  if (!pack) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-5">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-2xl bg-white p-8 text-center">
          <AlertCircle
            size={35}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-lg font-black">
            Pack not found
          </h2>

          <p className="mt-2 text-sm text-[#777]">
            {error ||
              "This pack could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  const price = Number(
    pack.price || 0
  );

  const remainingBalance =
    walletBalance - price;

  const insufficientBalance =
    walletBalance < price;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">
      <main className="mx-auto min-h-screen w-full max-w-[520px] px-4 pb-10">

        {/* HEADER */}

        <header className="flex items-center gap-3 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-lg font-black">
            Confirm Purchase
          </h1>
        </header>

        {/* PACK */}

        <section className="overflow-hidden rounded-2xl bg-white">

          <div className="flex h-[330px] items-center justify-center bg-white">
            {pack.image ? (
              <img
                src={pack.image}
                alt={pack.name}
                className="h-full w-full object-contain px-8"
              />
            ) : (
              <div className="text-sm text-[#888]">
                No image
              </div>
            )}
          </div>

          <div className="px-5 pb-5">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                {pack.name}
              </h2>

              <span className="text-lg font-black">
                ${price.toFixed(2)}
              </span>
            </div>

            {pack.description && (
              <p className="mt-2 text-sm text-[#777]">
                {pack.description}
              </p>
            )}
          </div>
        </section>

        {/* WALLET */}

        <section className="mt-4 rounded-2xl bg-white p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#238bdc]/10">
                <Wallet
                  size={19}
                  className="text-[#238bdc]"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#777]">
                  WALLET BALANCE
                </p>

                <p className="text-lg font-black">
                  ${walletBalance.toFixed(2)}
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                navigate("/wallet")
              }
              className="text-[11px] font-bold text-[#238bdc]"
            >
              Add Money
            </button>

          </div>
        </section>

        {/* SUMMARY */}

        <section className="mt-4 rounded-2xl bg-white p-5">

          <h3 className="text-sm font-black">
            Purchase Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-[#777]">
                Pack
              </span>

              <span className="font-bold">
                {pack.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#777]">
                Quantity
              </span>

              <span className="font-bold">
                1
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#777]">
                Price
              </span>

              <span className="font-bold">
                ${price.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-black/10 pt-3">

              <div className="flex justify-between">

                <span className="font-black">
                  Balance after purchase
                </span>

                <span
                  className={`font-black ${
                    insufficientBalance
                      ? "text-red-500"
                      : "text-[#238bdc]"
                  }`}
                >
                  $
                  {Math.max(
                    remainingBalance,
                    0
                  ).toFixed(2)}
                </span>

              </div>

            </div>

          </div>
        </section>

        {/* ERROR */}

        {(error || insufficientBalance) && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
            <AlertCircle size={17} />

            {error ||
              "Insufficient wallet balance"}
          </div>
        )}

        {/* BUY BUTTON */}

        <button
          onClick={handleBuy}
          disabled={
            buying ||
            insufficientBalance
          }
          className="
            mt-5
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#2698F3]
            text-sm
            font-black
            text-white
            transition
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {buying ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />

              Buy Now — $
              {price.toFixed(2)}
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[10px] text-[#888]">
          Amount will be deducted from your wallet
          after the purchase is confirmed.
        </p>

      </main>
    </div>
  );
}