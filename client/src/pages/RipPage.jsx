import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SHIPPING_FEE = 5;
const DECISION_TIME = 5 * 60 * 1000;

// =====================================================
// HELPERS
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

// =====================================================
// MAKE IMAGE URL
// =====================================================

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const value = String(image).trim();

  if (!value) {
    return "";
  }

  // Already full URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Backend relative URL
  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
};

// =====================================================
// GET CARD IMAGE
// =====================================================

const getCardImage = (card) => {
  if (!card) {
    return "";
  }

  return (
    card.imageLarge ||
    card.imageSmall ||
    card.image ||
    ""
  );
};

// =====================================================
// NORMALIZE CARD
// =====================================================

const normalizeCard = (rawCard, rawUserPackCard) => {
  if (!rawCard && !rawUserPackCard) {
    return null;
  }

  const backendCard =
    rawUserPackCard?.card || {};

  const card = {
    ...(backendCard || {}),
    ...(rawCard || {}),
  };

  const marketPrice =
    Number(
      rawUserPackCard?.marketPrice ??
        rawCard?.marketPrice ??
        rawCard?.price ??
        backendCard?.price ??
        0
    );

  return {
    ...card,

    _id:
      card._id ||
      card.id ||
      rawUserPackCard?._id ||
      "",

    name:
      card.name ||
      backendCard.name ||
      "Unknown Card",

    tcgId:
      card.tcgId ||
      backendCard.tcgId ||
      "",

    imageLarge:
      card.imageLarge ||
      backendCard.imageLarge ||
      card.image ||
      backendCard.image ||
      "",

    imageSmall:
      card.imageSmall ||
      backendCard.imageSmall ||
      card.image ||
      backendCard.image ||
      "",

    price: marketPrice,

    marketPrice,

    priceCurrency:
      rawUserPackCard?.priceCurrency ||
      card.priceCurrency ||
      backendCard.priceCurrency ||
      "USD",

    priceSource:
      rawUserPackCard?.priceSource ||
      card.priceSource ||
      backendCard.priceSource ||
      "",

    priceLastUpdated:
      rawUserPackCard?.priceLastUpdated ||
      card.priceLastUpdated ||
      backendCard.priceLastUpdated ||
      null,
  };
};

// =====================================================
// COMPONENT
// =====================================================

