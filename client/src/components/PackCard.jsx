import {
  ArrowRight,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PackCard({ pack }) {
  const navigate = useNavigate();

  if (!pack) return null;

  // =====================================================
  // REAL PACK PRICE
  // Your API returns:
  // "price": 854.7
  // =====================================================

  const price = Number(
    pack.price ?? pack.packPrice ?? 0
  );

  // =====================================================
  // STOCK
  // =====================================================

  const stock = Number(
    pack.totalStock ?? 0
  );

  // =====================================================
  // IMAGE
  // =====================================================

  const image =
    pack.image ||
    pack.category?.image ||
    "";

  // =====================================================
  // CATEGORY
  // =====================================================

  const category =
    pack.category?.name || "";

  // =====================================================
  // OPEN PACK
  // KEEP EXISTING FUNCTIONALITY
  // =====================================================

  const handleClick = () => {
    if (!pack._id) return;

    navigate(`/rip/${pack._id}`);
  };

  // =====================================================
  // CARD
  // =====================================================

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleClick();
        }
      }}
      className="
        group
        relative
        w-[210px]
        shrink-0
        cursor-pointer
        overflow-hidden
        rounded-[26px]
        border
        border-black/[0.06]
        bg-white
        shadow-[0_6px_25px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-[#238bdc]/20
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]
        focus:outline-none
        focus:ring-2
        focus:ring-[#238bdc]/40
      "
    >

      {/* =================================================
          IMAGE SECTION
      ================================================= */}

      <div
        className="
          relative
          flex
          h-[260px]
          items-center
          justify-center
          overflow-hidden
          bg-[#eeeeee]
          p-5
        "
      >

        {/* BACKGROUND GRID */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-30
          "
          style={{
            backgroundImage:
              `
              linear-gradient(
                rgba(0,0,0,0.035) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(0,0,0,0.035) 1px,
                transparent 1px
              )
              `,
            backgroundSize:
              "30px 30px",
          }}
        />

        {/* =================================================
            DECORATIVE DIAMONDS
        ================================================= */}

        <div className="pointer-events-none absolute inset-0">

          <div
            className="
              absolute
              left-5
              top-5
              h-9
              w-9
              rotate-45
              rounded-[9px]
              bg-white/80
            "
          />

          <div
            className="
              absolute
              right-5
              top-5
              h-9
              w-9
              rotate-45
              rounded-[9px]
              bg-white/80
            "
          />

          <div
            className="
              absolute
              bottom-5
              left-7
              h-8
              w-8
              rotate-45
              rounded-[8px]
              bg-white/80
            "
          />

          <div
            className="
              absolute
              bottom-5
              right-7
              h-8
              w-8
              rotate-45
              rounded-[8px]
              bg-white/80
            "
          />

          {/* CENTER GLOW */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-28
              w-28
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white/60
              blur-3xl
            "
          />

        </div>

        {/* =================================================
            PACK IMAGE
        ================================================= */}

        {image ? (
          <img
            src={image}
            alt={pack.name || "Pack"}
            loading="lazy"
            className="
              relative
              z-10
              max-h-[220px]
              max-w-[82%]
              object-contain
              drop-shadow-[0_15px_18px_rgba(0,0,0,0.14)]
              transition-all
              duration-500
              group-hover:scale-[1.06]
              group-hover:drop-shadow-[0_20px_25px_rgba(0,0,0,0.18)]
            "
          />
        ) : (
          <div
            className="
              relative
              z-10
              flex
              flex-col
              items-center
              gap-2
              text-gray-300
            "
          >
            <Package size={55} />

            <span className="text-[10px] font-bold">
              No image
            </span>
          </div>
        )}

        {/* =================================================
            STOCK BADGE
        ================================================= */}

        {stock > 0 ? (
          <span
            className="
              absolute
              right-3
              top-3
              z-20
              rounded-full
              bg-white/95
              px-2.5
              py-1
              text-[9px]
              font-black
              text-gray-600
              shadow-sm
              backdrop-blur
            "
          >
            {stock} available
          </span>
        ) : (
          <span
            className="
              absolute
              right-3
              top-3
              z-20
              rounded-full
              bg-red-500
              px-2.5
              py-1
              text-[9px]
              font-black
              text-white
            "
          >
            Sold out
          </span>
        )}

        {/* =================================================
            HOVER RIP LABEL
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-3
            left-1/2
            z-20
            -translate-x-1/2
            translate-y-3
            rounded-full
            bg-[#238bdc]
            px-3
            py-1.5
            text-[9px]
            font-black
            text-white
            opacity-0
            shadow-lg
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          Rip Now
        </div>

      </div>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <div className="p-4">

        {/* CATEGORY */}

        {category && (
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              text-[#238bdc]
            "
          >
            {category}
          </p>
        )}

        {/* NAME */}

        <h3
          className="
            mt-1
            truncate
            text-base
            font-black
            tracking-[-0.025em]
            text-[#101114]
          "
          title={pack.name}
        >
          {pack.name || "Unnamed Pack"}
        </h3>

        {/* PRICE + ARROW */}

        <div className="mt-3 flex items-center justify-between">

          <div>

            <span
              className="
                block
                text-[19px]
                font-black
                leading-none
                tracking-[-0.03em]
              "
            >
              ${price.toFixed(2)}
            </span>

            <span
              className="
                mt-1
                block
                text-[9px]
                font-semibold
                text-gray-400
              "
            >
              per pack
            </span>

          </div>

          {/* ARROW */}

          <span
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#238bdc]
              text-white
              shadow-[0_5px_15px_rgba(35,139,220,0.2)]
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:bg-[#177bc9]
            "
          >
            <ArrowRight size={16} />
          </span>

        </div>

      </div>

    </article>
  );
}