import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import IndustryTrainingManager from "@/components/industry/IndustryTrainingManager";

export default async function IndustryTrainingPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY" || !user.profileId) {
    redirect("/login");
  }

  const [trainingPrograms, meta, profile] = await Promise.all([
    industryApi.getTraining().catch(() => []),
    industryApi.getMeta().catch(() => ({ skills: [] })),
    industryApi.getProfile().catch(() => null),
  ]);

  const companyName = profile?.companyName || profile?.company_name || user.name || "AYUSH Partner";
  const availableSkills = meta?.skills || [];

  return (
    <AppShell allowedRole="INDUSTRY">
      <IndustryTrainingManager
        initialPrograms={Array.isArray(trainingPrograms) ? trainingPrograms : []}
        availableSkills={availableSkills}
        companyName={companyName}
      />
    </AppShell>
  );
}

