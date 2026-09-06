import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  Microscope,
  Landmark,
} from "lucide-react";

export default function LandingCta() {
  return (
    <section className="py-20 bg-[#003c33] text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-mono mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Instant One-Click Sandbox Available</span>
        </div>

        <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
          Ready to Elevate Clinical Competency in the AYUSH Ecosystem?
        </h2>

        <p className="text-sm sm:text-base text-emerald-100/80 mt-4 max-w-2xl mx-auto leading-relaxed">
          Join thousands of practitioners, research institutes, and pharmaceutical enterprises transforming AYUSH healthcare through verifiable skill intelligence.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[8px] bg-white text-[#003c33] hover:bg-emerald-50 text-xs sm:text-sm font-bold transition shadow-md hover:shadow-lg active:translate-y-[0.5px] cursor-pointer"
          >
            <span>Launch AYUSHAI Workspace</span>
            <ArrowRight className="w-4 h-4 text-[#003c33]" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[8px] border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            <span>Sign In to Your Account</span>
          </Link>
        </div>

        {/* Quick Demo Pre-fill Links */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-300/80 mb-3">
            Instant Demo Logins Available On Sign-In:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { role: "Student", icon: GraduationCap, email: "student@demo.com" },
              { role: "Industry", icon: Building2, email: "industry@demo.com" },
              { role: "Faculty", icon: Microscope, email: "faculty@demo.com" },
              { role: "Institution", icon: Landmark, email: "admin@demo.com" },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.role}
                  href="/login"
                  className="px-3 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-white transition flex items-center gap-2"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="font-semibold">{d.role}</span>
                  <span className="text-[10px] text-emerald-200/70 font-mono">({d.email})</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
