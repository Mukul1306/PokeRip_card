import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LockKeyhole, Loader2, ArrowLeft } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter both passwords.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password"
        );
      }

      setMessage("Password changed successfully.");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] px-5 py-8">

      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-[#555]"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-semibold">
          Back
        </span>
      </button>

      <div className="mx-auto w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="
              text-[30px]
              font-black
              tracking-tight
              text-[#111214]
            "
          >
            PokeRip
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Create a new password for your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] bg-white p-6 shadow-sm">

          <div className="mb-6 flex justify-center">
            <div
              className="
                flex
                h-[52px]
                w-[52px]
                items-center
                justify-center
                rounded-full
                bg-[#eaf5ff]
              "
            >
              <LockKeyhole
                size={25}
                className="text-[#2698F3]"
              />
            </div>
          </div>

          <h2
            className="
              text-center
              text-[20px]
              font-extrabold
              text-[#111214]
            "
          >
            Reset Password
          </h2>

          <p
            className="
              mt-2
              text-center
              text-[12px]
              text-[#777]
            "
          >
            Enter your new password below.
          </p>

          <form
            onSubmit={handleResetPassword}
            className="mt-7"
          >

            {/* New Password */}
            <label
              className="
                mb-2
                block
                text-[12px]
                font-bold
                text-[#333]
              "
            >
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="
                mb-5
                w-full
                rounded-[12px]
                border
                border-[#e5e5e5]
                bg-[#fafafa]
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#2698F3]
              "
            />

            {/* Confirm Password */}
            <label
              className="
                mb-2
                block
                text-[12px]
                font-bold
                text-[#333]
              "
            >
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="
                w-full
                rounded-[12px]
                border
                border-[#e5e5e5]
                bg-[#fafafa]
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#2698F3]
              "
            />

            {/* Error */}
            {error && (
              <p className="mt-4 text-[12px] font-semibold text-red-500">
                {error}
              </p>
            )}

            {/* Success */}
            {message && (
              <p className="mt-4 text-[12px] font-semibold text-green-600">
                {message}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[12px]
                bg-[#2698F3]
                px-4
                py-3
                text-sm
                font-extrabold
                text-white
                transition
                active:scale-[0.98]
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

          </form>

          <button
            onClick={() => navigate("/login")}
            className="
              mt-5
              w-full
              text-center
              text-[12px]
              font-bold
              text-[#2698F3]
            "
          >
            Back to Login
          </button>

        </div>
      </div>
    </div>
  );
}