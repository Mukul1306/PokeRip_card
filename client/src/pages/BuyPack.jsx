import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Package,
  Clock,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";


// =====================================================
// API URL
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// =====================================================
// IMAGE URL HELPER
// =====================================================

const getFullImageUrl = (image) => {
  if (!image) {
    return "";
  }

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  // Backend returned relative path
  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  // Relative path without /
  return `${API_URL}/${image}`;
};


// =====================================================
// GET CARD IMAGE
// =====================================================

const getCardImageCandidates = (
  revealedCard,
  pack,
  userPackCard
) => {
  const images = [];

  // -----------------------------------------------
  // 1. Revealed card
  // -----------------------------------------------

  if (revealedCard) {
    images.push(
      revealedCard.imageLarge
    );

    images.push(
      revealedCard.imageSmall
    );

    images.push(
      revealedCard.image
    );

    images.push(
      revealedCard.imageUrl
    );

    images.push(
      revealedCard.cardImage
    );
  }

  // -----------------------------------------------
  // 2. UserPackCard populated card
  // -----------------------------------------------

  if (
    userPackCard &&
    userPackCard.card
  ) {
    const card =
      userPackCard.card;

    if (
      typeof card === "object"
    ) {
      images.push(
        card.imageLarge
      );

      images.push(
        card.imageSmall
      );

      images.push(
        card.image
      );

      images.push(
        card.imageUrl
      );
    }
  }

  // -----------------------------------------------
  // 3. Find card inside purchased pack
  // -----------------------------------------------

  if (
    pack &&
    Array.isArray(pack.cards) &&
    revealedCard
  ) {
    const revealedId =
      String(
        revealedCard._id ||
        revealedCard.id ||
        revealedCard.cardId ||
        ""
      );

    const revealedTcgId =
      revealedCard.tcgId ||
      "";

    const matchingPackCard =
      pack.cards.find((item) => {
        const card =
          item?.card;

        if (!card) {
          return false;
        }

        const cardId =
          String(
            card._id ||
            card.id ||
            ""
          );

        return (
          cardId === revealedId ||
          (
            revealedTcgId &&
            card.tcgId ===
              revealedTcgId
          )
        );
      });

    if (
      matchingPackCard &&
      matchingPackCard.card
    ) {
      const card =
        matchingPackCard.card;

      images.push(
        card.imageLarge
      );

      images.push(
        card.imageSmall
      );

      images.push(
        card.image
      );

      images.push(
        card.imageUrl
      );
    }
  }

  // -----------------------------------------------
  // 4. Remove empty / duplicate images
  // -----------------------------------------------

  return [
    ...new Set(
      images.filter(Boolean)
    ),
  ];
};


// =====================================================
// COMPONENT
// =====================================================

