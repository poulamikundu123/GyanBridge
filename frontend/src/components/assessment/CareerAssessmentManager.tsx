"use client";

import { useState } from "react";
import {
  Target,
  Award,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  History,
  Briefcase,
  Layers,
  HelpCircle,
  FileCheck,
  ChevronRight,
  GraduationCap,
  Scale,
  Building2,
  Sparkles,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { CareerGoalModal } from "@/components/student/CareerGoalModal";
import CareerAssessmentRunner from "./CareerAssessmentRunner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CareerRoleInfo {
  id: string;
  title: string;
  sectorName: string;
  description: string;
  minEducation: string;
  averageSalary: string;
  skills: Array<{
    skillId: string;
    skillName: string;
    requiredProficiency: number;
    isMandatory: boolean;
    weight: number;
  }>;
}

interface AttemptItem {
  id: string;
  attemptNumber: number;
  careerRoleTitle: string;
  scorePercentage: number;
  readinessScore: number;
  completedAt: string;
  skillsEvaluatedCount: number;
}

interface SkillProgressionItem {
  skillName: string;
  history: Array<{
    attempt: number;
    score: number;
    date: string;
  }>;
}

interface OpportunityItem {
  id: string;
  title: string;
  company_name?: string;
  companyName?: string;
  location?: string;
  opportunity_type?: string;
  opportunityType?: string;
  match_score?: number;
  skills?: Array<{ skill_name?: string; skillName?: string }>;
}

interface CareerAssessmentManagerProps {
  studentId: string;
  initialCareerRole: CareerRoleInfo | null;
  attemptsHistory: AttemptItem[];
  skillProgression: SkillProgressionItem[];
  studentReadinessScore: number;
  opportunities?: OpportunityItem[];
  initialOpportunityId?: string | null;
  initialAssessmentType?: "MIXED_COMPREHENSIVE" | "STANDARD_BENCHMARK" | "JOB_FIT";
}

