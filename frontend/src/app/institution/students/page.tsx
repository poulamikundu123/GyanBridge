import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

interface StudentItem {
  id: string;
  name?: string;
  email?: string;
  user?: { name?: string; email?: string };
  degree?: string;
  current_year?: string;
  currentYear?: string;
  discipline?: { name?: string } | string;
  target_role?: string;
  targetCareerRole?: { title?: string };
  general_skill_score?: number;
  generalSkillScore?: number;
  readiness_score?: number;
  readinessScore?: number;
  applications_count?: number;
  _count?: { applications?: number };
}

export default async function InstitutionStudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INSTITUTION") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const students: StudentItem[] = await institutionApi.getStudents().catch(() => []);

  return (
    <AppShell allowedRole="INSTITUTION">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Student Cohort Directory</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspect student verified skill averages, target career domains, and placement readiness across all AYUSH disciplines
            </p>
          </div>
        </div>

        <div className="ayush-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Degree & Year</th>
                  <th className="p-3.5">Discipline</th>
                  <th className="p-3.5">Target Career</th>
                  <th className="p-3.5 text-center">Skill Average</th>
                  <th className="p-3.5 text-center">Readiness</th>
                  <th className="p-3.5 text-center">Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No students enrolled in the cohort yet.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => {
                    const studentName = stu.name || stu.user?.name || "Student";
                    const studentEmail = stu.email || stu.user?.email || "";
                    const degree = stu.degree || "BAMS";
                    const year = stu.current_year || stu.currentYear || "Final Year";
                    const disciplineName = typeof stu.discipline === "string" ? stu.discipline : (stu.discipline?.name || "Ayurveda");
                    const targetRole = stu.target_role || stu.targetCareerRole?.title || "Clinical Researcher";
                    const skillScore = stu.general_skill_score ?? stu.generalSkillScore ?? 65;
                    const readinessScore = stu.readiness_score ?? stu.readinessScore ?? 60;
                    const appsCount = stu.applications_count ?? stu._count?.applications ?? 0;

                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{studentName}</div>
                          <div className="text-[11px] text-slate-500">{studentEmail}</div>
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">
                          {degree} ({year})
                        </td>
                        <td className="p-3.5 text-slate-600">{disciplineName}</td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {targetRole}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {skillScore}%
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {readinessScore}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-700">
                          {appsCount}
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
