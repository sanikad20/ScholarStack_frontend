// src/components/layout/StudentSidebar.jsx
import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Home",
    to: "/student/dashboard",
    match: "/student/dashboard",
    icon: Home,
  },
  {
    label: "Browse Courses",
    to: "/student/courses",
    match: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "My Applications",
    to: "/student/applications",
    match: "/student/applications",
    icon: ClipboardList,
  },
];

export default function StudentSidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => pathname.startsWith(path);

  return (
    <aside
      className={`relative bg-[#1E2128] text-white min-h-[calc(100vh-80px)] shrink-0 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* ─── Collapse Toggle ────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition shadow-md z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="pt-8 flex-1 overflow-y-auto relative">
        {NAV_ITEMS.map(({ label, to, match, icon: Icon }) => {
          const active = isActive(match);

          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-md mx-2 ${
                active
                  ? "bg-accent/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : "px-4"}`}
              title={collapsed ? label : ""}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-accent rounded-r" />
              )}
              <Icon size={19} className={active ? "text-accent" : "text-white/40"} />
              {!collapsed && <span className="text-[16px] font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}