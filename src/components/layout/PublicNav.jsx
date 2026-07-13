import { Link } from "react-router-dom";
import { Search, Bell, Heart, ChevronDown, Menu } from "lucide-react";
import graduationCap from "../../assets/GraduationCap.png";

export default function PublicNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="h-20 flex items-center">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={graduationCap} alt="ScholarStack Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-navy">ScholarStack</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                Admission Platform
              </span>
            </div>
          </Link>

          <button className="hidden lg:flex items-center gap-1 ml-8 text-sm font-medium text-navy hover:text-accent transition">
            Browse
            <ChevronDown size={15} />
          </button>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex items-center w-full h-11 rounded-full border border-gray-200 bg-gray-50 px-5 transition focus-within:ring-2 focus-within:ring-accent/20">
              <Search size={17} className="text-gray-400" />
              <input
                type="text"
                placeholder="Who do you want to hire..."
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="hidden md:flex text-gray-500 hover:text-accent transition">
              <Bell size={19} />
            </button>
            <button className="hidden md:flex text-gray-500 hover:text-accent transition">
              <Heart size={19} />
            </button>
            <Link
              to="/register"
              className="hidden sm:flex h-10 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="flex h-10 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-dark transition"
            >
              Sign In
            </Link>
            <button className="lg:hidden">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}