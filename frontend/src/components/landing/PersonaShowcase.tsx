"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Microscope,
  Landmark,
  CheckCircle2,
  ArrowRight,
  Target,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";

type PersonaKey = "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";

interface PersonaData {
  key: PersonaKey;
  label: string;
  badge: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  demoEmail: string;
  benefits: string[];
  metrics: { label: string; value: string }[];
  primaryAction: string;
}

const personas: Record<PersonaKey, PersonaData> = {
  STUDENT: {
    key: "STUDENT",
    label: "Scholars & Students",
    badge: "Clinical Diagnostic & Career Acceleration",
    icon: GraduationCap,
    headline: "Diagnose Clinical Competency & Unlock Tailored Industry Placements",
    description:
      "Benchmark your differential diagnosis, pharmacological formulation, and research protocol skills against live clinical trial and hospital demands. Get personalized learning bridges and explainable job matching.",
    image: "/quiz_focus_thinker.png",
    imageAlt: "AYUSH Student Assessment & Diagnostics",
    imageCaption: "Adaptive Clinical Case Simulation & Real-time Gap Scoring",
    demoEmail: "student@demo.com",
    benefits: [
      "Adaptive Case Diagnostics: Simulating patient scenarios across 5 AYUSH systems",
      "Dynamic Role-Specific Radar: Measuring fit against Clinical Research Associate, Formulation Scientist & more",
      "Explainable 7-Factor Matching: Know exactly why an opportunity matches your clinical profile",
      "Tamper-Proof Credential Passports: Verifiable digital skill badges accepted by top pharma",
    ],
    metrics: [
      { label: "Average Skill Boost", value: "+38%" },
      { label: "Active Roles", value: "350+ Clinical Jobs" },
      { label: "Assessment Time", value: "15 Mins" },
    ],
    primaryAction: "Explore Scholar Experience",
  },
  INDUSTRY: {
    key: "INDUSTRY",
    label: "Industry & Healthcare",
    badge: "Pre-Verified Talent & Trial Recruitment",
    icon: Building2,
    headline: "Recruit Certified Clinical Researchers with Zero Resume Guesswork",
    description:
      "Access pre-assessed AYUSH graduates with verified diagnostic, regulatory (AYUSH-GCP), and formulation competencies. Post observational trials, clinical internships, and industry-sponsored training programs with live applicant scoring.",
    image: "/study_character.jpg",
    imageAlt: "Industry Clinical Talent Matching",
    imageCaption: "Automated 7-Factor Candidate Scoring & Endorsement Workflow",
    demoEmail: "industry@demo.com",
    benefits: [
      "7-Factor Talent Scoring: Instant filtering by clinical proficiency, degree, location, and AYUSH-GCP readiness",
      "Direct Opportunity Broadcasting: Publish clinical trials, research associate, and manufacturing QA positions",
      "Industry-Sponsored Training: Launch corporate certification tracks and build your dedicated talent pipeline",
      "One-Click Endorsements: Validate student clinical skills directly on their public profile",
    ],
    metrics: [
      { label: "Hiring Efficiency", value: "4x Faster" },
      { label: "Candidate Verification", value: "100% Validated" },
      { label: "Partner Network", value: "450+ Hospitals" },
    ],
    primaryAction: "Explore Industry Portal",
  },
  FACULTY: {
    key: "FACULTY",
    label: "Faculty & Mentors",
    badge: "Curriculum Analytics & Mentorship",
    icon: Microscope,
    headline: "Align Academic Curricula with Live Pharmaceutical & Research Needs",
    description:
      "Identify syllabus competency gaps against modern clinical guidelines. Mentor students on niche clinical specializations, monitor cohort readiness, and participate in industry-sponsored faculty development programs (FDP).",
    image: "/flashcard_thinking_character.png",
    imageAlt: "Faculty Mentorship & Curriculum Analytics",
    imageCaption: "Live Curriculum vs Industry Competency Matrix",
    demoEmail: "faculty@demo.com",
    benefits: [
      "Curriculum Gap Radar: Spot emerging market demands (e.g. Pharmacovigilance, AYUSH Clinical Trials) missing from syllabi",
      "Cohort Competency Dashboards: Track aggregate student performance across departments and semesters",
      "Mentorship Matching Engine: Connect with high-potential students seeking clinical thesis guidance",
      "Institutional Accreditation Data: Export NAAC/NIRF-ready evidence of industry-academia collaboration",
    ],
    metrics: [
      { label: "Curriculum Insights", value: "18 Gap Vectors" },
      { label: "Mentorship Ratio", value: "1:1 Structured" },
      { label: "FDP Programs", value: "40+ Available" },
    ],
    primaryAction: "Explore Faculty Portal",
  },
  INSTITUTION: {
    key: "INSTITUTION",
    label: "Institutions & Councils",
    badge: "Accreditation & Employment Analytics",
    icon: Landmark,
    headline: "State-Wide Institutional Benchmarking & NIRF/NAAC Readiness",
    description:
      "Empower vice-chancellors, deans, and state AYUSH councils with macro-level placement telemetry, syllabus modernization tracking, multi-campus performance comparison, and regulatory compliance oversight.",
    image: "/planner_exact_character.png",
    imageAlt: "Institutional Placement & Council Governance",
    imageCaption: "Multi-Discipline Macro Telemetry & Accreditation Readiness",
    demoEmail: "admin@demo.com",
    benefits: [
      "Macro Employment Dashboards: Real-time tracking of placement percentages, clinical trial appointments, and compensation trends",
      "State-Level Benchmarking: Compare student competencies across Ayurveda, Unani, Siddha, Homoeopathy, and Naturopathy",
      "Curriculum Accreditation Reports: One-click generation of NAAC Criteria 1 & Criteria 2 evidence dossiers",
      "Strategic Industry Partnerships: Oversee institutional MoUs, clinical site approvals, and grant opportunities",
    ],
    metrics: [
      { label: "Placement Tracking", value: "Real-Time" },
      { label: "Accreditation Readiness", value: "NAAC Criteria Aligned" },
      { label: "Data Export", value: "Audit-Ready PDF" },
    ],
    primaryAction: "Explore Institution Portal",
  },
};

