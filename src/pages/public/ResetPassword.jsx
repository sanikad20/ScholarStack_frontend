// src/pages/public/ResetPassword.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import loginIllustration from "../../assets/image 4.png";
import graduationCap from "../../assets/GraduationCap.png";

import Toast from "../../components/ui/Toast";
import { resetPassword } from "../../api/auth.api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Invalid or missing reset token.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const { data } = await resetPassword(token, password);
      if (data?.success) {
        showToast("Password reset successful! Redirecting to login...", "success");
        setTimeout(() => {
          navigate("/admin-login");
        }, 2500);
      } else {
        showToast(data?.message || "Failed to reset password.", "error");
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "Error resetting password.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // If token is missing, show an error message
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-navy mb-4">Invalid Reset Link</h2>
          <p className="text-navySoft mb-6">
            The password reset link is missing or invalid. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-accent-dark transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ─── Header ────────────────────────────────────── */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-16 border-b border-gray-100 bg-white shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
        </Link>
        <div className="text-sm text-navySoft flex items-center gap-2">
          <Link
            to="/admin-login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 px-5 py-2 text-sm font-semibold text-navy transition duration-200"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Back to Login
          </Link>
        </div>
      </header>

      {/* ─── Split Panel ────────────────────────────── */}
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        {/* Left: Illustration */}
        <div className="hidden lg:flex items-center justify-center bg-[#EDEBFB] p-12">
          <img
            src={loginIllustration}
            alt="Reset Password Illustration"
            className="max-w-[85%] max-h-[85%] object-contain"
          />
        </div>

        {/* Right: Form */}
        <div className="overflow-y-auto px-6 lg:px-16 py-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-3 tracking-tight">
              Create New Password
            </h1>
            <p className="text-sm text-navySoft mb-8">
              Enter your new password below. It must be at least 6 characters long.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft hover:text-navy transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft hover:text-navy transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-navySoft">
              <Link to="/admin-login" className="text-accent hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toast ────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
}