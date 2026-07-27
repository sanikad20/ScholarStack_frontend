// src/components/layout/SuperAdminSidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
  { label: "Institutions", icon: Building, path: "/superadmin/institutions" },
];

export default function SuperAdminSidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin-login";
  };

  return (
    <aside
      className={`relative bg-[#1E2128] text-white min-h-[calc(100vh-80px)] shrink-0 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="pt-8 flex-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-md mx-2 ${
                isActive
                  ? "bg-accent/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : "px-4"}`}
              title={collapsed ? item.label : ""}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-accent rounded-r" />
              )}
              <item.icon size={19} className={isActive ? "text-accent" : "text-white/40"} />
              {!collapsed && <span className="text-[15px] font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}