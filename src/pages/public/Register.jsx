import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

import registerIllustration from "../../assets/image 3.png";
import graduationCap from "../../assets/GraduationCap.png";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!form.agree) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col bg-[#EDEBFB] px-10 py-10">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={graduationCap}
            alt="ScholarStack"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-navy">ScholarStack</span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-navySoft">
              Admission Platform
            </span>
          </div>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <img
            src={registerIllustration}
            alt="Register Illustration"
            className="w-[90%] max-w-none"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between lg:justify-end px-6 lg:px-16 py-6">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-3 lg:hidden">
            <img
              src={graduationCap}
              alt="ScholarStack"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-navy">ScholarStack</span>
              <span className="mt-1 text-[9px] uppercase tracking-wider text-navySoft">
                Admission Platform
              </span>
            </div>
          </Link>

          <div className="text-base text-navySoft">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-base font-semibold text-white hover:bg-accent-dark transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <h1 className="mb-10 text-4xl font-bold text-navy">Create your account</h1>

            {error && (
              <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-base text-accent">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-base font-medium text-navy mb-2">First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name..."
                  className="w-full rounded-lg border border-black/10 px-4 py-4 text-base outline-none focus:border-accent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-medium text-navy mb-2">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name..."
                  className="w-full rounded-lg border border-black/10 px-4 py-4 text-base outline-none focus:border-accent transition"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-navy mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address..."
                className="w-full rounded-lg border border-black/10 px-5 py-4 text-base outline-none focus:border-accent transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-base font-medium text-navy mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password..."
                    className="w-full rounded-lg border border-black/10 px-4 py-4 pr-11 text-base outline-none focus:border-accent transition"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-navy mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password..."
                    className="w-full rounded-lg border border-black/10 px-4 py-4 pr-11 text-base outline-none focus:border-accent transition"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="mb-9 flex items-start gap-2.5 text-base text-navySoft">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-black/20 accent-accent"
              />
              <span>
                I agree with all of your{" "}
                <Link to="/terms" className="font-medium text-accent">
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <span>→</span>}
            </button>

            <div className="mt-8 text-base text-navySoft">
              Registering an institution?
              <Link to="/register-institution" className="ml-1 font-medium text-accent">
                Register Institution
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}