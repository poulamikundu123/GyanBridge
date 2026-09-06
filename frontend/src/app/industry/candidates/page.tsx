import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import { Users } from "lucide-react";
import CandidatePipelineManager from "@/components/industry/CandidatePipelineManager";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<{ oppId?: string; opportunity_id?: string }>;
}

export default async function IndustryCandidatesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INDUSTRY") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const resolvedParams = searchParams ? await searchParams : {};
  const targetOppId = resolvedParams?.oppId || resolvedParams?.opportunity_id;

  const rawCandidates = await industryApi.getCandidates(targetOppId);

  const candidateRows = (Array.isArray(rawCandidates) ? rawCandidates : []).map((app: any) => ({
    applicationId: app.application_id || app.id,
    candidateName: app.candidate_name || app.studentProfile?.user?.name || "Candidate",
    candidateEmail: app.candidate_email || app.studentProfile?.user?.email || "",
    degree: app.degree || app.studentProfile?.degree || "Not specified",
    institution: app.institution || app.studentProfile?.institution || "Not specified",
    disciplineName: app.discipline || app.studentProfile?.discipline?.name || "General AYUSH",
    targetRoleTitle: app.target_role || app.studentProfile?.targetCareerRole?.title || null,
    matchScore: app.match_score ?? app.matchScorePercentage ?? 0,
    status: app.status || "APPLIED",
    coverNote: app.cover_note || app.coverNote || "",
    opportunityTitle: app.opportunity_title || app.opportunity?.title || "Opportunity",
    appliedDate: app.applied_at
      ? new Date(app.applied_at).toLocaleDateString()
      : app.appliedAt
      ? new Date(app.appliedAt).toLocaleDateString()
      : "Recently",
    skills: (app.skills || app.studentProfile?.skills || []).map((s: any) => ({
      skillName: s.name || s.skill?.name || s.skillName || "Skill",
      score: s.proficiency ?? s.proficiencyScore ?? 0,
      level: s.level ?? s.verificationLevel ?? "SELF_REPORTED",
    })),
  }));

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Candidate Pipeline & Evaluation</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate applicants ranked by multi-factor deterministic match fit, view verified competencies, and manage stages
            </p>
          </div>
        </div>

        <CandidatePipelineManager candidates={candidateRows} />
      </div>
    </AppShell>
  );
}
