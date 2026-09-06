import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ScoreBreakdown {
  keywordAlignment: number;
  skillCoverage: number;
  experienceRelevance: number;
  educationRelevance: number;
  resumeStructure: number;
  bulletQuality: number;
}

interface ResumeScoreCardProps {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  careerTitle: string;
}

export default function ResumeScoreCard({
  overallScore,
  scoreBreakdown,
  careerTitle,
}: ResumeScoreCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Card: Overall Alignment Gauge */}
      <div
        style={{
          background: "#1D2E3D",
          borderRadius: "16px",
          padding: "26px",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
        }}
      >
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
            ESTIMATED ATS COMPATIBILITY
          </span>
          <h3 className="text-lg font-bold text-white leading-tight">
            Goal Alignment Score
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Calibrated against required competency benchmarks for <strong>{careerTitle}</strong>.
          </p>
        </div>

        <div className="my-6 text-center">
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "3.5rem", fontWeight: 900, color: "#34D399", lineHeight: 1 }}>
              {overallScore}
            </span>
            <span style={{ fontSize: "1.25rem", color: "#94A3B8", fontWeight: 700 }}>/ 100</span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              {overallScore >= 75 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Strong Alignment</span>
                </>
              ) : overallScore >= 60 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Good (Optimizations Needed)</span>
                </>
              ) : (
                <span>Developing Match</span>
              )}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal border-t border-slate-700/60 pt-3">
          Score dynamically reflects keyword density, verified skill evidence, clinical internships, and bullet clarity.
        </p>
      </div>

      {/* Right Card: 6 Component Factor Breakdown */}
      <div
        style={{
          gridColumn: "span 2",
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "16px",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Score Dimension Breakdown</h3>
            <p className="text-xs text-slate-500">Measurable breakdown across 6 core ATS evaluation axes</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Target: {careerTitle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {[
            { label: "1. Keyword Alignment", score: scoreBreakdown.keywordAlignment, desc: "Presence of essential role-specific terms" },
            { label: "2. Skill Coverage", score: scoreBreakdown.skillCoverage, desc: "Mandatory & optional role competencies" },
            { label: "3. Experience Relevance", score: scoreBreakdown.experienceRelevance, desc: "Internship, clinical OPD, & trial duties" },
            { label: "4. Education Relevance", score: scoreBreakdown.educationRelevance, desc: "Degree match with minimum qualification" },
            { label: "5. Resume Structure", score: scoreBreakdown.resumeStructure, desc: "Completeness of core standard sections" },
            { label: "6. Bullet Quality", score: scoreBreakdown.bulletQuality, desc: "Active voice, scope clarity, and impact" },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
                <span className="text-xs font-black text-emerald-700">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
