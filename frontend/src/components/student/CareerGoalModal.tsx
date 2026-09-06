"use client";

import { useState, useEffect } from "react";
import {
  Target,
  Search,
  CheckCircle2,
  Briefcase,
  Compass,
  Lightbulb,
  X,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CareerRoleData {
  id: string;
  title: string;
  sectorName: string;
  description: string;
  minEducation: string;
  averageSalary: string;
  demandLevel: string;
  skills: Array<{
    skillId: string;
    skillName: string;
    categoryName: string;
    requiredProficiency: number;
    isMandatory: boolean;
  }>;
}

interface CareerGoalModalProps {
  isOpen: boolean;
  currentGoalId?: string | null;
  onClose?: () => void;
  allowClose?: boolean;
  onGoalSelected?: (role: CareerRoleData) => void;
}

export function CareerGoalModal({
  isOpen,
  currentGoalId,
  onClose,
  allowClose = true,
  onGoalSelected,
}: CareerGoalModalProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<CareerRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadRoles = async () => {
      try {
        const res = await fetch("/api/student/career-target/roles");
        if (res.ok && active) {
          const data = await res.json();
          setRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Failed to load career roles", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRoles();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sectors = ["ALL", ...Array.from(new Set(roles.map((r) => r.sectorName)))];

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skills.some((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = selectedSector === "ALL" || r.sectorName === selectedSector;

    return matchesSearch && matchesSector;
  });

  const handleSelectGoal = async (role: CareerRoleData) => {
    try {
      setSavingId(role.id);
      const res = await fetch("/api/student/career-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerRoleId: role.id }),
      });

      if (res.ok) {
        if (onGoalSelected) {
          onGoalSelected(role);
        }
        if (onClose) {
          onClose();
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to set career goal", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-[12px] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#003c33] text-white p-4 sm:p-6 md:p-7 shrink-0 relative">
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 text-[#a4e797] text-xs font-medium mb-2.5">
            <Compass className="w-3.5 h-3.5" />
            Career-Driven Skill Intelligence
          </div>
          <h2 className="font-heading font-medium text-xl sm:text-2xl md:text-3xl tracking-tight text-white pr-8">
            What is your career goal?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-2xl leading-relaxed">
            Select your target professional pathway in the AYUSH ecosystem. The platform will automatically calibrate required competencies, formulate a single mixed readiness assessment, and map your skill gaps.
          </p>

          {/* Search Bar & Quick Filters */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role (e.g. Clinical Research, QC Analyst, Formulation, Medical Officer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-[8px] bg-white/10 border border-white/20 text-white placeholder-emerald-200/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#a4e797] focus:bg-white/15 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 text-xs">
              {sectors.slice(0, 5).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap text-[11px] transition cursor-pointer ${
                    selectedSector === sec
                      ? "bg-[#a4e797] text-[#003c33] shadow-xs font-bold"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  {sec === "ALL" ? "All Sectors" : sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roles List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#003c33] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading AYUSH Career Pathways...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[12px] border border-dashed border-slate-300 p-8 space-y-2">
              <Target className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-heading font-medium text-slate-800 text-sm">No Matching Career Roles Found</p>
              <p className="text-xs text-slate-500">
                Try a different search term like &ldquo;Research&rdquo;, &ldquo;Physician&rdquo;, &ldquo;Pharma&rdquo;, or &ldquo;QC&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoles.map((role) => {
                const isCurrent = currentGoalId === role.id;
                const isSaving = savingId === role.id;

                return (
                  <div
                    key={role.id}
                    className={`p-5 rounded-[12px] bg-white border transition flex flex-col justify-between hover:shadow-xs ${
                      isCurrent
                        ? "border-emerald-600/40 bg-emerald-50/30 ring-1 ring-emerald-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-[8px]">
                            {role.sectorName}
                          </span>
                          <h3 className="font-heading font-medium text-base text-slate-900 mt-1.5 flex items-center gap-1.5">
                            {role.title}
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-[8px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Active Goal
                              </span>
                            )}
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-[8px] whitespace-nowrap">
                          {role.demandLevel} Demand
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {role.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {role.minEducation}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-emerald-800">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {role.averageSalary}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleSelectGoal(role)}
                        disabled={isSaving || isCurrent}
                        className={`px-4 py-2 rounded-[8px] text-xs font-medium transition flex items-center gap-1.5 shadow-xs ${
                          isCurrent
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#003c33] hover:bg-[#002b24] text-white"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Setting Goal...</span>
                          </>
                        ) : isCurrent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Goal</span>
                          </>
                        ) : (
                          <>
                            <span>Select Career Goal</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <p className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>
              You can change your career goal at any time without deleting your previous assessment history.
            </span>
          </p>
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition self-end sm:self-auto"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
