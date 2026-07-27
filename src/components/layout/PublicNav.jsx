// src/components/layout/PublicNav.jsx
import { Link } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import graduationCap from "../../assets/GraduationCap.png";

export default function PublicNav({ view, setView }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="h-20 flex items-center justify-between">
          {/* Logo + Toggle (left side) */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src={graduationCap} alt="ScholarStack Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-navy">ScholarStack</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                  Admission Platform
                </span>
              </div>
            </Link>

            {/* Toggle: Student / Admin */}
            <div className="flex items-center rounded-full border border-gray-200 p-0.5 bg-gray-50">
              <button
                onClick={() => setView("student")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  view === "student"
                    ? "bg-accent text-white shadow-sm"
                    : "text-navySoft hover:text-navy"
                }`}
              >
                <User size={14} />
                Student
              </button>
              <button
                onClick={() => setView("admin")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  view === "admin"
                    ? "bg-accent text-white shadow-sm"
                    : "text-navySoft hover:text-navy"
                }`}
              >
                <Building2 size={14} />
                Admin
              </button>
            </div>
          </div>

          {/* Right side: always show Create Account + Sign In */}
          <div className="flex items-center gap-4">
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
          </div>

        </div>
      </div>
    </header>
  );
}
