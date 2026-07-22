import { useEffect, useState } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import api from "../../api/axios";

import AdminTopbar from "../../components/layout/AdminTopbar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Footer from "../../components/layout/Footer";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/notifications/my");
      if (data?.success && data?.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      if (data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      alert("Error marking notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data } = await api.put("/notifications/read-all");
      if (data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      alert("Error marking all notifications as read.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/notifications/${id}`);
      if (data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      alert("Error deleting notification.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">
      <AdminTopbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">University Alerts</h1>
              <p className="mt-1 text-navySoft">System notices, audit logs, and document verification triggers</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <Check size={16} />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-3.5 text-sm text-accent">
              {error}
            </div>
          )}

          {loading && notifications.length === 0 ? (
            <div className="py-24 text-center text-navySoft font-semibold">Loading notices...</div>
          ) : (
            <div className="mt-8 space-y-4 max-w-4xl">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start justify-between p-5 rounded-xl border transition ${
                    notif.isRead
                      ? "bg-white border-gray-100"
                      : "bg-[#FFF3EA]/40 border-accent/10 shadow-sm"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.isRead ? "bg-gray-100 text-gray-400" : "bg-accent/10 text-accent"
                    }`}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className={`text-sm leading-relaxed ${notif.isRead ? "text-navySoft" : "text-navy font-medium"}`}>
                        {notif.message}
                      </p>
                      <span className="block text-xs text-navySoft mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="p-1.5 text-navySoft hover:text-green-600 transition"
                        title="Mark Read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif._id)}
                      className="p-1.5 text-navySoft hover:text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-20 text-navySoft font-semibold border border-dashed rounded-xl">
                  No alerts or messages at this time.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
