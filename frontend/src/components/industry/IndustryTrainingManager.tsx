"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  Users,
  Clock,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Building2,
  X,
  Target,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";

interface EnrolledScholar {
  id: string;
  enrollment_id?: string;
  student_profile_id?: string;
  student_name: string;
  student_email?: string;
  degree?: string;
  institution?: string;
  discipline?: string;
  enrolled_at?: string | null;
  completed_at?: string | null;
  status: string;
  progress_percent: number;
  readiness_score?: number;
}

interface TrainingProgramItem {
  id: string;
  title: string;
  provider_name?: string;
  providerName?: string;
  company_name?: string;
  is_mine?: boolean;
  isMine?: boolean;
  category?: string;
  level?: string;
  mode?: string;
  format?: string;
  duration_hours?: number;
  durationHours?: number;
  duration_weeks?: number;
  certificate_provided?: boolean;
  description?: string;
  syllabus?: string | null;
  external_link?: string | null;
  skills?: string[];
  skills_detail?: Array<{
    skill_id: string;
    skill_name: string;
    proficiency_gain: number;
  }>;
  enrolled_count?: number;
  in_progress_count?: number;
  completed_count?: number;
  enrollments?: EnrolledScholar[];
  _count?: { enrollments?: number };
}

interface IndustryTrainingManagerProps {
  initialPrograms: TrainingProgramItem[];
  availableSkills: Array<{ id: string; name: string }>;
  companyName: string;
}

