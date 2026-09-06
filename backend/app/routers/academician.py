from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, AcademicianProfile, StudentProfile
from app.models.opportunity import Opportunity, Application
from app.models.collaboration import Mentorship, MentorshipRequest, CollaborationProject, CollaborationRequest
from app.models.system import Notification
from app.schemas.academician import (
    MentorshipAction,
    MentorshipActionPost,
    ResearchProjectCreate,
    AcademicianProfileUpdate,
    MentorshipOfferingUpdate
)
from app.services.auth_service import require_role

router = APIRouter(prefix="/academician", tags=["Academician"])

@router.get("/dashboard")
async def get_academician_dashboard(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AcademicianProfile)
        .where(AcademicianProfile.user_id == current_user.id)
        .options(
            selectinload(AcademicianProfile.discipline),
            selectinload(AcademicianProfile.applications).selectinload(Application.opportunity),
            selectinload(AcademicianProfile.mentorships).selectinload(Mentorship.requests)
        )
    )
    academician = res.scalar_one_or_none()
    if not academician:
        raise HTTPException(status_code=404, detail="Academician profile not found")

    # Mentorship requests
    all_requests = []
    for m in academician.mentorships:
        for r in m.requests:
            all_requests.append({
                "id": r.id,
                "topic": r.topic,
                "message": r.message,
                "status": r.status,
                "requested_at": r.requested_at.isoformat()
            })

    # Available FDPs and Faculty Internships count
    fdp_res = await db.execute(
        select(Opportunity)
        .where(Opportunity.opportunity_type.in_(["FACULTY_INTERNSHIP", "FDP", "CONSULTANCY", "TRAINING"]))
        .where(Opportunity.status == "ACTIVE")
    )
    available_fdps = fdp_res.scalars().all()

    return {
        "profile": {
            "name": current_user.name,
            "institution": academician.institution,
            "designation": academician.designation,
            "department": academician.department,
            "specialization": academician.specialization,
            "discipline": academician.discipline.name if academician.discipline else "Ayurveda"
        },
        "available_fdps_count": len(available_fdps),
        "applied_opportunities": [
            {
                "id": a.id,
                "title": a.opportunity.title if a.opportunity else "FDP Program",
                "type": a.opportunity.opportunity_type if a.opportunity else "FDP",
                "status": a.status
            }
            for a in academician.applications
        ],
        "mentorship_requests": all_requests
    }

@router.get("/opportunities")
async def get_academician_opportunities(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve faculty-specific opportunities
    res = await db.execute(
        select(Opportunity)
        .where(Opportunity.opportunity_type.in_(["FACULTY_INTERNSHIP", "FDP", "CONSULTANCY", "TRAINING", "PROJECT"]))
        .where(Opportunity.status == "ACTIVE")
        .options(
            selectinload(Opportunity.industry_profile),
            selectinload(Opportunity.sector)
        )
    )
    opps = res.scalars().all()
    return [
        {
            "id": o.id,
            "title": o.title,
            "type": o.opportunity_type,
            "company": o.industry_profile.company_name if o.industry_profile else "Industry Partner",
            "sector": o.sector.name if o.sector else "Healthcare",
            "location": o.location,
            "work_mode": o.work_mode,
            "duration": o.duration,
            "stipend_salary": o.stipend_salary,
            "description": o.description,
            "deadline": o.deadline.isoformat() if o.deadline else None
        }
        for o in opps
    ]

@router.get("/research")
async def get_research_collaboration_hub(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(CollaborationProject)
        .options(
            selectinload(CollaborationProject.creator),
            selectinload(CollaborationProject.discipline),
            selectinload(CollaborationProject.requests)
        )
    )
    projects = res.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "project_type": p.project_type,
            "creator_name": p.creator.name if p.creator else "Researcher",
            "discipline": p.discipline.name if p.discipline else "Cross-Disciplinary",
            "seeking_types": p.seeking_types,
            "required_areas": p.required_areas,
            "status": p.status,
            "proposals_count": len(p.requests)
        }
        for p in projects
    ]

