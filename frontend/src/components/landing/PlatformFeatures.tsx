import React from "react";
import {
  Target,
  BarChart3,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Compass,
} from "lucide-react";

export default function PlatformFeatures() {
  const features = [
    {
      icon: Target,
      title: "Goal-Driven Assessment Engine",
      tag: "Clinical Case Simulation",
      description:
        "Adaptive clinical vignettes covering Ayurvedic dosha diagnosis, Unani Mizaj analysis, Homoeopathic repertorization, and Siddha pulse pathology.",
      points: [
        "Scenario-based differential diagnosis",
        "Dynamic question difficulty calibration",
        "Instant clinical rationale explanations",
      ],
    },
    {
      icon: BarChart3,
      title: "Role-Specific Skill Gap Radar",
      tag: "Real-Time Telemetry",
      description:
        "Benchmark your individual competency against live market job postings: Clinical Research Associate, Panchakarma Consultant, or Herbal Formulation Chemist.",
      points: [
        "Multi-dimensional radar metrics",
        "Targeted score threshold requirements",
        "Automated bridging recommendations",
      ],
    },
    {
      icon: Compass,
      title: "7-Factor Opportunity Matcher",
      tag: "Explainable Matching AI",
      description:
        "Transparent multi-vector scoring analyzing verified competencies, discipline specialization, geographic mobility, clinical hours, and institutional criteria.",
      points: [
        "No black-box rejections with clear match percentages",
        "Breakdown by clinical and soft skills",
        "Direct one-click application submission",
      ],
    },
    {
      icon: BookOpen,
      title: "Curriculum Gap Intelligence",
      tag: "Academic Alignment",
      description:
        "Empowers faculty and institutional boards to pinpoint regulatory discrepancies between standard college curricula and active AYUSH clinical trials.",
      points: [
        "AYUSH-GCP and ICH compliance mapping",
        "Pharmacovigilance & research methodology gaps",
        "Actionable syllabus augmentation guides",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Verifiable Digital Passports",
      tag: "Audit-Ready Credentials",
      description:
        "Tamper-proof digital certificates issued upon assessment completion, featuring cryptographic hashes and instant QR verification for hospital HR.",
      points: [
        "QR code credential verification portal",
        "Downloadable audit-ready PDF dossiers",
        "Verified by industry and university mentors",
      ],
    },
    {
      icon: Zap,
      title: "Industry Training & FDP Bridges",
      tag: "Academia-Industry Collaboration",
      description:
        "Pharma-sponsored clinical trial apprenticeships, observational workshops, and faculty development programs directly accessible from your role console.",
      points: [
        "Direct supervisor competency endorsement",
        "Sponsored stipends and trial participation",
        "Accreditation-grade completion tracking",
      ],
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-[#fafafa] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>Architected for Precision</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            Six Autonomous Engines Powering the AYUSH Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            From granular patient diagnostic simulations to state-level university placement tracking, our integrated technology stack eliminates fragmentation across the traditional healthcare sector.
          </p>
        </div>

        {/* 6-Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[14px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-emerald-50 text-[#003c33] flex items-center justify-center group-hover:bg-[#003c33] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {f.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {f.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
