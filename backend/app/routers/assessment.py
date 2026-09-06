from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, StudentProfile
from app.models.assessment import AssessmentTest, AssessmentQuestion, AssessmentOption, AssessmentAttempt, AssessmentSkillScore
from app.schemas.assessment import TestListOut, QuestionOut, OptionOut, TestSubmitIn, AssessmentStartIn, AssessmentResultOut
from app.services.auth_service import require_role
from app.services.assessment_engine import evaluate_assessment_submission
from app.services.ai_assessment_engine import generate_dynamic_assessment, evaluate_dynamic_submission

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.get("/tests")
async def list_available_tests(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AssessmentTest)
        .options(selectinload(AssessmentTest.category))
    )
    tests = res.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category.name if t.category else "AYUSH Clinical",
            "duration_minutes": t.duration_minutes,
            "durationMinutes": t.duration_minutes,
            "total_questions": t.total_questions,
            "totalQuestions": t.total_questions,
            "passing_score": t.passing_score,
            "difficulty": t.difficulty
        }
        for t in tests
    ]

@router.post("/start")
async def start_assessment(
    req: AssessmentStartIn = None,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    target_test_id = req.get_test_id() if req else None
    target_role_id = (req.get_career_role_id() if req else None) or student.target_career_role_id
    assessment_type = (req.get_assessment_type() if req else None) or "STANDARD_BENCHMARK"
    opportunity_id = req.get_opportunity_id() if req else None

    # If test_id specified explicitly and exists, use it
    test = None
    if target_test_id and not (req and req.get_assessment_type()) and not (req and req.get_opportunity_id()):
        t_res = await db.execute(
            select(AssessmentTest)
            .where(AssessmentTest.id == target_test_id)
            .options(selectinload(AssessmentTest.questions).selectinload(AssessmentQuestion.options))
        )
        test = t_res.scalar_one_or_none()

    if test:
        attempt = AssessmentAttempt(
            student_profile_id=student.id,
            test_id=test.id,
            career_role_id=target_role_id,
            status="IN_PROGRESS"
        )
        db.add(attempt)
        await db.commit()

        questions_data = [
            {
                "id": q.id,
                "questionText": q.question_text,
                "question_text": q.question_text,
                "questionType": q.question_type,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "careerRelevance": q.career_relevance,
                "career_relevance": q.career_relevance,
                "skillsMapping": [
                    {
                        "skillId": q.skill_id or "sk-core",
                        "skillName": q.career_relevance or "Clinical Competency",
                        "weight": 1.0
                    }
                ],
                "skills_mapping": [
                    {
                        "skill_id": q.skill_id or "sk-core",
                        "skill_name": q.career_relevance or "Clinical Competency",
                        "weight": 1.0
                    }
                ],
                "options": [
                    {
                        "id": opt.id,
                        "optionText": opt.option_text,
                        "option_text": opt.option_text
                    }
                    for opt in q.options
                ]
            }
            for q in test.questions
        ]

        return {
            "success": True,
            "attempt_id": attempt.id,
            "attemptId": attempt.id,
            "test_id": test.id,
            "testId": test.id,
            "test_title": test.title,
            "testTitle": test.title,
            "duration_minutes": test.duration_minutes,
            "durationMinutes": test.duration_minutes,
            "questions": questions_data
        }

    # Dynamic Dual-Tier AI Assessment Generator
    return await generate_dynamic_assessment(
        db=db,
        student_id=student.id,
        assessment_type=assessment_type,
        career_role_id=target_role_id,
        opportunity_id=opportunity_id
    )

@router.get("/tests/{test_id}")
async def get_test_questions(
    test_id: str,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    t_res = await db.execute(
        select(AssessmentTest)
        .where(AssessmentTest.id == test_id)
        .options(
            selectinload(AssessmentTest.questions).selectinload(AssessmentQuestion.options)
        )
    )
    test = t_res.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    attempt = AssessmentAttempt(
        student_profile_id=student.id,
        test_id=test.id,
        career_role_id=student.target_career_role_id,
        status="IN_PROGRESS"
    )
    db.add(attempt)
    await db.commit()

    return {
        "success": True,
        "attempt_id": attempt.id,
        "attemptId": attempt.id,
        "test_id": test.id,
        "testId": test.id,
        "title": test.title,
        "testTitle": test.title,
        "duration_minutes": test.duration_minutes,
        "durationMinutes": test.duration_minutes,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "questionText": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "career_relevance": q.career_relevance,
                "skillsMapping": [
                    {
                        "skillId": q.skill_id or "sk-core",
                        "skillName": q.career_relevance or "Clinical Competency",
                        "weight": 1.0
                    }
                ],
                "skills_mapping": [
                    {
                        "skill_id": q.skill_id or "sk-core",
                        "skill_name": q.career_relevance or "Clinical Competency",
                        "weight": 1.0
                    }
                ],
                "options": [
                    {"id": opt.id, "option_text": opt.option_text, "optionText": opt.option_text}
                    for opt in q.options
                ]
            }
            for q in test.questions
        ]
    }

