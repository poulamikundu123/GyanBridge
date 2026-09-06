from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, StudentProfile, AcademicianProfile, IndustryProfile
from app.models.career import CareerRole, CareerRoleSkill, StudentSkill
from app.models.taxonomy import Skill, Sector, AyushDiscipline, SkillCategory
from app.models.opportunity import Opportunity, OpportunitySkill, Application, ApplicationStatusHistory
from app.models.portfolio import Education, Project, Certification
from app.models.training import TrainingProgram, TrainingSkill, TrainingEnrollment
from app.models.collaboration import Mentorship, MentorshipRequest
from app.models.system import Notification
from app.schemas.student import (
    CareerGoalUpdate,
    StudentProfileUpdate,
    SkillGapReport,
    OpportunityApplicationIn,
    TrainingEnrollIn,
    MentorshipRequestIn
)
from app.services.auth_service import get_current_user, require_role, get_current_user_optional
from app.services.skill_gap_engine import calculate_role_readiness
from app.services.matching_engine import calculate_opportunity_match
from app.services.learning_recommendation_engine import recommend_training_programs

router = APIRouter(prefix="/student", tags=["Student"])

def compute_programs_with_goal_sync(student: StudentProfile, programs: List[TrainingProgram], enrollments_map: dict):
    target_role = student.target_career_role
    role_skill_ids = {rs.skill_id for rs in target_role.role_skills} if target_role and target_role.role_skills else set()
    role_skill_map = {rs.skill_id: rs for rs in target_role.role_skills} if target_role and target_role.role_skills else {}
    student_skill_map = {s.skill_id: s.proficiency_score for s in student.skills} if student.skills else {}

    formatted_programs = []
    for p in programs:
        prog_skill_ids = {ts.skill_id for ts in p.training_skills}
        matched_ids = prog_skill_ids.intersection(role_skill_ids)
        matched_names = [ts.skill.name for ts in p.training_skills if ts.skill and ts.skill_id in matched_ids]

        is_goal_synced = False
        goal_sync_score = 0
        sync_reason = ""

        if target_role:
            if matched_ids:
                is_goal_synced = True
                has_deficit = any(
                    student_skill_map.get(s_id, 0.0) < (role_skill_map[s_id].required_proficiency if s_id in role_skill_map else 70.0)
                    for s_id in matched_ids
                )
                coverage = len(matched_ids) / max(len(role_skill_ids), 1)
                goal_sync_score = min(98, round(70 + coverage * 20 + (8 if has_deficit else 0)))
                skill_str = ", ".join(matched_names[:2])
                sync_reason = f"Imparts {skill_str} which directly fulfills core requirements for your goal: {target_role.title}."
            else:
                role_words = set(target_role.title.lower().split())
                p_text = f"{p.title} {p.category} {p.description}".lower()
                matches_role_keywords = any(w in p_text for w in role_words if len(w) > 3)
                if matches_role_keywords:
                    is_goal_synced = True
                    goal_sync_score = 75
                    sync_reason = f"Calibrated for your {target_role.title} career pathway."
                else:
                    goal_sync_score = 35
                    sync_reason = "General AYUSH healthcare competency module."
        else:
            goal_sync_score = 50
            sync_reason = "General competency module. Select a career goal to unlock tailored recommendations."

        is_industry_hosted = (p.industry_profile_id is not None)
        company_name = p.industry_profile.company_name if p.industry_profile else p.provider_name

        enr = enrollments_map.get(p.id)

        formatted_programs.append({
            "id": p.id,
            "title": p.title,
            "provider_name": p.provider_name,
            "providerName": p.provider_name,
            "company_name": company_name,
            "companyName": company_name,
            "is_industry_hosted": is_industry_hosted,
            "isIndustryHosted": is_industry_hosted,
            "category": p.category,
            "description": p.description,
            "syllabus": p.syllabus,
            "duration_hours": p.duration_hours,
            "durationHours": p.duration_hours,
            "mode": p.mode,
            "level": p.level,
            "certificate_provided": p.certificate_provided,
            "certificateProvided": p.certificate_provided,
            "is_goal_synced": is_goal_synced,
            "isGoalSynced": is_goal_synced,
            "goal_sync_score": goal_sync_score,
            "goalSyncScore": goal_sync_score,
            "goal_sync_role": target_role.title if target_role else None,
            "goalSyncRole": target_role.title if target_role else None,
            "goal_sync_reason": sync_reason,
            "goalSyncReason": sync_reason,
            "matched_skills": matched_names,
            "matchedSkills": matched_names,
            "skills": [
                {
                    "skill_id": ts.skill_id,
                    "skillId": ts.skill_id,
                    "skill_name": ts.skill.name if ts.skill else "Skill",
                    "skillName": ts.skill.name if ts.skill else "Skill",
                    "proficiency_gain": ts.proficiency_gain,
                    "proficiencyGain": ts.proficiency_gain
                }
                for ts in p.training_skills
            ],
            "enrollment": {
                "id": enr.id,
                "training_program_id": p.id,
                "trainingProgramId": p.id,
                "status": enr.status,
                "progress_percent": enr.progress_percent,
                "certificate_url": enr.certificate_url
            } if enr else None
        })

    formatted_programs.sort(key=lambda x: (x["is_goal_synced"], x["goal_sync_score"]), reverse=True)
    return formatted_programs

