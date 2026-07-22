import { Link, useLocation } from "react-router-dom";
import { Building2, LogOut } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Institutions",
    to: "/superadmin/institutions",
    match: "/superadmin/institutions",
    icon: Building2,
  },
];

export default function SuperAdminSidebar() {
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

  return (
    <aside className="w-60 bg-[#1E2128] text-white min-h-[calc(100vh-80px)] shrink-0 flex flex-col justify-between">
      <nav className="pt-6">
        {NAV_ITEMS.map(({ label, to, match, icon: Icon }) => {
          const active = pathname.startsWith(match);

          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-4 px-7 py-5 transition-all duration-200 ${
                active
                  ? "text-white bg-white/5"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-accent" />
              )}

              <Icon size={19} className={active ? "text-accent" : "text-white/60"} />

              <span className="text-[15px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full relative flex items-center gap-4 px-7 py-5 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <LogOut size={19} className="text-white/60" />
          <span className="text-[15px] font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
