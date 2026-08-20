import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful.");

      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 400);
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#2C2E33] flex flex-col items-center justify-between p-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center mt-4">
        {/* Logo Section */}
      <div>
  <img
    src="https://www.ripit.co/assets/ripit-logo-x4.webp"
    alt="RIPIT"
    className="h-10 w-auto object-contain"
  />
</div>
        <div className="w-full">
        <div className="mb-6 text-center">
    <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
      Welcome back
    </h2>
    <p className="text-sm font-medium text-[#6B7280]">
      Log in to continue your PokeRip experience.
    </p>
  </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#DC2626]">
                Email Address*
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-300 transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold text-[#DC2626]">
                  Password*
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#3B82F6] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-300 transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error State Banner */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-[#FEE2E2] px-4 py-3 text-xs font-medium text-[#991B1B]">
                <CircleAlert size={18} className="shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            {/* Success State Banner */}
            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-800">
                <CheckCircle2 size={18} className="shrink-0 text-green-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/register"
                className="flex-1 text-center rounded-full border border-gray-300 bg-white px-5 py-3 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Go Back
              </Link>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="flex-1 group flex items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    LOGIN
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="text-xs font-semibold text-[#3B82F6] hover:underline"
            >
              Need an account? Resend Code / Register
            </Link>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="mt-12 text-center text-[11px] text-gray-400 space-y-1">
        <p>
          Powered by <span className="font-bold text-gray-500">stripe</span>
        </p>
        <p className="text-[#3B82F6] cursor-pointer hover:underline">
          Contact Ripit Support
        </p>
   
      </footer>
    </div>
  );
}