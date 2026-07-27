// src/components/layout/SuperAdminTopbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, CheckCircle } from "lucide-react";
import graduationCap from "../../assets/GraduationCap.png";

// API imports (same notification endpoints work for any role)
import {
  getUnreadCount,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../../api/notifications.api";

// Dummy user – replace with AuthContext later
const DUMMY_USER = { name: "Super Admin", email: "superadmin@scholarstack.com", avatarInitial: "S" };

export default function SuperAdminTopbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // ─── Fetch notifications ─────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [countRes, notifRes] = await Promise.all([
        getUnreadCount(),
        getMyNotifications({ limit: 5 }),
      ]);
      setUnreadCount(countRes.data.count || 0);
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Mark single notification as read ───────────────
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // ─── Mark all as read ────────────────────────────────
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // ─── Close dropdowns on outside click ────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Logout ───────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="px-6 lg:px-10">
        <div className="h-20 flex items-center justify-between">
          {/* ─── LOGO ────────────────────────────────────── */}
          <Link to="/superadmin/dashboard" className="flex items-center gap-3 shrink-0">
            <img src={graduationCap} alt="ScholarStack Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-navy">ScholarStack</span>
              <span className="ml-2 text-s font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
          </Link>

          {/* ─── RIGHT SIDE: Notifications + Profile ────── */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-500 hover:text-accent transition"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-bold text-navy text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-accent hover:text-accent-dark transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-4 text-center text-sm text-navySoft">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-navySoft">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${!notif.isRead ? "bg-accent/5" : ""
                            }`}
                          onClick={() => {
                            if (!notif.isRead) handleMarkAsRead(notif._id);
                            if (notif.metadata?.applicationId) {
                              navigate(`/superadmin/notifications`);
                            }
                            setIsNotificationOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-navy truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-navySoft truncate">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <CheckCircle size={14} className="text-accent shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 px-4 py-2 text-center">
                    <Link
                      to="/superadmin/notifications"
                      className="text-xs font-semibold text-navySoft hover:text-navy transition"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-accent/50 transition"
              >
                {DUMMY_USER.avatarInitial}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-navy text-sm">{DUMMY_USER.name}</p>
                    <p className="text-xs text-navySoft truncate">{DUMMY_USER.email}</p>
                  </div>
                  <Link
                    to="/superadmin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}