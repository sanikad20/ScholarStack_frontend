import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

import loginIllustration from "../../assets/image 4.png";
import graduationCap from "../../assets/GraduationCap.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
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
      const { data } = await api.post("/auth/login", {
        email: form.identifier,
        password: form.password,
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        login(data.user);
      }

      const role = data?.user?.role;

      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "instAdmin") {
        navigate("/admin/dashboard");
      } else if (role === "superAdmin") {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ??
        "Couldn't sign in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT PANEL */}

      <div className="hidden lg:flex flex-col bg-[#EDEBFB] px-10 py-10">

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src={graduationCap}
            alt="ScholarStack"
            className="h-10 w-auto object-contain"
          />

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-navy">
              ScholarStack
            </span>

            <span className="text-[10px] uppercase tracking-wider text-navySoft mt-1">
              Admission Platform
            </span>
          </div>
        </Link>

        <div className="flex-1 flex items-center justify-center">

          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="w-[90%] max-w-none"
          />

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="flex flex-col">

        <div className="flex justify-between lg:justify-end items-center px-6 lg:px-16 py-6">

          {/* Mobile Logo */}

          <Link
            to="/"
            className="flex items-center gap-3 lg:hidden"
          >
            <img
              src={graduationCap}
              alt="ScholarStack"
              className="h-9 w-auto object-contain"
            />

            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-navy">
                ScholarStack
              </span>

              <span className="text-[9px] uppercase tracking-wider text-navySoft mt-1">
                Admission Platform
              </span>
            </div>
          </Link>

          <div className="text-base text-navySoft">

            Don't have an account?

            <Link
              to="/register"
              className="inline-flex items-center bg-accent hover:bg-accent-dark text-white font-semibold rounded-full px-5 py-2.5 ml-2 transition"
            >
              Create Account
            </Link>

          </div>

        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md"
          >

            <h1 className="text-4xl font-bold text-navy mb-10">
              Sign in to your account
            </h1>

            {error && (
              <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-base text-accent">
                {error}
              </div>
            )}

            {/* Email */}

            <div className="mb-6">

              <label className="block text-base font-medium text-navy mb-2">
                Email
              </label>

              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Username or email address..."
                className="w-full rounded-lg border border-black/10 px-5 py-4 text-base outline-none focus:border-accent transition"
                required
              />

            </div>

            {/* Password */}

            <div className="mb-5">

              <label className="block text-base font-medium text-navy mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password..."
                  className="w-full rounded-lg border border-black/10 px-5 py-4 pr-12 text-base outline-none focus:border-accent transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navySoft"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Remember */}

            <div className="mb-9 flex items-center justify-between">

              <label className="flex items-center gap-2.5 text-base text-navySoft">

                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 accent-accent"
                />

                Remember me

              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-accent"
              >
                Forgot password?
              </Link>

            </div>

            {/* Button */}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-white hover:bg-accent-dark disabled:opacity-60 transition"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <span>→</span>}
            </button>

            <div className="mt-8 text-base text-navySoft">

              Signing in as an institution admin or super admin?

              <Link
                to="/admin-login"
                className="ml-1 font-medium text-accent"
              >
                Go to Admin Login
              </Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}