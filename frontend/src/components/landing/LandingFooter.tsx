import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-[#17171c] text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Overview (Spans 2 on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  background: "#003c33",
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                A
              </div>
              <div>
                <div className="font-heading font-semibold text-base text-white leading-none">
                  AYUSHAI
                </div>
                <div className="text-[9px] font-mono tracking-wider uppercase text-emerald-400 font-semibold mt-0.5">
                  Skill Intelligence Platform
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The standardized clinical skill taxonomy and academia–industry bridge for traditional healthcare systems. Supporting evidence-based medicine, clinical trials, and verified healthcare recruitment across India.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>All AYUSHAI Core Services Operational</span>
            </div>
          </div>

          {/* Col 2: Stakeholder Portals */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-200">
              Stakeholder Portals
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Scholars & Graduates
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Industry & Pharma Labs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Faculty & Mentors
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Institutions & Councils
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Credential Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Traditional Disciplines */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-200">
              Disciplines
            </div>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">Ayurveda</span>
                <span className="text-[10px] text-slate-500 block">BAMS, MD/MS (Ayu)</span>
              </li>
              <li>
                <span className="text-slate-300">Yoga & Naturopathy</span>
                <span className="text-[10px] text-slate-500 block">BNYS, MD (Yoga)</span>
              </li>
              <li>
                <span className="text-slate-300">Unani Medicine</span>
                <span className="text-[10px] text-slate-500 block">BUMS, MD (Unani)</span>
              </li>
              <li>
                <span className="text-slate-300">Siddha System</span>
                <span className="text-[10px] text-slate-500 block">BSMS, MD (Siddha)</span>
              </li>
              <li>
                <span className="text-slate-300">Homoeopathy</span>
                <span className="text-[10px] text-slate-500 block">BHMS, MD (Hom)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Frameworks & Standards */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-200">
              Regulatory Standards
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ministry of AYUSH GCP</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>AICTE Skill Taxonomy</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NAAC Criteria 1 & 2</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NSQF Level 7 Aligned</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NEP 2020 Multi-Disciplinary</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} AYUSHAI Platform. Developed for the National AYUSH Skill & Academia–Industry Initiative.
          </div>
          <div className="flex items-center gap-1">
            <span>Architected with modern web design standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
