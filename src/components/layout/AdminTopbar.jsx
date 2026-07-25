import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Heart, ChevronDown, Globe } from "lucide-react";
import api from "../../api/axios";
import graduationCap from "../../assets/GraduationCap.png";

export default function AdminTopbar() {
  const [user, setUser] = useState({ name: "Admin", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (data?.success && data?.data) {
            setUser({
              name: data.data.name || "Admin",
              email: data.data.email || "",
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const avatarInitial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="px-6 lg:px-10">
        <div className="h-20 flex items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={graduationCap} alt="ScholarStack" className="h-9 w-auto object-contain" />
            <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex items-center w-full h-11 rounded-full border border-gray-200 bg-gray-50 px-5 focus-within:ring-2 focus-within:ring-accent/20 transition">
              <Search size={17} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search applicant index..."
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right Action Icons & Dropdowns */}
          <div className="ml-auto flex items-center gap-5">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-accent transition">
              <Globe size={16} />
              USD
              <ChevronDown size={15} />
            </button>

            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-accent transition">
              English
              <ChevronDown size={15} />
            </button>

            <button className="text-gray-500 hover:text-accent transition" aria-label="Notifications">
              <Bell size={19} />
            </button>

            <button className="text-gray-500 hover:text-accent transition" aria-label="Favorites">
              <Heart size={19} />
            </button>

            <div className="h-9 px-4 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-sm font-semibold text-navy">
              {user.name}
            </div>

            <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {avatarInitial}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
