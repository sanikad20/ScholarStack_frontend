import { Link } from "react-router-dom";
import { Users, Building2, Layers, BookOpen, CalendarCheck, MousePointerClick, TrendingUp } from "lucide-react";
import PublicNav from "../../components/layout/PublicNav";
import Footer from "../../components/layout/Footer";
import useInstitutions from "../../hooks/useInstitutions";

const STATS = [
  { icon: Users, value: "67.1k", label: "Students" },
  { icon: Building2, value: "120+", label: "Institutions live" },
  { icon: Layers, value: "6", label: "Stage review pipeline" },
  { icon: BookOpen, value: "40", label: "Course listings" },
];

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Register",
    body: "Create an account, verify email, institution auto-detected.",
  },
  {
    icon: MousePointerClick,
    title: "Apply",
    body: "Browse courses, fill the form, save drafts, upload documents.",
  },
  {
    icon: TrendingUp,
    title: "Track",
    body: "Watch status move from submitted to admitted, with notifications.",
  },
];

// Palette used to give each institution card a distinct illustrated "photo" look
const CARD_THEMES = [
  { from: "#EDEBFB", to: "#C9C4F2", shape: "#6C63D6" },
  { from: "#FCE7E1", to: "#F2B8A6", shape: "#D9704F" },
  { from: "#E0F0EC", to: "#A9D6C8", shape: "#3E8E76" },
  { from: "#FDF1DA", to: "#F1D08F", shape: "#C99A2E" },
];

