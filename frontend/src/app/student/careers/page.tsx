import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import { Compass, Target } from "lucide-react";
import CareerRoleCard from "@/components/student/CareerRoleCard";
import { calculateRoleReadiness } from "@/lib/services/skillGapEngine";

export default async function CareerExplorerPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.profileId) {
    redirect("/login");
  }

  const student = await studentApi.getProfile();

  if (!student) {
    return (
      <AppShell allowedRole="STUDENT">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Please complete your onboarding profile.</p>
          <Link href="/student/onboarding" className="mt-4 inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
            Complete Profile
          </Link>
        </div>
      </AppShell>
    );
  }

  const hasCompletedAssessment = Boolean(
    (student.attempts && student.attempts.length > 0) || (student.skills || []).length > 0
  );

  const studentSkillMap = new Map<string, number>();
  for (const s of student.skills || []) {
    studentSkillMap.set(s.skillId, s.proficiencyScore);
  }

  const roles = await studentApi.getCareerRoles();

  const rolesWithReadiness = roles.map((r) => {
    const res = calculateRoleReadiness(
      r,
      (student.skills || []).map((s) => ({
        skillId: s.skillId,
        proficiencyScore: s.proficiencyScore,
      }))
    );

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      minEducation: r.minEducation,
      averageSalary: r.averageSalary,
      sectorName: r.sector?.name ?? r.sectorName ?? r.sector_name ?? "AYUSH Healthcare",
      readinessScore: res.readinessPercentage,
      isCurrentTarget: student.targetCareerRoleId === r.id,
      skills: (r.skills || []).map((sk: any) => ({
        skillId: sk.skillId ?? sk.skill_id ?? "",
        skillName: sk.skill?.name ?? sk.skillName ?? sk.name ?? "Skill",
        requiredScore: sk.requiredProficiency ?? sk.required_proficiency ?? 70,
        isMandatory: Boolean(sk.isMandatory ?? sk.is_mandatory),
        studentScore: studentSkillMap.get(sk.skillId ?? sk.skill_id ?? "") || 0,
      })),
    };
  }).sort((a, b) => b.readinessScore - a.readinessScore);

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Cohere Enterprise Hero Card with planner_student_spread.png */}
        <div className="relative overflow-hidden rounded-[12px] bg-[#003c33] text-white p-6 sm:p-8 border border-emerald-950/40 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-white/10 text-[#a4e797] text-[11px] font-medium tracking-wide">
                <Compass className="w-3.5 h-3.5" />
                <span>COMPETENCY BENCHMARK ARCHITECTURE</span>
              </div>
              <h1 className="font-heading font-medium text-2xl sm:text-3xl text-white tracking-tight">
                AYUSH Career Domain Explorer
              </h1>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Explore 18+ database-mapped career pathways across clinical practice, pharma R&D, wellness hospitality, and healthtech. Setting a target role calibrates your clinical diagnostic tests, learning modules, and recruiter match scoring.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 text-white font-mono">
                  <span>18 Pathways</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 text-white font-mono">
                  <span>7-Factor Explainable Match</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 text-white font-mono">
                  <span>AI Gap Diagnostics</span>
                </div>
              </div>
            </div>

            {/* Asset 7: planner_student_spread.png */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="w-48 sm:w-56 h-auto p-2 rounded-[12px] bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-center">
                <img
                  src="/planner_student_spread.png"
                  alt="AYUSH Career Pathways"
                  className="w-full h-auto object-contain rounded-[8px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current Target Banner */}
        <div
          className={`p-4 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            hasCompletedAssessment
              ? "bg-[#edfce9] border-emerald-300 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-[8px] text-white ${
                hasCompletedAssessment ? "bg-[#003c33]" : "bg-amber-600"
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-80">Active Career Target</div>
              <div className="font-heading font-medium text-sm">
                {rolesWithReadiness.find((r) => r.isCurrentTarget)?.title || "None Selected"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-medium opacity-90 hidden sm:inline">
              {hasCompletedAssessment
                ? "Target role calibrates required benchmarks and personalized learning!"
                : "Complete your career assessment to calibrate verified match compatibility!"}
            </span>
            {!hasCompletedAssessment && (
              <a
                href="/student/assessment"
                className="px-3 py-1.5 rounded-[8px] bg-[#17171c] hover:bg-[#003c33] text-white font-medium text-xs transition whitespace-nowrap shadow-xs"
              >
                Start Assessment
              </a>
            )}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {rolesWithReadiness.map((role) => (
            <CareerRoleCard
              key={role.id}
              role={role}
              hasCompletedAssessment={hasCompletedAssessment}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
