import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import CareerAssessmentManager from "@/components/assessment/CareerAssessmentManager";

interface AssessmentPageProps {
  searchParams?: Promise<{
    opportunity_id?: string;
    type?: string;
  }>;
}

export default async function AssessmentPage({ searchParams }: AssessmentPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.profileId) {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialOpportunityId = resolvedParams.opportunity_id || null;
  const initialAssessmentType =
    resolvedParams.type === "JOB_FIT"
      ? "JOB_FIT"
      : resolvedParams.type === "STANDARD_BENCHMARK"
      ? "STANDARD_BENCHMARK"
      : "MIXED_COMPREHENSIVE";

  let student: any = null;
  let historyData: any = { attempts: [], skillProgression: [] };
  let opportunities: any[] = [];

  try {
    const [profileRes, historyRes, oppsRes] = await Promise.all([
      apiFetch("/student/profile-view"),
      apiFetch("/assessment/history"),
      apiFetch("/student/opportunities").catch(() => [])
    ]);
    student = profileRes;
    historyData = historyRes || { attempts: [], skillProgression: [] };
    opportunities = Array.isArray(oppsRes) ? oppsRes : [];
  } catch (err) {
    console.error("Failed to load assessment page data:", err);
  }

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

  const careerRoleInfo = student.targetCareerRole
    ? {
        id: student.targetCareerRole.id,
        title: student.targetCareerRole.title,
        sectorName: student.targetCareerRole.sector?.name || student.targetCareerRole.sectorName || "AYUSH Healthcare",
        description: student.targetCareerRole.description,
        minEducation: student.targetCareerRole.minEducation,
        averageSalary: student.targetCareerRole.averageSalary || "₹6,00,000 - ₹10,00,000",
        skills: (student.targetCareerRole.skills || []).map((s: any) => ({
          skillId: s.skillId,
          skillName: s.skill?.name || s.skillName || "Skill",
          requiredProficiency: s.requiredProficiency,
          isMandatory: s.isMandatory,
          weight: s.weight,
        })),
      }
    : null;

  return (
    <AppShell allowedRole="STUDENT">
      <CareerAssessmentManager
        studentId={student.id}
        initialCareerRole={careerRoleInfo}
        attemptsHistory={(historyData.attempts || []).map((a: any) => ({
          ...a,
          completedAt: a.completedAt ? new Date(a.completedAt).toISOString() : new Date().toISOString(),
        }))}
        skillProgression={(historyData.skillProgression || []).map((p: any) => ({
          ...p,
          history: (p.history || []).map((h: any) => ({
            ...h,
            date: h.date ? new Date(h.date).toISOString() : new Date().toISOString(),
          })),
        }))}
        studentReadinessScore={Math.round(student.readinessScore || 0)}
        opportunities={opportunities}
        initialOpportunityId={initialOpportunityId}
        initialAssessmentType={initialAssessmentType}
      />
    </AppShell>
  );
}