@router.get("/dashboard")
async def get_student_dashboard(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    # Load profile with relations
    res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.discipline),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.sector),
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.applications).selectinload(Application.opportunity)
        )
    )
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # If student has a target career role, fetch role skills
    role_skills = []
    if student.target_career_role and student.target_career_role.role_skills:
        role_skills = student.target_career_role.role_skills
    elif student.target_career_role_id:
        rs_res = await db.execute(
            select(CareerRoleSkill)
            .where(CareerRoleSkill.career_role_id == student.target_career_role_id)
            .options(selectinload(CareerRoleSkill.skill))
        )
        role_skills = rs_res.scalars().all()

    # Format student skills
    student_skills_data = [
        {"skill_id": s.skill_id, "proficiency_score": s.proficiency_score}
        for s in student.skills
    ]

    # Calculate gap & readiness score using SkillGapEngine
    readiness_report = calculate_role_readiness(
        role_skills=[
            {
                "skill_id": rs.skill_id,
                "skill_name": rs.skill.name if rs.skill else "Skill",
                "category": "Technical",
                "required_proficiency": rs.required_proficiency,
                "is_mandatory": rs.is_mandatory,
                "weight": rs.weight
            }
            for rs in role_skills
        ],
        student_skills=student_skills_data
    )

    # Fetch programs with skills and industry profile
    t_res = await db.execute(
        select(TrainingProgram)
        .options(
            selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill),
            selectinload(TrainingProgram.industry_profile)
        )
        .order_by(TrainingProgram.created_at.desc(), TrainingProgram.title.asc())
    )
    all_programs = t_res.scalars().all()

    e_res = await db.execute(
        select(TrainingEnrollment).where(TrainingEnrollment.student_profile_id == student.id)
    )
    enrollments_map = {e.training_program_id: e for e in e_res.scalars().all()}

    all_synced_programs = compute_programs_with_goal_sync(student, all_programs, enrollments_map)
    synced_industry_programs = [p for p in all_synced_programs if p["is_goal_synced"]]

    # Dynamic summary cards
    return {
        "profile": {
            "id": student.id,
            "name": current_user.name,
            "email": current_user.email,
            "degree": student.degree,
            "institution": student.institution,
            "current_year": student.current_year,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "discipline": student.discipline.name if student.discipline else "Ayurveda",
            "discipline_id": student.ayush_discipline_id,
            "target_career_role_id": student.target_career_role_id,
            "target_career_role": student.target_career_role.title if student.target_career_role else "Clinical Research Associate",
            "bio": student.bio,
            "location": student.location,
            "preferred_work_mode": student.preferred_work_mode,
            "readiness_score": readiness_report["readiness_percentage"],
            "general_skill_score": readiness_report["general_skill_score"]
        },
        "kpis": {
            "readiness_score": readiness_report["readiness_percentage"],
            "verified_skills_count": sum(1 for s in student.skills if s.verification_level != "SELF_REPORTED"),
            "total_skills_count": len(student.skills),
            "applications_submitted": len(student.applications),
            "critical_gaps_count": len(readiness_report["critical_gaps"]),
            "synced_programs_count": len(synced_industry_programs)
        },
        "readiness_report": readiness_report,
        "synced_industry_programs": synced_industry_programs,
        "syncedIndustryPrograms": synced_industry_programs,
        "recent_applications": [
            {
                "id": a.id,
                "title": a.opportunity.title if a.opportunity else "Opportunity",
                "status": a.status,
                "applied_at": a.applied_at.isoformat() if a.applied_at else None
            }
            for a in student.applications[:5]
        ]
    }

# Career Target Roles (supports both GET /student/career-target/roles and /student/career-roles)
@router.get("/career-target/roles")
@router.get("/career-roles")
async def get_career_roles(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(CareerRole)
        .options(
            selectinload(CareerRole.sector),
            selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill).selectinload(Skill.category)
        )
        .order_by(CareerRole.title.asc())
    )
    roles = res.scalars().all()

    student_skills_data = []
    if current_user and current_user.role == "STUDENT":
        p_res = await db.execute(
            select(StudentProfile)
            .where(StudentProfile.user_id == current_user.id)
            .options(selectinload(StudentProfile.skills))
        )
        student = p_res.scalar_one_or_none()
        if student and student.skills:
            student_skills_data = [
                {
                    "skill_id": s.skill_id,
                    "proficiency_score": s.proficiency_score,
                    "verification_level": s.verification_level
                }
                for s in student.skills
            ]

    formatted_roles = []
    for r in roles:
        r_skills = [
            {
                "skillId": rs.skill_id,
                "skill_id": rs.skill_id,
                "skillName": rs.skill.name if rs.skill else "Skill",
                "skill_name": rs.skill.name if rs.skill else "Skill",
                "categoryName": rs.skill.category.name if rs.skill and rs.skill.category else "General",
                "category_name": rs.skill.category.name if rs.skill and rs.skill.category else "General",
                "requiredProficiency": rs.required_proficiency,
                "required_proficiency": rs.required_proficiency,
                "isMandatory": rs.is_mandatory,
                "is_mandatory": rs.is_mandatory,
                "weight": rs.weight
            }
            for rs in r.role_skills
        ]

        # Calculate readiness for this role using backend engine
        readiness_data = calculate_role_readiness(
            student_skills=student_skills_data,
            target_role_skills=r_skills
        ) if student_skills_data else {
            "readiness_score": 0.0,
            "readiness_percentage": 0.0,
            "strengths": [],
            "critical_gaps": [],
            "moderate_gaps": []
        }

        readiness_val = readiness_data.get("readiness_score", 0.0)

        formatted_roles.append({
            "id": r.id,
            "title": r.title,
            "sectorName": r.sector.name if r.sector else "AYUSH Healthcare",
            "sector_name": r.sector.name if r.sector else "AYUSH Healthcare",
            "description": r.description,
            "minEducation": r.min_education,
            "min_education": r.min_education,
            "averageSalary": r.average_salary or "₹6,00,000 - ₹10,00,000",
            "average_salary": r.average_salary or "₹6,00,000 - ₹10,00,000",
            "demandLevel": r.demand_level,
            "demand_level": r.demand_level,
            "readinessScore": readiness_val,
            "readiness_score": readiness_val,
            "readinessPercentage": readiness_val,
            "readiness_percentage": readiness_val,
            "strengths": readiness_data.get("strengths", []),
            "criticalGaps": readiness_data.get("critical_gaps", []),
            "moderateGaps": readiness_data.get("moderate_gaps", []),
            "skills": r_skills
        })

    return {
        "success": True,
        "roles": formatted_roles
    }

# Set Career Target (supports both POST and PUT /career-target)
@router.post("/career-target")
@router.put("/career-target")
async def update_career_target(
    req: CareerGoalUpdate,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    role_id = req.get_role_id()
    if not role_id:
        raise HTTPException(status_code=400, detail="career_role_id or roleId is required")

    res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(selectinload(StudentProfile.skills))
    )
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    role_res = await db.execute(
        select(CareerRole)
        .where(CareerRole.id == role_id)
        .options(selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill))
    )
    role = role_res.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Career role not found")

    # Recalculate readiness
    student_skills_data = [
        {"skill_id": s.skill_id, "proficiency_score": s.proficiency_score}
        for s in student.skills
    ]
    role_skills_data = [
        {
            "skill_id": rs.skill_id,
            "skill_name": rs.skill.name if rs.skill else "Skill",
            "category": "AYUSH",
            "required_proficiency": rs.required_proficiency,
            "is_mandatory": rs.is_mandatory,
            "weight": rs.weight
        }
        for rs in role.role_skills
    ]
    calc_res = calculate_role_readiness(
        role_skills=role_skills_data,
        student_skills=student_skills_data
    )

    student.target_career_role_id = role.id
    student.readiness_score = calc_res["readiness_percentage"]
    await db.commit()

    return {
        "success": True,
        "newReadinessScore": student.readiness_score,
        "new_readiness_score": student.readiness_score,
        "roleTitle": role.title,
        "role_title": role.title,
        "message": "Career target updated successfully"
    }

