import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Wallet,
  Truck,
  DollarSign,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PackReveal() {
  const { userPackId } = useParams();
  const navigate = useNavigate();

  const [userPack, setUserPack] = useState(null);
  const [revealedCard, setRevealedCard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ripping, setRipping] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PURCHASED PACK
  // =====================================================

  const fetchPack = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/collection/${userPackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load pack"
        );
      }

      setUserPack(data.data.userPack);
    } catch (error) {
      console.error("Pack load error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPack();
  }, [userPackId]);

  // =====================================================
  // REVEAL / RIP ONE CARD
  // =====================================================

  const handleReveal = async () => {
    try {
      setRipping(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/reveal/${userPackId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reveal card"
        );
      }

      setRevealedCard(data.data.card);

      // Update pack progress
      if (data.data.pack) {
        setUserPack((previous) => ({
          ...previous,
          cardsTotal:
            data.data.pack.cardsTotal,

          cardsRemaining:
            data.data.pack.cardsRemaining,

          cardsRipped:
            data.data.pack.cardsRipped,

          status:
            data.data.pack.status,
        }));
      }
    } catch (error) {
      console.error("Reveal error:", error);
      setError(error.message);
    } finally {
      setRipping(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2
          size={32}
          className="animate-spin text-[#238bdc]"
        />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !userPack) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5">
        <div className="w-full max-w-[500px] rounded-2xl bg-white p-6 text-center">
          <p className="font-bold text-red-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/collection")}
            className="mt-5 rounded-full bg-[#238bdc] px-6 py-3 text-sm font-bold text-white"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  if (!userPack) {
    return null;
  }

  const pack = userPack.pack;

  const totalCards =
    Number(userPack.cardsTotal || 0);

  const cardsRipped =
    Number(userPack.cardsRipped || 0);

  const cardsRemaining =
    Number(userPack.cardsRemaining || 0);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      <main className="mx-auto min-h-screen w-full max-w-[520px] bg-[#f5f5f5] px-4 pb-10">

        {/* HEADER */}

        <header className="flex items-center gap-3 py-5">

          <button
            onClick={() => navigate("/collection")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg font-black">
              {pack?.name || "Pack"}
            </h1>

            <p className="text-[10px] font-bold text-[#777]">
              Reveal your cards
            </p>
          </div>

        </header>

        {/* PACK */}

        <section className="rounded-[20px] bg-white p-4 shadow-sm">

          <div className="flex h-[330px] items-center justify-center rounded-[15px] bg-[#f8f8f8]">

            {pack?.image ? (
              <img
                src={pack.image}
                alt={pack.name}
                className="h-full w-full object-contain p-5"
              />
            ) : (
              <Sparkles
                size={50}
                className="text-[#aaa]"
              />
            )}

          </div>

          <h2 className="mt-4 text-xl font-black">
            {pack?.name}
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-2">

            <div className="rounded-xl bg-[#f5f5f5] p-3 text-center">
              <p className="text-[10px] font-bold text-[#777]">
                TOTAL
              </p>

              <p className="mt-1 text-lg font-black">
                {totalCards}
              </p>
            </div>

            <div className="rounded-xl bg-[#f5f5f5] p-3 text-center">
              <p className="text-[10px] font-bold text-[#777]">
                RIPPED
              </p>

              <p className="mt-1 text-lg font-black">
                {cardsRipped}
              </p>
            </div>

            <div className="rounded-xl bg-[#f5f5f5] p-3 text-center">
              <p className="text-[10px] font-bold text-[#777]">
                REMAINING
              </p>

              <p className="mt-1 text-lg font-black">
                {cardsRemaining}
              </p>
            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-500">
            {error}
          </div>
        )}

        {/* REVEALED CARD */}

        {revealedCard ? (
          <section className="mt-5 rounded-[20px] bg-white p-4 shadow-sm">

            <div className="text-center">

              <p className="text-[10px] font-black tracking-[.2em] text-[#238bdc]">
                CARD REVEALED
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {revealedCard.name}
              </h2>

            </div>

            <div className="mt-5 flex h-[380px] items-center justify-center rounded-[15px] bg-[#f8f8f8]">

              {revealedCard.image ? (
                <img
                  src={revealedCard.image}
                  alt={revealedCard.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <Sparkles
                  size={50}
                  className="text-[#aaa]"
                />
              )}

            </div>

            {/* PRICE */}

            <div className="mt-4 rounded-2xl bg-[#f5f5f5] p-4 text-center">

              <p className="text-[10px] font-bold text-[#777]">
                MARKET VALUE
              </p>

              <p className="mt-1 text-3xl font-black">
                $
                {Number(
                  revealedCard.marketPrice || 0
                ).toFixed(2)}
              </p>

            </div>

            {/* OPTIONS */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <button
                className="flex flex-col items-center justify-center rounded-2xl bg-[#238bdc] p-4 text-white"
              >
                <DollarSign size={22} />

                <span className="mt-1 text-sm font-black">
                  Sell
                </span>

                <span className="mt-1 text-[10px] opacity-80">
                  Get 80% value
                </span>
              </button>

              <button
                className="flex flex-col items-center justify-center rounded-2xl bg-[#101114] p-4 text-white"
              >
                <Truck size={22} />

                <span className="mt-1 text-sm font-black">
                  Ship
                </span>

                <span className="mt-1 text-[10px] opacity-80">
                  $5 shipping
                </span>
              </button>

            </div>

          </section>
        ) : (

          /* RIP BUTTON */

          <section className="mt-5 rounded-[20px] bg-white p-5 text-center shadow-sm">

            <Sparkles
              size={30}
              className="mx-auto text-[#238bdc]"
            />

            <h2 className="mt-3 text-xl font-black">
              Ready to reveal?
            </h2>

            <p className="mt-1 text-xs text-[#777]">
              One rip reveals one random card.
            </p>

            <button
              onClick={handleReveal}
              disabled={
                ripping ||
                cardsRemaining <= 0
              }
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#238bdc] text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {ripping ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Revealing...
                </>
              ) : cardsRemaining <= 0 ? (
                "Pack Completed"
              ) : (
                <>
                  <Sparkles size={18} />
                  Rip Card
                </>
              )}

            </button>

          </section>
        )}

      </main>
    </div>
  );
}