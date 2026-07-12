import { Link } from "react-router-dom";
import { Search, Bell, Heart, ChevronDown } from "lucide-react";

export default function PublicNav() {
  return (
    <div className="border-b border-black/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-6 py-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-[17px] text-navy">ScholarStack</span>
          </Link>

          <button className="hidden md:flex items-center gap-1 text-sm text-navy/80 font-medium shrink-0">
            Browse
            <ChevronDown size={14} />
          </button>

          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-black/[0.03] border border-black/5 rounded-full px-4 py-2">
            <Search size={15} className="text-navySoft" />
            <input
              type="text"
              placeholder="Who do you want to hire..."
              className="bg-transparent outline-none text-sm text-navy placeholder:text-navySoft w-full"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="hidden sm:flex text-navySoft hover:text-navy transition-colors" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="hidden sm:flex text-navySoft hover:text-navy transition-colors" aria-label="Saved">
              <Heart size={18} />
            </button>
            <Link
              to="/register"
              className="hidden sm:inline-flex text-sm font-semibold text-navy px-4 py-2 rounded-full border border-black/10 hover:bg-black/[0.03] transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="inline-flex text-sm font-semibold text-white bg-accent hover:bg-accent-dark px-5 py-2 rounded-full transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
