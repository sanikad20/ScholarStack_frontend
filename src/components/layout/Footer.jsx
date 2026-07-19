import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, ChevronDown } from "lucide-react";

const COLUMNS = [
  { title: "Top 4 Category", links: ["Development", "Finance & Accounting", "Design", "Business"] },
  { title: "Quick Links", links: ["About", "Become Institution", "Contact", "Career"] },
  { title: "Support", links: ["Help Center", "FAQs", "Terms & Condition", "Privacy Policy"] },
];

export default function Footer() {
  return (
    <div className="bg-[#1E2128] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-[17px] text-white">ScholarStack</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-[240px] mb-5">
              One ledger for every application — from student sign-up to final decision.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    i === 1 ? "bg-accent text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40 mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40 mb-4">
              Download Our App
            </div>
            <div className="flex flex-col gap-2.5">
              <button className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/10 transition">
                <div className="text-left">
                  <div className="text-[9px] text-white/50 leading-none">Download now</div>
                  <div className="text-xs font-semibold text-white leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/10 transition">
                <div className="text-left">
                  <div className="text-[9px] text-white/50 leading-none">Download now</div>
                  <div className="text-xs font-semibold text-white leading-tight">Play Store</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-white/10">
          <div className="text-xs text-white/40">© 2026 ScholarStack. All rights reserved.</div>
          <button className="flex items-center gap-1.5 text-xs text-white/60 border border-white/20 rounded-md px-3 py-1.5 hover:bg-white/10 transition">
            English
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}