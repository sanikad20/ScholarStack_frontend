import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight,
  Upload,
  XCircle,
  PlayCircle,
  Compass,
  Download,
  FolderOpen,
  Mail,
  Bell,
  CalendarClock,
  Star,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import StudentTopbar from "../../components/layout/StudentTopbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import Footer from "../../components/layout/Footer";

/* =========================================================================
   ScholarStack — Student Dashboard (My Applications)
   Premium SaaS redesign inspired by Coursera / Notion / Linear / Stripe.
   Content area only — top navbar & sidebar are untouched.
   ========================================================================= */

/* ------------------------------ Dummy data ------------------------------ */
// Swap for useApplications() -> GET /api/applications/my once wired.

const STUDENT_NAME = "Ananya";
const CURRENT_SESSION = "Fall 2026";
const PROFILE_COMPLETION = 92;

const STATS = [
  { key: "submitted", label: "Applications Submitted", value: 3, icon: FileText, accent: "#FF6B3D" },
  { key: "pending", label: "Pending Review", value: 2, icon: Clock, accent: "#F59E0B" },
  { key: "verified", label: "Verified", value: 1, icon: ShieldCheck, accent: "#10B981" },
  { key: "offers", label: "Offers Received", value: 1, icon: Award, accent: "#6366F1" },
];

const WORKFLOW_STEPS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "verification", label: "Document Verification" },
  { value: "faculty_review", label: "Faculty Review" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer Letter" },
  { value: "admitted", label: "Admission Confirmed" },
];

const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  verification: "Document Verification",
  faculty_review: "Faculty Review",
  interview: "Interview Scheduled",
  offer: "Offer Received",
  admitted: "Admitted",
  rejected: "Rejected",
};

const STATUS_BADGE = {
  draft: "bg-[#F1F5F9] text-[#64748B]",
  submitted: "bg-[#EFF6FF] text-[#2563EB]",
  verification: "bg-[#FFF1EB] text-[#F55A2A]",
  faculty_review: "bg-[#FFF1EB] text-[#F55A2A]",
  interview: "bg-[#FEF3C7] text-[#B45309]",
  offer: "bg-[#ECFDF5] text-[#047857]",
  admitted: "bg-[#ECFDF5] text-[#047857]",
  rejected: "bg-[#FEF2F2] text-[#DC2626]",
};

const DUMMY_ACTIVE_APPLICATION = {
  code: "SS-04821",
  institution: "MIT OpenLearn",
  institutionColor: "#0F172A",
  courseName: "B.Tech Computer Science",
  status: "faculty_review",
  estProcessing: "5–7 business days",
  lastUpdated: "2 hours ago",
};

const DUMMY_APPLICATIONS = [
  {
    id: 1,
    institution: "MIT OpenLearn",
    institutionColor: "#0F172A",
    course: "The Python Mega Course: Build 10 Real World Applications",
    code: "SS-04821",
    session: "Fall 2026",
    submitted: "Jun 30, 2026",
    stage: "faculty_review",
    deadline: "Aug 15, 2026",
  },
  {
    id: 2,
    institution: "Stanford Online",
    institutionColor: "#8C1515",
    course: "Applied Machine Learning & Deep Learning",
    code: "SS-04822",
    session: "Fall 2026",
    submitted: "Jun 28, 2026",
    stage: "verification",
    deadline: "Aug 10, 2026",
  },
  {
    id: 3,
    institution: "Wharton Executive",
    institutionColor: "#065F46",
    course: "Product Management Fundamentals",
    code: "SS-04823",
    session: "Fall 2026",
    submitted: "Jun 20, 2026",
    stage: "offer",
    deadline: "Jul 30, 2026",
  },
];

const NOTIFICATIONS = [
  { id: 1, title: "Document Verified", detail: "Your transcript for SS-04822 has been verified.", time: "2h ago", tone: "success" },
  { id: 2, title: "Application moved to Review", detail: "SS-04821 is now with the faculty panel.", time: "1d ago", tone: "info" },
  { id: 3, title: "Interview Scheduled", detail: "MIT OpenLearn scheduled your interview for Jul 12.", time: "2d ago", tone: "warning" },
  { id: 4, title: "Admission Approved", detail: "Congratulations! Wharton Executive sent an offer letter.", time: "4d ago", tone: "success" },
];