# Update Student Profile (supports both POST and PUT /profile)
@router.post("/profile")
@router.put("/profile")
async def update_student_profile(
    req: StudentProfileUpdate,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if req.degree is not None: student.degree = req.degree
    if req.institution is not None: student.institution = req.institution
    c_year = req.current_year or req.currentYear
    if c_year is not None: student.current_year = c_year
    g_year = req.graduation_year or req.graduationYear
    if g_year is not None: student.graduation_year = g_year
    if req.cgpa is not None: student.cgpa = req.cgpa
    if req.bio is not None: student.bio = req.bio
    if req.location is not None: student.location = req.location
    w_mode = req.preferred_work_mode or req.preferredWorkMode
    if w_mode is not None: student.preferred_work_mode = w_mode
    d_id = req.ayush_discipline_id or req.ayushDisciplineId
    if d_id is not None: student.ayush_discipline_id = d_id
    t_id = req.target_career_role_id or req.targetCareerRoleId or req.targetRoleId
    if t_id is not None: student.target_career_role_id = t_id

    await db.commit()
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": {
            "id": student.id,
            "degree": student.degree,
            "institution": student.institution,
            "current_year": student.current_year,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "bio": student.bio,
            "location": student.location,
            "preferred_work_mode": student.preferred_work_mode
        }
    }

@router.get("/opportunities")
async def get_student_opportunities(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    # Fetch student profile & relational data
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.projects),
            selectinload(StudentProfile.certifications),
            selectinload(StudentProfile.target_career_role),
            selectinload(StudentProfile.discipline)
        )
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_data = {
        "id": student.id,
        "degree": student.degree,
        "ayush_discipline_id": student.ayush_discipline_id,
        "target_career_role_id": student.target_career_role_id,
        "target_career_sector_id": student.target_career_role.sector_id if student.target_career_role else None,
        "location": student.location,
        "preferred_work_mode": student.preferred_work_mode,
        "skills": [
            {
                "skill_id": s.skill_id,
                "skill_name": s.skill.name if s.skill else "Skill",
                "proficiency_score": s.proficiency_score,
                "verification_level": s.verification_level
            }
            for s in student.skills
        ],
        "projects_count": len(student.projects) if student.projects else 0,
        "certifications_count": len(student.certifications) if student.certifications else 0,
    }

    # Fetch active opportunities suitable for students
    opp_res = await db.execute(
        select(Opportunity)
        .where(
            Opportunity.status == "ACTIVE",
            Opportunity.opportunity_type.notin_(["FACULTY_INTERNSHIP", "FDP", "CONSULTANCY"])
        )
        .options(
            selectinload(Opportunity.skills).selectinload(OpportunitySkill.skill),
            selectinload(Opportunity.industry_profile),
            selectinload(Opportunity.discipline),
            selectinload(Opportunity.sector)
        )
    )
    opportunities = opp_res.scalars().all()

    matched_opportunities = []
    for opp in opportunities:
        opp_data = {
            "id": opp.id,
            "title": opp.title,
            "eligibility_degree": opp.eligibility_degree,
            "discipline_id": opp.discipline_id,
            "sector_id": opp.sector_id,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "skills": [
                {
                    "skill_id": os.skill_id,
                    "skill_name": os.skill.name if os.skill else "Skill",
                    "required_proficiency": os.required_proficiency,
                    "is_mandatory": os.is_mandatory,
                    "weight": os.weight
                }
                for os in opp.skills
            ]
        }

        match_info = calculate_opportunity_match(
            student_data=student_data,
            opp_data=opp_data
        )

        matched_opportunities.append({
            "id": opp.id,
            "title": opp.title,
            "company_name": opp.industry_profile.company_name if opp.industry_profile else "AYUSH Enterprise",
            "companyName": opp.industry_profile.company_name if opp.industry_profile else "AYUSH Enterprise",
            "industryProfile": {
                "id": opp.industry_profile.id if opp.industry_profile else "",
                "companyName": opp.industry_profile.company_name if opp.industry_profile else "AYUSH Enterprise",
                "company_name": opp.industry_profile.company_name if opp.industry_profile else "AYUSH Enterprise",
                "location": opp.industry_profile.location if opp.industry_profile else opp.location
            } if opp.industry_profile else None,
            "opportunity_type": opp.opportunity_type,
            "opportunityType": opp.opportunity_type,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "workMode": opp.work_mode,
            "duration": opp.duration,
            "stipend_salary": opp.stipend_salary,
            "stipendSalary": opp.stipend_salary,
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "description": opp.description,
            "eligibility_degree": opp.eligibility_degree,
            "eligibilityDegree": opp.eligibility_degree,
            "sector_name": opp.sector.name if opp.sector else "AYUSH Healthcare",
            "sectorName": opp.sector.name if opp.sector else "AYUSH Healthcare",
            "sector": {
                "id": opp.sector.id if opp.sector else "",
                "name": opp.sector.name if opp.sector else "AYUSH Healthcare"
            } if opp.sector else None,
            "discipline_name": opp.discipline.name if opp.discipline else "Multi-Disciplinary",
            "disciplineName": opp.discipline.name if opp.discipline else "Multi-Disciplinary",
            "discipline": {
                "id": opp.discipline.id if opp.discipline else "",
                "name": opp.discipline.name if opp.discipline else "Multi-Disciplinary"
            } if opp.discipline else None,
            "match_score": match_info["match_score"],
            "matchScore": match_info["match_score"],
            "missing_mandatory": match_info["missing_mandatory"],
            "missingMandatory": match_info["missing_mandatory"],
            "strengths": match_info.get("strengths", []),
            "gaps": match_info.get("gaps", []),
            "match_breakdown": match_info.get("breakdown", {}),
            "matchBreakdown": match_info.get("breakdown", {}),
            "skills": [
                {
                    "skillId": os.skill_id,
                    "skill_id": os.skill_id,
                    "skillName": os.skill.name if os.skill else "Skill",
                    "skill_name": os.skill.name if os.skill else "Skill",
                    "name": os.skill.name if os.skill else "Skill",
                    "requiredProficiency": os.required_proficiency,
                    "required_proficiency": os.required_proficiency,
                    "isMandatory": os.is_mandatory,
                    "is_mandatory": os.is_mandatory,
                    "weight": os.weight
                }
                for os in opp.skills
            ],
            "required_skills": [
                {
                    "skill_id": os.skill_id,
                    "name": os.skill.name if os.skill else "Skill",
                    "skill_name": os.skill.name if os.skill else "Skill",
                    "required_proficiency": os.required_proficiency,
                    "is_mandatory": os.is_mandatory,
                    "weight": os.weight
                }
                for os in opp.skills
            ]
        })

    # Sort descending by match score
    matched_opportunities.sort(key=lambda x: x["match_score"], reverse=True)
    return matched_opportunities

