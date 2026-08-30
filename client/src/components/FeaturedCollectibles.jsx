import { useState } from "react";
import {
  CheckSquare,
  Gem,
  Sparkles,
} from "lucide-react";

export default function FeaturedCollectibles({
  cards = [],
}) {
  const [activeTab, setActiveTab] =
    useState("slabs");

  if (!cards || cards.length === 0) {
    return null;
  }

  // Remove null cards and duplicate card IDs
  const validCards = cards
    .filter((card) => card)
    .filter(
      (card, index, array) =>
        index ===
        array.findIndex(
          (item) =>
            String(item?._id) ===
            String(card?._id)
        )
    );

  if (validCards.length === 0) {
    return null;
  }

  const visibleCards =
    validCards.slice(0, 8);

  return (
    <section className="mt-14">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#238bdc]">
            <Sparkles size={12} />
            Collectibles
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-[-0.055em] sm:text-4xl">
            Featured Collectibles
          </h2>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="flex w-fit items-center rounded-full bg-white p-1 shadow-[0_5px_20px_rgba(0,0,0,0.06)]">

          {/* SLABS */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("slabs")
            }
            className={`
              flex
              items-center
              gap-2
              rounded-full
              px-4
              py-2.5
              text-xs
              font-black
              transition-all
              duration-200
              ${
                activeTab === "slabs"
                  ? "bg-[#238bdc] text-white shadow-sm"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            <Gem size={14} />

            Slabs
          </button>

          {/* CHECKLIST */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("checklist")
            }
            className={`
              flex
              items-center
              gap-2
              rounded-full
              px-4
              py-2.5
              text-xs
              font-black
              transition-all
              duration-200
              ${
                activeTab ===
                "checklist"
                  ? "bg-[#238bdc] text-white shadow-sm"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            <CheckSquare size={14} />

            Checklist
          </button>

        </div>

      </div>

      {/* =================================================
          FEATURED CARDS
      ================================================= */}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

        {visibleCards.map(
          (card, index) => {

            // ---------------------------------------------
            // IMAGE
            // ---------------------------------------------

            const image =
              card.imageLarge ||
              card.imageSmall ||
              card.image ||
              "";

            // ---------------------------------------------
            // SET NAME
            // ---------------------------------------------

            const setName =
              typeof card.set ===
              "object"
                ? card.set?.name
                : card.set;

            // ---------------------------------------------
            // CARD NUMBER
            // ---------------------------------------------

            const cardNumber =
              card.number || "";

            // ---------------------------------------------
            // PRICE
            // ---------------------------------------------

            const price =
              card.price !==
                null &&
              card.price !==
                undefined &&
              !Number.isNaN(
                Number(card.price)
              )
                ? Number(card.price)
                : null;

            return (
              <article
                key={
                  card._id ||
                  card.tcgId ||
                  index
                }
                className="
                  group
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-black/[0.05]
                  bg-white
                  shadow-[0_5px_20px_rgba(0,0,0,0.05)]
                  transition-all
                  duration-300
                  hover:-translate-y-1.5
                  hover:border-[#238bdc]/15
                  hover:shadow-[0_14px_35px_rgba(0,0,0,0.10)]
                "
              >

                {/* =================================================
                    CARD IMAGE
                ================================================= */}

                <div
                  className="
                    relative
                    flex
                    h-[230px]
                    items-center
                    justify-center
                    overflow-hidden
                    bg-[#eeeeee]
                    p-4
                    sm:h-[275px]
                  "
                >

                  {/* BACKGROUND DECORATION */}

                  <div className="pointer-events-none absolute inset-0">

                    <div className="absolute left-4 top-4 h-8 w-8 rotate-45 rounded-lg bg-white/70" />

                    <div className="absolute right-4 top-4 h-8 w-8 rotate-45 rounded-lg bg-white/70" />

                    <div className="absolute bottom-4 left-5 h-7 w-7 rotate-45 rounded-lg bg-white/70" />

                    <div className="absolute bottom-4 right-5 h-7 w-7 rotate-45 rounded-lg bg-white/70" />

                    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" />

                  </div>

                  {/* CARD */}

                  {image ? (
                    <img
                      src={image}
                      alt={
                        card.name ||
                        "Pokemon card"
                      }
                      loading="lazy"
                      className="
                        relative
                        z-10
                        h-full
                        w-full
                        object-contain
                        drop-shadow-[0_12px_18px_rgba(0,0,0,0.15)]
                        transition-all
                        duration-500
                        group-hover:scale-[1.045]
                        group-hover:drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)]
                      "
                    />
                  ) : (
                    <div className="relative z-10 text-xs font-bold text-gray-400">
                      No image
                    </div>
                  )}

                </div>

                {/* =================================================
                    CARD INFO
                ================================================= */}

                <div className="p-4">

                  {/* CARD NAME */}

                  <h3
                    className="
                      truncate
                      text-sm
                      font-black
                      tracking-[-0.02em]
                    "
                    title={card.name}
                  >
                    {card.name ||
                      "Unknown Card"}
                  </h3>

                  {/* SET + NUMBER */}

                  {(setName ||
                    cardNumber) && (
                    <p
                      className="
                        mt-1
                        truncate
                        text-[10px]
                        font-semibold
                        text-gray-400
                      "
                    >
                      {setName}

                      {setName &&
                      cardNumber
                        ? " • "
                        : ""}

                      {cardNumber}
                    </p>
                  )}

                  {/* BOTTOM ROW */}

                  <div className="mt-3 flex items-center justify-between gap-2">

                    {/* RARITY */}

                    {card.rarity ? (
                      <span
                        className="
                          max-w-[58%]
                          truncate
                          rounded-full
                          bg-[#238bdc]/10
                          px-2.5
                          py-1
                          text-[9px]
                          font-black
                          text-[#238bdc]
                        "
                        title={card.rarity}
                      >
                        {card.rarity}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* PRICE */}

                    {price !== null && (
                      <span
                        className="
                          shrink-0
                          text-sm
                          font-black
                          tracking-[-0.02em]
                        "
                      >
                        $
                        {price.toFixed(2)}
                      </span>
                    )}

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* =================================================
          CHECKLIST TAB
      ================================================= */}

      {activeTab ===
        "checklist" && (
        <div
          className="
            mt-5
            rounded-[20px]
            border
            border-[#238bdc]/10
            bg-white
            p-5
            text-center
          "
        >

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#238bdc]/10 text-[#238bdc]">
            <CheckSquare size={18} />
          </div>

          <p className="mt-3 text-sm font-black">
            Pack Checklist
          </p>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-400">
            These are the cards currently
            associated with this pack.
          </p>

          <p className="mt-3 text-xs font-bold text-[#238bdc]">
            {validCards.length} cards available
          </p>

        </div>
      )}

    </section>
  );
}