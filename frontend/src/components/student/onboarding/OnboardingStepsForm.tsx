"use client";

import React from "react";
import { GraduationCap, Compass, User, ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { WizardData } from "./SavedProfileCard";

interface OnboardingStepsFormProps {
  formData: WizardData;
  onChange: (field: keyof WizardData, value: any) => void;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disciplines: Array<{ id: string; name: string; code?: string }>;
  careerRoles: Array<{ id: string; title: string }>;
  selectedDiscipline: string;
  selectedRoleTitle: string;
}

export default function OnboardingStepsForm({
  formData,
  onChange,
  step,
  setStep,
  onCancel,
  onSave,
  saving,
  disciplines,
  careerRoles,
  selectedDiscipline,
  selectedRoleTitle,
}: OnboardingStepsFormProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Header with Step indicator and Sidewise Cancel button */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
              Editing Student Profile
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {step === 1
                ? "Academic & Institutional Details"
                : step === 2
                ? "AYUSH Discipline & Career Target"
                : "Professional Bio & Review"}
            </h2>
          </div>

          {/* Sidewise Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel / View Profile</span>
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-100/70">
            <span>Step {step} of 3</span>
            <span>
              {step === 1
                ? "Education Background"
                : step === 2
                ? "Discipline & Target Role"
                : "Bio & Confirmation"}
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Academic Background */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Education & Institutional Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree / Qualification</label>
                <select
                  value={formData.degree}
                  onChange={(e) => onChange("degree", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="BAMS">BAMS (Ayurvedic Medicine & Surgery)</option>
                  <option value="MD (Ayurveda)">MD / MS (Ayurveda)</option>
                  <option value="BHMS">BHMS (Homoeopathic Medicine)</option>
                  <option value="BUMS">BUMS (Unani Medicine)</option>
                  <option value="BSMS">BSMS (Siddha Medicine)</option>
                  <option value="BNYS">BNYS (Naturopathy & Yogic Sciences)</option>
                  <option value="MPharm (Ayurveda)">MPharm (Ayurvedic Pharmacy)</option>
                  <option value="MSc Life Sciences">MSc Life Sciences / Phytochemistry</option>
                  <option value="MPH">MPH (Master of Public Health)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / University</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => onChange("institution", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. National AYUSH University, New Delhi"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Academic Year</label>
                <input
                  type="text"
                  value={formData.currentYear}
                  onChange={(e) => onChange("currentYear", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Final Year, 3rd Year, Intern"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => onChange("graduationYear", parseInt(e.target.value) || 2026)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Cumulative CGPA / Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.cgpa === 0 ? "" : formData.cgpa}
                  onChange={(e) => onChange("cgpa", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 8.4"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used in explainable academic readiness matching for industry research opportunities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Discipline & Goals */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                AYUSH Discipline & Career Target
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary AYUSH Discipline</label>
                <select
                  value={formData.disciplineId}
                  onChange={(e) => onChange("disciplineId", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.code ? `(${d.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Career Pathway / Goal</label>
                <select
                  value={formData.targetRoleId}
                  onChange={(e) => onChange("targetRoleId", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {careerRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Drives your competency diagnostic questions and matched research internships.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Work Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => onChange("location", e.target.value)}
                    placeholder="e.g. New Delhi, Bengaluru, Remote"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Work Mode</label>
                  <select
                    value={formData.preferredWorkMode || "HYBRID"}
                    onChange={(e) => onChange("preferredWorkMode", e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="HYBRID">Hybrid (Onsite + Remote)</option>
                    <option value="ONSITE">Onsite (Hospital / Lab / R&D)</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Bio & Review */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Professional Bio & Summary
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Professional Bio / Research Statement</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => onChange("bio", e.target.value)}
                  placeholder="Share a concise statement summarizing your clinical expertise, research focus, and career aspirations..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Preview Before Saving:</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                    {formData.name ? formData.name[0] : "S"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {formData.name} • {formData.degree} ({formData.currentYear})
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {formData.institution} • {formData.location || "India"}
                    </div>
                  </div>
                </div>
                <div className="text-emerald-800 text-[11px] font-semibold pt-1">
                  Target Role: {selectedRoleTitle} • Discipline: {selectedDiscipline}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation / Save Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & View Profile Card</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
