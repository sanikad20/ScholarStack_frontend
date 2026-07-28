// src/pages/public/Landing.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Layers,
  BookOpen,
  CalendarCheck,
  MousePointerClick,
  TrendingUp,
  Settings2,
  FileCheck,
  Sparkles,
} from "lucide-react";

import PublicNav from "../../components/layout/PublicNav";
import Footer from "../../components/layout/Footer";
import useInstitutions from "../../hooks/useInstitutions";

import heroIllustration from "../../assets/hero-illustration.png";
import groupIllustration from "../../assets/Group(1).png";

// ─── Shared constants ────────────────────────────────────
const WRAP = "max-w-7xl mx-auto px-6 lg:px-10";

const STUDENT_STATS = (totalCount) => [
  { icon: Users, value: "67.1k", label: "Students" },
  { icon: Building2, value: `${totalCount}+`, label: "Institutions" },
  { icon: Layers, value: "6", label: "Review Stages" },
  { icon: BookOpen, value: "40+", label: "Courses" },
];

const ADMIN_STATS = (totalCount) => [
  { icon: Building2, value: `${totalCount}+`, label: "Institutions" },
  { icon: Users, value: "250+", label: "Admins" },
  { icon: Layers, value: "15k+", label: "Applications Processed" },
  { icon: BookOpen, value: "40+", label: "Courses" },
];

const STUDENT_STEPS = [
  { icon: CalendarCheck, title: "Register", body: "Create your account and verify your email." },
  { icon: MousePointerClick, title: "Apply", body: "Browse institutions and submit applications." },
  { icon: TrendingUp, title: "Track", body: "Receive updates until admission." },
];

const ADMIN_STEPS = [
  {
    icon: Settings2,
    title: "Set Up",
    body: "Configure courses and admission forms.",
  },
  {
    icon: FileCheck,
    title: "Review",
    body: "Verify documents and applications.",
  },
  {
    icon: Sparkles,
    title: "Admit",
    body: "Admit students with one click.",
  },
];

