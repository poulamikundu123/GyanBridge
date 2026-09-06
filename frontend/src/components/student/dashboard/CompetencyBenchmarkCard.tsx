import React from "react";

interface CompetencyBenchmarkCardProps {
  isFreshUser: boolean;
  readinessPercentage: number;
  latestAttempt: any;
  trackCompetencies: Array<{ name: string; score: number; required: number }>;
}

export default function CompetencyBenchmarkCard({
  isFreshUser,
  readinessPercentage,
  latestAttempt,
  trackCompetencies,
}: CompetencyBenchmarkCardProps) {
  return (
    <div className="bg-[#F9F9F6] border border-[#CBD5E1] rounded-[12px] p-5 sm:p-7 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 shadow-xs">
      {/* Left Column: Learning Status list & Coverage stats */}
      <div className="md:col-span-1 flex flex-col justify-between gap-4 sm:gap-5 md:border-r md:border-slate-200 md:pr-6">
        <div>
          <div className="text-[10px] font-mono font-bold text-slate-500 tracking-wider mb-2 uppercase">
            COMPETENCY BENCHMARK STATUS
          </div>
          {/* Steps tabs */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400 font-mono">
            <span className="border-b-2 border-[#4F46E5] text-[#4F46E5] pb-0.5">PLAN</span>
            <span className={`pb-0.5 ${latestAttempt ? "border-b-2 border-[#4F46E5] text-[#4F46E5]" : ""}`}>PRACTICE</span>
            <span className={`pb-0.5 ${latestAttempt ? "border-b-2 border-[#4F46E5] text-[#4F46E5]" : ""}`}>TEST</span>
            <span>REFLECTED</span>
            <span className={readinessPercentage >= 80 ? "text-emerald-700 font-bold" : ""}>MASTERED</span>
          </div>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight leading-none">
            {isFreshUser ? "0%" : `${readinessPercentage}%`}
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-500 mt-2 uppercase tracking-wide">
            TOTAL CAREER BENCHMARK READINESS
          </div>
        </div>
      </div>

      {/* Right Column: Subject/Skill competency checklist */}
      <div className="md:col-span-2 flex flex-col gap-2.5 justify-center">
        {trackCompetencies.map((sub) => (
          <div key={sub.name} className="flex items-center justify-between gap-2 sm:gap-4 py-0.5">
            <div className="w-28 sm:w-44 text-xs font-bold text-slate-900 truncate shrink-0" title={sub.name}>
              {sub.name}
            </div>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${sub.score}%` }}
              />
            </div>
            <div className="w-10 text-right text-xs font-mono font-bold text-slate-600 shrink-0">
              {sub.score}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