@router.post("/research")
async def create_research_project(
    req: ResearchProjectCreate,
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    project = CollaborationProject(
        creator_user_id=current_user.id,
        title=req.title,
        description=req.description,
        project_type=req.project_type,
        discipline_id=req.discipline_id,
        seeking_types=req.seeking_types,
        required_areas=req.required_areas,
        status="OPEN"
    )
    db.add(project)
    await db.commit()
    return {"success": True, "project_id": project.id, "message": "Research project published successfully"}

@router.get("/mentorships")
async def get_academician_mentorships(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(AcademicianProfile)
        .where(AcademicianProfile.user_id == current_user.id)
        .options(
            selectinload(AcademicianProfile.mentorships)
            .selectinload(Mentorship.requests)
            .selectinload(MentorshipRequest.student_profile)
            .selectinload(StudentProfile.user)
        )
    )
    academician = p_res.scalar_one_or_none()
    if not academician:
        raise HTTPException(status_code=404, detail="Academician profile not found")

    # Ensure faculty has active mentorship offering
    active_offering = None
    if academician.mentorships:
        m_main = academician.mentorships[0]
        active_offering = {
            "id": m_main.id,
            "expertise": m_main.expertise,
            "availability": m_main.availability,
            "bio": m_main.bio
        }
    else:
        new_m = Mentorship(
            academician_profile_id=academician.id,
            expertise=academician.specialization or "Ayurvedic Clinical Guidance & Research Protocols",
            availability="3 hrs/week",
            bio=academician.bio or f"{academician.designation} at {academician.institution}."
        )
        db.add(new_m)
        await db.commit()
        active_offering = {
            "id": new_m.id,
            "expertise": new_m.expertise,
            "availability": new_m.availability,
            "bio": new_m.bio
        }

    requests_list = []
    for m in academician.mentorships:
        for r in m.requests:
            requests_list.append({
                "id": r.id,
                "mentorship_id": r.mentorship_id,
                "student_name": r.student_profile.user.name if r.student_profile and r.student_profile.user else "Student",
                "student_email": r.student_profile.user.email if r.student_profile and r.student_profile.user else "",
                "degree": r.student_profile.degree if r.student_profile else "",
                "institution": r.student_profile.institution if r.student_profile else "",
                "topic": r.topic,
                "message": r.message,
                "status": r.status,
                "requested_at": r.requested_at.isoformat() if r.requested_at else None
            })

    return {
        "success": True,
        "requests": requests_list,
        "mentorship_requests": requests_list,
        "offering": active_offering
    }

@router.get("/mentorship-offering")
async def get_academician_mentorship_offering(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(AcademicianProfile)
        .where(AcademicianProfile.user_id == current_user.id)
        .options(selectinload(AcademicianProfile.mentorships))
    )
    academician = p_res.scalar_one_or_none()
    if not academician:
        raise HTTPException(status_code=404, detail="Academician profile not found")

    mentorship = academician.mentorships[0] if academician.mentorships else None
    if not mentorship:
        mentorship = Mentorship(
            academician_profile_id=academician.id,
            expertise=academician.specialization or "Ayurvedic Clinical Guidance & Research Protocols",
            availability="3 hrs/week",
            bio=academician.bio or f"{academician.designation} at {academician.institution}."
        )
        db.add(mentorship)
        await db.commit()
        await db.refresh(mentorship)

    return {
        "success": True,
        "offering": {
            "id": mentorship.id,
            "expertise": mentorship.expertise,
            "availability": mentorship.availability,
            "bio": mentorship.bio
        }
    }

@router.put("/mentorship-offering")
async def update_academician_mentorship_offering(
    req: MentorshipOfferingUpdate,
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(
        select(AcademicianProfile)
        .where(AcademicianProfile.user_id == current_user.id)
        .options(selectinload(AcademicianProfile.mentorships))
    )
    academician = p_res.scalar_one_or_none()
    if not academician:
        raise HTTPException(status_code=404, detail="Academician profile not found")

    mentorship = academician.mentorships[0] if academician.mentorships else None
    if not mentorship:
        mentorship = Mentorship(
            academician_profile_id=academician.id,
            expertise=req.expertise or academician.specialization or "Ayurvedic Guidance",
            availability=req.availability or "3 hrs/week",
            bio=req.bio or f"{academician.designation} at {academician.institution}."
        )
        db.add(mentorship)
    else:
        if req.expertise is not None:
            mentorship.expertise = req.expertise
        if req.availability is not None:
            mentorship.availability = req.availability
        if req.bio is not None:
            mentorship.bio = req.bio

    await db.commit()
    return {
        "success": True,
        "message": "Mentorship offering updated successfully",
        "offering": {
            "id": mentorship.id,
            "expertise": mentorship.expertise,
            "availability": mentorship.availability,
            "bio": mentorship.bio
        }
    }

@router.get("/profile")
async def get_academician_profile(
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AcademicianProfile)
        .where(AcademicianProfile.user_id == current_user.id)
        .options(
            selectinload(AcademicianProfile.user),
            selectinload(AcademicianProfile.discipline)
        )
    )
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return {
        "id": profile.id,
        "name": profile.user.name if profile.user else current_user.name,
        "email": profile.user.email if profile.user else current_user.email,
        "institution": profile.institution,
        "designation": profile.designation,
        "department": profile.department,
        "specialization": profile.specialization,
        "discipline": profile.discipline.name if profile.discipline else "AYUSH",
        "experience_years": profile.experience_years,
        "bio": profile.bio
    }

@router.put("/profile")
async def update_academician_profile(
    req: AcademicianProfileUpdate,
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AcademicianProfile).where(AcademicianProfile.user_id == current_user.id)
    )
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    if req.designation is not None: profile.designation = req.designation
    if req.department is not None: profile.department = req.department
    if req.specialization is not None: profile.specialization = req.specialization
    if req.experience_years is not None: profile.experience_years = req.experience_years
    if req.bio is not None: profile.bio = req.bio

    await db.commit()
    return {"success": True, "message": "Profile updated successfully"}

