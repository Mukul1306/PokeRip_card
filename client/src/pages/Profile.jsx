import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Loader2,
  Wallet,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  useNavigate,
} from "react-router-dom";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function Profile() {

  const navigate =
    useNavigate();

  const [kycStatus, setKycStatus] =
    useState("NOT_STARTED");

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // GET KYC STATUS
  // =====================================================

  const fetchKycStatus =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/kyc/status`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (response.ok) {

          setKycStatus(
            data.data?.kyc?.status ||
            "NOT_STARTED"
          );

        }

      } catch (error) {

        console.error(
          "Profile KYC error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchKycStatus();

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/login");

  };


  // =====================================================
  // KYC LABEL
  // =====================================================

  const getKycLabel = () => {

    switch (kycStatus) {

      case "VERIFIED":
        return "Verified";

      case "PENDING":
        return "Verification Pending";

      case "REJECTED":
        return "Verification Rejected";

      case "REQUIRES_RETRY":
        return "Verification Required";

      default:
        return "Not Verified";

    }

  };


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">

        <Loader2
          size={28}
          className="animate-spin text-[#2698F3]"
        />

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-[#f5f5f5]">

      <main
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[520px]
          bg-[#f5f5f5]
          px-[15px]
          pb-24
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex
            items-center
            justify-between
            py-4
          "
        >

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
            "
          >

            <ArrowLeft
              size={17}
            />

          </button>


          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-9 w-auto object-contain"
          />


          <div className="w-9" />

        </header>


        {/* =================================================
            PROFILE TITLE
        ================================================= */}

        <section className="mt-7">

          <div
            className="
              flex
              h-[58px]
              w-[58px]
              items-center
              justify-center
              rounded-full
              bg-white
            "
          >

            <User
              size={26}
              className="text-[#2698F3]"
            />

          </div>


          <h1
            className="
              mt-4
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[30px]
              font-extrabold
              leading-[34px]
              tracking-[-1px]
              text-[#141519]
            "
          >
            Profile
          </h1>


          <p
            className="
              mt-1
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[13px]
              font-medium
              text-[#777]
            "
          >
            Manage your account and verification.
          </p>

        </section>


        {/* =================================================
            KYC
        ================================================= */}

        <section className="mt-7">

          <p
            className="
              mb-2
              px-1
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-[#999]
            "
          >
            Account Verification
          </p>


          <button
            onClick={() =>
              navigate("/kyc")
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-[16px]
              bg-white
              px-[15px]
              py-[15px]
              text-left
              active:scale-[0.99]
              transition
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-[40px]
                  w-[40px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#eaf5ff]
                "
              >

                <ShieldCheck
                  size={21}
                  className="text-[#2698F3]"
                />

              </div>


              <div>

                <p
                  className="
                    font-['Plus_Jakarta_Sans',sans-serif]
                    text-[12px]
                    font-extrabold
                    text-[#111214]
                  "
                >
                  KYC Verification
                </p>


                <p
                  className="
                    mt-[3px]
                    font-['Plus_Jakarta_Sans',sans-serif]
                    text-[10px]
                    font-medium
                    text-[#777]
                  "
                >
                  {getKycLabel()}
                </p>

              </div>

            </div>


            <ChevronRight
              size={18}
              className="text-[#999]"
            />

          </button>

        </section>


        {/* =================================================
            WALLET
        ================================================= */}

        <section className="mt-7">

          <p
            className="
              mb-2
              px-1
              font-['Plus_Jakarta_Sans',sans-serif]
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-[#999]
            "
          >
            Wallet
          </p>


          <button
            onClick={() =>
              navigate("/wallet")
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-[16px]
              bg-white
              px-[15px]
              py-[15px]
            "
          >

            <span
              className="
                font-['Plus_Jakarta_Sans',sans-serif]
                text-[12px]
                font-extrabold
              "
            >
              Wallet
            </span>


            <ChevronRight
              size={18}
              className="text-[#999]"
            />

          </button>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          onClick={handleLogout}
          className="
            mt-8
            flex
            h-[46px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-white
            font-['Plus_Jakarta_Sans',sans-serif]
            text-[12px]
            font-extrabold
            text-[#e33]
          "
        >

          <LogOut size={16} />

          Log Out

        </button>

      </main>


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

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="flex flex-col items-center gap-1 text-[#777]"
        >
          <Sparkles size={18} />
          <span className="text-[8px] font-black">
            Packs
          </span>
        </button>


        <button
          onClick={() =>
            navigate("/orders")
          }
          className="flex flex-col items-center gap-1 text-[#777]"
        >
          <ShoppingBag size={18} />
          <span className="text-[8px] font-black">
            Orders
          </span>
        </button>


        <button
          onClick={() =>
            navigate("/collection")
          }
          className="flex flex-col items-center gap-1 text-[#777]"
        >
          <Sparkles size={18} />
          <span className="text-[8px] font-black">
            Collection
          </span>
        </button>


        <button
          className="flex flex-col items-center gap-1 text-[#238bdc]"
        >
          <User size={18} />
          <span className="text-[8px] font-black">
            Profile
          </span>
        </button>

      </nav>

    </div>

  );
}