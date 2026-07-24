import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Users,
  Clock,
  MapPin,
  CalendarDays,
  Flame,
  Sparkles,
  TrendingUp,
  Clock3,
  ThumbsUp,
} from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

/* =========================================================================
   ScholarStack — Browse Courses
   Premium, Coursera/Udemy/LinkedIn-Learning-inspired redesign.
   Content area only — top navbar & sidebar are untouched.
   ========================================================================= */

/* ---------------------------- Design tokens --------------------------- */
const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  primary: "#FF6B3D",
  primaryHover: "#F55A2A",
  text: "#0F172A",
  textSoft: "#64748B",
  border: "#E5E7EB",
};

/* ------------------------------ Dummy data ----------------------------- */
const INSTITUTIONS = [
  { name: "MIT OpenLearn", initials: "MIT", color: "#0F172A" },
  { name: "Stanford Online", initials: "STN", color: "#8C1515" },
  { name: "IIT Delhi", initials: "IITD", color: "#B91C1C" },
  { name: "Wharton Executive", initials: "WHR", color: "#065F46" },
  { name: "Imperial College", initials: "ICL", color: "#1D4ED8" },
  { name: "National Design Inst.", initials: "NDI", color: "#7C3AED" },
];

const CATEGORIES = [
  "Development",
  "Data Science",
  "Business",
  "Design",
  "Marketing",
  "Cloud & DevOps",
];

