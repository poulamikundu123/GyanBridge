"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  X,
  Award,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { MatchBreakdown } from "@/lib/services/matchingEngine";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    opportunityType: string;
    description: string;
    companyName: string;
    companyLocation: string;
    location: string;
    workMode: string;
    stipendSalary: string;
    duration: string;
    deadline: string;
    eligibilityDegree: string;
    sectorName: string;
    disciplineName?: string;
    isApplied: boolean;
    applicationStatus?: string | null;
    skills: Array<{
      skillName: string;
      requiredScore: number;
      isMandatory: boolean;
    }>;
    match: MatchBreakdown;
  };
}

export default function OpportunityCardWithModal({ opportunity }: OpportunityCardProps) {
  const router = useRouter();
  const [showExplain, setShowExplain] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showResumeCheck, setShowResumeCheck] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(opportunity.isApplied);

  const isTopMatch = opportunity.match.overallScore >= 90;

  const handleApply = async () => {
    try {
      setApplying(true);
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          coverNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplied(true);
        setShowApply(false);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isTopMatch
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50/30 via-white to-white shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {opportunity.opportunityType}
            </span>
            <span className="text-xs text-slate-500 font-semibold">• {opportunity.sectorName}</span>
            <span className="text-xs text-slate-500">• {opportunity.workMode}</span>
            {isTopMatch && (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-[8px] border border-amber-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-700" /> Top Recommended Match
              </span>
            )}
          </div>

          {/* Match Score Badge with Explain Trigger */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowExplain(true)}
              className="text-left group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
              title="Click to view explainable match formula"
            >
              <div>
                <div className="text-[9px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                  Explainable Match <HelpCircle className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-base font-black text-emerald-700 leading-none">
                  {opportunity.match.overallScore}%
                </div>
              </div>
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{opportunity.title}</h3>
        <p className="text-xs text-slate-600 mb-3 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <strong className="text-slate-800">{opportunity.companyName}</strong> • {opportunity.location}
        </p>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {opportunity.description}
        </p>

        {/* Required Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.skills.map((s, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700"
            >
              {s.skillName} ({s.requiredScore}% req)
            </span>
          ))}
        </div>

        {/* Footer Meta & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {opportunity.stipendSalary && (
              <span className="font-semibold text-slate-800 flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3 text-emerald-600" /> {opportunity.stipendSalary}
              </span>
            )}
            <span>• Duration: {opportunity.duration}</span>
            <span>• Eligible: {opportunity.eligibilityDegree}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/student/assessment?opportunity_id=${opportunity.id}&type=JOB_FIT`}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 transition flex items-center gap-1.5"
              title="Test your fit directly against this recruiter vacancy with AI"
            >
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Job-Fit Test</span>
            </Link>

            <button
              onClick={() => setShowExplain(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              Match Breakdown
            </button>

            {applied ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {opportunity.applicationStatus || "Applied"}
              </span>
            ) : (
              <button
                onClick={() => setShowApply(true)}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5"
              >
                Apply Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* EXPLAINABLE MATCH MODAL (100% Database Formula) */}
      {showExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                  Deterministic Scoring Engine
                </span>
                <h3 className="text-base font-bold text-white">Explainable Match Breakdown</h3>
              </div>
              <button
                onClick={() => setShowExplain(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Overall Score Header */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-semibold">{opportunity.title}</div>
                  <div className="text-[11px] text-slate-500">{opportunity.companyName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Total Score</div>
                  <div className="text-2xl font-black text-emerald-800">{opportunity.match.overallScore}%</div>
                </div>
              </div>

              {/* 7 Factor Breakdown Bars */}
              <div className="space-y-2 text-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Factor Contributions (Total 100%):
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">1. Skill Fit (50% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.skillScore} / 50 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.skillScore / 50) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">2. Education Fit (15% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.educationScore} / 15 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.educationScore / 15) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">3. AYUSH Discipline (10% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.disciplineScore} / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.disciplineScore / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">4. Career Interest & Sector (10% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.careerInterestScore} / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.careerInterestScore / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">5. Experience & Projects (5% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.experienceScore} / 5 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.experienceScore / 5) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">6. Certifications (5% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.certificationScore} / 5 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.certificationScore / 5) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">7. Location & Work Mode (5% Weight)</span>
                    <span className="font-bold text-emerald-700">{opportunity.match.locationScore} / 5 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(opportunity.match.locationScore / 5) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Explanations Bullets */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Explicit Match Drivers:
                </div>
                <div className="space-y-1.5">
                  {opportunity.match.explanations.map((exp, idx) => {
                    const isPositive = !exp.startsWith("Note:") && !exp.startsWith("\u26A0");
                    const cleanText = exp.replace(/^(Fit:|Note:|\u2713|\u26A0)\s*/, "");
                    return (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded-[8px] flex items-start gap-2 ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-amber-50 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {isPositive ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{cleanText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Target Job Resume Alignment Check */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResumeCheck(!showResumeCheck)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 text-xs font-bold text-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Check My Resume Against This Opportunity</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showResumeCheck ? "rotate-90" : ""}`} />
                </button>

                {showResumeCheck && (
                  <div className="mt-2.5 p-3 rounded-[8px] bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                    <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Opportunity Resume Alignment Insight</span>
                    </div>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <div className="flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Opportunity Key Skills:</strong> {opportunity.skills.map((s) => s.skillName).join(", ") || "Clinical Protocols, GCP"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>Resume Recommendation:</strong> Emphasize protocol compliance and data collection markers to optimize ATS scoring for {opportunity.companyName}.</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <Link
                        href="/student/resume"
                        className="text-emerald-800 hover:text-emerald-950 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        Open AI Resume Coach <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowExplain(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK APPLY MODAL */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                  Direct Industry Application
                </span>
                <h3 className="text-base font-bold text-white">Apply to {opportunity.title}</h3>
              </div>
              <button
                onClick={() => setShowApply(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Candidate Match Score:</span>
                  <div className="font-bold text-emerald-900">{opportunity.companyName}</div>
                </div>
                <span className="text-xl font-black text-emerald-800">{opportunity.match.overallScore}%</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Cover Note / Statement of Interest
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief statement highlighting your clinical background, research interest, or alignment with this opportunity..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Your verified digital portfolio and skill credentials will be automatically transmitted to the employer.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowApply(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {applying ? "Submitting Application..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
