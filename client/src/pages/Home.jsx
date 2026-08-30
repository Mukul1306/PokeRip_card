import { motion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Gem,
  Play,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
  Zap,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import PackCard from "../components/PackCard";
import SwitchPacks from "../components/SwitchPacks";
import FeaturedCollectibles from "../components/FeaturedCollectibles";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// =====================================================
// HERO CARD DATA
// =====================================================

const heroCards = [
  {
    name: "Charizard",
    image:
      "https://images.pokemontcg.io/base1/4_hires.png",
  },
  {
    name: "Pikachu",
    image:
      "https://images.pokemontcg.io/base1/58_hires.png",
  },
  {
    name: "Venusaur",
    image:
      "https://images.pokemontcg.io/base1/15_hires.png",
  },
  {
    name: "Blastoise",
    image:
      "https://images.pokemontcg.io/base1/2_hires.png",
  },
  {
    name: "Alakazam",
    image:
      "https://images.pokemontcg.io/base1/1_hires.png",
  },
  {
    name: "Chansey",
    image:
      "https://images.pokemontcg.io/base1/3_hires.png",
  },
  {
    name: "Clefairy",
    image:
      "https://images.pokemontcg.io/base1/5_hires.png",
  },
  {
    name: "Gyarados",
    image:
      "https://images.pokemontcg.io/base1/6_hires.png",
  },
  {
    name: "Hitmonchan",
    image:
      "https://images.pokemontcg.io/base1/7_hires.png",
  },
  {
    name: "Machamp",
    image:
      "https://images.pokemontcg.io/base1/8_hires.png",
  },
];

// =====================================================
// SAFE IMAGE
// =====================================================

function SafeImage({
  src,
  alt,
  className = "",
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        e.currentTarget.style.opacity = "0";
      }}
    />
  );
}

// =====================================================
// HOME
// =====================================================

