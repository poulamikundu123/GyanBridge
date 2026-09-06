"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Briefcase,
  ArrowRight,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  GraduationCap,
  Sparkles,
  Layers,
} from "lucide-react";

export interface SkillScoreResult {
  skillId: string;
  skillName: string;
  categoryName: string;
  scorePercentage: number;
  requiredProficiency: number;
  gapPoints: number;
  status: "STRENGTH" | "ON_TRACK" | "PRIORITY_GAP" | string;
  isMandatory: boolean;
  weight: number;
  subject?: string;
}

export interface QuestionReviewItem {
  questionId: string;
  subject?: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  isCorrect: boolean;
  yourAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  skillsTested?: Array<{ skillName: string; weight: number }>;
}

export interface SubjectMasteryItem {
  subject: string;
  subjectName?: string;
  scorePercentage: number;
  correctCount: number;
  totalCount: number;
  status: "MASTERED" | "PROFICIENT" | "NEEDS_REVIEW" | string;
}

export interface AssessmentResultData {
  attemptId: string;
  attemptNumber?: number;
  careerRoleTitle?: string;
  overallScorePercentage?: number;
  careerReadinessScore?: number;
  completedAt?: string;
  skillScores?: SkillScoreResult[];
  topStrengths?: SkillScoreResult[];
  priorityGaps?: SkillScoreResult[];
  subjectMastery?: SubjectMasteryItem[];
  questionReview?: QuestionReviewItem[];
  recommendedLearnings?: Array<{
    id: string;
    title: string;
    provider: string;
    targetedSkill: string;
    gapCovered: number;
  }>;
}

interface AssessmentResultsViewProps {
  result: AssessmentResultData;
  onRetake: () => void;
}

