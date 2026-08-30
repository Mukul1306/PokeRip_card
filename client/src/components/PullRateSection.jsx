import { Sparkles, Zap, Flame, ArrowRight } from "lucide-react";

const DEFAULT_TIERS = [
  {
    name: "Mega",
    description: "Absolutely insane grails.",
    icon: Sparkles,
    percentage: null,
  },
  {
    name: "Elite",
    description: "Cards you'll love.",
    icon: Zap,
    percentage: null,
  },
  {
    name: "Heat",
    description: "Collector favorites.",
    icon: Flame,
    percentage: null,
  },
];

function formatPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  return `${Number(value).toFixed(3)}%`;
}

export default function PullRateSection({
  tiers = DEFAULT_TIERS,
}) {
  return (
    <section className="mt-10">

      {/* HEADER */}

      <div className="mb-5">

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#238bdc]">
          Your Odds
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
          Collector Pull Rate
        </h2>

      </div>

      {/* TIERS */}

      <div className="space-y-3">

        {tiers.map((tier, index) => {
          const Icon =
            tier.icon ||
            DEFAULT_TIERS[index % DEFAULT_TIERS.length].icon;

          return (
            <div
              key={
                tier.name ||
                `tier-${index}`
              }
              className="group rounded-[22px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)]"
            >

              <div className="flex items-center justify-between gap-4">

                {/* LEFT */}

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#238bdc]/10">
                    <Icon
                      size={21}
                      className="text-[#238bdc]"
                    />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-base font-black">
                      {tier.name}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {tier.description}
                    </p>

                  </div>

                </div>

                {/* RIGHT */}

                {formatPercentage(
                  tier.percentage
                ) ? (
                  <div className="shrink-0 text-right">

                    <p className="text-lg font-black">
                      {formatPercentage(
                        tier.percentage
                      )}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      total
                    </p>

                  </div>
                ) : (
                  <ArrowRight
                    size={17}
                    className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#238bdc]"
                  />
                )}

              </div>

              {/* RANKS */}

              {Array.isArray(
                tier.ranks
              ) &&
                tier.ranks.length > 0 && (
                  <div className="mt-5 border-t border-gray-100 pt-4">

                    <div className="grid gap-3 sm:grid-cols-2">

                      {tier.ranks.map(
                        (rank, rankIndex) => (
                          <div
                            key={
                              rank.rank ||
                              rankIndex
                            }
                            className="rounded-2xl bg-[#f7f7f7] p-3"
                          >

                            <div className="flex items-center justify-between">

                              <span className="text-xs font-black">
                                Rank{" "}
                                {rank.rank ||
                                  rankIndex + 1}
                              </span>

                              {formatPercentage(
                                rank.percentage
                              ) && (
                                <span className="text-xs font-black text-[#238bdc]">
                                  {formatPercentage(
                                    rank.percentage
                                  )}
                                </span>
                              )}

                            </div>

                            {/* CARD PREVIEWS */}

                            {Array.isArray(
                              rank.cards
                            ) &&
                              rank.cards.length >
                                0 && (
                                <div className="mt-3 flex gap-2 overflow-hidden">

                                  {rank.cards
                                    .slice(
                                      0,
                                      4
                                    )
                                    .map(
                                      (
                                        card,
                                        cardIndex
                                      ) => {
                                        const image =
                                          card.imageLarge ||
                                          card.imageSmall ||
                                          card.image;

                                        return (
                                          <div
                                            key={
                                              card._id ||
                                              cardIndex
                                            }
                                            className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white"
                                          >
                                            {image ? (
                                              <img
                                                src={
                                                  image
                                                }
                                                alt={
                                                  card.name ||
                                                  "Pokemon card"
                                                }
                                                className="h-full w-full object-cover"
                                              />
                                            ) : null}
                                          </div>
                                        );
                                      }
                                    )}

                                </div>
                              )}

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

            </div>
          );
        })}

      </div>

    </section>
  );
}