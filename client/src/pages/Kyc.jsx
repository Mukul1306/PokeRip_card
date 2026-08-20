import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function Kyc() {

  const navigate =
    useNavigate();

  const [status, setStatus] =
    useState("NOT_STARTED");

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);


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


        if (
          response.ok
        ) {

          setStatus(
            data.data?.kyc?.status ||
            "NOT_STARTED"
          );

        }

      } catch (error) {

        console.error(
          "KYC status error:",
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
  // START KYC
  // =====================================================

  const handleStartKyc =
    async () => {

      try {

        setStarting(true);


        const token =
          localStorage.getItem(
            "token"
          );


        const response =
          await fetch(
            `${API_URL}/api/kyc/start`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to start KYC"
          );

        }


        const url =
          data.data?.verificationUrl;


        if (url) {

          window.location.href =
            url;

        } else {

          alert(
            "KYC session created. Please check your account."
          );

        }

      } catch (error) {

        console.error(
          "KYC start error:",
          error
        );

        alert(
          error.message
        );

      } finally {

        setStarting(false);

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        <Loader2
          className="animate-spin text-[#2698F3]"
          size={30}
        />

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-[#f5f5f5]">

      <main className="mx-auto max-w-[520px] px-5 py-5">


        {/* BACK */}

        <button
          onClick={() =>
            navigate(-1)
          }
          className="mb-8 flex items-center gap-2 text-[13px] font-medium"
        >

          <ArrowLeft size={17} />

          Back

        </button>


        {/* ICON */}

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f3ff]">

          <ShieldCheck
            size={32}
            className="text-[#2698F3]"
          />

        </div>


        <h1 className="mt-5 text-[30px] font-extrabold tracking-[-1px]">

          Verify your identity

        </h1>


        <p className="mt-3 max-w-[400px] text-[14px] leading-[21px] text-[#555]">

          Complete identity verification before
          using wallet deposits and withdrawals.

        </p>


        {/* STATUS */}

      {/* STATUS */}

<div className="mt-7 rounded-[18px] bg-white p-5">

  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888]">
    Verification Status
  </p>

  <p className="mt-2 text-[18px] font-extrabold">

    {status === "NOT_STARTED" &&
      "Not Verified"}

    {status === "STARTED" &&
      "Verification Started"}

    {status === "PENDING" &&
      "Verification Pending"}

    {status === "VERIFIED" &&
      "Identity Verified ✓"}

    {status === "REJECTED" &&
      "Verification Rejected"}

    {status === "REQUIRES_RETRY" &&
      "Verification Retry Required"}

  </p>

  <p className="mt-2 text-[12px] leading-[18px] text-[#777]">

    {status === "NOT_STARTED" &&
      "You need to complete identity verification before using wallet deposits and withdrawals."}

    {status === "STARTED" &&
      "Your verification session has been created. Continue below to submit your identity documents."}

    {status === "PENDING" &&
      "Your identity documents have been submitted and are currently being reviewed."}

    {status === "VERIFIED" &&
      "Your identity has been successfully verified. Wallet withdrawals are now available."}

    {status === "REJECTED" &&
      "Your verification was rejected. Please review the information and try again."}

    {status === "REQUIRES_RETRY" &&
      "Additional verification is required. Please complete the verification process again."}

  </p>


  {/* BUTTON */}

  {status !== "VERIFIED" && (

    <button
      onClick={handleStartKyc}
      disabled={starting}
      className="
        mt-5
        h-[46px]
        w-full
        rounded-full
        bg-[#2698F3]
        text-[13px]
        font-bold
        text-white
        active:scale-[0.98]
        disabled:opacity-60
      "
    >

      {starting ? (

        <span className="flex items-center justify-center gap-2">

          <Loader2
            size={17}
            className="animate-spin"
          />

          Starting...

        </span>

      ) : (

        <>
          {status === "NOT_STARTED" &&
            "Verify Identity"}

          {status === "STARTED" &&
            "Continue Verification"}

          {status === "PENDING" &&
            "Verification Under Review"}

          {status === "REJECTED" &&
            "Try Again"}

          {status === "REQUIRES_RETRY" &&
            "Continue Verification"}
        </>

      )}

    </button>

  )}

</div>
      </main>

    </div>

  );

}