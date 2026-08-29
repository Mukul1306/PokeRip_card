import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Package,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Packs() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PACKS
  // =====================================================

  const loadPacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/user/packs`
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text ||
            "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load packs"
        );
      }

      const loadedPacks =
        data?.data?.packs ||
        data?.packs ||
        data?.data ||
        [];

      setPacks(
        Array.isArray(loadedPacks)
          ? loadedPacks
          : []
      );
    } catch (err) {
      console.error("Load packs error:", err);

      setError(
        err?.message ||
          "Unable to load packs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-[#238bdc]"
          />

          <p className="text-sm font-semibold text-gray-500">
            Loading packs...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-5">
        <div className="mx-auto max-w-xl">

          <Link
            to="/"
            className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-black"
          >
            <ArrowLeft size={17} />
            Back Home
          </Link>

          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

            <AlertCircle
              size={40}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-black">
              Unable to load packs
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={loadPacks}
              className="mt-6 rounded-full bg-[#238bdc] px-6 py-3 text-sm font-black text-white transition hover:bg-[#177bc9]"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-5 sm:py-6">

        {/* BACK */}

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 transition hover:text-black sm:gap-2 sm:text-sm"
        >
          <ArrowLeft size={17} />
          <span>Back Home</span>
        </Link>

        {/* LOGO */}

        <img
          src="https://www.ripit.co/assets/ripit-logo-x4.webp"
          alt="RIPIT"
          className="h-8 w-auto object-contain sm:h-10"
        />

        {/* SIGN IN */}

        <Link
          to="/login"
          className="rounded-full bg-[#238bdc] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#177bc9] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Sign in
        </Link>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-5 sm:pb-10 sm:pt-10">

        <div className="text-center">

          {/* ICON */}

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#238bdc]/10 sm:h-12 sm:w-12">
            <Package
              size={23}
              className="text-[#238bdc]"
            />
          </div>

          {/* TITLE */}

          <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-.06em] sm:text-6xl md:text-7xl">
            Pokémon Packs
          </h1>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Choose a pack, explore the details,
            and get ready to rip.
          </p>

        </div>

      </section>


      {/* =================================================
          PACKS
      ================================================= */}

      <section className="mx-auto max-w-6xl px-3 pb-20 sm:px-5">

        {packs.length === 0 ? (

          /* EMPTY */

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm sm:p-12">

            <Package
              size={42}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-xl font-black">
              No packs available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Check back soon for new packs.
            </p>

          </div>

        ) : (

          /*
            IMPORTANT:

            Mobile  = 2 columns
            Small   = 2 columns
            Medium  = 3 columns
            Large   = 3 columns
          */

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">

            {packs.map((pack) => (
              <PackCard
                key={pack._id}
                pack={pack}
              />
            ))}

          </div>

        )}

      </section>

    </main>
  );
}


// =====================================================
// PACK CARD
// =====================================================

function PackCard({ pack }) {

  const price =
    Number(pack.price) || 0;

  const stock =
    Number(pack.totalStock) || 0;

  const image =
    pack.image ||
    pack.category?.image ||
    "";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative flex h-[210px] items-center justify-center overflow-hidden bg-[#fafafa] sm:h-[320px] md:h-[350px]">

        {image ? (

          <img
            src={image}
            alt={pack.name || "Pokemon Pack"}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105 sm:p-6 md:p-8"
            loading="lazy"
          />

        ) : (

          <div className="flex flex-col items-center gap-2 text-gray-300">

            <Package
              size={38}
              className="sm:h-[55px] sm:w-[55px]"
            />

            <span className="text-[9px] font-bold sm:text-xs">
              No image
            </span>

          </div>

        )}


        {/* =================================================
            STATUS
        ================================================= */}

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[8px] font-black shadow-sm sm:left-4 sm:top-4 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">

          <Sparkles
            size={10}
            className="text-[#238bdc] sm:h-3 sm:w-3"
          />

          AVAILABLE

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="flex flex-1 flex-col p-3 sm:p-5">

        {/* NAME + PRICE */}

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0 flex-1">

            <h2 className="truncate text-sm font-black sm:text-lg">
              {pack.name || "Unnamed Pack"}
            </h2>

            {pack.category?.name && (
              <p className="mt-1 truncate text-[9px] font-semibold text-gray-500 sm:text-xs">
                {pack.category.name}
              </p>
            )}

          </div>

          <p className="shrink-0 text-sm font-black sm:text-xl">
            ${price.toFixed(2)}
          </p>

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-gray-500 sm:mt-4 sm:text-sm sm:leading-6">
          {pack.description ||
            "Reveal a graded and authenticated collectible card."}
        </p>


        {/* =================================================
            STOCK
        ================================================= */}

        <div className="mt-3 flex items-center justify-between text-[9px] sm:mt-4 sm:text-xs">

          <span className="font-semibold text-gray-400">
            Available
          </span>

          <span
            className={`font-black ${
              stock > 0
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {stock > 0
              ? `${stock} packs`
              : "Sold out"}
          </span>

        </div>


        {/* =================================================
            VIEW PACK
        ================================================= */}

        <Link
          to={`/packs/${pack._id}`}
          state={{ pack }}
          className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#238bdc] text-[10px] font-black text-white shadow-md transition hover:bg-[#177bc9] active:scale-[0.98] sm:mt-5 sm:h-12 sm:gap-2 sm:text-sm"
        >

          <span>
            View Pack
          </span>

          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-1 sm:h-[17px] sm:w-[17px]"
          />

        </Link>

      </div>

    </article>
  );
}