import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import {
  Building2,
  Briefcase,
  Users,
  ArrowRight,
  PlusCircle,
  Compass,
  ChevronRight,
  Star,
  BookOpen,
} from "lucide-react";

export default async function IndustryDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY" || !user.profileId) {
    redirect("/login");
  }

  const [profile, oppsData, candidatesData, trainingsData] = await Promise.all([
    industryApi.getProfile().catch(() => null),
    industryApi.getOpportunities().catch(() => []),
    industryApi.getCandidates().catch(() => []),
    industryApi.getTraining().catch(() => []),
  ]);

  if (!profile) {
    return (
      <AppShell allowedRole="INDUSTRY">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Company profile not found.</p>
        </div>
      </AppShell>
    );
  }

  const normalizedOpps = (Array.isArray(oppsData) ? oppsData : []).map((o: any) => ({
    id: o.id,
    title: o.title,
    opportunityType: o.opportunity_type || o.opportunityType || "INTERNSHIP",
    location: o.location || "Remote",
    deadline: o.deadline,
    applications: { length: o.applicants_count ?? (Array.isArray(o.applications) ? o.applications.length : 0) },
    status: o.status || "ACTIVE",
  }));

  const industry = {
    companyName: profile.companyName || profile.company_name || "AYUSH Partner",
    sector: { name: typeof profile.sector === "string" ? profile.sector : profile.sector?.name || "AYUSH Health & Pharmaceuticals" },
    opportunities: normalizedOpps,
  };

  const allApplications = (Array.isArray(candidatesData) ? candidatesData : []).map((c: any) => ({
    id: c.application_id || c.id,
    matchScorePercentage: c.match_score ?? 0,
    status: c.status || "APPLIED",
    opportunity: { title: c.opportunity_title || "Opportunity" },
    studentProfile: {
      user: { name: c.candidate_name || "Candidate" },
      degree: c.degree || "AYUSH Scholar",
      currentYear: "Active Cohort",
      discipline: { name: c.discipline || "General AYUSH" },
    },
  }));
  const shortlistedCount = allApplications.filter((a) => a.status === "SHORTLISTED").length;
  const activeOpportunitiesCount = normalizedOpps.filter((o) => o.status === "ACTIVE").length;
  const isFreshIndustry = normalizedOpps.length === 0;
  const topCandidate = allApplications[0];

  const myTrainings = (Array.isArray(trainingsData) ? trainingsData : []).filter((t: any) => t.is_mine ?? t.isMine);
  const totalEnrolledTrainees = (Array.isArray(trainingsData) ? trainingsData : []).reduce(
    (sum: number, t: any) => sum + (t.enrolled_count ?? t.enrollments?.length ?? 0),
    0
  );

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-3">
                <Building2 className="w-3.5 h-3.5" />
                {industry.companyName} • {industry.sector.name}
              </div>
              <h1 className="font-heading font-medium text-2xl sm:text-3xl text-white tracking-tight">
                Industry Partner Portal
              </h1>
              <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                {isFreshIndustry
                  ? "Welcome to the AYUSH Skill Intelligence & Hiring Network. Post your first opportunity with exact competency benchmarks."
                  : "Define required competencies, review applicants ranked by deterministic explainable match scores, and issue verified skill endorsements."}
              </p>
            </div>

            <Link
              href="/industry/opportunities/create"
              className="px-4 py-2.5 rounded-[8px] bg-[#003c33] hover:bg-[#002b24] text-white font-medium text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Post New Opportunity
            </Link>
          </div>
        </div>

        {/* FIRST-TIME INDUSTRY ONBOARDING & SETUP TOUR */}
        {isFreshIndustry && (
          <div className="p-6 sm:p-7 rounded-[12px] bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-medium text-base text-slate-900">
                    First-Time Industry Partner Onboarding Tour
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect with job-ready AYUSH scholars with verified skills
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-[8px] border border-blue-200/80 self-start sm:self-auto">
                Setup Step 1 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                      Step 1 • Publish Role
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[8px] bg-blue-100 text-blue-800">
                      Action Required
                    </span>
                  </div>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Post Opportunity with Skills</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Set specific required skill proficiencies (e.g. Research Methodology 75%, Biostatistics 60%).
                  </p>
                </div>
                <Link
                  href="/industry/opportunities/create"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Post Job / Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 2 • Talent Pool
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Search Verified Candidates</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Filter by degree, verified clinical competencies, and readiness percentiles across all AYUSH institutes.
                  </p>
                </div>
                <Link
                  href="/industry/candidates"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-[#17171c] hover:bg-slate-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Browse Candidates</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 3 • Research Hub
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Joint Research &amp; FDPs</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Propose sponsored faculty development programs or joint R&amp;D trials with academic researchers.
                  </p>
                </div>
                <Link
                  href="/industry/collaboration"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs text-center transition flex items-center justify-center gap-1"
                >
                  <span>Explore Research Hub</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Active Postings</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mt-1">{activeOpportunitiesCount}</div>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-1">Jobs, Internships &amp; Trials</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Total Applicants</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-blue-700 mt-1">{allApplications.length}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Matched via Skill Engine</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Shortlisted Candidates</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-emerald-700 mt-1">{shortlistedCount}</div>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-1">Ready for Interview</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Top Candidate Match</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-amber-600 mt-1">
              {topCandidate ? `${topCandidate.matchScorePercentage}%` : "—"}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
              {topCandidate ? `${topCandidate.studentProfile?.user.name} (${topCandidate.studentProfile?.degree})` : "Awaiting First Application"}
            </div>
          </div>
        </div>

        {/* Training Programs & Scholar Enrollments Strip */}
        <div className="bg-emerald-950 text-white rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs border border-emerald-900">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  CAREER GOAL SYNC
                </span>
                <span className="text-xs text-emerald-200">
                  {totalEnrolledTrainees} Enrolled Scholars Active
                </span>
              </div>
              <h3 className="font-heading font-medium text-base text-white mt-1">
                Industry Learning &amp; Practical Training Programs
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Host practical modules to bridge sector skill gaps. Your programs automatically match into students&apos; personalized portals.
              </p>
            </div>
          </div>
          <Link
            href="/industry/training"
            className="px-4 py-2.5 rounded-[8px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>Manage Training &amp; Scholars</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top Matching Candidates Table */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Recent Applicants Ranked by Match Score</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated dynamically based on your posting&apos;s required skills vs candidate verified profiles
              </p>
            </div>
            <Link
              href="/industry/candidates"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Manage All Candidates <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Applied Role</th>
                  <th className="p-3">Discipline</th>
                  <th className="p-3 text-center">Match Fit</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allApplications.slice(0, 5).map((app) => {
                  const student = app.studentProfile;
                  const isTop = app.matchScorePercentage >= 90;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{student?.user.name}</span>
                          {isTop && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              Top Match
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{student?.degree} ({student?.currentYear})</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{app.opportunity.title}</td>
                      <td className="p-3 text-slate-600">{student?.discipline.name}</td>
                      <td className="p-3 text-center">
                        <span className="font-black text-sm text-emerald-700">{app.matchScorePercentage}%</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/industry/candidates?appId=${app.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-emerald-800 transition"
                          >
                            Review Profile
                          </Link>
                          <Link
                            href={`/industry/feedback/${app.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-1"
                            title="Endorse candidate competencies"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Feedback
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {allApplications.length === 0 && (
              <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 my-2 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800 text-xs">No Candidate Applications Received Yet</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Once your opportunity is published, AYUSH scholars will discover it. Our 7-factor engine will rank candidates based on their verified competencies.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Postings Overview */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Your Active Opportunity Postings</h2>
            <Link href="/industry/opportunities" className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {industry.opportunities.map((opp) => (
              <div key={opp.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mr-2">
                    {opp.opportunityType}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{opp.title}</span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {opp.location} • Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {opp.applications.length} Applicants
                  </span>
                  <Link
                    href={`/industry/candidates?oppId=${opp.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
                  >
                    View Pipeline
                  </Link>
                </div>
              </div>
            ))}

            {industry.opportunities.length === 0 && (
              <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800 text-xs">No Active Opportunities Posted</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Publish your first job opening, clinical internship, or R&D project. Set granular competency benchmarks to calibrate matching.
                </p>
                <Link
                  href="/industry/opportunities/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Post First Opportunity
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
