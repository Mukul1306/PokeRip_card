import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "Please complete all fields.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address.";
    }
    if (form.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Account created successfully redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#2C2E33] flex flex-col items-center justify-between p-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center mt-4">
        {/* Logo Header */}
        <div className="mb-6">
          <img
            src="https://www.ripit.co/assets/ripit-logo-x4.webp"
            alt="RIPIT"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-full">
          {/* Section Header */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-sm font-medium text-[#6B7280]">
              Join PokeRip and start your collecting experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              icon={UserRound}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
            />

            <PasswordInput
              label="Password"
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              visible={showPassword}
              setVisible={setShowPassword}
            />

            <PasswordInput
              label="Confirm password"
              name="confirmPassword"
              placeholder="Enter your password again"
              value={form.confirmPassword}
              onChange={handleChange}
              visible={showConfirmPassword}
              setVisible={setShowConfirmPassword}
            />

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <div className="flex items-center gap-3 pt-3">
              <Link
                to="/login"
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
                    Creating...
                  </>
                ) : (
                  <>
                    REGISTER
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#3B82F6] hover:underline"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[11px] text-gray-400 space-y-1">
        <p>
          Powered by <span className="font-bold text-gray-500">stripe</span>
        </p>
        <p className="text-[#3B82F6] cursor-pointer hover:underline">
          Contact Ripit Support
        </p>
        <p>
          By continuing you agree to the{" "}
          <Link to="/terms" className="text-[#3B82F6] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-[#3B82F6] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}

function Input({ label, name, type, placeholder, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          required
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={name}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-300 transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  visible,
  setVisible,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          required
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-300 transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-medium ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-[#FEE2E2] text-[#991B1B]"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="shrink-0 text-green-600" />
      ) : (
        <CircleAlert size={18} className="shrink-0 text-[#DC2626]" />
      )}

      <span>{message}</span>
    </div>
  );
}