export default function CareerAssessmentManager({
  studentId,
  initialCareerRole,
  attemptsHistory,
  skillProgression,
  studentReadinessScore,
  opportunities = [],
  initialOpportunityId = null,
  initialAssessmentType = "MIXED_COMPREHENSIVE",
}: CareerAssessmentManagerProps) {
  const router = useRouter();
  const [careerRole, setCareerRole] = useState<CareerRoleInfo | null>(initialCareerRole);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(!initialCareerRole);
  const [assessmentType, setAssessmentType] = useState<"MIXED_COMPREHENSIVE" | "STANDARD_BENCHMARK" | "JOB_FIT">(
    (initialAssessmentType as any) || "MIXED_COMPREHENSIVE"
  );
  const [selectedOppId, setSelectedOppId] = useState<string>(
    initialOpportunityId || (opportunities.length > 0 ? opportunities[0].id : "")
  );
  const [activeSession, setActiveSession] = useState<{
    attemptId: string;
    testTitle: string;
    durationMinutes: number;
    questions: any[];
  } | null>(null);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const latestAttempt = attemptsHistory[attemptsHistory.length - 1];
  const isCompleted = Boolean(latestAttempt);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

  const handleStartAssessment = async () => {
    try {
      setStarting(true);
      setErrorMessage(null);
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_type: assessmentType,
          opportunity_id: assessmentType === "JOB_FIT" ? selectedOppId : undefined,
          career_role_id: careerRole?.id || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setActiveSession({
          attemptId: data.attemptId || data.attempt_id,
          testTitle: data.testTitle || data.test_title || (
            assessmentType === "MIXED_COMPREHENSIVE"
              ? "AYUSH Multi-Subject Mixed Assessment (6 Core Disciplines)"
              : assessmentType === "JOB_FIT"
              ? "AI Job-Fit Challenge"
              : "AYUSH Statutory Benchmark"
          ),
          durationMinutes: data.durationMinutes || data.duration_minutes || 25,
          questions: data.questions,
        });
      } else {
        setErrorMessage(data.message || data.detail || "Failed to initialize assessment questions. Please try again.");
      }
    } catch (err) {
      console.error("Failed to start assessment:", err);
      setErrorMessage("Connection error while communicating with the assessment service.");
    } finally {
      setStarting(false);
    }
  };

  if (activeSession) {
    return (
      <CareerAssessmentRunner
        attemptId={activeSession.attemptId}
        careerRoleTitle={careerRole?.title || activeSession.testTitle}
        testTitle={activeSession.testTitle}
        durationMinutes={activeSession.durationMinutes}
        questions={activeSession.questions}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CAREER GOAL STARTING POINT BANNER - Seamless Light Tone with Integrated Cartoon */}
      <div className="bg-[#F9F9F6] border border-slate-200 rounded-[16px] p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-xs relative overflow-hidden">
        {/* Left Side: Focused Thinker Character */}
        <div className="relative w-36 h-32 sm:w-44 sm:h-40 md:w-48 md:h-44 shrink-0 flex items-center justify-center mx-auto md:mx-0">
          <img
            src="/quiz_focus_thinker.png"
            alt="Student Focused on Assessment"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right / Center Content Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#edfce9] border border-[#a7f3d0] text-[#003c33] text-[11px] font-medium font-mono mb-2"
            >
              <Target className="w-3.5 h-3.5 text-[#003c33]" />
              <span>Active Target Career Pathway</span>
            </div>

            <h1
              className="font-heading font-medium text-2xl lg:text-3xl text-slate-950 tracking-tight leading-tight mb-1"
            >
              {careerRole ? careerRole.title : "No Career Goal Selected"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              {careerRole
                ? careerRole.description
                : "Select your career goal to configure your unified readiness assessment."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/student/careers"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[8px] bg-white border border-slate-300 text-slate-800 text-xs font-medium hover:bg-slate-50 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Career Goal</span>
            </Link>

            {careerRole && (
              <div
                className="p-3 rounded-[12px] bg-[#edfce9] border border-[#a7f3d0] text-center shadow-xs"
              >
                <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-[#003c33] block">
                  Career Readiness
                </span>
                <span className="text-2xl font-black text-[#003c33] leading-none font-mono">
                  {studentReadinessScore}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DUAL-TIER AI ASSESSMENT ENGINE CONTROLS */}
      <div className="ayush-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Adaptive AI Assessment Engine
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isCompleted ? "Verified Profile" : "Ready for Evaluation"}
              </span>
            </div>
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-slate-900 tracking-tight">
              {assessmentType === "MIXED_COMPREHENSIVE"
                ? "Mixed Multi-Subject Assessment (6 Core AYUSH Disciplines)"
                : assessmentType === "STANDARD_BENCHMARK"
                ? `${careerRole ? careerRole.title : "AYUSH"} Statutory Standards Benchmark`
                : "Live Opportunity Recruiter Job-Fit Challenge"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {assessmentType === "MIXED_COMPREHENSIVE"
                ? "Holistic scenario-based assessment evaluating clinical diagnostic mastery, herbology/formulation rigor, panchakarma contraindications, pharmacopoeial standardization, GCP safety, and patient ethics."
                : assessmentType === "STANDARD_BENCHMARK"
                ? "Adaptive dynamic scenarios evaluating regulatory rigor against AYUSH-GCP, Ayurvedic Pharmacopoeia of India (API), WHO safety norms, and Schedule T GMP."
                : "Tailored industrial case challenges derived from live recruiter opportunity postings to prove candidate job fitness."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartAssessment}
              disabled={starting}
              className="nz-btn-green cursor-pointer disabled:opacity-50"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Scenarios...</span>
                </>
              ) : isCompleted ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Multi-Subject Assessment</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Multi-Subject Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-red-700 hover:text-red-900 ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* THREE-TIER SELECTOR TABS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* TIER 0 / MIXED TAB (DEFAULT & RECOMMENDED) */}
          <button
            type="button"
            onClick={() => setAssessmentType("MIXED_COMPREHENSIVE")}
            className={`p-4 rounded-xl border text-left transition relative cursor-pointer ${
              assessmentType === "MIXED_COMPREHENSIVE"
                ? "bg-[#edfce9] border-[#a7f3d0] ring-2 ring-emerald-600/30"
                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className={`w-4 h-4 ${assessmentType === "MIXED_COMPREHENSIVE" ? "text-[#003c33]" : "text-slate-500"}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Mixed Multi-Subject
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-700 text-white">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Comprehensive clinical evaluation covering all 6 core AYUSH disciplines in one test.
            </p>
            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Kayachikitsa</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Dravyaguna</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Panchakarma</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Rasa Shastra</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">AYUSH-GCP</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Ethics</span>
            </div>
          </button>

          {/* TIER 1 TAB */}
          <button
            type="button"
            onClick={() => setAssessmentType("STANDARD_BENCHMARK")}
            className={`p-4 rounded-xl border text-left transition relative cursor-pointer ${
              assessmentType === "STANDARD_BENCHMARK"
                ? "bg-[#edfce9] border-[#a7f3d0] ring-2 ring-emerald-600/30"
                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${assessmentType === "STANDARD_BENCHMARK" ? "text-[#003c33]" : "text-slate-500"}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Role Benchmark
                </span>
              </div>
              {assessmentType === "STANDARD_BENCHMARK" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Mapped to {careerRole?.title || "Target Career Role"} and official statutory regulations.
            </p>
            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">API Norms</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Schedule T</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">WHO Safety</span>
            </div>
          </button>

          {/* TIER 2 TAB */}
          <button
            type="button"
            onClick={() => setAssessmentType("JOB_FIT")}
            className={`p-4 rounded-xl border text-left transition relative cursor-pointer ${
              assessmentType === "JOB_FIT"
                ? "bg-[#edfce9] border-[#a7f3d0] ring-2 ring-emerald-600/30"
                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className={`w-4 h-4 ${assessmentType === "JOB_FIT" ? "text-[#003c33]" : "text-slate-500"}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Job-Fit Challenge
                </span>
              </div>
              {assessmentType === "JOB_FIT" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Generates case challenges tailored to active recruiter postings and required competencies.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-800">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{opportunities.length} Postings</span>
            </div>
          </button>
        </div>

        {/* TIER 2 OPPORTUNITY SELECTOR (WHEN TIER 2 ACTIVE) */}
        {assessmentType === "JOB_FIT" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                Select Opportunity to Benchmark Against:
              </label>
              <Link
                href="/student/opportunities"
                className="text-[11px] text-emerald-800 hover:underline font-bold"
              >
                Browse All Opportunities →
              </Link>
            </div>
            {opportunities.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} — {opp.company_name || opp.companyName || "Industry Partner"} ({opp.location || "On-site/Hybrid"})
                    </option>
                  ))}
                </select>
                {selectedOpp && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">{selectedOpp.title}</strong> at {selectedOpp.company_name || selectedOpp.companyName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        Match Score: {selectedOpp.match_score || 90}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No external opportunities loaded. AI will evaluate against target career role industrial competencies.
              </div>
            )}
          </div>
        )}

        {/* STATUTORY PILLARS BADGES */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Verified Knowledge Standards In Effect
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">AYUSH-GCP Standards</span>
                <span className="text-[10px] text-slate-500">Ethics, CTRI & SAE (24h)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Pharmacopoeia of India</span>
                <span className="text-[10px] text-slate-500">API/UPI Monographs & Heavy Metals</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/80 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">WHO Herbal Guidelines</span>
                <span className="text-[10px] text-slate-500">Pharmacovigilance & Safety</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200/80 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Schedule T GMP</span>
                <span className="text-[10px] text-slate-500">HVAC, Water & Contamination</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSESSMENT HISTORY & SKILL PROGRESSION OVER TIME */}
      <div className="ayush-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Assessment History & Skill Improvement Over Time
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Previous attempts are permanently preserved to track your longitudinal competency growth
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            {attemptsHistory.length} Recorded Attempts
          </span>
        </div>

        {attemptsHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-800 text-xs">No Past Assessment Attempts</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Click &ldquo;Generate & Start Assessment&rdquo; above to take your personalized dynamic AI evaluation and establish your verified skill profile.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table of Attempts */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 bg-slate-50/70">
                    <th className="p-3">Attempt</th>
                    <th className="p-3">Career Goal</th>
                    <th className="p-3 text-center">Test Score</th>
                    <th className="p-3 text-center">Career Readiness</th>
                    <th className="p-3 text-center">Competencies Evaluated</th>
                    <th className="p-3 text-right">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attemptsHistory.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">
                        Attempt #{att.attemptNumber}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{att.careerRoleTitle}</td>
                      <td className="p-3 text-center font-black text-slate-900">
                        {att.scorePercentage}%
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {att.readinessScore}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {att.skillsEvaluatedCount} Skills
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {new Date(att.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Skill Progression Over Time */}
            {skillProgression.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Skill Trajectory Across Attempts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillProgression.slice(0, 6).map((prog) => (
                    <div
                      key={prog.skillName}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="font-bold text-slate-900 mb-1.5 truncate">
                        {prog.skillName}
                      </div>
                      <div className="flex items-center gap-2">
                        {prog.history.map((h, i) => (
                          <div key={i} className="flex items-center gap-1 text-[11px]">
                            <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {h.score}%
                            </span>
                            {i < prog.history.length - 1 && (
                              <span className="text-slate-400 font-bold">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal Selector Modal */}
      <CareerGoalModal
        isOpen={isGoalModalOpen}
        currentGoalId={careerRole?.id}
        allowClose={Boolean(careerRole)}
        onClose={() => setIsGoalModalOpen(false)}
        onGoalSelected={(newRole) => {
          setCareerRole(newRole as any);
          setIsGoalModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
