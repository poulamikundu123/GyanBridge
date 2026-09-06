import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import { FileCheck } from "lucide-react";
import { redirect } from "next/navigation";

interface PlacementApplication {
  id: string;
  student_name?: string;
  opportunity_title?: string;
  company_name?: string;
  companyName?: string;
  status: string;
  match_score?: number;
  matchScorePercentage?: number;
  studentProfile?: {
    user?: { name?: string; email?: string };
    discipline?: { name?: string };
  };
  opportunity?: {
    title?: string;
    industryProfile?: { company_name?: string; companyName?: string };
    sector?: { name?: string };
  };
}

export default async function InstitutionPlacementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INSTITUTION") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const applications: PlacementApplication[] = await institutionApi.getPlacements().catch(() => []);

  const stages = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "JOINED", "COMPLETED"];
  const stageCounts: Record<string, number> = {};
  for (const s of stages) {
    stageCounts[s] = applications.filter((a) => a.status === s).length;
  }

  return (
    <AppShell allowedRole="INSTITUTION">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Placement & Internship Conversion Pipeline</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time audit of student application progressions from initial submission to selection and completion
            </p>
          </div>
        </div>

        {/* Pipeline Stage Funnel */}
        <div className="ayush-card p-6">
          <h2 className="font-heading font-medium text-sm uppercase tracking-wider text-slate-900 mb-4">
            Institutional Placement Funnel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {stages.map((st) => {
              const count = stageCounts[st] || 0;
              const hasCount = count > 0;
              return (
                <div
                  key={st}
                  className={`p-3.5 rounded-[12px] border transition-all ${
                    hasCount
                      ? "bg-emerald-50/60 border-emerald-300/80 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80"
                  } space-y-1`}
                >
                  <span
                    className={`font-heading font-bold text-2xl block ${
                      hasCount ? "text-emerald-800" : "text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-slate-500 block truncate uppercase tracking-wider">
                    {st.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Application Ledger */}
        <div className="ayush-card p-6">
          <h3 className="font-heading font-medium text-sm uppercase tracking-wider text-slate-900 mb-3">All Active Application Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Discipline</th>
                  <th className="p-3">Employer</th>
                  <th className="p-3">Opportunity Title</th>
                  <th className="p-3 text-center">Match Fit</th>
                  <th className="p-3">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No student applications in pipeline yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const studentName = app.student_name || app.studentProfile?.user?.name || "Student";
                    const disciplineName = app.studentProfile?.discipline?.name || "General AYUSH";
                    const employerName = app.company_name || app.companyName || app.opportunity?.industryProfile?.companyName || "AYUSH Partner";
                    const oppTitle = app.opportunity_title || app.opportunity?.title || "Opportunity";
                    const matchFit = app.matchScorePercentage ?? app.match_score ?? 0;

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">{studentName}</td>
                        <td className="p-3 text-slate-500">{disciplineName}</td>
                        <td className="p-3 font-semibold text-slate-800">{employerName}</td>
                        <td className="p-3 text-slate-700">{oppTitle}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{matchFit}%</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {app.status}
                          </span>
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
