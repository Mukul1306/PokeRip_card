import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function useKyc() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // GET CURRENT KYC STATUS
  // ==========================================

  const getKycStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/kyc/status`,
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
          data.message || "Unable to get KYC status"
        );
      }

      setKyc(data.data);

      return data.data;
    } catch (err) {
      console.error("KYC status error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // START KYC
  // ==========================================

  const startKyc = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/kyc/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start KYC verification"
        );
      }

      setKyc(data.data);

      return data.data;
    } catch (err) {
      console.error("Start KYC error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT KYC DOCUMENTS
  // ==========================================

  const submitKyc = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/kyc/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit KYC"
        );
      }

      setKyc(data.data);

      return data.data;
    } catch (err) {
      console.error("Submit KYC error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    kyc,
    loading,
    error,
    getKycStatus,
    startKyc,
    submitKyc,
  };
}