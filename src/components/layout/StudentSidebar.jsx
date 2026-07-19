import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, ClipboardList, User } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Home",
    to: "/student/dashboard",
    match: "/student/dashboard",
    icon: Home,
  },
  {
    label: "Browse Course",
    to: "/student/courses",
    match: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "My Application",
    to: "/student/applications",
    match: "/student/applications",
    icon: ClipboardList,
  },
  {
    label: "Profile",
    to: "/student/profile",
    match: "/student/profile",
    icon: User,
  },
];

export default function StudentSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-56 bg-[#1E2128] text-white min-h-[calc(100vh-80px)] shrink-0">
      <nav className="pt-6">
        {NAV_ITEMS.map(({ label, to, match, icon: Icon }) => {
          const active = pathname.startsWith(match);

          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-4 px-7 py-5 transition-all duration-200 ${
                active
                  ? "text-white"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[#ff6b3d]" />
              )}

              <Icon size={19} />

              <span className="text-[16px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}