export default function PersonaShowcase() {
  const [activeTab, setActiveTab] = useState<PersonaKey>("STUDENT");
  const activeData = personas[activeTab];

  return (
    <section id="personas" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Four Pillars of the Platform</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            Designed for Every Stakeholder in the AYUSH Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            Whether you are an aspiring Ayurvedic doctor, a pharmaceutical research director, a professor, or a university dean — AYUSHAI provides custom intelligence tailored to your operational mission.
          </p>
        </div>

        {/* 4 Interactive Persona Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-10 p-1.5 bg-slate-100/90 rounded-[12px] border border-slate-200">
          {(Object.keys(personas) as PersonaKey[]).map((key) => {
            const item = personas[key];
            const Icon = item.icon;
            const isSelected = activeTab === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`py-3 px-3 rounded-[9px] text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#003c33] text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-300" : "text-slate-500"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Persona Content Card */}
        <div className="bg-[#fafafa] border border-slate-200 rounded-[16px] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100/80 text-[#003c33] text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{activeData.badge}</span>
              </div>

              <h3 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight leading-snug">
                {activeData.headline}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeData.description}
              </p>

              {/* Benefit Bullets */}
              <div className="space-y-3 pt-2">
                {activeData.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Persona Key Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
                {activeData.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-[8px] bg-white border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{m.label}</div>
                    <div className="font-heading text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#003c33] hover:bg-[#002c25] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <span>{activeData.primaryAction}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                </Link>
                <span className="text-[11px] font-mono text-slate-500">
                  Quick demo: <span className="font-semibold text-slate-700">{activeData.demoEmail}</span>
                </span>
              </div>
            </div>

            {/* Right Graphic Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
                  <img
                    src={activeData.image}
                    alt={activeData.imageAlt}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 w-full text-center p-2 rounded-[6px] bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-mono text-slate-600 font-medium">
                    {activeData.imageCaption}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
