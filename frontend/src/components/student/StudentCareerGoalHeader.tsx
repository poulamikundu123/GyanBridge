"use client";

import { useEffect, useState } from "react";
import {
  Target,
  ChevronRight,
  TrendingUp,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { CareerGoalModal } from "./CareerGoalModal";
import { useRouter } from "next/navigation";

interface StudentCareerGoalHeaderProps {
  studentName: string;
  degree: string;
  disciplineName: string;
  targetRole: {
    id: string;
    title: string;
    sectorName: string;
    description: string;
    averageSalary: string;
  } | null;
  readinessScore: number;
  isFreshUser: boolean;
}

export default function StudentCareerGoalHeader({
  studentName,
  degree,
  disciplineName,
  targetRole,
  readinessScore,
  isFreshUser,
}: StudentCareerGoalHeaderProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(!targetRole);
  const [showPreparing, setShowPreparing] = useState(true);
  const [toastOpacity, setToastOpacity] = useState(1);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setToastOpacity(0);
    }, 2000);
    const unmountTimer = setTimeout(() => {
      setShowPreparing(false);
    }, 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const firstName = studentName?.split(" ")[0] || "Scholar";
  const todayStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase();
  const targetRoleDisplay = targetRole ? targetRole.title.toUpperCase() : "GENERAL TRACK";
  const readinessDisplay = isFreshUser ? "0% (PENDING TEST)" : `${readinessScore}% ON TRACK`;
  const trackDisplay = `${degree.toUpperCase()} • ${disciplineName.toUpperCase()}`;

  return (
    <>
      {/* 1. Hero Welcome Banner */}
      <div
        className="rounded-[16px] border border-emerald-200/70 bg-gradient-to-br from-[#f0f9f5] via-[#f7faf8] to-[#eaf5f0] p-5 sm:p-7 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        {/* Subtle decorative soft glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-200/35 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-teal-200/25 blur-3xl pointer-events-none" />

        {/* Left Side welcome details */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                TODAY
              </span>
              <span className="h-px w-8 bg-emerald-200" />
              <span className="text-[11px] font-mono text-amber-700">
                {todayStr}
              </span>
            </div>

            <h1
              className="font-heading font-medium text-2xl sm:text-3xl md:text-4xl text-slate-950 tracking-tight leading-tight mb-4 sm:mb-6"
            >
              Welcome back,{" "}
              <span className="text-[#003c33]">
                {firstName}.
              </span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <Link
                href="/student/assessment"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#003c33] hover:bg-[#044e43] text-white font-medium text-xs shadow-xs transition cursor-pointer text-center"
              >
                <span>{isFreshUser ? "Take Diagnostic Assessment" : "Retake Assessment"}</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                href="/student/careers"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-white/95 hover:bg-white text-slate-800 font-medium text-xs border border-emerald-200/80 shadow-2xs transition cursor-pointer text-center"
              >
                Change Career Goal
              </Link>
            </div>
          </div>

          {/* Banner bottom indicators - Telemetry */}
          <div
            className="flex flex-wrap gap-3 sm:gap-6 pt-4 border-t border-emerald-900/10"
          >
            {/* Target Career Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <Target size={14} className="text-[#1863dc] shrink-0" strokeWidth={2.4} />
              <div className="font-mono text-[11px]">
                <span className="text-slate-400">TARGET: </span>
                <span className="text-slate-900 font-medium">{targetRoleDisplay}</span>
              </div>
            </div>

            {/* Readiness Pace */}
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp size={14} className="text-emerald-700 shrink-0" strokeWidth={2.4} />
              <div className="font-mono text-[11px]">
                <span className="text-slate-400">READINESS: </span>
                <span className="text-[#003c33] font-medium">{readinessDisplay}</span>
              </div>
            </div>

            {/* Degree / Discipline */}
            <div className="flex items-center gap-2 text-xs">
              <GraduationCap size={14} className="text-amber-700 shrink-0" strokeWidth={2.4} />
              <div className="font-mono text-[11px]">
                <span className="text-slate-400">TRACK: </span>
                <span className="text-amber-900 font-medium">{trackDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Illustration Character: planner_exact_character.png */}
        <div className="relative w-44 h-40 sm:w-56 sm:h-52 md:w-64 md:h-60 shrink-0 mx-auto md:mx-0 flex items-center justify-center">
          <img
            src="/planner_exact_character.png"
            alt="Study Planning Character"
            className="w-full h-full object-contain max-h-[240px]"
          />

          {/* Floating black toast message inside hero welcome banner */}
          {showPreparing && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "0",
                background: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "8px",
                padding: "7px 12px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "0.68rem",
                fontWeight: 800,
                boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                opacity: toastOpacity,
                transition: "opacity 300ms ease",
                pointerEvents: "none",
                maxWidth: "90%",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "11px",
                  height: "11px",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#FFFFFF",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }}
              />
              <span className="truncate">Preparing your dashboard...</span>
            </div>
          )}
        </div>
      </div>

      {/* Starting Point & Change Goal Modal */}
      <CareerGoalModal
        isOpen={isModalOpen}
        currentGoalId={targetRole?.id}
        allowClose={Boolean(targetRole)}
        onClose={() => setIsModalOpen(false)}
        onGoalSelected={() => {
          setIsModalOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
