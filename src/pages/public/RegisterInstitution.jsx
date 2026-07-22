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
      await api.post("/auth/register/institution", {
        institutionName: form.institutionName,
        subdomain: form.subdomain.toLowerCase().trim(),
        admissionSession: form.admissionSession,
        address: form.address,
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });

      navigate("/admin-login");
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Could not register your institution. Check field values or subdomain availability."
      );
    } finally {
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* FULL-WIDTH TOP HEADER */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-16 border-b border-gray-100 bg-white shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
        </Link>
        <div className="text-sm text-navySoft flex items-center gap-2">
          <span>Already have account?</span>
          <Link
            to="/admin-login"
            className="inline-flex items-center justify-center rounded-lg bg-[#FDEDE8] hover:bg-[#FCDCD0] px-5 py-2 text-sm font-semibold text-accent transition duration-200"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* SPLIT PANEL BELOW HEADER */}
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        {/* LEFT COLUMN: ILLUSTRATION */}
        <div className="hidden lg:flex items-center justify-center bg-[#EDEBFB] p-12">
          <img
            src={registerIllustration}
            alt="Register Institution Illustration"
            className="max-w-[85%] max-h-[85%] object-contain"
          />
        </div>

        {/* RIGHT COLUMN: SCROLLABLE FORM */}
        <div className="overflow-y-auto px-6 lg:px-16 py-12 flex flex-col justify-start">
          <div className="w-full max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-8 tracking-tight">Register your institution</h1>

            {error && (
              <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: INSTITUTION DETAILS */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-navySoft mb-4 pb-1 border-b border-gray-100">
                  Institution details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Institution name</label>
                    <input
                      type="text"
                      name="institutionName"
                      value={form.institutionName}
                      onChange={handleChange}
                      placeholder="eg. IIT Bombay"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Subdomain</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="subdomain"
                        value={form.subdomain}
                        onChange={handleChange}
                        placeholder="eg. IIT Bombay"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-28 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                        required
                      />
                      <span className="absolute right-4 text-xs font-semibold text-navySoft bg-white/80 px-1 py-0.5 rounded">
                        .scholarstack.com
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Admission session</label>
                      <input
                        type="text"
                        name="admissionSession"
                        value={form.admissionSession}
                        onChange={handleChange}
                        placeholder="2023-2027"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="City, State, Country"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADMIN DETAILS */}
              <div className="pt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-navySoft mb-4 pb-1 border-b border-gray-100">
                  Admin details
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Full Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">&nbsp;</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                          required
                          minLength={6}
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
                    <div>
                      <label className="block text-xs font-semibold text-navySoft mb-1.5 uppercase">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-accent transition duration-200 bg-gray-50/50"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-navySoft hover:text-navy transition"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AGREEMENT CHECKBOX */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-sm text-navySoft select-none cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span>
                    I Agree with all of your{" "}
                    <Link to="/terms" className="font-semibold text-[#3B6FE0] hover:underline">
                      Terms &amp; Conditions
                    </Link>
                  </span>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-accent-dark disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && <span>→</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