@router.post("/apply")
@router.post("/opportunities/{opportunity_id}/apply")
async def apply_to_opportunity(
    req: OpportunityApplicationIn,
    opportunity_id: Optional[str] = None,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.projects),
            selectinload(StudentProfile.certifications),
            selectinload(StudentProfile.target_career_role),
            selectinload(StudentProfile.discipline)
        )
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    target_opp_id = opportunity_id or req.get_opportunity_id()
    if not target_opp_id:
        raise HTTPException(status_code=400, detail="opportunity_id is required")

    # Check opportunity
    opp_res = await db.execute(
        select(Opportunity)
        .where(Opportunity.id == target_opp_id)
        .options(
            selectinload(Opportunity.skills).selectinload(OpportunitySkill.skill),
            selectinload(Opportunity.sector),
            selectinload(Opportunity.discipline)
        )
    )
    opp = opp_res.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if already applied (idempotent handling)
    existing_res = await db.execute(
        select(Application).where(
            Application.opportunity_id == target_opp_id,
            Application.student_profile_id == student.id
        )
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        return {
            "success": True,
            "application_id": existing.id,
            "match_score": existing.match_score_percentage,
            "status": existing.status,
            "message": "Application already active for this opportunity"
        }

    # Calculate authoritative data-driven match score at submission time
    student_data = {
        "id": student.id,
        "degree": student.degree,
        "ayush_discipline_id": student.ayush_discipline_id,
        "target_career_role_id": student.target_career_role_id,
        "target_career_sector_id": student.target_career_role.sector_id if student.target_career_role else None,
        "location": student.location,
        "preferred_work_mode": student.preferred_work_mode,
        "skills": [
            {
                "skill_id": s.skill_id,
                "skill_name": s.skill.name if s.skill else "Skill",
                "proficiency_score": s.proficiency_score,
                "verification_level": s.verification_level
            }
            for s in student.skills
        ],
        "projects_count": len(student.projects) if student.projects else 0,
        "certifications_count": len(student.certifications) if student.certifications else 0,
    }

    opp_data = {
        "id": opp.id,
        "title": opp.title,
        "eligibility_degree": opp.eligibility_degree,
        "discipline_id": opp.discipline_id,
        "sector_id": opp.sector_id,
        "location": opp.location,
        "work_mode": opp.work_mode,
        "skills": [
            {
                "skill_id": os.skill_id,
                "skill_name": os.skill.name if os.skill else "Skill",
                "required_proficiency": os.required_proficiency,
                "is_mandatory": os.is_mandatory,
                "weight": os.weight
            }
            for os in opp.skills
        ]
    }

    match_info = calculate_opportunity_match(student_data, opp_data)

    # Create application
    application = Application(
        opportunity_id=opp.id,
        student_profile_id=student.id,
        status="APPLIED",
        match_score=float(match_info["match_score"]),
        cover_note=req.get_cover_note(),
        resume_url=req.get_resume_url()
    )
    db.add(application)
    await db.flush()

    # Create status audit log
    history = ApplicationStatusHistory(
        application_id=application.id,
        status="APPLIED",
        changed_by_user_id=current_user.id,
        notes="Application submitted by candidate"
    )
    db.add(history)
    await db.commit()

    return {
        "success": True,
        "application_id": application.id,
        "applicationId": application.id,
        "match_score": match_info["match_score"],
        "match_score_percentage": match_info["match_score"],
        "matchScorePercentage": match_info["match_score"],
        "message": "Application submitted successfully"
    }

@router.get("/portfolio")
async def get_student_portfolio(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.discipline),
            selectinload(StudentProfile.target_career_role),
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.education),
            selectinload(StudentProfile.projects),
            selectinload(StudentProfile.certifications)
        )
    )
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return {
        "profile": {
            "name": current_user.name,
            "degree": student.degree,
            "institution": student.institution,
            "discipline": student.discipline.name if student.discipline else "Ayurveda",
            "readiness_score": student.readiness_score
        },
        "verified_skills": [
            {
                "skill_id": s.skill_id,
                "name": s.skill.name if s.skill else "Skill",
                "proficiency": s.proficiency_score,
                "verification_level": s.verification_level,
                "source": s.source
            }
            for s in student.skills
        ],
        "education": student.education,
        "projects": student.projects,
        "certifications": student.certifications
    }

# ----------------- LEARNING & TRAINING -----------------

@router.get("/learning/programs")
async def get_all_training_programs(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.discipline),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.sector),
            selectinload(StudentProfile.skills)
        )
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Fetch programs with skills and industry profile
    res = await db.execute(
        select(TrainingProgram)
        .options(
            selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill),
            selectinload(TrainingProgram.industry_profile)
        )
        .order_by(TrainingProgram.created_at.desc(), TrainingProgram.title.asc())
    )
    programs = res.scalars().all()

    # Check student's enrollments
    e_res = await db.execute(
        select(TrainingEnrollment).where(TrainingEnrollment.student_profile_id == student.id)
    )
    enrollments_map = {e.training_program_id: e for e in e_res.scalars().all()}

    formatted_programs = compute_programs_with_goal_sync(student, programs, enrollments_map)

    return {
        "success": True,
        "programs": formatted_programs
    }

@router.get("/learning/recommendations")
async def get_learning_recommendations(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill),
            selectinload(StudentProfile.target_career_role)
        )
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Fetch role skills
    role_skills = []
    if student.target_career_role_id:
        rs_res = await db.execute(
            select(CareerRoleSkill)
            .where(CareerRoleSkill.career_role_id == student.target_career_role_id)
            .options(selectinload(CareerRoleSkill.skill))
        )
        role_skills = rs_res.scalars().all()

    student_skills_data = [
        {"skill_id": s.skill_id, "proficiency_score": s.proficiency_score}
        for s in student.skills
    ]

    gap_report = calculate_role_readiness(
        role_skills=[
            {
                "skill_id": rs.skill_id,
                "skill_name": rs.skill.name if rs.skill else "Skill",
                "category": "AYUSH",
                "required_proficiency": rs.required_proficiency,
                "is_mandatory": rs.is_mandatory,
                "weight": rs.weight
            }
            for rs in role_skills
        ],
        student_skills=student_skills_data
    )

    # Fetch available training programs
    t_res = await db.execute(
        select(TrainingProgram)
        .options(selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill))
    )
    programs = t_res.scalars().all()

    formatted_programs = [
        {
            "id": p.id,
            "title": p.title,
            "provider_name": p.provider_name,
            "category": p.category,
            "duration_hours": p.duration_hours,
            "mode": p.mode,
            "level": p.level,
            "certificate_provided": p.certificate_provided,
            "skills": [
                {
                    "skill_id": ts.skill_id,
                    "skill_name": ts.skill.name if ts.skill else "Skill",
                    "proficiency_gain": ts.proficiency_gain
                }
                for ts in p.training_skills
            ]
        }
        for p in programs
    ]

    all_gaps = gap_report.get("critical_gaps", []) + gap_report.get("moderate_gaps", [])
    recommendations = recommend_training_programs(
        student_gaps=all_gaps,
        available_programs=formatted_programs
    )

    return {
        "success": True,
        "target_career_role": student.target_career_role.title if student.target_career_role else "Target Role",
        "critical_gaps": gap_report.get("critical_gaps", []),
        "recommendations": recommendations
    }

