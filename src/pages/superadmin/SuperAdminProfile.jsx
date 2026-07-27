// src/pages/superadmin/SuperAdminProfile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import { changePassword } from "../../api/auth.api";

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export default function SuperAdminProfile() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [toast, setToast] = useState(null);

  // Password change modal
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Super Admin Profile</h1>
              <p className="mt-1 text-navySoft">
                Manage your personal account settings
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

          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-8xl">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
              <User size={20} className="text-accent" />
              Personal Information
            </h2>
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
        </main>
      </div>

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