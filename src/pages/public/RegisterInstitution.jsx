import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

import registerIllustration from "../../assets/image 3.png";
import graduationCap from "../../assets/GraduationCap.png";

export default function RegisterInstitution() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    institutionName: "",
    subdomain: "",
    admissionSession: "",
    address: "",
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
      setError("Admin passwords do not match.");
      return;
    }

    if (!form.agree) {
      setError("Please agree to the Terms & Conditions to register.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Institution first
      const instResponse = await api.post("/institutions", {
        name: form.institutionName,
        subdomain: form.subdomain.toLowerCase().trim(),
        address: form.address,
        admissionSession: form.admissionSession,
      });

      const tenantId = instResponse.data?.data?._id;
      if (!tenantId) {
        throw new Error("Failed to retrieve new institution identifier.");
      }

      // 2. Register the Institution Admin under that tenantId
      await api.post("/auth/register/admin", {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        tenantId,
      });

      navigate("/admin-login");
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Could not register your institution. Please check fields or subdomain uniqueness."
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
            src={registerIllustration}
            alt="Register Institution Illustration"
            className="w-[85%] max-w-none object-contain"
          />
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex flex-col overflow-y-auto">
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
            Already have account?
            <Link
              to="/admin-login"
              className="ml-2 inline-flex items-center rounded-full bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-dark transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-10">
          <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <h1 className="text-4xl font-bold text-navy mb-8">Register your institution</h1>

            {error && (
              <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-accent">
                {error}
              </div>
            )}

            {/* SECTION 1: INSTITUTION DETAILS */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navySoft mb-4 pb-1 border-b border-gray-100">
                Institution details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Institution name</label>
                  <input
                    type="text"
                    name="institutionName"
                    value={form.institutionName}
                    onChange={handleChange}
                    placeholder="eg. IIT Bombay"
                    className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Subdomain</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="subdomain"
                      value={form.subdomain}
                      onChange={handleChange}
                      placeholder="eg. iitb"
                      className="w-full rounded-lg border border-black/10 px-4 py-3.5 pr-28 text-sm outline-none focus:border-accent transition duration-200"
                      required
                    />
                    <span className="absolute right-4 text-xs font-semibold text-navySoft">
                      .scholarstack.com
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Admission session</label>
                    <input
                      type="text"
                      name="admissionSession"
                      value={form.admissionSession}
                      onChange={handleChange}
                      placeholder="e.g. 2026-2027"
                      className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="City, State, Country"
                      className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMIN DETAILS */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navySoft mb-4 pb-1 border-b border-gray-100">
                Admin details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name..."
                      className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name..."
                      className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full rounded-lg border border-black/10 px-4 py-3.5 text-sm outline-none focus:border-accent transition duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        className="w-full rounded-lg border border-black/10 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200"
                        required
                        minLength={6}
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
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="w-full rounded-lg border border-black/10 px-4 py-3.5 pr-10 text-sm outline-none focus:border-accent transition duration-200"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="flex items-start gap-2.5 text-sm text-navySoft select-none cursor-pointer">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-black/20 accent-accent"
                />
                <span>
                  I Agree with all of your{" "}
                  <Link to="/terms" className="font-semibold text-accent hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <span>→</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
