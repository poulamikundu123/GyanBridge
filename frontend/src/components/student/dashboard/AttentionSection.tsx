import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AttentionSectionProps {
  activeRoleTitle: string;
  priorityGapSkill: { skillName: string; gap: number } | null;
}

export default function AttentionSection({
  activeRoleTitle,
  priorityGapSkill,
}: AttentionSectionProps) {
  return (
    <div>
      <h2 className="font-heading font-medium text-xl sm:text-2xl text-slate-900 tracking-tight mb-4 pl-1">
        What Deserves Your Attention Today?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Active focus subject card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[12px] p-6 text-white flex flex-col justify-between min-h-[200px] shadow-xs relative overflow-hidden">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
              ACTIVE FOCUS • {activeRoleTitle.toUpperCase()}
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white mt-2 leading-tight">
              {activeRoleTitle}
            </h3>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="font-mono text-[10px] font-bold bg-white/10 text-emerald-200 border border-emerald-400/20 px-2.5 py-1 rounded-[8px]">
                AI COMPETENCY DRILL
              </span>
              <Link
                href="/student/assessment"
                className="font-mono text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-[8px] transition"
              >
                START DRILL
              </Link>
            </div>
          </div>

          <Link
            href="/student/assessment"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition mt-4 w-fit"
          >
            <span>START</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* AI Recommendation card */}
        <div className="bg-white border border-slate-200/90 rounded-[12px] p-6 flex flex-col justify-between min-h-[200px] shadow-xs">
          <div>
            <div className="font-mono text-[10px] font-bold text-[#003c33] tracking-wider uppercase">
              AI RECOMMENDATION
            </div>
            <h3 className="font-heading font-medium text-lg text-slate-900 mt-2 leading-snug">
              {priorityGapSkill ? `Focus on bridging your gap in ${priorityGapSkill.skillName}.` : `Start with your ${activeRoleTitle} Readiness Diagnostic.`}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {priorityGapSkill 
                ? `Diagnostic analysis indicates a -${priorityGapSkill.gap} pt deficit to meet industry standard.` 
                : "Complete your goal-driven assessment to generate verified skill radar and personalized training."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 mt-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Based on your personalized skill profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
