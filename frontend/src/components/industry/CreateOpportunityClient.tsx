"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, CheckCircle2, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";

interface CreateOpportunityClientProps {
  sectors: Array<{ id: string; name: string }>;
  disciplines: Array<{ id: string; name: string }>;
  skills: Array<{ id: string; name: string; categoryName: string }>;
}

interface RequiredSkillRow {
  skillId: string;
  requiredProficiency: number;
  isMandatory: boolean;
  weight: number;
}

export default function CreateOpportunityClient({ sectors, disciplines, skills }: CreateOpportunityClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [opportunityType, setOpportunityType] = useState("INTERNSHIP");
  const [sectorId, setSectorId] = useState(sectors[0]?.id || "");
  const [disciplineId, setDisciplineId] = useState("");
  const [eligibilityDegree, setEligibilityDegree] = useState("BAMS / BHMS / Life Sciences");
  const [location, setLocation] = useState("New Delhi, India");
  const [workMode, setWorkMode] = useState("HYBRID");
  const [duration, setDuration] = useState("6 Months");
  const [stipendSalary, setStipendSalary] = useState("₹25,000 / month");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Granular Skill Requirements List
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkillRow[]>([
    { skillId: skills[0]?.id || "", requiredProficiency: 75, isMandatory: true, weight: 1.5 },
  ]);

  const handleAddSkill = () => {
    setRequiredSkills((prev) => [
      ...prev,
      { skillId: skills[0]?.id || "", requiredProficiency: 70, isMandatory: true, weight: 1.0 },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setRequiredSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSkillChange = (index: number, field: keyof RequiredSkillRow, value: any) => {
    setRequiredSkills((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await fetch("/api/industry/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          opportunityType,
          sectorId,
          disciplineId: disciplineId || null,
          eligibilityDegree,
          location,
          workMode,
          duration,
          stipendSalary,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          description,
          requiredSkills,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/industry/opportunities");
        router.refresh();
      } else {
        setError(data.detail || data.message || "Failed to create opportunity. Please verify all fields.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ayush-card p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Post New Industry Opportunity</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Define core details and set exact competency benchmarks to calibrate the candidate matching algorithm
        </p>
      </div>

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" />
          Opportunity Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clinical Research Intern (Herbal Formulations Trial)"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Opportunity Type *</label>
            <select
              value={opportunityType}
              onChange={(e) => setOpportunityType(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="JOB">Full-Time Job</option>
              <option value="PROJECT">Live Industry Project</option>
              <option value="APPRENTICESHIP">Apprenticeship</option>
              <option value="TRAINING">Industrial Training</option>
              <option value="FDP">Faculty Development Program (FDP)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Industry Sector *</label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">AYUSH Discipline Focus</label>
            <select
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Cross-Disciplinary / Open to All AYUSH</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Eligible Degrees *</label>
            <input
              type="text"
              required
              value={eligibilityDegree}
              onChange={(e) => setEligibilityDegree(e.target.value)}
              placeholder="e.g. BAMS, BHMS, or Life Sciences"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Work Mode *</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Duration *</label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 6 Months / Full Time"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Stipend / Compensation</label>
            <input
              type="text"
              value={stipendSalary}
              onChange={(e) => setStipendSalary(e.target.value)}
              placeholder="e.g. ₹25,000 / month"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Role Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail responsibilities, project scope, clinical protocol duties, and learning outcomes..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: CRUCIAL FEATURE - Granular Skill Requirement Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Granular Skill Requirements & Benchmarks
            </h3>
            <p className="text-[11px] text-slate-500">
              The matching engine directly compares these required proficiency levels against student verified scores.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Skill Requirement
          </button>
        </div>

        <div className="space-y-3">
          {requiredSkills.map((row, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
            >
              <div className="sm:col-span-5">
                <label className="block font-semibold text-slate-700 mb-1">Skill from Taxonomy</label>
                <select
                  value={row.skillId}
                  onChange={(e) => handleSkillChange(idx, "skillId", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Proficiency ({row.requiredProficiency}%)
                </label>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={5}
                  value={row.requiredProficiency}
                  onChange={(e) => handleSkillChange(idx, "requiredProficiency", parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-4 pt-4 sm:pt-0">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={row.isMandatory}
                    onChange={(e) => handleSkillChange(idx, "isMandatory", e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Mandatory</span>
                </label>
              </div>

              <div className="sm:col-span-1 text-right">
                {requiredSkills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Submission */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitting ? "Publishing..." : "Publish Opportunity to AYUSH Ecosystem"}
        </button>
      </div>
    </form>
  );
}
