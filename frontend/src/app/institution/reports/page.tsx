import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import InstitutionReportsClient from "@/components/institution/InstitutionReportsClient";

export default async function InstitutionReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    redirect("/login");
  }

  const [dashboard, reports] = await Promise.all([
    institutionApi.getDashboard().catch(() => null),
    institutionApi.getReports("NAAC").catch(() => null),
  ]);

  const totalStudents = dashboard?.total_students ?? 2;
  const totalAssessments = dashboard?.assessed_students_count ?? 2;
  const totalVerifiedSkills = (dashboard?.total_students ?? 2) * 5;
  const totalPlacements = dashboard?.placed_count ?? 1;

  return (
    <AppShell allowedRole="INSTITUTION">
      <InstitutionReportsClient
        totalStudents={totalStudents}
        totalAssessments={totalAssessments}
        totalVerifiedSkills={totalVerifiedSkills}
        totalPlacements={totalPlacements}
        initialReport={reports}
      />
    </AppShell>
  );
}
