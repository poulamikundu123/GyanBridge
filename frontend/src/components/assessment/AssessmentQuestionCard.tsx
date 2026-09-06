"use client";

import React from "react";
import { Target, Clock, Check, ArrowLeft, ArrowRight } from "lucide-react";

export interface SkillMappingItem {
  skillId: string;
  skillName: string;
  weight: number;
}

export interface QuestionItem {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  careerRelevance?: string | null;
  metadata?: any;
  skillsMapping?: SkillMappingItem[];
  skillName?: string;
  options: Array<{
    id: string;
    optionText: string;
  }>;
}

interface AssessmentQuestionCardProps {
  careerRoleTitle: string;
  testTitle: string;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  submitting: boolean;
  onSubmit: () => void;
  questions: QuestionItem[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedAnswers: Record<string, string>;
  textAnswers: Record<string, string>;
  onSelectOption: (optionId: string) => void;
  onTextChange: (text: string) => void;
}

export default function AssessmentQuestionCard({
  careerRoleTitle,
  testTitle,
  timeLeft,
  formatTime,
  submitting,
  onSubmit,
  questions,
  currentIndex,
  setCurrentIndex,
  selectedAnswers,
  textAnswers,
  onSelectOption,
  onTextChange,
}: AssessmentQuestionCardProps) {
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount =
    Object.keys(selectedAnswers).length +
    Object.keys(textAnswers).filter((k) => textAnswers[k].trim().length > 0).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);

  const selectedOptionId = selectedAnswers[currentQ?.id];
  const currentTextAnswer = textAnswers[currentQ?.id] || "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar with Progress & Timer */}
      <div className="ayush-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
              <Target className="w-3.5 h-3.5" />
              Goal: {careerRoleTitle}
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">{testTitle}</h1>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs shadow-sm">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Counter */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-500 font-semibold gap-4">
          <span>
            Question <strong className="text-slate-900">{currentIndex + 1}</strong> of{" "}
            {questions.length}
          </span>
          <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>
            {answeredCount}/{questions.length} Answered ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="ayush-card p-6 sm:p-8 space-y-6">
          {/* Question Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Prominent AYUSH Subject Badge */}
              {(() => {
                const subjectName =
                  currentQ.metadata?.subject ||
                  currentQ.metadata?.subject_domain ||
                  (currentQ as any).subject ||
                  (currentQ as any).subject_domain ||
                  (currentQ as any).subjectDomain;
                if (!subjectName) return null;
                return (
                  <span className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase bg-amber-50 text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                    <span>📚</span>
                    <span>Subject: {subjectName}</span>
                  </span>
                );
              })()}
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                {currentQ.questionType.replace("_", " ")}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                Difficulty: {currentQ.difficulty}
              </span>
              {currentQ.careerRelevance && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {currentQ.careerRelevance}
                </span>
              )}
            </div>

            {/* Multi-Skill Mapping Weights Indicator */}
            {currentQ.skillsMapping && currentQ.skillsMapping.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 font-bold uppercase mr-1">Evaluates:</span>
                {currentQ.skillsMapping.map((sm) => (
                  <span
                    key={sm.skillId}
                    className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200"
                  >
                    {sm.skillName} ({Math.round((sm.weight || 1) * 100)}%)
                  </span>
                ))}
              </div>
            ) : currentQ.skillName ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 font-bold uppercase mr-1">Evaluates:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  {currentQ.skillName}
                </span>
              </div>
            ) : null}
          </div>

          {/* Formatted Question Text */}
          <div className="space-y-4">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQ.questionText}
            </p>

            {/* If metadata includes formatted table (Data Interpretation) */}
            {currentQ.metadata?.table && (
              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Test Arm</th>
                      <th className="p-2.5">Placebo</th>
                      <th className="p-2.5">Difference [95% CI]</th>
                      <th className="p-2.5">p-value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentQ.metadata.table.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-800">{row.param}</td>
                        <td className="p-2.5 font-semibold text-emerald-700">{row.test}</td>
                        <td className="p-2.5 text-slate-600">{row.placebo}</td>
                        <td className="p-2.5 font-mono text-slate-700">{row.diff}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{row.p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Options / Text Input depending on question type */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={option.id}
                    onClick={() => onSelectOption(option.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : letter}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed pt-0.5">
                      {option.optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Open-ended Short Answer Input */
            <div className="pt-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Your Reasoning / Clinical Justification:
              </label>
              <textarea
                rows={4}
                value={currentTextAnswer}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Type your structured explanation, citing relevant clinical, regulatory, or classical criteria..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Evaluation checks for key regulatory, pharmacological, or ethical principles.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              {isLast ? (
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit All Answers"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Number Quick Jumper */}
      <div className="ayush-card p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Question Matrix (Jump to Any Question)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered =
              Boolean(selectedAnswers[q.id]) || Boolean(textAnswers[q.id]?.trim().length);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-slate-900 text-white ring-2 ring-emerald-500"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
