import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import { Briefcase, Search } from "lucide-react";
import OpportunityCardWithModal from "@/components/student/OpportunityCardWithModal";
import { calculateOpportunityMatch } from "@/lib/services/matchingEngine";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sector?: string;
    mode?: string;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.profileId) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || "";
  const type = resolvedParams.type || "";
  const sectorFilter = resolvedParams.sector || "";
  const modeFilter = resolvedParams.mode || "";

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

  const appliedOpportunityMap = new Map<string, string>();
  for (const app of student.applications || []) {
    appliedOpportunityMap.set(app.opportunityId, app.status);
  }

  const allOpportunities = await studentApi.getOpportunities();
  const opportunities = allOpportunities.filter((opp: any) => {
    if (type && (opp.opportunityType || opp.opportunity_type) !== type) return false;
    if (sectorFilter && (opp.sectorId || opp.sector_id) !== sectorFilter) return false;
    if (modeFilter && (opp.workMode || opp.work_mode) !== modeFilter) return false;
    return true;
  });

  // Calculate deterministic match scores
  const processedOpportunities = opportunities
    .map((opp) => {
      const match = calculateOpportunityMatch(
        {
          id: student.id,
          degree: student.degree || "",
          ayushDisciplineId: student.ayushDisciplineId,
          ayushDisciplineName: student.discipline?.name || "AYUSH",
          targetCareerRoleId: student.targetCareerRoleId,
          targetCareerSectorId: student.targetCareerRole?.sectorId,
          location: student.location,
          preferredWorkMode: student.preferredWorkMode,
          skills: (student.skills || []).map((s) => ({
            skillId: s.skillId,
            skillName: s.skill?.name || "Skill",
            proficiencyScore: s.proficiencyScore,
            verificationLevel: s.verificationLevel,
          })),
          projectsCount: (student.projects || []).length,
          certificationsCount: (student.certifications || []).length,
        },
        {
          id: opp.id,
          title: opp.title,
          opportunityType: opp.opportunityType ?? opp.opportunity_type ?? "INTERNSHIP",
          sectorId: opp.sectorId ?? opp.sector_id ?? "",
          disciplineId: opp.disciplineId ?? opp.discipline_id,
          disciplineName: opp.discipline?.name ?? opp.disciplineName ?? opp.discipline_name,
          eligibilityDegree: opp.eligibilityDegree ?? opp.eligibility_degree ?? "",
          location: opp.location ?? "",
          workMode: opp.workMode ?? opp.work_mode ?? "HYBRID",
          skills: (opp.skills ?? opp.required_skills ?? []).map((s: any) => ({
            skillId: s.skillId ?? s.skill_id ?? "",
            skillName: s.skill?.name ?? s.skillName ?? s.skill_name ?? s.name ?? "Skill",
            requiredProficiency: s.requiredProficiency ?? s.required_proficiency ?? 70,
            isMandatory: s.isMandatory ?? s.is_mandatory ?? false,
            weight: s.weight ?? 1.0,
          })),
        }
      );

      const appStatus = appliedOpportunityMap.get(opp.id);
      const companyName = opp.companyName ?? opp.company_name ?? opp.industryProfile?.companyName ?? opp.industryProfile?.company_name ?? "AYUSH Partner";
      const workMode = opp.workMode ?? opp.work_mode ?? "HYBRID";
      const stipendSalary = opp.stipendSalary ?? opp.stipend_salary ?? "Stipend Provided";
      const sectorName = opp.sectorName ?? opp.sector_name ?? opp.sector?.name ?? "AYUSH Healthcare";
      const disciplineName = opp.disciplineName ?? opp.discipline_name ?? opp.discipline?.name;
      const opportunityType = opp.opportunityType ?? opp.opportunity_type ?? "INTERNSHIP";
      const eligibilityDegree = opp.eligibilityDegree ?? opp.eligibility_degree ?? "AYUSH Graduate";

      return {
        id: opp.id,
        title: opp.title,
        opportunityType,
        description: opp.description,
        companyName,
        companyLocation: opp.industryProfile?.location || opp.location,
        location: opp.location,
        workMode,
        stipendSalary,
        duration: opp.duration,
        deadline: opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Flexible",
        eligibilityDegree,
        sectorName,
        disciplineName,
        isApplied: Boolean(appStatus),
        applicationStatus: appStatus || null,
        skills: (opp.skills ?? opp.required_skills ?? []).map((s: any) => ({
          skillName: s.skill?.name ?? s.skillName ?? s.skill_name ?? s.name ?? "Skill",
          requiredScore: s.requiredProficiency ?? s.required_proficiency ?? 70,
          isMandatory: s.isMandatory ?? s.is_mandatory ?? false,
        })),
        match,
      };
    })
    .filter((opp) => {
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.companyName.toLowerCase().includes(q) ||
        opp.sectorName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Industry Opportunities & Match Intelligence</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore jobs, internships, clinical trials, and live projects ranked by deterministic multi-factor match algorithms
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="ayush-card p-4 space-y-3">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by role, keyword, or organization..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                name="type"
                defaultValue={type}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Opportunity Types</option>
                <option value="INTERNSHIP">Internships</option>
                <option value="JOB">Full-Time Jobs</option>
                <option value="PROJECT">Live Projects</option>
                <option value="APPRENTICESHIP">Apprenticeships</option>
                <option value="FDP">FDP Programs</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                name="mode"
                defaultValue={modeFilter}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Any Work Mode</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
              >
                Filter
              </button>
            </div>
          </form>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Natural Queries:</span>
            <a
              href="/student/opportunities?q=clinical+research"
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition"
            >
              &ldquo;Clinical Research Internships&rdquo;
            </a>
            <a
              href="/student/opportunities?q=HPLC"
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition"
            >
              &ldquo;Quality Control & HPLC&rdquo;
            </a>
            <a
              href="/student/opportunities?q=digital+health"
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition"
            >
              &ldquo;Digital Health & NAMASTE&rdquo;
            </a>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found {processedOpportunities.length} opportunities matching your criteria</span>
          <span className="font-semibold text-emerald-800">Ranked by Explainable Match Score</span>
        </div>

        {/* Postings List */}
        <div className="space-y-4">
          {processedOpportunities.map((opp) => (
            <OpportunityCardWithModal key={opp.id} opportunity={opp} />
          ))}
          {processedOpportunities.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-xs">No opportunities found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
