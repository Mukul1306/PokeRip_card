import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Wallet,
  Truck,
  DollarSign,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RipPage() {
  const { userPackId } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [card, setCard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ripping, setRipping] = useState(false);
  const [selling, setSelling] = useState(false);
  const [shipping, setShipping] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showShipping, setShowShipping] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH PACK
  // =====================================================

  const fetchPack = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/rip/${userPackId}`,
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

      setPack(data.data?.userPack || data.data);

    } catch (err) {
      console.error("Fetch pack error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPackId) {
      fetchPack();
    }
  }, [userPackId]);

  // =====================================================
  // RIP ONE CARD
  // =====================================================

  const handleRip = async () => {
    if (ripping) return;

    try {
      setRipping(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/rip/${userPackId}`,
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
          data.message || "Unable to rip card"
        );
      }

      console.log("RIP RESPONSE:", data);

      const revealedCard =
        data.data?.card ||
        data.card ||
        null;

      setCard(revealedCard);

      // Update pack counters from backend
      if (data.data?.userPack) {
        setPack(data.data.userPack);
      } else {
        await fetchPack();
      }

    } catch (err) {
      console.error("Rip error:", err);
      setError(err.message);
    } finally {
      setRipping(false);
    }
  };

  // =====================================================
  // CARD PRICE
  // =====================================================

  const getCardPrice = () => {
    if (!card) return 0;

    return Number(
      card.marketPrice ||
      card.price ||
      card.cardPrice ||
      card.tcgPlayerPrice ||
      0
    );
  };

  const cardPrice = getCardPrice();

  // User gets 80%
  const sellAmount = cardPrice * 0.8;

  // Admin gets 20%
  const adminAmount = cardPrice * 0.2;

  // =====================================================
  // SELL CARD
  // =====================================================

  const handleSell = async () => {
    if (!card) return;

    if (selling) return;

    try {
      setSelling(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/rip/${userPackId}/sell`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardId:
              card._id ||
              card.id,
            cardPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to sell card"
        );
      }

      setSuccess(
        `Card sold successfully. $${sellAmount.toFixed(
          2
        )} added to your wallet.`
      );

      // Remove revealed card after selling
      setCard(null);

      await fetchPack();

    } catch (err) {
      console.error("Sell card error:", err);
      setError(err.message);
    } finally {
      setSelling(false);
    }
  };

  // =====================================================
  // SHIPPING
  // =====================================================

  const handleShipping = async (e) => {
    e.preventDefault();

    if (!card) return;

    if (shipping) return;

    try {
      setShipping(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/rip/${userPackId}/ship`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardId:
              card._id ||
              card.id,

            address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create shipping request"
        );
      }

      setSuccess(
        "Shipping request submitted successfully."
      );

      setShowShipping(false);
      setCard(null);

      await fetchPack();

    } catch (err) {
      console.error(
        "Shipping request error:",
        err
      );

      setError(err.message);
    } finally {
      setShipping(false);
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
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      <main className="mx-auto min-h-screen w-full max-w-[520px] bg-[#f5f5f5] px-4 pb-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center justify-between py-5">

          <button
            onClick={() =>
              navigate("/collection")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#777]">
              Ripping
            </p>

            <h1 className="text-sm font-black">
              {pack?.pack?.name ||
                pack?.name ||
                "Pokemon Pack"}
            </h1>
          </div>

          <button
            onClick={() =>
              navigate("/wallet")
            }
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm"
          >
            <Wallet
              size={15}
              className="text-[#238bdc]"
            />

            <span className="text-[10px] font-black">
              Wallet
            </span>
          </button>

        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-xs font-bold text-green-600">
            {success}
          </div>
        )}

        {/* =================================================
            PACK INFORMATION
        ================================================= */}

        <section className="rounded-[20px] bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            {pack?.pack?.image ? (
              <img
                src={pack.pack.image}
                alt={pack.pack.name}
                className="h-24 w-20 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-xl bg-[#f5f5f5]">
                <Sparkles
                  size={28}
                  className="text-[#aaa]"
                />
              </div>
            )}

            <div className="flex-1">

              <h2 className="text-lg font-black">
                {pack?.pack?.name ||
                  pack?.name}
              </h2>

              <p className="mt-1 text-[11px] text-[#777]">
                Reveal one card at a time.
              </p>

            </div>

          </div>

          {/* COUNTERS */}

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-[#f5f5f5] p-4 text-center">

              <p className="text-[9px] font-bold uppercase text-[#888]">
                Ripped
              </p>

              <p className="mt-1 text-2xl font-black">
                {pack?.cardsRipped || 0}
              </p>

            </div>

            <div className="rounded-xl bg-[#f5f5f5] p-4 text-center">

              <p className="text-[9px] font-bold uppercase text-[#888]">
                Remaining
              </p>

              <p className="mt-1 text-2xl font-black">
                {pack?.cardsRemaining || 0}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            REVEALED CARD
        ================================================= */}

        {card ? (

          <section className="mt-5 rounded-[20px] bg-white p-5 shadow-sm">

            <div className="text-center">

              <p className="text-[10px] font-black uppercase tracking-widest text-[#238bdc]">
                Card Revealed
              </p>

              <h2 className="mt-2 text-xl font-black">
                {card.name ||
                  card.cardName ||
                  "Pokemon Card"}
              </h2>

            </div>

            {/* CARD IMAGE */}

            <div className="mt-5 flex justify-center">

              {card.image ||
              card.images?.large ||
              card.images?.small ? (

                <img
                  src={
                    card.images?.large ||
                    card.image ||
                    card.images?.small
                  }
                  alt={
                    card.name ||
                    "Pokemon Card"
                  }
                  className="max-h-[430px] w-auto rounded-2xl object-contain shadow-lg"
                />

              ) : (

                <div className="flex h-[300px] w-[210px] items-center justify-center rounded-2xl bg-[#f1f1f1]">
                  <Sparkles
                    size={40}
                    className="text-[#aaa]"
                  />
                </div>

              )}

            </div>

            {/* PRICE */}

            <div className="mt-5 rounded-2xl bg-[#f5f5f5] p-4">

              <div className="flex items-center justify-between">

                <span className="text-xs font-bold text-[#777]">
                  Market Price
                </span>

                <span className="text-lg font-black">
                  ${cardPrice.toFixed(2)}
                </span>

              </div>

              <div className="mt-3 flex items-center justify-between">

                <span className="text-xs font-bold text-[#777]">
                  Your Sell Value (80%)
                </span>

                <span className="text-lg font-black text-[#238bdc]">
                  ${sellAmount.toFixed(2)}
                </span>

              </div>

              <div className="mt-2 flex items-center justify-between">

                <span className="text-[10px] text-[#999]">
                  Platform share (20%)
                </span>

                <span className="text-[10px] font-bold text-[#999]">
                  ${adminAmount.toFixed(2)}
                </span>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                onClick={handleSell}
                disabled={selling}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#238bdc] text-xs font-black text-white transition active:scale-[0.97] disabled:opacity-50"
              >

                {selling ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <DollarSign size={17} />
                )}

                Sell

              </button>

              <button
                onClick={() =>
                  setShowShipping(true)
                }
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-black text-xs font-black text-white transition active:scale-[0.97]"
              >

                <Truck size={17} />

                Ship

              </button>

            </div>

          </section>

        ) : (

          /* =================================================
             RIP BUTTON
          ================================================= */

          <section className="mt-5 rounded-[20px] bg-white p-6 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#238bdc]/10">

              <Sparkles
                size={34}
                className="text-[#238bdc]"
              />

            </div>

            <h2 className="mt-5 text-xl font-black">
              Ready to Rip?
            </h2>

            <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-[#777]">
              Rip this pack to randomly reveal
              one of the cards inside it.
            </p>

            <button
              onClick={handleRip}
              disabled={
                ripping ||
                Number(
                  pack?.cardsRemaining || 0
                ) <= 0
              }
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#238bdc] text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >

              {ripping ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Revealing...
                </>
              ) : (
                <>
                  <Sparkles size={19} />

                  RIP CARD
                </>
              )}

            </button>

            {Number(
              pack?.cardsRemaining || 0
            ) <= 0 && (
              <p className="mt-4 text-xs font-bold text-[#999]">
                All cards from this pack
                have been ripped.
              </p>
            )}

          </section>

        )}

        {/* =================================================
            SHIPPING MODAL
        ================================================= */}

        {showShipping && (

          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 px-3 py-3 sm:items-center">

            <div className="w-full max-w-[500px] rounded-[24px] bg-white p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-black">
                    Ship Card
                  </h2>

                  <p className="mt-1 text-[10px] text-[#777]">
                    Shipping fee: $5
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowShipping(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5]"
                >
                  <X size={17} />
                </button>

              </div>

              <form
                onSubmit={handleShipping}
                className="mt-5 space-y-3"
              >

                <input
                  required
                  placeholder="Full Name"
                  value={address.name}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      name: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl bg-[#f5f5f5] px-4 text-xs outline-none"
                />

                <input
                  required
                  placeholder="Mobile Number"
                  value={address.mobile}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      mobile: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl bg-[#f5f5f5] px-4 text-xs outline-none"
                />

                <textarea
                  required
                  placeholder="Address"
                  value={address.addressLine}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      addressLine:
                        e.target.value,
                    })
                  }
                  className="min-h-[80px] w-full rounded-xl bg-[#f5f5f5] p-4 text-xs outline-none"
                />

                <div className="grid grid-cols-2 gap-3">

                  <input
                    required
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        city: e.target.value,
                      })
                    }
                    className="h-11 rounded-xl bg-[#f5f5f5] px-4 text-xs outline-none"
                  />

                  <input
                    required
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        state: e.target.value,
                      })
                    }
                    className="h-11 rounded-xl bg-[#f5f5f5] px-4 text-xs outline-none"
                  />

                </div>

                <input
                  required
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      pincode:
                        e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl bg-[#f5f5f5] px-4 text-xs outline-none"
                />

                <div className="mt-4 rounded-xl bg-[#f5f5f5] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold">
                      Shipping Charge
                    </span>

                    <span className="text-sm font-black">
                      $5.00
                    </span>

                  </div>

                  <p className="mt-2 text-[10px] text-[#888]">
                    $5 will be deducted from
                    your wallet after the shipping
                    request is accepted.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={shipping}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-xs font-black text-white disabled:opacity-50"
                >

                  {shipping ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      <Truck size={17} />

                      Request Shipping
                    </>
                  )}

                </button>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}