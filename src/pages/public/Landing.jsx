import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Layers,
  BookOpen,
  CalendarCheck,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";

import PublicNav from "../../components/layout/PublicNav";
import Footer from "../../components/layout/Footer";
import useInstitutions from "../../hooks/useInstitutions";

import heroIllustration from "../../assets/hero-illustration.png";
import groupIllustration from "../../assets/Group(1).png";

const STATS = [
  { icon: Users, value: "67.1k", label: "Students" },
  { icon: Building2, value: "120+", label: "Institutions" },
  { icon: Layers, value: "6", label: "Review Stages" },
  { icon: BookOpen, value: "40+", label: "Courses" },
];

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Register",
    body: "Create your account and verify your email.",
  },
  {
    icon: MousePointerClick,
    title: "Apply",
    body: "Browse institutions and submit applications.",
  },
  {
    icon: TrendingUp,
    title: "Track",
    body: "Receive updates until admission.",
  },
];

const CARD_THEMES = [
  { from: "#EDEBFB", to: "#C9C4F2", shape: "#6C63D6" },
  { from: "#FCE7E1", to: "#F2B8A6", shape: "#D9704F" },
  { from: "#E0F0EC", to: "#A9D6C8", shape: "#3E8E76" },
  { from: "#FDF1DA", to: "#F1D08F", shape: "#C99A2E" },
];

// Full-bleed container: fills any realistic screen width, only caps on
// genuinely ultra-wide monitors so text doesn't stretch absurdly.
const WRAP = "max-w-7xl mx-auto px-6 lg:px-10";

function Hero() {
  return (
    <section className="pt-20">
      <div className={WRAP}>
        <div className="grid lg:grid-cols-2 items-center gap-8 min-h-[650px]">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              🎓 Admission Platform
            </span>

            <h1 className="mt-6 text-[72px] leading-[0.95] font-bold text-navy">
              Every
              <br />
              Application
              <br />
              Tracked.
            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-500 max-w-lg">
              ScholarStack provides one place for students to apply across
              institutions while helping admission teams review, verify and
              manage applications efficiently.
            </p>

            <div className="flex gap-5 mt-10">
              <Link
                to="/register"
                className="bg-accent text-white px-8 py-4 rounded-full font-semibold"
              >
                Start Applying
              </Link>
              <Link
                to="/for-institutions"
                className="border px-8 py-4 rounded-full font-semibold"
              >
                Browse Institutions
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

function StatsBar() {
  return (
    <section className="bg-[#FFF3EA] py-12">
      <div className={WRAP}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ icon: Icon, value, label }) => (
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

function InstitutionCard({ institution, theme }) {
  const initials = institution.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition duration-300">
      <div
        className="h-44 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <svg viewBox="0 0 100 60" className="w-28 h-20 group-hover:scale-110 transition">
          <rect x="15" y="24" width="70" height="30" fill={theme.shape} />
          <polygon points="50,6 12,24 88,24" fill={theme.shape} />
          <rect x="30" y="34" width="8" height="20" fill={theme.to} />
          <rect x="46" y="34" width="8" height="20" fill={theme.to} />
          <rect x="62" y="34" width="8" height="20" fill={theme.to} />
        </svg>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg truncate">{institution.name ?? initials}</h3>
        <p className="mt-2 text-sm text-gray-500 truncate">
          {institution.address ?? institution.subdomain ?? "Institution"}
        </p>
        <button className="mt-5 text-accent font-semibold hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );
}

function InstitutionHighlights({ institutions, status }) {
  return (
    <section className="py-24">
      <div className={WRAP}>
        <div className="text-center mb-14">
          <span className="uppercase tracking-wider text-accent font-semibold">
            Institutions
          </span>
          <h2 className="mt-4 text-4xl font-bold">Featured Institutions</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Discover institutions currently accepting applications through
            ScholarStack.
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
              <InstitutionCard
                key={institution.id ?? institution._id ?? index}
                institution={institution}
                theme={CARD_THEMES[index % CARD_THEMES.length]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className={WRAP}>
        <div className="text-center mb-16">
          <span className="uppercase text-accent font-semibold">Process</span>
          <h2 className="mt-4 text-4xl font-bold">How ScholarStack Works</h2>
          <p className="mt-4 text-gray-500">
            Complete your admission journey in three simple steps.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {STEPS.map(({ icon: Icon, title, body }) => (
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

function CtaBand() {
  return (
    <section className="bg-[#171823] py-24">
      <div className={WRAP}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="flex justify-center lg:justify-start">
            <img src={groupIllustration} alt="ScholarStack" className="w-[420px] max-w-full" />
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Start admissions
              <br />
              the smarter way
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-xl">
              Join 120+ institutions already managing admissions through
              ScholarStack. Track every applicant from draft to
              admitted—all from one dashboard.
            </p>
            <div className="mt-10 flex gap-5 flex-wrap">
              <Link
                to="/register-institution"
                className="bg-accent px-8 py-4 rounded-full text-white font-semibold hover:bg-accent-dark transition"
              >
                Register Now
              </Link>
              <Link
                to="/register"
                className="border border-white/30 px-8 py-4 rounded-full text-white font-semibold hover:bg-white hover:text-black transition"
              >
                Student Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { institutions, status } = useInstitutions();

  return (
    <div className="bg-white text-navy overflow-x-hidden">
      <PublicNav />
      <main>
        <Hero />
        <StatsBar />
        <InstitutionHighlights institutions={institutions} status={status} />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}