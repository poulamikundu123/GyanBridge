import { apiFetch } from "@/lib/api";

// Industry Demand Intelligence Engine
// Aggregates real industry skill requirements against cohort average competencies

export interface SkillDemandComparison {
  skillId: string;
  skillName: string;
  categoryName: string;
  industryDemandScore: number; // Average required proficiency across active opportunity postings
  studentCohortAverage: number; // Average verified score across registered students
  gap: number; // industryDemandScore - studentCohortAverage
  demandFrequency: number; // How many opportunities mandate this skill
  status: "CRITICAL_GAP" | "MODERATE_GAP" | "HEALTHY_SUPPLY" | "EXCELLENT";
  suggestedAction: string;
}

/**
 * Authoritative demand matrix calculation.
 * Fetches from backend /institution/demand endpoint with database-level aggregation.
 */
export async function getInstitutionalDemandMatrix(): Promise<SkillDemandComparison[]> {
  try {
    const res = await apiFetch("/institution/demand");
    if (Array.isArray(res)) {
      return res.map((d: any) => ({
        skillId: d.skillId ?? d.skill_id ?? "",
        skillName: d.skillName ?? d.skill_name ?? "Skill",
        categoryName: d.categoryName ?? d.category_name ?? d.category ?? "General",
        industryDemandScore: Number(d.industryDemandScore ?? d.industry_demand_score ?? d.industry_demand_percentage ?? 0),
        studentCohortAverage: Number(d.studentCohortAverage ?? d.student_cohort_average ?? d.curriculum_coverage_percentage ?? 0),
        gap: Number(d.gap ?? d.gap_percentage ?? 0),
        demandFrequency: Number(d.demandFrequency ?? d.demand_frequency ?? d.freq ?? 0),
        status: (d.status ?? (d.gap >= 25 ? "CRITICAL_GAP" : d.gap >= 12 ? "MODERATE_GAP" : "HEALTHY_SUPPLY")) as SkillDemandComparison["status"],
        suggestedAction: d.suggestedAction ?? d.suggested_action ?? "Maintain curriculum alignment",
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch institutional demand matrix:", error);
    return [];
  }
}
