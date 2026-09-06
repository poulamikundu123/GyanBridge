import React from "react";
import Link from "next/link";

interface LearningSnapshotGridProps {
  isFreshUser: boolean;
  readinessPercentage: number;
  verifiedStrengthsCount: number;
  skillGapsCount: number;
  applicationsCount: number;
}

export default function LearningSnapshotGrid({
  isFreshUser,
  readinessPercentage,
  verifiedStrengthsCount,
  skillGapsCount,
  applicationsCount,
}: LearningSnapshotGridProps) {
  return (
    <div>
      <h2 className="font-heading font-medium text-xl sm:text-2xl text-slate-900 tracking-tight mb-4 pl-1">
        Your Learning Snapshot
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Goal */}
        <div className="bg-[#17171c] rounded-[12px] p-5 sm:p-6 text-white min-h-[140px] flex flex-col justify-between shadow-xs border border-slate-800">
          <div className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight leading-none">
            {isFreshUser ? "0%" : `${readinessPercentage}%`}
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-[#a4e797] uppercase">
              CAREER READINESS
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Calibrated against industry benchmark.
            </div>
          </div>
        </div>

        {/* Card 2: Verified Strengths */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-5 sm:p-6 min-h-[140px] flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
              {String(verifiedStrengthsCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-emerald-700 uppercase mt-2">
              VERIFIED STRENGTHS
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Assessed competencies meeting standard.
            </div>
          </div>
          <Link
            href="/student/skills"
            className="text-xs font-bold text-[#003c33] hover:text-[#044e43] mt-2 inline-flex items-center gap-1"
          >
            EXPLORE →
          </Link>
        </div>

        {/* Card 3: Skill Gaps */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-5 sm:p-6 min-h-[140px] flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
              {String(skillGapsCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-red-600 uppercase mt-2">
              SKILL GAPS
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Priority deficits to bridge for target.
            </div>
          </div>
          <Link
            href="/student/learning"
            className="text-xs font-bold text-[#003c33] hover:text-[#044e43] mt-2 inline-flex items-center gap-1"
          >
            LEARN →
          </Link>
        </div>

        {/* Card 4: Applications */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-5 sm:p-6 min-h-[140px] flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
              {String(applicationsCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-amber-600 uppercase mt-2">
              ACTIVE PIPELINE
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Industry hiring pipeline & applications.
            </div>
          </div>
          <Link
            href="/student/applications"
            className="text-xs font-bold text-[#003c33] hover:text-[#044e43] mt-2 inline-flex items-center gap-1"
          >
            TRACK →
          </Link>
        </div>
      </div>
    </div>
  );
}
