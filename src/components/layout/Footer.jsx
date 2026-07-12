import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, ChevronDown } from "lucide-react";

const COLUMNS = [
  {
    title: "Top 4 Category",
    links: ["Development", "Finance & Accounting", "Design", "Business"],
  },
  {
    title: "Quick Links",
    links: ["About", "Become Institution", "Contact", "Career"],
  },
  {
    title: "Support",
    links: ["Help Center", "FAQs", "Terms & Condition", "Privacy Policy"],
  },
];

export default function Footer() {
  return (
    <div className="border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-[17px] text-navy">ScholarStack</span>
            </Link>
            <p className="text-sm text-navySoft leading-relaxed max-w-[240px] mb-5">
              One place for every institution to run admissions, and every
              student to apply.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    i === 1 ? "bg-accent text-white" : "bg-black/[0.04] text-navySoft hover:bg-black/[0.08]"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-navySoft mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-navy/80 hover:text-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navySoft mb-4">
              Download Our App
            </div>
            <div className="flex flex-col gap-2.5">
              <button className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2">
                <div className="text-left">
                  <div className="text-[9px] text-navySoft leading-none">Download now</div>
                  <div className="text-xs font-semibold text-navy leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2">
                <div className="text-left">
                  <div className="text-[9px] text-navySoft leading-none">Download now</div>
                  <div className="text-xs font-semibold text-navy leading-tight">Play Store</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-black/5">
          <div className="text-xs text-navySoft">© 2026 ScholarStack. All rights reserved.</div>
          <button className="flex items-center gap-1.5 text-xs text-navy border border-black/10 rounded-md px-3 py-1.5">
            English
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
