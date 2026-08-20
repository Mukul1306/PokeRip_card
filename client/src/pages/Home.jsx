import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Gem,
  Play,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
const packs = [
  {
    id: "starter",
    name: "Starter Pack",
    price: "$25",
    image: "https://images.pokemontcg.io/base1/58_hires.png",
  },
  {
    id: "great",
    name: "Great Pack",
    price: "$50",
    image: "https://images.pokemontcg.io/base1/15_hires.png",
  },
  {
    id: "ruby",
    name: "Only 10s: Ruby",
    price: "$100",
    image: "https://images.pokemontcg.io/base1/4_hires.png",
  },
];
const heroCards = [
  {
    name: "Charizard",
    image: "https://images.pokemontcg.io/base1/4_hires.png",
  },
  {
    name: "Pikachu",
    image: "https://images.pokemontcg.io/base1/58_hires.png",
  },
  {
    name: "Venusaur",
    image: "https://images.pokemontcg.io/base1/15_hires.png",
  },
  {
    name: "Blastoise",
    image: "https://images.pokemontcg.io/base1/2_hires.png",
  },
  {
    name: "Alakazam",
    image: "https://images.pokemontcg.io/base1/1_hires.png",
  },
  {
    name: "Chansey",
    image: "https://images.pokemontcg.io/base1/3_hires.png",
  },
  {
    name: "Clefairy",
    image: "https://images.pokemontcg.io/base1/5_hires.png",
  },
  {
    name: "Gyarados",
    image: "https://images.pokemontcg.io/base1/6_hires.png",
  },
  {
    name: "Hitmonchan",
    image: "https://images.pokemontcg.io/base1/7_hires.png",
  },
  {
    name: "Machamp",
    image: "https://images.pokemontcg.io/base1/8_hires.png",
  },
];
const collectibles = [
  {
    name: "Pikachu",
    set: "1999 Pokémon Base Set",
    grade: "GEM MT 10",
    odds: "1 in 22,300,000 odds",
    image: "https://images.pokemontcg.io/base1/58_hires.png",
  },
  {
    name: "Charizard",
    set: "Pokémon Base Set",
    grade: "GEM MT 10",
    odds: "1 in 450 odds",
    image: "https://images.pokemontcg.io/base1/4_hires.png",
  },
  {
    name: "Blastoise",
    set: "Pokémon Base Set",
    grade: "MINT 9",
    odds: "1 in 900 odds",
    image: "https://images.pokemontcg.io/base1/2_hires.png",
  },
  {
    name: "Venusaur",
    set: "Pokémon Base Set",
    grade: "GEM MT 10",
    odds: "1 in 1,100 odds",
    image: "https://images.pokemontcg.io/base1/15_hires.png",
  },
];

