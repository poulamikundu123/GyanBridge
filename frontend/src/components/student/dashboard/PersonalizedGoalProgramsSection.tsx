"use client";

import React from "react";
import Link from "next/link";
import { Target, Building2, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import TrainingProgramCard from "@/components/student/TrainingProgramCard";

interface SyncedProgram {
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
}

interface PersonalizedGoalProgramsSectionProps {
  activeRoleTitle: string;
  programs: SyncedProgram[];
}

export default function PersonalizedGoalProgramsSection({
  activeRoleTitle,
  programs,
}: PersonalizedGoalProgramsSectionProps) {
  const goalPrograms = (programs || []).filter(
    (p) => p.isGoalSynced || (p.goalSyncScore && p.goalSyncScore >= 50)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-[6px] bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4 text-[#003c33]" />
            </span>
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-slate-900 tracking-tight">
              Industry Programs Synced with Your Goal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified practical modules published by AYUSH industry partners, mapped specifically to your active career target ({activeRoleTitle})
          </p>
        </div>

        <Link
          href="/student/learning"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#003c33] hover:text-[#044e43] transition self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-[8px] border border-emerald-200"
        >
          <span>VIEW FULL CATALOG</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {goalPrograms.length === 0 ? (
        <div className="p-6 rounded-[12px] bg-slate-50 border border-slate-200 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            No specific training programs currently matched with {activeRoleTitle}.
          </p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Browse our full catalog of practical upskilling modules or update your target career goal to receive targeted recommendations.
          </p>
          <div className="pt-2">
            <Link
              href="/student/learning"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              Browse All Programs &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goalPrograms.slice(0, 3).map((program) => (
            <TrainingProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
