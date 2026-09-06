from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, IndustryProfile, StudentProfile
from app.models.opportunity import Opportunity, OpportunitySkill, Application, ApplicationStatusHistory
from app.models.feedback import IndustryFeedback, IndustryFeedbackSkillRating
from app.models.career import StudentSkill
from app.models.taxonomy import Sector, AyushDiscipline, Skill
from app.models.training import TrainingProgram, TrainingSkill, TrainingEnrollment
from app.models.collaboration import CollaborationProject
from app.models.system import Notification
from app.schemas.industry import OpportunityCreate, ApplicationStatusUpdate, FeedbackCreate, TrainingProgramCreate
from app.services.auth_service import require_role, get_current_user_optional

router = APIRouter(prefix="/industry", tags=["Industry"])

@router.get("/dashboard")
async def get_industry_dashboard(
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(IndustryProfile)
        .where(IndustryProfile.user_id == current_user.id)
        .options(
            selectinload(IndustryProfile.opportunities).selectinload(Opportunity.applications)
        )
    )
    industry = res.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    all_apps = [app for o in industry.opportunities for app in o.applications]
    shortlisted_count = len([a for a in all_apps if a.status in ["SHORTLISTED", "INTERVIEW", "SELECTED"]])
    active_opps_count = len([o for o in industry.opportunities if o.status == "ACTIVE"])

    # Query hosted training programs and enrolled trainees
    t_res = await db.execute(
        select(TrainingProgram)
        .where(TrainingProgram.industry_profile_id == industry.id)
        .options(selectinload(TrainingProgram.enrollments))
    )
    my_trainings = t_res.scalars().all()
    total_trainings_count = len(my_trainings)
    total_trainees_count = sum(len(tp.enrollments) for tp in my_trainings)

    return {
        "company_name": industry.company_name,
        "is_verified": industry.is_verified,
        "location": industry.location,
        "website": industry.website,
        "active_opportunities_count": active_opps_count,
        "total_applicants_count": len(all_apps),
        "shortlisted_count": shortlisted_count,
        "total_trainings_count": total_trainings_count,
        "totalTrainingsCount": total_trainings_count,
        "total_trainees_count": total_trainees_count,
        "totalTraineesCount": total_trainees_count
    }

@router.get("/opportunities")
async def get_industry_opportunities(
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(IndustryProfile).where(IndustryProfile.user_id == current_user.id))
    industry = p_res.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    res = await db.execute(
        select(Opportunity)
        .where(Opportunity.industry_profile_id == industry.id)
        .options(
            selectinload(Opportunity.skills).selectinload(OpportunitySkill.skill),
            selectinload(Opportunity.applications)
        )
        .order_by(Opportunity.created_at.desc())
    )
    opportunities = res.scalars().all()

    return {
        "success": True,
        "opportunities": [
            {
                "id": o.id,
                "title": o.title,
                "opportunity_type": o.opportunity_type,
                "status": o.status,
                "location": o.location,
                "work_mode": o.work_mode,
                "duration": o.duration,
                "stipend_salary": o.stipend_salary,
                "deadline": o.deadline.isoformat() if o.deadline else None,
                "applicants_count": len(o.applications),
                "skills": [
                    {
                        "skill_id": s.skill_id,
                        "skill_name": s.skill.name if s.skill else "Skill",
                        "required_proficiency": s.required_proficiency,
                        "is_mandatory": s.is_mandatory
                    }
                    for s in o.skills
                ]
            }
            for o in opportunities
        ]
    }

# Create Opportunity (supports both POST /opportunity and POST /opportunities)
@router.post("/opportunity")
@router.post("/opportunities")
async def create_opportunity(
    req: OpportunityCreate,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(IndustryProfile).where(IndustryProfile.user_id == current_user.id))
    industry = p_res.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    sec_id = req.get_sector_id() or industry.sector_id
    deadline_val = req.deadline or (datetime.utcnow() + timedelta(days=30))

    opp = Opportunity(
        industry_profile_id=industry.id,
        title=req.title,
        opportunity_type=req.get_type(),
        description=req.description,
        sector_id=sec_id,
        discipline_id=req.get_discipline_id(),
        eligibility_degree=req.get_degree(),
        location=req.location or "New Delhi, India",
        work_mode=req.get_work_mode(),
        duration=req.duration or "6 Months",
        stipend_salary=req.get_stipend(),
        deadline=deadline_val,
        status="ACTIVE"
    )
    db.add(opp)
    await db.flush()

    # Add required skills
    for sk in req.get_skills():
        s_id = sk.get("skill_id") or sk.get("skillId")
        if s_id:
            req_prof = float(sk.get("required_proficiency") or sk.get("requiredProficiency") or 70.0)
            is_mand = bool(sk.get("is_mandatory") if "is_mandatory" in sk else sk.get("isMandatory", True))
            weight_val = float(sk.get("weight", 1.0))
            opp_skill = OpportunitySkill(
                opportunity_id=opp.id,
                skill_id=s_id,
                required_proficiency=req_prof,
                is_mandatory=is_mand,
                weight=weight_val
            )
            db.add(opp_skill)

    await db.commit()
    return {
        "success": True,
        "opportunity_id": opp.id,
        "opportunity": {
            "id": opp.id,
            "title": opp.title,
            "status": opp.status
        },
        "message": "Opportunity created successfully"
    }

