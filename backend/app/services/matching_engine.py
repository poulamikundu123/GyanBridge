from typing import List, Dict, Any, Optional

def calculate_opportunity_match(*args, **kwargs) -> dict:
    """
    Authoritative, Multi-Factor, Data-Driven Matching Algorithm:
    Single Source of Truth based on real SQLite database records:
    - Technical Competencies & Skills (50% max)
    - Educational Eligibility (15% max)
    - AYUSH Discipline Alignment (10% max)
    - Career Interest & Sector Fit (10% max)
    - Practical Projects / Experience (5% max)
    - Verified Industry Certifications (5% max)
    - Work Mode / Location Fit (5% max)
    
    Zero Artificial Inflation:
    - Missing mandatory skills severely gatekeep/penalize candidate compatibility.
    - Unmatched dimensions score 0 points, eliminating the artificial 30% floor.
    """
    student_data = kwargs.get("student_data") or kwargs.get("candidate_skills")
    opp_data = kwargs.get("opp_data") or kwargs.get("required_skills") or kwargs.get("opportunity_data")

    if args:
        if len(args) >= 1 and student_data is None:
            student_data = args[0]
        if len(args) >= 2 and opp_data is None:
            opp_data = args[1]

    if isinstance(opp_data, list):
        opp_data = {"skills": opp_data}
    elif not isinstance(opp_data, dict):
        opp_data = {}

    if isinstance(student_data, list):
        student_data = {"skills": student_data}
    elif not isinstance(student_data, dict):
        student_data = {}

    strengths: List[str] = []
    gaps: List[str] = []
    missing_mandatory: List[str] = []
    explanations: List[str] = []

    # 1. Format student skills map
    student_skills_map: Dict[str, float] = {}
    if isinstance(student_data, dict):
        if "skills" in student_data and isinstance(student_data["skills"], list):
            for s in student_data["skills"]:
                if isinstance(s, dict):
                    s_id = str(s.get("skill_id") or s.get("id") or "")
                    if s_id:
                        student_skills_map[s_id] = float(s.get("proficiency_score", s.get("proficiency", 0.0)))
        else:
            for k, v in student_data.items():
                if isinstance(v, (int, float)):
                    student_skills_map[str(k)] = float(v)
                elif isinstance(v, dict):
                    student_skills_map[str(k)] = float(v.get("proficiency_score", 0.0))

    # Format opportunity skills list
    opp_skills = []
    if isinstance(opp_data, dict):
        opp_skills = opp_data.get("skills", [])
    elif isinstance(opp_data, list):
        opp_skills = opp_data

    # ----------------------------------------------------
    # 1. TECHNICAL SKILLS MATCH (50% WEIGHT)
    # ----------------------------------------------------
    skill_score = 0.0
    total_mandatory_skills = 0
    missing_mandatory_count = 0

    if not opp_skills:
        # General opportunity with no specialized skills required
        skill_score = 25.0
        explanations.append("Open eligibility: foundational competency scope.")
    else:
        total_weight = sum(float(s.get("weight", 1.0)) for s in opp_skills) or 1.0
        weighted_sum = 0.0

        for os in opp_skills:
            s_id = str(os.get("skill_id") or os.get("id") or "")
            req_prof = float(os.get("required_proficiency", 60.0))
            weight = float(os.get("weight", 1.0))
            is_mandatory = bool(os.get("is_mandatory", True))
            skill_name = str(os.get("skill_name") or os.get("name") or "Required Competency")

            if is_mandatory:
                total_mandatory_skills += 1

            if s_id in student_skills_map:
                prof = student_skills_map[s_id]
                ratio = min(1.0, prof / max(req_prof, 1.0))

                # Penalty if mandatory and severely deficient (< 50% of benchmark)
                if is_mandatory and prof < req_prof * 0.5:
                    ratio *= 0.75
                    missing_mandatory_count += 1
                    missing_mandatory.append(skill_name)
                    gaps.append(f"Critical deficit in mandatory skill: {skill_name} ({int(prof)}% vs required {int(req_prof)}%)")
                elif prof >= req_prof:
                    strengths.append(f"Exceeds {skill_name} requirement ({int(prof)}% vs {int(req_prof)}%)")
                else:
                    gaps.append(f"Moderate deficit in {skill_name} ({int(prof)}% vs required {int(req_prof)}%)")

                weighted_sum += ratio * weight
            else:
                # Skill completely unassessed
                if is_mandatory:
                    missing_mandatory_count += 1
                    missing_mandatory.append(skill_name)
                    gaps.append(f"Missing mandatory skill: {skill_name} (Not Assessed)")
                else:
                    gaps.append(f"Unassessed recommended skill: {skill_name}")

        normalized_ratio = weighted_sum / total_weight
        skill_score = round(normalized_ratio * 50.0, 1)

    # ----------------------------------------------------
    # 2. EDUCATION MATCH (15% WEIGHT)
    # ----------------------------------------------------
    education_score = 0.0
    degree_req = str(opp_data.get("eligibility_degree") or "").upper().strip()
    student_degree = str(student_data.get("degree") or "").upper().strip()

    if not degree_req or "ANY" in degree_req:
        education_score = 15.0
        strengths.append("Educational eligibility satisfied (Open requirement)")
    elif student_degree:
        # Check standard AYUSH degrees
        ayush_degrees = ["BAMS", "BHMS", "BUMS", "BSMS", "BNYS", "MD", "MS", "PHD", "M.PHARM", "MPH", "B.TECH"]
        is_ayush_match = any(d in student_degree and d in degree_req for d in ayush_degrees)
        
        if is_ayush_match or student_degree in degree_req or degree_req in student_degree:
            education_score = 15.0
            strengths.append(f"Degree matches requirement: {student_degree}")
        elif "AYUSH" in degree_req and any(d in student_degree for d in ["BAMS", "BHMS", "BUMS", "BSMS", "BNYS"]):
            education_score = 15.0
            strengths.append(f"AYUSH degree satisfies criteria: {student_degree}")
        else:
            education_score = 0.0
            gaps.append(f"Degree mismatch: holds {student_degree} but position requires {degree_req}")
    else:
        # No degree on record
        education_score = 0.0
        gaps.append("Educational degree not specified in student profile")

    # ----------------------------------------------------
    # 3. AYUSH DISCIPLINE MATCH (10% WEIGHT)
    # ----------------------------------------------------
    discipline_score = 0.0
    opp_disc_id = opp_data.get("discipline_id")
    student_disc_id = student_data.get("ayush_discipline_id")

    if not opp_disc_id:
        discipline_score = 10.0
        strengths.append("Multi-disciplinary AYUSH opportunity")
    elif student_disc_id and opp_disc_id == student_disc_id:
        discipline_score = 10.0
        strengths.append("Direct AYUSH discipline alignment")
    else:
        # Unrelated discipline gives 0 points
        discipline_score = 0.0
        gaps.append("Discipline does not align with targeted domain")

    # ----------------------------------------------------
    # 4. CAREER SECTOR FIT (10% WEIGHT)
    # ----------------------------------------------------
    career_score = 0.0
    opp_sector_id = opp_data.get("sector_id")
    student_sector_id = (
        student_data.get("target_career_sector_id") 
        or student_data.get("sector_id")
        or (student_data.get("target_career_role") or {}).get("sector_id")
    )
    student_role_id = student_data.get("target_career_role_id")

    if opp_sector_id and student_sector_id and opp_sector_id == student_sector_id:
        career_score = 10.0
        strengths.append("Direct career sector alignment")
    elif student_role_id:
        career_score = 5.0
    else:
        career_score = 0.0

    # ----------------------------------------------------
    # 5. PRACTICAL PROJECTS (5% WEIGHT)
    # ----------------------------------------------------
    p_count = int(student_data.get("projects_count", 0))
    if p_count >= 2:
        experience_score = 5.0
        strengths.append(f"Proven project portfolio ({p_count} projects)")
    elif p_count == 1:
        experience_score = 2.5
        strengths.append("Practical project experience demonstrated")
    else:
        experience_score = 0.0
        gaps.append("No practical projects on record")

    # ----------------------------------------------------
    # 6. VERIFIED CERTIFICATIONS (5% WEIGHT)
    # ----------------------------------------------------
    c_count = int(student_data.get("certifications_count", 0))
    if c_count >= 2:
        cert_score = 5.0
        strengths.append(f"Verified certifications ({c_count} credentials)")
    elif c_count == 1:
        cert_score = 2.5
        strengths.append("Verified certification on record")
    else:
        cert_score = 0.0

    # ----------------------------------------------------
    # 7. WORK MODE & LOCATION (5% WEIGHT)
    # ----------------------------------------------------
    loc_score = 0.0
    work_mode = str(opp_data.get("work_mode") or "").upper()
    opp_loc = str(opp_data.get("location") or "").lower()
    student_loc = str(student_data.get("location") or "").lower()

    if work_mode == "REMOTE":
        loc_score = 5.0
        strengths.append("100% Remote flexibility")
    elif student_loc and opp_loc and (student_loc in opp_loc or opp_loc in student_loc):
        loc_score = 5.0
        strengths.append(f"Location match ({opp_data.get('location')})")
    elif work_mode == "HYBRID":
        loc_score = 3.0
    else:
        # On-site with location mismatch
        loc_score = 0.0

    # ----------------------------------------------------
    # OVERALL CALCULATION & MANDATORY GATEKEEPING
    # ----------------------------------------------------
    raw_total = (
        skill_score + 
        education_score + 
        discipline_score + 
        career_score + 
        experience_score + 
        cert_score + 
        loc_score
    )

    # Mandatory gatekeeper penalty:
    # If student is missing mandatory skills, they cannot pass as a high match.
    if missing_mandatory_count > 0:
        penalty_ratio = min(1.0, missing_mandatory_count / max(total_mandatory_skills, 1))
        # Reduce score up to 60% based on proportion of missing mandatory competencies
        penalty_factor = max(0.1, 1.0 - (penalty_ratio * 0.65))
        raw_total *= penalty_factor
        explanations.append(f"Score reduced due to {missing_mandatory_count} missing mandatory competencies.")

    overall = min(100.0, max(0.0, round(raw_total, 1)))

    return {
        "overall_score": overall,
        "match_score": overall,
        "skill_score": skill_score,
        "education_score": education_score,
        "discipline_score": discipline_score,
        "career_score": career_score,
        "experience_score": experience_score,
        "certification_score": cert_score,
        "location_score": loc_score,
        "strengths": strengths[:4],
        "gaps": gaps[:4],
        "missing_skills": gaps[:4],
        "missing_mandatory": missing_mandatory,
        "explanations": explanations,
        "breakdown": {
            "skillScore": skill_score,
            "educationScore": education_score,
            "disciplineScore": discipline_score,
            "careerScore": career_score,
            "experienceScore": experience_score,
            "certificationScore": cert_score,
            "locationScore": loc_score
        }
    }
