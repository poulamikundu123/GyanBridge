import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  Compass,
  Briefcase,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

interface SkillIntelligenceCardsProps {
  latestAttempt: any;
  readinessResult: any;
  student: any;
  primaryApplication: any;
}

export default function SkillIntelligenceCards({
  latestAttempt,
  readinessResult,
  student,
  primaryApplication,
}: SkillIntelligenceCardsProps) {
  return (
    <div className="snapshot-grid">
      {/* Card 1: Verified Strengths */}
      <div className="nz-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your Strengths</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
              latestAttempt ? "text-emerald-800 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-100 border-slate-200"
            }`}>
              {latestAttempt ? "High Match" : "Vacant"}
            </span>
          </div>

          <div className="space-y-2.5">
            {latestAttempt && readinessResult && readinessResult.strengths.length > 0 ? (
              readinessResult.strengths.slice(0, 3).map((st: any) => (
                <div key={st.skillId} className="flex items-start justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[130px]">{st.skillName}</div>
                    <div className="text-[10px] text-slate-500">Benchmark: {st.requiredScore}%</div>
                  </div>
                  <span className="font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {st.studentScore}%
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1 py-5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="font-bold text-slate-800 text-xs">Vacant • No Verified Skills</p>
                <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto leading-tight">
                  Complete your career assessment to test and record your verified strengths.
                </p>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/student/skills"
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-900"
        >
          <span>Explore Skill Radar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Card 2: Identified Skill Gaps */}
      <div className="nz-card p-5 border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Skill Gaps</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
              latestAttempt ? "text-amber-900 bg-amber-100 border-amber-300" : "text-slate-500 bg-slate-100 border-slate-200"
            }`}>
              {latestAttempt ? "Bridge Next" : "Vacant"}
            </span>
          </div>

          <div className="space-y-2.5">
            {latestAttempt && readinessResult && (readinessResult.majorGaps.length > 0 || readinessResult.moderateGaps.length > 0) ? (
              readinessResult.majorGaps.concat(readinessResult.moderateGaps).slice(0, 3).map((gp: any) => (
                <div key={gp.skillId} className="flex items-start justify-between text-xs p-2 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[130px]">{gp.skillName}</div>
                    <div className="text-[10px] text-amber-800 font-medium">Req: {gp.requiredScore}% (Have: {gp.studentScore}%)</div>
                  </div>
                  <span className="font-black text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300 text-xs">
                    -{gp.gap} pts
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/40 border border-dashed border-amber-200 text-center space-y-1 py-5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <p className="font-bold text-slate-800 text-xs">Vacant • Gaps Uncalibrated</p>
                <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto leading-tight">
                  Take the diagnostic assessment to benchmark your deficits against your goal.
                </p>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/student/learning"
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800 hover:text-amber-950"
        >
          <span>View Targeted Learning</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Card 3: Target Career Assessment Status */}
      <div className="nz-card p-5 border-emerald-300 ring-1 ring-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Career Assessment</span>
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                latestAttempt ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {latestAttempt ? "Verified" : "Pending Test"}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {student.targetCareerRole?.title || "Clinical Research"} Readiness
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                30 Mixed Questions • Mapped Competencies
              </div>
            </div>

            {latestAttempt ? (
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
                  <span className="text-base font-black text-emerald-800">{latestAttempt.scorePercentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness</span>
                  <span className="text-xs font-bold text-emerald-700">{latestAttempt.readinessScore}%</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 rounded-[8px] border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-semibold block text-amber-900 flex items-center gap-1.5 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  Diagnostic Required
                </span>
                <p className="text-[10px] text-amber-800 leading-tight">
                  Take your 30-question diagnostic to unlock your verified skill profile.
                </p>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/student/assessment"
          className="nz-btn-primary w-full mt-3 rounded-[8px]"
        >
          {latestAttempt ? (
            <>
              <RotateCcw size={13} strokeWidth={2.2} /> <span>Retake Assessment</span>
            </>
          ) : (
            <>
              <Compass size={13} strokeWidth={2.2} /> <span>Start Assessment</span>
            </>
          )}
        </Link>
      </div>

      {/* Card 4: Active Application Status */}
      <div className="nz-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Application Pipeline</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Live Status
            </span>
          </div>

          {primaryApplication ? (
            <div className="space-y-2">
              <div>
                <div className="text-xs font-bold text-slate-900 truncate">{primaryApplication.opportunity?.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{primaryApplication.opportunity?.industryProfile?.companyName}</div>
              </div>

              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Stage</div>
                  <div className="font-bold text-emerald-950">{primaryApplication.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Match</div>
                  <div className="font-black text-emerald-950">{primaryApplication.matchScorePercentage}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-1 py-5 text-center">
              <p className="font-bold text-slate-800 text-xs">No active applications</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Browse industry postings matched to your skill profile.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/student/applications"
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-900"
        >
          <span>Track Applications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
