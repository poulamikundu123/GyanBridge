import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi, resumeApi } from "@/lib/apiClient";
import ResumeCoachClient from "@/components/student/ResumeCoachClient";
import { redirect } from "next/navigation";

export default async function StudentResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const student = await studentApi.getProfile();

  if (!student) {
    redirect("/student/onboarding");
  }

  let studentResumes: any[] = [];
  let initialAnalysis: any = null;
  try {
    const latestResume = await resumeApi.getLatest();
    if (latestResume && latestResume.success && latestResume.resume_id) {
      studentResumes = [
        {
          id: latestResume.resume_id,
          fileName: latestResume.file_name || "Resume",
          fileType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          alignmentScore: latestResume.alignment_score || 0,
          version: 1,
          parsedData: {
            targetRole: latestResume.target_role,
            recommendations: latestResume.recommendations || [],
            bulletImprovements: latestResume.bullet_improvements || [],
          },
        },
      ];
      if (latestResume.analysis) {
        initialAnalysis = latestResume.analysis;
      }
    }
  } catch (err) {
    console.warn("Could not query resumes directly:", err);
  }

  // Fetch targeted training programs in the platform
  const rawTraining = await studentApi.getLearningPrograms();
  const trainingProgramsData = rawTraining.slice(0, 4);

  const structuredTraining = trainingProgramsData.map((tp) => ({
    id: tp.id,
    title: tp.title,
    providerName: tp.providerName,
    durationHours: tp.durationHours,
    mode: tp.mode,
    skillName: tp.skills[0]?.skill?.name || "Clinical Competency",
  }));

  const toIso = (d: any) => {
    try {
      return (typeof d === "string" ? new Date(d) : d || new Date()).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const activeResume = studentResumes[0]
    ? {
        id: studentResumes[0].id,
        fileName: studentResumes[0].fileName,
        fileType: studentResumes[0].fileType,
        uploadedAt: toIso(studentResumes[0].uploadedAt),
        alignmentScore: studentResumes[0].alignmentScore,
        version: studentResumes[0].version,
        parsedData: studentResumes[0].parsedData,
      }
    : null;

  const resumeHistory = studentResumes.map((r) => ({
    id: r.id,
    fileName: r.fileName,
    fileType: r.fileType,
    uploadedAt: toIso(r.uploadedAt),
    alignmentScore: r.alignmentScore,
    version: r.version,
    parsedData: r.parsedData,
  }));

  return (
    <AppShell allowedRole="STUDENT">
      <ResumeCoachClient
        initialResume={activeResume}
        initialAnalysis={initialAnalysis}
        resumeHistory={resumeHistory}
        activeCareerGoal={student.targetCareerRole}
        trainingPrograms={structuredTraining}
      />
    </AppShell>
  );
}
