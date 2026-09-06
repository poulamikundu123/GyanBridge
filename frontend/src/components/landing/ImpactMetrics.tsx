import React from "react";
import {
  Layers,
  Target,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export default function ImpactMetrics() {
  const metrics = [
    {
      value: "5 / 5",
      label: "Traditional AYUSH Systems",
      detail: "Full taxonomy for Ayurveda, Yoga, Unani, Siddha & Homoeopathy",
      icon: Layers,
    },
    {
      value: "7 Vectors",
      label: "Multi-Factor Match Engine",
      detail: "Objective scoring: Proficiency, domain, hours, timing & stipend",
      icon: Target,
    },
    {
      value: "100%",
      label: "Explainable Gap Telemetry",
      detail: "Transparent competency breakdown with zero black-box scoring",
      icon: BarChart3,
    },
    {
      value: "4 Portals",
      label: "Unified Stakeholder Nodes",
      detail: "Interconnected Scholar, Industry, Faculty & Council consoles",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="metrics" className="py-20 bg-[#fafafa] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>Empirical Platform Architecture</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            Standardized Skill Taxonomy & Algorithmic Foundations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            Eliminating skill ambiguity with empirical competency benchmarks, standardized clinical taxonomy, and verifiable credentials conforming to national healthcare guidelines.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[14px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition text-center flex flex-col items-center"
              >
                <div className="w-11 h-11 rounded-[10px] bg-emerald-50 text-[#003c33] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  {m.value}
                </div>
                <div className="font-heading text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-sans">
                  {m.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Assurance Box */}
        <div className="mt-12 p-6 rounded-[12px] bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Full Alignment with Ministry of AYUSH & National Education Policy (NEP 2020)
              </div>
              <div className="text-[11px] text-slate-500">
                Standardized diagnostic taxonomy and digital verifiable credentials conforming to National Skill Qualification Framework (NSQF).
              </div>
            </div>
          </div>
          <div className="shrink-0 font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-[6px] border border-emerald-200">
            Govt. Framework Ready
          </div>
        </div>
      </div>
    </section>
  );
}
