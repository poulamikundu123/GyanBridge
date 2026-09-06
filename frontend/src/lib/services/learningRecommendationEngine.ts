// Personalized Learning Recommendation Engine
// Maps student's largest skill gaps to targeted training programs

export interface TrainingRecommendation {
  trainingId: string;
  title: string;
  providerName: string;
  category: string;
  durationHours: number;
  mode: string;
  level: string;
  certificateProvided: boolean;
  matchScore: number; // 0 - 100% how well this addresses the student's gaps
  targetSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyGain: number;
    currentStudentScore: number;
  }>;
  reason: string;
  projectedSkillBoost: number; // Estimated average points gained
}

export function recommendTrainingPrograms(
  studentGaps: Array<{
    skillId: string;
    skillName: string;
    gap: number;
    studentScore: number;
  }>,
  availablePrograms: Array<{
    id: string;
    title: string;
    providerName: string;
    category: string;
    durationHours: number;
    mode: string;
    level: string;
    certificateProvided: boolean;
    skills: Array<{
      skillId: string;
      skill?: { id?: string; name?: string };
      skillName?: string;
      proficiencyGain: number;
    }>;
  }>
): TrainingRecommendation[] {
  const gapMap = new Map<string, { gap: number; score: number; name: string }>();
  for (const g of studentGaps) {
    if (g.gap > 0) {
      gapMap.set(g.skillId, { gap: g.gap, score: g.studentScore, name: g.skillName });
    }
  }

  const totalStudentGap = studentGaps.reduce((acc, g) => acc + (g.gap > 0 ? g.gap : 0), 0);

  const recommendations: TrainingRecommendation[] = [];

  for (const program of availablePrograms) {
    let addressedGapSum = 0;
    let relevantSkillsCount = 0;
    const targetSkills: TrainingRecommendation["targetSkills"] = [];

    for (const ts of (program.skills || [])) {
      const sId = (ts as any).skillId ?? (ts as any).skill_id ?? (ts as any).id ?? "";
      const pGain = (ts as any).proficiencyGain ?? (ts as any).proficiency_gain ?? 20;
      const sName = (ts as any).skill?.name ?? (ts as any).skillName ?? (ts as any).skill_name ?? (ts as any).name ?? "Skill";
      const studentGap = gapMap.get(sId);
      if (studentGap) {
        // This training addresses an active student gap!
        addressedGapSum += Math.min(studentGap.gap, pGain);
        relevantSkillsCount++;
        targetSkills.push({
          skillId: sId,
          skillName: sName,
          proficiencyGain: pGain,
          currentStudentScore: studentGap.score,
        });
      }
    }

    if (relevantSkillsCount > 0 && totalStudentGap > 0) {
      // Proportional match score: 70% gap coverage + 30% program relevance
      const totalProgramSkills = Math.max(program.skills.length, 1);
      const gapCoverageRatio = addressedGapSum / totalStudentGap;
      const relevanceRatio = relevantSkillsCount / totalProgramSkills;
      const matchScore = Math.round(Math.min(100, Math.max(0, (gapCoverageRatio * 0.7 + relevanceRatio * 0.3) * 100)));
      const topSkill = targetSkills[0]?.skillName || "target skills";

      recommendations.push({
        trainingId: program.id,
        title: program.title,
        providerName: (program as any).providerName ?? (program as any).provider_name ?? "AYUSH Council",
        category: program.category,
        durationHours: (program as any).durationHours ?? (program as any).duration_hours ?? 40,
        mode: program.mode,
        level: program.level,
        certificateProvided: (program as any).certificateProvided ?? (program as any).certificate_provided ?? true,
        matchScore,
        targetSkills,
        reason: `Directly bridges your ${topSkill} skill gap with +${targetSkills[0]?.proficiencyGain || 20}% projected competency gain.`,
        projectedSkillBoost: Math.round(addressedGapSum / relevantSkillsCount),
      });
    }
  }

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
