import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.services.auth_service import get_password_hash
from app.models.user import User, StudentProfile, IndustryProfile, AcademicianProfile, InstitutionProfile
from app.models.taxonomy import AyushDiscipline, Sector, SkillCategory, Skill
from app.models.career import CareerRole, CareerRoleSkill, StudentSkill
from app.models.opportunity import Opportunity, OpportunitySkill
from app.models.collaboration import Mentorship, CollaborationProject
from app.models.portfolio import Education, Project, Certification
from app.models.training import TrainingProgram, TrainingSkill, TrainingEnrollment

async def seed_database(force_reset: bool = False):
    async with engine.begin() as conn:
        if force_reset:
            await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        if not force_reset:
            # Check if already seeded
            u_check = await db.execute(select(User).limit(1))
            if u_check.scalar_one_or_none():
                await seed_training_and_mentorship(db)
                print("Database already contains core data, verified auxiliary data.")
                return

        print("Seeding AYUSHAI database with canonical ACADEMICIAN role and domain data...")

        # 1. AYUSH Disciplines
        disciplines = [
            AyushDiscipline(id="disc-ayu", name="Ayurveda", code="AYU", description="Classical Ayurvedic Medicine and Surgery (BAMS, MD/MS AYUSH)"),
            AyushDiscipline(id="disc-yog", name="Yoga & Naturopathy", code="YOG", description="Yoga therapy, Naturopathy and lifestyle medicine (BNYS)"),
            AyushDiscipline(id="disc-una", name="Unani", code="UNA", description="Unani Tibb medicine and herbal therapeutics (BUMS)"),
            AyushDiscipline(id="disc-sid", name="Siddha", code="SID", description="Siddha traditional medicine and mineral-herb formulations (BSMS)"),
            AyushDiscipline(id="disc-hom", name="Homoeopathy", code="HOM", description="Classical Homoeopathic medicine and practice (BHMS)"),
            AyushDiscipline(id="disc-cro", name="Cross-disciplinary AYUSH", code="CRO", description="Integrative AYUSH medicine, pharmacology and health tech")
        ]
        db.add_all(disciplines)
        await db.flush()

        # 2. Sectors
        sectors = [
            Sector(id="sec-clinical", name="Clinical Healthcare & Hospitals", code="CHC", description="Hospitals, integrative wellness clinics, Panchakarma centers"),
            Sector(id="sec-research", name="Clinical Research & Observational Trials", code="CRO", description="Clinical trial protocols, GCP compliance, CTRI documentation"),
            Sector(id="sec-pharma", name="AYUSH Pharmaceuticals & Phytochemistry", code="APP", description="Standardization, drug formulation, GMP, pharmacopoeia"),
            Sector(id="sec-wellness", name="Preventive Wellness & Public Health", code="PWP", description="Ayush wellness retreats, lifestyle guidance, public initiatives")
        ]
        db.add_all(sectors)
        await db.flush()

        # 3. Skill Categories
        categories = [
            SkillCategory(id="cat-clinical", name="Clinical & Diagnostics", code="CLN", description="Clinical examination, pulse diagnosis, Panchakarma"),
            SkillCategory(id="cat-pharma", name="Pharma & Standardization", code="PHM", description="Herbal formulation, HPLC, HPTLC, GMP"),
            SkillCategory(id="cat-research", name="Research & Regulatory", code="RES", description="ICH-GCP, trial design, CTRI, pharmacovigilance"),
            SkillCategory(id="cat-soft", name="Professional & Communication", code="SFT", description="Patient counseling, medical writing, ethics")
        ]
        db.add_all(categories)
        await db.flush()

        # 4. Skills
        skills = [
            Skill(id="sk-panchakarma", name="Panchakarma Protocol Administration", category_id="cat-clinical", description="Vamana, Virechana, Basti, Nasya, Raktamokshana protocols"),
            Skill(id="sk-gcp", name="Good Clinical Practice (AYUSH-GCP)", category_id="cat-research", description="Ethical clinical trials, CRF documentation, safety reporting"),
            Skill(id="sk-pharmacovig", name="Pharmacovigilance for AYUSH", category_id="cat-research", description="Adverse Drug Reaction (ADR) detection, causality assessment"),
            Skill(id="sk-dravyaguna", name="Dravyaguna (Herbal Pharmacology)", category_id="cat-pharma", description="Herbal identification, active phytoconstituents, synergy"),
            Skill(id="sk-hptlc", name="HPTLC Fingerprinting & Standardization", category_id="cat-pharma", description="Quality control, marker compound quantification, TLC plates"),
            Skill(id="sk-pharmacopoeia", name="Ayurvedic Pharmacopoeia Compliance", category_id="cat-pharma", description="API monograph standards, heavy metal and pesticide testing"),
            Skill(id="sk-patient-diag", name="Prakriti & Rogi Pariksha Diagnostics", category_id="cat-clinical", description="Nadi, tongue, constitutional clinical examination"),
            Skill(id="sk-counseling", name="Patient Consultation & Lifestyle Counseling", category_id="cat-soft", description="Empathetic dietary (Ahara) and lifestyle (Vihara) guidance")
        ]
        db.add_all(skills)
        await db.flush()

        # 5. Career Roles
        career_roles = [
            CareerRole(
                id="role-cra",
                title="Clinical Research Associate (AYUSH Trials)",
                sector_id="sec-research",
                discipline_id="disc-ayu",
                description="Monitors and documents human observational and randomized clinical trials for AYUSH formulations.",
                min_education="BAMS, BHMS, or MSc Pharmacology",
                average_salary="₹6,00,000 - ₹9,50,000",
                demand_level="VERY_HIGH"
            ),
            CareerRole(
                id="role-physician",
                title="Consultant Ayurveda Physician",
                sector_id="sec-clinical",
                discipline_id="disc-ayu",
                description="Provides integrative clinical diagnostics, personalized treatment protocols, and Panchakarma therapies.",
                min_education="BAMS or MD (Ayurveda)",
                average_salary="₹7,00,000 - ₹12,00,000",
                demand_level="HIGH"
            ),
            CareerRole(
                id="role-formulation",
                title="Herbal Formulation & Standardization Scientist",
                sector_id="sec-pharma",
                discipline_id="disc-ayu",
                description="Develops standardized extracts, tablet/syrup dosage forms, and validates quality using analytical instruments.",
                min_education="BAMS, B.Pharm (Ayurveda), or M.Pharm",
                average_salary="₹6,50,000 - ₹10,50,000",
                demand_level="HIGH"
            )
        ]
        db.add_all(career_roles)
        await db.flush()

        # Benchmark Skills for Clinical Research Associate
        role_skills = [
            CareerRoleSkill(career_role_id="role-cra", skill_id="sk-gcp", required_proficiency=85.0, is_mandatory=True, weight=1.5),
            CareerRoleSkill(career_role_id="role-cra", skill_id="sk-pharmacovig", required_proficiency=80.0, is_mandatory=True, weight=1.4),
            CareerRoleSkill(career_role_id="role-cra", skill_id="sk-dravyaguna", required_proficiency=75.0, is_mandatory=False, weight=1.0),
            CareerRoleSkill(career_role_id="role-cra", skill_id="sk-counseling", required_proficiency=70.0, is_mandatory=False, weight=0.8)
        ]
        db.add_all(role_skills)
        await db.flush()

        # 6. Pre-seeded Users (All 4 Canonical Roles)
        pass_hash = get_password_hash("password123")

        # Student User
        u_student = User(id="user-student-1", email="student@demo.com", password_hash=pass_hash, role="STUDENT", name="Aarav Sharma", phone="+91 9876543210")
        db.add(u_student)
        await db.flush()

        p_student = StudentProfile(
            id="prof-student-1",
            user_id=u_student.id,
            degree="BAMS",
            institution="All India Institute of Ayurveda, New Delhi",
            current_year="Final Year",
            graduation_year=2026,
            cgpa=8.8,
            ayush_discipline_id="disc-ayu",
            target_career_role_id="role-cra",
            bio="BAMS Final Year scholar passionate about integrative clinical research and herbal standardization.",
            preferred_work_mode="HYBRID",
            readiness_score=84.5,
            general_skill_score=82.0
        )
        db.add(p_student)
        await db.flush()

        # Student Skills
        st_skills = [
            StudentSkill(student_profile_id=p_student.id, skill_id="sk-gcp", proficiency_score=85.0, verification_level="ASSESSMENT_VERIFIED", source="Standardized Assessment"),
            StudentSkill(student_profile_id=p_student.id, skill_id="sk-panchakarma", proficiency_score=90.0, verification_level="INDUSTRY_VERIFIED", source="AIIA Clinical Internship"),
            StudentSkill(student_profile_id=p_student.id, skill_id="sk-dravyaguna", proficiency_score=78.0, verification_level="ASSESSMENT_VERIFIED", source="Standardized Assessment"),
            StudentSkill(student_profile_id=p_student.id, skill_id="sk-pharmacovig", proficiency_score=65.0, verification_level="SELF_REPORTED", source="Coursework")
        ]
        db.add_all(st_skills)

        # Student Education & Project
        db.add(Education(student_profile_id=p_student.id, degree="Bachelor of Ayurvedic Medicine and Surgery (BAMS)", institution="All India Institute of Ayurveda", field_of_study="Ayurveda & Surgery", start_year=2021, end_year=2026, score="8.8 CGPA"))
        db.add(Project(student_profile_id=p_student.id, title="Standardization of Ashwagandha Formulations via HPTLC", description="Conducted qualitative marker verification and clinical safety monitoring.", skills_used="HPTLC, Dravyaguna, GCP", role="Lead Student Researcher", duration="6 Months", organization="AIIA Research Wing"))

        # Industry User
        u_industry = User(id="user-industry-1", email="industry@demo.com", password_hash=pass_hash, role="INDUSTRY", name="Dr. Vikram Mehta", phone="+91 9811223344")
        db.add(u_industry)
        await db.flush()

        p_industry = IndustryProfile(
            id="prof-industry-1",
            user_id=u_industry.id,
            company_name="Ayur Research Labs Ltd.",
            sector_id="sec-research",
            description="Leading AYUSH clinical research organization specialized in human observational trials and herbal phytochemistry.",
            location="New Delhi, India",
            website="https://ayurresearchlabs.org"
        )
        db.add(p_industry)
        await db.flush()

        # Academician User (Canonical Role)
        u_academician = User(id="user-acad-1", email="faculty@demo.com", password_hash=pass_hash, role="ACADEMICIAN", name="Dr. Rajeshwari Joshi", phone="+91 9899001122")
        db.add(u_academician)
        await db.flush()

        p_academician = AcademicianProfile(
            id="prof-acad-1",
            user_id=u_academician.id,
            institution="All India Institute of Ayurveda",
            designation="Associate Professor",
            department="Dravyaguna & Clinical Research",
            specialization="Herbal Pharmacology & Clinical Protocols",
            ayush_discipline_id="disc-ayu",
            experience_years=8,
            bio="Senior faculty researcher at AIIA focusing on pharmacopoeial standardization and academic-industry linkages."
        )
        db.add(p_academician)
        await db.flush()

        # Academician Mentorship
        db.add(Mentorship(academician_profile_id=p_academician.id, expertise="Ayurvedic Clinical Trials, Dravyaguna Standardization, CTRI Protocols", availability="3 hrs/week", bio="Mentoring students in trial documentation and regulatory compliance."))

        # Institution User
        u_institution = User(id="user-inst-1", email="admin@demo.com", password_hash=pass_hash, role="INSTITUTION", name="Prof. S. N. Shastri", phone="+91 9871100220")
        db.add(u_institution)
        await db.flush()

        p_institution = InstitutionProfile(
            id="prof-inst-1",
            user_id=u_institution.id,
            institution_name="All India Institute of Ayurveda (AIIA)",
            code="AIIA-ND-001",
            state="Delhi",
            city="New Delhi",
            institution_type="CENTRAL_UNIVERSITY"
        )
        db.add(p_institution)
        await db.flush()

        # 7. Active Opportunities (Internships, Jobs & FDPs)
        opp_intern = Opportunity(
            id="opp-1",
            industry_profile_id=p_industry.id,
            title="Clinical Trial Research Intern",
            opportunity_type="INTERNSHIP",
            description="Assist senior clinical investigators in Case Report Form (CRF) auditing, patient vitals logging, and GCP compliance.",
            sector_id="sec-research",
            discipline_id="disc-ayu",
            eligibility_degree="BAMS Final Year or Intern",
            location="New Delhi, India",
            work_mode="HYBRID",
            duration="6 Months",
            stipend_salary="₹25,000 / month",
            deadline=datetime.utcnow() + timedelta(days=45),
            status="ACTIVE"
        )
        db.add(opp_intern)
        await db.flush()

        db.add(OpportunitySkill(opportunity_id=opp_intern.id, skill_id="sk-gcp", required_proficiency=80.0, is_mandatory=True, weight=1.5))
        db.add(OpportunitySkill(opportunity_id=opp_intern.id, skill_id="sk-pharmacovig", required_proficiency=70.0, is_mandatory=True, weight=1.2))

        opp_fdp = Opportunity(
            id="opp-2",
            industry_profile_id=p_industry.id,
            title="Faculty Industry Immersion Program: HPLC & HPTLC",
            opportunity_type="FACULTY_INTERNSHIP",
            description="Hands-on 2-week industrial training module for AYUSH academicians on high-throughput analytical chromatography.",
            sector_id="sec-pharma",
            discipline_id="disc-ayu",
            eligibility_degree="Faculty / Assistant Professors in AYUSH",
            location="Gurugram R&D Center",
            work_mode="ONSITE",
            duration="2 Weeks",
            stipend_salary="Fully Sponsored + Honorarium",
            deadline=datetime.utcnow() + timedelta(days=60),
            status="ACTIVE"
        )
        db.add(opp_fdp)

        # 8. Assessments are dynamically generated on-demand by the AI Assessment Engine
        # (Zero hardcoded static questions; evaluated against live jobs & statutory standards)

        # 9. Collaborative Research Project
        db.add(CollaborationProject(
            creator_user_id=u_academician.id,
            title="Development of Pharmacopoeial Standards for Classical Rasayana Herbs",
            description="Joint R&D initiative between All India Institute of Ayurveda and Ayur Research Labs to standardize active biomarker thresholds.",
            project_type="RESEARCH_COLLABORATION",
            discipline_id="disc-ayu",
            seeking_types="Industry R&D Labs, Phytochemists, Ph.D. Scholars",
            required_areas="HPTLC, Phytochemistry, Heavy Metal Profiling",
            status="OPEN"
        ))

        # 10. Training Programs & Mentorship
        await seed_training_and_mentorship(db)

        await db.commit()
        print("Database seeded successfully with all 4 canonical roles, AYUSH taxonomy, and demo accounts!")

