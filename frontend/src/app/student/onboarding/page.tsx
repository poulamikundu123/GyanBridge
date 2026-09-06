import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import OnboardingWizardClient from "@/components/student/OnboardingWizardClient";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const student = await studentApi.getProfile();

  const meta = await studentApi.getMeta();
  const disciplines: any[] = meta?.disciplines || [];
  const careerRoles: any[] = await studentApi.getCareerRoles();

  const hasSavedProfile = Boolean(student && student.institution && student.degree);

  const matchedDiscipline = disciplines.find(
    (d) => d.id === student?.ayushDisciplineId || d.name.toLowerCase() === student?.discipline?.name?.toLowerCase()
  );
  const disciplineId = matchedDiscipline?.id || student?.ayushDisciplineId || disciplines[0]?.id || "";

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Student Profile & Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your academic credentials, AYUSH discipline specialization, and career trajectory
          </p>
        </div>

        <OnboardingWizardClient
          initialData={{
            name: user.name,
            email: user.email,
            degree: student?.degree || "",
            institution: student?.institution || "",
            currentYear: student?.currentYear || "1st Year",
            graduationYear: student?.graduationYear || new Date().getFullYear(),
            cgpa: student?.cgpa ? Number(student.cgpa) : 0,
            disciplineId,
            targetRoleId: student?.targetCareerRoleId || careerRoles[0]?.id || "",
            location: student?.location || "",
            bio: student?.bio || "",
            preferredWorkMode: student?.preferredWorkMode || "HYBRID",
          }}
          hasSavedProfile={hasSavedProfile}
          readinessScore={Math.round(student?.readinessScore || 0)}
          verifiedSkillsCount={student?.skills?.length || 0}
          disciplines={disciplines.map((d) => ({ id: d.id, name: d.name, code: d.code }))}
          careerRoles={careerRoles.map((r) => ({ id: r.id, title: r.title }))}
        />
      </div>
    </AppShell>
  );
}