export default function Home() {
  const [packs, setPacks] = useState([]);
  const [loadingPacks, setLoadingPacks] =
    useState(true);

  // =====================================================
  // LOAD REAL PACK DATA
  // =====================================================

  useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoadingPacks(true);

        const response = await fetch(
          `${API_URL}/api/user/packs`
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            `Server returned ${response.status} instead of JSON`
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load packs"
          );
        }

        const loadedPacks =
          data.data?.packs ||
          data.packs ||
          [];

        setPacks(
          Array.isArray(loadedPacks)
            ? loadedPacks
            : []
        );
      } catch (error) {
        console.error(
          "Home packs error:",
          error
        );

        setPacks([]);
      } finally {
        setLoadingPacks(false);
      }
    };

    loadPacks();
  }, []);

  // =====================================================
  // REAL FEATURED CARDS
  //
  // userPackController now populates:
  // cards.card
  //
  // Therefore Home can use:
  // name
  // imageSmall
  // imageLarge
  // price
  // rarity
  // set
  // number
  // =====================================================

  const apiCards = packs
    .flatMap((pack) =>
      Array.isArray(pack.cards)
        ? pack.cards
        : []
    )
    .map((item) =>
      item?.card || item
    )
    .filter(Boolean);

  // Remove duplicate cards
  const featuredCards = apiCards.filter(
    (card, index, array) => {
      const currentId =
        card?._id ||
        card?.tcgId ||
        `${card?.name}-${index}`;

      return (
        index ===
        array.findIndex((item) => {
          const itemId =
            item?._id ||
            item?.tcgId ||
            item?.name;

          return (
            String(itemId) ===
            String(currentId)
          );
        })
      );
    }
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif] text-[#101114]">

      {/* =================================================
          FONT
      ================================================= */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">

        <Link to="/">
          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <Link
          to="/login"
          className="rounded-full bg-[#238bdc] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#177bc9]"
        >
          Sign in
        </Link>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize:
              "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pt-16 lg:px-12">

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >

            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#238bdc]">
              Premium Collecting
            </p>

            <h1 className="max-w-5xl text-[3.6rem] font-black leading-[0.91] tracking-[-0.07em] sm:text-7xl lg:text-[7rem]">
              Unlock the Joy
              <br />
              of Collecting
            </h1>

            <p className="mt-7 max-w-2xl text-[15px] font-medium leading-6 text-[#505258] sm:text-lg">
              Rip digital packs to reveal real,
              graded Pokemon and sports cards.
              Vault, sell or ship slabs and
              build your collection.
            </p>

            <Link
              to="/packs"
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#238bdc] px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(35,139,220,.3)] transition duration-300 hover:-translate-y-1 hover:bg-[#177bc9]"
            >
              Start Ripping

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </motion.div>

          <CardSpinner />

        </div>
      </section>

      {/* =================================================
          CROWN JEWEL
      ================================================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="text-center"
        >

          <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
            Introducing the Crown
            <br />
            Jewel.
            <br />
            Any pack. Any rip.
          </h2>

        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="relative mt-9 overflow-hidden rounded-[28px] border border-[#c8a54e] bg-[#dfc17a] p-5 sm:p-8"
        >

          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center gap-2 text-2xl font-black text-[#a77b1c]">
              Crown Jewel

              <Crown
                size={22}
                fill="currentColor"
              />
            </div>

            <div className="relative mx-auto flex h-[300px] max-w-lg items-center justify-center">

              <SafeImage
                src="https://images.pokemontcg.io/base1/15_hires.png"
                alt=""
                className="absolute left-4 h-36 w-24 rotate-[-10deg] object-contain opacity-80"
              />

              <SafeImage
                src="https://images.pokemontcg.io/base1/2_hires.png"
                alt=""
                className="absolute right-4 h-36 w-24 rotate-[10deg] object-contain opacity-80"
              />

              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotateZ: [-1, 1, -1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="relative z-10 h-[245px] w-[165px] overflow-hidden rounded-lg bg-white shadow-[0_20px_35px_rgba(0,0,0,.25)]"
              >

                <SafeImage
                  src="https://images.pokemontcg.io/base1/58_hires.png"
                  alt="Crown Jewel"
                  className="h-full w-full object-contain"
                />

              </motion.div>

            </div>

            <p className="text-[11px] font-bold text-[#99721d]">
              Pikachu • Japanese Insert • Attached
            </p>

            <h3 className="mt-2 text-2xl font-black">
              CoroCoro #223
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68531e]">
              The BGS 8.0 CoroCoro #223 from
              November 1996 — the Japanese
              magazine that birthed the Pokémon
              Trading Card Game, complete with
              the Glossy Ivy Pikachu and
              Jigglypuff.
            </p>

            <p className="mt-3 text-lg font-black">
              Est. $150,000
            </p>

          </div>

        </motion.div>

      </section>

      {/* =================================================
          LIVE MEGA RIPS
      ================================================= */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">

        <div className="overflow-hidden rounded-[28px] bg-black">

          <div className="relative aspect-[16/9]">

            <SafeImage
              src="https://images.pokemontcg.io/base1/4_hires.png"
              alt="Live Mega Rip"
              className="absolute inset-0 h-full w-full object-contain opacity-80"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            <button
              type="button"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-110"
            >
              <Play
                size={22}
                fill="currentColor"
              />
            </button>

          </div>

        </div>

        <h2 className="mt-12 text-5xl font-black tracking-[-.06em] sm:text-7xl">
          Live Mega Rips
        </h2>

      </section>

      {/* =================================================
          REAL PACKS
      ================================================= */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">

        <div className="rounded-[30px] bg-[#e5e6e8] p-5 sm:p-8">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#238bdc]">
                Choose Your Pack
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-.06em] sm:text-5xl">
                Available Packs
              </h2>

            </div>

            <Link
              to="/packs"
              className="hidden items-center gap-2 text-sm font-black text-[#238bdc] sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingPacks ? (
            <div className="flex min-h-[250px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <Loader2
                  size={30}
                  className="animate-spin text-[#238bdc]"
                />

                <p className="text-sm font-bold text-gray-500">
                  Loading packs...
                </p>

              </div>

            </div>
          ) : packs.length > 0 ? (

            <div className="mt-8 flex gap-5 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {packs.map((pack) => (
                <PackCard
                  key={pack._id}
                  pack={pack}
                />
              ))}

            </div>

          ) : (

            <div className="mt-8 rounded-[24px] bg-white p-10 text-center">

              <p className="text-sm font-bold text-gray-500">
                No packs are available right now.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          SWITCH POKEMON PACKS
      ================================================= */}

      {packs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">

          <SwitchPacks
            packs={packs}
          />

        </section>
      )}

      {/* =================================================
          FEATURED COLLECTIBLES
      ================================================= */}

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">

        {featuredCards.length > 0 ? (
          <FeaturedCollectibles
            cards={featuredCards}
          />
        ) : (
          <div className="rounded-[28px] bg-white p-10 text-center">

            <p className="text-sm font-bold text-gray-500">
              No featured collectibles are available yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Cards will appear here when published
              packs contain available card data.
            </p>

          </div>
        )}

      </section>

      {/* =================================================
          TRUST
      ================================================= */}

      <section className="border-t border-black/10 bg-[#d6d7d9]">

        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-8">

          <Feature
            icon={ShieldCheck}
            title="Authentic Cards"
            text="Every collectible is authenticated and protected."
          />

          <Feature
            icon={WalletCards}
            title="Vault Your Pull"
            text="Keep your cards safely stored until you're ready."
          />

          <Feature
            icon={Truck}
            title="Ship It Home"
            text="Choose delivery whenever you want your physical card."
          />

        </div>

      </section>

    </main>
  );
}