@router.get("/candidates")
async def get_candidates_pool(
    opportunity_id: Optional[str] = None,
    opp_id: Optional[str] = None,
    oppId: Optional[str] = None,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    target_opp_id = opportunity_id or opp_id or oppId
    p_res = await db.execute(select(IndustryProfile).where(IndustryProfile.user_id == current_user.id))
    industry = p_res.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    query = (
        select(Application)
        .join(Opportunity, Opportunity.id == Application.opportunity_id)
        .where(Opportunity.industry_profile_id == industry.id)
        .options(
            selectinload(Application.opportunity),
            selectinload(Application.student_profile).selectinload(StudentProfile.user),
            selectinload(Application.student_profile).selectinload(StudentProfile.discipline),
            selectinload(Application.student_profile).selectinload(StudentProfile.skills).selectinload(StudentSkill.skill)
        )
        .order_by(Application.match_score.desc())
    )
    if target_opp_id:
        query = query.where(Application.opportunity_id == target_opp_id)

    res = await db.execute(query)
    applications = res.scalars().all()

    return [
        {
            "application_id": a.id,
            "opportunity_id": a.opportunity_id,
            "opportunity_title": a.opportunity.title if a.opportunity else "",
            "candidate_name": a.student_profile.user.name if a.student_profile and a.student_profile.user else "Candidate",
            "candidate_email": a.student_profile.user.email if a.student_profile and a.student_profile.user else "",
            "degree": a.student_profile.degree if a.student_profile else "",
            "institution": a.student_profile.institution if a.student_profile else "",
            "discipline": a.student_profile.discipline.name if a.student_profile and a.student_profile.discipline else "",
            "readiness_score": a.student_profile.readiness_score if a.student_profile else 0.0,
            "match_score": a.match_score,
            "status": a.status,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "skills": [
                {
                    "name": s.skill.name if s.skill else "",
                    "proficiency": s.proficiency_score,
                    "level": s.verification_level
                }
                for s in (a.student_profile.skills if a.student_profile else [])
            ]
        }
        for a in applications
    ]

@router.get("/applications/{application_id}")
async def get_industry_application_detail(
    application_id: str,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Application)
        .where(Application.id == application_id)
        .options(
            selectinload(Application.opportunity).selectinload(Opportunity.skills).selectinload(OpportunitySkill.skill),
            selectinload(Application.opportunity).selectinload(Opportunity.sector),
            selectinload(Application.student_profile).selectinload(StudentProfile.user),
            selectinload(Application.student_profile).selectinload(StudentProfile.discipline),
            selectinload(Application.feedback).selectinload(IndustryFeedback.skill_ratings)
        )
    )
    a = res.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")

    skills_data = [
        {
            "id": s.id,
            "skillId": s.skill_id,
            "skill": {
                "id": s.skill_id,
                "name": s.skill.name if s.skill else "Skill"
            }
        }
        for s in (a.opportunity.skills if a.opportunity else [])
    ]

    feedback_data = None
    if a.feedback:
        feedback_data = {
            "id": a.feedback.id,
            "overallRating": a.feedback.overall_rating,
            "writtenFeedback": a.feedback.written_feedback,
            "strengths": a.feedback.strengths,
            "improvements": a.feedback.improvements,
            "skillRatings": [
                {
                    "skillId": sr.skill_id,
                    "rating": sr.rating
                }
                for sr in (a.feedback.skill_ratings or [])
            ]
        }

    return {
        "id": a.id,
        "status": a.status,
        "match_score": a.match_score_percentage,
        "matchScore": a.match_score_percentage,
        "matchScorePercentage": a.match_score_percentage,
        "applied_at": a.applied_at.isoformat() if a.applied_at else None,
        "appliedAt": a.applied_at.isoformat() if a.applied_at else None,
        "opportunity": {
            "id": a.opportunity.id if a.opportunity else "",
            "title": a.opportunity.title if a.opportunity else "Opportunity",
            "skills": skills_data
        },
        "studentProfile": {
            "id": a.student_profile.id if a.student_profile else "",
            "user": {
                "name": a.student_profile.user.name if a.student_profile and a.student_profile.user else "Candidate",
                "email": a.student_profile.user.email if a.student_profile and a.student_profile.user else ""
            },
            "discipline": {
                "name": a.student_profile.discipline.name if a.student_profile and a.student_profile.discipline else "Ayurveda"
            }
        },
        "feedback": feedback_data
    }

