import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import FeedbackFormClient from "@/components/industry/FeedbackFormClient";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function IndustryFeedbackPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INDUSTRY") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const resolvedParams = await params;
  const { applicationId } = resolvedParams;

  let application: any = null;
  try {
    application = await industryApi.getApplication(applicationId);
  } catch {
    notFound();
  }

  if (!application) notFound();

  const skills = (application.opportunity?.skills || []).map((s: any) => ({
    id: s.skill?.id || s.id || "skill-id",
    name: s.skill?.name || s.name || "Skill",
  }));

  const initialSkillRatings: Record<string, number> = {};
  if (application.feedback && Array.isArray(application.feedback.skillRatings)) {
    for (const sr of application.feedback.skillRatings) {
      if (sr.skillId) initialSkillRatings[sr.skillId] = sr.rating;
    }
  }

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        <FeedbackFormClient
          applicationId={application.id}
          candidateName={application.studentProfile?.user?.name || "Candidate"}
          opportunityTitle={application.opportunity?.title || "Opportunity"}
          skills={skills}
          initialRating={application.feedback?.overallRating || 5}
          initialFeedback={application.feedback?.writtenFeedback || ""}
          initialStrengths={application.feedback?.strengths || ""}
          initialImprovements={application.feedback?.improvements || ""}
          initialSkillRatings={initialSkillRatings}
        />
      </div>
    </AppShell>
  );
}