function SafeImage({ src, alt, className = "" }) {
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

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif] text-[#101114]">
      {/* Import image font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* HEADER */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
       
<div>
  <img
    src="https://www.ripit.co/assets/ripit-logo-x4.webp"
    alt="RIPIT"
    className="h-10 w-auto object-contain"
  />
</div>

        <button className="rounded-full bg-[#238bdc] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#177bc9]">
          Sign in
        </button>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pt-16 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="max-w-5xl text-[3.6rem] font-black leading-[0.91] tracking-[-0.07em] sm:text-7xl lg:text-[7rem]">
              Unlock the Joy
              <br />
              of Collecting
            </h1>

            <p className="mt-7 max-w-2xl text-[15px] font-medium leading-6 text-[#505258] sm:text-lg">
              Rip digital packs to reveal real, graded Pokemon and sports
              cards. Vault, sell or ship slabs and build your collection.
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

   

{/*         CARD SPINNER */}
          <CardSpinner />
        </div>
      </section>

      {/* =====================================================
          CROWN JEWEL
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-9 overflow-hidden rounded-2xl border border-[#c8a54e] bg-[#dfc17a] p-5 sm:p-8"
        >
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-2xl font-black text-[#a77b1c]">
              Crown Jewel
              <Crown size={22} fill="currentColor" />
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

            <h3 className="mt-2 text-2xl font-black">CoroCoro #223</h3>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68531e]">
              The BGS 8.0 CoroCoro #223 from November 1996 — the Japanese
              magazine that birthed the Pokémon Trading Card Game, complete
              with the Glossy Ivy Pikachu and Jigglypuff.
            </p>

            <p className="mt-3 text-lg font-black">Est. $150,000</p>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          LIVE MEGA RIPS
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="overflow-hidden rounded-2xl bg-black">
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
              <Play size={22} fill="currentColor" />
            </button>
          </div>
        </div>

        <h2 className="mt-12 text-5xl font-black tracking-[-.06em] sm:text-7xl">
          Live Mega Rips
        </h2>
      </section>

      {/* =====================================================
          STARTER PACK
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="rounded-3xl border border-black/10 bg-[#e5e6e8] p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <Link
              to="/packs"
              className="flex items-center gap-2 text-sm font-bold text-[#56585d]"
            >
              <ArrowLeft size={16} />
              Back to packs
            </Link>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            {/* PACK */}

            <motion.div
              animate={{
                y: [-8, 8, -8],
                rotateZ: [-1, 1, -1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="mx-auto flex h-[410px] w-[240px] items-center justify-center overflow-hidden rounded-2xl border-[5px] border-red-500 bg-gradient-to-b from-green-700 via-green-500 to-yellow-300 shadow-[0_25px_50px_rgba(0,0,0,.22)]"
            >
              <div className="text-center text-white">
                <p className="text-4xl font-black">RipIt</p>

                <p className="mt-1 text-[9px] font-black tracking-[.35em]">
                  POKEMON
                </p>

                <div className="mx-auto mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-300 text-4xl font-black text-green-800 shadow-xl">
                  ◇
                </div>

                <p className="mt-10 text-4xl font-black leading-none">
                  STARTER
                  <br />
                  PACK
                </p>

                <p className="mt-6 text-[8px] font-black tracking-[.3em]">
                  POWERED BY RIPIT
                </p>
              </div>
            </motion.div>

            {/* DETAILS */}

            <div>
              <h2 className="text-5xl font-black leading-none tracking-[-.06em]">
                Starter Pack
              </h2>

              <p className="mt-4 text-3xl font-black">
                $25
                <span className="ml-2 text-sm font-medium text-[#66686d]">
                  per pack
                </span>
              </p>

              <p className="mt-5 max-w-xl text-sm leading-6 text-[#5c5e63]">
                This pack contains one graded and authenticated trading card.
                Once revealed, it's yours to vault, sell, or ship anytime.
              </p>

              <Link
                to="/packs/starter"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#238bdc] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
              >
                Rip Now
                <ArrowRight size={16} />
              </Link>

              <div className="mt-8 rounded-2xl border border-black/10 bg-white/30 p-4">
                <h3 className="font-black">Collector Pull Rate</h3>

                <Rate
                  icon={Gem}
                  title="Mega"
                  text="Absolutely insane grails."
                  rate="4%"
                  className="border-[#c69c43] bg-[#f0dfb7] text-[#936b19]"
                />

                <Rate
                  icon={Zap}
                  title="Elite"
                  text="Cards you'll love."
                  rate="46%"
                  className="border-[#73a7cc] bg-[#dceaf3] text-[#3c6f99]"
                />

                <Rate
                  icon={Sparkles}
                  title="Heat"
                  text="Collector favorites."
                  rate="50%"
                  className="border-[#7aa47e] bg-[#dcebdc] text-[#47714d]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SWITCH PACKS
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <h2 className="text-3xl font-black tracking-[-.05em] sm:text-4xl">
          Switch Pokemon Packs
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {packs.map((pack) => (
            <Link
              key={pack.id}
              to={`/packs/${pack.id}`}
              className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-white/30"
            >
              <div className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow">
                <SafeImage
                  src={pack.image}
                  alt={pack.name}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>

              <div>
                <p className="text-sm font-black">{pack.name}</p>

                <p className="mt-1 text-sm font-medium text-[#62646a]">
                  {pack.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURED COLLECTIBLES
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-[-.05em] sm:text-5xl">
            Featured Collectibles
          </h2>

          <div className="hidden rounded-full bg-white/50 px-5 py-2 text-xs font-bold sm:block">
            Slabs
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
          {collectibles.map((card, index) => (
            <motion.article
              key={card.name}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.07,
              }}
              whileHover={{
                y: -6,
              }}
              className="group"
            >
              {/* slab */}

              <div className="overflow-hidden rounded-xl border-[4px] border-[#303238] bg-white p-2 shadow-[0_10px_20px_rgba(0,0,0,.16)]">
                <div className="mb-2 border-b-[3px] border-[#d52d36] bg-[#eeeeee] px-2 py-2">
                  <p className="truncate text-[7px] font-black">{card.set}</p>

                  <p className="mt-1 text-[6px] font-bold text-[#55575c]">
                    {card.grade}
                  </p>
                </div>

                <div className="aspect-[.72] overflow-hidden bg-white">
                  <SafeImage
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              <h3 className="mt-3 truncate text-xs font-black uppercase">
                {card.name}
              </h3>

              <p className="mt-1 truncate text-[10px] text-[#66686d]">
                {card.set}
              </p>

              <p className="mt-2 inline-flex rounded-md border border-black/10 bg-white/40 px-2 py-1 text-[9px] font-bold">
                {card.odds}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* =====================================================
          FINAL TRUST
      ===================================================== */}

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
function SpinningCard({ card, index }) {
  const positions = [
    {
      left: "3%",
      top: "24%",
      rotate: -18,
      scale: 0.72,
      opacity: 0.45,
      z: 1,
    },
    {
      left: "12%",
      top: "13%",
      rotate: -13,
      scale: 0.78,
      opacity: 0.6,
      z: 2,
    },
    {
      left: "21%",
      top: "7%",
      rotate: -9,
      scale: 0.83,
      opacity: 0.72,
      z: 3,
    },
    {
      left: "30%",
      top: "3%",
      rotate: -5,
      scale: 0.88,
      opacity: 0.85,
      z: 4,
    },
    {
      left: "50%",
      top: "0%",
      rotate: 0,
      scale: 1,
      opacity: 1,
      z: 20,
    },
    {
      left: "70%",
      top: "3%",
      rotate: 5,
      scale: 0.88,
      opacity: 0.85,
      z: 4,
    },
    {
      left: "79%",
      top: "7%",
      rotate: 9,
      scale: 0.83,
      opacity: 0.72,
      z: 3,
    },
    {
      left: "88%",
      top: "13%",
      rotate: 13,
      scale: 0.78,
      opacity: 0.6,
      z: 2,
    },
    {
      left: "97%",
      top: "24%",
      rotate: 18,
      scale: 0.72,
      opacity: 0.45,
      z: 1,
    },
    {
      left: "50%",
      top: "-8%",
      rotate: 180,
      scale: 0.65,
      opacity: 0,
      z: 0,
    },
  ];

  const position = positions[index];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.4,
        rotate: 0,
      }}
      animate={{
        left: position.left,
        top: position.top,
        rotate: position.rotate,
        scale: position.scale,
        opacity: position.opacity,
      }}
      transition={{
        duration: 0.1,
        ease: "linear",
      }}
      style={{
        zIndex: position.z,
        transformOrigin: "center center",
      }}
      className="absolute h-[330px] w-[210px] overflow-hidden rounded-2xl border-[6px] border-[#25272b] bg-white shadow-[0_25px_60px_rgba(0,0,0,.28)] sm:h-[480px] sm:w-[310px]"
    >
      <div className="absolute left-0 right-0 top-0 z-10 border-b-[5px] border-[#d82d38] bg-[#f4f4f4] px-3 py-2">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-[7px] font-black sm:text-[10px]">
              POKÉMON TCG
            </p>

            <p className="text-[6px] font-bold text-[#555] sm:text-[8px]">
              COLLECTIBLE
            </p>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-black sm:text-[10px]">
              GEM MT
            </p>

            <p className="text-[6px] font-bold text-[#555] sm:text-[8px]">
              10
            </p>
          </div>

        </div>
      </div>

      <div className="h-full w-full p-2 pt-[55px] sm:pt-[68px]">

        <SafeImage
          src={card.image}
          alt={card.name}
          className="h-full w-full object-contain"
        />

      </div>

      {/* glass shine */}

      <motion.div
        animate={{
          x: ["-150%", "150%"],
        }}
        transition={{
          duration: 1.3,
          repeat: Infinity,
          ease: "linear",
          delay: index * 0.08,
        }}
        className="pointer-events-none absolute inset-y-0 z-20 w-16 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-md"
      />

    </motion.div>
  );
}
/* =========================================================
   RATE
========================================================= */

function Rate({ icon: Icon, title, text, rate, className }) {
  return (
    <div
      className={`mt-2 flex items-center gap-3 rounded-lg border px-3 py-2 ${className}`}
    >
      <Icon size={17} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black">{title}</p>

        <p className="truncate text-[9px] font-medium">{text}</p>
      </div>

      <span className="text-xs font-black">{rate}</span>
    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */
function CardSpinner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % heroCards.length;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto mt-10 h-[410px] max-w-6xl sm:h-[540px]">

      {/* BACKGROUND GLOW */}

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

      {/* CARDS */}

      {[-2, -1, 0, 1, 2].map((offset) => {

        const index =
          (activeIndex + offset + heroCards.length) %
          heroCards.length;

        const card = heroCards[index];

        const isCenter = offset === 0;

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

        const position = positions[offset];

        return (
          <motion.div
            key={`${card.name}-${index}`}
            animate={{
              x: position.x,
              rotate: position.rotate,
              scale: position.scale,
              opacity: position.opacity,
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
              zIndex: isCenter ? 20 : 10 - Math.abs(offset),
            }}
          >

            {/* slab header */}

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


            {/* card */}

            <div className="h-[calc(100%-65px)] p-3">

              <SafeImage
                src={card.image}
                alt={card.name}
                className="h-full w-full object-contain"
              />

            </div>


            {/* holographic shine */}

            <motion.div
              animate={{
                x: ["-200%", "250%"],
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
      })}


      {/* CENTER CARD GLOW */}

      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [0.95, 1.05, 0.95],
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
function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/30 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc] text-white">
        <Icon size={18} />
      </div>

      <h3 className="mt-4 text-sm font-black">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-[#62646a]">{text}</p>
    </div>
  );
}