// =====================================================
// CARD SPINNER
// =====================================================

function CardSpinner() {
  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) %
          heroCards.length
      );
    }, 900);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto mt-10 h-[410px] max-w-6xl sm:h-[540px]">

      {/* =================================================
          GLOW
      ================================================= */}

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"
      />

      {/* =================================================
          CARDS
      ================================================= */}

      {[-2, -1, 0, 1, 2].map(
        (offset) => {
          const index =
            (activeIndex +
              offset +
              heroCards.length) %
            heroCards.length;

          const card =
            heroCards[index];

          const isCenter =
            offset === 0;

          const positions = {
            "-2": {
              x: -390,
              rotate: -18,
              scale: 0.62,
              opacity: 0.3,
            },

            "-1": {
              x: -230,
              rotate: -10,
              scale: 0.78,
              opacity: 0.6,
            },

            "0": {
              x: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
            },

            "1": {
              x: 230,
              rotate: 10,
              scale: 0.78,
              opacity: 0.6,
            },

            "2": {
              x: 390,
              rotate: 18,
              scale: 0.62,
              opacity: 0.3,
            },
          };

          const position =
            positions[offset];

          return (
            <motion.div
              key={`${card.name}-${index}`}
              animate={{
                x: position.x,
                rotate:
                  position.rotate,
                scale:
                  position.scale,
                opacity:
                  position.opacity,
                y: isCenter ? -5 : 20,
              }}
              transition={{
                duration: 0.1,
                ease: "linear",
              }}
              whileHover={
                isCenter
                  ? {
                      y: -18,
                      scale: 1.04,
                    }
                  : undefined
              }
              className="absolute left-1/2 top-1/2 h-[340px] w-[220px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-[6px] border-[#25272b] bg-white shadow-[0_30px_70px_rgba(0,0,0,.3)] sm:h-[500px] sm:w-[320px]"
              style={{
                zIndex: isCenter
                  ? 20
                  : 10 -
                    Math.abs(
                      offset
                    ),
              }}
            >

              {/* HEADER */}

              <div className="border-b-[5px] border-[#d82d38] bg-[#f4f4f4] px-3 py-3">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[8px] font-black sm:text-[11px]">
                      POKÉMON TCG
                    </p>

                    <p className="text-[7px] font-bold text-[#555] sm:text-[9px]">
                      COLLECTIBLE CARD
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[8px] font-black">
                      GEM MT
                    </p>

                    <p className="text-[7px] font-bold text-[#555]">
                      10
                    </p>

                  </div>

                </div>

              </div>

              {/* CARD */}

              <div className="h-[calc(100%-65px)] p-3">

                <SafeImage
                  src={card.image}
                  alt={card.name}
                  className="h-full w-full object-contain"
                />

              </div>

              {/* SHINE */}

              <motion.div
                animate={{
                  x: [
                    "-200%",
                    "250%",
                  ],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute top-0 z-30 h-full w-20 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent blur-md"
              />

            </motion.div>
          );
        }
      )}

      {/* =================================================
          CENTER GLOW
      ================================================= */}

      <motion.div
        animate={{
          opacity: [
            0.15,
            0.35,
            0.15,
          ],
          scale: [
            0.95,
            1.05,
            0.95,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[360px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"
      />

    </div>
  );
}

// =====================================================
// FEATURE
// =====================================================

function Feature({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/30 p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc] text-white">
        <Icon size={18} />
      </div>

      <h3 className="mt-4 text-sm font-black">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#62646a]">
        {text}
      </p>

    </div>
  );
}
