import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function Collection() {
  const navigate = useNavigate();

  const [userPacks, setUserPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH MY COLLECTION
  // =====================================================

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/collection`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load collection"
        );
      }

      setUserPacks(
        data.data?.userPacks || []
      );
    } catch (error) {
      console.error(
        "Collection error:",
        error
      );

      setError(
        error.message ||
          "Unable to load collection"
      );

      setUserPacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2
          size={32}
          className="animate-spin text-[#238bdc]"
        />
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      <main className="mx-auto min-h-screen w-full max-w-[520px] bg-[#f5f5f5] pb-24">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center justify-between px-5 py-4">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-9 w-auto object-contain"
          />

          <div className="h-9 w-9" />

        </header>


        {/* =================================================
            TITLE
        ================================================= */}

        <section className="px-[15px] pt-5">

          <h1
            className="
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[42px]
              font-extrabold
              leading-[42px]
              tracking-[-1.5px]
              text-[#141519]
            "
          >
            Collection
          </h1>

          <p
            className="
              mt-2
              max-w-[340px]
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[13px]
              font-medium
              leading-[18px]
              text-[#55565a]
            "
          >
            Your purchased packs are stored here.
            Rip a pack to reveal your cards.
          </p>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mx-[15px] mt-5 rounded-[14px] bg-red-50 p-4 text-center">

            <p className="text-sm font-bold text-red-600">
              {error}
            </p>

            <button
              onClick={fetchCollection}
              className="mt-3 rounded-full bg-red-500 px-5 py-2 text-xs font-bold text-white"
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            EMPTY COLLECTION
        ================================================= */}

        {!error &&
          userPacks.length === 0 && (
            <div className="mx-[15px] mt-8 rounded-[18px] bg-white px-6 py-12 text-center">

              <Package
                size={42}
                className="mx-auto text-[#aaa]"
              />

              <h2 className="mt-4 text-base font-extrabold">
                Your collection is empty
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#888]">
                Purchase a pack from the store
                and it will appear here.
              </p>

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="
                  mt-5
                  rounded-full
                  bg-[#2698F3]
                  px-6
                  py-3
                  text-xs
                  font-bold
                  text-white
                "
              >
                Browse Packs
              </button>

            </div>
          )}


        {/* =================================================
            PURCHASED PACKS
        ================================================= */}

        {!error &&
          userPacks.length > 0 && (
            <section className="mt-6 px-[11px]">

              <div className="mb-3 flex items-center justify-between px-1">

                <h2 className="text-sm font-extrabold">
                  My Packs
                </h2>

                <span className="text-[10px] font-bold text-[#777]">
                  {userPacks.length}{" "}
                  {userPacks.length === 1
                    ? "Pack"
                    : "Packs"}
                </span>

              </div>


              <div className="grid grid-cols-2 gap-[10px]">

                {userPacks.map((item) => {

                  const pack = item.pack;

                  if (!pack) {
                    return null;
                  }

                  return (
                    <div
                      key={item._id}
                      className="
                        overflow-hidden
                        rounded-[8px]
                        bg-white
                        shadow-sm
                      "
                    >

                      {/* PACK IMAGE */}

                      <div
                        className="
                          flex
                          h-[260px]
                          w-full
                          items-center
                          justify-center
                          bg-white
                        "
                      >

                        {pack.image ? (
                          <img
                            src={pack.image}
                            alt={pack.name}
                            className="
                              h-full
                              w-full
                              object-contain
                              px-[8px]
                            "
                          />
                        ) : (
                          <Sparkles
                            size={34}
                            className="text-[#aaa]"
                          />
                        )}

                      </div>


                      {/* PACK INFORMATION */}

                      <div className="px-4 pb-4 pt-2">

                        <h3
                          className="
                            truncate
                            font-['Plus_Jakarta_Sans',sans-serif]
                            text-[13px]
                            font-extrabold
                          "
                        >
                          {pack.name}
                        </h3>


                        {/* CARDS */}

                        <div className="mt-2 flex items-center justify-between">

                          <span className="text-[10px] font-semibold text-[#777]">
                            Cards remaining
                          </span>

                          <span className="text-[11px] font-extrabold">
                            {item.cardsRemaining ?? 0}
                          </span>

                        </div>


                        {/* RIPPED */}

                        <div className="mt-1 flex items-center justify-between">

                          <span className="text-[10px] font-semibold text-[#777]">
                            Cards ripped
                          </span>

                          <span className="text-[11px] font-extrabold">
                            {item.cardsRipped ?? 0}
                          </span>

                        </div>


                        {/* STATUS */}

                        <div className="mt-3">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-2.5
                              py-1
                              text-[9px]
                              font-extrabold
                              ${
                                item.status ===
                                "COMPLETED"
                                  ? "bg-black/5 text-[#777]"
                                  : "bg-[#238bdc]/10 text-[#238bdc]"
                              }
                            `}
                          >
                            {item.status}
                          </span>

                        </div>


                        {/* RIP BUTTON */}

              <button
  disabled={Number(item.cardsRemaining) <= 0}
  onClick={() =>
    navigate(`/reveal/${item._id}`)
  }
  className={`
    mt-3
    h-[36px]
    w-full
    rounded-full
    text-[11px]
    font-bold
    transition
    active:scale-[0.97]
    ${
      Number(item.cardsRemaining) > 0
        ? "bg-[#2698F3] text-white"
        : "bg-[#e5e5e5] text-[#999]"
    }
  `}
>
  {Number(item.cardsRemaining) > 0
    ? "Rip Pack"
    : "Pack Completed"}
</button>
                      </div>

                    </div>
                  );
                })}

              </div>

            </section>
          )}


        {/* =================================================
            BOTTOM NAV
        ================================================= */}

        <nav
          className="
            fixed
            bottom-0
            left-1/2
            z-50
            flex
            w-full
            max-w-[520px]
            -translate-x-1/2
            items-center
            justify-around
            border-t
            border-black/10
            bg-white/95
            px-3
            py-3
            backdrop-blur
          "
        >

          {/* PACKS */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              text-[#777]
            "
          >
            <Sparkles size={18} />

            <span className="text-[8px] font-black">
              Packs
            </span>
          </button>


          {/* ORDERS */}

          <button
            onClick={() =>
              navigate("/orders")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              text-[#777]
            "
          >
            <Package size={18} />

            <span className="text-[8px] font-black">
              Orders
            </span>
          </button>


          {/* COLLECTION */}

          <button
            onClick={() =>
              navigate("/collection")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              text-[#238bdc]
            "
          >
            <Sparkles size={18} />

            <span className="text-[8px] font-black">
              Collection
            </span>
          </button>


          {/* PROFILE */}

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              text-[#777]
            "
          >
            <UserIcon />

            <span className="text-[8px] font-black">
              Profile
            </span>
          </button>

        </nav>

      </main>

    </div>
  );
}


// Small profile icon wrapper
function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path
        d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
      />
    </svg>
  );
}