@router.post("/learning/enroll")
async def enroll_training(
    req: TrainingEnrollIn,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    prog_id = req.get_program_id()
    if not prog_id:
        raise HTTPException(status_code=400, detail="training_program_id is required")

    p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    t_res = await db.execute(select(TrainingProgram).where(TrainingProgram.id == prog_id))
    prog = t_res.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Training program not found")

    # Upsert enrollment
    e_res = await db.execute(
        select(TrainingEnrollment).where(
            TrainingEnrollment.student_profile_id == student.id,
            TrainingEnrollment.training_program_id == prog_id
        )
    )
    enrollment = e_res.scalar_one_or_none()
    if not enrollment:
        enrollment = TrainingEnrollment(
            student_profile_id=student.id,
            training_program_id=prog_id,
            status="IN_PROGRESS",
            progress_percent=30
        )
        db.add(enrollment)
    else:
        enrollment.status = "IN_PROGRESS"
        enrollment.progress_percent = max(enrollment.progress_percent, 30)

    # Notify Industry Partner if program is hosted by industry
    if prog.industry_profile_id:
        ind_res = await db.execute(
            select(IndustryProfile)
            .where(IndustryProfile.id == prog.industry_profile_id)
            .options(selectinload(IndustryProfile.user))
        )
        ind_profile = ind_res.scalar_one_or_none()
        if ind_profile and ind_profile.user:
            notif = Notification(
                user_id=ind_profile.user.id,
                title="New Scholar Enrolled in Training Program! 🎓",
                message=f"Scholar {current_user.name} ({student.degree}, {student.institution}) has enrolled in '{prog.title}'.",
                type="TRAINING_ENROLLMENT",
                link="/industry/training"
            )
            db.add(notif)

    await db.commit()
    return {
        "success": True,
        "enrollment_id": enrollment.id,
        "message": f"Successfully enrolled in {prog.title}"
    }

@router.post("/learning/complete")
async def complete_training(
    req: TrainingEnrollIn,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    prog_id = req.get_program_id()
    if not prog_id:
        raise HTTPException(status_code=400, detail="training_program_id is required")

    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(selectinload(StudentProfile.skills))
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    t_res = await db.execute(
        select(TrainingProgram)
        .where(TrainingProgram.id == prog_id)
        .options(selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill))
    )
    prog = t_res.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Training program not found")

    cert_url = f"https://ayush-platform.gov.in/verify/CERT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    # Upsert enrollment
    e_res = await db.execute(
        select(TrainingEnrollment).where(
            TrainingEnrollment.student_profile_id == student.id,
            TrainingEnrollment.training_program_id == prog_id
        )
    )
    enrollment = e_res.scalar_one_or_none()
    if not enrollment:
        enrollment = TrainingEnrollment(
            student_profile_id=student.id,
            training_program_id=prog_id,
            status="COMPLETED",
            progress_percent=100,
            completed_at=datetime.utcnow(),
            certificate_url=cert_url
        )
        db.add(enrollment)
    else:
        enrollment.status = "COMPLETED"
        enrollment.progress_percent = 100
        enrollment.completed_at = datetime.utcnow()
        enrollment.certificate_url = cert_url

    # Boost skills
    boosted_skills = []
    existing_skills_map = {s.skill_id: s for s in student.skills}

    for ts in prog.training_skills:
        skill_name = ts.skill.name if ts.skill else "Skill"
        if ts.skill_id in existing_skills_map:
            sk = existing_skills_map[ts.skill_id]
            old_score = sk.proficiency_score
            new_score = min(95.0, round(old_score + ts.proficiency_gain, 1))
            sk.proficiency_score = new_score
            sk.verification_level = "ASSESSMENT_VERIFIED"
            sk.source = f"Completed Training: {prog.title}"
            sk.verified_at = datetime.utcnow()
            boosted_skills.append({"name": skill_name, "old_score": old_score, "new_score": new_score})
        else:
            new_sk = StudentSkill(
                student_profile_id=student.id,
                skill_id=ts.skill_id,
                proficiency_score=min(90.0, 50.0 + ts.proficiency_gain),
                verification_level="ASSESSMENT_VERIFIED",
                source=f"Completed Training: {prog.title}",
                verified_at=datetime.utcnow()
            )
            db.add(new_sk)
            boosted_skills.append({"name": skill_name, "old_score": 50.0, "new_score": new_sk.proficiency_score})

    # Add Certification
    cert = Certification(
        student_profile_id=student.id,
        name=prog.title,
        issuing_org=prog.provider_name,
        issue_date=datetime.utcnow(),
        credential_id=f"AYUSH-PROG-{int(datetime.utcnow().timestamp())}",
        credential_url=cert_url,
        verification_status="VERIFIED"
    )
    db.add(cert)

    # Add Notification for Student
    notif = Notification(
        user_id=current_user.id,
        title="Training Completed & Skills Upgraded! 🎓",
        message=f"Congratulations! You completed '{prog.title}'. Your skills have been boosted.",
        type="SKILL_ALERT",
        link="/student/skills"
    )
    db.add(notif)

    # Add Notification for Industry Partner
    if prog.industry_profile_id:
        ind_res = await db.execute(
            select(IndustryProfile)
            .where(IndustryProfile.id == prog.industry_profile_id)
            .options(selectinload(IndustryProfile.user))
        )
        ind_profile = ind_res.scalar_one_or_none()
        if ind_profile and ind_profile.user:
            ind_notif = Notification(
                user_id=ind_profile.user.id,
                title="Scholar Completed Training Certification! 🏆",
                message=f"Scholar {current_user.name} ({student.degree}) has completed '{prog.title}' and verified proficiency boosts.",
                type="TRAINING_COMPLETED",
                link="/industry/training"
            )
            db.add(ind_notif)

    await db.commit()

    return {
        "success": True,
        "message": f"Training completed! Skills boosted and certificate awarded.",
        "certificateUrl": cert_url,
        "certificate_url": cert_url,
        "boostedSkills": boosted_skills,
        "boosted_skills": boosted_skills
    }

# ----------------- MENTORSHIP -----------------

@router.get("/mentorship/mentors")
async def get_available_mentors(db: AsyncSession = Depends(get_db)):
    # Auto-heal: Ensure every registered faculty/academician has an active Mentorship record
    acad_res = await db.execute(
        select(AcademicianProfile)
        .options(
            selectinload(AcademicianProfile.user),
            selectinload(AcademicianProfile.discipline),
            selectinload(AcademicianProfile.mentorships)
        )
    )
    all_academicians = acad_res.scalars().all()
    healed = False
    for acad in all_academicians:
        if not acad.mentorships:
            new_m = Mentorship(
                academician_profile_id=acad.id,
                expertise=acad.specialization or "Ayurvedic Clinical Guidance & Research Protocols",
                availability="3 hrs/week",
                bio=acad.bio or f"{acad.designation or 'Faculty Member'} in {acad.department or 'AYUSH Department'} at {acad.institution or 'AYUSH Institution'}. Available for research guidance and student mentorship."
            )
            db.add(new_m)
            healed = True
    if healed:
        await db.commit()

    res = await db.execute(
        select(Mentorship)
        .options(
            selectinload(Mentorship.academician_profile).selectinload(AcademicianProfile.user),
            selectinload(Mentorship.academician_profile).selectinload(AcademicianProfile.discipline)
        )
    )
    mentorships = res.scalars().all()
    return {
        "success": True,
        "mentors": [
            {
                "id": m.id,
                "mentorship_id": m.id,
                "mentor_name": m.academician_profile.user.name if m.academician_profile and m.academician_profile.user else "Faculty Mentor",
                "mentorName": m.academician_profile.user.name if m.academician_profile and m.academician_profile.user else "Faculty Mentor",
                "institution": m.academician_profile.institution if m.academician_profile else "AYUSH Institute",
                "designation": m.academician_profile.designation if m.academician_profile else "Professor",
                "specialization": m.academician_profile.specialization if m.academician_profile else "AYUSH Medicine",
                "disciplineName": m.academician_profile.discipline.name if m.academician_profile and m.academician_profile.discipline else "Ayurveda",
                "expertise": m.expertise,
                "availability": m.availability,
                "bio": m.bio,
                "facultyProfile": {
                    "user": {
                        "name": m.academician_profile.user.name if m.academician_profile and m.academician_profile.user else "Faculty Mentor"
                    },
                    "institution": m.academician_profile.institution if m.academician_profile else "AYUSH Institute",
                    "designation": m.academician_profile.designation if m.academician_profile else "Professor",
                    "discipline": {
                        "name": m.academician_profile.discipline.name if m.academician_profile and m.academician_profile.discipline else "Ayurveda"
                    }
                }
            }
            for m in mentorships
        ]
    }

@router.post("/mentorship/request")
async def request_mentorship(
    req: MentorshipRequestIn,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    m_id = req.get_mentorship_id()
    if not m_id:
        raise HTTPException(status_code=400, detail="mentorship_id is required")

    p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    m_res = await db.execute(
        select(Mentorship)
        .where(Mentorship.id == m_id)
        .options(selectinload(Mentorship.academician_profile))
    )
    mentorship = m_res.scalar_one_or_none()
    if not mentorship:
        raise HTTPException(status_code=404, detail="Mentorship profile not found")

    mr = MentorshipRequest(
        mentorship_id=mentorship.id,
        student_profile_id=student.id,
        academician_profile_id=mentorship.academician_profile_id,
        topic=req.topic,
        message=req.message,
        status="REQUESTED"
    )
    db.add(mr)

    # Notify faculty mentor
    if mentorship.academician_profile and mentorship.academician_profile.user_id:
        notif = Notification(
            user_id=mentorship.academician_profile.user_id,
            title="New Student Mentorship Request 🤝",
            message=f"{current_user.name} requested mentorship on '{req.topic}'.",
            type="MENTOR_RESPONSE",
            link="/faculty/mentorship"
        )
        db.add(notif)

    await db.commit()
    return {
        "success": True,
        "request_id": mr.id,
        "message": "Mentorship request sent successfully"
    }

@router.get("/mentorship/requests")
async def get_student_mentorship_requests(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(StudentProfile.id).where(StudentProfile.user_id == current_user.id))
    student_id = p_res.scalar_one_or_none()
    if not student_id:
        return []

    res = await db.execute(
        select(MentorshipRequest)
        .where(MentorshipRequest.student_profile_id == student_id)
        .options(
            selectinload(MentorshipRequest.mentorship).selectinload(Mentorship.academician_profile).selectinload(AcademicianProfile.user),
            selectinload(MentorshipRequest.mentorship).selectinload(Mentorship.academician_profile).selectinload(AcademicianProfile.discipline)
        )
        .order_by(MentorshipRequest.requested_at.desc())
    )
    requests = res.scalars().all()
    return [
        {
            "id": r.id,
            "topic": r.topic,
            "message": r.message,
            "status": r.status,
            "requested_at": r.requested_at.isoformat() if r.requested_at else None,
            "requestedAt": r.requested_at.isoformat() if r.requested_at else None,
            "mentorship": {
                "id": r.mentorship.id if r.mentorship else "",
                "facultyProfile": {
                    "institution": r.mentorship.academician_profile.institution if r.mentorship and r.mentorship.academician_profile else "AYUSH Institute",
                    "user": {
                        "name": r.mentorship.academician_profile.user.name if r.mentorship and r.mentorship.academician_profile and r.mentorship.academician_profile.user else "Faculty Mentor"
                    },
                    "discipline": {
                        "name": r.mentorship.academician_profile.discipline.name if r.mentorship and r.mentorship.academician_profile and r.mentorship.academician_profile.discipline else "AYUSH"
                    }
                }
            }
        }
        for r in requests
    ]

@router.get("/skills")
async def get_student_skills(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill).selectinload(Skill.category),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill)
        )
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills_list = [
        {
            "id": s.id,
            "skill_id": s.skill_id,
            "skillId": s.skill_id,
            "name": s.skill.name if s.skill else "Skill",
            "category": s.skill.category.name if s.skill and s.skill.category else "General",
            "proficiency_score": s.proficiency_score,
            "proficiencyScore": s.proficiency_score,
            "verification_level": s.verification_level,
            "verificationLevel": s.verification_level,
            "source": s.source,
            "verified_at": s.verified_at.isoformat() if s.verified_at else None,
            "verifiedAt": s.verified_at.isoformat() if s.verified_at else None
        }
        for s in student.skills
    ]

    readiness = None
    if student.target_career_role:
        role_skills_data = [
            {
                "skill_id": rs.skill_id,
                "skill_name": rs.skill.name if rs.skill else "Skill",
                "category": rs.skill.category.name if rs.skill and rs.skill.category else "General",
                "required_proficiency": rs.required_proficiency,
                "is_mandatory": rs.is_mandatory,
                "weight": rs.weight
            }
            for rs in (student.target_career_role.role_skills or [])
        ]
        student_skills_data = [
            {
                "skill_id": s.skill_id,
                "skill_name": s.skill.name if s.skill else "Skill",
                "category": s.skill.category.name if s.skill and s.skill.category else "General",
                "proficiency_score": s.proficiency_score,
                "verification_level": s.verification_level
            }
            for s in student.skills
        ]
        readiness = calculate_role_readiness(
            role_skills=role_skills_data,
            student_skills=student_skills_data
        )

    return {
        "student_id": student.id,
        "total_skills": len(skills_list),
        "readiness_score": student.readiness_score,
        "skills": skills_list,
        "role_readiness": readiness
    }

