"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Compass, Target, TrendingUp, IndianRupee, GraduationCap, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface CareerSkillReq {
  skillId: string;
  skillName: string;
  requiredScore: number;
  isMandatory: boolean;
  studentScore: number;
}

interface CareerRoleCardProps {
  role: {
    id: string;
    title: string;
    description: string;
    minEducation: string;
    averageSalary?: string | null;
    sectorName: string;
    readinessScore: number;
    isCurrentTarget: boolean;
    skills: CareerSkillReq[];
  };
  hasCompletedAssessment?: boolean;
}

export default function CareerRoleCard({ role, hasCompletedAssessment = false }: CareerRoleCardProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const handleSetTarget = async () => {
    try {
      setUpdating(true);
      const res = await fetch("/api/student/career-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: role.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update target role:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-[12px] border transition-all ${
        role.isCurrentTarget
          ? "border-emerald-600/40 bg-emerald-50/30 shadow-xs ring-1 ring-emerald-600/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-[8px] bg-slate-100 text-slate-700">
              {role.sectorName}
            </span>
            {role.isCurrentTarget && (
              <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-[8px] border border-emerald-300/80 flex items-center gap-1">
                <Check className="w-3 h-3" /> Current Target
              </span>
            )}
          </div>
          <h3 className="font-heading font-medium text-base text-slate-900">{role.title}</h3>
        </div>

        {/* Compatibility Score */}
        <div className="text-left sm:text-right">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Match Compatibility</div>
          {hasCompletedAssessment ? (
            <div className="text-2xl font-bold text-emerald-800">{role.readinessScore}%</div>
          ) : (
            <div className="text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-[8px] border border-amber-200 mt-1 inline-flex items-center gap-1">
              Pending Assessment
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
        {role.description}
      </p>

      {/* Badges Info */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-4 border-b border-slate-100 mb-4">
        <span className="flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          {role.minEducation}
        </span>
        {role.averageSalary && (
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            {role.averageSalary}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {!role.isCurrentTarget ? (
          <button
            onClick={handleSetTarget}
            disabled={updating}
            className="px-4 py-2 rounded-[8px] bg-[#17171c] hover:bg-[#003c33] text-white font-medium text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            {updating ? "Updating..." : "Set as Target Goal"}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" /> Active Target
            </span>
            <Link
              href="/student/assessment"
              className="px-3.5 py-2 rounded-[8px] bg-[#003c33] hover:bg-[#002b24] text-white font-medium text-xs transition flex items-center gap-1 shadow-xs"
            >
              <span>Take Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
