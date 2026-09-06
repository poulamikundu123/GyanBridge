from typing import List, Dict, Any, Optional

def calculate_role_readiness(
    student_skills: Optional[List[dict]] = None,
    target_role_skills: Optional[List[dict]] = None,
    role_skills: Optional[List[dict]] = None,
    **kwargs
) -> dict:
    """
    Computes role readiness score, radar points, and classifies skills:
    - Strength: Proficiency >= Required benchmark
    - Moderate Gap: 50% <= Proficiency < Required benchmark
    - Critical Gap: Proficiency < 50% of benchmark (or missing mandatory skill)
    """
    role_skill_list = target_role_skills or role_skills or []
    student_skill_list = student_skills or kwargs.get("student_skill_list") or []

    if not role_skill_list:
        return {
            "readiness_score": 0.0,
            "readiness_percentage": 0.0,
            "general_skill_score": 0.0,
            "radar_data": [],
            "critical_gaps": [],
            "moderate_gaps": [],
            "strengths": []
        }

    skills_map = {s.get("skill_id"): s for s in student_skill_list if s.get("skill_id")}
    
    radar_data = []
    critical_gaps = []
    moderate_gaps = []
    strengths = []

    total_weighted_score = 0.0
    total_max_weight = 0.0
    sum_prof = 0.0

    for rs in role_skill_list:
        s_id = rs.get("skill_id")
        req_prof = float(rs.get("required_proficiency", 70.0))
        weight = float(rs.get("weight", 1.0))
        is_mandatory = bool(rs.get("is_mandatory", True))
        skill_name = rs.get("skill_name", "Skill")
        category_name = rs.get("category_name", rs.get("category", "Technical"))

        st_skill = skills_map.get(s_id)
        current_prof = float(st_skill.get("proficiency_score", 0.0)) if st_skill else 0.0
        verification = st_skill.get("verification_level", "NONE") if st_skill else "NONE"
        sum_prof += current_prof

        # Gap calculation
        gap = max(0.0, req_prof - current_prof)
        ratio = min(1.0, current_prof / max(req_prof, 1.0))
        
        # Mandatory skills have higher penalty
        effective_weight = weight * (1.5 if is_mandatory else 1.0)
        total_weighted_score += ratio * effective_weight
        total_max_weight += effective_weight

        item = {
            "skill_id": s_id,
            "name": skill_name,
            "category": category_name,
            "proficiency_score": current_prof,
            "verification_level": verification,
            "required_proficiency": req_prof,
            "gap": round(gap, 1),
        }

        radar_data.append({
            "skill": skill_name[:18],
            "student": current_prof,
            "required": req_prof
        })

        if current_prof >= req_prof:
            item["status"] = "STRENGTH"
            strengths.append(item)
        elif current_prof >= (req_prof * 0.5):
            item["status"] = "MODERATE_GAP"
            moderate_gaps.append(item)
        else:
            item["status"] = "CRITICAL_GAP"
            critical_gaps.append(item)

    readiness = round((total_weighted_score / total_max_weight) * 100.0, 1) if total_max_weight > 0 else 0.0
    general_skill = round(sum_prof / max(len(role_skill_list), 1), 1)

    return {
        "readiness_score": readiness,
        "readiness_percentage": readiness,
        "general_skill_score": general_skill,
        "radar_data": radar_data,
        "critical_gaps": critical_gaps,
        "moderate_gaps": moderate_gaps,
        "strengths": strengths
    }