@router.post("/mentorship-action")
async def handle_mentorship_action_post(
    req: MentorshipActionPost,
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    req_id = req.get_request_id()
    if not req_id:
        raise HTTPException(status_code=400, detail="requestId is required")

    res = await db.execute(
        select(MentorshipRequest)
        .where(MentorshipRequest.id == req_id)
        .options(
            selectinload(MentorshipRequest.student_profile).selectinload(StudentProfile.user)
        )
    )
    m_req = res.scalar_one_or_none()
    if not m_req:
        raise HTTPException(status_code=404, detail="Mentorship request not found")

    new_status = req.get_status()
    m_req.status = new_status

    # Notify student
    if m_req.student_profile and m_req.student_profile.user:
        notif = Notification(
            user_id=m_req.student_profile.user.id,
            title=f"Mentorship Request {new_status}! 🤝",
            message=f"{current_user.name} has {new_status.lower()} your mentorship request on '{m_req.topic}'.",
            type="MENTOR_RESPONSE",
            link="/student/mentorship"
        )
        db.add(notif)

    await db.commit()
    return {
        "success": True,
        "status": new_status,
        "request": {
            "id": m_req.id,
            "status": new_status
        },
        "message": f"Mentorship request marked as {new_status}"
    }

@router.put("/mentorship/{request_id}/action")
async def handle_mentorship_request(
    request_id: str,
    action_in: MentorshipAction,
    current_user: User = Depends(require_role(["ACADEMICIAN", "FACULTY"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(MentorshipRequest)
        .where(MentorshipRequest.id == request_id)
        .options(
            selectinload(MentorshipRequest.student_profile).selectinload(StudentProfile.user)
        )
    )
    m_req = res.scalar_one_or_none()
    if not m_req:
        raise HTTPException(status_code=404, detail="Mentorship request not found")

    action_val = action_in.action.upper()
    if action_val == "ACCEPT":
        m_req.status = "ACCEPTED"
    elif action_val == "DECLINE":
        m_req.status = "DECLINED"
    elif action_val == "COMPLETE":
        m_req.status = "COMPLETED"
    else:
        m_req.status = action_val

    # Notify student
    if m_req.student_profile and m_req.student_profile.user:
        notif = Notification(
            user_id=m_req.student_profile.user.id,
            title=f"Mentorship Request {m_req.status}! 🤝",
            message=f"{current_user.name} has {m_req.status.lower()} your mentorship request on '{m_req.topic}'.",
            type="MENTOR_RESPONSE",
            link="/student/mentorship"
        )
        db.add(notif)

    await db.commit()
    return {"success": True, "status": m_req.status, "message": f"Mentorship request marked as {m_req.status}"}