// ─── Hero ────────────────────────────────────────────────
function Hero({ view }) {
  const isStudent = view === "student";
  return (
    <section className="pt-20">
      <div className={WRAP}>
        <div className="grid lg:grid-cols-2 items-center gap-8 min-h-[650px]">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              {isStudent ? "🎓 Admission Platform" : "🏛️ Institution Management"}
            </span>

            <h1 className="mt-6 text-[72px] leading-[0.95] font-bold text-navy">
              {isStudent ? (
                <>
                  Every
                  <br />
                  Application
                  <br />
                  Tracked.
                </>
              ) : (
                <>
                  Every
                  <br />
                  Admission
                  <br />
                  Managed.
                </>
              )}
            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-500 max-w-lg">
              {isStudent
                ? "ScholarStack provides one place for students to apply across institutions while helping admission teams review, verify and manage applications efficiently."
                : "ScholarStack empowers institutions to manage applications, verify documents, and admit students—all from a single, powerful dashboard."}
            </p>

            <div className="flex gap-5 mt-10">
              <Link
                to="/register"
                className="bg-accent text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-dark transition"
              >
                {isStudent ? "Start Applying" : "Admin Login"}
              </Link>
              <Link
                to="/for-institutions"
                className="border px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition"
              >
                {isStudent ? "Browse Institutions" : "Learn More"}
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img src={heroIllustration} alt="" className="w-full max-w-[760px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PortalSwitcher() {
  return (
    <section className="py-12 bg-white">
      <div className={WRAP}>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-navy">Student Portal</h3>
            <p className="text-sm text-gray-500 mt-2">
              Browse university courses, apply online, and upload your documents.
            </p>
            <Link
              to="/login"
              className="inline-block mt-5 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-dark transition"
            >
              Enter Student Console
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="p-8 border border-gray-100 rounded-2xl bg-[#FFF3EA] shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-navy">Institution Admin</h3>
            <p className="text-sm text-gray-500 mt-2">
              Manage courses, build application forms, and review student applications.
            </p>
            <Link
              to="/for-institutions"
              className="inline-block mt-5 border-2 border-accent text-accent px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent/5 transition"
            >
              Enter Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar({ view, totalCount }) {
  const stats =
    view === "student"
      ? STUDENT_STATS(totalCount)
      : ADMIN_STATS(totalCount);

  return (
    <section className="bg-[#FFF3EA] py-12">
      <div className={WRAP}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-navy">{value}</h3>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Institution Highlights ──────────────────────────────
function InstitutionHighlights({ institutions, status, view }) {
  const isStudent = view === "student";
  return (
    <section className="py-24">
      <div className={WRAP}>
        <div className="text-center mb-14">
          <span className="uppercase tracking-wider text-accent font-semibold">
            {isStudent ? "Institutions" : "Trusted Partners"}
          </span>
          <h2 className="mt-4 text-4xl font-bold">
            {isStudent ? "Featured Institutions" : "Leading Institutions"}
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            {isStudent
              ? "Discover institutions currently accepting applications through ScholarStack."
              : "Join 120+ institutions already managing admissions with ScholarStack."}
          </p>
        </div>

        {status === "loading" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl h-80 bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="text-center text-gray-500 py-20">Unable to load institutions.</div>
        )}

        {status === "success" && institutions.length === 0 && (
          <div className="text-center text-gray-500 py-20">No institutions available.</div>
        )}

        {status === "success" && institutions.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {institutions.slice(0, 4).map((institution, index) => (
              <div
                key={institution.id ?? institution._id ?? index}
                className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition duration-300"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-300">
                  {institution.name?.slice(0, 2).toUpperCase() || "🏛️"}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg truncate">{institution.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 truncate">
                    {institution.address ?? institution.subdomain ?? "Institution"}
                  </p>
                  <button
                    className="mt-5 text-accent font-semibold hover:underline"
                    onClick={() => window.open(institution.website, "_blank")}
                  >
                    {isStudent ? "View Details →" : "Visit →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────
function HowItWorks({ view }) {
  const steps = view === "student" ? STUDENT_STEPS : ADMIN_STEPS;
  const title = view === "student" ? "How ScholarStack Works" : "How It Works for Institutions";
  const subtitle =
    view === "student"
      ? "Complete your admission journey in three simple steps."
      : "Manage your entire admission process from start to finish.";

  return (
    <section className="py-24 bg-gray-50">
      <div className={WRAP}>
        <div className="text-center mb-16">
          <span className="uppercase text-accent font-semibold">Process</span>
          <h2 className="mt-4 text-4xl font-bold">{title}</h2>
          <p className="mt-4 text-gray-500">{subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {steps.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-white rounded-3xl shadow-sm p-10 text-center hover:shadow-xl transition"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <Icon size={28} className="text-accent" />
              </div>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-4 leading-7 text-gray-500">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Band ─────────────────────────────────────────────
function CtaBand({ view }) {
  const isStudent = view === "student";
  return (
    <section className="bg-[#171823] py-24">
      <div className={WRAP}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="flex justify-center lg:justify-start">
            <img src={groupIllustration} alt="ScholarStack" className="w-[420px] max-w-full" />
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              {isStudent
                ? "Start admissions the smarter way"
                : "Ready to streamline your admissions?"}
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-xl">
              {isStudent
                ? "Join 120+ institutions already managing admissions through ScholarStack. Track every applicant from draft to admitted—all from one dashboard."
                : "Get started in minutes. Set up your courses, configure forms, and start reviewing applications today."}
            </p>
            <div className="mt-10 flex gap-5 flex-wrap">
              <Link
                to={isStudent ? "/register" : "/admin-login"}
                className="bg-accent px-8 py-4 rounded-full text-white font-semibold hover:bg-accent-dark transition"
              >
                {isStudent ? "Register Now" : "Admin Login"}
              </Link>
              <Link
                to={isStudent ? "/login" : "/admin-login"}
                className="border border-white/30 px-8 py-4 rounded-full text-white font-semibold hover:bg-white hover:text-black transition"
              >
                {isStudent ? "Student Portal" : "Learn More"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing ─────────────────────────────────────────
export default function Landing() {
  const [view, setView] = useState("student");
  const { institutions, totalCount, status } = useInstitutions();

  return (
    <div className="bg-white text-navy overflow-x-hidden">
      <PublicNav view={view} setView={setView} />
      <main>
        <Hero view={view} />
        <PortalSwitcher />
        <StatsBar view={view} totalCount={totalCount} />
        <InstitutionHighlights institutions={institutions} status={status} view={view} />
        <HowItWorks view={view} />
        <CtaBand view={view} />
      </main>
      <Footer />
    </div>
  );
}