async def seed_training_and_mentorship(db):
    tp_res = await db.execute(select(TrainingProgram).limit(1))
    if not tp_res.scalar_one_or_none():
        ind_res = await db.execute(select(IndustryProfile).limit(1))
        ind_prof = ind_res.scalar_one_or_none()
        ind_id = ind_prof.id if ind_prof else None

        tp1 = TrainingProgram(
            id="prog-gcp",
            industry_profile_id=ind_id,
            provider_name="All India Institute of Ayurveda & CCRAS",
            title="AYUSH Good Clinical Practice & Regulatory Clinical Trials",
            description="Comprehensive certification covering clinical protocol design, ethics committee approvals, and adverse drug reaction reporting.",
            category="CLINICAL_RESEARCH",
            duration_hours=30,
            mode="ONLINE",
            certificate_provided=True,
            level="INTERMEDIATE",
            syllabus="Module 1: AYUSH-GCP Guidelines\nModule 2: Informed Consent & Ethical Standards\nModule 3: Serious Adverse Event (SAE) Audit Trail",
            external_link="https://ayush-training.gov.in/courses/gcp-cert"
        )
        tp2 = TrainingProgram(
            id="prog-qc",
            industry_profile_id=ind_id,
            provider_name="Dabur Research & Development Center",
            title="Herbal Raw Material Quality Control & HPTLC Fingerprinting",
            description="Practical industrial training on phytochemical authentication, fingerprinting, and heavy metal testing per Ayurvedic Pharmacopoeia of India.",
            category="PHARMACOGNOSY",
            duration_hours=40,
            mode="HYBRID",
            certificate_provided=True,
            level="ADVANCED",
            syllabus="Module 1: Pharmacognostical Evaluation\nModule 2: High Performance Thin Layer Chromatography (HPTLC)\nModule 3: Contaminant & Microbial Limit Testing",
            external_link="https://ayush-training.gov.in/courses/hptlc-qc"
        )
        tp3 = TrainingProgram(
            id="prog-form",
            industry_profile_id=ind_id,
            provider_name="Charak Pharma R&D Division",
            title="Standardization & Quality Assurance of Ayurvedic Formulations",
            description="End-to-end industrial methods for Asava, Arishta, Vati, and Bhasma standardization per WHO guidelines for herbal medicines.",
            category="FORMULATION_QA",
            duration_hours=35,
            mode="ONLINE",
            certificate_provided=True,
            level="INTERMEDIATE",
            syllabus="Module 1: Good Manufacturing Practices (Schedule T)\nModule 2: Classical Formulations vs Modern QC\nModule 3: Stability Studies & Shelf-Life Determination",
            external_link="https://ayush-training.gov.in/courses/ayush-qa"
        )
        db.add_all([tp1, tp2, tp3])
        await db.flush()

        db.add_all([
            TrainingSkill(training_program_id="prog-gcp", skill_id="sk-gcp", proficiency_gain=30.0),
            TrainingSkill(training_program_id="prog-gcp", skill_id="sk-pharmacovig", proficiency_gain=25.0),
            TrainingSkill(training_program_id="prog-qc", skill_id="sk-hptlc", proficiency_gain=35.0),
            TrainingSkill(training_program_id="prog-qc", skill_id="sk-herbal-std", proficiency_gain=30.0),
            TrainingSkill(training_program_id="prog-form", skill_id="sk-herbal-std", proficiency_gain=25.0),
            TrainingSkill(training_program_id="prog-form", skill_id="sk-gcp", proficiency_gain=15.0)
        ])
        await db.commit()
        print("Seeded 3 Training Programs with mapped skills!")

    m_res = await db.execute(select(Mentorship).limit(1))
    if not m_res.scalar_one_or_none():
        acad_res = await db.execute(select(AcademicianProfile).limit(1))
        acad = acad_res.scalar_one_or_none()
        if acad:
            m1 = Mentorship(
                id="ment-1",
                academician_profile_id=acad.id,
                expertise="Clinical Protocol Design, Dravyaguna & Ayurvedic Clinical Trials",
                availability="3 hrs / week (Weekends & Evenings)",
                bio="Associate Professor with over a decade of experience guiding postgraduate scholars and junior researchers in clinical trials and pharmacology."
            )
            db.add(m1)
            await db.commit()
            print("Seeded Faculty Mentorship profile!")

if __name__ == "__main__":
    asyncio.run(seed_database())
