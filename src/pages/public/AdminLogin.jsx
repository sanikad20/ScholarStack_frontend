import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

import loginIllustration from "../../assets/image 4.png";
import graduationCap from "../../assets/GraduationCap.png";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("instAdmin"); // "instAdmin" or "superAdmin"
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const config = {};
      if (activeTab === "superAdmin") {
        config.headers = {
          Host: "super.localhost",
        };
      }

      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      }, config);

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      const role = data?.user?.role;

      if (role === "superAdmin") {
        navigate("/superadmin/institutions");
      } else if (role === "instAdmin") {
        navigate("/admin/applications");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT ILLUSTRATION PANEL */}
      <div className="hidden lg:flex flex-col bg-[#EDEBFB] px-10 py-10 relative">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={graduationCap} alt="ScholarStack" className="h-10 w-auto object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-navy">ScholarStack</span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-navySoft">
              Admission Platform
            </span>
          </div>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="w-[85%] max-w-none object-contain"
          />
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between lg:justify-end px-6 lg:px-16 py-6 border-b border-black/5 lg:border-none">
          <Link to="/" className="flex items-center gap-3 lg:hidden">
            <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-navy">ScholarStack</span>
              <span className="mt-1 text-[9px] uppercase tracking-wider text-navySoft">
                Admission Platform
              </span>
            </div>
          </Link>

          <div className="text-sm text-navySoft">
            Don't have account?
            <Link
              to="/register-institution"
              className="ml-2 inline-flex items-center rounded-full bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-dark transition duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md">
            
            {/* ROLE TAB SWITCHER */}
            <div className="flex rounded-lg border border-gray-200 p-1 mb-10 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("instAdmin");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition duration-200 ${
                  activeTab === "instAdmin"
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
                  setError("");
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition duration-200 ${
                  activeTab === "superAdmin"
                    ? "bg-accent text-white shadow-sm"
                    : "text-navySoft hover:text-navy"
                }`}
              >
                Super Admin
              </button>
            </div>

            <h1 className="text-4xl font-bold text-navy mb-8">
              Sign in to manage admissions
            </h1>

            {error && (
              <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-accent">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Username or email address..."
                  className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-lg border border-black/10 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft"
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
                    className="h-4 w-4 rounded border-black/20 accent-accent"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            </form>

            <div className="mt-8 text-sm text-navySoft">
              Are you a student applicant?
              <Link to="/login" className="ml-1 font-semibold text-accent hover:underline">
                Go to Student Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
