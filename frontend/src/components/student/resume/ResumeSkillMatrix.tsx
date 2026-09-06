"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, Check } from "lucide-react";

interface SkillAlignment {
  skillId: string;
  skillName: string;
  categoryName: string;
  isMandatory: boolean;
  requiredProficiency: number;
  status: "DEMONSTRATED" | "PARTIALLY_DEMONSTRATED" | "NOT_FOUND";
  evidence: string;
  confidence: number;
  assessmentScore?: number;
  assessmentInsight?: string;
}

interface KeywordReport {
  presentKeywords: string[];
  missingKeywords: string[];
}

interface ResumeSkillMatrixProps {
  careerTitle: string;
  skillAlignments: SkillAlignment[];
  keywordReport: KeywordReport;
  detectedCandidateSkills?: string[];
}

export default function ResumeSkillMatrix({
  careerTitle,
  skillAlignments,
  keywordReport,
  detectedCandidateSkills = [],
}: ResumeSkillMatrixProps) {
  const [skillFilter, setSkillFilter] = useState<"ALL" | "DEMONSTRATED" | "PARTIALLY_DEMONSTRATED" | "NOT_FOUND">("ALL");

  const filteredSkills = skillAlignments.filter((sa) => {
    if (skillFilter === "ALL") return true;
    return sa.status === skillFilter;
  });

  return (
    <>
      {/* Skill Alignment Table */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "16px",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resume Skill Alignment &amp; Assessment Bridge
            </h3>
            <p className="text-xs text-slate-500">
              Direct mapping of required skills for <strong>{careerTitle}</strong> against extracted resume evidence &amp; diagnostic test scores
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto">
            {[
              { id: "ALL", label: "All Skills" },
              { id: "DEMONSTRATED", label: "Demonstrated" },
              { id: "PARTIALLY_DEMONSTRATED", label: "Partial" },
              { id: "NOT_FOUND", label: "Missing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSkillFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  skillFilter === tab.id
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Required Skill</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Resume Evidence</th>
                <th className="py-3 px-3">Alignment Status</th>
                <th className="py-3 px-3">Assessment Cross-Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkills.map((sk) => (
                <tr key={sk.skillId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{sk.skillName}</div>
                    {sk.isMandatory && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                        Mandatory
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{sk.categoryName}</td>
                  <td className="py-3.5 px-3 max-w-xs text-slate-700 italic">
                    &ldquo;{sk.evidence}&rdquo;
                  </td>
                  <td className="py-3.5 px-3">
                    {sk.status === "DEMONSTRATED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Demonstrated
                      </span>
                    )}
                    {sk.status === "PARTIALLY_DEMONSTRATED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Partial
                      </span>
                    )}
                    {sk.status === "NOT_FOUND" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {sk.assessmentScore !== undefined ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">Score: {sk.assessmentScore}%</span>
                          <span className="text-[10px] text-slate-400">({sk.requiredProficiency}% benchmark)</span>
                        </div>
                        {sk.assessmentInsight && (
                          <p className="text-[10px] text-indigo-700 font-medium mt-0.5 max-w-xs">
                            {sk.assessmentInsight}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Link
                        href="/student/assessment"
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        Take Assessment <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keywords Present vs Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keywords Present */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Keywords Detected on Resume</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            These industry keywords match the requirements for {careerTitle} and will be picked up by automated ATS scanners.
          </p>
          <div className="flex flex-wrap gap-2">
            {keywordReport.presentKeywords && keywordReport.presentKeywords.length > 0 ? (
              keywordReport.presentKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {kw}
                </span>
              ))
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic w-full">
                No target role keywords detected yet. Integrate relevant {careerTitle} clinical or regulatory terminology to improve ATS scoring.
              </div>
            )}
          </div>

          {detectedCandidateSkills && detectedCandidateSkills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Candidate Detected Strengths &amp; Background Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {detectedCandidateSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keywords Missing */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Important Keywords Missing or Weak</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            ATS scanners for {careerTitle} heavily weigh these terms. Integrate them into your projects and summary where applicable.
          </p>
          <div className="flex flex-wrap gap-2">
            {keywordReport.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
