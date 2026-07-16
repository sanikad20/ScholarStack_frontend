import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, ClipboardList, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", to: "/student/dashboard", match: "/student/dashboard", icon: Home },
  { label: "Browse Course", to: "/student/courses", match: "/student/courses", icon: BookOpen },
  { label: "My Application", to: "/student/applications", match: "/student/applications", icon: ClipboardList },
  { label: "Profile", to: "/student/profile", match: "/student/profile", icon: User },
];

export default function StudentSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-black/5 py-6">
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ label, to, match, icon: Icon }) => {
          const active = pathname.startsWith(match);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                active ? "text-accent bg-accent/5" : "text-navySoft hover:bg-black/[0.03]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-accent rounded-r" />
              )}
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}