@router.get("/applications")
async def get_student_applications(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(StudentProfile.id).where(StudentProfile.user_id == current_user.id))
    student_id = p_res.scalar_one_or_none()
    if not student_id:
        raise HTTPException(status_code=404, detail="Student profile not found")

    app_res = await db.execute(
        select(Application)
        .where(Application.student_profile_id == student_id)
        .options(
            selectinload(Application.opportunity).selectinload(Opportunity.industry_profile),
            selectinload(Application.opportunity).selectinload(Opportunity.sector),
            selectinload(Application.status_history),
            selectinload(Application.feedback)
        )
        .order_by(Application.applied_at.desc())
    )
    apps = app_res.scalars().all()

    return [
        {
            "id": a.id,
            "opportunity_id": a.opportunity_id,
            "opportunityId": a.opportunity_id,
            "opportunity_title": a.opportunity.title if a.opportunity else "Opportunity",
            "opportunityTitle": a.opportunity.title if a.opportunity else "Opportunity",
            "company_name": a.opportunity.industry_profile.company_name if a.opportunity and a.opportunity.industry_profile else "AYUSH Enterprise",
            "companyName": a.opportunity.industry_profile.company_name if a.opportunity and a.opportunity.industry_profile else "AYUSH Enterprise",
            "location": a.opportunity.location if a.opportunity else "",
            "work_mode": a.opportunity.work_mode if a.opportunity else "ONSITE",
            "workMode": a.opportunity.work_mode if a.opportunity else "ONSITE",
            "status": a.status,
            "match_score": a.match_score_percentage,
            "matchScore": a.match_score_percentage,
            "matchScorePercentage": a.match_score_percentage,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "appliedAt": a.applied_at.isoformat() if a.applied_at else None,
            "opportunity": {
                "id": a.opportunity.id if a.opportunity else "",
                "title": a.opportunity.title if a.opportunity else "Opportunity",
                "opportunity_type": a.opportunity.opportunity_type if a.opportunity else "INTERNSHIP",
                "opportunityType": a.opportunity.opportunity_type if a.opportunity else "INTERNSHIP",
                "location": a.opportunity.location if a.opportunity else "",
                "work_mode": a.opportunity.work_mode if a.opportunity else "ONSITE",
                "workMode": a.opportunity.work_mode if a.opportunity else "ONSITE",
                "sector": {
                    "id": a.opportunity.sector.id if a.opportunity and a.opportunity.sector else "",
                    "name": a.opportunity.sector.name if a.opportunity and a.opportunity.sector else "AYUSH Healthcare"
                },
                "industryProfile": {
                    "company_name": a.opportunity.industry_profile.company_name if a.opportunity and a.opportunity.industry_profile else "AYUSH Enterprise",
                    "companyName": a.opportunity.industry_profile.company_name if a.opportunity and a.opportunity.industry_profile else "AYUSH Enterprise"
                }
            },
            "status_history": [
                {
                    "status": sh.status,
                    "changed_at": sh.changed_at.isoformat() if sh.changed_at else None,
                    "notes": sh.notes
                }
                for sh in a.status_history
            ],
            "has_feedback": a.feedback is not None
        }
        for a in apps
    ]

