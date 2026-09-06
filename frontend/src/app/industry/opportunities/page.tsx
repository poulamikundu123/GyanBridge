import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import { Briefcase, PlusCircle, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ManageOpportunitiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INDUSTRY") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const rawOpportunities = await industryApi.getOpportunities();
  const opportunities = Array.isArray(rawOpportunities) ? rawOpportunities : [];

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Manage Published Opportunities</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track your active listings, evaluate candidate pipelines, and review application statuses
            </p>
          </div>
          <Link
            href="/industry/opportunities/create"
            className="px-4 py-2.5 rounded-[8px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Post New Opportunity
          </Link>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {opportunities.map((opp: any) => (
            <div key={opp.id} className="ayush-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-emerald-100 text-emerald-800">
                    {opp.opportunityType || opp.opportunity_type || "INTERNSHIP"}
                  </span>
                  <span className="text-xs text-slate-500">• {opp.sector?.name || opp.sector_name || "AYUSH Healthcare"}</span>
                  <span className="text-xs text-slate-500">• {opp.workMode || opp.work_mode || "HYBRID"}</span>
                </div>
                <h3 className="font-heading font-medium text-base text-slate-900">{opp.title}</h3>
                <p className="text-xs text-slate-500">
                  {opp.location} • Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Open"}
                </p>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-auto">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Total Applicants</span>
                  <span className="font-heading font-bold text-xl text-emerald-700">{opp.applicants_count ?? opp._count?.applications ?? 0}</span>
                </div>
                <Link
                  href={`/industry/candidates?oppId=${opp.id}`}
                  className="px-4 py-2 rounded-[8px] bg-slate-900 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" /> Candidates
                </Link>
              </div>
            </div>
          ))}

          {opportunities.length === 0 && (
            <div className="p-12 text-center bg-white rounded-[12px] border border-slate-200/90 shadow-xs">
              <p className="text-slate-500 text-xs">No opportunities posted yet. Create your first listing!</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
