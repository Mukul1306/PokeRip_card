import { useEffect, useMemo, useState } from "react";

import {
  Loader2,
  Save,
  Search,
  Sparkles,
  Package,
  AlertCircle,
} from "lucide-react";

import { motion } from "framer-motion";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function AdminPackOdds() {

  const [packs, setPacks] =
    useState([]);

  const [selectedPackId, setSelectedPackId] =
    useState("");

  const [pack, setPack] =
    useState(null);

  const [cards, setCards] =
    useState([]);

  const [totalWeight, setTotalWeight] =
    useState(0);

  const [loadingPacks, setLoadingPacks] =
    useState(true);

  const [loadingOdds, setLoadingOdds] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");


  // =====================================================
  // GET PACKS
  // =====================================================

  const fetchPacks = async () => {
    try {
      setLoadingPacks(true);

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `${API_URL}/api/admin/packs?limit=100`,
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
            "Unable to load packs"
        );
      }

      setPacks(
        data.data?.packs || []
      );

    } catch (error) {
      console.error(
        "Fetch packs error:",
        error
      );

      alert(error.message);

    } finally {
      setLoadingPacks(false);
    }
  };


  // =====================================================
  // GET ODDS
  // =====================================================

  const fetchOdds = async (
    packId
  ) => {

    if (!packId) {
      setPack(null);
      setCards([]);
      return;
    }

    try {

      setLoadingOdds(true);

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `${API_URL}/api/admin/odds/${packId}`,
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
            "Unable to load odds"
        );
      }

      setPack(
        data.data?.pack || null
      );

      setCards(
        data.data?.cards || []
      );

      setTotalWeight(
        data.data?.totalWeight || 0
      );

    } catch (error) {

      console.error(
        "Fetch odds error:",
        error
      );

      alert(error.message);

    } finally {

      setLoadingOdds(false);

    }
  };


  useEffect(() => {
    fetchPacks();
  }, []);


  // =====================================================
  // SELECT PACK
  // =====================================================

  const handlePackChange = (
    e
  ) => {

    const packId =
      e.target.value;

    setSelectedPackId(
      packId
    );

    fetchOdds(packId);
  };


  // =====================================================
  // CHANGE WEIGHT
  // =====================================================

  const updateWeight = (
    cardId,
    value
  ) => {

    setCards((current) =>
      current.map((item) =>
        item.card?._id === cardId
          ? {
              ...item,
              pullWeight:
                value,
            }
          : item
      )
    );
  };


  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const calculatedTotal =
    useMemo(() => {

      return cards.reduce(
        (total, item) =>
          total +
          Number(
            item.pullWeight || 0
          ),
        0
      );

    }, [cards]);


  // =====================================================
  // CALCULATE CHANCE
  // =====================================================

  const getChance = (
    weight
  ) => {

    if (
      calculatedTotal <= 0
    ) {
      return 0;
    }

    return (
      (Number(weight || 0) /
        calculatedTotal) *
      100
    );
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredCards =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return cards;
      }

      return cards.filter(
        (item) => {

          const card =
            item.card;

          return (
            card?.name
              ?.toLowerCase()
              .includes(query) ||

            card?.tcgId
              ?.toLowerCase()
              .includes(query) ||

            card?.set?.name
              ?.toLowerCase()
              .includes(query)
          );
        }
      );

    }, [
      cards,
      search,
    ]);


  // =====================================================
  // SAVE
  // =====================================================

  const saveOdds = async () => {

    if (!selectedPackId) {
      return;
    }

    if (
      calculatedTotal <= 0
    ) {
      alert(
        "Total weight must be greater than 0"
      );

      return;
    }

    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");

      const payload = {
        cards:
          cards.map((item) => ({
            card:
              item.card._id,

            pullWeight:
              Number(
                item.pullWeight
              ) || 0,
          })),
      };

      const response =
        await fetch(
          `${API_URL}/api/admin/odds/${selectedPackId}`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save odds"
        );
      }

      setTotalWeight(
        data.data?.totalWeight ||
          calculatedTotal
      );

      alert(
        "Pack odds saved successfully"
      );

    } catch (error) {

      console.error(
        "Save odds error:",
        error
      );

      alert(error.message);

    } finally {

      setSaving(false);

    }
  };


  return (
    <div className="space-y-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <p className="text-[10px] font-black tracking-[0.25em] text-[#238bdc]">
          PACK CONFIGURATION
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Pack Odds
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-[#505258]">
          Configure the probability weights used
          by the backend when revealing cards.
        </p>

      </div>


      {/* =================================================
          PACK SELECTOR
      ================================================= */}

      <section className="rounded-2xl border border-black/10 bg-white/60 p-6">

        <div className="max-w-xl">

          <label className="text-[10px] font-black tracking-wider text-[#555]">
            SELECT PACK
          </label>

          <select
            value={selectedPackId}
            onChange={
              handlePackChange
            }
            disabled={
              loadingPacks
            }
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
          >

            <option value="">
              {loadingPacks
                ? "Loading packs..."
                : "Select a pack"}
            </option>

            {packs.map(
              (item) => (

                <option
                  key={
                    item._id
                  }
                  value={
                    item._id
                  }
                >
                  {item.name}
                  {" — "}
                  $
                  {Number(
                    item.price
                  ).toFixed(2)}
                </option>

              )
            )}

          </select>

        </div>

      </section>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!selectedPackId && (

        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/30 text-center">

          <Package
            size={34}
            className="text-[#aaa]"
          />

          <h2 className="mt-4 text-sm font-black">
            Select a pack
          </h2>

          <p className="mt-2 max-w-sm text-xs text-[#777]">
            Choose a pack above to configure
            its card probabilities.
          </p>

        </div>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {selectedPackId &&
        loadingOdds && (

        <div className="flex min-h-[350px] items-center justify-center">

          <Loader2
            size={30}
            className="animate-spin text-[#238bdc]"
          />

        </div>

      )}


      {/* =================================================
          ODDS
      ================================================= */}

      {selectedPackId &&
        !loadingOdds &&
        pack && (

        <div className="space-y-5">

          {/* SUMMARY */}

          <div className="grid gap-4 md:grid-cols-4">

            <SummaryCard
              label="PACK"
              value={
                pack.name
              }
              icon={
                <Package
                  size={17}
                />
              }
            />

            <SummaryCard
              label="PRICE"
              value={`$${Number(
                pack.price
              ).toFixed(2)}`}
              icon={
                <span className="text-sm font-black">
                  $
                </span>
              }
            />

            <SummaryCard
              label="CARDS"
              value={
                cards.length
              }
              icon={
                <Sparkles
                  size={17}
                />
              }
            />

            <SummaryCard
              label="TOTAL WEIGHT"
              value={
                calculatedTotal
              }
              icon={
                <span className="text-sm font-black">
                  %
                </span>
              }
            />

          </div>


          {/* WARNING */}

          {calculatedTotal <=
            0 && (

            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

              <AlertCircle
                size={18}
                className="mt-0.5 text-red-500"
              />

              <div>

                <p className="text-xs font-black text-red-600">
                  Odds are not configured
                </p>

                <p className="mt-1 text-[10px] text-red-500">
                  Add a weight greater than zero
                  to at least one card.
                </p>

              </div>

            </div>

          )}


          {/* TABLE */}

          <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">

            <div className="flex flex-col justify-between gap-4 border-b border-black/10 px-6 py-5 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-sm font-black">
                  Card Probability
                </h2>

                <p className="mt-1 text-[10px] text-[#777]">
                  Adjust weights to control
                  the reveal distribution.
                </p>

              </div>


              <div className="relative">

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
                  placeholder="Search cards..."
                  className="h-9 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-[10px] font-semibold outline-none focus:border-[#238bdc] sm:w-56"
                />

              </div>

            </div>


            {cards.length ===
            0 ? (

              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                <Package
                  size={28}
                  className="text-[#aaa]"
                />

                <p className="mt-3 text-xs font-black">
                  No cards in this pack
                </p>

                <p className="mt-1 text-[10px] text-[#777]">
                  Add cards from the Packs page
                  first.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-black/10 text-left">

                      <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                        CARD
                      </th>

                      <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                        RARITY
                      </th>

                      <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                        WEIGHT
                      </th>

                      <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                        CHANCE
                      </th>

                      <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                        QUANTITY
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredCards.map(
                      (
                        item,
                        index
                      ) => {

                        const card =
                          item.card;

                        const chance =
                          getChance(
                            item.pullWeight
                          );

                        return (

                          <motion.tr
                            key={
                              card._id
                            }
                            initial={{
                              opacity: 0,
                              y: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index *
                                0.03,
                            }}
                            className="border-b border-black/5"
                          >

                            {/* CARD */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <img
                                  src={
                                    card.imageSmall
                                  }
                                  alt={
                                    card.name
                                  }
                                  className="h-16 w-12 rounded-lg object-cover shadow-sm"
                                />

                                <div>

                                  <p className="text-xs font-black">
                                    {
                                      card.name
                                    }
                                  </p>

                                  <p className="mt-1 text-[9px] text-[#888]">
                                    {
                                      card.set
                                        ?.name
                                    }
                                    {" • "}
                                    #
                                    {
                                      card.number
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* RARITY */}

                            <td className="px-6 py-4">

                              <span className="rounded-full bg-black/5 px-3 py-1.5 text-[9px] font-black">
                                {
                                  card.rarity ||
                                  "Unknown"
                                }
                              </span>

                            </td>


                            {/* WEIGHT */}

                            <td className="px-6 py-4">

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.pullWeight
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateWeight(
                                    card._id,
                                    e.target
                                      .value
                                  )
                                }
                                className="h-9 w-28 rounded-lg border border-black/10 bg-white px-3 text-xs font-black outline-none focus:border-[#238bdc]"
                              />

                            </td>


                            {/* CHANCE */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="h-2 w-28 overflow-hidden rounded-full bg-black/5">

                                  <motion.div
                                    animate={{
                                      width:
                                        `${Math.min(
                                          chance,
                                          100
                                        )}%`,
                                    }}
                                    className="h-full rounded-full bg-[#238bdc]"
                                  />

                                </div>

                                <span className="min-w-[55px] text-xs font-black">
                                  {chance.toFixed(
                                    2
                                  )}
                                  %
                                </span>

                              </div>

                            </td>


                            {/* QUANTITY */}

                            <td className="px-6 py-4">

                              <span className="text-xs font-black">
                                {
                                  item.quantity ||
                                  0
                                }
                              </span>

                            </td>

                          </motion.tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}


            {/* FOOTER */}

            <div className="flex flex-col justify-between gap-4 border-t border-black/10 px-6 py-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-[10px] font-black text-[#555]">
                  Total Probability
                </p>

                <p className="mt-1 text-2xl font-black text-[#238bdc]">
                  {calculatedTotal >
                  0
                    ? "100.00%"
                    : "0.00%"}
                </p>

                <p className="mt-1 text-[9px] text-[#888]">
                  Final percentages are
                  calculated from weights.
                </p>

              </div>


              <button
                onClick={
                  saveOdds
                }
                disabled={
                  saving ||
                  cards.length ===
                    0 ||
                  calculatedTotal <=
                    0
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-[#238bdc] px-6 py-3 text-xs font-black text-white hover:bg-[#1678c4] disabled:cursor-not-allowed disabled:opacity-40"
              >

                {saving ? (

                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                ) : (

                  <Save
                    size={15}
                  />

                )}

                Save Odds

              </button>

            </div>

          </section>

        </div>

      )}

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  label,
  value,
  icon,
}) {

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5">

      <div className="flex items-center justify-between">

        <p className="text-[9px] font-black tracking-wider text-[#777]">
          {label}
        </p>

        <div className="text-[#238bdc]">
          {icon}
        </div>

      </div>

      <p className="mt-3 truncate text-xl font-black">
        {value}
      </p>

    </div>
  );
}