import { Link } from "react-router-dom";
import { Search, Bell, Heart, ChevronDown } from "lucide-react";

// Dummy signed-in user for now — swap for real AuthContext once auth is wired.
const DUMMY_USER = { name: "Ananya", avatarInitial: "A" };

export default function StudentTopbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="px-6 lg:px-10">
        <div className="h-20 flex items-center">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-navy">ScholarStack</span>
          </Link>

          <button className="hidden lg:flex items-center gap-1 ml-8 text-sm font-medium text-navy hover:text-accent transition">
            Browse
            <ChevronDown size={15} />
          </button>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex items-center w-full h-11 rounded-full border border-gray-200 bg-gray-50 px-5 focus-within:ring-2 focus-within:ring-accent/20 transition">
              <Search size={17} className="text-gray-400" />
              <input
                type="text"
                placeholder="What do you want to learn..."
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-500 hover:text-accent transition" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <button className="text-gray-500 hover:text-accent transition" aria-label="Saved">
              <Heart size={19} />
            </button>
            <Link
              to="/student/profile"
              className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold"
            >
              {DUMMY_USER.avatarInitial}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}