# Update Application Status (supports POST /application-status and PUT /applications/{id}/status)
@router.post("/application-status")
@router.put("/applications/{application_id}/status")
async def update_application_status(
    req: ApplicationStatusUpdate,
    application_id: Optional[str] = None,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    target_app_id = application_id or req.get_app_id()
    if not target_app_id:
        raise HTTPException(status_code=400, detail="application_id is required")

    res = await db.execute(
        select(Application)
        .where(Application.id == target_app_id)
        .options(
            selectinload(Application.opportunity),
            selectinload(Application.student_profile).selectinload(StudentProfile.user)
        )
    )
    app_record = res.scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    app_record.status = req.status
    app_record.updated_at = datetime.utcnow()

    # Log audit history
    status_hist = ApplicationStatusHistory(
        application_id=app_record.id,
        status=req.status,
        changed_by_user_id=current_user.id,
        notes=req.notes or f"Status updated to {req.status} by recruiter"
    )
    db.add(status_hist)

    # Notify student
    if app_record.student_profile and app_record.student_profile.user:
        opp_title = app_record.opportunity.title if app_record.opportunity else "Opportunity"
        notif = Notification(
            user_id=app_record.student_profile.user.id,
            title=f"Application Status: {req.status} 📋",
            message=f"Your application for '{opp_title}' has been updated to '{req.status}'.",
            type="APPLICATION_UPDATE",
            link="/student/applications"
        )
        db.add(notif)

    await db.commit()
    return {
        "success": True,
        "application_id": app_record.id,
        "new_status": req.status,
        "message": f"Application status updated to {req.status}"
    }

# Submit Internship Feedback & Verified Skills Endorsement
@router.post("/feedback")
async def submit_internship_feedback(
    req: FeedbackCreate,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    app_id = req.get_app_id()
    if not app_id:
        raise HTTPException(status_code=400, detail="application_id is required")

    a_res = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .options(
            selectinload(Application.opportunity),
            selectinload(Application.student_profile).selectinload(StudentProfile.user)
        )
    )
    app_record = a_res.scalar_one_or_none()
    if not app_record or not app_record.student_profile_id:
        raise HTTPException(status_code=404, detail="Student application not found")

    # Check if feedback already exists for this application
    fb_res = await db.execute(select(IndustryFeedback).where(IndustryFeedback.application_id == app_id))
    feedback = fb_res.scalar_one_or_none()

    rating_val = req.get_rating()
    written_text = req.get_feedback()

    if not feedback:
        feedback = IndustryFeedback(
            application_id=app_id,
            student_profile_id=app_record.student_profile_id,
            reviewer_id=current_user.id,
            overall_rating=rating_val,
            written_feedback=written_text,
            strengths=req.strengths or "",
            improvements=req.improvements or ""
        )
        db.add(feedback)
    else:
        feedback.overall_rating = rating_val
        feedback.written_feedback = written_text
        feedback.strengths = req.strengths or ""
        feedback.improvements = req.improvements or ""
        feedback.reviewer_id = current_user.id

    await db.flush()

    # Rate individual skills & upgrade student skills to INDUSTRY_VERIFIED!
    for sr in req.get_ratings():
        s_id = sr.get_skill_id()
        if not s_id:
            continue

        # Save rating record
        sr_res = await db.execute(
            select(IndustryFeedbackSkillRating).where(
                IndustryFeedbackSkillRating.feedback_id == feedback.id,
                IndustryFeedbackSkillRating.skill_id == s_id
            )
        )
        sr_record = sr_res.scalar_one_or_none()
        if not sr_record:
            sr_record = IndustryFeedbackSkillRating(
                feedback_id=feedback.id,
                skill_id=s_id,
                rating=float(sr.rating)
            )
            db.add(sr_record)
        else:
            sr_record.rating = float(sr.rating)

        # Upgrade student skill in StudentSkill table to INDUSTRY_VERIFIED
        st_skill_res = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_profile_id == app_record.student_profile_id,
                StudentSkill.skill_id == s_id
            )
        )
        st_skill = st_skill_res.scalar_one_or_none()
        if st_skill:
            st_skill.verification_level = "INDUSTRY_VERIFIED"
            st_skill.verified_at = datetime.utcnow()
            st_skill.source = f"Industry Endorsement: {current_user.name}"
            boosted = min(100.0, float(sr.rating) * 20.0)
            if boosted > st_skill.proficiency_score:
                st_skill.proficiency_score = boosted

    # Notify student
    if app_record.student_profile and app_record.student_profile.user:
        opp_name = app_record.opportunity.title if app_record.opportunity else "Tenure"
        notif = Notification(
            user_id=app_record.student_profile.user.id,
            title="Industry Endorsement & Verified Feedback Received! ⭐",
            message=f"Your supervisor submitted a verified competency review ({rating_val}/5) for '{opp_name}'.",
            type="FEEDBACK_RECEIVED",
            link="/student/portfolio"
        )
        db.add(notif)

    await db.commit()
    return {
        "success": True,
        "feedback_id": feedback.id,
        "message": "Feedback submitted and skills upgraded to INDUSTRY_VERIFIED!"
    }

