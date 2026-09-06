import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import { BookOpen, Zap } from "lucide-react";
import TrainingProgramCard from "@/components/student/TrainingProgramCard";

export default async function StudentLearningPage() {
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

  const studentSkillMap = new Map<string, number>();
  for (const s of student.skills || []) {
    studentSkillMap.set(s.skillId, s.proficiencyScore);
  }

  const enrollmentMap = new Map<string, { status: string; progressPercent: number }>();
  for (const e of student.enrollments || []) {
    const progId = e.trainingProgramId || e.training_program_id || e.trainingProgram?.id;
    if (progId) {
      enrollmentMap.set(progId, {
        status: e.status,
        progressPercent: e.progressPercent ?? e.progress_percent ?? 0,
      });
    }
  }

  const programs = await studentApi.getLearningPrograms();

  const structuredPrograms = programs.map((p: any) => {
    const enr = enrollmentMap.get(p.id) || (p.enrollment ? { status: p.enrollment.status, progressPercent: p.enrollment.progress_percent ?? p.enrollment.progressPercent ?? 0 } : null);
    return {
      id: p.id,
      title: p.title,
      providerName: p.providerName ?? p.provider_name ?? "AYUSH Council",
      companyName: p.companyName ?? p.company_name,
      isIndustryHosted: p.isIndustryHosted ?? p.is_industry_hosted ?? (!!p.industry_profile_id),
      isGoalSynced: p.isGoalSynced ?? p.is_goal_synced ?? false,
      goalSyncScore: p.goalSyncScore ?? p.goal_sync_score ?? 0,
      goalSyncRole: p.goalSyncRole ?? p.goal_sync_role ?? null,
      goalSyncReason: p.goalSyncReason ?? p.goal_sync_reason ?? null,
      category: p.category,
      durationHours: p.durationHours ?? p.duration_hours ?? 40,
      mode: p.mode,
      level: p.level,
      certificateProvided: p.certificateProvided ?? p.certificate_provided ?? true,
      description: p.description,
      syllabus: p.syllabus,
      enrollmentStatus: enr?.status || null,
      progressPercent: enr?.progressPercent || 0,
      skills: (p.skills || []).map((ts: any, idx: number) => {
        const sId = ts.skillId ?? ts.skill_id ?? ts.id ?? ts.skill?.id ?? `prog-${p.id}-sk-${idx}`;
        return {
          skillId: sId,
          skillName: ts.skillName ?? ts.skill_name ?? ts.skill?.name ?? ts.name ?? "Competency",
          gain: ts.proficiencyGain ?? ts.proficiency_gain ?? ts.gain ?? 20,
          currentStudentScore: studentSkillMap.get(sId) || 40,
        };
      }),
    };
  });

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#003c33]" />
              <h1 className="font-heading font-medium text-2xl text-slate-950">
                Personalized Learning & Skill Upskilling
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Targeted industry-partnered training programs designed to bridge your specific skill gaps and increase opportunity match scores
            </p>
          </div>
        </div>

        {/* Public Asset 3: flashcard_thinking_character.png in Learning Upskilling Hero Banner */}
        <div className="p-6 rounded-[12px] bg-[#003c33] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 text-emerald-300 text-[11px] font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Closed-Loop Skill Upskilling</span>
            </div>
            <h2 className="font-heading font-medium text-xl text-white">
              Bridge Competency Deficits to Unlock Industry Roles
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Targeted clinical modules mapped to your highest diagnostic skill deficit. Complete training to boost verified proficiency (+20% to +35%) and automatically improve your 7-factor match scores!
            </p>
          </div>

          <div className="relative w-32 h-28 sm:w-40 sm:h-32 shrink-0 flex items-center justify-center">
            <img
              src="/flashcard_thinking_character.png"
              alt="Student Reviewing Flashcards"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          {structuredPrograms.map((program) => (
            <TrainingProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
