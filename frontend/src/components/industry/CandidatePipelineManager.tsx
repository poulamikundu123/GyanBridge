"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

interface CandidateRow {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  degree: string;
  institution: string;
  disciplineName: string;
  targetRoleTitle?: string | null;
  matchScore: number;
  status: string;
  coverNote?: string | null;
  opportunityTitle: string;
  appliedDate: string;
  skills: Array<{
    skillName: string;
    score: number;
    level: string;
  }>;
  matchBreakdown?: any;
}

interface CandidatePipelineManagerProps {
  candidates: CandidateRow[];
}

export default function CandidatePipelineManager({ candidates }: CandidatePipelineManagerProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingId(applicationId);
      const res = await fetch("/api/industry/application-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-medium text-base text-slate-800">No Applicants in Pipeline Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          When candidates apply to your published opportunities, their deterministic skill match scores and verified credentials will appear here.
        </p>
        <Link
          href="/industry/opportunities/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition mt-2"
        >
          Publish Opportunity
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((cand) => {
        const isExpanded = expandedId === cand.applicationId;
        const isUpdating = updatingId === cand.applicationId;
        const isTop = cand.matchScore >= 90;

        return (
          <div
            key={cand.applicationId}
            className={`p-6 rounded-2xl border transition-all ${
              isTop
                ? "border-emerald-300 bg-gradient-to-r from-emerald-50/20 via-white to-white shadow-sm"
                : "border-slate-200 bg-white"
            }`}
          >
            {/* Main Row Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {cand.opportunityTitle}
                  </span>
                  <span className="text-xs text-slate-500">• {cand.disciplineName}</span>
                  {isTop && (
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-[8px] border border-amber-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-700" /> High Match Candidate
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <h3 className="text-base font-bold text-slate-900">{cand.candidateName}</h3>
                  <span className="text-xs text-slate-500">({cand.candidateEmail})</span>
                </div>

                <p className="text-xs text-slate-600">
                  {cand.degree} • {cand.institution} • Applied {cand.appliedDate}
                </p>
              </div>

              {/* Match Fit Score & Current Stage */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                  <span className="text-2xl font-black text-emerald-700">{cand.matchScore}%</span>
                </div>

                {/* Stage Updater */}
                <div className="flex items-center gap-2">
                  <select
                    value={cand.status}
                    disabled={isUpdating}
                    onChange={(e) => handleUpdateStatus(cand.applicationId, e.target.value)}
                    className="py-1.5 px-3 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW">Interview Scheduled</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <Link
                    href={`/industry/feedback/${cand.applicationId}`}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition"
                    title="Provide verified competency feedback"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="hidden sm:inline">Feedback</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Expandable Details Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setExpandedId(isExpanded ? null : cand.applicationId)}
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>Hide Candidate Verification Profile <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Inspect Verified Skills & Cover Statement <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>

              {isUpdating && <span className="text-xs text-slate-400">Updating status...</span>}
            </div>

            {/* Expanded Drawer */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                {cand.coverNote && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Candidate Statement:</span>
                    <p className="text-slate-600 leading-relaxed italic">&ldquo;{cand.coverNote}&rdquo;</p>
                  </div>
                )}

                {/* Verified Skills Grid */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Candidate Verified Competencies (Real-time DB Ledger):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {cand.skills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800 truncate">{sk.skillName}</span>
                        <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {sk.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {candidates.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-xs">No candidate applications received yet.</p>
        </div>
      )}
    </div>
  );
}