export default function RipPage() {
  const navigate = useNavigate();

  const { userPackId } = useParams();

  // ===================================================
  // STATE
  // ===================================================

  const [pack, setPack] = useState(null);

  const [userPackCard, setUserPackCard] =
    useState(null);

  const [card, setCard] = useState(null);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [ripping, setRipping] =
    useState(false);

  const [selling, setSelling] =
    useState(false);

  const [shipping, setShipping] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [showShipping, setShowShipping] =
    useState(false);

  const [address, setAddress] =
    useState("");

  // ===================================================
  // GET TOKEN
  // ===================================================

  const token = getToken();

  // ===================================================
  // FETCH USER PACK
  // ===================================================

  const fetchPack = async () => {
    if (!userPackId) {
      setError("User pack ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/user/packs/${userPackId}`,
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
            "Unable to load pack"
        );
      }

      const userPack =
        data.data?.userPack ||
        data.data?.pack ||
        data.data;

      setPack(userPack || null);

      // =================================================
      // LOOK FOR EXISTING REVEALED CARD
      // =================================================

      const existingCard =
        data.data?.userPackCard ||
        data.data?.revealedCard ||
        null;

      if (existingCard) {
        setUserPackCard(
          existingCard
        );

        const normalized =
          normalizeCard(
            existingCard.card,
            existingCard
          );

        setCard(normalized);

        if (
          existingCard.decisionDeadline
        ) {
          const remaining =
            new Date(
              existingCard.decisionDeadline
            ).getTime() -
            Date.now();

          setTimeLeft(
            Math.max(
              0,
              remaining
            )
          );
        }
      }
    } catch (err) {
      console.error(
        "Fetch pack error:",
        err
      );

      setError(
        err.message ||
          "Unable to load pack"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchPack();
  }, [userPackId]);

  // ===================================================
  // RIP ONE CARD
  // ===================================================

  const handleRip = async () => {
    if (!userPackId) {
      setError(
        "User pack ID is missing"
      );

      return;
    }

    if (ripping) {
      return;
    }

    try {
      setRipping(true);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_URL}/api/rip/${userPackId}`,
          {
            method: "POST",

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
            "Unable to rip card"
        );
      }

      console.log(
        "RIP RESPONSE:",
        data
      );

      // =================================================
      // BACKEND RESPONSE
      // =================================================

      const revealedCard =
        data.data?.card ||
        data.card ||
        null;

      const returnedUserPackCard =
        data.data?.userPackCard ||
        null;

      // =================================================
      // NORMALIZE CARD
      // =================================================

      const normalizedCard =
        normalizeCard(
          revealedCard,
          returnedUserPackCard
        );

      console.log(
        "NORMALIZED CARD:",
        normalizedCard
      );

      console.log(
        "IMAGE:",
        normalizedCard?.imageLarge
      );

      console.log(
        "IMAGE URL:",
        getImageUrl(
          normalizedCard?.imageLarge ||
            normalizedCard?.imageSmall
        )
      );

      console.log(
        "PRICE:",
        normalizedCard?.price
      );

      // =================================================
      // SAVE STATE
      // =================================================

      setCard(
        normalizedCard
      );

      setUserPackCard(
        returnedUserPackCard
      );

      // =================================================
      // UPDATE PACK
      // =================================================

      if (data.data?.pack) {
        setPack(
          data.data.pack
        );
      } else if (
        data.data?.userPack
      ) {
        setPack(
          data.data.userPack
        );
      }

      // =================================================
      // START 5 MINUTE TIMER
      // =================================================

      if (
        returnedUserPackCard?.decisionDeadline
      ) {
        const deadline =
          new Date(
            returnedUserPackCard.decisionDeadline
          ).getTime();

        setTimeLeft(
          Math.max(
            0,
            deadline - Date.now()
          )
        );
      } else {
        setTimeLeft(
          DECISION_TIME
        );
      }
    } catch (err) {
      console.error(
        "Rip error:",
        err
      );

      setError(
        err.message ||
          "Unable to reveal card"
      );
    } finally {
      setRipping(false);
    }
  };

  // ===================================================
  // COUNTDOWN
  // ===================================================

  useEffect(() => {
    if (!card) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) =>
            Math.max(
              0,
              previous - 1000
            )
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [card, timeLeft]);

  // ===================================================
  // AUTO SELL AFTER 5 MINUTES
  // ===================================================

  useEffect(() => {
    if (!card) {
      return;
    }

    if (!userPackCard) {
      return;
    }

    if (
      userPackCard.status !==
      "REVEALED"
    ) {
      return;
    }

    if (timeLeft > 0) {
      return;
    }

    if (selling || shipping) {
      return;
    }

    let cancelled = false;

    const autoSell = async () => {
      if (cancelled) {
        return;
      }

      console.log(
        "5 minute decision window expired. Auto selling card."
      );

      await handleSell(true);
    };

    autoSell();

    return () => {
      cancelled = true;
    };
  }, [
    timeLeft,
    card,
    userPackCard,
  ]);

  // ===================================================
  // CARD PRICE
  // ===================================================

  const cardPrice = useMemo(() => {
    if (!card) {
      return 0;
    }

    const price =
      Number(
        card.marketPrice ??
          card.price ??
          0
      );

    return Number.isFinite(price)
      ? price
      : 0;
  }, [card]);

  // ===================================================
  // USER SELL AMOUNT
  // ===================================================

  const sellAmount = useMemo(() => {
    return cardPrice * 0.8;
  }, [cardPrice]);

  // ===================================================
  // ADMIN AMOUNT
  // ===================================================

  const adminAmount = useMemo(() => {
    return cardPrice * 0.2;
  }, [cardPrice]);

  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formattedTime = useMemo(() => {
    const totalSeconds =
      Math.ceil(
        timeLeft / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, [timeLeft]);

  // ===================================================
  // IMAGE
  // ===================================================

  const imageUrl = useMemo(() => {
    if (!card) {
      return "";
    }

    return getImageUrl(
      getCardImage(card)
    );
  }, [card]);

  // ===================================================
  // IMAGE ERROR FALLBACK
  // ===================================================

  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // ===================================================
  // SELL CARD
  // ===================================================

  const handleSell = async (
    automatic = false
  ) => {
    if (!userPackId) {
      return;
    }

    if (!userPackCard) {
      return;
    }

    if (
      userPackCard.status !==
      "REVEALED"
    ) {
      return;
    }

    if (
      !automatic &&
      timeLeft <= 0
    ) {
      setError(
        "The 5-minute decision window has expired."
      );

      return;
    }

    if (selling) {
      return;
    }

    try {
      setSelling(true);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_URL}/api/rip/${userPackId}/sell`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cardId:
                card?._id ||
                card?.id,

              cardPrice:
                cardPrice,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to sell card"
        );
      }

      // =================================================
      // UPDATE WALLET
      // =================================================

      if (
        data.data?.walletBalance !==
        undefined
      ) {
        setWalletBalance(
          Number(
            data.data.walletBalance
          )
        );
      }

      // =================================================
      // UPDATE CARD STATUS
      // =================================================

      const updatedCard =
        data.data?.userPackCard;

      setUserPackCard(
        (previous) => ({
          ...(previous || {}),
          ...(updatedCard || {}),
          status: "SOLD",
        })
      );

      if (automatic) {
        setSuccess(
          `Decision window expired. Card was automatically sold for $${Number(
            data.data?.soldAmount ??
              sellAmount
          ).toFixed(2)}.`
        );
      } else {
        setSuccess(
          `Card sold successfully. $${Number(
            data.data?.soldAmount ??
              sellAmount
          ).toFixed(2)} added to your wallet.`
        );
      }

      setTimeLeft(0);
    } catch (err) {
      console.error(
        "Sell card error:",
        err
      );

      setError(
        err.message ||
          "Unable to sell card"
      );
    } finally {
      setSelling(false);
    }
  };

  // ===================================================
  // SHIP CARD
  // ===================================================

  const handleShip = async () => {
    if (!userPackId) {
      return;
    }

    if (!userPackCard) {
      return;
    }

    if (
      userPackCard.status !==
      "REVEALED"
    ) {
      return;
    }

    if (timeLeft <= 0) {
      setError(
        "The 5-minute decision window has expired."
      );

      return;
    }

    if (shipping) {
      return;
    }

    try {
      setShipping(true);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_URL}/api/rip/${userPackId}/ship`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cardId:
                card?._id ||
                card?.id,

              address,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to ship card"
        );
      }

      // =================================================
      // UPDATE WALLET
      // =================================================

      if (
        data.data?.walletBalance !==
        undefined
      ) {
        setWalletBalance(
          Number(
            data.data.walletBalance
          )
        );
      }

      // =================================================
      // UPDATE STATUS
      // =================================================

      const updatedCard =
        data.data?.userPackCard;

      setUserPackCard(
        (previous) => ({
          ...(previous || {}),
          ...(updatedCard || {}),
          status: "SHIPPING",
        })
      );

      setShowShipping(false);

      setSuccess(
        `Shipping request submitted successfully. $${SHIPPING_FEE.toFixed(
          2
        )} shipping fee charged.`
      );

      setTimeLeft(0);
    } catch (err) {
      console.error(
        "Shipping error:",
        err
      );

      setError(
        err.message ||
          "Unable to create shipping request"
      );
    } finally {
      setShipping(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#238bdc]" />

          <p className="font-bold text-gray-600">
            Loading your pack...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#238bdc]">
              POKERIP
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Rip Your Pack
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-600">
            {success}
          </div>
        )}

        {/* =================================================
            RIP AREA
        ================================================= */}

        {!card ? (
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-xl text-center">

              <div className="mx-auto mb-8 flex h-72 w-56 items-center justify-center rounded-3xl bg-gray-100 shadow-inner">
                <span className="text-6xl">
                  ?
                </span>
              </div>

              <h2 className="text-3xl font-black">
                Ready to Rip?
              </h2>

              <p className="mt-3 text-gray-500">
                Open your pack and reveal
                a random card from the
                available inventory.
              </p>

              {pack && (
                <p className="mt-4 text-sm font-bold text-gray-600">
                  {pack.name}
                </p>
              )}

              <button
                type="button"
                onClick={handleRip}
                disabled={ripping}
                className="mt-7 w-full rounded-full bg-[#238bdc] px-8 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#177bc9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ripping
                  ? "Opening Pack..."
                  : "RIP IT"}
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">

            {/* =================================================
                REVEALED CARD
            ================================================= */}

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

              {/* CARD IMAGE */}

              <div className="flex min-h-[500px] items-center justify-center rounded-3xl bg-gray-50 p-6">

                {!imageError &&
                imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      card.name ||
                      "Revealed Pokémon card"
                    }
                    className="max-h-[520px] max-w-full rounded-2xl object-contain shadow-2xl"
                    onError={(event) => {
                      console.error(
                        "Card image failed:",
                        imageUrl
                      );

                      setImageError(
                        true
                      );

                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex h-[420px] w-full max-w-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white">
                    <div className="text-center px-5">
                      <p className="text-5xl">
                        ?
                      </p>

                      <p className="mt-4 text-sm font-bold text-gray-500">
                        Card image unavailable
                      </p>

                      <p className="mt-2 break-all text-xs text-gray-400">
                        {imageUrl ||
                          "No image URL returned"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD INFORMATION */}

              <div>

                <p className="text-xs font-black uppercase tracking-widest text-[#238bdc]">
                  CARD REVEALED
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  {card.name}
                </h2>

                {card.set?.name && (
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    {card.set.name}
                  </p>
                )}

                {card.rarity && (
                  <p className="mt-1 text-sm text-gray-500">
                    {card.rarity}
                  </p>
                )}

                {/* PRICE */}

                <div className="mt-8 rounded-3xl bg-gray-50 p-6">

                  <p className="text-sm font-bold text-gray-500">
                    Current card value
                  </p>

                  <p className="mt-2 text-4xl font-black">
                    $
                    {cardPrice.toFixed(
                      2
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {card.priceSource ||
                      "Current market price"}
                  </p>

                  {/* SELL VALUE */}

                  <div className="mt-5 border-t border-gray-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-500">
                        Your sell value
                      </span>

                      <span className="text-xl font-black text-green-600">
                        $
                        {sellAmount.toFixed(
                          2
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      You receive 80% of
                      the card market value.
                    </p>
                  </div>
                </div>

                {/* TIMER */}

                {userPackCard?.status ===
                  "REVEALED" && (
                  <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5 text-center">

                    <p className="text-xs font-black uppercase tracking-widest text-orange-600">
                      Decision window
                    </p>

                    <p className="mt-2 text-4xl font-black text-orange-600">
                      {formattedTime}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-orange-500">
                      Sell or ship within
                      5 minutes
                    </p>
                  </div>
                )}

                {/* SOLD */}

                {userPackCard?.status ===
                  "SOLD" && (
                  <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">
                    <p className="font-black text-green-700">
                      Card Sold
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      $
                      {sellAmount.toFixed(
                        2
                      )}{" "}
                      was credited to your
                      wallet.
                    </p>
                  </div>
                )}

                {/* SHIPPING */}

                {userPackCard?.status ===
                  "SHIPPING" && (
                  <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                    <p className="font-black text-blue-700">
                      Card Added to Shipping
                    </p>

                    <p className="mt-1 text-sm text-blue-600">
                      $5.00 shipping fee
                      charged.
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS */}

                {userPackCard?.status ===
                  "REVEALED" &&
                  timeLeft > 0 && (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">

                    {/* SELL */}

                    <button
                      type="button"
                      onClick={() =>
                        handleSell(
                          false
                        )
                      }
                      disabled={
                        selling ||
                        shipping
                      }
                      className="rounded-full bg-green-600 px-6 py-4 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selling
                        ? "Selling..."
                        : `RIPiT — SELL $${sellAmount.toFixed(
                            2
                          )}`}
                    </button>

                    {/* SHIP */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowShipping(
                          true
                        )
                      }
                      disabled={
                        selling ||
                        shipping
                      }
                      className="rounded-full border-2 border-[#238bdc] bg-white px-6 py-4 text-sm font-black text-[#238bdc] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      SHIP — $5
                    </button>
                  </div>
                )}

                {/* WALLET */}

                <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">
                      Wallet balance
                    </span>

                    <span className="text-lg font-black">
                      $
                      {Number(
                        walletBalance
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* =================================================
            SHIPPING MODAL
        ================================================= */}

        {showShipping && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

              <div className="flex items-start justify-between">

                <div>
                  <h3 className="text-2xl font-black">
                    Ship Card
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Shipping fee: $5.00
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowShipping(
                      false
                    )
                  }
                  className="text-2xl font-bold text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* ADDRESS */}

              <div className="mt-6">

                <label className="text-sm font-black text-gray-700">
                  Shipping address
                </label>

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target
                        .value
                    )
                  }
                  rows={5}
                  placeholder="Enter your complete shipping address"
                  className="mt-2 w-full rounded-2xl border border-gray-200 p-4 text-sm outline-none focus:border-[#238bdc]"
                />
              </div>

              {/* FEE */}

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-500">
                    Shipping fee
                  </span>

                  <span className="font-black">
                    $5.00
                  </span>
                </div>

                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-sm font-bold text-gray-500">
                    Wallet after shipping
                  </span>

                  <span className="font-black">
                    $
                    {Math.max(
                      0,
                      Number(
                        walletBalance
                      ) -
                        SHIPPING_FEE
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* BUTTONS */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowShipping(
                      false
                    )
                  }
                  className="rounded-full border border-gray-200 px-6 py-4 text-sm font-black text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleShip
                  }
                  disabled={
                    shipping ||
                    !address.trim()
                  }
                  className="rounded-full bg-[#238bdc] px-6 py-4 text-sm font-black text-white hover:bg-[#177bc9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {shipping
                    ? "Processing..."
                    : "Confirm Ship — $5"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}