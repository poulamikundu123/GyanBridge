"use client";

import React, { useRef } from "react";
import { Cpu, Target, FileText, Clock, UploadCloud, XCircle, CheckCircle2 } from "lucide-react";

interface ResumeRecord {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  alignmentScore: number;
  version: number;
  parsedData: string;
}

interface ResumeUploadSectionProps {
  careerTitle: string;
  activeResume: ResumeRecord | null;
  isUploading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onFileUpload: (file: File) => void;
  onLoadDemoResume: () => void;
  hasAnalysis: boolean;
}

export default function ResumeUploadSection({
  careerTitle,
  activeResume,
  isUploading,
  errorMessage,
  successMessage,
  onFileUpload,
  onLoadDemoResume,
  hasAnalysis,
}: ResumeUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      {/* 1. HERO BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-[12px] p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex-1 min-w-0 w-full max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold mb-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Career Alignment Engine</span>
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight mb-2">
            Resume &amp; AI Career Coach
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Align your CV directly against verified competency benchmarks for{" "}
            <strong className="text-slate-900 font-semibold">{careerTitle}</strong>. Detect keyword gaps,
            validate clinical evidence, and optimize bullet points with zero hallucinated claims.
          </p>

          {/* Telemetry Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center flex-wrap gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Target: <strong>{careerTitle}</strong></span>
            </div>
            {activeResume && (
              <>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Resume: <strong>{activeResume.fileName}</strong> (v{activeResume.version})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(activeResume.uploadedAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Character Illustration Naturally Blended */}
        <div className="relative w-44 h-40 sm:w-56 sm:h-52 md:w-64 md:h-56 lg:w-72 lg:h-60 shrink-0 flex items-center justify-center pointer-events-none mx-auto md:mx-0">
          <img
            src="/planner_student.png"
            alt="AYUSH Student Career Portfolio"
            className="w-full h-full object-contain max-h-[240px]"
          />
        </div>
      </div>

      {/* 2. UPLOAD & SAMPLE RESUME ACTION CARD */}
      <div className="p-5 sm:p-6 rounded-[12px] bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#003c33]" />
              <h2 className="font-heading font-medium text-base text-slate-900">Upload or Update Your Resume</h2>
            </div>
            <p className="text-xs text-slate-500">
              Upload your resume in PDF or DOCX format (Max 10MB), or test with our pre-loaded sample BAMS student resume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileUpload(e.target.files[0]);
                }
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-[8px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>{isUploading ? "Processing..." : "Upload PDF / DOCX"}</span>
            </button>

            <button
              onClick={onLoadDemoResume}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-[8px] bg-[#003c33] hover:bg-[#044e43] text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>{isUploading ? "Analyzing..." : "Load Sample AYUSH Resume (BAMS)"}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[8px] text-xs text-red-700 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-[#edfce9] border border-[#a7f3d0] rounded-[8px] text-xs text-[#003c33] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 3. EMPTY STATE IF NO RESUME ANALYZED */}
      {!hasAnalysis && !activeResume && (
        <div className="p-12 rounded-[12px] bg-white border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#edfce9] border border-[#a7f3d0] flex items-center justify-center text-[#003c33] shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-medium text-base text-slate-900">Your resume hasn&apos;t been analyzed yet.</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your resume to see how well it aligns with your career goal (<strong>{careerTitle}</strong>),
              uncover critical missing keywords, verify skill coverage, and polish bullet points.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-[8px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resume</span>
            </button>
            <button
              onClick={onLoadDemoResume}
              className="px-4 py-2 rounded-[8px] bg-[#003c33] hover:bg-[#044e43] text-white text-xs font-medium transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Load Sample AYUSH Resume (BAMS)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
