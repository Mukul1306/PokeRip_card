import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function RipPack() {
  const { packId } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] =
    useState(null);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load pack"
        );
      }

      setPack(
        data.data?.pack || null
      );

      setWalletBalance(
        Number(
          data.data?.walletBalance ||
          0
        )
      );

    } catch (error) {

      console.error(
        "Pack details error:",
        error
      );

      setError(
        error.message ||
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
      <div className="flex min-h-screen items-center justify-center bg-[#F3F1F3]">
        <Loader2
          size={30}
          className="animate-spin text-[#238bdc]"
        />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !pack) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F1F3] px-6">

        <div className="w-full max-w-[380px] rounded-[20px] bg-white p-8 text-center">

          <Sparkles
            size={34}
            className="mx-auto text-[#aaa]"
          />

          <h2 className="mt-4 text-lg font-black">
            Pack not found
          </h2>

          <p className="mt-2 text-xs text-[#777]">
            {error ||
              "This pack is no longer available."}
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-5 rounded-full bg-[#2698F3] px-6 py-3 text-xs font-bold text-white"
          >
            Back to Packs
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
   <div
  className="
    min-h-screen
    bg-[#EDEBED]
    font-['Plus_Jakarta_Sans',sans-serif]
    text-[#111214]
  "
>




<main
  className="
    mx-auto
    min-h-screen
    w-full
    max-w-[520px]
    bg-[#EDEBED]
    pb-10
  "
>



        {/* =================================================
            TOP BAR
        ================================================= */}

      {/* =================================================
    HEADER
================================================= */}

<header className="px-[16px] pt-[3px]">

  {/* TOP HEADER */}

  <div className="flex items-center justify-between">

    <button
      onClick={() => navigate("/dashboard")}
      className="flex items-center"
    >
      <img
        src="https://www.ripit.co/assets/ripit-logo-x4.webp"
        alt="RIPIT"
        className="h-[38px] w-auto object-contain"
      />
    </button>



  </div>


  {/* BACK TO PACKS */}

  <button
    onClick={() => navigate("/dashboard")}
    className="
      mt-[28px]
      flex
      items-center
      gap-[14px]
      text-[#55565A]
    "
  >

    <span
      className="
        flex
        h-[42px]
        w-[42px]
        items-center
        justify-center
        rounded-full
        bg-white
        shadow-[0_2px_7px_rgba(0,0,0,0.08)]
      "
    >
      <ArrowLeft
        size={19}
        strokeWidth={1.7}
      />
    </span>

    <span
      className="
        text-[13px]
        font-medium
      "
    >
      Back to packs
    </span>

  </button>

</header>
  

        {/* =================================================
            PACK VISUAL
        ================================================= */}

        {/* =================================================
    PACK VISUAL
================================================= */}

<section
  className="
    relative
    mt-[10px]
    h-[350px]
    overflow-hidden
    bg-[#EDEBED]
  "
>

  {/* SUBTLE GRID */}

  <div
    className="
      pointer-events-none
      absolute
      inset-0
      opacity-[0.45]
    "
    style={{
      backgroundImage: `
        linear-gradient(
          30deg,
          transparent 49.5%,
          #d8d8db 50%,
          transparent 50.5%
        ),
        linear-gradient(
          150deg,
          transparent 49.5%,
          #d8d8db 50%,
          transparent 50.5%
        )
      `,
      backgroundSize: "72px 72px",
    }}
  />


  {/* ================================================
      WHITE DIAMONDS
  ================================================ */}

  <div
    className="
      absolute
      left-[25px]
      top-[18px]
      h-[62px]
      w-[62px]
      rotate-45
      rounded-[13px]
      bg-[#FAFAFA]
      shadow-[0_0_2px_rgba(0,0,0,0.03)]
    "
  />

  <div
    className="
      absolute
      right-[25px]
      top-[18px]
      h-[62px]
      w-[62px]
      rotate-45
      rounded-[13px]
      bg-[#FAFAFA]
      shadow-[0_0_2px_rgba(0,0,0,0.03)]
    "
  />


  <div
    className="
      absolute
      left-[38px]
      top-[108px]
      h-[88px]
      w-[88px]
      rotate-45
      rounded-[14px]
      bg-[#FAFAFA]
    "
  />

  <div
    className="
      absolute
      right-[38px]
      top-[108px]
      h-[88px]
      w-[88px]
      rotate-45
      rounded-[14px]
      bg-[#FAFAFA]
    "
  />


  <div
    className="
      absolute
      left-[25px]
      bottom-[20px]
      h-[62px]
      w-[62px]
      rotate-45
      rounded-[13px]
      bg-[#FAFAFA]
    "
  />

  <div
    className="
      absolute
      right-[25px]
      bottom-[20px]
      h-[62px]
      w-[62px]
      rotate-45
      rounded-[13px]
      bg-[#FAFAFA]
    "
  />


  {/* ================================================
      PACK
  ================================================ */}

  <div
    className="
      absolute
      left-1/2
      top-[10px]
      z-20
      -translate-x-1/2
    "
  >

    {pack.image ? (

      <img
        src={pack.image}
        alt={pack.name}
        className="
          h-[380px]
          w-[170px]
          object-contain
        "
      />

    ) : (

      <div
        className="
          flex
          h-[380px]
          w-[170px]
          items-center
          justify-center
        "
      >
        <Sparkles
          size={60}
          className="text-[#aaa]"
        />
      </div>

    )}

  </div>

</section>


        {/* =================================================
            PACK INFORMATION
        ================================================= */}

        {/* =================================================
    PACK DETAILS
================================================= */}

<section
  className="
    relative
    z-30
    mx-[20px]
    -mt-[1px]
    rounded-t-[25px]
    rounded-b-[25px]
    bg-[#FFFDFE]
    px-[16px]
    pb-10
    pt-[12px]
  
  "
>
  {/* NAME */}

  <h1
    className="
      font-['Plus_Jakarta_Sans',sans-serif]
      text-[36px]
      font-extrabold
      leading-[43px]
      tracking-[-1.7px]
      text-[#141519]
    "
  >
    {pack.name}
  </h1>


  {/* PRICE */}

  <div className="mt-[6px] flex items-baseline gap-[7px]">

    <span
      className="
        text-[27px]
        font-extrabold
        leading-[32px]
        tracking-[-0.8px]
        text-[#292A2E]
      "
    >
      ${Number(
        pack.price || 0
      ).toFixed(0)}
    </span>

    <span
      className="
        text-[11px]
        font-medium
        text-[#5F6064]
      "
    >
      per pack
    </span>

  </div>


  {/* DESCRIPTION */}

  <p
    className="
      mt-[24px]
      max-w-[330px]
      text-[13px]
      font-medium
      leading-[19px]
      tracking-[-0.05px]
      text-[#57585C]
    "
  >
    {pack.description ||
      "This pack contains one graded and authenticated trading card. Once revealed, it's yours to vault, sell, or ship anytime."}
  </p>


  {/* RIP BUTTON */}

<div className="mt-[24px] flex justify-center">
  <button
   onClick={() => navigate(`/buy/${pack._id}`)}
    className="
      flex
      h-[34px]
      items-center
      justify-center
      gap-2
      rounded-full
      bg-[#2698F3]
      px-[18px]
      text-[11px]
      font-medium
      text-white
      shadow-[0_2px_5px_rgba(38,152,243,0.25)]
      transition
      active:scale-[0.97]
    "
  >
    Buy Now
    <span className="text-[15px] leading-none">
      →
    </span>
  </button>
</div>

</section>


{/* =================================================
    COLLECTOR PULL RATE
================================================= */}

<section className="mt-[28px]">

  <h2
    className="
      font-['Plus_Jakarta_Sans',sans-serif]
      text-[18px]
      font-extrabold
      tracking-[-0.5px]
      text-[#151619]
    "
  >
    Collector Pull Rate
  </h2>


  <div
    className="
      mt-[10px]
      overflow-hidden
      rounded-[14px]
      border
      border-[#d9d9dc]
      bg-white
    "
  >

    {pack.odds?.length > 0 ? (

      pack.odds.map((odd, index) => (

        <div
          key={odd._id || index}
          className="
            flex
            min-h-[52px]
            items-center
            border-b
            border-[#e5e5e7]
            last:border-b-0
          "
        >

          {/* RARITY */}

          <div
            className="
              flex
              h-[52px]
              w-[48px]
              shrink-0
              items-center
              justify-center
              border-r
              border-[#e5e5e7]
              text-[18px]
            "
          >
            {odd.icon || "💎"}
          </div>


          {/* DESCRIPTION */}

          <div className="min-w-0 flex-1 px-[9px]">

            <p
              className="
                text-[12px]
                font-bold
                leading-[15px]
                text-[#555]
              "
            >
              {odd.rarity}
            </p>

            <p
              className="
                truncate
                text-[10px]
                leading-[13px]
                text-[#888]
              "
            >
              {odd.description}
            </p>

          </div>


          {/* PERCENTAGE */}

          <div
            className="
              px-[10px]
              text-[11px]
              font-bold
              text-[#238bdc]
            "
          >
            {odd.percentage}%
          </div>

        </div>

      ))

    ) : (

      <div className="p-4 text-center">

        <p className="text-[11px] text-[#888]">
          Pull rates will be available soon.
        </p>

      </div>

    )}

  </div>

</section>


{/* =================================================
    SWITCH POKEMON PACKS
================================================= */}

<section className="mt-[34px]">

  <h2
    className="
      font-['Plus_Jakarta_Sans',sans-serif]
      text-[22px]
      font-extrabold
      leading-[27px]
      tracking-[-0.8px]
      text-[#111214]
    "
  >
    Switch Pokemon Packs
  </h2>


  <div
    className="
      mt-[16px]
      flex
      gap-[18px]
      overflow-x-auto
      pb-[5px]
      scrollbar-hide
    "
  >

    {(pack.otherPacks || []).map(
      (otherPack) => (

        <button
          key={otherPack._id}
          onClick={() =>
            navigate(
              `/rip/${otherPack._id}`
            )
          }
          className="
            flex
            w-[105px]
            shrink-0
            flex-col
            text-left
          "
        >

          {/* IMAGE */}

          <div
            className="
              flex
              h-[105px]
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-[8px]
              bg-transparent
            "
          >

            {otherPack.image ? (

              <img
                src={otherPack.image}
                alt={otherPack.name}
                className="
                  h-full
                  w-full
                  object-contain
                "
              />

            ) : (

              <Sparkles
                size={25}
                className="text-[#aaa]"
              />

            )}

          </div>


          {/* NAME */}

          <p
            className="
              mt-[7px]
              line-clamp-2
              text-[11px]
              font-extrabold
              leading-[14px]
              tracking-[-0.2px]
              text-[#151619]
            "
          >
            {otherPack.name}
          </p>


          {/* PRICE */}

          <p
            className="
              text-[10px]
              font-medium
              text-[#555]
            "
          >
            ${Number(
              otherPack.price || 0
            ).toFixed(0)}
          </p>

        </button>

      )
    )}

  </div>

</section>

      </main>

    </div>
  );
}