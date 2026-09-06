"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SavedProfileCard, { WizardData } from "./onboarding/SavedProfileCard";
import OnboardingStepsForm from "./onboarding/OnboardingStepsForm";

export type { WizardData };

export interface OnboardingWizardProps {
  initialData: WizardData;
  disciplines: Array<{ id: string; name: string; code?: string }>;
  careerRoles: Array<{ id: string; title: string }>;
  hasSavedProfile?: boolean;
  readinessScore?: number;
  verifiedSkillsCount?: number;
}

export default function OnboardingWizardClient({
  initialData,
  disciplines,
  careerRoles,
  hasSavedProfile = true,
  readinessScore = 0,
  verifiedSkillsCount = 0,
}: OnboardingWizardProps) {
  const router = useRouter();

  // If the user has already saved their profile, start in Card View (!isEditing)
  // If fresh user without saved profile, start in Edit / Wizard mode
  const [isEditing, setIsEditing] = useState(!hasSavedProfile);
  const [formData, setFormData] = useState<WizardData>(initialData);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Helper getters
  const selectedDiscipline =
    disciplines.find((d) => d.id === formData.disciplineId)?.name ||
    disciplines[0]?.name ||
    "Ayurveda";
  const selectedRoleTitle =
    careerRoles.find((r) => r.id === formData.targetRoleId)?.title ||
    careerRoles[0]?.title ||
    "Clinical Researcher";

  const handleChange = (field: keyof WizardData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree: formData.degree,
          institution: formData.institution,
          currentYear: formData.currentYear,
          graduationYear: formData.graduationYear,
          cgpa: formData.cgpa,
          ayushDisciplineId: formData.disciplineId,
          targetRoleId: formData.targetRoleId,
          location: formData.location,
          bio: formData.bio,
          preferredWorkMode: formData.preferredWorkMode || "HYBRID",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowSuccessToast(true);
        setIsEditing(false); // Return directly to Profile Card view!
        router.refresh();
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 4000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <SavedProfileCard
        formData={formData}
        selectedDiscipline={selectedDiscipline}
        selectedRoleTitle={selectedRoleTitle}
        readinessScore={readinessScore}
        showSuccessToast={showSuccessToast}
        onDismissToast={() => setShowSuccessToast(false)}
        onEditProfile={(stepNumber = 1) => {
          setStep(stepNumber);
          setIsEditing(true);
        }}
      />
    );
  }

  return (
    <OnboardingStepsForm
      formData={formData}
      onChange={handleChange}
      step={step}
      setStep={setStep}
      onCancel={() => setIsEditing(false)}
      onSave={handleSave}
      saving={saving}
      disciplines={disciplines}
      careerRoles={careerRoles}
      selectedDiscipline={selectedDiscipline}
      selectedRoleTitle={selectedRoleTitle}
    />
  );
}
