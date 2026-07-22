import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Layers,
  BookOpen,
  FormInput,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  Bell,
  Lock,
} from "lucide-react";

import PublicNav from "../../components/layout/PublicNav";
import Footer from "../../components/layout/Footer";

import heroIllustration from "../../assets/hero-illustration.png";
import groupIllustration from "../../assets/Group(1).png";

const STATS = [
  { icon: Users, value: "67.1k", label: "Students" },
  { icon: Building2, value: "120+", label: "Institutions Live" },
  { icon: Layers, value: "6", label: "Stages in pipeline" },
  { icon: BookOpen, value: "40", label: "course listings" },
];

const FEATURES = [
  {
    icon: FormInput,
    title: "Dynamic form builder",
    description: "Build a different application form per course — 7 field types, drag to reorder, mark fields required."
  },
  {
    icon: ShieldCheck,
    title: "Centralized review",
    description: "Filter and sort every application by status, course, or category, and approve or reject documents individually."
  },
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description: "See total, pending, verified, and rejected counts at a glance, plus applications broken down by course."
  },
  {
    icon: UserCheck,
    title: "Auto-classification",
    description: "Applicants are automatically classified — high merit, eligible, reserved category — the moment they submit."
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and in-app alerts fire automatically at every status change, or send a batch update to a group."
  },
  {
    icon: Lock,
    title: "Tenant isolation",
    description: "Every query is scoped to your institution. Your applicant data never mixes with another institution's."
  }
];

const WRAP = "max-w-7xl mx-auto px-6 lg:px-10";

export default function ForInstitutions() {
  return (
    <div className="bg-white text-navy overflow-x-hidden min-h-screen flex flex-col">
      <PublicNav />
      
      <main className="flex-1 mt-20">
        {/* HERO SECTION */}
        <section className="py-20 lg:py-24">
          <div className={WRAP}>
            <div className="grid lg:grid-cols-2 items-center gap-12">
              <div>
                <h1 className="text-5xl lg:text-[56px] leading-[1.1] font-bold text-navy font-sans tracking-tight">
                  Run admissions for your institution, without the spreadsheets.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-gray-500 max-w-xl">
                  One console to manage courses, build application forms, review documents, and track every applicant from submitted to admitted with full tenant isolation for your institution's data.
                </p>
                <div className="flex gap-4 mt-8">
                  <Link
                    to="/register-institution"
                    className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-semibold transition duration-200"
                  >
                    Register Your Institution
                  </Link>
                  <Link
                    to="/admin-login"
                    className="border-2 border-accent text-accent hover:bg-accent/5 px-8 py-4 rounded-full font-semibold transition duration-200"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <img
                  src={heroIllustration}
                  alt="ScholarStack Hero"
                  className="w-full max-w-[550px] object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section className="bg-[#FFF3EA] py-10">
          <div className={WRAP}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 py-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Icon className="text-accent" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy">{value}</h3>
                    <p className="text-xs text-gray-500 font-medium capitalize">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES LIST */}
        <section className="py-24">
          <div className={WRAP}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <h2 className="text-4xl font-bold text-navy">Everything admissions needs</h2>
              </div>
              <div className="text-navySoft font-sans text-sm md:text-base max-w-md md:text-right">
                From course setup to final decision, in one console.
              </div>
            </div>

           
            <div className="flex flex-col gap-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 bg-white"
                >
                  {/* Purple solid number box like Figma */}
                  <div className="w-10 h-10 rounded-lg bg-[#5C55EC] flex items-center justify-center shrink-0 text-white font-bold text-base font-sans">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1.5">{title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
         </section>
       
        <section className="bg-[#171823] py-20 text-white">
          <div className={WRAP}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={groupIllustration}
                  alt="Modernize Admissions"
                  className="w-[360px] max-w-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-4xl lg:text-[40px] font-bold leading-tight">
                  Ready to modernize your admissions?
                </h2>
                <p className="mt-4 text-base text-gray-300 max-w-lg leading-relaxed">
                  Register your institution in minutes and start accepting applications with a system built for your team.
                </p>
                <div className="mt-8">
                  <Link
                    to="/register-institution"
                    className="inline-flex justify-center items-center bg-accent hover:bg-accent-dark text-white font-semibold rounded-full px-8 py-4 transition duration-200"
                  >
                    Register Institution
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
