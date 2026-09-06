from typing import List, Dict, Any

def recommend_training_programs(
    student_gaps: List[Dict[str, Any]],
    available_programs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Personalized Learning Recommendation Engine:
    Maps student's largest skill gaps to targeted training programs,
    computing gap coverage, match score (0-100%), and projected proficiency boosts.
    """
    total_student_gap = sum(g.get("gap", 0.0) for g in student_gaps if g.get("gap", 0.0) > 0)
    gap_map = {
        g["skill_id"]: {"gap": g["gap"], "score": g.get("student_score", 0.0), "name": g.get("skill_name", "Skill")}
        for g in student_gaps
        if g.get("gap", 0.0) > 0
    }

    recommendations = []

    for program in available_programs:
        addressed_gap_sum = 0.0
        relevant_skills_count = 0
        target_skills = []

        for ts in program.get("skills", []):
            s_id = ts.get("skill_id")
            student_gap = gap_map.get(s_id)
            if student_gap:
                gain = ts.get("proficiency_gain", 20.0)
                addressed_gap_sum += min(student_gap["gap"], gain)
                relevant_skills_count += 1
                target_skills.append({
                    "skill_id": s_id,
                    "skillId": s_id,
                    "skill_name": ts.get("skill_name", student_gap["name"]),
                    "skillName": ts.get("skill_name", student_gap["name"]),
                    "proficiency_gain": gain,
                    "proficiencyGain": gain,
                    "current_student_score": student_gap["score"],
                    "currentStudentScore": student_gap["score"]
                })

        if relevant_skills_count > 0 and total_student_gap > 0:
            # Genuine proportional match score: 70% gap coverage + 30% program relevance
            total_program_skills = max(len(program.get("skills", [])), 1)
            gap_coverage_ratio = addressed_gap_sum / total_student_gap
            relevance_ratio = relevant_skills_count / total_program_skills
            match_score = round(min(100.0, max(0.0, (gap_coverage_ratio * 0.7 + relevance_ratio * 0.3) * 100.0)))
            top_skill = target_skills[0]["skill_name"] if target_skills else "target skills"
            projected_boost = round(addressed_gap_sum / relevant_skills_count, 1)

            recommendations.append({
                "training_id": program.get("id"),
                "trainingId": program.get("id"),
                "id": program.get("id"),
                "title": program.get("title"),
                "provider_name": program.get("provider_name"),
                "providerName": program.get("provider_name"),
                "category": program.get("category"),
                "duration_hours": program.get("duration_hours"),
                "durationHours": program.get("duration_hours"),
                "mode": program.get("mode"),
                "level": program.get("level"),
                "certificate_provided": program.get("certificate_provided", True),
                "certificateProvided": program.get("certificate_provided", True),
                "match_score": match_score,
                "matchScore": match_score,
                "target_skills": target_skills,
                "targetSkills": target_skills,
                "reason": f"Directly bridges your {top_skill} skill gap with +{target_skills[0]['proficiency_gain']}% projected competency gain.",
                "projected_skill_boost": projected_boost,
                "projectedSkillBoost": projected_boost
            })

    # Sort descending by match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
