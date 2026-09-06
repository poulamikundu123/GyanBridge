"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Clock, Award, Target, ArrowRight, Zap, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface TrainingProgramCardProps {
  program: {
    id: string;
    title: string;
    providerName: string;
    companyName?: string;
    isIndustryHosted?: boolean;
    isGoalSynced?: boolean;
    goalSyncScore?: number;
    goalSyncRole?: string | null;
    goalSyncReason?: string | null;
    category: string;
    durationHours: number;
    mode: string;
    level: string;
    certificateProvided: boolean;
    description: string;
    syllabus?: string | null;
    enrollmentStatus?: string | null;
    progressPercent?: number;
    skills: Array<{
      skillId: string;
      skillName: string;
      gain: number;
      currentStudentScore: number;
    }>;
  };
}

export default function TrainingProgramCard({ program }: TrainingProgramCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(program.enrollmentStatus || null);
  const [progress, setProgress] = useState(program.progressPercent || 0);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingProgramId: program.id }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("IN_PROGRESS");
        setProgress(30);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/learning/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingProgramId: program.id }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("COMPLETED");
        setProgress(100);
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
      setLoading(false);
    }
  };

  const isCompleted = status === "COMPLETED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div
      className={`p-6 rounded-[12px] border transition-all duration-150 ${
        isCompleted
          ? "border-emerald-300 bg-[#edfce9]/30 shadow-xs"
          : isInProgress
          ? "border-blue-300 bg-[#f1f5ff]/30 shadow-xs"
          : program.isGoalSynced
          ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/20 via-white to-white hover:border-emerald-300 shadow-xs"
          : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
      }`}
    >
      {/* Goal Synced High-Visibility Badge */}
      {program.isGoalSynced && (
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-emerald-100/80 border border-emerald-300 text-[#003c33] text-[11px] font-mono font-bold tracking-tight shadow-2xs">
            <span>🎯</span>
            <span>{program.goalSyncScore || 90}% GOAL SYNC</span>
            {program.goalSyncRole && (
              <span className="font-normal text-emerald-800">
                • Calibrated for {program.goalSyncRole}
              </span>
            )}
          </span>
          {program.isIndustryHosted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-semibold">
              <span>🏢</span>
              <span>Industry-Hosted: {program.companyName || program.providerName}</span>
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-2 py-0.5 rounded-[6px] bg-[#edfce9] text-[#003c33] border border-[#a7f3d0]">
            {program.category}
          </span>
          <span className="text-xs text-slate-500">• {program.level}</span>
          <span className="text-xs text-slate-500">• {program.mode}</span>
          {!program.isGoalSynced && program.isIndustryHosted && (
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
              Industry Partner
            </span>
          )}
        </div>

        {isCompleted ? (
          <span className="text-xs font-medium text-[#003c33] bg-[#edfce9] px-2.5 py-0.5 rounded-[6px] border border-[#a7f3d0] flex items-center gap-1 self-start sm:self-auto font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed & Certified
          </span>
        ) : isInProgress ? (
          <span className="text-xs font-medium text-[#1863dc] bg-[#f1f5ff] px-2.5 py-0.5 rounded-[6px] border border-[#bae6fd] flex items-center gap-1 self-start sm:self-auto font-mono">
            <Clock className="w-3.5 h-3.5 text-[#1863dc]" /> In Progress ({progress}%)
          </span>
        ) : null}
      </div>

      <h3 className="font-heading font-medium text-base text-slate-900 leading-snug mb-0.5">{program.title}</h3>
      <p className="text-xs text-slate-500 mb-3">
        {program.companyName || program.providerName}
      </p>

      {/* Goal Sync Alignment Callout */}
      {program.isGoalSynced && program.goalSyncReason && (
        <div className="mb-3 p-2.5 rounded-[6px] bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2">
          <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-sans">{program.goalSyncReason}</span>
        </div>
      )}

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
        {program.description}
      </p>

      {/* Skills Targeted & Projected Gain */}
      <div className="p-3 bg-slate-50/80 rounded-[8px] border border-slate-200 mb-4 space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-emerald-600" /> Competencies Targeted:
        </div>
        <div className="flex flex-wrap gap-2">
          {(program.skills || []).map((s, idx) => (
            <span
              key={s.skillId ? `${program.id}-${s.skillId}-${idx}` : `${program.id}-skill-${idx}`}
              className="text-xs font-medium px-2 py-1 bg-white rounded-[6px] border border-slate-200 text-slate-800 flex items-center gap-1.5"
            >
              <span>{s.skillName || "Competency"}</span>
              <strong className="text-[#003c33] bg-[#edfce9] px-1.5 py-0.2 rounded font-mono text-[11px]">
                +{s.gain}% boost
              </strong>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Details & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {program.durationHours} Hours
          </span>
          {program.certificateProvided && (
            <span className="flex items-center gap-1 text-[#003c33] font-medium">
              <Award className="w-3.5 h-3.5" /> Certificate Included
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!status ? (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="px-4 py-2 rounded-[8px] bg-[#003c33] hover:bg-[#044e43] text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {loading ? "Enrolling..." : "Enroll in Course"}
            </button>
          ) : isInProgress ? (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 rounded-[8px] bg-[#17171c] hover:bg-[#282830] text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Simulate course completion to immediately boost your verified skills!"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              {loading ? "Processing..." : "Mark Complete & Boost Skills"}
            </button>
          ) : (
            <span className="text-xs font-medium text-[#003c33] flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-600" /> Credential Added to Portfolio
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
