// src/pages/superadmin/SuperAdminNotifications.jsx
import { useEffect, useState } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";

import SuperAdminTopbar from "../../components/layout/SuperAdminTopbar";
import SuperAdminSidebar from "../../components/layout/SuperAdminSidebar";
import Footer from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";

import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotifications,
} from "../../api/notifications.api";

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_NOTIFICATIONS = [
  {
    _id: "n1",
    title: "New Institution Registered",
    message: "VJTI Mumbai has been registered on the platform.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    _id: "n2",
    title: "Institution Updated",
    message: "IIT Bombay updated their contact details.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    _id: "n3",
    title: "System Alert",
    message: "Scheduled maintenance on Sunday at 2:00 AM.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// ─── Main Component ────────────────────────────────────
export default function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // ─── Delete confirmation modal ──────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadFallbackData = () => {
    setNotifications(FALLBACK_NOTIFICATIONS);
    setLoading(false);
    showToast("Using fallback data (server offline)", "info");
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data } = await getMyNotifications();
        clearTimeout(timeoutId);
        if (data?.success && data?.data) {
          setNotifications(data.data);
        } else {
          showToast("Failed to fetch notifications.", "error");
          loadFallbackData();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Server unreachable – using fallback", err);
        loadFallbackData();
      }
    } catch (err) {
      showToast("Error connecting to notifications API.", "error");
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const { data } = await markAsRead(id);
      if (data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        showToast("Notification marked as read.", "success");
      }
    } catch (err) {
      showToast("Error marking notification as read.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data } = await markAllAsRead();
      if (data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast(`Marked ${data.count || 0} notifications as read.`, "success");
      }
    } catch (err) {
      showToast("Error marking all notifications as read.", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const { data } = await deleteNotification(deleteTargetId);
      if (data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== deleteTargetId));
        showToast("Notification deleted.", "success");
      }
    } catch (err) {
      showToast("Error deleting notification.", "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setIsDeleting(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <SuperAdminTopbar />

      <div className="flex flex-1">
        <SuperAdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Notifications</h1>
              <p className="mt-1 text-navySoft">
                System alerts and updates for the super admin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition active:scale-95"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition active:scale-95"
                >
                  <Check size={16} />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {loading && notifications.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading notifications...</div>
          ) : (
            <div className="mt-8 space-y-4 max-w-4xl">
              {notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif._id}
                    className={`flex items-start justify-between p-5 rounded-xl border transition ${
                      isUnread
                        ? "bg-[#FFF3EA]/40 border-accent/10 shadow-sm"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isUnread
                            ? "bg-accent/10 text-accent"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Bell size={18} />
                      </div>
                      <div>
                        <p
                          className={`text-sm leading-relaxed ${
                            isUnread ? "text-navy font-medium" : "text-navySoft"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <span className="block text-xs text-navySoft mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(notif._id)}
                          className="p-1.5 text-navySoft hover:text-green-600 transition active:scale-95"
                          title="Mark Read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(notif._id)}
                        className="p-1.5 text-navySoft hover:text-red-500 transition active:scale-95"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {notifications.length === 0 && (
                <div className="text-center py-20 text-navySoft font-semibold border border-dashed rounded-xl">
                  No notifications at this time.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── Delete Confirmation Modal ────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
        title="Delete Notification"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navySoft">
            Are you sure you want to delete this notification?
            <br />
            <span className="font-semibold text-red-600">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTargetId(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 active:scale-95"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
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