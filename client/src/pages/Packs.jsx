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


// =====================================================
// API
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// =====================================================
// PACKS PAGE
// =====================================================

export default function Packs() {
  const [packs, setPacks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD PACKS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadPacks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user/packs`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load packs"
          );
        }

        const loadedPacks =
          data.data?.packs ??
          data.packs ??
          (Array.isArray(data.data)
            ? data.data
            : []);

        if (!cancelled) {
          setPacks(
            Array.isArray(loadedPacks)
              ? loadedPacks
              : []
          );
        }
      } catch (err) {
        console.error(
          "Load packs error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load packs"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPacks();

    return () => {
      cancelled = true;
    };
  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">

        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={34}
            className="animate-spin text-[#238bdc]"
          />

          <p className="text-sm font-semibold text-gray-500">
            Loading packs...
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-5 py-8">

        <div className="mx-auto max-w-xl">

          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-black"
          >
            <ArrowLeft size={17} />

            Back Home
          </Link>


          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">

              <AlertCircle
                size={34}
                className="text-red-500"
              />

            </div>


            <h1 className="mt-5 text-2xl font-black">
              Unable to load packs
            </h1>


            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>


            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-full bg-[#238bdc] px-6 py-3 text-sm font-black text-white transition hover:bg-[#177bc9]"
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#101114]">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">

        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />

          Back
        </Link>


        <Link to="/">
          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-10 w-auto object-contain"
          />
        </Link>


        <Link
          to="/login"
          className="rounded-full bg-[#238bdc] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#177bc9]"
        >
          Sign in
        </Link>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#238bdc]/10">

            <Package
              size={25}
              className="text-[#238bdc]"
            />

          </div>


          <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] sm:text-7xl">
            Pokémon Packs
          </h1>


          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Choose a pack, explore the details,
            and get ready to rip.
          </p>

        </div>

      </section>


      {/* =====================================================
          PACK LIST
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">

        {packs.length === 0 ? (

          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">

              <Package
                size={40}
                className="text-gray-300"
              />

            </div>


            <h2 className="mt-5 text-xl font-black">
              No packs available
            </h2>


            <p className="mt-2 text-sm text-gray-500">
              Check back soon for new packs.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

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
    Number(pack?.price) || 0;

  const stock =
    Number(pack?.totalStock) || 0;


  // Some backend responses may have
  // category.image instead of pack.image.

  const image =
    pack?.image ||
    pack?.category?.image ||
    "";


  const isAvailable =
    stock > 0;


  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">


      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-[#fafafa]">


        {image ? (

          <img
            src={image}
            alt={pack?.name || "Pokemon pack"}
            className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />

        ) : (

          <div className="flex flex-col items-center gap-3 text-gray-300">

            <Package size={55} />

            <span className="text-xs font-bold">
              No image
            </span>

          </div>

        )}


        {/* STATUS */}

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black shadow-sm">

          <Sparkles
            size={12}
            className="text-[#238bdc]"
          />

          {isAvailable
            ? "AVAILABLE"
            : "SOLD OUT"}

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-5">


        {/* NAME + PRICE */}

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h2 className="truncate text-lg font-black">
              {pack?.name || "Unnamed Pack"}
            </h2>


            {pack?.category?.name && (
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {pack.category.name}
              </p>
            )}

          </div>


          <p className="shrink-0 text-xl font-black">
            ${price.toFixed(2)}
          </p>

        </div>


        {/* DESCRIPTION */}

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">

          {pack?.description ||
            "Reveal a graded and authenticated collectible card."}

        </p>


        {/* STOCK */}

        <div className="mt-4 flex items-center justify-between text-xs">

          <span className="font-semibold text-gray-400">
            Availability
          </span>


          <span
            className={
              isAvailable
                ? "font-black text-green-600"
                : "font-black text-red-500"
            }
          >
            {isAvailable
              ? `${stock} packs`
              : "Sold out"}
          </span>

        </div>


        {/* VIEW PACK */}

        <Link
          to={`/packs/${pack._id}`}
          state={{ pack }}
          className={`group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-black text-white shadow-md transition active:scale-[0.98] ${
            isAvailable
              ? "bg-[#238bdc] hover:bg-[#177bc9]"
              : "cursor-pointer bg-gray-400 hover:bg-gray-500"
          }`}
        >

          View Pack

          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />

        </Link>

      </div>

    </article>
  );
}