import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PackCard from "./PackCard";

export default function SwitchPacks({
  packs = [],
  currentPackId,
}) {
  const navigate = useNavigate();

  // =====================================================
  // REMOVE CURRENT PACK
  // =====================================================

  const availablePacks = packs.filter(
    (pack) =>
      String(pack?._id) !==
      String(currentPackId)
  );

  // Don't render if there are no other packs
  if (availablePacks.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex items-end justify-between gap-4">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#238bdc]">
            Explore More
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
            Switch Pokemon Packs
          </h2>
        </div>

        {/* DESKTOP VIEW ALL */}

        <button
          type="button"
          onClick={() => navigate("/packs")}
          className="
            hidden
            items-center
            gap-1.5
            rounded-full
            px-3
            py-2
            text-xs
            font-black
            text-[#238bdc]
            transition
            hover:bg-white
            sm:flex
          "
        >
          View all

          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>

      </div>

      {/* =================================================
          PACK LIST
      ================================================= */}

      <div
        className="
          -mx-1
          flex
          gap-4
          overflow-x-auto
          px-1
          pb-5
          pt-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {availablePacks.map((pack) => (
          <PackCard
            key={pack._id}
            pack={pack}
          />
        ))}
      </div>

      {/* =================================================
          MOBILE VIEW ALL
      ================================================= */}

      <button
        type="button"
        onClick={() => navigate("/packs")}
        className="
          mt-2
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-full
          bg-white
          py-3.5
          text-xs
          font-black
          text-[#238bdc]
          shadow-[0_5px_20px_rgba(0,0,0,0.05)]
          transition
          hover:bg-[#238bdc]
          hover:text-white
          sm:hidden
        "
      >
        View all packs

        <ArrowRight size={14} />
      </button>

    </section>
  );
}