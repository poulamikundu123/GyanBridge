import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, StudentProfile
from app.models.career import CareerRole, CareerRoleSkill
from app.models.taxonomy import Skill
from app.models.resume import Resume, ResumeSkillAnalysis, ResumeRecommendation, ResumeBullet
from app.schemas.resume import ATSAnalysisOut, BulletActionIn
from app.services.auth_service import require_role
from app.services.ai_resume_engine import extract_text_from_file, analyze_resume_text

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])

@router.post("/upload-and-analyze")
@router.post("/upload")
@router.post("/analyze")
async def upload_and_analyze_resume(
    request: Request,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch student
    p_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(selectinload(StudentProfile.target_career_role))
    )
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    content_type = request.headers.get("content-type", "")
    filename = "resume.pdf"
    file_bytes = b""
    raw_text_input = None
    career_role_id = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            if body.get("action") == "LOAD_DEMO_RESUME":
                filename = "Sample_AYUSH_Clinical_Research_Resume.pdf"
                raw_text_input = (
                    f"AYUSH Professional Profile for {current_user.name}\n"
                    f"Completed BAMS degree with coursework in Clinical Research, Pharmacovigilance, and AYUSH GCP guidelines.\n"
                    f"Conducted botanical drug standardisation and documented therapeutic Panchakarma interventions.\n"
                    f"Administered classical Panchakarma detoxification protocols for 45+ patients in compliance with Ayush SOPs, achieving a 92% symptom relief index.\n"
                    f"Coordinated Phase II clinical trial monitoring and documented patient Case Report Forms (CRFs) in strict adherence to ICH-GCP and CTRI standards.\n"
                    f"Standardized 8 polyherbal formulations using HPTLC fingerprinting and organoleptic testing, reducing batch-to-batch variance by 18%.\n"
                    f"Evaluated Prakriti constitution and diagnostic biomarkers for 120+ clinical outpatients, designing personalized lifestyle and herbal treatment regimens.\n"
                    f"Skills: Good Clinical Practice, GCP, AYUSH GMP, Pharmacovigilance, Dravyaguna, Panchakarma, Clinical Data Management, HPTLC, Clinical Trials, CTRI, Herbal Standardization."
                )
            else:
                raw_text_input = body.get("raw_text_input") or body.get("rawText")
                career_role_id = body.get("career_role_id") or body.get("careerRoleId")
        except Exception:
            pass
    elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        try:
            form = await request.form()
            uploaded_file = form.get("file")
            if uploaded_file and hasattr(uploaded_file, "filename") and uploaded_file.filename:
                filename = uploaded_file.filename
                file_bytes = await uploaded_file.read()
            raw_text_input = form.get("raw_text_input") or form.get("rawText")
            career_role_id = form.get("career_role_id") or form.get("careerRoleId")
        except Exception:
            pass

    target_role_id = career_role_id or student.target_career_role_id
    target_role_title = "Clinical Research Associate (AYUSH Trials)"

    # Fetch required skills for target role
    required_skills = []
    if target_role_id:
        cr_res = await db.execute(select(CareerRole).where(CareerRole.id == target_role_id))
        cr = cr_res.scalar_one_or_none()
        if cr:
            target_role_title = cr.title

        crs_res = await db.execute(
            select(CareerRoleSkill)
            .where(CareerRoleSkill.career_role_id == target_role_id)
            .options(selectinload(CareerRoleSkill.skill))
        )
        required_skills = [
            {"skill_name": item.skill.name, "category_name": "Clinical Practice"}
            for item in crs_res.scalars().all()
            if item.skill
        ]

    # Read and parse file
    if file_bytes:
        raw_text = extract_text_from_file(file_bytes, filename)
    else:
        raw_text = raw_text_input or ""

    if not raw_text or len(raw_text.strip()) < 20:
        raw_text = (
            f"AYUSH Professional Profile for {current_user.name}\n"
            f"Completed BAMS degree with coursework in Clinical Research, Pharmacovigilance, and AYUSH GCP guidelines.\n"
            f"Conducted botanical drug standardisation and documented therapeutic Panchakarma interventions."
        )

    # Analyze resume using AI resume engine (Gemini 2.5 Flash with procedural fallback)
    analysis = await analyze_resume_text(raw_text, target_role_title, required_skills)

    # Save Bullets temporarily to assign IDs
    bullets_out = []
    for b in analysis["bullet_improvements"]:
        bullets_out.append({
            "originalText": b["original_text"],
            "original_text": b["original_text"],
            "improvedText": b["improved_text"],
            "improved_text": b["improved_text"],
            "explanation": b.get("explanation", "ATS optimized formatting with active leadership verb."),
            "status": "PENDING"
        })

    # Prepare Skill Alignments without contradictory fallback evidence
    skill_alignments = []
    for idx, s in enumerate(analysis.get("detected_skills", [])):
        status_val = s.get("status", "NOT_FOUND")
        ev = s.get("evidence")
        if not ev:
            if status_val == "DEMONSTRATED":
                ev = f"Demonstrated background matching '{s.get('skill_name')}' on resume."
            elif status_val == "PARTIALLY_DEMONSTRATED":
                ev = f"Related or foundational terminology matching '{s.get('skill_name')}' identified."
            else:
                ev = f"No direct evidence detected on resume for '{s.get('skill_name')}'."

        skill_alignments.append({
            "skillId": f"sk-{idx}",
            "skillName": s.get("skill_name", ""),
            "categoryName": s.get("category", "Clinical Practice"),
            "isMandatory": True,
            "requiredProficiency": 80,
            "status": status_val,
            "evidence": ev,
            "confidence": 0.92
        })

    # Prepare Present & Missing Keywords
    present_kw = analysis.get("present_keywords", [])
    if not present_kw:
        present_kw = [s["skill_name"] for s in analysis.get("detected_skills", []) if s.get("status") == "DEMONSTRATED"]

    missing_kw = analysis.get("missing_keywords", [])

    # Format Recommendations
    recommendations_out = []
    for r in analysis.get("recommendations", []):
        if isinstance(r, dict):
            recommendations_out.append({
                "category": r.get("category", "SKILLS"),
                "recommendation": r.get("recommendation", ""),
                "priority": r.get("priority", "HIGH")
            })
        elif isinstance(r, str):
            recommendations_out.append({
                "category": "SKILLS",
                "recommendation": r,
                "priority": "HIGH"
            })

    analysis_obj = {
        "overallScore": analysis["alignment_score"],
        "alignment_score": analysis["alignment_score"],
        "careerGoalTitle": target_role_title,
        "targetRole": target_role_title,
        "scoreBreakdown": analysis.get("score_breakdown", {
            "keywordAlignment": min(100, int(analysis["alignment_score"] * 0.95)),
            "skillCoverage": min(100, int(analysis["alignment_score"] * 0.9)),
            "experienceRelevance": min(100, int(analysis["alignment_score"] * 0.88)),
            "educationRelevance": 95,
            "resumeStructure": 90,
            "bulletQuality": 85
        }),
        "skillAlignments": skill_alignments,
        "keywordReport": {
            "presentKeywords": present_kw,
            "missingKeywords": missing_kw
        },
        "detectedCandidateSkills": analysis.get("detected_candidate_skills", []),
        "recommendations": recommendations_out,
        "improvedBullets": bullets_out
    }

    # Save Resume Record
    resume_record = Resume(
        student_id=student.id,
        career_role_id=target_role_id,
        file_name=filename,
        file_type=filename.split(".")[-1].lower() if "." in filename else "pdf",
        file_size=len(file_bytes) if file_bytes else len(raw_text),
        raw_text=raw_text[:2000],
        alignment_score=analysis["alignment_score"],
        parsed_data_json=json.dumps(analysis_obj),
        status="ANALYZED"
    )
    db.add(resume_record)
    await db.flush()

    # Save Recommendations to DB
    for rec in recommendations_out:
        db.add(ResumeRecommendation(
            resume_id=resume_record.id,
            category=rec.get("category", "SKILLS"),
            recommendation=rec.get("recommendation", ""),
            priority=rec.get("priority", "HIGH")
        ))

    # Save Bullets to DB and attach IDs
    saved_bullets = []
    for b in bullets_out:
        bullet_record = ResumeBullet(
            resume_id=resume_record.id,
            original_text=b["original_text"],
            improved_text=b["improved_text"],
            explanation=b["explanation"],
            status="PENDING"
        )
        db.add(bullet_record)
        await db.flush()
        saved_bullets.append({
            "id": bullet_record.id,
            "originalText": bullet_record.original_text,
            "original_text": bullet_record.original_text,
            "improvedText": bullet_record.improved_text,
            "improved_text": bullet_record.improved_text,
            "explanation": bullet_record.explanation,
            "status": "PENDING"
        })

    analysis_obj["improvedBullets"] = saved_bullets
    resume_record.parsed_data_json = json.dumps(analysis_obj)
    await db.commit()

    uploaded_iso = resume_record.uploaded_at.isoformat() if hasattr(resume_record, "uploaded_at") and resume_record.uploaded_at else datetime.utcnow().isoformat()

    resume_obj = {
        "id": resume_record.id,
        "fileName": filename,
        "file_name": filename,
        "fileType": resume_record.file_type,
        "uploadedAt": uploaded_iso,
        "alignmentScore": analysis["alignment_score"],
        "alignment_score": analysis["alignment_score"],
        "version": 1,
        "parsedData": raw_text[:300]
    }

    return {
        "success": True,
        "resume": resume_obj,
        "analysis": analysis_obj,
        "resume_id": resume_record.id,
        "resumeId": resume_record.id,
        "file_name": filename,
        "fileName": filename,
        "target_role": target_role_title,
        "targetRole": target_role_title,
        "alignment_score": analysis["alignment_score"],
        "alignmentScore": analysis["alignment_score"],
        "detected_skills": analysis["detected_skills"],
        "detectedSkills": analysis["detected_skills"],
        "detectedCandidateSkills": analysis.get("detected_candidate_skills", []),
        "missing_keywords": missing_kw,
        "missingKeywords": missing_kw,
        "present_keywords": present_kw,
        "presentKeywords": present_kw,
        "recommendations": recommendations_out,
        "bullet_improvements": saved_bullets,
        "bulletImprovements": saved_bullets
    }