@router.get("/meta")
async def get_industry_metadata(db: AsyncSession = Depends(get_db)):
    sec_res = await db.execute(select(Sector))
    sectors = sec_res.scalars().all()

    disc_res = await db.execute(select(AyushDiscipline))
    disciplines = disc_res.scalars().all()

    skill_res = await db.execute(select(Skill).limit(50))
    skills = skill_res.scalars().all()

    return {
        "sectors": [{"id": s.id, "name": s.name} for s in sectors],
        "disciplines": [{"id": d.id, "name": d.name} for d in disciplines],
        "skills": [{"id": sk.id, "name": sk.name} for sk in skills]
    }

@router.get("/training")
async def get_industry_training_programs(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Find current industry profile id if logged in
    my_industry_id = None
    if current_user and current_user.role == "INDUSTRY":
        ind_res = await db.execute(
            select(IndustryProfile).where(IndustryProfile.user_id == current_user.id)
        )
        my_ind = ind_res.scalar_one_or_none()
        if my_ind:
            my_industry_id = my_ind.id

    res = await db.execute(
        select(TrainingProgram)
        .options(
            selectinload(TrainingProgram.training_skills).selectinload(TrainingSkill.skill),
            selectinload(TrainingProgram.enrollments)
            .selectinload(TrainingEnrollment.student_profile)
            .selectinload(StudentProfile.user),
            selectinload(TrainingProgram.enrollments)
            .selectinload(TrainingEnrollment.student_profile)
            .selectinload(StudentProfile.discipline),
            selectinload(TrainingProgram.industry_profile)
        )
        .order_by(TrainingProgram.created_at.desc())
    )
    programs = res.scalars().all()

    result = []
    for p in programs:
        enrollments_list = []
        for e in (p.enrollments or []):
            st = e.student_profile
            st_user = st.user if st else None
            enrollments_list.append({
                "id": e.id,
                "enrollment_id": e.id,
                "enrollmentId": e.id,
                "student_profile_id": e.student_profile_id,
                "studentProfileId": e.student_profile_id,
                "student_name": st_user.name if st_user else "Enrolled Scholar",
                "studentName": st_user.name if st_user else "Enrolled Scholar",
                "student_email": st_user.email if st_user else "",
                "studentEmail": st_user.email if st_user else "",
                "degree": st.degree if st else "BAMS",
                "institution": st.institution if st else "AYUSH Institute",
                "discipline": st.discipline.name if (st and st.discipline) else "General AYUSH",
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
                "enrolledAt": e.enrolled_at.isoformat() if e.enrolled_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "completedAt": e.completed_at.isoformat() if e.completed_at else None,
                "status": e.status,
                "progress_percent": e.progress_percent,
                "progressPercent": e.progress_percent,
                "readiness_score": st.readiness_score if st else 0.0,
                "readinessScore": st.readiness_score if st else 0.0
            })

        is_mine = (my_industry_id is not None and p.industry_profile_id == my_industry_id)
        in_prog = sum(1 for e in enrollments_list if e["status"] in ["IN_PROGRESS", "ENROLLED"])
        comp = sum(1 for e in enrollments_list if e["status"] == "COMPLETED")

        result.append({
            "id": p.id,
            "title": p.title,
            "provider_name": p.provider_name,
            "providerName": p.provider_name,
            "industry_profile_id": p.industry_profile_id,
            "industryProfileId": p.industry_profile_id,
            "is_mine": is_mine,
            "isMine": is_mine,
            "duration_weeks": max(1, p.duration_hours // 10) if p.duration_hours else 2,
            "durationWeeks": max(1, p.duration_hours // 10) if p.duration_hours else 2,
            "duration_hours": p.duration_hours,
            "durationHours": p.duration_hours,
            "category": p.category,
            "format": p.mode,
            "mode": p.mode,
            "certification_offered": p.certificate_provided,
            "certificate_provided": p.certificate_provided,
            "certificateProvided": p.certificate_provided,
            "level": p.level,
            "description": p.description,
            "syllabus": p.syllabus,
            "external_link": p.external_link,
            "externalLink": p.external_link,
            "skills": [ts.skill.name for ts in p.training_skills if ts.skill],
            "skills_detail": [
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
            "enrolled_count": len(enrollments_list),
            "enrolledCount": len(enrollments_list),
            "in_progress_count": in_prog,
            "inProgressCount": in_prog,
            "completed_count": comp,
            "completedCount": comp,
            "_count": {
                "enrollments": len(enrollments_list)
            },
            "enrollments": enrollments_list
        })

    return result

@router.post("/training")
@router.post("/training/create")
async def create_industry_training_program(
    req: TrainingProgramCreate,
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(IndustryProfile).where(IndustryProfile.user_id == current_user.id)
    )
    industry = res.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    new_program = TrainingProgram(
        industry_profile_id=industry.id,
        provider_name=industry.company_name,
        title=req.title.strip(),
        description=req.description.strip(),
        category=req.category or "CLINICAL_RESEARCH",
        duration_hours=req.get_duration_hours(),
        mode=req.mode or "ONLINE",
        certificate_provided=req.get_certificate_provided(),
        level=req.level or "INTERMEDIATE",
        syllabus=req.syllabus or "",
        external_link=req.get_external_link()
    )
    db.add(new_program)
    await db.flush()

    # Add skills
    for s in req.get_skills():
        s_id = s.get("skill_id")
        gain = s.get("proficiency_gain", 20.0)
        if s_id:
            sk_check = await db.execute(select(Skill).where(Skill.id == s_id))
            if sk_check.scalar_one_or_none():
                db.add(TrainingSkill(
                    training_program_id=new_program.id,
                    skill_id=s_id,
                    proficiency_gain=gain
                ))

    await db.commit()

    return {
        "success": True,
        "program_id": new_program.id,
        "programId": new_program.id,
        "message": f"Training program '{new_program.title}' published successfully!"
    }


@router.get("/collaborations")
async def get_industry_collaborations(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CollaborationProject)
        .options(selectinload(CollaborationProject.creator), selectinload(CollaborationProject.discipline))
        .order_by(CollaborationProject.created_at.desc())
    )
    projects = res.scalars().all()
    return [
        {
            "id": cp.id,
            "title": cp.title,
            "project_type": cp.project_type,
            "projectType": cp.project_type,
            "status": cp.status,
            "description": cp.description,
            "company_name": cp.creator.name if cp.creator else "Industry Sponsor",
            "discipline": cp.discipline.name if cp.discipline else "General AYUSH",
            "seeking_types": cp.seeking_types,
            "required_areas": cp.required_areas
        }
        for cp in projects
    ]

@router.get("/profile")
async def get_industry_profile(
    current_user: User = Depends(require_role(["INDUSTRY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(IndustryProfile)
        .where(IndustryProfile.user_id == current_user.id)
        .options(selectinload(IndustryProfile.sector))
    )
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    return {
        "id": profile.id,
        "company_name": profile.company_name,
        "companyName": profile.company_name,
        "description": profile.description,
        "location": profile.location,
        "website": profile.website,
        "sector": profile.sector.name if profile.sector else "AYUSH Health & Pharmaceuticals",
        "contact_email": current_user.email,
        "contact_name": current_user.name
    }
