// src/pages/admin/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Save, X, User, Building, Mail, Phone, MapPin, Globe, Calendar, LogOut, Users, Plus } from "lucide-react";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { getInstitutionById, updateInstitution } from "../../api/institutions.api";
import { changePassword, getAdmins, addInstitutionAdmin } from "../../api/auth.api";

// ─── Helpers ─────────────────────────────────────────────
const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_INSTITUTION = {
  _id: "67a1b2c3d4e5f6a7b8c9d001",
  name: "VJTI Mumbai",
  logo: "",
  contactEmail: "admin@vjti.edu.in",
  contactPhone: "9876543210",
  address: "Matunga, Mumbai",
  website: "https://vjti.ac.in",
  admissionSession: "2026-27",
};

const FALLBACK_ADMINS = [
  {
    _id: "u1",
    name: "Aashu Goswami",
    email: "admin@vjti.edu.in",
    isEmailVerified: true,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    _id: "u2",
    name: "Priya Sharma",
    email: "priya@vjti.edu.in",
    isEmailVerified: false,
    createdAt: "2026-02-20T14:30:00Z",
  },
];

// ─── Main Component ────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [institution, setInstitution] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    admissionSession: "",
  });

  // ─── Add Admin Modal ──────────────────────────────────
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [addingAdmin, setAddingAdmin] = useState(false);

  // ─── Password Change Modal ──────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Load fallback data ─────────────────────────────
  const loadFallbackData = () => {
    setInstitution(FALLBACK_INSTITUTION);
    setFormData({
      name: FALLBACK_INSTITUTION.name,
      logo: FALLBACK_INSTITUTION.logo || "",
      contactEmail: FALLBACK_INSTITUTION.contactEmail || "",
      contactPhone: FALLBACK_INSTITUTION.contactPhone || "",
      address: FALLBACK_INSTITUTION.address || "",
      website: FALLBACK_INSTITUTION.website || "",
      admissionSession: FALLBACK_INSTITUTION.admissionSession || "",
    });
    setAdmins(FALLBACK_ADMINS);
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  // ─── Fetch institution ──────────────────────────────
  const fetchInstitution = async () => {
    if (!user?.tenantId) {
      loadFallbackData();
      return;
    }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getInstitutionById(user.tenantId);
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          const inst = data.data;
          setInstitution(inst);
          setFormData({
            name: inst.name || "",
            logo: inst.logo || "",
            contactEmail: inst.contactEmail || "",
            contactPhone: inst.contactPhone || "",
            address: inst.address || "",
            website: inst.website || "",
            admissionSession: inst.admissionSession || "",
          });
        } else {
          showToast("Failed to load institution details. Using fallback.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to server. Using fallback.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch admins ──────────────────────────────────
  const fetchAdmins = async () => {
    if (!user?.tenantId) return;
    setLoadingAdmins(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getAdmins();
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          setAdmins(data.data);
        } else {
          showToast("Failed to fetch admins.", "error");
          setAdmins(FALLBACK_ADMINS);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback admins", err);
        setAdmins(FALLBACK_ADMINS);
      }
    } catch (err) {
      showToast("Error fetching admins.", "error");
      setAdmins(FALLBACK_ADMINS);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchInstitution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "admins") {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ─── Institution handlers ──────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (institution) {
      setFormData({
        name: institution.name || "",
        logo: institution.logo || "",
        contactEmail: institution.contactEmail || "",
        contactPhone: institution.contactPhone || "",
        address: institution.address || "",
        website: institution.website || "",
        admissionSession: institution.admissionSession || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user?.tenantId) return;
    setSaving(true);
    try {
      const payload = {
        logo: formData.logo,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        website: formData.website,
        admissionSession: formData.admissionSession,
      };
      const { data } = await updateInstitution(user.tenantId, payload);
      if (data?.success) {
        setInstitution(data.data);
        setFormData({
          name: data.data.name || "",
          logo: data.data.logo || "",
          contactEmail: data.data.contactEmail || "",
          contactPhone: data.data.contactPhone || "",
          address: data.data.address || "",
          website: data.data.website || "",
          admissionSession: data.data.admissionSession || "",
        });
        setIsEditing(false);
        showToast("Institution updated successfully!", "success");
        const updatedUser = { ...user, institutionName: data.data.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        showToast("Failed to update institution.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating institution.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Add Admin ──────────────────────────────────────
  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      showToast("All fields are required.", "error");
      return;
    }
    setAddingAdmin(true);
    try {
      const { data } = await addInstitutionAdmin(newAdmin);
      if (data?.success) {
        showToast("New admin added successfully! They will receive a verification email.", "success");
        setShowAddAdminModal(false);
        setNewAdmin({ name: "", email: "", password: "" });
        // Refresh admin list
        await fetchAdmins();
      } else {
        showToast(data?.message || "Failed to add admin.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error adding admin.", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  // ─── Password Change ──────────────────────────────
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (data?.success) {
        showToast("Password changed successfully!", "success");
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast("Failed to change password.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error changing password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Logout ──────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  // ─── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <AdminTopbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-navySoft">Loading profile...</span>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admin Profile</h1>
              <p className="mt-1 text-navySoft">
                Manage your personal and institution settings
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* ─── Tabs ───────────────────────────────────── */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab("admin")}
                className={`pb-3 px-1 text-sm font-semibold transition border-b-2 ${activeTab === "admin"
                  ? "border-accent text-navy"
                  : "border-transparent text-navySoft hover:text-navy hover:border-gray-300"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <User size={16} />
                  Admin
                </span>
              </button>
              <button
                onClick={() => setActiveTab("institution")}
                className={`pb-3 px-1 text-sm font-semibold transition border-b-2 ${activeTab === "institution"
                  ? "border-accent text-navy"
                  : "border-transparent text-navySoft hover:text-navy hover:border-gray-300"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Building size={16} />
                  Institution
                </span>
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`pb-3 px-1 text-sm font-semibold transition border-b-2 ${activeTab === "admins"
                  ? "border-accent text-navy"
                  : "border-transparent text-navySoft hover:text-navy hover:border-gray-300"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Admins
                </span>
              </button>
            </nav>
          </div>

          {/* ─── Tab Content ────────────────────────────── */}
          <div className="mt-6">
            {activeTab === "admin" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-navy mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <div className="text-navy font-medium">{user?.name || "—"}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <div className="text-navy font-medium">{user?.email || "—"}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <div className="text-navy font-medium capitalize">{user?.role || "—"}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-semibold text-sm"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "institution" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy">Institution Settings</h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Institution Name <span className="text-amber-500 font-normal">(read-only)</span>
                    </label>
                    <div className="text-navy font-medium">{institution?.name || "—"}</div>
                    <p className="text-xs text-navySoft mt-1">
                      Contact Super Admin to change the institution name.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Logo URL
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium break-all">{institution?.logo || "—"}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Contact Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium">{institution?.contactEmail || "—"}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium">{institution?.contactPhone || "—"}</div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium">{institution?.address || "—"}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium break-all">{institution?.website || "—"}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Admission Session
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="admissionSession"
                        value={formData.admissionSession}
                        onChange={handleChange}
                        placeholder="e.g., 2026-27"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                      />
                    ) : (
                      <div className="text-navy font-medium">{institution?.admissionSession || "—"}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admins" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy">Institution Admins</h2>
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition"
                  >
                    <Plus size={16} />
                    Add Admin
                  </button>
                </div>

                {loadingAdmins ? (
                  <div className="py-8 text-center text-navySoft font-semibold">Loading admins...</div>
                ) : admins.length === 0 ? (
                  <p className="text-sm text-navySoft italic py-4 text-center">No admins found for this institution.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Added On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {admins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium text-navy">{admin.name}</td>
                            <td className="px-4 py-3 text-navySoft">{admin.email}</td>
                            <td className="px-4 py-3">
                              {admin.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">
                                  Pending Verification
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-navySoft">
                              {admin.createdAt
                                ? new Date(admin.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── Add Admin Modal ──────────────────────────── */}
      <Modal
        isOpen={showAddAdminModal}
        onClose={() => {
          setShowAddAdminModal(false);
          setNewAdmin({ name: "", email: "", password: "" });
        }}
        title="Add New Admin"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Full Name</label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Email Address</label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@institution.edu"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Password</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Min 6 characters"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowAddAdminModal(false);
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
              {addingAdmin ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Password Change Modal ────────────────────── */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }}
        title="Change Password"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Toast ────────────────────────────────────── */}
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