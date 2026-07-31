// src/pages/public/AdminLogin.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import loginIllustration from "../../assets/image 4.png";
import graduationCap from "../../assets/GraduationCap.png";

import Toast from "../../components/ui/Toast";
import api from "../../api/axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState("instAdmin");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const config = {};
      if (activeTab === "superAdmin") {
        config.headers = { Host: "super.localhost" };
      }

      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      }, config);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        login(data.user);
      }

      const role = data?.user?.role;

      if (role === "superAdmin") {
        navigate("/superadmin/dashboard");
      } else if (role === "instAdmin") {
        navigate("/admin/dashboard"); 
      } else {
        navigate("/");
      }

    } catch (err) {
      const msg = err.response?.data?.message ?? "Authentication failed. Please verify credentials.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER (same as before) */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-16 border-b border-gray-100 bg-white shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
        </Link>
        <div className="text-sm text-navySoft flex items-center gap-2">
          <span>Don't have account?</span>
          <Link
            to="/register-institution"
            className="inline-flex items-center justify-center rounded-lg bg-[#FDEDE8] hover:bg-[#FCDCD0] px-5 py-2 text-sm font-semibold text-accent transition duration-200"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* SPLIT PANEL (same as before) */}
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        <div className="hidden lg:flex items-center justify-center bg-[#EDEBFB] p-12">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="max-w-[85%] max-h-[85%] object-contain"
          />
        </div>

        <div className="overflow-y-auto px-6 lg:px-16 py-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">

            {/* ROLE TAB SWITCHER */}
            <div className="flex rounded-lg border border-gray-200 p-1 mb-8 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("instAdmin");
                  setToast(null);
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition duration-200 ${activeTab === "instAdmin"
                  ? "bg-accent text-white shadow-sm"
                  : "text-navySoft hover:text-navy"
                  }`}
              >
                Institution Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("superAdmin");
                  setToast(null);
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition duration-200 ${activeTab === "superAdmin"
                  ? "bg-accent text-white shadow-sm"
                  : "text-navySoft hover:text-navy"
                  }`}
              >
                Super Admin
              </button>
            </div>

            <h1 className="text-3xl font-bold text-navy mb-8 tracking-tight">
              Sign in to manage admissions
            </h1>

            {/* ─── Inline error removed ──────────────────── */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Username or email address..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navySoft mb-2 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={showPassword ? () => setShowPassword(false) : () => setShowPassword(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft hover:text-navy transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between select-none">
                <label className="flex items-center gap-2 text-sm text-navySoft cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            </form>

            {/* Back link to Student Login */}
            <div className="mt-8 text-sm text-navySoft text-center">
              Are you a student?{" "}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Sign in to Student Console
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