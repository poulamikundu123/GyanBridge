// Deterministic & Explainable Matching Engine
// Weights: Technical Skill (50%), Education (15%), Discipline (10%), Career Sector (10%), Experience (5%), Certification (5%), Location (5%)
// Strictly data-driven with Zero Artificial Baseline Inflation and Mandatory Skill Gatekeeping

export interface MatchBreakdown {
  overallScore: number; // 0 - 100
  skillScore: number; // 0 - 50
  educationScore: number; // 0 - 15
  disciplineScore: number; // 0 - 10
  careerInterestScore: number; // 0 - 10
  experienceScore: number; // 0 - 5
  certificationScore: number; // 0 - 5
  locationScore: number; // 0 - 5
  strengths: string[];
  gaps: string[];
  explanations: string[];
  missingMandatory?: string[];
}

export interface StudentMatchProfile {
  id: string;
  degree: string;
  ayushDisciplineId: string;
  ayushDisciplineName?: string;
  targetCareerRoleId?: string | null;
  targetCareerSectorId?: string | null;
  location?: string | null;
  preferredWorkMode?: string;
  skills: Array<{
    skillId: string;
    skillName: string;
    proficiencyScore: number;
    verificationLevel?: string;
  }>;
  projectsCount: number;
  certificationsCount: number;
}

export interface OpportunityMatchTarget {
  id: string;
  title: string;
  opportunityType: string;
  sectorId: string;
  disciplineId?: string | null;
  disciplineName?: string;
  eligibilityDegree: string;
  location: string;
  workMode: string; // REMOTE, HYBRID, ONSITE
  skills: Array<{
    skillId: string;
    skillName: string;
    requiredProficiency: number;
    isMandatory: boolean;
    weight?: number;
  }>;
}

