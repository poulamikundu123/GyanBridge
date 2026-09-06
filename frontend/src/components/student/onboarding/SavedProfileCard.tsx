"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  BadgeCheck,
  Building2,
  MapPin,
  Pencil,
  Award,
  GraduationCap,
  Compass,
  FileText,
  Target,
} from "lucide-react";

export interface WizardData {
  name: string;
  email: string;
  degree: string;
  institution: string;
  currentYear: string;
  graduationYear: number;
  cgpa: number;
  disciplineId: string;
  targetRoleId: string;
  location: string;
  bio: string;
  preferredWorkMode?: string;
}

interface SavedProfileCardProps {
  formData: WizardData;
  selectedDiscipline: string;
  selectedRoleTitle: string;
  readinessScore: number;
  showSuccessToast: boolean;
  onDismissToast: () => void;
  onEditProfile: (stepNumber?: number) => void;
}

export default function SavedProfileCard({
  formData,
  selectedDiscipline,
  selectedRoleTitle,
  readinessScore,
  showSuccessToast,
  onDismissToast,
  onEditProfile,
}: SavedProfileCardProps) {
  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <div className="space-y-6">
      {/* Success Toast Banner */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-emerald-950">Profile Saved Successfully!</span>
              Your academic background and career targets have been updated in the intelligence ledger.
            </div>
          </div>
          <button
            onClick={onDismissToast}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Card Top Hero Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            {/* Scholar Identification */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                {initials}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formData.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    AYUSH Verified Scholar
                  </span>
                </div>

                <p className="text-xs text-emerald-100/80">{formData.email}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-200/90">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    {formData.institution}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {formData.location || "India"}
                  </span>
                </div>
              </div>
            </div>

            {/* SIDEWISE EDIT PROFILE OPTION */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-start sm:self-center">
              <button
                id="edit-profile-btn"
                onClick={() => onEditProfile(1)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

              <Link
                href="/student/portfolio"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>Digital Portfolio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 bg-slate-50/70 text-xs">
          <div className="p-4 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Qualification
            </span>
            <span className="font-bold text-slate-900 block truncate">{formData.degree}</span>
            <span className="text-[11px] text-slate-500">{formData.currentYear}</span>
          </div>

          <div className="p-4 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Cumulative CGPA
            </span>
            <span className="font-bold text-slate-900 block">
              {formData.cgpa > 0 ? `${formData.cgpa} / 10.0` : "Not specified"}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Verified Academic</span>
          </div>

          <div className="p-4 border-r border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Discipline
            </span>
            <span className="font-bold text-emerald-800 block truncate">{selectedDiscipline}</span>
            <span className="text-[11px] text-slate-500">AYUSH Council</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Target Career Goal
            </span>
            <span className="font-bold text-slate-900 block truncate">{selectedRoleTitle}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {readinessScore > 0 ? `${readinessScore}% Readiness` : "Assessment Ready"}
            </span>
          </div>
        </div>

        {/* Detailed Profile Sections */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Academic Background */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  Academic Credentials
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Graduating {formData.graduationYear}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Institution / College</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{formData.institution}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Degree / Course</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{formData.degree}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Current Standing</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{formData.currentYear}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 font-medium block">Academic Performance</span>
                  <span className="font-bold text-emerald-800 block mt-0.5">
                    {formData.cgpa > 0 ? `${formData.cgpa} CGPA` : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: AYUSH Domain & Career Target */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  AYUSH Domain & Career Target
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {formData.preferredWorkMode || "HYBRID"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Primary AYUSH Discipline</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 mt-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedDiscipline}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Active Target Career Goal</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900">{selectedRoleTitle}</span>
                    <Link
                      href="/student/careers"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      Explore Role →
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Preferred Work Location</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {formData.location || "New Delhi, India (Open to Relocation)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary / Bio */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                Professional Bio & Clinical Objectives
              </h3>
              <button
                onClick={() => onEditProfile(3)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit Bio
              </button>
            </div>

            <p className="text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-200/80">
              &ldquo;{formData.bio || "No professional summary added yet. Click 'Edit Profile' to add your clinical and research objectives."}&rdquo;
            </p>
          </div>

          {/* Bottom Controls Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile is active & calibrated with the AYUSH Match Engine
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditProfile(1)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                Edit Profile
              </button>

              <Link
                href="/student/assessment"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Target className="w-3.5 h-3.5" />
                Diagnostic Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