const DURATIONS = ["4 weeks", "6 weeks", "8 weeks", "12 weeks", "6 months"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const MODES = ["Online", "Offline", "Hybrid"];
const SORTS = ["Most Relevant", "Newest", "Highest Rated", "Closing Soon", "Most Applied"];

function seedCourse(id, overrides = {}) {
  const inst = INSTITUTIONS[id % INSTITUTIONS.length];
  const cat = CATEGORIES[id % CATEGORIES.length];
  const seatsTotal = 60 + ((id * 7) % 120);
  const applied = Math.floor(seatsTotal * (0.4 + ((id * 13) % 50) / 100));
  const seatsLeft = Math.max(seatsTotal - applied, 3);
  const closingSoon = id % 4 === 0;
  const rating = (4.2 + ((id * 3) % 8) / 10).toFixed(1);

  return {
    id,
    title: [
      "Full-Stack Web Development Bootcamp",
      "Applied Machine Learning & Deep Learning",
      "Product Management Fundamentals",
      "UI/UX Design: From Wireframe to Prototype",
      "Cloud Architecture on AWS & Azure",
      "Digital Marketing & Growth Strategy",
      "Data Structures & Algorithms Mastery",
      "Business Analytics with Python & SQL",
    ][id % 8],
    description:
      "A rigorous, project-based curriculum designed with industry mentors. Build a portfolio-ready capstone and graduate with a verified certificate.",
    category: cat,
    institution: inst,
    duration: DURATIONS[id % DURATIONS.length],
    level: LEVELS[id % LEVELS.length],
    mode: MODES[id % MODES.length],
    startDate: new Date(2026, 7 + (id % 4), 4 + (id % 20)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lastApplyDate: new Date(2026, 6 + (id % 4), 10 + (id % 15)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    seatsTotal,
    seatsLeft,
    applied,
    rating,
    reviews: 200 + ((id * 37) % 4800),
    applicationsOpen: id % 9 !== 0,
    closingSoon,
    imageSeed: `scholarstack-${id}`,
    featured: id % 5 === 0,
    popular: id % 3 === 0,
    isNew: id % 6 === 0,
    recommended: id % 4 === 1,
    recent: id % 2 === 0,
    ...overrides,
  };
}

const ALL_COURSES = Array.from({ length: 20 }, (_, i) => seedCourse(i + 1));

/* --------------------------------- Utils -------------------------------- */
function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

/* ------------------------------ Local styles ---------------------------- */
/* Keyframes + scrollbar hiding, scoped locally since no global stylesheet
   access is assumed here. Safe to hoist into index.css if preferred. */
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
      .ss-scroll-row {
        scroll-behavior: smooth;
        scrollbar-width: none;
      }
      .ss-scroll-row::-webkit-scrollbar { display: none; }
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
      {Array.from({ length: 7 }).map((_, i) => (
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
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex text-[#FF6B3D]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < full || (i === full && hasHalf) ? "#FF6B3D" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-[#0F172A]">{rating}</span>
    </span>
  );
}

function InstitutionAvatar({ institution, size = 28 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, background: institution.color }}
      title={institution.name}
    >
      {institution.initials.slice(0, 3)}
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

/* ------------------------------- Course card ----------------------------- */
function CourseCard({ course, index = 0 }) {
  const seatsPct = Math.round((course.seatsLeft / course.seatsTotal) * 100);

  return (
    <div
      className="ss-card-in group relative flex flex-col bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden
                 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.18)]"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      {/* Banner */}
      <Link to={`/student/courses/${course.id}`} className="block relative overflow-hidden aspect-video">
        <img
          src={`https://picsum.photos/seed/${course.imageSeed}/560/315`}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#0F172A] shadow-sm backdrop-blur">
            {course.category}
          </span>
        </div>

        {/* Top-right status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {course.applicationsOpen && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#047857] text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Applications Open
            </span>
          )}
          {course.closingSoon && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF6B3D] text-white shadow-sm">
              <Clock3 size={11} /> Closing Soon
            </span>
          )}
        </div>

        {/* Institution chip overlapping banner bottom */}
        <div className="absolute -bottom-4 left-4 flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-md border border-[#E5E7EB]">
          <InstitutionAvatar institution={course.institution} />
          <span className="text-[11px] font-semibold text-[#0F172A] max-w-[110px] truncate">
            {course.institution.name}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5 pt-7">
        <Link to={`/student/courses/${course.id}`}>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug ss-line-clamp-2 group-hover:text-[#FF6B3D] transition-colors duration-200">
            {course.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[13px] text-[#64748B] ss-line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {course.mode}
          </span>
          <Badge tone="neutral">{course.level}</Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} /> Starts {course.startDate}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-[#DC2626] font-medium">
          Apply before {course.lastApplyDate}
        </div>

        {/* Rating + reviews */}
        <div className="mt-3 flex items-center justify-between">
          <StarRating rating={course.rating} />
          <span className="text-[12px] text-[#64748B]">{course.reviews.toLocaleString()} reviews</span>
        </div>

        {/* Seats / applied */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="inline-flex items-center gap-1 text-[#64748B]">
              <Users size={13} /> {course.applied.toLocaleString()} applied
            </span>
            <span className="font-semibold text-[#0F172A]">{course.seatsLeft} seats left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className={classNames(
                "h-full rounded-full transition-all duration-500",
                seatsPct <= 20 ? "bg-[#DC2626]" : "bg-[#FF6B3D]"
              )}
              style={{ width: `${100 - seatsPct}%` }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-5 flex items-center gap-2.5">
          <button
            className="flex-1 relative overflow-hidden rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold py-2.5
                       transition-all duration-[250ms] ease-out hover:bg-[#F55A2A] hover:shadow-[0_8px_20px_-6px_rgba(255,107,61,0.55)]
                       active:scale-[0.97]"
          >
            Apply Now
          </button>
          <Link
            to={`/student/courses/${course.id}`}
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

/* ------------------------------- Carousel row ---------------------------- */
function CarouselRow({ title, subtitle, icon: Icon, courses }) {
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  };

  if (!courses.length) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#FFF1EB] text-[#FF6B3D]">
                <Icon size={16} />
              </span>
            )}
            <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#0F172A] transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#0F172A] transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="ss-scroll-row flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
        {courses.map((course, i) => (
          <div key={course.id} className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px]">
            <CourseCard course={course} index={i} />
          </div>
        ))}
      </div>
    </section>
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

function FilterBar({ filters, setFilters, resultCount, onClear }) {
  const update = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));
  const hasActiveFilters =
    filters.search || filters.category || filters.institution || filters.duration ||
    filters.level || filters.mode || filters.sort;

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
              placeholder="Search courses, institutions, skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E5E7EB] bg-white text-[13px]
                         focus:outline-none focus:ring-2 focus:ring-[#FF6B3D]/25 focus:border-[#FF6B3D] transition-all duration-200"
            />
          </div>

          <PillSelect label="Category" value={filters.category} onChange={update("category")} options={CATEGORIES} />
          <PillSelect
            label="Institution"
            value={filters.institution}
            onChange={update("institution")}
            options={INSTITUTIONS.map((i) => i.name)}
          />
          <PillSelect label="Duration" value={filters.duration} onChange={update("duration")} options={DURATIONS} />
          <PillSelect label="Level" value={filters.level} onChange={update("level")} options={LEVELS} />
          <PillSelect label="Mode" value={filters.mode} onChange={update("mode")} options={MODES} />
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
function Hero({ search, setSearch }) {
  return (
    <section
      className="ss-fade-in relative overflow-hidden rounded-3xl border border-[#E5E7EB] p-10 md:p-14"
      style={{
        background:
          "radial-gradient(120% 120% at 100% 0%, #FFF1EB 0%, #F8FAFC 45%, #FFFFFF 100%)",
      }}
    >
      <div className="relative z-10 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[12px] font-semibold text-[#FF6B3D] shadow-sm">
            <Sparkles size={13} /> 500+ verified institutions
          </span>
          <h1 className="mt-5 text-4xl md:text-[44px] font-extrabold text-[#0F172A] leading-[1.1] tracking-tight">
            Discover Your Next Course
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#64748B] max-w-lg leading-relaxed">
            Explore industry-ready courses from leading institutions and apply directly.
          </p>

          <div className="mt-8 relative max-w-xl">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try 'Machine Learning' or 'MIT'"
              className="w-full pl-12 pr-32 py-4 rounded-full border border-[#E5E7EB] bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]
                         text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B3D]/25 focus:border-[#FF6B3D] transition-all duration-200"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold
                                hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]">
              Search
            </button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-[13px] text-[#64748B]">
            <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[#FF6B3D]" /> 2.1M students applied</span>
            <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-[#FF6B3D]" fill="#FF6B3D" /> 4.8 avg. rating</span>
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

/* --------------------------------- Page ----------------------------------- */
const emptyFilters = {
  search: "",
  category: "",
  institution: "",
  duration: "",
  level: "",
  mode: "",
  sort: "",
};

export default function BrowseCourses() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = ALL_COURSES.filter((c) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !`${c.title} ${c.institution.name} ${c.category}`.toLowerCase().includes(q)) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.institution && c.institution.name !== filters.institution) return false;
      if (filters.duration && c.duration !== filters.duration) return false;
      if (filters.level && c.level !== filters.level) return false;
      if (filters.mode && c.mode !== filters.mode) return false;
      return true;
    });

    if (filters.sort === "Newest") list = [...list].sort((a, b) => b.id - a.id);
    if (filters.sort === "Highest Rated") list = [...list].sort((a, b) => b.rating - a.rating);
    if (filters.sort === "Closing Soon") list = [...list].sort((a, b) => (b.closingSoon ? 1 : 0) - (a.closingSoon ? 1 : 0));
    if (filters.sort === "Most Applied") list = [...list].sort((a, b) => b.applied - a.applied);

    return list;
  }, [filters]);

  const featured = useMemo(() => filtered.filter((c) => c.featured), [filtered]);
  const popular = useMemo(() => filtered.filter((c) => c.popular), [filtered]);
  const fresh = useMemo(() => filtered.filter((c) => c.isNew), [filtered]);
  const recommended = useMemo(() => filtered.filter((c) => c.recommended), [filtered]);
  const recent = useMemo(() => filtered.filter((c) => c.recent), [filtered]);

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      <PageStyles />
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10 bg-[#FFFFFF]">
          {/* Hero */}
          {loading ? <HeroSkeleton /> : <Hero search={filters.search} setSearch={(v) => setFilters((f) => ({ ...f, search: v }))} />}

          {/* Sticky filter bar */}
          <div className="mt-8">
            {loading ? (
              <FilterBarSkeleton />
            ) : (
              <FilterBar filters={filters} setFilters={setFilters} resultCount={filtered.length} onClear={clearFilters} />
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
            <>
              {/* Featured — horizontal carousel */}
              <CarouselRow
                title="Featured Courses"
                subtitle="Hand-picked programs with strong placement outcomes"
                icon={Sparkles}
                courses={featured.length ? featured : filtered.slice(0, 6)}
              />

              {/* Main responsive grid */}
              <section className="mt-14">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">All Courses</h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {filtered.length} course{filtered.length !== 1 ? "s" : ""} currently open for applications
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filtered.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              </section>

              {/* Additional carousels */}
              <CarouselRow title="Popular Courses" subtitle="Most applied-to this month" icon={Flame} courses={popular} />
              <CarouselRow title="New Courses" subtitle="Freshly opened for applications" icon={TrendingUp} courses={fresh} />
              <CarouselRow title="Recommended For You" subtitle="Based on your interests and activity" icon={ThumbsUp} courses={recommended} />
              <CarouselRow title="Recently Added" subtitle="Newest listings from partner institutions" icon={Clock3} courses={recent} />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}