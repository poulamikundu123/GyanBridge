import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import CreateOpportunityClient from "@/components/industry/CreateOpportunityClient";

export default async function CreateOpportunityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY" || !user.profileId) {
    redirect("/login");
  }

  const meta = await industryApi.getMeta();
  const sectors = meta?.sectors || [];
  const disciplines = meta?.disciplines || [];
  const rawSkills = meta?.skills || [];
  const skills = rawSkills.map((s: any) => ({
    id: s.id,
    name: s.name,
    categoryName: s.categoryName || s.category?.name || "General",
  }));

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        <CreateOpportunityClient
          sectors={sectors}
          disciplines={disciplines}
          skills={skills.map((s) => ({
            id: s.id,
            name: s.name,
            categoryName: s.category?.name || "General",
          }))}
        />
      </div>
    </AppShell>
  );
}