@router.get("/meta")
async def get_student_metadata(db: AsyncSession = Depends(get_db)):
    disc_res = await db.execute(select(AyushDiscipline))
    disciplines = disc_res.scalars().all()

    roles_res = await db.execute(select(CareerRole))
    roles = roles_res.scalars().all()

    sec_res = await db.execute(select(Sector))
    sectors = sec_res.scalars().all()

    return {
        "disciplines": [{"id": d.id, "name": d.name, "code": d.code} for d in disciplines],
        "career_roles": [{"id": r.id, "title": r.title, "demand_level": r.demand_level} for r in roles],
        "sectors": [{"id": s.id, "name": s.name} for s in sectors]
    }

@router.get("/profile-view")
@router.get("/profile-view/{profile_id}")
async def get_student_profile_full_view(
    profile_id: Optional[str] = None,
    current_user: User = Depends(require_role(["STUDENT", "INSTITUTION", "INDUSTRY", "ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(StudentProfile)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.discipline),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.sector),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill).selectinload(Skill.category),
            selectinload(StudentProfile.skills).selectinload(StudentSkill.skill).selectinload(Skill.category),
            selectinload(StudentProfile.projects),
            selectinload(StudentProfile.certifications),
            selectinload(StudentProfile.education),
            selectinload(StudentProfile.applications).selectinload(Application.opportunity).selectinload(Opportunity.industry_profile),
            selectinload(StudentProfile.applications).selectinload(Application.opportunity).selectinload(Opportunity.sector),
            selectinload(StudentProfile.applications).selectinload(Application.status_history),
            selectinload(StudentProfile.applications).selectinload(Application.feedback),
            selectinload(StudentProfile.enrollments).selectinload(TrainingEnrollment.training_program).selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill),
            selectinload(StudentProfile.attempts)
        )
    )

    if profile_id:
        query = query.where(or_(StudentProfile.id == profile_id, StudentProfile.user_id == profile_id))
    else:
        query = query.where(StudentProfile.user_id == current_user.id)

    res = await db.execute(query)
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Format role data
    role_data = None
    if student.target_career_role:
        r = student.target_career_role
        role_data = {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "minEducation": r.min_education,
            "min_education": r.min_education,
            "averageSalary": r.average_salary or "₹6,00,000 - ₹10,00,000",
            "average_salary": r.average_salary or "₹6,00,000 - ₹10,00,000",
            "demandLevel": r.demand_level,
            "demand_level": r.demand_level,
            "sectorId": r.sector_id,
            "sector_id": r.sector_id,
            "sector": {"id": r.sector.id, "name": r.sector.name} if r.sector else None,
            "skills": [
                {
                    "skillId": rs.skill_id,
                    "skill_id": rs.skill_id,
                    "requiredProficiency": rs.required_proficiency,
                    "required_proficiency": rs.required_proficiency,
                    "isMandatory": rs.is_mandatory,
                    "is_mandatory": rs.is_mandatory,
                    "weight": rs.weight,
                    "skill": {
                        "id": rs.skill.id,
                        "name": rs.skill.name,
                        "category": {"id": rs.skill.category.id, "name": rs.skill.category.name} if rs.skill and rs.skill.category else None
                    } if rs.skill else None
                }
                for rs in r.role_skills
            ]
        }

    # Format skills data
    skills_data = [
        {
            "id": s.id,
            "skillId": s.skill_id,
            "skill_id": s.skill_id,
            "proficiencyScore": s.proficiency_score,
            "proficiency_score": s.proficiency_score,
            "verificationLevel": s.verification_level,
            "verification_level": s.verification_level,
            "source": s.source,
            "verifiedAt": s.verified_at.isoformat() if s.verified_at else None,
            "verified_at": s.verified_at.isoformat() if s.verified_at else None,
            "skill": {
                "id": s.skill.id,
                "name": s.skill.name,
                "category": {"id": s.skill.category.id, "name": s.skill.category.name} if s.skill and s.skill.category else None
            } if s.skill else None
        }
        for s in student.skills
    ]

    # Format applications data
    apps_data = [
        {
            "id": a.id,
            "opportunityId": a.opportunity_id,
            "opportunity_id": a.opportunity_id,
            "status": a.status,
            "matchScore": a.match_score_percentage,
            "match_score_percentage": a.match_score_percentage,
            "appliedAt": a.applied_at.isoformat() if a.applied_at else None,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "opportunity": {
                "id": a.opportunity.id,
                "title": a.opportunity.title,
                "location": a.opportunity.location,
                "workMode": a.opportunity.work_mode,
                "work_mode": a.opportunity.work_mode,
                "stipend": a.opportunity.stipend_salary,
                "stipendSalary": a.opportunity.stipend_salary,
                "stipend_salary": a.opportunity.stipend_salary,
                "industryProfile": {
                    "id": a.opportunity.industry_profile.id,
                    "companyName": a.opportunity.industry_profile.company_name,
                    "company_name": a.opportunity.industry_profile.company_name,
                    "location": a.opportunity.industry_profile.location
                } if a.opportunity.industry_profile else None,
                "sector": {
                    "id": a.opportunity.sector.id,
                    "name": a.opportunity.sector.name
                } if a.opportunity.sector else None
            } if a.opportunity else None,
            "statusHistory": [
                {
                    "id": sh.id,
                    "status": sh.status,
                    "changedAt": sh.changed_at.isoformat() if sh.changed_at else None,
                    "changed_at": sh.changed_at.isoformat() if sh.changed_at else None,
                    "notes": sh.notes
                }
                for sh in a.status_history
            ],
            "feedback": {
                "id": a.feedback.id,
                "strengths": a.feedback.strengths,
                "improvements": a.feedback.improvements,
                "improvementAreas": a.feedback.improvements,
                "skillRatings": []
            } if a.feedback else None
        }
        for a in student.applications
    ]

    return {
        "id": student.id,
        "name": student.user.name if student.user else "Student",
        "email": student.user.email if student.user else "",
        "phone": student.user.phone if student.user else "",
        "user": {
            "name": student.user.name if student.user else "Student",
            "email": student.user.email if student.user else "",
            "phone": student.user.phone if student.user else "",
        } if student.user else None,
        "userId": student.user_id,
        "user_id": student.user_id,
        "degree": student.degree,
        "institution": student.institution,
        "currentYear": student.current_year,
        "current_year": student.current_year,
        "graduationYear": student.graduation_year,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "bio": student.bio,
        "location": student.location,
        "preferredWorkMode": student.preferred_work_mode,
        "preferred_work_mode": student.preferred_work_mode,
        "readinessScore": student.readiness_score,
        "readiness_score": student.readiness_score,
        "generalSkillScore": student.general_skill_score,
        "general_skill_score": student.general_skill_score,
        "ayushDisciplineId": student.ayush_discipline_id,
        "ayush_discipline_id": student.ayush_discipline_id,
        "targetCareerRoleId": student.target_career_role_id,
        "target_career_role_id": student.target_career_role_id,
        "discipline": {
            "id": student.discipline.id,
            "name": student.discipline.name,
            "code": student.discipline.code
        } if student.discipline else None,
        "targetCareerRole": role_data,
        "target_career_role": role_data,
        "skills": skills_data,
        "applications": apps_data,
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "technologies": getattr(p, "skills_used", "") or getattr(p, "technologies", ""),
                "skills_used": getattr(p, "skills_used", ""),
                "projectUrl": p.project_url,
                "project_url": p.project_url
            }
            for p in student.projects
        ],
        "certifications": [
            {
                "id": c.id,
                "name": c.name,
                "issuingOrganization": getattr(c, "issuing_org", "") or getattr(c, "issuing_organization", ""),
                "issuing_organization": getattr(c, "issuing_org", "") or getattr(c, "issuing_organization", ""),
                "issueDate": c.issue_date.isoformat() if c.issue_date else None,
                "issue_date": c.issue_date.isoformat() if c.issue_date else None,
                "credentialUrl": c.credential_url,
                "credential_url": c.credential_url
            }
            for c in student.certifications
        ],
        "enrollments": [
            {
                "id": e.id,
                "status": e.status,
                "progress": e.progress_percent,
                "progressPercentage": e.progress_percent,
                "trainingProgram": {
                    "id": e.training_program.id,
                    "title": e.training_program.title,
                    "provider": e.training_program.provider_name,
                    "durationHours": e.training_program.duration_hours,
                    "skills": [
                        {
                            "skill": {"id": ts.skill.id, "name": ts.skill.name} if ts.skill else None
                        }
                        for ts in e.training_program.training_skills
                    ] if e.training_program.training_skills else []
                } if e.training_program else None
            }
            for e in student.enrollments
        ],
        "attempts": [
            {
                "id": att.id,
                "status": att.status,
                "scorePercentage": att.score_percentage,
                "score_percentage": att.score_percentage,
                "completedAt": att.completed_at.isoformat() if att.completed_at else None
            }
            for att in student.attempts
        ]
    }

