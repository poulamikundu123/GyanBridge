from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, StudentProfile, IndustryProfile, AcademicianProfile, InstitutionProfile
from app.models.collaboration import Mentorship
from app.models.taxonomy import AyushDiscipline, Sector
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut, DemoLoginRequest
from app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    role = req.role.upper()
    if role == "FACULTY":
        role = "ACADEMICIAN"

    mode = req.get_mode()

    if mode == "FRESH":
        email_map = {
            "STUDENT": "fresh.student@demo.com",
            "INDUSTRY": "fresh.industry@demo.com",
            "ACADEMICIAN": "fresh.faculty@demo.com",
            "INSTITUTION": "fresh.institution@demo.com"
        }
        target_email = email_map.get(role, "fresh.student@demo.com")

        # Check if fresh user already exists
        res = await db.execute(select(User).where(User.email == target_email))
        user = res.scalar_one_or_none()

        if not user:
            # Create fresh demo user & clean profile
            pass_hash = get_password_hash("password123")
            d_res = await db.execute(select(AyushDiscipline).limit(1))
            disc = d_res.scalar_one_or_none()
            disc_id = disc.id if disc else "disc-ayu"

            if role == "STUDENT":
                user = User(email=target_email, password_hash=pass_hash, role="STUDENT", name="Priya Verma (Fresh)", phone="+91 9876500001")
                db.add(user)
                await db.flush()
                prof = StudentProfile(
                    user_id=user.id,
                    degree="BAMS",
                    institution="Government Ayurvedic Medical College",
                    current_year="1st Year",
                    graduation_year=2029,
                    cgpa=8.2,
                    ayush_discipline_id=disc_id,
                    readiness_score=0.0,
                    general_skill_score=0.0
                )
                db.add(prof)
            elif role == "INDUSTRY":
                s_res = await db.execute(select(Sector).limit(1))
                sec = s_res.scalar_one_or_none()
                sec_id = sec.id if sec else "sec-research"
                user = User(email=target_email, password_hash=pass_hash, role="INDUSTRY", name="Naveen Singhal (Fresh)", phone="+91 9811200002")
                db.add(user)
                await db.flush()
                prof = IndustryProfile(
                    user_id=user.id,
                    company_name="Charak Herbals R&D",
                    sector_id=sec_id,
                    description="Pioneering standardized phytopharmaceutical research and observational trials.",
                    location="Mumbai, India",
                    website="https://charakherbals.org"
                )
                db.add(prof)
            elif role in ["ACADEMICIAN", "FACULTY"]:
                user = User(email=target_email, password_hash=pass_hash, role="ACADEMICIAN", name="Dr. Anand Deshmukh (Fresh)", phone="+91 9833400003")
                db.add(user)
                await db.flush()
                prof = AcademicianProfile(
                    user_id=user.id,
                    institution="State Ayurvedic College & Hospital, Lucknow",
                    designation="Assistant Professor",
                    department="Kayachikitsa",
                    specialization="Integrative Internal Medicine",
                    experience_years=4,
                    ayush_discipline_id=disc_id
                )
                db.add(prof)
                await db.flush()
                m = Mentorship(
                    academician_profile_id=prof.id,
                    expertise="Integrative Internal Medicine, Kayachikitsa Protocols",
                    availability="2 hrs/week",
                    bio="Assistant Professor guiding students in clinical case studies and clinical protocols."
                )
                db.add(m)
            elif role == "INSTITUTION":
                user = User(email=target_email, password_hash=pass_hash, role="INSTITUTION", name="Kerala AYUSH Admin (Fresh)", phone="+91 9845000004")
                db.add(user)
                await db.flush()
                prof = InstitutionProfile(
                    user_id=user.id,
                    institution_name="Kerala Institute of AYUSH Research & Academics",
                    code="KIARA-2026",
                    state="Kerala",
                    city="Thiruvananthapuram",
                    institution_type="STATE_AYUSH"
                )
                db.add(prof)
            await db.commit()
    else:
        email_map = {
            "STUDENT": "student@demo.com",
            "INDUSTRY": "industry@demo.com",
            "ACADEMICIAN": "faculty@demo.com",
            "INSTITUTION": "admin@demo.com"
        }
        target_email = email_map.get(role, "student@demo.com")

        res = await db.execute(select(User).where(User.email == target_email))
        user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail=f"Demo user for role {role} not found")

    profile_id = None
    redirect_url = "/student/dashboard"

    if user.role == "STUDENT":
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/student/dashboard"
    elif user.role == "INDUSTRY":
        p_res = await db.execute(select(IndustryProfile).where(IndustryProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/industry/dashboard"
    elif user.role in ["ACADEMICIAN", "FACULTY"]:
        p_res = await db.execute(select(AcademicianProfile).where(AcademicianProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/faculty/dashboard"
    elif user.role == "INSTITUTION":
        p_res = await db.execute(select(InstitutionProfile).where(InstitutionProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/institution/dashboard"

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role, "profileId": profile_id}
    )

    user_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "profileId": profile_id,
        "profile_id": profile_id
    }

    response.set_cookie(
        key="ayush_session_token",
        value=access_token,
        path="/",
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return TokenResponse(
        success=True,
        access_token=access_token,
        token=access_token,
        role=user.role,
        user_id=user.id,
        name=user.name,
        profile_id=profile_id,
        redirect_url=redirect_url,
        redirectUrl=redirect_url,
        user=user_payload
    )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="ayush_session_token", path="/")
    return {"success": True, "message": "Logged out successfully"}

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    profile_id = None
    redirect_url = "/student/dashboard"

    if user.role == "STUDENT":
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/student/dashboard"
    elif user.role == "INDUSTRY":
        p_res = await db.execute(select(IndustryProfile).where(IndustryProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/industry/dashboard"
    elif user.role in ["ACADEMICIAN", "FACULTY"]:
        p_res = await db.execute(select(AcademicianProfile).where(AcademicianProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/faculty/dashboard"
    elif user.role == "INSTITUTION":
        p_res = await db.execute(select(InstitutionProfile).where(InstitutionProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p: profile_id = p.id
        redirect_url = "/institution/dashboard"

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role, "profileId": profile_id}
    )

    user_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "profileId": profile_id,
        "profile_id": profile_id
    }

    response.set_cookie(
        key="ayush_session_token",
        value=access_token,
        path="/",
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return TokenResponse(
        success=True,
        access_token=access_token,
        token=access_token,
        role=user.role,
        user_id=user.id,
        name=user.name,
        profile_id=profile_id,
        redirect_url=redirect_url,
        redirectUrl=redirect_url,
        user=user_payload
    )

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Normalize role
    role = req.role.upper()
    if role == "FACULTY":
        role = "ACADEMICIAN"

    # Create User
    new_user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=role,
        name=req.name,
        phone=req.phone
    )
    db.add(new_user)
    await db.flush()

    profile_id = None
    redirect_url = "/student/dashboard"

    # Create matching Profile
    if role == "STUDENT":
        # Resolve discipline dynamically by id or name
        disc_id = req.ayush_discipline_id
        if not disc_id and req.discipline_name:
            d_lookup = await db.execute(
                select(AyushDiscipline).where(
                    or_(
                        AyushDiscipline.name.ilike(f"%{req.discipline_name}%"),
                        AyushDiscipline.id == req.discipline_name
                    )
                ).limit(1)
            )
            found_disc = d_lookup.scalar_one_or_none()
            if found_disc:
                disc_id = found_disc.id

        if not disc_id:
            d_res = await db.execute(select(AyushDiscipline).limit(1))
            disc = d_res.scalar_one_or_none()
            disc_id = disc.id if disc else "disc-ayu"

        student_prof = StudentProfile(
            user_id=new_user.id,
            degree=req.degree or "BAMS",
            institution=req.institution or "Government Ayurvedic Medical College",
            current_year=req.get_current_year(),
            graduation_year=req.get_graduation_year(),
            ayush_discipline_id=disc_id,
            target_career_role_id=req.target_career_role_id
        )
        db.add(student_prof)
        await db.flush()
        profile_id = student_prof.id
        redirect_url = "/student/dashboard"

    elif role == "INDUSTRY":
        # Resolve sector dynamically by id or name
        sec_id = req.sector_id
        if not sec_id and req.sector_name:
            s_lookup = await db.execute(
                select(Sector).where(
                    or_(
                        Sector.name.ilike(f"%{req.sector_name}%"),
                        Sector.id == req.sector_name
                    )
                ).limit(1)
            )
            found_sec = s_lookup.scalar_one_or_none()
            if found_sec:
                sec_id = found_sec.id

        if not sec_id:
            s_res = await db.execute(select(Sector).limit(1))
            sec = s_res.scalar_one_or_none()
            sec_id = sec.id if sec else "sec-research"

        ind_prof = IndustryProfile(
            user_id=new_user.id,
            company_name=req.get_company_name(),
            sector_id=sec_id,
            description=req.description or "AYUSH Healthcare & Pharmaceutical Organization",
            location=req.location or "New Delhi, India",
            website=req.website
        )
        db.add(ind_prof)
        await db.flush()
        profile_id = ind_prof.id
        redirect_url = "/industry/dashboard"

    elif role in ["ACADEMICIAN", "FACULTY"]:
        disc_id = req.ayush_discipline_id
        if not disc_id and req.discipline_name:
            d_lookup = await db.execute(
                select(AyushDiscipline).where(
                    or_(
                        AyushDiscipline.name.ilike(f"%{req.discipline_name}%"),
                        AyushDiscipline.id == req.discipline_name
                    )
                ).limit(1)
            )
            found_disc = d_lookup.scalar_one_or_none()
            if found_disc:
                disc_id = found_disc.id

        if not disc_id:
            d_res = await db.execute(select(AyushDiscipline).limit(1))
            disc = d_res.scalar_one_or_none()
            disc_id = disc.id if disc else "disc-ayu"

        acad_prof = AcademicianProfile(
            user_id=new_user.id,
            institution=req.institution or "All India Institute of Ayurveda",
            designation=req.designation or "Assistant Professor",
            department=req.department or "Dravyaguna & Clinical Research",
            specialization=req.specialization or "Herbal Pharmacology",
            ayush_discipline_id=disc_id,
            experience_years=int(req.experience_years or 5)
        )
        db.add(acad_prof)
        await db.flush()
        profile_id = acad_prof.id
        redirect_url = "/faculty/dashboard"

        # Automatically create initial Mentorship offering for student discovery
        mentorship = Mentorship(
            academician_profile_id=acad_prof.id,
            expertise=acad_prof.specialization or "AYUSH Clinical & Research Guidance",
            availability="3 hrs/week",
            bio=f"{acad_prof.designation} in {acad_prof.department} at {acad_prof.institution}. Open to guide student research, thesis protocols, and clinical cases."
        )
        db.add(mentorship)

    elif role == "INSTITUTION":
        inst_name = req.get_institution_name()
        inst_prof = InstitutionProfile(
            user_id=new_user.id,
            institution_name=inst_name,
            code=f"INST-{new_user.id[:6].upper()}",
            state=req.state or "Delhi",
            city=req.city or "New Delhi",
            institution_type=req.institution_type or "STATE_AYUSH"
        )
        db.add(inst_prof)
        await db.flush()
        profile_id = inst_prof.id
        redirect_url = "/institution/dashboard"

    access_token = create_access_token(
        data={"sub": new_user.id, "email": new_user.email, "role": role, "profileId": profile_id}
    )

    user_payload = {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": role,
        "profileId": profile_id,
        "profile_id": profile_id
    }

    response.set_cookie(
        key="ayush_session_token",
        value=access_token,
        path="/",
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return TokenResponse(
        success=True,
        access_token=access_token,
        token=access_token,
        role=role,
        user_id=new_user.id,
        name=new_user.name,
        profile_id=profile_id,
        redirect_url=redirect_url,
        redirectUrl=redirect_url,
        user=user_payload
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_id = None
    if current_user.role == "STUDENT":
        p_res = await db.execute(select(StudentProfile.id).where(StudentProfile.user_id == current_user.id))
        profile_id = p_res.scalar_one_or_none()
    elif current_user.role == "INDUSTRY":
        p_res = await db.execute(select(IndustryProfile.id).where(IndustryProfile.user_id == current_user.id))
        profile_id = p_res.scalar_one_or_none()
    elif current_user.role in ["ACADEMICIAN", "FACULTY"]:
        p_res = await db.execute(select(AcademicianProfile.id).where(AcademicianProfile.user_id == current_user.id))
        profile_id = p_res.scalar_one_or_none()
    elif current_user.role == "INSTITUTION":
        p_res = await db.execute(select(InstitutionProfile.id).where(InstitutionProfile.user_id == current_user.id))
        profile_id = p_res.scalar_one_or_none()

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        name=current_user.name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        profile_id=profile_id
    )
