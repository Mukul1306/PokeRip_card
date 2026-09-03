import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";


// =====================================================
// RIP PAGE
// =====================================================

const RipPage = () => {
  const navigate = useNavigate();

  const { userPackId } =
    useParams();

  // ===================================================
  // STATE
  // ===================================================

  const [loading, setLoading] =
    useState(false);

  const [ripLoading, setRipLoading] =
    useState(false);

  const [sellLoading, setSellLoading] =
    useState(false);

  const [shipLoading, setShipLoading] =
    useState(false);

  const [card, setCard] =
    useState(null);

  const [userPackCard, setUserPackCard] =
    useState(null);

  const [pack, setPack] =
    useState(null);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // TIMER
  // ===================================================

  const [timeLeft, setTimeLeft] =
    useState(0);

  // ===================================================
  // SHIPPING POPUP
  // ===================================================

  const [showShippingModal, setShowShippingModal] =
    useState(false);

  // ===================================================
  // SHIPPING ADDRESS
  // ===================================================

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
      country: "India",
    });

  // ===================================================
  // LOAD CARD / EXISTING RIP
  // ===================================================

  useEffect(() => {
    loadRipData();
  }, [userPackId]);


  // ===================================================
  // LOAD RIP DATA
  // ===================================================

  const loadRipData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/api/rip/${userPackId}`
        );

      if (
        response?.data?.success
      ) {
        const data =
          response.data.data || {};

        setCard(
          data.card || null
        );

        setUserPackCard(
          data.userPackCard || null
        );

        setPack(
          data.pack || null
        );

        setWalletBalance(
          Number(
            data.walletBalance || 0
          )
        );

        // ------------------------------------------------
        // EXISTING SHIPPING ADDRESS
        // ------------------------------------------------

        if (
          data.userPackCard
            ?.shippingAddress
        ) {
          setShippingAddress({
            fullName:
              data.userPackCard
                .shippingAddress
                ?.fullName || "",

            email:
              data.userPackCard
                .shippingAddress
                ?.email || "",

            phone:
              data.userPackCard
                .shippingAddress
                ?.phone || "",

            addressLine1:
              data.userPackCard
                .shippingAddress
                ?.addressLine1 || "",

            addressLine2:
              data.userPackCard
                .shippingAddress
                ?.addressLine2 || "",

            city:
              data.userPackCard
                .shippingAddress
                ?.city || "",

            state:
              data.userPackCard
                .shippingAddress
                ?.state || "",

            postalCode:
              data.userPackCard
                .shippingAddress
                ?.postalCode || "",

            country:
              data.userPackCard
                .shippingAddress
                ?.country ||
              "India",
          });
        }

        // ------------------------------------------------
        // TIMER
        // ------------------------------------------------

        if (
          data.userPackCard
            ?.decisionDeadline
        ) {
          updateTimer(
            data.userPackCard
              .decisionDeadline
          );
        }
      }

    } catch (err) {
      console.error(
        "Load RIP data error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        "Unable to load RIP page"
      );

    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // TIMER UPDATE
  // ===================================================

  const updateTimer = (
    deadline
  ) => {
    const end =
      new Date(
        deadline
      ).getTime();

    const now =
      Date.now();

    const remaining =
      Math.max(
        0,
        end - now
      );

    setTimeLeft(
      Math.floor(
        remaining / 1000
      )
    );
  };


  // ===================================================
  // TIMER INTERVAL
  // ===================================================

  useEffect(() => {
    if (
      !userPackCard
        ?.decisionDeadline
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        updateTimer(
          userPackCard
            .decisionDeadline
        );
      }, 1000);

    return () =>
      clearInterval(
        interval
      );
  }, [
    userPackCard,
  ]);


  // ===================================================
  // FORMAT TIMER
  // ===================================================

  const formatTime = () => {
    const minutes =
      Math.floor(
        timeLeft / 60
      );

    const seconds =
      timeLeft % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };


  // ===================================================
  // HANDLE ADDRESS CHANGE
  // ===================================================

  const handleAddressChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setShippingAddress(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );
  };


  // ===================================================
  // OPEN SHIPPING MODAL
  // ===================================================

  const openShippingModal = () => {
    setError("");
    setSuccess("");

    setShowShippingModal(
      true
    );
  };


  // ===================================================
  // CLOSE SHIPPING MODAL
  // ===================================================

  const closeShippingModal = () => {
    if (
      shipLoading
    ) {
      return;
    }

    setShowShippingModal(
      false
    );
  };


  // ===================================================
  // VALIDATE SHIPPING ADDRESS
  // ===================================================

  const validateShippingAddress =
    () => {
      if (
        !shippingAddress
          .fullName
          .trim()
      ) {
        return "Full name is required";
      }

      if (
        !shippingAddress
          .email
          .trim()
      ) {
        return "Email is required";
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          shippingAddress.email.trim()
        )
      ) {
        return "Please enter a valid email address";
      }

      if (
        !shippingAddress
          .phone
          .trim()
      ) {
        return "Phone number is required";
      }

      if (
        !shippingAddress
          .addressLine1
          .trim()
      ) {
        return "Address is required";
      }

      if (
        !shippingAddress
          .city
          .trim()
      ) {
        return "City is required";
      }

      if (
        !shippingAddress
          .state
          .trim()
      ) {
        return "State is required";
      }

      if (
        !shippingAddress
          .postalCode
          .trim()
      ) {
        return "Postal code is required";
      }

      if (
        !shippingAddress
          .country
          .trim()
      ) {
        return "Country is required";
      }

      return "";
    };


  // ===================================================
  // RIP CARD
  // ===================================================

  const handleRip = async () => {
    try {
      setRipLoading(true);
      setError("");
      setSuccess("");

      const response =
        await api.post(
          `/api/rip/${userPackId}`
        );

      if (
        response?.data?.success
      ) {
        const data =
          response.data.data || {};

        setCard(
          data.card || null
        );

        setUserPackCard(
          data.userPackCard || null
        );

        setPack(
          data.pack || null
        );

        if (
          data.walletBalance !==
          undefined
        ) {
          setWalletBalance(
            Number(
              data.walletBalance
            )
          );
        }

        setSuccess(
          "Card revealed successfully!"
        );
      }

    } catch (err) {
      console.error(
        "RIP error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        "Unable to rip card"
      );

    } finally {
      setRipLoading(false);
    }
  };


  // ===================================================
  // SELL CARD
  // ===================================================

  const handleSell = async () => {
    try {
      setSellLoading(true);
      setError("");
      setSuccess("");

      const response =
        await api.post(
          `/api/rip/${userPackId}/sell`
        );

      if (
        response?.data?.success
      ) {
        const data =
          response.data.data || {};

        if (
          data.walletBalance !==
          undefined
        ) {
          setWalletBalance(
            Number(
              data.walletBalance
            )
          );
        }

        setUserPackCard(
          (previous) => ({
            ...(previous || {}),
            ...(data.userPackCard || {}),
            status: "SOLD",
          })
        );

        setSuccess(
          `Card sold successfully! $${Number(
            data.soldAmount || 0
          ).toFixed(2)} added to your wallet.`
        );
      }

    } catch (err) {
      console.error(
        "Sell card error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
        "Unable to sell card"
      );

    } finally {
      setSellLoading(false);
    }
  };


  // ===================================================
  // CONFIRM SHIPPING
  // ===================================================

  const handleConfirmShipping =
    async () => {
      const validationError =
        validateShippingAddress();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      // ------------------------------------------------
      // CHECK $5 LOCALLY
      // ------------------------------------------------

      if (
        Number(
          walletBalance
        ) < 5
      ) {
        setError(
          "You need at least $5 in your wallet for shipping."
        );

        return;
      }

      try {
        setShipLoading(true);
        setError("");
        setSuccess("");

        // ------------------------------------------------
        // SEND COMPLETE ADDRESS
        // ------------------------------------------------

        const payload = {
          fullName:
            shippingAddress.fullName.trim(),

          email:
            shippingAddress.email.trim(),

          phone:
            shippingAddress.phone.trim(),

          addressLine1:
            shippingAddress.addressLine1.trim(),

          addressLine2:
            shippingAddress.addressLine2.trim(),

          city:
            shippingAddress.city.trim(),

          state:
            shippingAddress.state.trim(),

          postalCode:
            shippingAddress.postalCode.trim(),

          country:
            shippingAddress.country.trim(),
        };

        const response =
          await api.post(
            `/api/rip/${userPackId}/ship`,
            payload
          );

        if (
          response?.data?.success
        ) {
          const data =
            response.data.data || {};

          // ----------------------------------------------
          // UPDATE WALLET
          // ----------------------------------------------

          if (
            data.walletBalance !==
            undefined
          ) {
            setWalletBalance(
              Number(
                data.walletBalance
              )
            );
          } else {
            setWalletBalance(
              (previous) =>
                Math.max(
                  0,
                  Number(
                    previous
                  ) - 5
                )
            );
          }

          // ----------------------------------------------
          // UPDATE CARD STATUS
          // ----------------------------------------------

          setUserPackCard(
            (previous) => ({
              ...(previous || {}),
              ...(data.userPackCard || {}),
              status:
                "SHIPPING",
            })
          );

          // ----------------------------------------------
          // CLOSE POPUP
          // ----------------------------------------------

          setShowShippingModal(
            false
          );

          // ----------------------------------------------
          // SUCCESS
          // ----------------------------------------------

          setSuccess(
            "Card added to shipping successfully!"
          );
        }

      } catch (err) {
        console.error(
          "Shipping error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
          "Unable to ship card"
        );

      } finally {
        setShipLoading(false);
      }
    };


  // ===================================================
  // PRICE
  // ===================================================

  const cardPrice =
    Number(
      card?.marketPrice ??
      card?.price ??
      userPackCard?.marketPrice ??
      0
    );


  // ===================================================
  // SELL AMOUNT
  // ===================================================

  const sellAmount =
    Number(
      (
        cardPrice *
        0.8
      ).toFixed(2)
    );


  // ===================================================
  // STATUS
  // ===================================================

  const cardStatus =
    userPackCard?.status ||
    "REVEALED";


  // ===================================================
  // LOADING
  // ===================================================

  if (
    loading
  ) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          fontSize:
            "20px",
        }}
      >
        Loading...
      </div>
    );
  }


  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",

        padding:
          "40px 20px",

        background:
          "#f5f5f5",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          maxWidth:
            "1100px",

          margin:
            "0 auto 30px",

          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",
        }}
      >

        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            padding:
              "10px 18px",

            border:
              "1px solid #ddd",

            borderRadius:
              "8px",

            background:
              "#fff",

            cursor:
              "pointer",
          }}
        >
          ← Back
        </button>


        <div>
          <strong>
            Wallet: $
            {Number(
              walletBalance
            ).toFixed(2)}
          </strong>
        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          style={{
            maxWidth:
              "700px",

            margin:
              "0 auto 20px",

            padding:
              "14px",

            borderRadius:
              "8px",

            background:
              "#ffe5e5",

            color:
              "#b00020",
          }}
        >
          {error}
        </div>
      )}


      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div
          style={{
            maxWidth:
              "700px",

            margin:
              "0 auto 20px",

            padding:
              "14px",

            borderRadius:
              "8px",

            background:
              "#e7f8ed",

            color:
              "#16753b",
          }}
        >
          {success}
        </div>
      )}


      {/* =================================================
          CARD
      ================================================= */}

      <div
        style={{
          maxWidth:
            "700px",

          margin:
            "0 auto",

          background:
            "#fff",

          borderRadius:
            "16px",

          padding:
            "30px",

          boxShadow:
            "0 5px 25px rgba(0,0,0,0.08)",

          textAlign:
            "center",
        }}
      >

        {card?.imageLarge ||
        card?.imageSmall ? (
          <img
            src={
              card.imageLarge ||
              card.imageSmall
            }
            alt={
              card.name ||
              "Pokemon Card"
            }
            style={{
              width:
                "280px",

              maxWidth:
                "100%",

              borderRadius:
                "12px",

              marginBottom:
                "20px",
            }}
          />
        ) : (
          <div
            style={{
              height:
                "350px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              background:
                "#eee",

              borderRadius:
                "12px",

              marginBottom:
                "20px",
            }}
          >
            No card image
          </div>
        )}


        <h1>
          {card?.name ||
            "Pokemon Card"}
        </h1>


        {card?.set?.name && (
          <p>
            Set:{" "}
            {card.set.name}
          </p>
        )}


        {card?.rarity && (
          <p>
            Rarity:{" "}
            {card.rarity}
          </p>
        )}


        {/* =================================================
            PRICE
        ================================================= */}

        <div
          style={{
            margin:
              "20px 0",
          }}
        >

          <div
            style={{
              fontSize:
                "15px",

              color:
                "#777",
            }}
          >
            Current Card Value
          </div>

          <div
            style={{
              fontSize:
                "32px",

              fontWeight:
                "700",
            }}
          >
            $
            {cardPrice.toFixed(
              2
            )}
          </div>

        </div>


        {/* =================================================
            TIMER
        ================================================= */}

        {cardStatus ===
          "REVEALED" && (
          <div
            style={{
              margin:
                "20px 0",

              padding:
                "15px",

              borderRadius:
                "10px",

              background:
                "#fff5d6",
            }}
          >

            <div>
              Decision time remaining
            </div>

            <strong
              style={{
                fontSize:
                  "28px",
              }}
            >
              {formatTime()}
            </strong>

          </div>
        )}


        {/* =================================================
            SELL / SHIP
        ================================================= */}

        {cardStatus ===
          "REVEALED" && (
          <div
            style={{
              display:
                "flex",

              gap:
                "12px",

              justifyContent:
                "center",

              flexWrap:
                "wrap",

              marginTop:
                "25px",
            }}
          >

            {/* ============================================
                SELL
            ============================================ */}

            <button
              disabled={
                sellLoading ||
                shipLoading ||
                timeLeft <= 0
              }
              onClick={
                handleSell
              }
              style={{
                padding:
                  "14px 28px",

                border:
                  "none",

                borderRadius:
                  "10px",

                background:
                  "#222",

                color:
                  "#fff",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              {sellLoading
                ? "Selling..."
                : `Sell for $${sellAmount.toFixed(
                    2
                  )}`}
            </button>


            {/* ============================================
                SHIP
            ============================================ */}

            <button
              disabled={
                sellLoading ||
                shipLoading ||
                timeLeft <= 0
              }
              onClick={
                openShippingModal
              }
              style={{
                padding:
                  "14px 28px",

                border:
                  "none",

                borderRadius:
                  "10px",

                background:
                  "#1976d2",

                color:
                  "#fff",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              Ship Card - $5
            </button>

          </div>
        )}


        {/* =================================================
            SOLD
        ================================================= */}

        {cardStatus ===
          "SOLD" && (
          <div
            style={{
              marginTop:
                "25px",

              padding:
                "16px",

              borderRadius:
                "10px",

              background:
                "#e7f8ed",

              color:
                "#16753b",

              fontWeight:
                "600",
            }}
          >
            Card sold successfully.
          </div>
        )}


        {/* =================================================
            SHIPPING
        ================================================= */}

        {cardStatus ===
          "SHIPPING" && (
          <div
            style={{
              marginTop:
                "25px",

              padding:
                "16px",

              borderRadius:
                "10px",

              background:
                "#e8f1ff",

              color:
                "#1757a6",

              fontWeight:
                "600",
            }}
          >
            Card is being prepared for shipping.
          </div>
        )}


        {/* =================================================
            SHIPPED
        ================================================= */}

        {cardStatus ===
          "SHIPPED" && (
          <div
            style={{
              marginTop:
                "25px",

              padding:
                "16px",

              borderRadius:
                "10px",

              background:
                "#e7f8ed",

              color:
                "#16753b",

              fontWeight:
                "600",
            }}
          >
            Card has been shipped.
          </div>
        )}

      </div>


      {/* ===================================================
          SHIPPING ADDRESS MODAL
      =================================================== */}

      {showShippingModal && (
        <div
          style={{
            position:
              "fixed",

            inset:
              0,

            background:
              "rgba(0,0,0,0.6)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              "20px",

            zIndex:
              9999,
          }}
        >

          <div
            style={{
              width:
                "100%",

              maxWidth:
                "650px",

              maxHeight:
                "90vh",

              overflowY:
                "auto",

              background:
                "#fff",

              borderRadius:
                "16px",

              padding:
                "25px",

              boxShadow:
                "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >

            {/* ===========================================
                MODAL HEADER
            =========================================== */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                marginBottom:
                  "20px",
              }}
            >

              <h2
                style={{
                  margin:
                    0,
                }}
              >
                Shipping Address
              </h2>

              <button
                onClick={
                  closeShippingModal
                }
                disabled={
                  shipLoading
                }
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  fontSize:
                    "25px",

                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* ===========================================
                SHIPPING INFO
            =========================================== */}

            <div
              style={{
                padding:
                  "14px",

                marginBottom:
                  "20px",

                background:
                  "#fff7e6",

                borderRadius:
                  "10px",
              }}
            >

              <strong>
                Shipping Fee: $5.00
              </strong>

              <div
                style={{
                  marginTop:
                    "5px",

                  fontSize:
                    "14px",

                  color:
                    "#666",
                }}
              >
                Your current wallet balance:
                {" "}
                $
                {Number(
                  walletBalance
                ).toFixed(2)}
              </div>

            </div>


            {/* ===========================================
                FORM
            =========================================== */}

            <div
              style={{
                display:
                  "grid",

                gap:
                  "14px",
              }}
            >

              {/* FULL NAME */}

              <div>
                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={
                    shippingAddress.fullName
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter full name"
                  autoComplete="name"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* EMAIL */}

              <div>
                <label>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    shippingAddress.email
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter email address"
                  autoComplete="email"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* PHONE */}

              <div>
                <label>
                  Contact / Phone *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    shippingAddress.phone
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* ADDRESS LINE 1 */}

              <div>
                <label>
                  Address Line 1 *
                </label>

                <input
                  type="text"
                  name="addressLine1"
                  value={
                    shippingAddress.addressLine1
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="House number, street, area"
                  autoComplete="street-address"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* ADDRESS LINE 2 */}

              <div>
                <label>
                  Address Line 2
                </label>

                <input
                  type="text"
                  name="addressLine2"
                  value={
                    shippingAddress.addressLine2
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Apartment, landmark, etc. (optional)"
                  autoComplete="address-line2"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* CITY */}

              <div>
                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  value={
                    shippingAddress.city
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter city"
                  autoComplete="address-level2"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* STATE */}

              <div>
                <label>
                  State *
                </label>

                <input
                  type="text"
                  name="state"
                  value={
                    shippingAddress.state
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter state"
                  autoComplete="address-level1"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* POSTAL CODE */}

              <div>
                <label>
                  Postal / PIN Code *
                </label>

                <input
                  type="text"
                  name="postalCode"
                  value={
                    shippingAddress.postalCode
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter postal code"
                  autoComplete="postal-code"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>


              {/* COUNTRY */}

              <div>
                <label>
                  Country *
                </label>

                <input
                  type="text"
                  name="country"
                  value={
                    shippingAddress.country
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter country"
                  autoComplete="country-name"
                  style={{
                    width:
                      "100%",

                    padding:
                      "12px",

                    marginTop:
                      "6px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

            </div>


            {/* ===========================================
                MODAL ERROR
            =========================================== */}

            {error && (
              <div
                style={{
                  marginTop:
                    "15px",

                  padding:
                    "12px",

                  borderRadius:
                    "8px",

                  background:
                    "#ffe5e5",

                  color:
                    "#b00020",
                }}
              >
                {error}
              </div>
            )}


            {/* ===========================================
                BUTTONS
            =========================================== */}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "12px",

                marginTop:
                  "25px",

                justifyContent:
                  "flex-end",
              }}
            >

              <button
                type="button"
                onClick={
                  closeShippingModal
                }
                disabled={
                  shipLoading
                }
                style={{
                  padding:
                    "12px 20px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "8px",

                  background:
                    "#fff",

                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleConfirmShipping
                }
                disabled={
                  shipLoading
                }
                style={{
                  padding:
                    "12px 20px",

                  border:
                    "none",

                  borderRadius:
                    "8px",

                  background:
                    "#1976d2",

                  color:
                    "#fff",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600",
                }}
              >
                {shipLoading
                  ? "Processing..."
                  : "Confirm Shipping - $5"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default RipPage;