export default function AssessmentResultsView({ result, onRetake }: AssessmentResultsViewProps) {
  const [reviewExpanded, setReviewExpanded] = useState(false);

  const getSafeString = (val: any, fallback = ""): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (typeof val === "object") {
      return val.name || val.title || val.description || val.code || fallback;
    }
    return fallback;
  };

  // Normalize camelCase and snake_case properties
  const anyRes = result as any;
  const overallScore = Math.round(
    Number(result.overallScorePercentage ?? anyRes.score_percentage ?? anyRes.overall_score_percentage ?? 0) || 0
  );
  const careerReadiness = Math.round(
    Number(result.careerReadinessScore ?? anyRes.readiness_score ?? anyRes.career_readiness_score ?? 0) || 0
  );
  const attemptNumber = Number(result.attemptNumber ?? anyRes.attempt_number ?? 1) || 1;
  const careerRoleTitle = getSafeString(
    result.careerRoleTitle ?? anyRes.career_role_title ?? anyRes.test_title,
    "AYUSH Career Role"
  );

  const rawSkillScores: any[] = result.skillScores || anyRes.skill_scores || [];
  const skillScores: SkillScoreResult[] = rawSkillScores.map((sk) => ({
    skillId: getSafeString(sk.skillId || sk.skill_id, "skill"),
    skillName: getSafeString(sk.skillName || sk.skill_name, "Core Competency"),
    categoryName: getSafeString(sk.categoryName || sk.category_name, "Clinical & Regulatory Standards"),
    scorePercentage: Math.round(Number(sk.scorePercentage ?? sk.score_percentage ?? 0) || 0),
    requiredProficiency: Number(sk.requiredProficiency ?? sk.required_proficiency ?? 70) || 70,
    gapPoints: Number(sk.gapPoints ?? sk.gap_points ?? Math.max(0, 70 - Math.round(Number(sk.scorePercentage ?? sk.score_percentage ?? 0) || 0))) || 0,
    status: getSafeString(sk.status || ((sk.scorePercentage ?? sk.score_percentage ?? 0) >= 70 ? "STRENGTH" : "PRIORITY_GAP"), "STRENGTH"),
    isMandatory: Boolean(sk.isMandatory ?? sk.is_mandatory ?? true),
    weight: Number(sk.weight) || 1.0,
    subject: getSafeString(sk.subject, ""),
  }));

  const rawStrengths: any[] = result.topStrengths || anyRes.top_strengths || skillScores.filter((s) => s.scorePercentage >= 70);
  const topStrengths: SkillScoreResult[] = rawStrengths.map((sk) => ({
    skillId: getSafeString(sk.skillId || sk.skill_id, "sk-str"),
    skillName: getSafeString(sk.skillName || sk.skill_name, "Competency"),
    categoryName: getSafeString(sk.categoryName || sk.category_name, "Clinical"),
    scorePercentage: Math.round(Number(sk.scorePercentage ?? sk.score_percentage ?? 80) || 80),
    requiredProficiency: Number(sk.requiredProficiency ?? sk.required_proficiency ?? 70) || 70,
    gapPoints: 0,
    status: "STRENGTH",
    isMandatory: Boolean(sk.isMandatory ?? sk.is_mandatory ?? true),
    weight: Number(sk.weight) || 1.0,
  }));

  const rawGaps: any[] = result.priorityGaps || anyRes.priority_gaps || skillScores.filter((s) => s.scorePercentage < 70);
  const priorityGaps: SkillScoreResult[] = rawGaps.map((sk) => ({
    skillId: getSafeString(sk.skillId || sk.skill_id, "sk-gap"),
    skillName: getSafeString(sk.skillName || sk.skill_name, "Competency Deficit"),
    categoryName: getSafeString(sk.categoryName || sk.category_name, "Regulatory"),
    scorePercentage: Math.round(Number(sk.scorePercentage ?? sk.score_percentage ?? 40) || 40),
    requiredProficiency: Number(sk.requiredProficiency ?? sk.required_proficiency ?? 70) || 70,
    gapPoints: Number(sk.gapPoints ?? sk.gap_points ?? Math.max(0, 70 - Math.round(Number(sk.scorePercentage ?? sk.score_percentage ?? 0) || 0))) || 0,
    status: "PRIORITY_GAP",
    isMandatory: Boolean(sk.isMandatory ?? sk.is_mandatory ?? true),
    weight: Number(sk.weight) || 1.0,
  }));

  const rawSubjectMastery: any[] = result.subjectMastery || anyRes.subject_mastery || [];
  const subjectMastery: SubjectMasteryItem[] = rawSubjectMastery.map((sm) => ({
    subject: getSafeString(sm.subject || sm.subjectName, "Core Subject"),
    subjectName: getSafeString(sm.subjectName || sm.subject, "Core Subject"),
    scorePercentage: Math.round(Number(sm.scorePercentage ?? sm.score_percentage ?? 0) || 0),
    correctCount: Number(sm.correctCount ?? sm.correct_count ?? 0) || 0,
    totalCount: Number(sm.totalCount ?? sm.total_count ?? 1) || 1,
    status: getSafeString(sm.status, "PROFICIENT"),
  }));

  const rawQuestions: any[] = result.questionReview || anyRes.question_review || anyRes.detailed_feedback || [];
  const questionReview: QuestionReviewItem[] = rawQuestions.map((q) => ({
    questionId: q.questionId || q.question_id || "q",
    subject: q.subject || (q.metadata && q.metadata.subject),
    questionText: q.questionText || q.question_text || "Scenario Question",
    questionType: q.questionType || q.question_type || "SITUATIONAL",
    difficulty: q.difficulty || "MEDIUM",
    isCorrect: Boolean(q.isCorrect ?? q.is_correct),
    yourAnswer: q.yourAnswer ?? q.selected_option ?? null,
    correctAnswer: q.correctAnswer ?? q.correct_option ?? null,
    explanation: q.explanation || null,
    skillsTested: q.skillsTested || q.skills_tested || [],
  }));

  const totalQuestions = questionReview.length || 12;
  const correctCount = questionReview.filter((q) => q.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const incorrectQuestions = questionReview.filter((q) => !q.isCorrect);
  const correctQuestions = questionReview.filter((q) => q.isCorrect);

  const rawLearnings: any[] = result.recommendedLearnings || anyRes.recommended_learnings || [];
  const learningModules = rawLearnings.length > 0
    ? rawLearnings
    : priorityGaps.slice(0, 3).map((gap, idx) => ({
        id: `fallback-${idx}`,
        title: `${gap.skillName} — Clinical Practice & Application Module`,
        provider: "AYUSH National Skill Intelligence Platform",
        targetedSkill: gap.skillName,
        gapCovered: gap.gapPoints,
      }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Hero Banner */}
      <div className="rounded-[12px] bg-[#003c33] border border-emerald-950/40 p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-mono font-bold mb-3">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              Assessment Attempt #{attemptNumber} Completed
            </div>
            <h1 className="font-heading font-medium text-2xl sm:text-3xl text-white tracking-tight">
              {careerRoleTitle}
            </h1>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
              Mixed Multi-Subject Assessment evaluated {totalQuestions} scenario questions across the 6 AYUSH core clinical & regulatory domains. Skills are now saved as verified in your professional credential ledger.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-[12px] bg-white/10 backdrop-blur border border-white/15 text-center min-w-[120px]">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-300">Overall Score</div>
              <div className="font-heading font-bold text-3xl text-white mt-0.5">
                {overallScore}%
              </div>
              <div className="text-[10px] font-mono text-emerald-200/80 mt-0.5">{correctCount}/{totalQuestions} Correct</div>
            </div>

            <div className="p-4 rounded-[12px] bg-emerald-500/20 backdrop-blur border border-emerald-400/30 text-center min-w-[130px]">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-300">Career Readiness</div>
              <div className="font-heading font-bold text-3xl text-emerald-300 mt-0.5">
                {careerReadiness}%
              </div>
              <div className="text-[10px] font-mono text-emerald-200/80 mt-0.5">AYUSH Benchmark</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[12px] bg-emerald-50/70 border border-emerald-200/80 text-center">
          <div className="font-heading font-bold text-2xl text-emerald-800">{correctCount}</div>
          <div className="text-[10px] font-mono uppercase font-bold text-emerald-700">Correct Answers</div>
        </div>
        <div className="p-4 rounded-[12px] bg-red-50/70 border border-red-200/80 text-center">
          <div className="font-heading font-bold text-2xl text-red-700">{incorrectCount}</div>
          <div className="text-[10px] font-mono uppercase font-bold text-red-600">Incorrect Answers</div>
        </div>
        <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 text-center">
          <div className="font-heading font-bold text-2xl text-slate-800">{topStrengths.length}</div>
          <div className="text-[10px] font-mono uppercase font-bold text-slate-600">Competencies Met</div>
        </div>
        <div className="p-4 rounded-[12px] bg-amber-50/70 border border-amber-200/80 text-center">
          <div className="font-heading font-bold text-2xl text-amber-700">{priorityGaps.length}</div>
          <div className="text-[10px] font-mono uppercase font-bold text-amber-700">Priority Skill Gaps</div>
        </div>
      </div>

      {/* SUBJECT-WISE MASTERY BREAKDOWN (Multi-Subject Mixed Evaluation) */}
      {subjectMastery.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Multi-Subject Mixed Assessment Breakdown
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluated across the 6 core AYUSH disciplines to ensure holistic clinical competence
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              6 Subjects Tested
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {subjectMastery.map((subj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-slate-900 leading-snug">
                    {subj.subject}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                      subj.scorePercentage >= 75
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : subj.scorePercentage >= 50
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {subj.scorePercentage >= 75 ? "Mastered" : subj.scorePercentage >= 50 ? "Proficient" : "Needs Review"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Mastery Score</span>
                    <span className="font-bold text-slate-800">{subj.scorePercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subj.scorePercentage >= 75
                          ? "bg-emerald-600"
                          : subj.scorePercentage >= 50
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${subj.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                  <span>Questions Correct</span>
                  <span className="font-bold text-slate-700">
                    {subj.correctCount} of {subj.totalCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Priority Gaps Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Strengths */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Validated Competencies Met
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Skills meeting or exceeding the 70% threshold have been marked as <strong>ASSESSMENT_VERIFIED</strong> on your profile:
          </p>

          <div className="space-y-2.5">
            {topStrengths.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No competencies reached the 70% target yet. Bridge your deficits using the recommended modules below.
              </div>
            ) : (
              topStrengths.slice(0, 4).map((str) => (
                <div
                  key={str.skillId}
                  className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-950 block">{str.skillName}</span>
                    <span className="text-[11px] text-emerald-800">
                      Score: <strong>{str.scorePercentage}%</strong> • Category: {str.categoryName}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                    Verified
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Skill Gaps */}
        <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Priority Skill Gaps to Bridge
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Areas where your verified score is below target proficiency. Rebalance with learning:
          </p>

          <div className="space-y-2.5">
            {priorityGaps.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No critical gaps detected! You meet or exceed all required competency benchmarks.
              </div>
            ) : (
              priorityGaps.slice(0, 4).map((gap) => (
                <div
                  key={gap.skillId}
                  className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-950 block">{gap.skillName}</span>
                    <span className="text-[11px] text-amber-800">
                      Score: <strong>{gap.scorePercentage}%</strong> • Benchmark: <strong>{gap.requiredProficiency}%</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      -{gap.gapPoints} pts Gap
                    </span>
                    {gap.isMandatory && (
                      <span className="text-[10px] text-red-700 block font-semibold mt-0.5">
                        Mandatory
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* REVIEW YOUR ANSWERS — Expandable Question Log */}
      {questionReview.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setReviewExpanded(!reviewExpanded)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Review All Questions & Clinical Rationales ({correctCount} Correct, {incorrectCount} Incorrect)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click to inspect detailed statutory explanations, classical benchmarks, and question breakdown
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg hidden sm:inline">
                {totalQuestions} Questions
              </span>
              {reviewExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>

          {reviewExpanded && (
            <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
              {[...incorrectQuestions, ...correctQuestions].map((q, idx) => (
                <div
                  key={q.questionId || idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    q.isCorrect
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-red-200 bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          q.isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {q.isCorrect ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 leading-relaxed">
                        {q.questionText}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {q.subject && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                          {q.subject}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                        {q.questionType ? q.questionType.replace("_", " ") : "SCENARIO"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-50 text-purple-700">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        q.isCorrect
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase block mb-0.5 ${
                          q.isCorrect ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        Your Answer
                      </span>
                      <span className="text-slate-800 font-medium leading-snug block">
                        {q.yourAnswer || "— No answer provided"}
                      </span>
                    </div>

                    {!q.isCorrect && q.correctAnswer && (
                      <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">
                          Correct Answer
                        </span>
                        <span className="text-emerald-900 font-medium leading-snug block">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="ml-7 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                      <span className="text-[10px] font-bold uppercase text-blue-800 block mb-0.5">
                        Statutory & Classical Explanation
                      </span>
                      <p className="text-blue-950 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Evaluated Competency Ledger Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Complete Evaluated Competency Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated through multi-skill proportional weighting across all {totalQuestions} assessment questions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                <th className="p-3">Competency Skill</th>
                <th className="p-3 text-center">Your Verified Score</th>
                <th className="p-3 text-center">Required Benchmark</th>
                <th className="p-3 text-center">Gap Deficit</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillScores.map((sk) => {
                const statusStr = typeof sk.status === "string" ? sk.status : (sk.scorePercentage >= 70 ? "STRENGTH" : "PRIORITY_GAP");
                return (
                  <tr key={sk.skillId} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sk.skillName}</div>
                      <div className="text-[11px] text-slate-500">
                        {sk.categoryName} • Weight: {sk.weight}x {sk.isMandatory && "• Mandatory"}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sk.scorePercentage >= sk.requiredProficiency
                                ? "bg-emerald-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${sk.scorePercentage}%` }}
                          />
                        </div>
                        <span>{sk.scorePercentage}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-600">
                      {sk.requiredProficiency}%
                    </td>
                    <td className="p-3 text-center">
                      {sk.gapPoints > 0 ? (
                        <span className="font-bold text-amber-700">-{sk.gapPoints} pts</span>
                      ) : (
                        <span className="font-bold text-emerald-700">0 pts</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          statusStr === "STRENGTH"
                            ? "bg-emerald-100 text-emerald-800"
                            : statusStr === "ON_TRACK"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {statusStr ? statusStr.replace("_", " ") : (sk.scorePercentage >= 70 ? "STRENGTH" : "PRIORITY GAP")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personalized Learning Program Recommendations */}
      {learningModules.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                Personalized Learning Modules to Close Your Gaps
              </h2>
            </div>
            <Link
              href="/student/learning"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Explore Learning Hub →
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            These targeted micro-modules directly address your highest deficit skills for{" "}
            <strong>{careerRoleTitle}</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {learningModules.map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    Targets: {prog.targetedSkill}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                    {prog.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">{prog.provider}</p>
                  <p className="text-[10px] font-bold text-amber-700 mt-1">
                    Bridges up to {prog.gapCovered} gap points
                  </p>
                </div>

                <Link
                  href={`/student/learning?progId=${prog.id}`}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs text-center transition block"
                >
                  Enroll & Bridge Gap
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Retake Assessment
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/student/opportunities"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Briefcase className="w-4 h-4" /> View Matched Opportunities
          </Link>

          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
