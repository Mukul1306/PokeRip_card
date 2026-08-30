import { useEffect, useState } from "react";
import {
  Loader2,
  PackageOpen,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import PackCard from "../components/PackCard";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function Packs() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PACKS
  // =====================================================

  useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user/packs`
        );

        const contentType =
          response.headers.get("content-type") ||
          "";

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

        setPacks(
          data.data?.packs ||
            data.packs ||
            []
        );
      } catch (err) {
        console.error(
          "Load packs error:",
          err
        );

        setError(
          err.message ||
            "Unable to load packs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f1f1f1]">

        <div className="flex min-h-screen items-center justify-center">

          <div className="flex flex-col items-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2
                size={27}
                className="animate-spin text-[#238bdc]"
              />
            </div>

            <p className="mt-4 text-xs font-black text-[#777]">
              Loading packs...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[#f1f1f1] px-5 py-6">

        <div className="mx-auto w-full max-w-[1100px]">

          {/* HEADER */}

          <header className="flex items-center justify-between">

            <Link
              to="/"
              className="group flex items-center gap-3"
            >

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:-translate-x-0.5">

                <ArrowLeft
                  size={18}
                  strokeWidth={1.8}
                />

              </span>

              <span className="text-[12px] font-bold text-[#555]">
                Back
              </span>

            </Link>

            <Link to="/">
              <img
                src="https://www.ripit.co/assets/ripit-logo-x4.webp"
                alt="RIPIT"
                className="h-10 w-auto"
              />
            </Link>

            <div className="w-[60px]" />

          </header>

          {/* ERROR CARD */}

          <div className="mx-auto mt-16 max-w-[500px] rounded-[30px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f4f4]">

              <PackageOpen
                size={32}
                className="text-red-400"
              />

            </div>

            <h1 className="mt-5 text-2xl font-black">
              Unable to load packs
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#777]">
              {error}
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex rounded-full bg-[#2698F3] px-7 py-3 text-xs font-black text-white"
            >
              Back Home
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f1f1f1] text-[#111214]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 pb-4 pt-5 sm:px-8 lg:pt-7">

        {/* BACK */}

        <Link
          to="/"
          className="group flex items-center gap-3"
        >

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition group-hover:-translate-x-0.5">

            <ArrowLeft
              size={18}
              strokeWidth={1.8}
            />

          </span>

          <span className="hidden text-[12px] font-bold text-[#555] sm:block">
            Back
          </span>

        </Link>

        {/* LOGO */}

        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        <div className="w-11 sm:w-[70px]" />

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto w-full max-w-[1180px] px-5 pb-6 pt-8 sm:px-8 sm:pt-12">

        <div className="relative overflow-hidden rounded-[30px] bg-white px-6 py-10 shadow-[0_5px_25px_rgba(0,0,0,0.04)] sm:px-10 sm:py-12 lg:px-14">

          {/* DECORATION */}

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#238bdc]/5 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-[#238bdc]/5 blur-2xl" />

          {/* CONTENT */}

          <div className="relative z-10 max-w-[700px]">

            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#238bdc]/10">

                <Sparkles
                  size={15}
                  className="text-[#238bdc]"
                />

              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#238bdc]">
                Collect & Rip
              </p>

            </div>

            <h1 className="mt-4 text-[42px] font-black leading-[0.98] tracking-[-2px] sm:text-[56px] lg:text-[64px]">
              Pokemon
              <br />
              Packs
            </h1>

            <p className="mt-5 max-w-[530px] text-[13px] font-medium leading-6 text-[#68696d] sm:text-[14px]">
              Choose your pack and discover
              what premium graded trading card
              you're going to pull.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          PACKS
      ================================================= */}

      <section className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-8">

        {/* SECTION HEADER */}

        <div className="mb-6 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#238bdc]">
              Available Now
            </p>

            <h2 className="mt-1 text-[25px] font-black tracking-[-0.8px] sm:text-[30px]">
              Choose Your Pack
            </h2>

          </div>

          {packs.length > 0 && (
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black text-[#777] shadow-sm">
              {packs.length}{" "}
              {packs.length === 1
                ? "Pack"
                : "Packs"}
            </span>
          )}

        </div>

        {/* =================================================
            PACK GRID
        ================================================= */}

        {packs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">

            {packs.map((pack) => (
              <PackCard
                key={pack._id}
                pack={pack}
              />
            ))}

          </div>
        ) : (
          <div className="rounded-[30px] bg-white px-6 py-16 text-center shadow-[0_5px_25px_rgba(0,0,0,0.04)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f3f3]">

              <PackageOpen
                size={32}
                className="text-[#c6c6c8]"
              />

            </div>

            <h2 className="mt-5 text-xl font-black">
              No packs available
            </h2>

            <p className="mx-auto mt-2 max-w-[380px] text-sm leading-6 text-[#777]">
              Check back soon for new
              Pokemon packs.
            </p>

          </div>
        )}

      </section>

    </main>
  );
}