export default function BuyPack() {
  const navigate =
    useNavigate();

  const { packId } =
    useParams();


  // =====================================================
  // NORMAL PAGE STATES
  // =====================================================

  const [pack, setPack] =
    useState(null);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [buying, setBuying] =
    useState(false);


  // =====================================================
  // RIP STATES
  // =====================================================

  const [userPackId, setUserPackId] =
    useState(null);

  const [ripLoading, setRipLoading] =
    useState(false);

  const [revealedCard, setRevealedCard] =
    useState(null);

  const [userPackCard, setUserPackCard] =
    useState(null);

  const [ripStage, setRipStage] =
    useState("purchase");


  // =====================================================
  // TIMER
  // =====================================================

  const [timeLeft, setTimeLeft] =
    useState(0);


  // =====================================================
  // ACTION STATES
  // =====================================================

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =====================================================
  // SHIPPING ADDRESS MODAL
  // =====================================================

  const [showShippingModal, setShowShippingModal] =
    useState(false);

  const [shippingAddress, setShippingAddress] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });


  // =====================================================
  // IMAGE STATE
  // =====================================================

  const [imageIndex, setImageIndex] =
    useState(0);


  // =====================================================
  // LOAD PACK + WALLET
  // =====================================================

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            navigate("/login");
            return;
          }


          // ---------------------------------------------
          // GET PACK
          // ---------------------------------------------

          const packResponse =
            await fetch(
              `${API_URL}/api/user/packs/${packId}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const packData =
            await packResponse.json();

          if (!packResponse.ok) {
            throw new Error(
              packData.message ||
              "Unable to load pack"
            );
          }

          const loadedPack =
            packData.data?.pack ||
            packData.pack ||
            packData.data;

          setPack(
            loadedPack
          );


          // ---------------------------------------------
          // GET WALLET
          // ---------------------------------------------

          const walletResponse =
            await fetch(
              `${API_URL}/api/wallet`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
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
              walletData.data
                ?.wallet
                ?.balance || 0
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

  }, [
    packId,
    navigate,
  ]);


  // =====================================================
  // PRICE
  // =====================================================

  const price =
    Number(
      pack?.packPrice ??
      pack?.price ??
      0
    );


  const remainingBalance =
    walletBalance -
    price;


  const insufficientBalance =
    walletBalance <
    price;


  // =====================================================
  // GET IMAGE CANDIDATES
  // =====================================================

  const imageCandidates =
    getCardImageCandidates(
      revealedCard,
      pack,
      userPackCard
    );


  // =====================================================
  // CURRENT IMAGE
  // =====================================================

  const currentCardImage =
    imageCandidates[
      imageIndex
    ] || "";


  // =====================================================
  // RESET IMAGE INDEX
  // =====================================================

  useEffect(() => {
    setImageIndex(0);
  }, [
    revealedCard,
  ]);


  // =====================================================
  // RIP COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (
      !userPackCard
        ?.decisionDeadline
    ) {
      return;
    }


    const updateTimer =
      () => {
        const deadline =
          new Date(
            userPackCard
              .decisionDeadline
          ).getTime();

        const now =
          Date.now();

        const remaining =
          Math.max(
            0,
            deadline -
            now
          );

        setTimeLeft(
          Math.floor(
            remaining /
            1000
          )
        );


        if (
          remaining <= 0 &&
          userPackCard.status ===
            "REVEALED"
        ) {
          setActionMessage(
            "Your decision window has expired. The card will be sold automatically."
          );
        }
      };


    updateTimer();


    const interval =
      setInterval(
        updateTimer,
        1000
      );


    return () =>
      clearInterval(
        interval
      );

  }, [
    userPackCard,
  ]);


  // =====================================================
  // FORMAT TIMER
  // =====================================================

  const formatTime =
    (seconds) => {
      const minutes =
        Math.floor(
          seconds /
          60
        );

      const secs =
        seconds %
        60;

      return `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;
    };


  // =====================================================
  // BUY PACK
  // =====================================================

  const handleBuy =
    async () => {
      if (!pack) {
        return;
      }


      if (
        insufficientBalance
      ) {
        setError(
          "Insufficient wallet balance"
        );

        return;
      }


      if (buying) {
        return;
      }


      try {
        setBuying(true);
        setError("");
        setActionMessage("");


        const token =
          localStorage.getItem(
            "token"
          );


        // ---------------------------------------------
        // CREATE ORDER
        // ---------------------------------------------

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                packId:
                  pack._id,

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


        // ---------------------------------------------
        // GET USER PACK ID
        // ---------------------------------------------

        const createdUserPackId =
          data.data
            ?.userPackId ||
          data.data
            ?.userPack?._id;


        if (
          !createdUserPackId
        ) {
          throw new Error(
            "Purchase completed, but UserPack ID was not returned by the server."
          );
        }


        setUserPackId(
          createdUserPackId
        );


        // ---------------------------------------------
        // UPDATE WALLET
        // ---------------------------------------------

        if (
          data.data
            ?.walletBalance !==
          undefined
        ) {
          setWalletBalance(
            Number(
              data.data
                .walletBalance
            )
          );
        } else {
          setWalletBalance(
            Math.max(
              0,
              walletBalance -
              price
            )
          );
        }


        // ---------------------------------------------
        // OPENING
        // ---------------------------------------------

        setRipStage(
          "opening"
        );


        setBuying(false);


        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1800
            )
        );


        // ---------------------------------------------
        // REVEAL CARD
        // ---------------------------------------------

        await revealCard(
          createdUserPackId
        );

      } catch (err) {
        console.error(
          "Purchase error:",
          err
        );

        setError(
          err.message ||
          "Unable to complete purchase"
        );

        setBuying(false);
      }
    };


  // =====================================================
  // REVEAL CARD
  // =====================================================

  const revealCard =
    async (
      createdUserPackId
    ) => {
      try {
        setRipLoading(true);

        setRipStage(
          "revealing"
        );

        setError("");

        setActionMessage("");


        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await fetch(
            `${API_URL}/api/rip/${createdUserPackId}`,
            {
              method: "POST",

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
            "Unable to reveal card"
          );
        }


        // ---------------------------------------------
        // SAVE REVEALED CARD
        // ---------------------------------------------

        const card =
          data.data?.card ||
          data.card ||
          null;


        const packCard =
          data.data
            ?.userPackCard ||
          data.userPackCard ||
          null;


        console.log(
          "================================"
        );

        console.log(
          "REVEALED CARD FROM SERVER:",
          card
        );

        console.log(
          "USER PACK CARD:",
          packCard
        );

        console.log(
          "CARD IMAGE:",
          card?.image
        );

        console.log(
          "CARD IMAGE SMALL:",
          card?.imageSmall
        );

        console.log(
          "CARD IMAGE LARGE:",
          card?.imageLarge
        );

        console.log(
          "================================"
        );


        setRevealedCard(
          card
        );


        setUserPackCard(
          packCard
        );


        setImageIndex(0);


        // ---------------------------------------------
        // REVEAL ANIMATION
        // ---------------------------------------------

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              900
            )
        );


        setRipStage(
          "revealed"
        );

      } catch (err) {
        console.error(
          "Reveal card error:",
          err
        );

        setError(
          err.message ||
          "Unable to reveal card"
        );

        setRipStage(
          "purchase"
        );

      } finally {
        setRipLoading(false);
      }
    };


  // =====================================================
  // SELL CARD
  // =====================================================

  const handleSell =
    async () => {
      if (
        !userPackId ||
        !userPackCard
      ) {
        return;
      }


      if (
        userPackCard.status !==
        "REVEALED"
      ) {
        return;
      }


      if (
        timeLeft <= 0
      ) {
        setActionMessage(
          "The 5-minute decision window has expired."
        );

        return;
      }


      if (actionLoading) {
        return;
      }


      try {
        setActionLoading(true);

        setError("");

        setActionMessage("");


        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await fetch(
            `${API_URL}/api/rip/${userPackId}/sell`,
            {
              method: "POST",

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
            "Unable to sell card"
          );
        }


        // ---------------------------------------------
        // UPDATE WALLET
        // ---------------------------------------------

        if (
          data.data
            ?.walletBalance !==
          undefined
        ) {
          setWalletBalance(
            Number(
              data.data
                .walletBalance
            )
          );
        }


        // ---------------------------------------------
        // UPDATE USER PACK CARD
        // ---------------------------------------------

        setUserPackCard(
          (previous) => ({
            ...previous,

            status:
              "SOLD",

            soldAt:
              data.data
                ?.userPackCard
                ?.soldAt ||
              new Date()
                .toISOString(),
          })
        );


        setActionMessage(
          `Card sold for $${Number(
            data.data
              ?.soldAmount ||
            0
          ).toFixed(2)}.`
        );

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
        setActionLoading(
          false
        );
      }
    };


  // =====================================================
  // SHIP CARD
  // =====================================================

  const handleShip =
    () => {
      if (
        !userPackId ||
        !userPackCard
      ) {
        return;
      }

      if (
        userPackCard.status !==
        "REVEALED"
      ) {
        return;
      }

      if (
        timeLeft <= 0
      ) {
        setActionMessage(
          "The 5-minute decision window has expired."
        );

        return;
      }

      if (
        Number(walletBalance) < 5
      ) {
        setError(
          "You need at least $5.00 in your wallet to ship this card."
        );

        return;
      }

      setError("");
      setActionMessage("");
      setShowShippingModal(true);
    };


  // =====================================================
  // SHIPPING ADDRESS INPUT
  // =====================================================

  const handleShippingAddressChange =
    (event) => {
      const { name, value } = event.target;

      setShippingAddress(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };


  // =====================================================
  // CONFIRM SHIPPING
  // =====================================================

  const handleConfirmShip =
    async (event) => {
      event.preventDefault();

      if (
        !userPackId ||
        !userPackCard ||
        actionLoading
      ) {
        return;
      }

      const requiredFields = [
        ["fullName", "Full name"],
        ["email", "Email"],
        ["phone", "Phone number"],
        ["addressLine1", "Address"],
        ["city", "City"],
        ["state", "State"],
        ["postalCode", "Postal/PIN code"],
        ["country", "Country"],
      ];

      for (const [field, label] of requiredFields) {
        if (!String(shippingAddress[field] || "").trim()) {
          setError(`${label} is required`);
          return;
        }
      }

      if (Number(walletBalance) < 5) {
        setError("Insufficient wallet balance for the $5 shipping fee.");
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setActionMessage("");

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `${API_URL}/api/rip/${userPackId}/ship`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                fullName: shippingAddress.fullName.trim(),
                email: shippingAddress.email.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                addressLine2: shippingAddress.addressLine2.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                postalCode: shippingAddress.postalCode.trim(),
                country: shippingAddress.country.trim(),
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

        if (
          data.data?.walletBalance !==
          undefined
        ) {
          setWalletBalance(
            Number(data.data.walletBalance)
          );
        } else {
          setWalletBalance(
            (previous) => Math.max(0, Number(previous) - 5)
          );
        }

        setUserPackCard(
          (previous) => ({
            ...previous,
            status: "SHIPPING",
            shippingFee: 5,
            shippingAddress:
              data.data?.userPackCard?.shippingAddress ||
              shippingAddress,
          })
        );

        setShowShippingModal(false);

        setActionMessage(
          "Card has been added to your shipping queue. $5 shipping fee has been charged."
        );
      } catch (err) {
        console.error(
          "Ship card error:",
          err
        );

        setError(
          err.message ||
          "Unable to ship card"
        );
      } finally {
        setActionLoading(false);
      }
    };


  // =====================================================
  // COLLECTION
  // =====================================================

  const handleCollection =
    () => {
      navigate(
        "/collection"
      );
    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f1f1f1]">

        <div className="flex min-h-screen items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <Loader2
              size={34}
              className="animate-spin text-[#238bdc]"
            />

            <p className="text-xs font-bold text-[#777]">
              Loading purchase...
            </p>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // RIP SCREEN
  // =====================================================

  if (
    ripStage === "opening" ||
    ripStage === "revealing" ||
    ripStage === "revealed"
  ) {

    return (
      <main className="min-h-screen overflow-hidden bg-[#08080b] text-white">

        <div className="relative flex min-h-screen flex-col">


          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0 opacity-30">

            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,0.04) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.04) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize:
                  "45px 45px",
              }}
            />

            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]" />

          </div>


          {/* HEADER */}

          <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/collection"
                )
              }
              className="flex items-center gap-2 text-xs font-bold text-white/60 transition hover:text-white"
            >

              <ArrowLeft
                size={16}
              />

              Collection

            </button>


            <img
              src="https://www.ripit.co/assets/ripit-logo-x4.webp"
              alt="RIPIT"
              className="h-9 w-auto"
            />


            <div className="w-[85px]" />

          </header>


          {/* CONTENT */}

          <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-10">


            {/* OPENING */}

            {ripStage !==
              "revealed" && (

              <div className="flex flex-col items-center text-center">

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">

                  {ripStage ===
                  "opening"
                    ? "Pack purchased"
                    : "Revealing your card"}

                </p>


                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">

                  {ripStage ===
                  "opening"
                    ? "Get ready to RIP!"
                    : "What's inside?"}

                </h1>


                <div className="relative mt-10">

                  <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-[80px]" />


                  <div
                    className={`
                      relative flex h-[390px] w-[250px]
                      items-center justify-center
                      rounded-[28px]
                      border-2 border-purple-400/50
                      bg-gradient-to-br
                      from-[#071b46]
                      via-[#4c1d95]
                      to-[#08080b]
                      p-5
                      shadow-[0_0_50px_rgba(124,58,237,0.35)]
                      ${
                        ripStage ===
                        "opening"
                          ? "animate-bounce"
                          : "animate-pulse"
                      }
                    `}
                  >

                    {pack?.image ? (

                      <img
                        src={getFullImageUrl(
                          pack.image
                        )}
                        alt={
                          pack.name
                        }
                        className="max-h-[350px] max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)]"
                      />

                    ) : (

                      <Package
                        size={70}
                        className="text-white/30"
                      />

                    )}

                  </div>

                </div>


                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/50">

                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  {ripStage ===
                  "opening"
                    ? "Opening pack..."
                    : "Finding your card..."}

                </div>

              </div>

            )}


            {/* REVEALED */}

            {ripStage ===
              "revealed" &&
              revealedCard && (

              <div className="w-full max-w-[900px]">


                {/* TITLE */}

                <div className="text-center">

                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">
                    Card Revealed
                  </p>

                  <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                    You pulled something!
                  </h1>

                </div>


                <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-center">


                  {/* CARD IMAGE */}

                  <div className="flex justify-center">

                    <div className="relative">

                      <div className="absolute inset-[-30px] rounded-full bg-purple-600/20 blur-[70px]" />


                      <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-white p-3 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">

                        {currentCardImage ? (

                          <img
                            key={
                              currentCardImage
                            }
                            src={getFullImageUrl(
                              currentCardImage
                            )}
                            alt={
                              revealedCard.name ||
                              "Pokemon card"
                            }

                            onLoad={() => {
                              console.log(
                                "CARD IMAGE LOADED:",
                                getFullImageUrl(
                                  currentCardImage
                                )
                              );
                            }}

                            onError={() => {
                              console.error(
                                "CARD IMAGE FAILED:",
                                getFullImageUrl(
                                  currentCardImage
                                )
                              );

                              setImageIndex(
                                (previous) => {

                                  if (
                                    previous + 1 <
                                    imageCandidates.length
                                  ) {
                                    return previous + 1;
                                  }

                                  return previous;
                                }
                              );
                            }}

                            className="max-h-[510px] w-auto max-w-[340px] object-contain"
                          />

                        ) : (

                          <div className="flex h-[510px] w-[340px] items-center justify-center">

                            <div className="text-center">

                              <AlertCircle
                                size={40}
                                className="mx-auto text-red-400"
                              />

                              <p className="mt-3 text-sm font-bold text-black">
                                Card image unavailable
                              </p>

                              <p className="mt-2 max-w-[280px] text-xs text-gray-500">
                                No image URL was returned by the server.
                              </p>

                            </div>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">


                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                      Your Pull
                    </p>


                    <h2 className="mt-2 text-3xl font-black">

                      {revealedCard.name ||
                        "Unknown Card"}

                    </h2>


                    {revealedCard.rarity && (

                      <p className="mt-2 text-sm font-semibold text-white/50">

                        {revealedCard.rarity}

                      </p>

                    )}


                    {revealedCard.set?.name && (

                      <p className="mt-1 text-xs text-white/40">

                        {revealedCard.set.name}

                        {revealedCard.number
                          ? ` • #${revealedCard.number}`
                          : ""}

                      </p>

                    )}


                    {/* PRICE */}

                    <div className="mt-7 rounded-[20px] border border-purple-400/20 bg-purple-500/10 p-5">

                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
                        Current Card Value
                      </p>


                      <p className="mt-1 text-4xl font-black">

                        $
                        {Number(
                          revealedCard.price ??
                          userPackCard?.marketPrice ??
                          0
                        ).toFixed(2)}

                      </p>

                    </div>


                    {/* TIMER */}

                    {userPackCard?.status ===
                      "REVEALED" && (

                      <div className="mt-5 flex items-center justify-between rounded-[18px] border border-yellow-400/20 bg-yellow-400/10 px-4 py-3">

                        <div className="flex items-center gap-2">

                          <Clock
                            size={17}
                            className="text-yellow-300"
                          />

                          <span className="text-xs font-bold text-white/70">
                            Choose within
                          </span>

                        </div>


                        <span className="text-xl font-black text-yellow-300">

                          {formatTime(
                            timeLeft
                          )}

                        </span>

                      </div>

                    )}


                    {/* ACTION MESSAGE */}

                    {actionMessage && (

                      <div className="mt-4 rounded-[16px] bg-white/5 p-3 text-center text-xs font-bold text-white/70">

                        {actionMessage}

                      </div>

                    )}


                    {/* ERROR */}

                    {error && (

                      <div className="mt-4 flex gap-2 rounded-[16px] bg-red-500/10 p-3 text-xs font-bold text-red-300">

                        <AlertCircle
                          size={15}
                          className="shrink-0"
                        />

                        <span>
                          {error}
                        </span>

                      </div>

                    )}


                    {/* ACTIONS */}

                    {userPackCard?.status ===
                      "REVEALED" && (

                      <div className="mt-5 grid gap-3">


                        {/* SELL */}

                        <button
                          type="button"
                          onClick={
                            handleSell
                          }
                          disabled={
                            actionLoading ||
                            timeLeft <= 0
                          }
                          className="flex min-h-[58px] items-center justify-between rounded-[18px] bg-gradient-to-r from-purple-600 to-purple-500 px-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">

                              {actionLoading ? (

                                <Loader2
                                  size={18}
                                  className="animate-spin"
                                />

                              ) : (

                                <ShoppingCart
                                  size={18}
                                />

                              )}

                            </div>


                            <div>

                              <p className="text-sm font-black">
                                RIP IT / SELL
                              </p>

                              <p className="text-[10px] text-white/60">
                                Credit card value to wallet
                              </p>

                            </div>

                          </div>


                          <span className="text-lg font-black">

                            $
                            {Number(
                              userPackCard.marketPrice ||
                              revealedCard.price ||
                              0
                            ).toFixed(2)}

                          </span>

                        </button>


                        {/* SHIP */}

                        <button
                          type="button"
                          onClick={
                            handleShip
                          }
                          disabled={
                            actionLoading ||
                            timeLeft <= 0
                          }
                          className="flex min-h-[58px] items-center justify-between rounded-[18px] border border-white/15 bg-white/5 px-5 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">

                              <Truck
                                size={18}
                              />

                            </div>


                            <div>

                              <p className="text-sm font-black">
                                SHIP CARD
                              </p>

                              <p className="text-[10px] text-white/50">
                                Physical shipping
                              </p>

                            </div>

                          </div>


                          <span className="text-sm font-black text-yellow-300">
                            - $5.00
                          </span>

                        </button>

                      </div>

                    )}


                    {/* COMPLETED */}

                    {(
                      userPackCard?.status ===
                        "SOLD" ||
                      userPackCard?.status ===
                        "SHIPPING"
                    ) && (

                      <button
                        type="button"
                        onClick={
                          handleCollection
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[18px] bg-white py-4 text-xs font-black text-black transition hover:bg-white/90"
                      >

                        Continue to Collection

                        <ArrowRight
                          size={15}
                        />

                      </button>

                    )}

                  </div>

                </div>

              </div>

            )}

          </section>


          {/* =====================================================
              SHIPPING ADDRESS MODAL
              ===================================================== */}

          {showShippingModal && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget && !actionLoading) {
                  setShowShippingModal(false);
                }
              }}
            >
              <form
                onSubmit={handleConfirmShip}
                className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-[26px] border border-white/10 bg-[#17171c] p-5 text-white shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                      Shipping Details
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      Where should we ship it?
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-white/50">
                      Enter the address where you want this card delivered.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowShippingModal(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white/70 hover:bg-white/15 disabled:opacity-50"
                    aria-label="Close shipping address"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { name: "fullName", label: "Full Name *", placeholder: "Enter full name", type: "text" },
                    { name: "email", label: "Email *", placeholder: "Enter email address", type: "email" },
                    { name: "phone", label: "Contact / Phone *", placeholder: "Enter phone number", type: "tel" },
                    { name: "country", label: "Country *", placeholder: "India", type: "text" },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                        {field.label}
                      </span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={shippingAddress[field.name]}
                        onChange={handleShippingAddressChange}
                        placeholder={field.placeholder}
                        autoComplete={field.name}
                        className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:bg-white/[0.07]"
                      />
                    </label>
                  ))}

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Address Line 1 *
                    </span>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleShippingAddressChange}
                      placeholder="House / Flat / Street address"
                      autoComplete="address-line1"
                      className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:bg-white/[0.07]"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Address Line 2
                    </span>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleShippingAddressChange}
                      placeholder="Apartment, landmark, area (optional)"
                      autoComplete="address-line2"
                      className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:bg-white/[0.07]"
                    />
                  </label>

                  {[
                    { name: "city", label: "City *", placeholder: "Enter city" },
                    { name: "state", label: "State *", placeholder: "Enter state" },
                    { name: "postalCode", label: "PIN / Postal Code *", placeholder: "Enter PIN / postal code" },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                        {field.label}
                      </span>
                      <input
                        type="text"
                        name={field.name}
                        value={shippingAddress[field.name]}
                        onChange={handleShippingAddressChange}
                        placeholder={field.placeholder}
                        autoComplete={field.name === "postalCode" ? "postal-code" : field.name}
                        className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:bg-white/[0.07]"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-6 rounded-[16px] border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-white/60">Shipping fee</span>
                    <span className="font-black text-yellow-300">$5.00</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-white/60">Wallet balance after shipping</span>
                    <span className="font-black text-white">
                      ${Math.max(0, Number(walletBalance) - 5).toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 flex gap-2 rounded-[14px] bg-red-500/10 p-3 text-xs font-bold text-red-300">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowShippingModal(false)}
                    className="h-12 rounded-full border border-white/10 bg-white/5 text-xs font-black text-white/70 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-xs font-black text-white transition hover:shadow-[0_12px_35px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck size={17} />
                        Confirm Shipping — $5
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </main>
    );
  }


  // =====================================================
  // PACK NOT FOUND
  // =====================================================

  if (!pack) {

    return (
      <main className="min-h-screen bg-[#f1f1f1] px-5 py-6">

        <div className="mx-auto w-full max-w-[560px]">

          <header className="flex items-center justify-between">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="flex items-center gap-3"
            >

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">

                <ArrowLeft
                  size={18}
                />

              </span>

              <span className="text-[13px] font-bold text-[#555]">
                Back
              </span>

            </button>


            <img
              src="https://www.ripit.co/assets/ripit-logo-x4.webp"
              alt="RIPIT"
              className="h-10 w-auto"
            />

            <div className="w-[70px]" />

          </header>


          <div className="mt-12 rounded-[28px] bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

              <AlertCircle
                size={32}
                className="text-red-500"
              />

            </div>


            <h2 className="mt-5 text-2xl font-black">
              Pack not found
            </h2>


            <p className="mt-2 text-sm leading-6 text-[#777]">

              {error ||
                "This pack could not be loaded."}

            </p>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2698F3] px-7 py-3 text-xs font-black text-white"
            >

              Go Back

              <ArrowRight
                size={15}
              />

            </button>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // NORMAL PURCHASE PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-[#f1f1f1] font-['Plus_Jakarta_Sans',sans-serif] text-[#101114]">


      {/* HEADER */}

      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between px-5 pb-5 pt-5 sm:px-8">

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-3"
        >

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition hover:-translate-x-0.5">

            <ArrowLeft
              size={18}
              strokeWidth={1.8}
            />

          </span>


          <span className="text-[12px] font-bold text-[#555]">
            Back
          </span>

        </button>


        <img
          src="https://www.ripit.co/assets/ripit-logo-x4.webp"
          alt="RIPIT"
          className="h-10 w-auto object-contain sm:h-11"
        />


        <div className="w-[72px]" />

      </header>


      {/* CONTENT */}

      <section className="mx-auto w-full max-w-[760px] px-4 pb-16 sm:px-6">


        {/* TITLE */}

        <div className="mb-7 text-center">

          <h1 className="text-[34px] font-black leading-tight tracking-[-1.5px] sm:text-[42px]">
            Confirm Purchase
          </h1>

          <p className="mt-2 text-[12px] font-medium text-[#737477] sm:text-[13px]">
            Review your pack before completing your purchase.
          </p>

        </div>


        {/* PACK CARD */}

        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.06)]">


          {/* IMAGE AREA */}

          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#eeeeee] px-8 py-12 sm:min-h-[470px]">

            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: `
                  linear-gradient(
                    30deg,
                    transparent 48%,
                    #d8d8db 50%,
                    transparent 52%
                  ),
                  linear-gradient(
                    150deg,
                    transparent 48%,
                    #d8d8db 50%,
                    transparent 52%
                  )
                `,
                backgroundSize:
                  "72px 72px",
              }}
            />


            <div className="absolute left-[9%] top-[12%] h-14 w-14 rotate-45 rounded-[12px] bg-white/85 sm:h-16 sm:w-16" />

            <div className="absolute right-[9%] top-[12%] h-14 w-14 rotate-45 rounded-[12px] bg-white/85 sm:h-16 sm:w-16" />

            <div className="absolute bottom-[12%] left-[11%] h-12 w-12 rotate-45 rounded-[11px] bg-white/85 sm:h-14 sm:w-14" />

            <div className="absolute bottom-[12%] right-[11%] h-12 w-12 rotate-45 rounded-[11px] bg-white/85 sm:h-14 sm:w-14" />


            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl" />


            {pack.image ? (

              <img
                src={getFullImageUrl(
                  pack.image
                )}
                alt={
                  pack.name
                }
                className="relative z-10 max-h-[330px] max-w-[88%] object-contain drop-shadow-[0_25px_28px_rgba(0,0,0,0.15)] sm:max-h-[400px]"
              />

            ) : (

              <div className="relative z-10 flex h-48 w-36 items-center justify-center rounded-2xl bg-white">

                <Package
                  size={48}
                  className="text-[#bbb]"
                />

              </div>

            )}

          </div>


          {/* PACK INFORMATION */}

          <div className="px-6 pb-7 pt-6 sm:px-9 sm:pb-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                {pack.category?.name && (

                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#238bdc]">

                    {pack.category.name}

                  </p>

                )}


                <h2 className="break-words text-[25px] font-black leading-tight tracking-[-0.9px] sm:text-[30px]">

                  {pack.name}

                </h2>

              </div>


              <div className="flex shrink-0 items-baseline gap-2">

                <span className="text-[30px] font-black tracking-[-1px] sm:text-[34px]">

                  ${price.toFixed(2)}

                </span>


                <span className="text-[11px] font-medium text-[#666]">
                  per pack
                </span>

              </div>

            </div>


            {pack.description && (

              <p className="mt-5 max-w-[560px] text-[12px] leading-5 text-[#6b6c70]">

                {pack.description}

              </p>

            )}

          </div>

        </section>


        {/* WALLET */}

        <section className="mt-5 rounded-[24px] bg-white px-5 py-5 shadow-[0_5px_22px_rgba(0,0,0,0.04)] sm:px-6">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#238bdc]/10">

                <Wallet
                  size={20}
                  className="text-[#238bdc]"
                />

              </div>


              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#9a9a9d]">
                  Wallet Balance
                </p>

                <p className="mt-0.5 text-[20px] font-black">

                  ${walletBalance.toFixed(2)}

                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate("/wallet")
              }
              className="rounded-full px-3 py-2 text-[11px] font-black text-[#238bdc] transition hover:bg-[#238bdc]/10"
            >
              Add Money
            </button>

          </div>

        </section>


        {/* PURCHASE SUMMARY */}

        <section className="mt-5 rounded-[24px] bg-white p-5 shadow-[0_5px_22px_rgba(0,0,0,0.04)] sm:p-6">

          <h3 className="text-[15px] font-black">
            Purchase Summary
          </h3>


          <div className="mt-5 space-y-4">

            <div className="flex items-center justify-between gap-5">

              <span className="text-[12px] font-medium text-[#777]">
                Pack
              </span>

              <span className="max-w-[65%] truncate text-right text-[12px] font-black">
                {pack.name}
              </span>

            </div>


            <div className="flex items-center justify-between">

              <span className="text-[12px] font-medium text-[#777]">
                Quantity
              </span>

              <span className="text-[12px] font-black">
                1
              </span>

            </div>


            <div className="flex items-center justify-between">

              <span className="text-[12px] font-medium text-[#777]">
                Price
              </span>

              <span className="text-[13px] font-black">
                ${price.toFixed(2)}
              </span>

            </div>


            <div className="border-t border-[#ededee] pt-4">

              <div className="flex items-center justify-between">

                <span className="text-[12px] font-black">
                  Balance after purchase
                </span>


                <span
                  className={`text-[14px] font-black ${
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


        {/* SECURITY */}

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-medium text-[#999]">

          <ShieldCheck
            size={14}
            className="text-[#238bdc]"
          />

          Secure purchase through your RIPIT wallet

        </div>


        {/* ERROR */}

        {(error ||
          insufficientBalance) && (

          <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-red-50 p-4 text-[11px] font-bold text-red-600">

            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>

              {error ||
                "Insufficient wallet balance"}

            </span>

          </div>

        )}


        {/* BUY */}

        <button
          type="button"
          onClick={
            handleBuy
          }
          disabled={
            buying ||
            insufficientBalance
          }
          className="
            mt-5
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#2698F3]
            px-6
            text-[13px]
            font-black
            text-white
            shadow-[0_8px_24px_rgba(38,152,243,0.24)]
            transition
            hover:-translate-y-0.5
            hover:bg-[#168ce8]
            active:scale-[0.985]
            disabled:cursor-not-allowed
            disabled:opacity-50
            disabled:shadow-none
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

              <CheckCircle2
                size={18}
              />

              Buy Now — $
              {price.toFixed(2)}

            </>

          )}

        </button>


        <p className="mt-3 text-center text-[10px] leading-5 text-[#999]">

          Amount will be deducted from your wallet
          after the purchase is confirmed.

        </p>

      </section>

    </main>
  );
}