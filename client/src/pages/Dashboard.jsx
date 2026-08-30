import {
  useEffect,
  useState,
} from "react";

import {
  Wallet,
  ShoppingBag,
  Sparkles,
  LogOut,
  Loader2,
  User,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  const [packs, setPacks] = useState([]);
  const [walletBalance, setWalletBalance] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/user/dashboard`,
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
          "Unable to load dashboard"
        );
      }

      setPacks(
        data.data?.packs || []
      );

      // Wallet will come from backend
      setWalletBalance(
        Number(
          data.data?.walletBalance ||
          data.data?.stats?.walletBalance ||
          0
        )
      );

    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setPacks([]);
      setWalletBalance(0);

    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchDashboard();
  fetchWalletBalance();
}, []);

  // =====================================================
// FETCH WALLET BALANCE
// =====================================================

const fetchWalletBalance = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/wallet`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(
  "FULL DASHBOARD RESPONSE:",
  JSON.stringify(data, null, 2)
);

    console.log("Wallet API response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch wallet"
      );
    }

    // Supports common backend response structures
    const balance =
      data?.wallet?.balance ??
      data?.data?.balance ??
      data?.data?.wallet?.balance ??
      data?.balance ??
      0;

    setWalletBalance(Number(balance));
  } catch (error) {
    console.error(
      "Wallet fetch error:",
      error
    );

    setWalletBalance(0);
  }
};

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#101114]">

      <main className="mx-auto min-h-screen w-full max-w-[520px] bg-[#f5f5f5] pb-24">


        {/* =================================================
            WALLET
        ================================================= */}

       <header className="flex items-center justify-between px-5 py-4">

  {/* LOGO / TITLE */}

<div>
  <img
    src="https://www.ripit.co/assets/ripit-logo-x4.webp"
    alt="RIPIT"
    className="h-10 w-auto object-contain"
  />
</div>

  {/* RIGHT SIDE */}

  <div className="flex items-center gap-2">

    {/* WALLET */}

<button
  onClick={() => navigate("/wallet")}
  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 shadow-sm"
>
  <Wallet
    size={15}
    className="text-[#238bdc]"
  />

  <span className="text-[11px] font-black">
    ${walletBalance.toFixed(2)}
  </span>

  <span className="text-[13px] font-black text-[#238bdc]">
    +
  </span>
</button>


    {/* LOGOUT */}

    <button
      onClick={handleLogout}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
    >
      <LogOut size={16} />
    </button>

  </div>

</header>

        {/* =================================================
            PACK STORE
        ================================================= */}

       {/* =================================================
    PACK STORE
================================================= */}

<section className="mt-6 px-3">

  {/* HEADING */}

<section className="px-[15px]">

  <h2
    className="
      font-['Plus_Jakarta_Sans',sans-serif]
      text-[50px]
      font-extrabold
      leading-[46px]
      tracking-[-1.5px]
      text-[#141519]
    "
  >
    Pokemon
  </h2>

  <p
    className="
      mt-[8px]
      max-w-[320px]
      font-['Plus_Jakarta_Sans',sans-serif]
      text-[14px]
      font-medium
      leading-[18px]
      tracking-[-0.15px]
      text-[#3F4044]
    "
  >
    Choose your pack tier and rip for a premium graded
    trading card.
  </p>

</section>


  {/* PACK GRID */}

{/* =================================================
    PACK GRID
================================================= */}

{packs.length === 0 ? (

  <div className="mt-5 rounded-[16px] bg-white p-10 text-center">
    <Sparkles
      size={28}
      className="mx-auto text-[#aaa]"
    />

    <p className="mt-3 text-sm font-black">
      No packs available
    </p>

    <p className="mt-1 text-[10px] text-[#888]">
      New packs will appear here.
    </p>
  </div>

) : (

<div className="mt-5 grid grid-cols-2 gap-[10px] px-[11px]">

  {packs.map((pack) => (

    <div
      key={pack._id}
      className="
        overflow-hidden
        rounded-[5px]
        bg-white
      "
    >

      {/* PACK IMAGE */}

      <div
        className="
          flex
          h-[300px]
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
              px-[10px]
            "
          />
        ) : (
          <Sparkles
            size={32}
            className="text-[#aaa]"
          />
        )}

      </div>


      {/* NAME + PRICE */}

      <div className="px-[18px] pb-[12px] pt-[3px]">

        <div className="flex items-center justify-between gap-1">

          <h3
            className="
              min-w-0
              truncate
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[12px]
              font-extrabold
              leading-[16px]
              tracking-[-0.35px]
              text-[#111214]
            "
          >
            {pack.name}
          </h3>

<span
  className="
    shrink-0
    font-['Plus_Jakarta_Sans',sans-serif]
    text-[12px]
    font-extrabold
    leading-[16px]
    tracking-[-0.35px]
    text-[#111214]
  "
>
  $
  {Number(
    pack.packPrice ??
    pack.price ??
    0
  ).toFixed(2)}
</span>

        </div>


        {/* VIEW PACK */}

        <button
          onClick={() =>
            navigate(`/rip/${pack._id}`)
          }
          className="
            mt-[8px]
            h-[34px]
            w-full
            rounded-full
            bg-[#2698F3]
            font-['Plus_Jakarta_Sans',sans-serif]
            text-[11px]
            font-medium
            leading-none
            text-white
            transition
            active:scale-[0.97]
          "
        >
          View Pack
        </button>

      </div>

    </div>

  ))}

</div>

)}

</section>


        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

    {/* =================================================
    BOTTOM NAVIGATION
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
    onClick={() => navigate("/dashboard")}
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
      Packs
    </span>

  </button>


  {/* ORDERS */}

  <button
    onClick={() => navigate("/orders")}
    className="
      flex
      flex-col
      items-center
      gap-1
      text-[#777]
    "
  >

    <ShoppingBag size={18} />

    <span className="text-[8px] font-black">
      Orders
    </span>

  </button>


  {/* COLLECTION */}

  <button
    onClick={() => navigate("/collection")}
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
      Collection
    </span>

  </button>


  {/* PROFILE */}

  <button
    onClick={() => navigate("/profile")}
    className="
      flex
      flex-col
      items-center
      gap-1
      text-[#777]
    "
  >

    <User size={18} />

    <span className="text-[8px] font-black">
      Profile
    </span>

  </button>

</nav>

      </main>

    </div>
  );
}