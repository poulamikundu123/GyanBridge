import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Award,
  Target,
  BarChart3,
  ShieldCheck,
  LogIn,
} from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40">
      {/* Background Decorative Grids */}
      <div className="absolute inset-0 nz-grid-bg opacity-70 pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-teal-50/70 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* National Framework Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-medium shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>National Skill Readiness Grid · Ayush Academia-Industry Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.15]">
              The Unified Skill Intelligence Layer for the{" "}
              <span className="text-[#003c33] underline decoration-emerald-500 underline-offset-4 decoration-2">
                AYUSH
              </span>{" "}
              Healthcare Ecosystem.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Bridge the critical divide between AYUSH academic curricula and pharmaceutical & clinical industry demand.
              Empowering students with adaptive diagnostic assessments, faculty with real-time syllabus gap analytics,
              and healthcare enterprises with 7-factor explainable talent matching.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] bg-[#003c33] hover:bg-[#002c25] text-white text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow-md active:translate-y-[0.5px] cursor-pointer"
              >
                <span>Sign In / Login</span>
                <LogIn className="w-4 h-4 text-emerald-300" />
              </Link>
              <a
                href="#personas"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[8px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                <span>Explore 4 Ecosystem Pillars</span>
              </a>
            </div>

            {/* Credibility / Key Signals */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AICTE & AYUSH Aligned</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>7-Factor Matching Logic</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verifiable Digital Passports</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Card with study_character.jpg */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-[16px] border border-slate-200 bg-white p-3 sm:p-4 shadow-xl">
              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase font-semibold text-slate-700">
                    Live Readiness Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AYUSH-GCP Verified
                </span>
              </div>

              {/* Media Container with framed study_character.jpg */}
              <div className="relative mt-3 rounded-[12px] overflow-hidden border border-slate-100 bg-[#ffffff] shadow-inner">
                <img
                  src="/study_character.jpg"
                  alt="AYUSH Student Clinical Benchmark"
                  className="w-full h-52 sm:h-56 object-contain"
                />
                {/* Floating telemetry chips */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-[6px] bg-[#003c33]/90 text-emerald-200 text-[10px] font-mono backdrop-blur-xs border border-emerald-500/20 shadow-sm flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-emerald-300" />
                  <span>National Skill Readiness: 94.2%</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-[6px] bg-white/95 text-slate-800 text-[10px] font-medium backdrop-blur-xs border border-slate-200 shadow-sm flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-emerald-600" />
                  <span>Clinical Trials Specialist</span>
                </div>
              </div>

              {/* Bottom Quick Metric Highlights */}
              <div className="grid grid-cols-2 gap-2.5 mt-3 pt-1">
                <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Diagnostic Score</div>
                  <div className="font-heading text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                    <span>91 / 100</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-normal">Top 3%</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">Industry Matches</div>
                  <div className="font-heading text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                    <span>14 Clinical Roles</span>
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>
              </div>
              {/* 7-Factor Engine Strip */}
              <div className="mt-2.5 p-2.5 rounded-[8px] bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      7-Factor Opportunity Engine
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Real-time matching across 450+ hospitals
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 AYUSH Systems Strip */}
        <div id="ecosystem" className="mt-16 pt-8 border-t border-slate-200/80">
          <div className="text-center text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-4 font-semibold">
            Unified Across the Five Traditional Health Disciplines
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-700">
            {[
              { name: "Ayurveda", desc: "Dravyaguna & Panchakarma" },
              { name: "Yoga & Naturopathy", desc: "Preventive Therapeutics" },
              { name: "Unani", desc: "Ilaj-bil-Tadbeer & Regimenal" },
              { name: "Siddha", desc: "Gunapadam & Toxicology" },
              { name: "Homoeopathy", desc: "Organon & Repertory" },
            ].map((system) => (
              <div
                key={system.name}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white/80 shadow-2xs hover:border-emerald-300 hover:text-[#003c33] transition flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-heading">{system.name}</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  ({system.desc})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
