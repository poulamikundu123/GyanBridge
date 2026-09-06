// Skill Gap Engine
// Computes role-specific gaps and readiness benchmarks

export type GapCategory = "Strong Match" | "Minor Gap" | "Moderate Gap" | "Major Gap";

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  categoryName?: string;
  studentScore: number;
  requiredScore: number;
  gap: number;
  classification: GapCategory;
  isMandatory: boolean;
  weight: number;
}

export interface RoleReadinessResult {
  roleId: string;
  roleTitle: string;
  readinessPercentage: number;
  strengths: SkillGapItem[];
  minorGaps: SkillGapItem[];
  moderateGaps: SkillGapItem[];
  majorGaps: SkillGapItem[];
  allGaps: SkillGapItem[];
}

export function classifyGap(gap: number): GapCategory {
  if (gap <= 5) return "Strong Match";
  if (gap <= 15) return "Minor Gap";
  if (gap <= 30) return "Moderate Gap";
  return "Major Gap";
}

/**
 * Calculates skill gap: Industry Requirement - Student Verified Skill
 * If student has higher than required, gap is 0 (Strong Match)
 */
export function calculateSkillGap(requiredScore: number, studentScore: number) {
  const rawDiff = requiredScore - studentScore;
  const gap = Math.max(0, Math.round(rawDiff * 10) / 10);
  const classification = classifyGap(gap);
  return { gap, classification };
}

/**
 * Calculates student readiness for a specific Career Role based on database-mapped skills
 */
export function calculateRoleReadiness(
  role: {
    id: string;
    title: string;
    skills: Array<{
      skillId: string;
      skill?: { id?: string; name?: string; category?: { name?: string } };
      skillName?: string;
      requiredProficiency: number;
      isMandatory: boolean;
      weight: number;
    }>;
  },
  studentSkills: Array<{
    skillId: string;
    proficiencyScore: number;
  }>
): RoleReadinessResult {
  const studentSkillMap = new Map<string, number>();
  for (const s of studentSkills) {
    studentSkillMap.set(s.skillId, s.proficiencyScore);
  }

  const items: SkillGapItem[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const req of (role.skills ?? [])) {
    if (!req) continue;
    const studentScore = studentSkillMap.get(req.skillId) || 0;
    const requiredScore = req.requiredProficiency || 70;
    const { gap, classification } = calculateSkillGap(requiredScore, studentScore);

    // Scoring: Ratio of student score to required score (capped at 1.0)
    // If mandatory and student score is 0, penalty applies
    const ratio = requiredScore > 0 ? Math.min(1.0, studentScore / requiredScore) : 1.0;
    const weight = req.weight || 1.0;

    totalWeightedScore += ratio * 100 * weight;
    totalWeight += weight;

    items.push({
      skillId: req.skillId,
      skillName: req.skill?.name ?? req.skillName ?? "Skill",
      categoryName: req.skill?.category?.name,
      studentScore,
      requiredScore,
      gap,
      classification,
      isMandatory: req.isMandatory ?? false,
      weight,
    });
  }

  const readinessPercentage =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  const strengths = items.filter((i) => i.classification === "Strong Match");
  const minorGaps = items.filter((i) => i.classification === "Minor Gap");
  const moderateGaps = items.filter((i) => i.classification === "Moderate Gap");
  const majorGaps = items.filter((i) => i.classification === "Major Gap");

  return {
    roleId: role.id,
    roleTitle: role.title,
    readinessPercentage,
    strengths,
    minorGaps,
    moderateGaps,
    majorGaps,
    allGaps: items,
  };
}
