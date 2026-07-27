// src/pages/public/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import loginIllustration from "../../assets/image 4.png";
import graduationCap from "../../assets/GraduationCap.png";

import Toast from "../../components/ui/Toast";
import { forgotPassword } from "../../api/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address.", "error");
      return;
    }
    setLoading(true);
    setToast(null);

    try {
      const { data } = await forgotPassword(email);
      if (data?.success) {
        showToast("Password reset link sent to your email.", "success");
        setEmail(""); // clear form
      } else {
        showToast(data?.message || "Failed to send reset link.", "error");
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "Error connecting to server.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ─── Header ────────────────────────────────────── */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-16 border-b border-gray-100 bg-white shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
        </Link>
        <div className="text-sm text-navySoft flex items-center gap-2">
          <span>Remember your password?</span>
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
            alt="Forgot Password Illustration"
            className="max-w-[85%] max-h-[85%] object-contain"
          />
        </div>

        {/* Right: Form */}
        <div className="overflow-y-auto px-6 lg:px-16 py-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-3 tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-navySoft mb-8">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
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