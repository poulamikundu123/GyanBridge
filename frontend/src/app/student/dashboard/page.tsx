import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi, assessmentApi } from "@/lib/apiClient";
import { calculateRoleReadiness } from "@/lib/services/skillGapEngine";
import StudentCareerGoalHeader from "@/components/student/StudentCareerGoalHeader";
import AttentionSection from "@/components/student/dashboard/AttentionSection";
import CompetencyBenchmarkCard from "@/components/student/dashboard/CompetencyBenchmarkCard";
import LearningSnapshotGrid from "@/components/student/dashboard/LearningSnapshotGrid";
import CareerArsenalSection from "@/components/student/dashboard/CareerArsenalSection";
import PersonalizedGoalProgramsSection from "@/components/student/dashboard/PersonalizedGoalProgramsSection";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  // Load student full profile and learning programs in parallel
  const [student, historyData, rawPrograms] = await Promise.all([
    studentApi.getProfile(),
    assessmentApi.getHistory().catch(() => null),
    studentApi.getLearningPrograms().catch(() => []),
  ]);

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

  // Calculate Role Readiness if target role exists
  let readinessResult = null;
  if (student.targetCareerRole) {
    readinessResult = calculateRoleReadiness(
      student.targetCareerRole,
      (student.skills ?? []).map((s: any) => ({
        skillId: s.skillId ?? s.skill_id ?? "",
        proficiencyScore: s.proficiencyScore ?? s.proficiency_score ?? 0,
      }))
    );
  }

  // Load latest completed assessment attempt
  const latestAttempt = (historyData?.attempts ?? []).find((a: any) => a.status === "COMPLETED") || null;

  // Determine if this is a first-time fresh student
  const isFreshUser = !latestAttempt || (student.skills ?? []).length === 0;

  const activeRoleTitle = student.targetCareerRole?.title || "Ayurveda Physician";
  const readinessPercentage = readinessResult ? readinessResult.readinessPercentage : Math.round(student.readinessScore);
  const verifiedStrengthsCount = readinessResult?.strengths.length || student.skills.filter((s: any) => s.verificationLevel === "ASSESSMENT_VERIFIED").length;
  const skillGapsCount = (readinessResult?.majorGaps.length || 0) + (readinessResult?.moderateGaps.length || 0) || (isFreshUser ? 3 : 0);
  const applicationsCount = student.applications.length;
  const priorityGapSkill = readinessResult?.majorGaps[0] || readinessResult?.moderateGaps[0] || null;

  // Format student skills and enrollments for programs
  const studentSkillMap = new Map<string, number>();
  for (const s of student.skills || []) {
    studentSkillMap.set(s.skillId ?? s.skill_id, s.proficiencyScore ?? s.proficiency_score ?? 0);
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

  const structuredPrograms = (Array.isArray(rawPrograms) ? rawPrograms : []).map((p: any) => {
    const enr = enrollmentMap.get(p.id) || (p.enrollment ? { status: p.enrollment.status, progressPercent: p.enrollment.progress_percent ?? p.enrollment.progressPercent ?? 0 } : null);
    return {
      id: p.id,
      title: p.title,
      providerName: p.providerName ?? p.provider_name ?? "AYUSH Council",
      companyName: p.companyName ?? p.company_name,
      isIndustryHosted: p.isIndustryHosted ?? p.is_industry_hosted ?? (!!p.industry_profile_id),
      isGoalSynced: p.isGoalSynced ?? p.is_goal_synced ?? false,
      goalSyncScore: p.goalSyncScore ?? p.goal_sync_score ?? 0,
      goalSyncRole: p.goalSyncRole ?? p.goal_sync_role ?? activeRoleTitle,
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

  const trackCompetencies = student.targetCareerRole?.skills?.length
    ? student.targetCareerRole.skills.slice(0, 5).map((rs: any) => {
        const studentSkill = student.skills.find((s: any) => s.skillId === rs.skillId);
        return {
          name: rs.skill.name,
          score: studentSkill ? studentSkill.proficiencyScore : 0,
          required: rs.requiredProficiency,
        };
      })
    : [
        { name: "Ayurveda Fundamentals", score: 0, required: 85 },
        { name: "Panchakarma Clinical Protocols", score: 0, required: 70 },
        { name: "Kayachikitsa Internal Medicine", score: 0, required: 75 },
        { name: "Dravyaguna Pharmacology", score: 0, required: 80 },
        { name: "Clinical Trial Research Methodology", score: 0, required: 65 },
      ];

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-8">
        {/* Welcome & Career Goal Starting Point Header */}
        <StudentCareerGoalHeader
          studentName={user.name}
          degree={student.degree}
          disciplineName={student.discipline.name}
          targetRole={
            student.targetCareerRole
              ? {
                  id: student.targetCareerRole.id,
                  title: student.targetCareerRole.title,
                  sectorName: student.targetCareerRole.sector?.name ?? student.targetCareerRole.sectorName ?? "AYUSH Healthcare",
                  description: student.targetCareerRole.description,
                  averageSalary: student.targetCareerRole.averageSalary || "₹6,50,000 - ₹11,00,000",
                }
              : null
          }
          readinessScore={readinessPercentage}
          isFreshUser={isFreshUser}
        />

        {/* 2. Section: What deserves your attention today? */}
        <AttentionSection
          activeRoleTitle={activeRoleTitle}
          priorityGapSkill={priorityGapSkill}
        />

        {/* 3. Activity Timeline strip */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-[8px] px-4 py-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 border border-slate-400 rounded-xs shrink-0" />
            <span className="leading-snug">
              {latestAttempt
                ? `LATEST ATTEMPT: Score ${latestAttempt.scorePercentage}% on ${latestAttempt.completedAt ? new Date(latestAttempt.completedAt).toLocaleDateString() : "Recent"}. Career Readiness: ${readinessPercentage}%.`
                : "NO ASSESSMENTS COMPLETED YET. Start your first session to begin building your verified skill history."}
            </span>
          </span>
          <Link href="/student/assessment" className="font-bold text-[#003c33] hover:text-[#044e43] text-xs font-mono shrink-0 self-start sm:self-auto">
            {latestAttempt ? "RETAKE NOW →" : "ASSESS NOW →"}
          </Link>
        </div>

        {/* 4. Personalized Industry Programs Synced with Career Goal */}
        <PersonalizedGoalProgramsSection
          activeRoleTitle={activeRoleTitle}
          programs={structuredPrograms}
        />

        {/* 5. Syllabus Coverage / Competency Benchmark Card */}
        <CompetencyBenchmarkCard
          isFreshUser={isFreshUser}
          readinessPercentage={readinessPercentage}
          latestAttempt={latestAttempt}
          trackCompetencies={trackCompetencies}
        />

        {/* 6. Section: Your learning snapshot */}
        <LearningSnapshotGrid
          isFreshUser={isFreshUser}
          readinessPercentage={readinessPercentage}
          verifiedStrengthsCount={verifiedStrengthsCount}
          skillGapsCount={skillGapsCount}
          applicationsCount={applicationsCount}
        />

        {/* 7. Section: Your Career & Skill Arsenal */}
        <CareerArsenalSection
          activeRoleTitle={activeRoleTitle}
          latestAttempt={latestAttempt}
        />
      </div>
    </AppShell>
  );
}