const NOTIF_DOT = {
  success: "#10B981",
  info: "#2563EB",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const DEADLINES = [
  { id: 1, label: "Application closes in", value: "5 Days", detail: "MIT OpenLearn · B.Tech CS", icon: CalendarClock, tone: "#EF4444" },
  { id: 2, label: "Upload Documents", value: "Tomorrow", detail: "Stanford Online · verification pending", icon: Upload, tone: "#F59E0B" },
  { id: 3, label: "Interview", value: "Jul 12", detail: "MIT OpenLearn · panel round", icon: PlayCircle, tone: "#6366F1" },
  { id: 4, label: "Payment Deadline", value: "Jul 15", detail: "Wharton Executive · seat confirmation", icon: FileText, tone: "#10B981" },
];

const RECOMMENDED_COURSES = [
  { id: 11, title: "Data Structures & Algorithms Mastery", institution: "IIT Delhi", color: "#B91C1C", duration: "8 weeks", rating: 4.8, imgSeed: "reco-1" },
  { id: 12, title: "Cloud Architecture on AWS & Azure", institution: "Imperial College", color: "#1D4ED8", duration: "6 weeks", rating: 4.7, imgSeed: "reco-2" },
  { id: 13, title: "UI/UX Design: Wireframe to Prototype", institution: "National Design Inst.", color: "#7C3AED", duration: "6 weeks", rating: 4.9, imgSeed: "reco-3" },
  { id: 14, title: "Business Analytics with Python & SQL", institution: "Wharton Executive", color: "#065F46", duration: "12 weeks", rating: 4.6, imgSeed: "reco-4" },
  { id: 15, title: "Digital Marketing & Growth Strategy", institution: "Stanford Online", color: "#8C1515", duration: "4 weeks", rating: 4.5, imgSeed: "reco-5" },
];

/* --------------------------------- Utils -------------------------------- */
function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

/* ------------------------------ Local styles ---------------------------- */
function PageStyles() {
  return (
    <style>{`
      @keyframes ss-fade-in { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
      @keyframes ss-card-in { from { opacity: 0; transform: translateY(14px) scale(0.985);} to { opacity: 1; transform: translateY(0) scale(1);} }
      @keyframes ss-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      @keyframes ss-float-1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(10px,-14px) rotate(6deg); } }
      @keyframes ss-float-2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-14px,10px) rotate(-8deg); } }
      @keyframes ss-glow { 0%,100% { box-shadow: 0 0 0 4px rgba(255,107,61,0.18); } 50% { box-shadow: 0 0 0 8px rgba(255,107,61,0.28); } }
      @keyframes ss-ripple { to { transform: scale(3); opacity: 0; } }
      .ss-fade-in { animation: ss-fade-in 0.5s ease-out both; }
      .ss-card-in { animation: ss-card-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .ss-shimmer { background: linear-gradient(90deg,#eef1f5 0px,#f8fafc 40px,#eef1f5 80px); background-size: 800px 100%; animation: ss-shimmer 1.6s infinite linear; }
      .ss-float-1 { animation: ss-float-1 7s ease-in-out infinite; }
      .ss-float-2 { animation: ss-float-2 9s ease-in-out infinite; }
      .ss-glow { animation: ss-glow 2.2s ease-in-out infinite; }
      .ss-scroll-row { scroll-behavior: smooth; scrollbar-width: none; }
      .ss-scroll-row::-webkit-scrollbar { display: none; }
      .ss-line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .ss-ripple-span { position: absolute; border-radius: 9999px; transform: scale(0); background: rgba(255,255,255,0.5); pointer-events: none; animation: ss-ripple 600ms ease-out; }
    `}</style>
  );
}

/* ------------------------------- Ripple button --------------------------- */
function RippleButton({ children, className, onClick, as: Comp = "button", ...props }) {
  const ref = useRef(null);
  const handleClick = (e) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const span = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      span.className = "ss-ripple-span";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(span);
      setTimeout(() => span.remove(), 650);
    }
    onClick?.(e);
  };
  return (
    <Comp ref={ref} onClick={handleClick} className={classNames("relative overflow-hidden", className)} {...props}>
      {children}
    </Comp>
  );
}

