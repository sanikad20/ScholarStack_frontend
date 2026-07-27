// src/pages/superadmin/InstitutionCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { createInstitution } from "../../api/institutions.api";

export default function InstitutionCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    admissionSession: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subdomain) {
      showToast("Name and subdomain are required.", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await createInstitution(formData);
      if (data?.success) {
        showToast("Institution created successfully!", "success");
        navigate(`/superadmin/institutions/${data.data._id}`);
      } else {
        showToast(data?.message || "Failed to create institution.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error creating institution.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/superadmin/institutions")}
              className="text-sm font-bold text-accent hover:text-accent-dark transition flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-navy">Create Institution</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 max-w-8xl">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Institution Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Subdomain */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Subdomain *</label>
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    placeholder="e.g., vjti"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent lowercase"
                    required
                  />
                  <p className="text-xs text-navySoft mt-1">Only lowercase letters, numbers, and hyphens allowed.</p>
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Logo URL</label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>

                {/* Admission Session */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Admission Session</label>
                  <input
                    type="text"
                    name="admissionSession"
                    value={formData.admissionSession}
                    onChange={handleChange}
                    placeholder="e.g., 2026-27"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-8 py-3 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? "Creating..." : "Create Institution"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/superadmin/institutions")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-8 py-3 text-sm font-bold hover:bg-gray-50 transition"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}

      <Footer />
    </div>
  );
}