@router.post("/submit")
async def submit_test_answers(
    req: TestSubmitIn,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    attempt_id = req.get_attempt_id()
    if not attempt_id:
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
        student = p_res.scalar_one_or_none()
        test_id = req.get_test_id()
        if not test_id:
            raise HTTPException(status_code=400, detail="test_id or attempt_id is required")

        attempt = AssessmentAttempt(
            student_profile_id=student.id,
            test_id=test_id,
            career_role_id=student.target_career_role_id,
            status="IN_PROGRESS"
        )
        db.add(attempt)
        await db.commit()
        attempt_id = attempt.id

    answers_dict_list = [
        {
            "question_id": a.get_question_id(),
            "selected_option_id": a.get_selected_option_id(),
            "text_answer": a.get_text_answer()
        }
        for a in req.answers
    ]

    result = await evaluate_dynamic_submission(
        db=db,
        attempt_id=attempt_id,
        answers_input=answers_dict_list,
        user_id=current_user.id
    )

    return {
        "success": True,
        **result,
        "overallScorePercentage": result.get("score_percentage", 0.0),
        "careerReadinessScore": result.get("readiness_score", 0.0),
        "skillScores": result.get("skill_scores", [])
    }

@router.get("/history")
@router.get("/history/{student_id}")
async def get_assessment_history(
    student_id: str = None,
    current_user: User = Depends(require_role(["STUDENT", "INSTITUTION", "ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    target_student_id = student_id
    if not target_student_id:
        p_res = await db.execute(select(StudentProfile.id).where(StudentProfile.user_id == current_user.id))
        target_student_id = p_res.scalar_one_or_none()
        if not target_student_id:
            raise HTTPException(status_code=404, detail="Student profile not found")

    res = await db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.student_profile_id == target_student_id)
        .options(
            selectinload(AssessmentAttempt.career_role),
            selectinload(AssessmentAttempt.skill_scores).selectinload(AssessmentSkillScore.skill)
        )
        .order_by(AssessmentAttempt.attempt_number.asc())
    )
    attempts = res.scalars().all()

    attempts_out = []
    skill_history_map = {}

    for a in attempts:
        completed_iso = a.completed_at.isoformat() if a.completed_at else None
        attempts_out.append({
            "id": a.id,
            "status": a.status,
            "attemptNumber": a.attempt_number,
            "attempt_number": a.attempt_number,
            "careerRoleTitle": a.career_role.title if a.career_role else "AYUSH Practitioner",
            "career_role_title": a.career_role.title if a.career_role else "AYUSH Practitioner",
            "scorePercentage": a.score_percentage,
            "score_percentage": a.score_percentage,
            "readinessScore": a.readiness_score,
            "readiness_score": a.readiness_score,
            "completedAt": completed_iso,
            "completed_at": completed_iso,
            "skillsEvaluatedCount": len(a.skill_scores),
            "skills_evaluated_count": len(a.skill_scores)
        })

        for ss in a.skill_scores:
            s_name = ss.skill.name if ss.skill else "Skill"
            if s_name not in skill_history_map:
                skill_history_map[s_name] = []
            skill_history_map[s_name].append({
                "attempt": a.attempt_number,
                "score": ss.score_percentage,
                "score_percentage": ss.score_percentage,
                "scorePercentage": ss.score_percentage,
                "date": completed_iso
            })

    skill_progression = [
        {"skillName": name, "skill_name": name, "history": hist}
        for name, hist in skill_history_map.items()
    ]

    return {
        "attempts": attempts_out,
        "skillProgression": skill_progression,
        "skill_progression": skill_progression
    }