export default function IndustryTrainingManager({
  initialPrograms,
  availableSkills,
  companyName,
}: IndustryTrainingManagerProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<TrainingProgramItem[]>(initialPrograms);
  const [filterTab, setFilterTab] = useState<"ALL" | "HOSTED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  // Host modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CLINICAL_RESEARCH");
  const [mode, setMode] = useState("HYBRID");
  const [level, setLevel] = useState("INTERMEDIATE");
  const [durationHours, setDurationHours] = useState(30);
  const [certificateProvided, setCertificateProvided] = useState(true);
  const [description, setDescription] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [proficiencyGain, setProficiencyGain] = useState(25);

  // Stats calculation
  const totalPrograms = programs.length;
  const totalEnrolled = programs.reduce(
    (sum, p) => sum + (p.enrolled_count ?? p.enrollments?.length ?? p._count?.enrollments ?? 0),
    0
  );
  const totalInProgress = programs.reduce((sum, p) => sum + (p.in_progress_count ?? 0), 0);
  const totalCompleted = programs.reduce((sum, p) => sum + (p.completed_count ?? 0), 0);

  const toggleExpand = (progId: string) => {
    setExpandedProgramId((prev) => (prev === progId ? null : progId));
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Please provide both a program title and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const skillsPayload = selectedSkillIds.map((sId) => ({
        skill_id: sId,
        proficiency_gain: proficiencyGain,
      }));

      const res = await fetch("/api/industry/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          mode,
          level,
          duration_hours: Number(durationHours),
          certificate_provided: certificateProvided,
          description,
          syllabus,
          skills: skillsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || "Failed to publish program");
      }

      // Optimistically add to local state
      const selectedSkillNames = availableSkills
        .filter((s) => selectedSkillIds.includes(s.id))
        .map((s) => s.name);

      const newProg: TrainingProgramItem = {
        id: data.program_id || `prog-${Date.now()}`,
        title,
        provider_name: companyName,
        company_name: companyName,
        is_mine: true,
        isMine: true,
        category,
        mode,
        level,
        duration_hours: Number(durationHours),
        certificate_provided: certificateProvided,
        description,
        syllabus,
        skills: selectedSkillNames,
        enrolled_count: 0,
        in_progress_count: 0,
        completed_count: 0,
        enrollments: [],
      };

      setPrograms([newProg, ...programs]);
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setSyllabus("");
      setSelectedSkillIds([]);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating the program.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const isMine = p.is_mine ?? p.isMine;
    if (filterTab === "HOSTED" && !isMine) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchCategory = (p.category || "").toLowerCase().includes(q);
      const matchProvider = (p.provider_name || p.providerName || "").toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCategory || matchProvider;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Host Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#003c33]" />
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              Industry Learning & Training Programs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish structured practical workshops and certification courses. Enrolled scholars synced with their target career goals appear here in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#003c33] hover:bg-[#002b24] text-white font-medium text-xs shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host New Training Program</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ayush-card p-4 rounded-[12px] border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Programs</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-heading font-bold text-2xl text-slate-900 mt-2">{totalPrograms}</p>
          <span className="text-[10px] text-slate-400 font-mono">Published modules</span>
        </div>

        <div className="ayush-card p-4 rounded-[12px] border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-medium">Total Enrolled Scholars</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-heading font-bold text-2xl text-[#003c33] mt-2">{totalEnrolled}</p>
          <span className="text-[10px] text-emerald-700 font-mono">Scholars in training</span>
        </div>

        <div className="ayush-card p-4 rounded-[12px] border border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-800 font-medium">Active Trainees</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-heading font-bold text-2xl text-blue-900 mt-2">{totalInProgress}</p>
          <span className="text-[10px] text-blue-600 font-mono">In progress (30%-90%)</span>
        </div>

        <div className="ayush-card p-4 rounded-[12px] border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Certified Scholars</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-heading font-bold text-2xl text-slate-900 mt-2">{totalCompleted}</p>
          <span className="text-[10px] text-slate-400 font-mono">Credentials issued</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[#003c33] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Programs ({programs.length})
          </button>
          <button
            onClick={() => setFilterTab("HOSTED")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition cursor-pointer ${
              filterTab === "HOSTED"
                ? "bg-[#003c33] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hosted by Us ({programs.filter((p) => p.is_mine ?? p.isMine).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[12px] border border-slate-200 text-slate-500 text-xs">
            No training programs found matching your search. Click "Host New Training Program" above to publish one.
          </div>
        ) : (
          filteredPrograms.map((prog) => {
            const enrollments = prog.enrollments || [];
            const enrolledCount = prog.enrolled_count ?? enrollments.length;
            const isExpanded = expandedProgramId === prog.id;
            const isMine = prog.is_mine ?? prog.isMine;

            return (
              <div
                key={prog.id}
                className="bg-white rounded-[12px] border border-slate-200/90 shadow-2xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Program Header */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-[6px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {prog.category || "Professional Training"}
                        </span>
                        <span className="text-xs text-slate-500">• {prog.level || "Intermediate"}</span>
                        <span className="text-xs text-slate-500">• {prog.mode || prog.format || "HYBRID"}</span>
                        <span className="text-xs text-slate-500">• {prog.duration_hours || prog.durationHours || 30} Hours</span>
                        {isMine && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-blue-100 text-blue-800 font-bold border border-blue-200">
                            HOSTED BY YOU
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-medium text-lg text-slate-900">{prog.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{prog.provider_name || prog.providerName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{prog.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-2 text-[11px]">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Target className="w-3 h-3 text-emerald-600" /> Skills Imparted:
                        </span>
                        {(prog.skills_detail || []).length > 0 ? (
                          prog.skills_detail!.map((ts) => (
                            <span
                              key={ts.skill_id}
                              className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[6px] font-medium"
                            >
                              {ts.skill_name}{" "}
                              <strong className="text-emerald-700 font-mono">(+{ts.proficiency_gain}%)</strong>
                            </span>
                          ))
                        ) : (
                          (prog.skills || []).map((skName, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[6px] font-medium"
                            >
                              {skName}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Enrolled Scholars Counter & Expand Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-500 font-medium block">
                          Enrolled Scholars
                        </span>
                        <div className="flex items-center gap-1.5 sm:justify-end mt-0.5">
                          <Users className="w-4 h-4 text-emerald-700" />
                          <span className="font-heading font-bold text-2xl text-emerald-700">
                            {enrolledCount}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(prog.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Scholars" : "View Scholars"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enrolled Scholars Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-700" />
                        <span>Enrolled Scholars Roster ({enrolledCount})</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Real-time student portal synchronization
                      </span>
                    </div>

                    {enrollments.length === 0 ? (
                      <div className="p-4 bg-white rounded-[8px] border border-slate-200 text-center text-xs text-slate-500">
                        No scholars have enrolled in this program yet. This module is active and promoted to students whose target career goals require these competencies.
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-white rounded-[8px] border border-slate-200 shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2.5">Scholar Name</th>
                              <th className="px-4 py-2.5">Degree & Institution</th>
                              <th className="px-4 py-2.5">AYUSH Discipline</th>
                              <th className="px-4 py-2.5">Enrolled Date</th>
                              <th className="px-4 py-2.5">Progress</th>
                              <th className="px-4 py-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {enrollments.map((enr) => {
                              const isComplete = enr.status === "COMPLETED";
                              return (
                                <tr key={enr.id} className="hover:bg-slate-50/80 transition">
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">
                                      {enr.student_name}
                                    </div>
                                    {enr.student_email && (
                                      <div className="text-[11px] text-slate-500">
                                        {enr.student_email}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-slate-800">{enr.degree || "BAMS"}</div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                      {enr.institution || "AYUSH Institute"}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-700">
                                    {enr.discipline || "General AYUSH"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                    {enr.enrolled_at
                                      ? new Date(enr.enrolled_at).toLocaleDateString()
                                      : "Recently"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            isComplete ? "bg-emerald-600" : "bg-blue-600"
                                          }`}
                                          style={{ width: `${enr.progress_percent}%` }}
                                        />
                                      </div>
                                      <span className="text-[11px] font-mono text-slate-600">
                                        {enr.progress_percent}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {isComplete ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-[6px]">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Certified</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-blue-800 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-[6px]">
                                        <Clock className="w-3 h-3 text-blue-600" />
                                        <span>In Progress</span>
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Host New Training Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[16px] shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">
                  Host New Industry Training Program
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish practical upskilling modules targeted at AYUSH clinical and pharmaceutical competencies.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[8px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AYUSH Clinical Trial Protocol & GCP Compliance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="CLINICAL_RESEARCH">Clinical Research & Trials</option>
                    <option value="PHARMACOGNOSY">Herbal QC & Phytochemistry</option>
                    <option value="FORMULATION_QA">Formulation & Schedule T QA</option>
                    <option value="PANCHAKARMA_TECH">Panchakarma Clinical Protocols</option>
                    <option value="REGULATORY_AFFAIRS">AYUSH Regulatory & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format / Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="HYBRID">Hybrid (Online + Lab)</option>
                    <option value="ONLINE">100% Online</option>
                    <option value="OFFLINE">In-Person Industrial Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="certCheck"
                    checked={certificateProvided}
                    onChange={(e) => setCertificateProvided(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="certCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Issue Verified AYUSH Platform Certificate
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize course goals, hands-on industrial equipment, and clinical skills acquired..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Competencies Targeted */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Target Competencies Imparted
                  </label>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    Projected Gain: +{proficiencyGain}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[8px] max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                  {availableSkills.map((sk) => {
                    const isSelected = selectedSkillIds.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => toggleSkillSelection(sk.id)}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-[#003c33] text-white"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curriculum / Syllabus Outline
                </label>
                <textarea
                  rows={2}
                  placeholder="Module 1: ... &#10;Module 2: ... &#10;Module 3: ..."
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-[8px] bg-[#003c33] hover:bg-[#002b24] text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Training Program</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