@router.get("/latest")
async def get_latest_resume_analysis(
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = p_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    res = await db.execute(
        select(Resume)
        .where(Resume.student_id == student.id)
        .options(
            selectinload(Resume.career_role),
            selectinload(Resume.bullets),
            selectinload(Resume.recommendations)
        )
        .order_by(Resume.uploaded_at.desc())
    )
    latest = res.scalars().first()
    if not latest:
        return {"success": False, "message": "No resume analyzed yet"}

    analysis_data = None
    if latest.parsed_data_json:
        try:
            analysis_data = json.loads(latest.parsed_data_json)
        except Exception:
            pass

    return {
        "success": True,
        "resume_id": latest.id,
        "resumeId": latest.id,
        "fileName": latest.file_name,
        "file_name": latest.file_name,
        "targetRole": latest.career_role.title if latest.career_role else "Clinical Research Associate",
        "alignmentScore": latest.alignment_score,
        "alignment_score": latest.alignment_score,
        "analysis": analysis_data,
        "recommendations": [r.recommendation for r in latest.recommendations],
        "bulletImprovements": [
            {
                "id": b.id,
                "originalText": b.original_text,
                "improvedText": b.improved_text,
                "explanation": b.explanation,
                "status": b.status
            }
            for b in latest.bullets
        ]
    }

@router.put("/bullet/{bullet_id}/action")
@router.post("/bullet-action")
async def update_bullet_status(
    bullet_id: Optional[str] = None,
    req: Optional[BulletActionIn] = None,
    current_user: User = Depends(require_role(["STUDENT"])),
    db: AsyncSession = Depends(get_db)
):
    target_id = bullet_id or (req.bullet_id if req and hasattr(req, "bullet_id") else None)
    if not target_id:
        raise HTTPException(status_code=400, detail="bullet_id is required")

    res = await db.execute(select(ResumeBullet).where(ResumeBullet.id == target_id))
    bullet = res.scalar_one_or_none()
    if not bullet:
        raise HTTPException(status_code=404, detail="Bullet suggestion not found")

    action_val = (req.action if req else "ACCEPT").upper()
    bullet.status = "ACCEPTED" if action_val == "ACCEPT" else "REJECTED"
    await db.commit()

    return {"success": True, "bullet_id": bullet.id, "status": bullet.status}
