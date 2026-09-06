import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CareerArsenalSectionProps {
  activeRoleTitle: string;
  latestAttempt: any;
}

export default function CareerArsenalSection({
  activeRoleTitle,
  latestAttempt,
}: CareerArsenalSectionProps) {
  return (
    <div>
      <h2 className="font-heading font-medium text-xl sm:text-2xl text-slate-900 tracking-tight mb-4 pl-1">
        Your Career Arsenal
      </h2>

      <div className="arsenal-grid">
        {/* Card 1: Diagnostic Assessment Engine */}
        <div className="bg-[#003c33] rounded-[12px] p-5 sm:p-7 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden min-h-[200px] shadow-md border border-emerald-950/40 gap-5">
          <div className="relative z-10 flex-1 max-w-md">
            <div className="font-mono text-[10px] font-bold text-[#a4e797] tracking-wider uppercase">
              CAREER READINESS ENGINE
            </div>
            <h3 className="font-heading font-medium text-xl sm:text-2xl text-white mt-2 leading-tight">
              Goal-Driven Readiness Assessment
            </h3>
            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
              Take the 30-question diagnostic evaluating MCQs, clinical case studies, data tables &amp; dilemmas calibrated for {activeRoleTitle}.
            </p>

            <div className="mt-5 sm:mt-6">
              <Link
                href="/student/assessment"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-white text-[#003c33] hover:bg-emerald-50 font-bold text-xs shadow-xs transition w-full sm:w-auto"
              >
                <span>{latestAttempt ? "RETAKE ASSESSMENT" : "TAKE ASSESSMENT"}</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl p-2 shadow-sm border border-emerald-900/15 overflow-hidden flex items-center justify-center shrink-0 self-center sm:self-auto pointer-events-none">
            <img 
              src="/planner_student_left.png" 
              alt="Assessment Diagnostic Student" 
              className="w-full h-full object-contain rounded-xl" 
            />
          </div>
        </div>

        {/* Card 2: Personalized Learning Modules */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-6 flex flex-col justify-between min-h-[200px] shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="font-mono text-[10px] font-bold text-[#003c33] tracking-wider uppercase">
              TARGETED LEARNING
            </div>
            <h3 className="font-heading font-medium text-lg text-slate-900 mt-2">
              Personalized Modules
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Clinical programs prioritized by your highest point deficit to accelerate role readiness.
            </p>
          </div>
          <div className="mt-4">
            <Link href="/student/learning" className="nz-btn-quiz w-full rounded-[8px]">
              <span>OPEN LEARNING</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Industry Opportunity Matching */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-6 flex flex-col justify-between min-h-[200px] shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="font-mono text-[10px] font-bold text-[#1863dc] tracking-wider uppercase">
              INDUSTRY MATCHING
            </div>
            <h3 className="font-heading font-medium text-lg text-slate-900 mt-2">
              Matched Opportunities
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              7-factor explainable algorithm matching verified skills with top AYUSH clinics and pharma R&D.
            </p>
          </div>
          <div className="mt-4">
            <Link href="/student/opportunities" className="nz-btn-flashcards w-full rounded-[8px]">
              <span>BROWSE JOBS</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
