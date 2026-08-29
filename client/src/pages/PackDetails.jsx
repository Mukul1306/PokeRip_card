import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

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
  // LOAD PACK
  // =====================================================

  useEffect(() => {
    const loadPack = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user/packs/${packId}`
        );

        const contentType =
          response.headers.get("content-type") || "";

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
              "Unable to load pack"
          );
        }

        const loadedPack =
          data.data?.pack ||
          data.pack ||
          null;

        if (!loadedPack) {
          throw new Error(
            "Pack information not found"
          );
        }

        setPack(loadedPack);
      } catch (err) {
        console.error(
          "Load pack error:",
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

    if (packId) {
      loadPack();
    }
  }, [packId]);

  // =====================================================
  // GO RIP
  // =====================================================

  const handleGoRip = () => {
    const token =
      localStorage.getItem("token");

    // User is not logged in
    if (!token) {
      navigate(
        `/login?redirect=/rip/${packId}`
      );

      return;
    }

    // User is logged in
    navigate(`/rip/${packId}`);
  };

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

          <p className="text-sm font-bold text-gray-500">
            Loading pack...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !pack) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-5 py-10">

        <div className="mx-auto max-w-3xl">

          {/* BACK */}

          <Link
            to="/packs"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-black"
          >
            <ArrowLeft size={17} />
            Back to packs
          </Link>


          {/* ERROR CARD */}

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">

              <AlertCircle
                size={32}
                className="text-red-500"
              />

            </div>


            <h1 className="mt-5 text-2xl font-black">
              Unable to load pack
            </h1>


            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "Pack not found"}
            </p>


            <Link
              to="/packs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#238bdc] px-6 py-3 text-sm font-black text-white transition hover:bg-[#177bc9]"
            >
              Back to packs

              <ArrowRight size={16} />

            </Link>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // PACK DATA
  // =====================================================

  const price =
    Number(pack.price) || 0;

  const stock =
    Number(pack.totalStock) || 0;

  const image =
    pack.image ||
    pack.category?.image ||
    "";

  const isAvailable =
    stock > 0;


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">

        {/* BACK */}

        <Link
          to="/packs"
          className="flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to packs
        </Link>


        {/* LOGO */}

        <img
          src="https://www.ripit.co/assets/ripit-logo-x4.webp"
          alt="RIPIT"
          className="h-10 w-auto object-contain"
        />


        {/* SIGN IN */}

        <Link
          to="/login"
          className="rounded-full bg-[#238bdc] px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-[#177bc9]"
        >
          Sign in
        </Link>

      </header>


      {/* =================================================
          PACK DETAILS
      ================================================= */}

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* =================================================
              PACK IMAGE
          ================================================= */}

          <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-3xl bg-white p-8 shadow-sm">

            {image ? (

              <img
                src={image}
                alt={pack.name}
                className="max-h-[480px] w-full object-contain transition duration-500 hover:scale-[1.02]"
              />

            ) : (

              <div className="flex flex-col items-center gap-3 text-gray-300">

                <Package size={70} />

                <span className="text-sm font-bold">
                  No pack image
                </span>

              </div>

            )}

          </div>


          {/* =================================================
              PACK INFORMATION
          ================================================= */}

          <div className="flex flex-col justify-center rounded-3xl bg-white p-8 shadow-sm">


            {/* CATEGORY */}

            {pack.category?.name && (
              <p className="text-xs font-black uppercase tracking-widest text-[#238bdc]">
                {pack.category.name}
              </p>
            )}


            {/* PACK NAME */}

            <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">
              {pack.name}
            </h1>


            {/* PRICE */}

            <div className="mt-4 flex items-end gap-2">

              <span className="text-4xl font-black">
                ${price.toFixed(2)}
              </span>

              <span className="pb-1 text-sm font-semibold text-gray-500">
                per pack
              </span>

            </div>


            {/* DESCRIPTION */}

            <p className="mt-6 text-sm leading-7 text-gray-500">
              {pack.description ||
                "This pack contains one graded and authenticated trading card. Once revealed, it's yours to vault, sell, or ship anytime."}
            </p>


            {/* AVAILABILITY */}

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-gray-600">
                  Pack availability
                </span>

                <span
                  className={`text-sm font-black ${
                    isAvailable
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {isAvailable
                    ? `${stock} available`
                    : "Sold out"}
                </span>

              </div>

            </div>


            {/* =================================================
                GO RIP BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={handleGoRip}
              disabled={!isAvailable}
              className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-black text-white shadow-md transition active:scale-[0.98] ${
                isAvailable
                  ? "bg-[#238bdc] hover:bg-[#177bc9]"
                  : "cursor-not-allowed bg-gray-300"
              }`}
            >

              {isAvailable ? (
                <>
                  Go Rip
                  <ArrowRight size={18} />
                </>
              ) : (
                "Sold Out"
              )}

            </button>


            {/* LOGIN INFORMATION */}

            <p className="mt-3 text-center text-xs text-gray-400">
              Sign in is required before ripping a pack.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}