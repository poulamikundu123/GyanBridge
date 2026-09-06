import React from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, Award, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface RecommendedOpportunitiesSectionProps {
  matchedOpportunities: any[];
}

export default function RecommendedOpportunitiesSection({
  matchedOpportunities,
}: RecommendedOpportunitiesSectionProps) {
  return (
    <div className="ayush-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Recommended Industry Opportunities</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated using the deterministic 7-factor explainable formula (Skill 50%, Education 15%, Discipline 10%, Career 10%, Exp 5%, Cert 5%, Loc 5%)
          </p>
        </div>
        <Link
          href="/student/opportunities"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
        >
          View All Postings <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {matchedOpportunities.slice(0, 3).map((opp) => {
          const isTop = opp.match?.overallScore >= 90;

          return (
            <div
              key={opp.id}
              className={`p-5 rounded-[12px] border transition-all ${
                isTop
                  ? "border-emerald-300 bg-gradient-to-r from-emerald-50/40 via-white to-white shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-[8px]">
                      {opp.opportunityType}
                    </span>
                    <span className="text-xs text-slate-500">• {opp.sector?.name}</span>
                    <span className="text-xs text-slate-500">• {opp.workMode}</span>
                    {isTop && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-[8px] border border-emerald-300/80">
                        <Award className="w-3.5 h-3.5 text-emerald-700" /> Top Recommended Match (94%)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                  <p className="text-xs text-slate-600">{opp.industryProfile?.companyName} • {opp.location}</p>

                  {/* Match Highlights Bullet Points */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {(opp.match?.explanations || []).slice(0, 3).map((exp: string, idx: number) => {
                      const isPositive = !exp.startsWith("Note:") && !exp.startsWith("⚠️");
                      const cleanText = exp.replace(/^(Fit:|Note:|✓|⚠️)\s*/, "");
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isPositive ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          )}
                          <span>{cleanText}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Match Score & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Match Compatibility</div>
                    <div className="text-2xl font-black text-emerald-700">{opp.match?.overallScore}%</div>
                  </div>
                  <Link
                    href={`/student/opportunities?id=${opp.id}`}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-1"
                  >
                    Inspect & Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
