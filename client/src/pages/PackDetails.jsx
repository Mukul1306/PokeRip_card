import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function PackDetails() {
  const { packId } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH PACK
  // =====================================================

  const fetchPack = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/user/packs/${packId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load pack"
        );
      }

      const loadedPack =
        data.data?.pack ||
        data.pack ||
        data.data;

      setPack(loadedPack);
    } catch (err) {
      console.error(
        "Pack details error:",
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

  useEffect(() => {
    if (packId) {
      fetchPack();
    }
  }, [packId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1eff1]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-[#238bdc]"
          />

          <p className="text-xs font-bold text-gray-500">
            Loading pack...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!pack || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1eff1] px-5">
        <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f3f3]">
            <Sparkles
              size={28}
              className="text-gray-400"
            />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Pack not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error ||
              "This pack is no longer available."}
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-6 rounded-full bg-[#2698F3] px-7 py-3 text-xs font-black text-white transition hover:bg-[#168ce8]"
          >
            Back to Packs
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // PRICE
  // =====================================================

 const price = Number(
  pack.price ?? 0
);

  // =====================================================
  // OTHER PACKS
  // =====================================================

  const otherPacks =
    Array.isArray(pack.otherPacks)
      ? pack.otherPacks.filter(
          (item) =>
            String(item._id) !==
            String(pack._id)
        )
      : [];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f1eff1] text-[#111214]">
      <main className="mx-auto min-h-screen w-full max-w-[560px] bg-[#f1eff1] pb-12">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="px-5 pt-5">

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="absolute left-5"
            >
              <img
                src="https://www.ripit.co/assets/ripit-logo-x4.webp"
                alt="RIPIT"
                className="h-[38px] w-auto object-contain"
              />
            </button>

            <img
              src="https://www.ripit.co/assets/ripit-logo-x4.webp"
              alt="RIPIT"
              className="h-[38px] w-auto object-contain opacity-0"
            />
          </div>

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-7 flex items-center gap-3 text-[#55565a]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:-translate-x-0.5">
              <ArrowLeft
                size={19}
                strokeWidth={1.8}
              />
            </span>

            <span className="text-[13px] font-medium">
              Back to packs
            </span>
          </button>
        </header>

        {/* =================================================
            PACK VISUAL
        ================================================= */}

        <section className="relative mt-4 h-[360px] overflow-hidden">

          {/* GRID */}

          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                linear-gradient(
                  30deg,
                  transparent 49.5%,
                  #d9d9dc 50%,
                  transparent 50.5%
                ),
                linear-gradient(
                  150deg,
                  transparent 49.5%,
                  #d9d9dc 50%,
                  transparent 50.5%
                )
              `,
              backgroundSize:
                "72px 72px",
            }}
          />

          {/* DIAMONDS */}

          <div className="absolute left-8 top-5 h-16 w-16 rotate-45 rounded-[14px] bg-white/90" />

          <div className="absolute right-8 top-5 h-16 w-16 rotate-45 rounded-[14px] bg-white/90" />

          <div className="absolute left-12 top-[105px] h-[88px] w-[88px] rotate-45 rounded-[16px] bg-white/90" />

          <div className="absolute right-12 top-[105px] h-[88px] w-[88px] rotate-45 rounded-[16px] bg-white/90" />

          <div className="absolute bottom-7 left-8 h-16 w-16 rotate-45 rounded-[14px] bg-white/90" />

          <div className="absolute bottom-7 right-8 h-16 w-16 rotate-45 rounded-[14px] bg-white/90" />

          {/* CENTER GLOW */}

          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl" />

          {/* PACK IMAGE */}

          <div className="absolute inset-0 z-10 flex items-center justify-center pt-3">

            {pack.image ? (
              <img
                src={pack.image}
                alt={pack.name}
                className="max-h-[330px] max-w-[78%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.16)] transition duration-500 hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-[300px] w-[190px] items-center justify-center">
                <Sparkles
                  size={55}
                  className="text-gray-400"
                />
              </div>
            )}

          </div>
        </section>

        {/* =================================================
            MAIN PACK INFORMATION
        ================================================= */}

        <section className="relative z-20 mx-5 -mt-1 overflow-hidden rounded-[28px] bg-white shadow-[0_5px_25px_rgba(0,0,0,0.05)]">

          <div className="px-5 pb-7 pt-5">

            {/* PACK NAME */}

            <h1 className="break-words text-[34px] font-black leading-[1.05] tracking-[-1.6px] text-[#111214] sm:text-[38px]">
              {pack.name}
            </h1>

            {/* PRICE */}

            <div className="mt-2 flex items-baseline gap-2">

              <span className="text-[28px] font-black tracking-[-0.8px]">
                ${price.toFixed(2)}
              </span>

              <span className="text-[11px] font-medium text-[#626368]">
                per pack
              </span>

            </div>

            {/* DESCRIPTION */}

            <p className="mt-6 max-w-[390px] text-[13px] font-medium leading-[19px] text-[#57585c]">
              {pack.description ||
                "This pack contains one graded and authenticated trading card. Once revealed, it's yours to vault, sell, or ship anytime."}
            </p>

            {/* BUY BUTTON */}

            <div className="mt-6 flex justify-center">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/buy/${pack._id}`
                  )
                }
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#2698F3] px-7 text-[12px] font-black text-white shadow-[0_5px_15px_rgba(38,152,243,0.25)] transition hover:-translate-y-0.5 hover:bg-[#168ce8] active:scale-[0.97]"
              >
                Buy Now
                <ArrowRight
                  size={15}
                />
              </button>

            </div>

          </div>
        </section>

        {/* =================================================
            COLLECTOR PULL RATE
        ================================================= */}

        <section className="mt-8 px-5">

          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-black tracking-[-0.5px]">
              Collector Pull Rate
            </h2>
          </div>

          <div className="mt-3 overflow-hidden rounded-[16px] border border-[#d9d9dc] bg-white">

            {Array.isArray(pack.odds) &&
            pack.odds.length > 0 ? (
              pack.odds.map(
                (odd, index) => (
                  <div
                    key={
                      odd._id ||
                      index
                    }
                    className="flex min-h-[58px] items-center border-b border-[#e8e8ea] last:border-b-0"
                  >

                    {/* ICON */}

                    <div className="flex h-[58px] w-[52px] shrink-0 items-center justify-center border-r border-[#e8e8ea] text-[20px]">
                      {odd.icon ||
                        "💎"}
                    </div>

                    {/* TEXT */}

                    <div className="min-w-0 flex-1 px-3">

                      <p className="text-[12px] font-black text-[#444548]">
                        {odd.rarity}
                      </p>

                      {odd.description && (
                        <p className="mt-0.5 truncate text-[10px] text-[#888]">
                          {
                            odd.description
                          }
                        </p>
                      )}

                    </div>

                    {/* PERCENTAGE */}

                    <div className="px-3 text-[12px] font-black text-[#238bdc]">
                      {
                        odd.percentage
                      }
                      %
                    </div>

                  </div>
                )
              )
            ) : (
              <div className="px-4 py-5 text-center">
                <p className="text-[11px] font-medium text-[#888]">
                  Pull rates will be
                  available soon.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* =================================================
            SWITCH POKEMON PACKS
        ================================================= */}

        <section className="mt-9 px-5">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#238bdc]">
                Explore
              </p>

              <h2 className="mt-1 text-[22px] font-black tracking-[-0.8px]">
                Switch Pokemon Packs
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/packs")
              }
              className="flex items-center gap-1 text-[11px] font-black text-[#238bdc]"
            >
              View all
              <ArrowRight
                size={13}
              />
            </button>

          </div>

          {otherPacks.length > 0 ? (
            <div className="mt-4 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {otherPacks.map(
                (otherPack) => {

                  const otherPrice =
                    Number(
                      otherPack.price ||
                        0
                    );

                  return (
                    <button
                      key={
                        otherPack._id
                      }
                      type="button"
                      onClick={() =>
                        navigate(
                          `/rip/${otherPack._id}`
                        )
                      }
                      className="group w-[125px] shrink-0 text-left"
                    >

                      {/* IMAGE */}

                      <div className="flex h-[140px] items-center justify-center overflow-hidden rounded-[14px] bg-white p-3 shadow-[0_4px_15px_rgba(0,0,0,0.04)]">

                        {otherPack.image ? (
                          <img
                            src={
                              otherPack.image
                            }
                            alt={
                              otherPack.name
                            }
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Sparkles
                            size={26}
                            className="text-gray-400"
                          />
                        )}

                      </div>

                      {/* NAME */}

                      <p className="mt-2 line-clamp-2 text-[11px] font-black leading-[14px]">
                        {
                          otherPack.name
                        }
                      </p>

                      {/* PRICE */}

                      <p className="mt-0.5 text-[10px] font-medium text-[#555]">
                        $
                        {otherPrice.toFixed(
                          2
                        )}
                      </p>

                    </button>
                  );
                }
              )}

            </div>
          ) : (
            <div className="mt-4 rounded-[16px] border border-[#ddd] bg-white px-4 py-5 text-center">
              <p className="text-[11px] text-[#888]">
                More Pokemon packs
                will appear here.
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}