export function calculateOpportunityMatch(
  student: StudentMatchProfile,
  opportunity: OpportunityMatchTarget
): MatchBreakdown {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const explanations: string[] = [];
  const missingMandatory: string[] = [];

  // ----------------------------------------------------
  // 1. SKILL MATCH (50% WEIGHT)
  // ----------------------------------------------------
  let skillPoints = 0;
  let totalMandatory = 0;
  let missingMandatoryCount = 0;

  const studentSkillMap = new Map<string, { score: number; level?: string }>();
  for (const s of student.skills || []) {
    studentSkillMap.set(s.skillId, { score: s.proficiencyScore, level: s.verificationLevel });
  }

  if (opportunity.skills && opportunity.skills.length > 0) {
    let weightedRatioSum = 0;
    let totalWeight = 0;

    for (const req of opportunity.skills) {
      if (req.isMandatory) totalMandatory++;

      const studentSkill = studentSkillMap.get(req.skillId);
      const studentScore = studentSkill ? studentSkill.score : 0;
      const requiredScore = req.requiredProficiency || 50;
      const weight = req.weight || 1.0;

      totalWeight += weight;

      if (!studentSkill || studentScore <= 0) {
        if (req.isMandatory) {
          missingMandatoryCount++;
          missingMandatory.push(req.skillName);
          gaps.push(`Missing mandatory skill: ${req.skillName} (Not Assessed)`);
        } else {
          gaps.push(`Unassessed recommended skill: ${req.skillName}`);
        }
      } else {
        let ratio = Math.min(1.0, studentScore / requiredScore);

        if (req.isMandatory && studentScore < requiredScore * 0.5) {
          ratio *= 0.75;
          missingMandatoryCount++;
          missingMandatory.push(req.skillName);
          gaps.push(`Critical deficit in mandatory skill: ${req.skillName} (${Math.round(studentScore)}% vs required ${Math.round(requiredScore)}%)`);
        } else if (studentScore >= requiredScore) {
          strengths.push(`Strong proficiency in ${req.skillName} (${Math.round(studentScore)}% vs required ${Math.round(requiredScore)}%)`);
        } else {
          gaps.push(`Moderate deficit in ${req.skillName} (${Math.round(studentScore)}% vs required ${Math.round(requiredScore)}%)`);
        }

        weightedRatioSum += ratio * weight;
      }
    }

    const avgSkillRatio = totalWeight > 0 ? weightedRatioSum / totalWeight : 0;
    skillPoints = Math.round(avgSkillRatio * 50 * 10) / 10;
  } else {
    // Open skills opportunity
    skillPoints = 25;
    strengths.push("Foundational skills align with opportunity scope");
  }

  // ----------------------------------------------------
  // 2. EDUCATION MATCH (15% WEIGHT)
  // ----------------------------------------------------
  let educationPoints = 0;
  const reqDegrees = (opportunity.eligibilityDegree || "").toLowerCase().trim();
  const studentDegree = (student.degree || "").toLowerCase().trim();

  if (!reqDegrees || reqDegrees.includes("any")) {
    educationPoints = 15;
    strengths.push("Educational eligibility open to all degrees");
  } else if (studentDegree) {
    const degreesList = ["bams", "bhms", "bums", "bsms", "bnys", "mpharm", "msc", "mph", "btech", "md", "ms", "phd"];
    const matchesExact = degreesList.some(
      (d) => studentDegree.includes(d) && reqDegrees.includes(d)
    );

    if (matchesExact || reqDegrees.includes(studentDegree) || studentDegree.includes(reqDegrees)) {
      educationPoints = 15;
      strengths.push(`Degree matches requirement: ${student.degree}`);
    } else if (reqDegrees.includes("ayush") && degreesList.some((d) => studentDegree.includes(d))) {
      educationPoints = 15;
      strengths.push(`AYUSH medical degree satisfies eligibility: ${student.degree}`);
    } else {
      educationPoints = 0;
      gaps.push(`Degree mismatch: holds ${student.degree} but requires ${opportunity.eligibilityDegree}`);
    }
  } else {
    educationPoints = 0;
    gaps.push("Educational degree not specified in student profile");
  }

  // ----------------------------------------------------
  // 3. AYUSH DISCIPLINE MATCH (10% WEIGHT)
  // ----------------------------------------------------
  let disciplinePoints = 0;
  if (!opportunity.disciplineId) {
    disciplinePoints = 10; // Open to all AYUSH disciplines
    strengths.push("Open to all AYUSH disciplines");
  } else if (student.ayushDisciplineId && opportunity.disciplineId === student.ayushDisciplineId) {
    disciplinePoints = 10;
    strengths.push(`AYUSH discipline matches: ${student.ayushDisciplineName || "Discipline"}`);
  } else {
    disciplinePoints = 0;
    gaps.push("Discipline does not align with targeted domain");
  }

  // ----------------------------------------------------
  // 4. CAREER SECTOR FIT (10% WEIGHT)
  // ----------------------------------------------------
  let careerPoints = 0;
  if (student.targetCareerSectorId && opportunity.sectorId && student.targetCareerSectorId === opportunity.sectorId) {
    careerPoints = 10;
    strengths.push("Direct career sector alignment");
  } else if (student.targetCareerRoleId) {
    careerPoints = 5.0;
  } else {
    careerPoints = 0;
  }

  // ----------------------------------------------------
  // 5. EXPERIENCE MATCH (5% WEIGHT)
  // ----------------------------------------------------
  let experiencePoints = 0;
  if (student.projectsCount >= 2) {
    experiencePoints = 5;
    strengths.push(`Proven project portfolio (${student.projectsCount} projects)`);
  } else if (student.projectsCount === 1) {
    experiencePoints = 2.5;
    strengths.push("Practical project experience demonstrated");
  } else {
    experiencePoints = 0;
    gaps.push("No practical projects on record");
  }

  // ----------------------------------------------------
  // 6. CERTIFICATION MATCH (5% WEIGHT)
  // ----------------------------------------------------
  let certificationPoints = 0;
  if (student.certificationsCount >= 2) {
    certificationPoints = 5;
    strengths.push("Multiple verified certifications in profile");
  } else if (student.certificationsCount === 1) {
    certificationPoints = 2.5;
    strengths.push("Verified certification on record");
  } else {
    certificationPoints = 0;
  }

  // ----------------------------------------------------
  // 7. LOCATION & WORK MODE MATCH (5% WEIGHT)
  // ----------------------------------------------------
  let locationPoints = 0;
  const oppMode = (opportunity.workMode || "").toUpperCase();
  const oppLoc = (opportunity.location || "").toLowerCase();
  const studLoc = (student.location || "").toLowerCase();

  if (oppMode === "REMOTE") {
    locationPoints = 5;
    strengths.push("100% Remote flexibility");
  } else if (studLoc && oppLoc && (oppLoc.includes(studLoc) || studLoc.includes(oppLoc))) {
    locationPoints = 5;
    strengths.push(`Location matches: ${opportunity.location}`);
  } else if (oppMode === "HYBRID") {
    locationPoints = 3;
  } else {
    locationPoints = 0;
  }

  // ----------------------------------------------------
  // TOTAL SCORE & MANDATORY GATEKEEPER
  // ----------------------------------------------------
  let rawOverall =
    skillPoints +
    educationPoints +
    disciplinePoints +
    careerPoints +
    experiencePoints +
    certificationPoints +
    locationPoints;

  // Gatekeeper penalty: Missing mandatory competencies severely penalizes compatibility
  if (missingMandatoryCount > 0) {
    const penaltyRatio = Math.min(1.0, missingMandatoryCount / Math.max(totalMandatory, 1));
    const penaltyFactor = Math.max(0.1, 1.0 - (penaltyRatio * 0.65));
    rawOverall *= penaltyFactor;
    explanations.push(`Score scaled down due to ${missingMandatoryCount} missing mandatory competencies.`);
  }

  const overallScore = Math.min(100, Math.max(0, Math.round(rawOverall)));

  return {
    overallScore,
    skillScore: Math.round(skillPoints * 10) / 10,
    educationScore: Math.round(educationPoints * 10) / 10,
    disciplineScore: Math.round(disciplinePoints * 10) / 10,
    careerInterestScore: Math.round(careerPoints * 10) / 10,
    experienceScore: Math.round(experiencePoints * 10) / 10,
    certificationScore: Math.round(certificationPoints * 10) / 10,
    locationScore: Math.round(locationPoints * 10) / 10,
    strengths,
    gaps,
    explanations,
    missingMandatory,
  };
}
