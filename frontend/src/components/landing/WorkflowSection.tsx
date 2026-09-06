import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, BarChart3, Award, Sparkles } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      num: "01",
      icon: Target,
      title: "Benchmark Clinical Competencies",
      subtitle: "Diagnostic Baseline",
      desc: "Scholars take adaptive, timed clinical simulations in Ayurveda, Unani, Siddha, Homoeopathy, or Yoga. The system measures diagnostic accuracy, pharmacological rationale, and protocol adherence.",
      badge: "15-Minute Adaptive Assessment",
    },
    {
      num: "02",
      icon: BarChart3,
      title: "Bridge Role-Specific Skill Gaps",
      subtitle: "Dynamic Learning Bridges",
      desc: "The platform generates your real-time Skill Gap Radar mapped against target roles (e.g., Clinical Research Associate). Complete micro-modules, mentor office hours, and sponsored industry training.",
      badge: "Targeted Competency Radar",
    },
    {
      num: "03",
      icon: Award,
      title: "Unlock 7-Factor Matched Opportunities",
      subtitle: "Verified Placement",
      desc: "Top herbal manufacturers, clinical research organizations, and AYUSH hospitals discover pre-screened talent with tamper-proof digital passports. Apply with one click with complete transparency.",
      badge: "Explainable Match Scoring",
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>End-to-End Operational Pipeline</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            How the AYUSH Skill Intelligence Pipeline Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            A continuous closed-loop cycle connecting classroom education, personalized skill acceleration, and accredited industry employment.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-[16px] border border-slate-200 bg-[#fafafa] p-6 sm:p-7 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-bold text-2xl text-emerald-800/40">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-[10px] bg-[#003c33] text-white flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {step.subtitle}
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-[#003c33]">
                  <span>Step {step.num} Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-[#003c33] hover:bg-[#002c25] text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
          >
            <span>Start Your Diagnostic Assessment</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
