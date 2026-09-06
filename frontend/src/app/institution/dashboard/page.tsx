import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import {
  School,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Compass,
} from "lucide-react";

export default async function InstitutionDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    redirect("/login");
  }

  // Fetch verified aggregated metrics from backend
  const [dashboard, demandComparison, students] = await Promise.all([
    institutionApi.getDashboard().catch(() => null),
    institutionApi.getDemandGap().catch(() => []),
    institutionApi.getStudents().catch(() => []),
  ]);

  const studentsCount = dashboard?.total_students ?? students.length;
  const assessedStudentsCount = dashboard?.assessed_students_count ?? 0;
  const avgSkillScore = Math.round(dashboard?.average_skill_score ?? 0);
  const avgReadiness = Math.round(dashboard?.average_readiness_score ?? 0);
  const placedCount = dashboard?.placed_count ?? 0;
  const totalApplications = dashboard?.total_applications ?? 0;

  const criticalGaps = demandComparison.filter((d: any) => d.status === "CRITICAL_GAP");
  const isFreshInstitution = studentsCount === 0 || assessedStudentsCount === 0;

  return (
    <AppShell allowedRole="INSTITUTION">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[12px] bg-[#003c33] border border-emerald-950/40 p-6 sm:p-8 text-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-bold mb-3">
                <School className="w-3.5 h-3.5" />
                AYUSH Academic Institution
              </div>
              <h1 className="font-heading font-medium text-2xl sm:text-3xl text-white tracking-tight">
                Institutional Executive Dashboard
              </h1>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                Real-time intelligence comparing industry hiring demand vs student cohort competencies across all AYUSH disciplines.
              </p>
            </div>

            <Link
              href="/institution/demand"
              className="px-4 py-2.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
            >
              <BarChart3 className="w-4 h-4" /> View Demand-Supply Gap Matrix
            </Link>
          </div>
        </div>

        {/* FIRST-TIME INSTITUTION ONBOARDING & SETUP GUIDE */}
        {isFreshInstitution && (
          <div className="p-6 sm:p-7 rounded-[12px] bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-medium text-base text-slate-900">
                    Institutional Academic Intelligence Onboarding Tour
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect academic curriculum with live pharmaceutical and healthcare sector requirements
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-[8px] border border-emerald-200/80 self-start sm:self-auto">
                Admin Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Step 1 • Student Cohort
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Inspect Student Cohorts</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    View student enrollments, degree distribution across AYUSH disciplines, and academic years.
                  </p>
                </div>
                <Link
                  href="/institution/students"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-[#003c33] hover:bg-emerald-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Student Directory</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 2 • Demand Matrix
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Industry Demand Intelligence</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Compare employer skill demands side-by-side with student cohort averages to pinpoint curriculum gaps.
                  </p>
                </div>
                <Link
                  href="/institution/demand"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-[#17171c] hover:bg-slate-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Explore Demand Matrix</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 3 • Accreditation
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">NCISM & NAAC Compliance</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Generate verifiable employability and clinical immersion evidence ledgers for regulatory bodies.
                  </p>
                </div>
                <Link
                  href="/institution/reports"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs text-center transition flex items-center justify-center gap-1"
                >
                  <span>Audit Reports</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Total Enrolled Cohort</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mt-1">{studentsCount} <span className="text-base font-normal text-slate-500">Students</span></div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-1">
              {assessedStudentsCount} ({Math.round((assessedStudentsCount / (studentsCount || 1)) * 100)}%) Assessed
            </div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Cohort Avg Skill Score</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-emerald-700 mt-1">{avgSkillScore}%</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Verified DB Average</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Industry Readiness</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-blue-700 mt-1">{avgReadiness}%</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Target Role Benchmark</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Placement & Intern Pipeline</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-amber-600 mt-1">{placedCount}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Of {totalApplications} Total Applications</div>
          </div>
        </div>

        {/* Critical Institutional Alert: Demand vs Supply Gap */}
        {criticalGaps.length > 0 && (
          <div className="p-5 rounded-[12px] bg-red-50/70 border border-red-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h2 className="font-heading font-medium text-sm text-red-950">
                  Critical Institutional Curriculum Gap Detected
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-red-800 bg-red-100/80 px-2 py-0.5 rounded-[8px] border border-red-300">
                Action Required
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Active industry demand for <strong className="text-red-900 font-semibold">{criticalGaps[0].skillName || criticalGaps[0].skill_name}</strong> ({criticalGaps[0].industryDemandScore || criticalGaps[0].industry_demand_score}%) significantly exceeds your student cohort average ({criticalGaps[0].studentCohortAverage || criticalGaps[0].student_cohort_average}%) by{" "}
              <strong className="text-red-900 font-bold">{criticalGaps[0].gap} percentage points</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs font-medium text-slate-600">
                Recommended Action: {criticalGaps[0].suggestedAction || criticalGaps[0].suggested_action}
              </span>
              <Link
                href="/institution/demand"
                className="text-xs font-bold text-red-700 hover:text-red-900 underline underline-offset-2"
              >
                Inspect All Industry Demand Gaps →
              </Link>
            </div>
          </div>
        )}

        {/* Top Demanded Skills Table */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-heading font-medium text-base text-slate-900">Industry Demand vs Student Capability Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregating {demandComparison.length} evaluated industry competencies against student cohort test records
              </p>
            </div>
            <Link href="/institution/demand" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              Full Analytics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="p-3">Skill Competency</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Industry Demand</th>
                  <th className="p-3 text-center">Student Cohort Avg</th>
                  <th className="p-3 text-center">Structural Gap</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandComparison.slice(0, 5).map((dc: any) => {
                  const sName = dc.skillName || dc.skill_name || "Skill";
                  const cName = dc.categoryName || dc.category_name || "General";
                  const indScore = dc.industryDemandScore ?? dc.industry_demand_score ?? 0;
                  const stAvg = dc.studentCohortAverage ?? dc.student_cohort_average ?? 0;
                  const gapVal = dc.gap ?? 0;
                  const statusVal = dc.status || "HEALTHY_SUPPLY";

                  return (
                    <tr key={dc.skillId || dc.skill_id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">{sName}</td>
                      <td className="p-3 text-slate-500">{cName}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{indScore}%</td>
                      <td className="p-3 text-center font-semibold text-slate-600">{stAvg}%</td>
                      <td className="p-3 text-center font-black">
                        <span className={gapVal >= 20 ? "text-red-600" : gapVal > 0 ? "text-amber-600" : "text-emerald-700"}>
                          {gapVal > 0 ? `+${gapVal} gap` : `${gapVal} surplus`}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusVal === "CRITICAL_GAP"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : statusVal === "MODERATE_GAP"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {statusVal.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cohort Discipline Breakdown */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-heading font-medium text-sm uppercase tracking-wider text-slate-900">
              Cohort Distribution Across AYUSH Disciplines
            </h3>
            <Link href="/institution/students" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Browse Student Ledger →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {["Ayurveda", "Yoga & Naturopathy", "Unani", "Siddha", "Homoeopathy", "Cross-disciplinary"].map((disc) => {
              const count = students.filter((s: any) =>
                (s.discipline || s.discipline_name || "").toLowerCase().includes(disc.toLowerCase().split(" ")[0])
              ).length;
              return (
                <div key={disc} className="p-3.5 rounded-[12px] border border-slate-200/80 bg-slate-50/60 text-center space-y-1">
                  <span className="font-heading font-bold text-xl text-slate-900 block">{count}</span>
                  <span className="text-[11px] font-medium text-slate-600 block">{disc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
