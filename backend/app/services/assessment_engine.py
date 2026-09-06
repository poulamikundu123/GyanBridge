from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.assessment import AssessmentAttempt, AssessmentQuestion, AssessmentOption, AssessmentAnswer, AssessmentSkillScore
from app.models.career import StudentSkill
from app.models.system import Notification

async def evaluate_assessment_submission(
    db: AsyncSession,
    attempt_id: str,
    answers_input: List[dict],
    user_id: str
) -> dict:
    # 1. Fetch attempt
    result = await db.execute(select(AssessmentAttempt).where(AssessmentAttempt.id == attempt_id))
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise ValueError("Assessment attempt not found")

    # 2. Fetch all questions for this test with options and skills mapping
    q_res = await db.execute(
        select(AssessmentQuestion).where(AssessmentQuestion.test_id == attempt.test_id)
    )
    questions = q_res.scalars().all()
    q_map = {q.id: q for q in questions}

    total_score = 0.0
    total_max = len(questions) or 1
    skill_stats: Dict[str, Dict[str, Any]] = {}

    # 3. Process each answer
    for ans in answers_input:
        q_id = ans.get("question_id")
        opt_id = ans.get("selected_option_id")
        q = q_map.get(q_id)
        if not q:
            continue

        # Check correctness
        is_correct = False
        if opt_id:
            opt_res = await db.execute(
                select(AssessmentOption).where(
                    AssessmentOption.id == opt_id,
                    AssessmentOption.question_id == q_id
                )
            )
            opt = opt_res.scalar_one_or_none()
            if opt and opt.is_correct:
                is_correct = True

        score_awarded = 1.0 if is_correct else 0.0
        total_score += score_awarded

        # Record answer
        db_answer = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q_id,
            selected_option_id=opt_id,
            is_correct=is_correct,
            score_awarded=score_awarded
        )
        db.add(db_answer)

        # Track skill proficiency stats
        s_id = q.skill_id
        if s_id not in skill_stats:
            skill_stats[s_id] = {"count": 0, "correct": 0}
        skill_stats[s_id]["count"] += 1
        if is_correct:
            skill_stats[s_id]["correct"] += 1

    overall_pct = round((total_score / total_max) * 100.0, 1)

    # 4. Update attempt
    attempt.score_percentage = overall_pct
    attempt.completed_at = datetime.utcnow()
    attempt.status = "COMPLETED"

    skill_scores_result = []

    # 5. Record skill scores & update student verified skills
    for s_id, stats in skill_stats.items():
        s_pct = round((stats["correct"] / max(stats["count"], 1)) * 100.0, 1)
        
        # Save AssessmentSkillScore
        sc = AssessmentSkillScore(
            attempt_id=attempt.id,
            skill_id=s_id,
            score_percentage=s_pct,
            questions_count=stats["count"],
            correct_count=stats["correct"]
        )
        db.add(sc)

        # Update or Insert StudentSkill
        st_res = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_profile_id == attempt.student_profile_id,
                StudentSkill.skill_id == s_id
            )
        )
        existing_skill = st_res.scalar_one_or_none()
        if existing_skill:
            # Upgrade proficiency if higher, and mark ASSESSMENT_VERIFIED
            if s_pct > existing_skill.proficiency_score:
                existing_skill.proficiency_score = s_pct
            existing_skill.verification_level = "ASSESSMENT_VERIFIED"
            existing_skill.verified_at = datetime.utcnow()
            existing_skill.source = "Standardized Assessment"
        else:
            new_st_skill = StudentSkill(
                student_profile_id=attempt.student_profile_id,
                skill_id=s_id,
                proficiency_score=s_pct,
                verification_level="ASSESSMENT_VERIFIED",
                verified_at=datetime.utcnow(),
                source="Standardized Assessment"
            )
            db.add(new_st_skill)

        skill_scores_result.append({
            "skill_id": s_id,
            "score_percentage": s_pct,
            "questions_count": stats["count"],
            "correct_count": stats["correct"]
        })

    # 6. Add notification
    notif = Notification(
        user_id=user_id,
        title="Assessment Completed 🎯",
        message=f"You scored {overall_pct}% on your skill assessment. Your verified skill profile has been updated!",
        type="SKILL_ALERT",
        link="/student/skills"
    )
    db.add(notif)

    await db.flush()

    return {
        "attempt_id": attempt.id,
        "score_percentage": overall_pct,
        "passed": overall_pct >= 50.0,
        "skill_scores": skill_scores_result
    }
