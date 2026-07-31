// src/pages/student/Profile.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";

import { changePassword } from "../../api/auth.api";

export default function Profile() {
  const { user } = useAuth();

  // ─── Split name into first and last ──────────────────
  const nameParts = user?.name ? user.name.split(" ") : ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // ─── State for password change ──────────────────────
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── State for phone (editable) ──────────────────────
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Save phone number (placeholder – no API yet) ───
  const handleSavePhone = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update phone number
      // await updateUserProfile({ phone });
      showToast("Phone number updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update phone number.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Handle password change ──────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setIsChanging(true);
    try {
      const { data } = await changePassword({
        currentPassword,
        newPassword,
      });
      if (data?.success) {
        showToast("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("Failed to change password.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error changing password.", "error");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10">
          <h2 className="text-3xl font-bold text-navy mb-8">My Profile</h2>

          {/* ─── Personal Details (Two‑Column Layout) ──── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name (read‑only) */}
              <div>
                <label className="block text-sm font-semibold text-navySoft mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-navy outline-none cursor-not-allowed"
                />
              </div>

              {/* Last Name (read‑only) */}
              <div>
                <label className="block text-sm font-semibold text-navySoft mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-navy outline-none cursor-not-allowed"
                />
              </div>

              {/* Email (read‑only) */}
              <div>
                <label className="block text-sm font-semibold text-navySoft mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-navy outline-none cursor-not-allowed"
                />
              </div>

              {/* Phone (editable) */}
              <div>
                <label className="block text-sm font-semibold text-navySoft mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleSavePhone}
                    disabled={isSaving}
                    className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Divider ────────────────────────────────── */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-navy mb-6">Change Password</h3>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-navySoft mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition"
                    >
                      {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password (side‑by‑side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navySoft mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition"
                      >
                        {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navySoft mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition"
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Password Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChanging}
                    className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition disabled:opacity-60"
                  >
                    {isChanging ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
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

      <Footer />
    </div>
  );
}