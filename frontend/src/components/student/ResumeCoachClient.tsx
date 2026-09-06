"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Layers } from "lucide-react";
import ResumeUploadSection from "./resume/ResumeUploadSection";
import ResumeScoreCard from "./resume/ResumeScoreCard";
import ResumeSkillMatrix from "./resume/ResumeSkillMatrix";
import ResumeBulletImprover, { BulletItem, Recommendation } from "./resume/ResumeBulletImprover";

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

interface ScoreBreakdown {
  keywordAlignment: number;
  skillCoverage: number;
  experienceRelevance: number;
  educationRelevance: number;
  resumeStructure: number;
  bulletQuality: number;
}

interface AnalysisData {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  skillAlignments: SkillAlignment[];
  keywordReport: {
    presentKeywords: string[];
    missingKeywords: string[];
  };
  detectedCandidateSkills?: string[];
  recommendations: Recommendation[];
  improvedBullets: BulletItem[];
  careerGoalTitle: string;
}

interface ResumeRecord {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  alignmentScore: number;
  version: number;
  parsedData: string;
}

interface TrainingCourse {
  id: string;
  title: string;
  providerName: string;
  durationHours: number;
  mode: string;
  skillName: string;
}

interface ResumeCoachClientProps {
  initialResume: ResumeRecord | null;
  initialAnalysis?: AnalysisData | null;
  resumeHistory: ResumeRecord[];
  activeCareerGoal: {
    title: string;
    description: string;
    averageSalary?: string | null;
  } | null;
  trainingPrograms: TrainingCourse[];
}

export default function ResumeCoachClient({
  initialResume,
  initialAnalysis = null,
  resumeHistory: initialHistory,
  activeCareerGoal,
  trainingPrograms,
}: ResumeCoachClientProps) {
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(initialResume);
  const [history, setHistory] = useState<ResumeRecord[]>(initialHistory);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(initialAnalysis || null);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const careerTitle = activeCareerGoal?.title || "Clinical Researcher";

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/student/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setActiveResume(data.resume);
      setAnalysis(data.analysis);
      setHistory((prev) => [data.resume, ...prev.filter((r) => r.id !== data.resume.id)]);
      setSuccessMessage(`Resume "${data.resume.fileName}" uploaded and analyzed successfully!`);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during resume upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle 1-Click Demo Resume
  const handleLoadDemoResume = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/student/resume/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LOAD_DEMO_RESUME" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo load failed");
      }

      setActiveResume(data.resume);
      setAnalysis(data.analysis);
      setHistory((prev) => [data.resume, ...prev.filter((r) => r.id !== data.resume.id)]);
      setSuccessMessage("Loaded and analyzed sample AYUSH Student Resume for Clinical Research!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load sample resume.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Bullet status change (Accept / Reject / Edit)
  const handleBulletStatus = (idx: number, status: "ACCEPTED" | "REJECTED", customText?: string) => {
    if (!analysis) return;
    const updatedBullets = [...analysis.improvedBullets];
    updatedBullets[idx] = {
      ...updatedBullets[idx],
      status,
      improvedText: customText || updatedBullets[idx].improvedText,
    };
    setAnalysis({
      ...analysis,
      improvedBullets: updatedBullets,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1 & 2 & 3. Hero, Upload Action Card, and Empty State */}
      <ResumeUploadSection
        careerTitle={careerTitle}
        activeResume={activeResume}
        isUploading={isUploading}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onFileUpload={handleFileUpload}
        onLoadDemoResume={handleLoadDemoResume}
        hasAnalysis={Boolean(analysis)}
      />

      {/* 4. ACTIVE ANALYSIS DASHBOARD */}
      {analysis && (
        <>
          {/* A. ATS Score & Breakdown Metrics */}
          <ResumeScoreCard
            overallScore={analysis.overallScore}
            scoreBreakdown={analysis.scoreBreakdown}
            careerTitle={careerTitle}
          />

          {/* B & C. Resume Skill Alignment Table + Keywords */}
          <ResumeSkillMatrix
            careerTitle={careerTitle}
            skillAlignments={analysis.skillAlignments}
            keywordReport={analysis.keywordReport}
            detectedCandidateSkills={analysis.detectedCandidateSkills}
          />

          {/* D & E. AI Bullet Point Improver & Recommendations */}
          <ResumeBulletImprover
            careerTitle={careerTitle}
            improvedBullets={analysis.improvedBullets}
            recommendations={analysis.recommendations}
            onBulletStatus={handleBulletStatus}
          />

          {/* F. PERSONALIZED LEARNING BRIDGE */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "16px",
              padding: "26px",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bridge Identified Skill Gaps via Targeted Learning
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enroll in verified institutional modules to turn resume skill gaps into certified strengths
                  </p>
                </div>
              </div>
              <Link
                href="/student/learning"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                All Programs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingPrograms.slice(0, 2).map((tp) => (
                <div
                  key={tp.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Targeted for {tp.skillName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug pt-1">
                      {tp.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{tp.providerName} • {tp.durationHours} Hours ({tp.mode})</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700">Verified Certificate</span>
                    <Link
                      href="/student/learning"
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
                    >
                      Start Training
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* G. RESUME VERSION HISTORY */}
          {history.length > 0 && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-600" />
                  <h3 className="text-base font-bold text-slate-900">Resume Version History</h3>
                </div>
                <span className="text-xs text-slate-400">{history.length} Revisions Tracked</span>
              </div>

              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      h.id === activeResume?.id
                        ? "bg-emerald-50/60 border-emerald-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                        v{h.version}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{h.fileName}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(h.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">ATS Score</span>
                        <span className="text-sm font-black text-emerald-800">{Math.round(h.alignmentScore)}/100</span>
                      </div>
                      {h.id === activeResume?.id ? (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                          Current Active
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveResume(h);
                            if ((h as any).analysis) {
                              try {
                                const parsed = typeof (h as any).analysis === "string" ? JSON.parse((h as any).analysis) : (h as any).analysis;
                                setAnalysis(parsed);
                              } catch (e) {
                                console.error("Failed to parse analysis:", e);
                              }
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white border border-slate-200 rounded-md transition cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