/* ------------------------------ Animated counter -------------------------- */
function AnimatedCounter({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
}

/* --------------------------------- Skeletons ------------------------------ */
function HeroSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] p-8 md:p-10">
      <div className="ss-shimmer h-4 w-32 rounded-full mb-5" />
      <div className="ss-shimmer h-9 w-72 rounded-lg mb-3" />
      <div className="ss-shimmer h-4 w-96 rounded-md" />
    </div>
  );
}
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#E5E7EB] p-6">
          <div className="ss-shimmer w-10 h-10 rounded-xl mb-4" />
          <div className="ss-shimmer h-7 w-16 rounded-md mb-2" />
          <div className="ss-shimmer h-3 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}
function AppCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="ss-shimmer w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="ss-shimmer h-3 w-32 rounded-md" />
          <div className="ss-shimmer h-4 w-52 rounded-md" />
        </div>
      </div>
      <div className="ss-shimmer h-3 w-full rounded-md mb-2" />
      <div className="ss-shimmer h-3 w-2/3 rounded-md" />
    </div>
  );
}

/* ---------------------------------- Bits ---------------------------------- */
function InstitutionAvatar({ name, color, size = 40 }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-xl text-[12px] font-bold text-white shrink-0 shadow-sm"
      style={{ width: size, height: size, background: color }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={classNames("inline-flex items-center px-3 py-1.5 rounded-full text-[11.5px] font-semibold", STATUS_BADGE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/* --------------------------------- Hero ------------------------------------ */
function HeroHeader() {
  return (
    <section
      className="ss-fade-in relative overflow-hidden rounded-2xl border border-[#E5E7EB] p-8 md:p-10"
      style={{ background: "radial-gradient(120% 140% at 100% 0%, #FFF1EB 0%, #F8FAFC 45%, #FFFFFF 100%)" }}
    >
      {/* floating shapes */}
      <div className="pointer-events-none absolute -top-6 right-16 w-20 h-20 rounded-3xl bg-[#FF6B3D]/10 ss-float-1 hidden md:block" />
      <div className="pointer-events-none absolute bottom-4 right-56 w-12 h-12 rounded-full bg-[#6366F1]/10 ss-float-2 hidden md:block" />
      <div className="pointer-events-none absolute top-10 right-96 w-8 h-8 rounded-xl bg-[#10B981]/10 ss-float-1 hidden lg:block" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-[32px] font-extrabold text-[#0F172A] tracking-tight">
            Welcome back, {STUDENT_NAME} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-2 text-[15px] text-[#64748B] max-w-lg leading-relaxed">
            Track your applications, monitor admission progress, and stay updated with important notifications.
          </p>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="text-right">
            <p className="text-[11.5px] font-medium text-[#64748B] uppercase tracking-wide">Current Session</p>
            <p className="mt-0.5 text-[15px] font-bold text-[#0F172A]">{CURRENT_SESSION}</p>
          </div>
          <div className="h-9 w-px bg-[#E5E7EB]" />
          <div className="text-right">
            <p className="text-[11.5px] font-medium text-[#64748B] uppercase tracking-wide">Profile Completion</p>
            <div className="mt-1 flex items-center gap-2 justify-end">
              <div className="w-20 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div className="h-full rounded-full bg-[#FF6B3D] transition-all duration-700" style={{ width: `${PROFILE_COMPLETION}%` }} />
              </div>
              <span className="text-[13px] font-bold text-[#0F172A]">{PROFILE_COMPLETION}%</span>
            </div>
          </div>
          <Link to="/student/courses">
            <RippleButton
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF6B3D] text-white text-[13.5px] font-semibold
                         hover:bg-[#F55A2A] transition-all duration-[250ms] ease-out hover:shadow-[0_10px_24px_-8px_rgba(255,107,61,0.55)] active:scale-[0.97]"
            >
              <Compass size={16} /> Browse More Courses
            </RippleButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Stat cards -------------------------------- */
function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <div
      className="ss-card-in group relative bg-white rounded-2xl border border-[#E5E7EB] p-6 overflow-hidden
                 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(15,23,42,0.15)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all duration-300 group-hover:w-1.5" style={{ background: stat.accent }} />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${stat.accent}18`, color: stat.accent }}
      >
        <Icon size={20} />
      </div>
      <p className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
        <AnimatedCounter value={stat.value} />
      </p>
      <p className="mt-1.5 text-[13px] text-[#64748B] font-medium">{stat.label}</p>
    </div>
  );
}

/* ------------------------------ Progress timeline --------------------------- */
function ApplicationProgress({ app }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.value === app.status);

  return (
    <section className="ss-card-in bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <InstitutionAvatar name={app.institution} color={app.institutionColor} size={32} />
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              #{app.code} · {app.institution}
            </h2>
          </div>
          <p className="text-[13.5px] text-[#64748B] mb-8">{app.courseName}</p>

          {/* Timeline */}
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex items-start min-w-[640px]">
              {WORKFLOW_STEPS.map((step, i) => {
                const done = i < currentIndex;
                const current = i === currentIndex;
                return (
                  <div key={step.value} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div className="absolute top-4 right-1/2 w-full h-0.5 overflow-hidden">
                        <div
                          className={classNames(
                            "h-full transition-all duration-700 ease-out",
                            i <= currentIndex ? "bg-[#FF6B3D] w-full" : "bg-[#E5E7EB] w-full"
                          )}
                        />
                      </div>
                    )}
                    <div
                      className={classNames(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-300",
                        done && "bg-[#FF6B3D] text-white",
                        current && "bg-[#FF6B3D] text-white ss-glow",
                        !done && !current && "bg-[#F1F5F9] text-[#94A3B8]"
                      )}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                    <span
                      className={classNames(
                        "mt-2 text-[11px] font-medium text-center px-1",
                        current ? "text-[#FF6B3D] font-semibold" : done ? "text-[#0F172A]" : "text-[#94A3B8]"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div className="md:w-56 shrink-0 flex md:flex-col gap-4 md:gap-5 md:border-l md:border-[#E5E7EB] md:pl-6 flex-wrap">
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Current Status</p>
            <StatusBadge status={app.status} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Est. Processing Time</p>
            <p className="text-[13.5px] font-semibold text-[#0F172A]">{app.estProcessing}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-1">Last Updated</p>
            <p className="text-[13.5px] font-semibold text-[#0F172A]">{app.lastUpdated}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- App cards ------------------------------- */
function ApplicationCard({ app, index }) {
  return (
    <div
      className="ss-card-in group bg-white rounded-2xl border border-[#E5E7EB] p-6
                 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(15,23,42,0.15)] hover:border-[#FF6B3D]/50"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <InstitutionAvatar name={app.institution} color={app.institutionColor} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#64748B] truncate">{app.institution}</p>
            <h3 className="text-[14.5px] font-bold text-[#0F172A] ss-line-clamp-2 leading-snug">{app.course}</h3>
          </div>
        </div>
        <StatusBadge status={app.stage} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12.5px] text-[#64748B] mb-5">
        <div><span className="text-[#94A3B8]">App No.</span> <span className="font-medium text-[#0F172A]">{app.code}</span></div>
        <div><span className="text-[#94A3B8]">Session</span> <span className="font-medium text-[#0F172A]">{app.session}</span></div>
        <div><span className="text-[#94A3B8]">Submitted</span> <span className="font-medium text-[#0F172A]">{app.submitted}</span></div>
        <div><span className="text-[#94A3B8]">Deadline</span> <span className="font-medium text-[#DC2626]">{app.deadline}</span></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/student/applications/${app.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FF6B3D] text-white text-[12.5px] font-semibold
                     hover:bg-[#F55A2A] transition-all duration-200"
        >
          View Details <ArrowRight size={13} />
        </Link>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E5E7EB] text-[#0F172A] text-[12.5px] font-semibold hover:border-[#0F172A] hover:bg-[#F8FAFC] transition-all duration-200">
          <Upload size={13} /> Upload Documents
        </button>
        {app.stage === "draft" ? (
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E5E7EB] text-[#0F172A] text-[12.5px] font-semibold hover:border-[#0F172A] hover:bg-[#F8FAFC] transition-all duration-200">
            <PlayCircle size={13} /> Resume Application
          </button>
        ) : (
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E5E7EB] text-[#DC2626] text-[12.5px] font-semibold hover:bg-[#FEF2F2] hover:border-[#FCA5A5] transition-all duration-200">
            <XCircle size={13} /> Withdraw
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Quick actions ----------------------------- */
function QuickActions() {
  const actions = [
    { label: "Continue Incomplete Application", icon: PlayCircle },
    { label: "Browse New Courses", icon: Compass },
    { label: "Download Admission Letter", icon: Download },
    { label: "View Uploaded Documents", icon: FolderOpen },
    { label: "Contact Institution", icon: Mail },
  ];
  return (
    <div className="ss-card-in bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <h3 className="text-[14px] font-bold text-[#0F172A] mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-1.5">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-medium text-[#0F172A]
                         hover:bg-[#FFF1EB] hover:text-[#F55A2A] transition-all duration-200 group"
            >
              <span className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#FF6B3D] group-hover:bg-white transition-colors duration-200">
                <Icon size={15} />
              </span>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Notifications ------------------------------ */
function NotificationsWidget() {
  return (
    <div className="ss-card-in bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-[#0F172A] flex items-center gap-2">
          <Bell size={15} className="text-[#FF6B3D]" /> Recent Updates
        </h3>
      </div>
      <div className="flex flex-col gap-1">
        {NOTIFICATIONS.map((n) => (
          <button
            key={n.id}
            className="w-full text-left flex gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-all duration-200"
          >
            <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: NOTIF_DOT[n.tone] }} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#0F172A]">{n.title}</p>
              <p className="text-[12px] text-[#64748B] ss-line-clamp-2">{n.detail}</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Upcoming deadlines --------------------------- */
function DeadlinesWidget() {
  return (
    <div className="ss-card-in bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <h3 className="text-[14px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
        <CalendarClock size={15} className="text-[#FF6B3D]" /> Upcoming Deadlines
      </h3>
      <div className="flex flex-col gap-3">
        {DEADLINES.map((d) => {
          const Icon = d.icon;
          return (
            <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#F1F5F9] hover:border-[#E5E7EB] transition-colors duration-200">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${d.tone}18`, color: d.tone }}>
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] text-[#64748B]">{d.label}</p>
                <p className="text-[13px] font-bold text-[#0F172A]">{d.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- Recommended courses --------------------------- */
function RecommendedCourses() {
  const scrollerRef = useRef(null);
  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="mt-2">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Sparkles size={17} className="text-[#FF6B3D]" /> Recommended For You
          </h2>
          <p className="mt-1 text-[13px] text-[#64748B]">Based on your current applications</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scrollBy(-1)} className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:border-[#0F172A] transition-all duration-200">
            <ChevronRight size={15} className="rotate-180" />
          </button>
          <button onClick={() => scrollBy(1)} className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:border-[#0F172A] transition-all duration-200">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="ss-scroll-row flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
        {RECOMMENDED_COURSES.map((c, i) => (
          <div
            key={c.id}
            className="ss-card-in group min-w-[270px] max-w-[270px] bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden
                       transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.18)]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative overflow-hidden aspect-video">
              <img
                src={`https://picsum.photos/seed/${c.imgSeed}/400/225`}
                alt={c.title}
                className="w-full h-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.06]"
                loading="lazy"
              />
              <div className="absolute -bottom-4 left-4 flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-md border border-[#E5E7EB]">
                <InstitutionAvatar name={c.institution} color={c.color} size={26} />
                <span className="text-[11px] font-semibold text-[#0F172A] max-w-[110px] truncate">{c.institution}</span>
              </div>
            </div>
            <div className="p-4 pt-7">
              <h3 className="text-[13.5px] font-bold text-[#0F172A] ss-line-clamp-2 leading-snug group-hover:text-[#FF6B3D] transition-colors duration-200">
                {c.title}
              </h3>
              <div className="mt-2.5 flex items-center justify-between text-[12px] text-[#64748B]">
                <span>{c.duration}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
                  <Star size={12} fill="#FF6B3D" className="text-[#FF6B3D]" /> {c.rating}
                </span>
              </div>
              <button className="mt-3 w-full py-2 rounded-full bg-[#FF6B3D] text-white text-[12.5px] font-semibold hover:bg-[#F55A2A] transition-all duration-200 active:scale-[0.97]">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Empty state ------------------------------ */
function EmptyState() {
  return (
    <div className="ss-fade-in flex flex-col items-center text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="140" height="90" rx="14" fill="#F8FAFC" stroke="#E5E7EB" />
        <rect x="40" y="42" width="80" height="8" rx="4" fill="#FF6B3D" opacity="0.5" />
        <rect x="40" y="58" width="100" height="6" rx="3" fill="#E5E7EB" />
        <rect x="40" y="72" width="60" height="6" rx="3" fill="#E5E7EB" />
        <circle cx="128" cy="82" r="18" fill="#FFF1EB" />
        <path d="M120 82h16M128 74v16" stroke="#FF6B3D" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h3 className="mt-6 text-lg font-bold text-[#0F172A]">No applications yet</h3>
      <p className="mt-1.5 text-sm text-[#64748B] max-w-sm">
        Once you apply to a course, you'll be able to track its progress right here.
      </p>
      <Link to="/student/courses">
        <RippleButton className="mt-6 px-6 py-2.5 rounded-full bg-[#FF6B3D] text-white text-[13px] font-semibold hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]">
          Browse Courses
        </RippleButton>
      </Link>
    </div>
  );
}

/* --------------------------------- Page ------------------------------------ */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const hasApplications = DUMMY_APPLICATIONS.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A] pb-20 lg:pb-0">
      <PageStyles />
      <StudentTopbar />

      <div className="flex flex-1">
        <StudentSidebar />

        <main className="flex-1 px-8 py-10 bg-[#F8FAFC]/40">
          {/* Hero */}
          {loading ? <HeroSkeleton /> : <HeroHeader />}

          {/* Stats */}
          <div className="mt-6">
            {loading ? (
              <StatsSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {STATS.map((s, i) => (
                  <StatCard key={s.key} stat={s} index={i} />
                ))}
              </div>
            )}
          </div>

          {!loading && !hasApplications ? (
            <div className="mt-8">
              <EmptyState />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Progress timeline */}
                {loading ? (
                  <div className="rounded-2xl border border-[#E5E7EB] p-8">
                    <div className="ss-shimmer h-4 w-64 rounded-md mb-8" />
                    <div className="ss-shimmer h-10 w-full rounded-md" />
                  </div>
                ) : (
                  <ApplicationProgress app={DUMMY_ACTIVE_APPLICATION} />
                )}

                {/* Applications */}
                <section>
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">My Applications</h2>
                      <p className="mt-1 text-[13px] text-[#64748B]">{DUMMY_APPLICATIONS.length} applications this session</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => <AppCardSkeleton key={i} />)
                      : DUMMY_APPLICATIONS.map((app, i) => <ApplicationCard key={app.id} app={app} index={i} />)}
                  </div>
                </section>

                {!loading && <RecommendedCourses />}
              </div>

              {/* Sticky right column */}
              <aside className="lg:col-span-1">
                <div className="flex flex-col gap-6 lg:sticky lg:top-8">
                  {loading ? (
                    <>
                      <div className="rounded-2xl border border-[#E5E7EB] p-5">
                        <div className="ss-shimmer h-4 w-32 rounded-md mb-4" />
                        <div className="ss-shimmer h-9 w-full rounded-xl mb-2" />
                        <div className="ss-shimmer h-9 w-full rounded-xl mb-2" />
                        <div className="ss-shimmer h-9 w-full rounded-xl" />
                      </div>
                    </>
                  ) : (
                    <>
                      <QuickActions />
                      <NotificationsWidget />
                      <DeadlinesWidget />
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Mobile sticky action button */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 backdrop-blur border-t border-[#E5E7EB]">
        <Link to="/student/courses">
          <RippleButton className="w-full py-3 rounded-full bg-[#FF6B3D] text-white text-[14px] font-semibold hover:bg-[#F55A2A] transition-all duration-[250ms] active:scale-[0.97]">
            Browse More Courses
          </RippleButton>
        </Link>
      </div>
    </div>
  );
}