function Hero() {
  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 py-14 md:py-20 items-center">
        <div>
          <h1 className="font-bold text-[34px] md:text-[40px] leading-[1.15] text-navy max-w-md">
            Every application, tracked from draft to admitted.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-navySoft max-w-sm">
            ScholarStack gives students one place to apply across
            institutions, and gives admissions teams one place to review,
            verify, and decide — without the spreadsheet chaos.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-semibold text-white bg-accent hover:bg-accent-dark px-5 py-2.5 rounded-full transition-colors"
            >
              Start Application
            </Link>
            <Link
              to="/for-institutions"
              className="inline-flex items-center text-sm font-semibold text-accent border border-accent/40 hover:bg-accent/5 px-5 py-2.5 rounded-full transition-colors"
            >
              Browse Institution
            </Link>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 320" className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* laptop base */}
      <ellipse cx="210" cy="290" rx="150" ry="14" fill="#F2F2F5" />
      <rect x="90" y="150" width="240" height="130" rx="10" fill="#2E4BD1" />
      <rect x="105" y="163" width="210" height="90" rx="4" fill="#EAF0FF" />
      <rect x="130" y="180" width="90" height="10" rx="3" fill="#B9CBFA" />
      <rect x="130" y="198" width="140" height="8" rx="3" fill="#D3DEFB" />
      <rect x="130" y="213" width="110" height="8" rx="3" fill="#D3DEFB" />

      {/* open book */}
      <path d="M60 230 L150 210 L150 260 L60 280 Z" fill="#FFFFFF" stroke="#E2E2EA" strokeWidth="1.5" />
      <path d="M150 210 L240 230 L240 280 L150 260 Z" fill="#FFFFFF" stroke="#E2E2EA" strokeWidth="1.5" />
      <path d="M70 235 L140 220" stroke="#D8D8E4" strokeWidth="2" />
      <path d="M70 248 L140 234" stroke="#D8D8E4" strokeWidth="2" />

      {/* trophy */}
      <circle cx="330" cy="120" r="26" fill="#FFC94A" />
      <path d="M318 108h24v20a12 12 0 01-24 0z" fill="#FFA412" />
      <rect x="325" y="128" width="10" height="14" fill="#FFA412" />
      <rect x="315" y="142" width="30" height="8" rx="2" fill="#E88A00" />

      {/* grad cap */}
      <g transform="translate(180,70)">
        <polygon points="40,0 80,16 40,32 0,16" fill="#2E4BD1" />
        <rect x="34" y="16" width="12" height="18" fill="#1E2E8F" />
        <circle cx="76" cy="16" r="3" fill="#1E2E8F" />
      </g>

      {/* small figures */}
      <g transform="translate(30,190)">
        <circle cx="14" cy="14" r="10" fill="#FFB199" />
        <rect x="4" y="24" width="20" height="34" rx="6" fill="#FF5A3C" />
      </g>
      <g transform="translate(360,190)">
        <circle cx="14" cy="14" r="10" fill="#FBD48A" />
        <rect x="4" y="24" width="20" height="34" rx="6" fill="#2E4BD1" />
      </g>

      {/* clock accent */}
      <circle cx="345" cy="70" r="14" fill="#FFC94A" />
      <path d="M345 63v8l6 4" stroke="#8A5A00" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StatsBar() {
  return (
    <div className="bg-peachTint py-7">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-none">
                <Icon size={16} className="text-accent" />
              </div>
              <div>
                <div className="font-bold text-lg text-navy leading-none">{value}</div>
                <div className="text-xs text-navySoft mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    <div className="rounded-xl overflow-hidden border border-black/5 group cursor-pointer">
      <div
        className="h-32 relative flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <svg viewBox="0 0 100 60" className="w-20 h-14 opacity-90">
          <rect x="15" y="24" width="70" height="30" fill={theme.shape} />
          <polygon points="50,6 12,24 88,24" fill={theme.shape} />
          <rect x="30" y="34" width="8" height="20" fill={theme.to} />
          <rect x="46" y="34" width="8" height="20" fill={theme.to} />
          <rect x="62" y="34" width="8" height="20" fill={theme.to} />
        </svg>
      </div>
      <div className="p-3 bg-white">
        <div className="text-sm font-semibold text-navy truncate">
          {institution.name ?? initials}
        </div>
        <div className="text-xs text-navySoft mt-0.5">
          {institution.address ?? institution.subdomain ?? ""}
        </div>
      </div>
    </div>
  );
}

function InstitutionHighlights({ institutions, status }) {
  return (
    <div className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-bold text-2xl text-navy">Institution highlights</h2>
          <p className="text-sm text-navySoft mt-1">
            A sample of institutions currently accepting applications through
            ScholarStack this session.
          </p>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-black/5 animate-pulse">
                <div className="h-32 bg-black/5" />
                <div className="p-3 bg-white">
                  <div className="h-3.5 w-2/3 bg-black/10 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-black/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-black/5 p-10 text-center text-sm text-navySoft">
            Couldn't load institutions right now. Try refreshing the page.
          </div>
        )}

        {status === "success" && institutions.length === 0 && (
          <div className="rounded-xl border border-black/5 p-10 text-center text-sm text-navySoft">
            No institutions are open for applications yet.
          </div>
        )}

        {status === "success" && institutions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {institutions.slice(0, 4).map((inst, i) => (
              <InstitutionCard
                key={inst.id ?? inst._id ?? inst.subdomain}
                institution={inst}
                theme={CARD_THEMES[i % CARD_THEMES.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div id="how-it-works" className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="border border-black/10 rounded-2xl px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="font-bold text-2xl text-navy">How it works</h2>
            <p className="text-sm text-navySoft mt-1">
              Three steps from registration to a tracked decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative text-center">
                  {i > 0 && (
                    <svg
                      className="hidden md:block absolute top-6 -left-9 w-16 h-6"
                      viewBox="0 0 64 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2 12 Q32 -6 60 10" stroke="#3B6FE0" strokeWidth="1.4" fill="none" strokeDasharray="3 3" />
                      <path d="M54 5 L61 10 L53 13" stroke="#3B6FE0" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="w-12 h-12 rounded-full bg-skyAccent/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-skyAccent" />
                  </div>
                  <h3 className="text-base font-semibold text-navy mb-1.5">{step.title}</h3>
                  <p className="text-[13.5px] text-navySoft leading-relaxed max-w-[220px] mx-auto">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CtaBand() {
  return (
    <div className="bg-navy py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <svg viewBox="0 0 200 160" className="w-48 flex-none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="70" width="140" height="70" rx="8" fill="#2E4BD1" />
            <rect x="42" y="82" width="116" height="46" rx="4" fill="#EAF0FF" />
            <rect x="55" y="92" width="60" height="8" rx="3" fill="#B9CBFA" />
            <rect x="55" y="106" width="80" height="6" rx="3" fill="#D3DEFB" />
            <circle cx="150" cy="40" r="20" fill="#FFC94A" />
            <path d="M150 32v10l7 5" stroke="#8A5A00" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-bold text-[26px] text-white mb-2.5">
              Start admissions the smarter way
            </h2>
            <p className="text-sm text-white/60 max-w-md mb-6 leading-relaxed mx-auto md:mx-0">
              Join 120+ institutions already managing applications with
              ScholarStack — track every applicant from draft to admitted,
              with zero spreadsheets.
            </p>
            <Link
              to="/register-institution"
              className="inline-flex items-center text-sm font-semibold text-white bg-accent hover:bg-accent-dark px-6 py-3 rounded-full transition-colors"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { institutions, status } = useInstitutions();

  return (
    <div className="bg-white text-navy">
      <PublicNav />
      <Hero />
      <StatsBar />
      <InstitutionHighlights institutions={institutions} status={status} />
      <HowItWorks />
      <CtaBand />
      <Footer />
    </div>
  );
}
