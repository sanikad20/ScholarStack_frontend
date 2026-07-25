import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Heart, ChevronDown, Menu } from "lucide-react";
import graduationCap from "../../assets/GraduationCap.png";

export default function PublicNav() {
  const location = useLocation();
  const isForInstitutions = location.pathname === "/for-institutions";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* 1. TOP DARK MINI NAV BAR */}
      <div className="bg-[#1C1D26] text-white/70 text-xs py-3.5 px-6 lg:px-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/courses" className="hover:text-white transition">Courses</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
          <Link to="/for-institutions" className="hover:text-white transition">For Institution</Link>
        </div>
      </div>

      {/* 2. MAIN WHITE NAVIGATION HEADER */}
      <div className="bg-white border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={graduationCap} alt="ScholarStack Logo" className="h-9 w-auto object-contain" />
            <span className="text-xl font-bold text-navy font-sans tracking-tight">ScholarStack</span>
          </Link>

          {/* Browse Dropdown & Search Bar */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl ml-6">
            {/* Browse Button */}
            <button className="flex items-center gap-2 h-11 border border-gray-200 rounded-lg px-4 bg-white text-sm font-semibold text-navySoft hover:border-gray-300 shrink-0">
              Browse
              <ChevronDown size={16} />
            </button>

            {/* Search Input Box */}
            <div className="flex items-center flex-1 h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="What do you want to learn..."
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="ml-auto flex items-center gap-4 shrink-0">
            <button className="hidden md:flex text-gray-500 hover:text-accent transition" aria-label="Alerts">
              <Bell size={19} />
            </button>
            <button className="hidden md:flex text-gray-500 hover:text-accent transition" aria-label="Favorites">
              <Heart size={19} />
            </button>

            {isForInstitutions ? (
              <>
                <Link
                  to="/register-institution"
                  className="hidden sm:flex h-10 items-center justify-center rounded-full border-2 border-accent px-5 text-sm font-semibold text-accent hover:bg-accent/5 transition duration-200"
                >
                  Register Institution
                </Link>
                <Link
                  to="/admin-login"
                  className="flex h-10 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-dark transition duration-200"
                >
                  Admin Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="hidden sm:flex h-10 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-semibold hover:bg-gray-50 transition duration-200"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="flex h-10 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-dark transition duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
            <button className="lg:hidden" aria-label="Menu">
              <Menu size={22} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
