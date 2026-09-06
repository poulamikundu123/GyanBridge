import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import { BarChart3 } from "lucide-react";

export default async function IndustryDemandIntelligencePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    redirect("/login");
  }

  const [demandComparison, dashboard] = await Promise.all([
    institutionApi.getDemandGap().catch(() => []),
    institutionApi.getDashboard().catch(() => null),
  ]);

  const activeOpportunitiesCount = dashboard?.total_applications ?? demandComparison.length;

  return (
    <AppShell allowedRole="INSTITUTION">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Industry Demand Intelligence</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live analysis comparing current industry skill demand requirements against student cohort competency benchmarks
            </p>
          </div>
        </div>

        {/* Intelligence Insights Summary */}
        <div className="p-6 sm:p-7 rounded-[12px] bg-[#003c33] border border-emerald-950/40 text-white shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-[8px] inline-flex">
              Institutional AI & Analytics Diagnostic
            </span>
          </div>
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-white tracking-tight">
            What Does Industry Need, and How Prepared Are Our Students?
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-3xl">
            By cross-referencing {activeOpportunitiesCount} active industry requirements across clinical trials, pharma R&D, and digital health against our student cohort verification ledger, the platform detects exact curriculum bottlenecks before graduation.
          </p>
        </div>

        {/* Detailed Comparison Table */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-heading font-medium text-base text-slate-900">Complete Competency Demand Matrix</h3>
            <span className="text-xs font-mono text-slate-500 font-semibold">{demandComparison.length} Evaluated Skills</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="p-3.5">Skill Competency</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Industry Demand Score</th>
                  <th className="p-3.5 text-center">Student Cohort Average</th>
                  <th className="p-3.5 text-center">Structural Gap</th>
                  <th className="p-3.5">Diagnostic Status</th>
                  <th className="p-3.5">Institutional Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandComparison.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No demand gap data available at this moment.
                    </td>
                  </tr>
                ) : (
                  demandComparison.map((item: any) => {
                    const skillId = item.skillId || item.skill_id || item.id;
                    const skillName = item.skillName || item.skill_name || "Skill";
                    const categoryName = item.categoryName || item.category_name || item.category || "General";
                    const indScore = item.industryDemandScore ?? item.industry_demand_score ?? 0;
                    const stAvg = item.studentCohortAverage ?? item.student_cohort_average ?? 0;
                    const gap = item.gap ?? 0;
                    const status = item.status || "HEALTHY_SUPPLY";
                    const action = item.suggestedAction || item.suggested_action || "Maintain curriculum alignment";

                    let statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-300";
                    if (status === "CRITICAL_GAP") statusBadge = "bg-red-50 text-red-800 border-red-300";
                    if (status === "MODERATE_GAP") statusBadge = "bg-amber-50 text-amber-800 border-amber-300";

                    return (
                      <tr key={skillId} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold text-slate-900">{skillName}</td>
                        <td className="p-3.5 text-slate-500">{categoryName}</td>
                        <td className="p-3.5 text-center font-black text-slate-800 text-sm">
                          {indScore}%
                        </td>
                        <td className="p-3.5 text-center font-semibold text-slate-600">
                          {stAvg}%
                        </td>
                        <td className="p-3.5 text-center font-black">
                          <span className={gap >= 20 ? "text-red-600" : gap > 0 ? "text-amber-600" : "text-emerald-700"}>
                            {gap > 0 ? `+${gap} pts` : `${gap} pts`}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                            {status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-600 font-medium max-w-xs">
                          {action}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
