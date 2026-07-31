import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  X,
  Users,
  MapPin,
  CalendarDays,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";
import api from "../../api/axios";

/**
 * Student Browse Courses Page
 * Designed & Developed by Sanika
 * 
 * Features:
 * - Dynamic course discovery interface with search and institution filtering.
 * - Displays academic cover imagery, admission capacity, session dates, required documents, and application status.
 */

/* --------------------------------- Utils -------------------------------- */
function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

// Deterministic color from a name, since the schema has no institution
// color field — purely a display derivation, not fabricated data.
const AVATAR_PALETTE = ["#0F172A", "#8C1515", "#B91C1C", "#065F46", "#1D4ED8", "#7C3AED", "#B45309", "#0E7490"];
function colorForName(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initialsForName(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

function institutionOf(course) {
  const t = course.tenantId;
  if (t && typeof t === "object") {
    return { id: t._id, name: t.name || "Institution" };
  }
  return { id: t || null, name: "Institution" };
}

function formatDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isRecentlyAdded(dateInput, days = 14) {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() <= days * 24 * 60 * 60 * 1000;
}

/* ------------------------------ Local styles ---------------------------- */
function PageStyles() {
  return (
    <style>{`
      @keyframes ss-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes ss-card-in {
        from { opacity: 0; transform: translateY(14px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes ss-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .ss-fade-in { animation: ss-fade-in 0.5s ease-out both; }
      .ss-card-in { animation: ss-card-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .ss-shimmer {
        background: linear-gradient(90deg, #eef1f5 0px, #f8fafc 40px, #eef1f5 80px);
        background-size: 800px 100%;
        animation: ss-shimmer 1.6s infinite linear;
      }
      .ss-line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
}

/* ------------------------------- Skeletons ------------------------------ */
function HeroSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-[#E5E7EB] p-10 md:p-14">
      <div className="ss-shimmer h-4 w-40 rounded-full mb-6" />
      <div className="ss-shimmer h-10 w-3/4 rounded-xl mb-3" />
      <div className="ss-shimmer h-10 w-1/2 rounded-xl mb-6" />
      <div className="ss-shimmer h-5 w-2/3 rounded-lg mb-8" />
      <div className="ss-shimmer h-14 w-full max-w-xl rounded-full" />
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="ss-shimmer h-10 w-28 rounded-full" />
      ))}
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
      <div className="ss-shimmer aspect-video w-full" />
      <div className="p-5 space-y-3">
        <div className="ss-shimmer h-3 w-24 rounded-full" />
        <div className="ss-shimmer h-4 w-full rounded-md" />
        <div className="ss-shimmer h-4 w-2/3 rounded-md" />
        <div className="ss-shimmer h-3 w-full rounded-md" />
        <div className="flex gap-2 pt-2">
          <div className="ss-shimmer h-9 w-24 rounded-full" />
          <div className="ss-shimmer h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Bits --------------------------------- */
function InstitutionAvatar({ name, size = 28 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, background: colorForName(name) }}
      title={name}
    >
      {initialsForName(name)}
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[#F1F5F9] text-[#334155]",
    orange: "bg-[#FFF1EB] text-[#F55A2A]",
    green: "bg-[#ECFDF5] text-[#047857]",
    red: "bg-[#FEF2F2] text-[#DC2626]",
  };
  return (
    <span
      className={classNames(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

const COURSE_IMAGES = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
];

export function getCourseImage(course) {
  if (course?.imageUrl) return course.imageUrl;
  const str = (course?.id || course?._id || course?.name || "course").toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COURSE_IMAGES[Math.abs(hash) % COURSE_IMAGES.length];
}

/* ------------------------------- Course card ----------------------------- */
function CourseCard({ course, index = 0 }) {
  const institution = institutionOf(course);
  const requiredDocs = course.requiredDocuments || [];
  const recentlyAdded = isRecentlyAdded(course.createdAt);
  const courseId = course.id || course._id;
  const imageUrl = getCourseImage(course);

  return (
    <div
      className="ss-card-in group relative flex flex-col bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden
                 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.18)]"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      {/* Banner */}
      <Link to={`/student/courses/${courseId}`} className="block relative overflow-hidden aspect-video bg-[#F8FAFC]">
        <img
          src={imageUrl}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Top-right status badges — derived from real fields only */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
          {course.isActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#047857] text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Applications Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#64748B] text-white shadow-sm">
              Closed
            </span>
          )}
          {recentlyAdded && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF6B3D] text-white shadow-sm">
              <Sparkles size={11} /> New
            </span>
          )}
        </div>

        {/* Institution chip overlapping banner bottom */}
        <div className="absolute -bottom-4 left-4 flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-md border border-[#E5E7EB] z-10">
          <InstitutionAvatar name={institution.name} />
          <span className="text-[11px] font-semibold text-[#0F172A] max-w-[150px] truncate">{institution.name}</span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5 pt-7">
        <Link to={`/student/courses/${courseId}`}>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug ss-line-clamp-2 group-hover:text-[#FF6B3D] transition-colors duration-200">
            {course.name}
          </h3>
        </Link>
        {course.description && (
          <p className="mt-1.5 text-[13px] text-[#64748B] ss-line-clamp-2 leading-relaxed">{course.description}</p>
        )}

        {/* Meta row — only real fields */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[#64748B]">
          {course.session && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} /> {course.session}
            </span>
          )}
          {typeof course.admissionCapacity === "number" && (
            <span className="inline-flex items-center gap-1">
              <Users size={13} /> {course.admissionCapacity} seats capacity
            </span>
          )}
        </div>

        {requiredDocs.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <FileText size={13} /> {requiredDocs.length} document{requiredDocs.length !== 1 ? "s" : ""} required
          </div>
        )}

        {course.createdAt && (
          <div className="mt-1 text-[11.5px] text-[#94A3B8]">Added {formatDate(course.createdAt)}</div>
        )}

        {/* CTAs */}
        <div className="mt-5 flex items-center gap-2.5">
          {course.isActive ? (
            <Link
              to={`/student/apply/${courseId}`}
              className="flex-1 text-center relative overflow-hidden rounded-full text-[13px] font-semibold py-2.5 transition-all duration-[250ms] ease-out bg-[#FF6B3D] text-white hover:bg-[#F55A2A] hover:shadow-[0_8px_20px_-6px_rgba(255,107,61,0.55)] active:scale-[0.97]"
            >
              Apply Now
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 relative overflow-hidden rounded-full text-[13px] font-semibold py-2.5 bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
            >
              Applications Closed
            </button>
          )}
          <Link
            to={`/student/courses/${courseId}`}
            className="flex-1 text-center rounded-full border border-[#E5E7EB] text-[#0F172A] text-[13px] font-semibold py-2.5
                       transition-all duration-[250ms] ease-out hover:border-[#0F172A] hover:bg-[#F8FAFC]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Filter bar ------------------------------ */
function PillSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2.5 rounded-full border border-[#E5E7EB] bg-white text-[13px] font-medium text-[#0F172A]
                   hover:border-[#FF6B3D] focus:outline-none focus:ring-2 focus:ring-[#FF6B3D]/25 focus:border-[#FF6B3D]
                   transition-all duration-200 cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
      />
    </div>
  );
}

const SORTS = ["Newest", "Oldest", "Name (A–Z)"];

function FilterBar({ filters, setFilters, resultCount, onClear, institutionOptions, sessionOptions }) {
  const update = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));
  const hasActiveFilters = filters.search || filters.institution || filters.session || filters.sort;

  return (
    <div className="sticky top-0 z-30 -mx-8 px-8 py-4 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search pill */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={filters.search}
              onChange={(e) => update("search")(e.target.value)}
              placeholder="Search courses, institutions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E5E7EB] bg-white text-[13px]
                         focus:outline-none focus:ring-2 focus:ring-[#FF6B3D]/25 focus:border-[#FF6B3D] transition-all duration-200"
            />
          </div>

          <PillSelect label="Institution" value={filters.institution} onChange={update("institution")} options={institutionOptions} />
          <PillSelect label="Session" value={filters.session} onChange={update("session")} options={sessionOptions} />
          <PillSelect label="Sort By" value={filters.sort} onChange={update("sort")} options={SORTS} />

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold text-[#DC2626]
                         hover:bg-[#FEF2F2] transition-all duration-200"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
        <p className="text-[12.5px] text-[#64748B]">
          <span className="font-semibold text-[#0F172A]">{resultCount}</span> courses match your search
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- Hero ---------------------------------- */
function Hero({ search, setSearch, institutionCount }) {
  return (
    <section
      className="ss-fade-in relative overflow-hidden rounded-3xl border border-[#E5E7EB] p-10 md:p-14"
      style={{
        background: "radial-gradient(120% 120% at 100% 0%, #FFF1EB 0%, #F8FAFC 45%, #FFFFFF 100%)",
      }}
    >
      <div className="relative z-10 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[12px] font-semibold text-[#FF6B3D] shadow-sm">
            <Sparkles size={13} /> {institutionCount > 0 ? `${institutionCount}+ verified institutions` : "Verified institutions"}
          </span>
          <h1 className="mt-5 text-4xl md:text-[44px] font-extrabold text-[#0F172A] leading-[1.1] tracking-tight">
            Discover Your Next Course
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#64748B] max-w-lg leading-relaxed">
            Explore courses from leading institutions and apply directly.
          </p>

          <div className="mt-8 relative max-w-xl">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course or institution name"
              className="w-full pl-12 pr-32 py-4 rounded-full border border-[#E5E7EB] bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]
                         text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B3D]/25 focus:border-[#FF6B3D] transition-all duration-200"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold
                                hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]">
              Search
            </button>
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden md:flex justify-center">
          <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="220" height="150" rx="16" fill="#FFFFFF" stroke="#E5E7EB" />
            <rect x="50" y="52" width="120" height="10" rx="5" fill="#FF6B3D" />
            <rect x="50" y="72" width="160" height="8" rx="4" fill="#E5E7EB" />
            <rect x="50" y="88" width="140" height="8" rx="4" fill="#E5E7EB" />
            <circle cx="200" cy="140" r="24" fill="#FFF1EB" />
            <path d="M192 140l6 6 12-12" stroke="#FF6B3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="60" y="150" width="90" height="14" rx="7" fill="#F8FAFC" stroke="#E5E7EB" />
            <rect x="70" y="10" width="150" height="110" rx="16" fill="#0F172A" opacity="0.04" />
            <circle cx="270" cy="60" r="30" fill="#FFF1EB" />
            <circle cx="270" cy="60" r="30" fill="none" stroke="#FF6B3D" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M260 60l7 7 13-15" stroke="#FF6B3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Empty state ------------------------------ */
function EmptyState({ onReset }) {
  return (
    <div className="ss-fade-in flex flex-col items-center text-center py-20">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="140" height="90" rx="14" fill="#F8FAFC" stroke="#E5E7EB" />
        <circle cx="90" cy="60" r="22" fill="#FFF1EB" />
        <path d="M80 60h20M90 50v20" stroke="#FF6B3D" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M78 68l24-16" stroke="#FF6B3D" strokeWidth="3" strokeLinecap="round" />
        <rect x="40" y="95" width="100" height="8" rx="4" fill="#E5E7EB" />
      </svg>
      <h3 className="mt-6 text-lg font-bold text-[#0F172A]">No courses match your filters.</h3>
      <p className="mt-1.5 text-sm text-[#64748B] max-w-sm">
        Try widening your search or clearing a few filters to see more results.
      </p>
      <button
        onClick={onReset}
        className="mt-6 px-6 py-2.5 rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold
                   hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]"
      >
        Reset Filters
      </button>
    </div>
  );
}

/* --------------------------------- Error state ------------------------------ */
function ErrorState({ message, onRetry }) {
  return (
    <div className="ss-fade-in flex flex-col items-center text-center py-20">
      <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
        <AlertTriangle size={22} className="text-[#DC2626]" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#0F172A]">Couldn't load courses</h3>
      <p className="mt-1.5 text-sm text-[#64748B] max-w-sm">
        {message || "Something went wrong while fetching courses. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]"
      >
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */
const emptyFilters = {
  search: "",
  institution: "",
  session: "",
  sort: "",
};

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ASSUMPTION: adjust this path if your actual course-listing route
      // differs (no routes file was provided for this task).
      const res = await api.get("/courses");
      const payload = res?.data?.data ?? res?.data;

      if (!Array.isArray(payload)) {
        throw new Error("Malformed courses response");
      }

      // Normalize Mongo's _id -> id for React keys/links, keep every other
      // field exactly as returned (no fabricated fields added).
      const normalized = payload.map((c) => ({ ...c, id: c.id || c._id }));
      setCourses(normalized);
    } catch (err) {
      console.error("Courses fetch failed:", err);
      setError(
        err?.response?.data?.message ||
          "We couldn't load courses right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter option lists built from real data actually returned by the API.
  const institutionOptions = useMemo(() => {
    const names = new Set(courses.map((c) => institutionOf(c).name).filter(Boolean));
    return Array.from(names).sort();
  }, [courses]);

  const sessionOptions = useMemo(() => {
    const sessions = new Set(courses.map((c) => c.session).filter(Boolean));
    return Array.from(sessions).sort();
  }, [courses]);

  const institutionCount = institutionOptions.length;

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      const q = filters.search.trim().toLowerCase();
      const institutionName = institutionOf(c).name;
      if (q && !`${c.name} ${c.description || ""} ${institutionName}`.toLowerCase().includes(q)) return false;
      if (filters.institution && institutionName !== filters.institution) return false;
      if (filters.session && c.session !== filters.session) return false;
      return true;
    });

    if (filters.sort === "Newest") {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (filters.sort === "Oldest") {
      list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (filters.sort === "Name (A–Z)") {
      list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return list;
  }, [courses, filters]);

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      <PageStyles />
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10 bg-[#FFFFFF]">
          {/* Hero */}
          {loading ? (
            <HeroSkeleton />
          ) : (
            <Hero
              search={filters.search}
              setSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
              institutionCount={institutionCount}
            />
          )}

          {error ? (
            <div className="mt-10">
              <ErrorState message={error} onRetry={fetchCourses} />
            </div>
          ) : (
            <>
              {/* Sticky filter bar */}
              <div className="mt-8">
                {loading ? (
                  <FilterBarSkeleton />
                ) : (
                  <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    resultCount={filtered.length}
                    onClear={clearFilters}
                    institutionOptions={institutionOptions}
                    sessionOptions={sessionOptions}
                  />
                )}
              </div>

              {loading ? (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState onReset={clearFilters} />
              ) : (
                <section className="mt-14">
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]">All Courses</h2>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map((course, i) => (
                      <CourseCard key={course.id} course={course} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}