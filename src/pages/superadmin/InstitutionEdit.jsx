// src/pages/superadmin/InstitutionEdit.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, UserPlus } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { getInstitutionById, updateInstitution } from "../../api/institutions.api";
import { registerInstitutionAdmin } from "../../api/auth.api";

const FALLBACK_INSTITUTION = {
  _id: "1",
  name: "VJTI Mumbai",
  subdomain: "vjti",
  logo: "",
  contactEmail: "admin@vjti.edu.in",
  contactPhone: "9876543210",
  address: "Matunga, Mumbai",
  website: "https://vjti.ac.in",
  admissionSession: "2026-27",
};

export default function InstitutionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [addingAdmin, setAddingAdmin] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadFallbackData = () => {
    setInstitution(FALLBACK_INSTITUTION);
    setFormData({
      name: FALLBACK_INSTITUTION.name,
      subdomain: FALLBACK_INSTITUTION.subdomain,
      logo: FALLBACK_INSTITUTION.logo || "",
      contactEmail: FALLBACK_INSTITUTION.contactEmail || "",
      contactPhone: FALLBACK_INSTITUTION.contactPhone || "",
      address: FALLBACK_INSTITUTION.address || "",
      website: FALLBACK_INSTITUTION.website || "",
      admissionSession: FALLBACK_INSTITUTION.admissionSession || "",
    });
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  const fetchInstitution = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getInstitutionById(id);
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          const inst = data.data;
          setInstitution(inst);
          setFormData({
            name: inst.name || "",
            subdomain: inst.subdomain || "",
            logo: inst.logo || "",
            contactEmail: inst.contactEmail || "",
            contactPhone: inst.contactPhone || "",
            address: inst.address || "",
            website: inst.website || "",
            admissionSession: inst.admissionSession || "",
          });
        } else {
          showToast("Failed to load institution.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      const { data } = await updateInstitution(id, payload);
      if (data?.success) {
        setInstitution(data.data);
        showToast("Institution updated successfully!", "success");
      } else {
        showToast(data?.message || "Failed to update institution.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating institution.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      showToast("All fields are required.", "error");
      return;
    }
    setAddingAdmin(true);
    try {
      const { data } = await registerInstitutionAdmin({
        ...newAdmin,
        tenantId: id,
      });
      if (data?.success) {
        showToast("First admin created successfully! They will receive a verification email.", "success");
        setShowAdminModal(false);
        setNewAdmin({ name: "", email: "", password: "" });
      } else {
        showToast(data?.message || "Failed to create admin.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error creating admin.", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <SuperAdminTopbar />
        <div className="flex flex-1">
          <SuperAdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading...</span>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/superadmin/institutions")}
                className="text-sm font-bold text-accent hover:text-accent-dark transition flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="text-3xl font-bold text-navy">Edit Institution</h1>
            </div>
            <button
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-accent text-accent px-4 py-2 text-sm font-semibold hover:bg-accent/5 transition"
            >
              <UserPlus size={16} />
              Assign New Admin
            </button>
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent lowercase"
                    required
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Logo URL</label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-8 py-3 text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
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

      {/* ─── First Admin Modal ────────────────────────── */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setNewAdmin({ name: "", email: "", password: "" });
        }}
        title="Assign First Admin"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Assign the first admin to <strong>{institution?.name}</strong>. They will receive a verification email.
          </p>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Full Name</label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Email Address</label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Password</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setNewAdmin({ name: "", email: "", password: "" });
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAdmin}
              disabled={addingAdmin}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
            >
              {addingAdmin ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </div>
      </Modal>

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