from datetime import datetime
from typing import Optional, List, Any, Union
from pydantic import BaseModel, field_validator

class OpportunityCreate(BaseModel):
    title: str
    opportunity_type: Optional[str] = "INTERNSHIP"
    opportunityType: Optional[str] = None
    description: str
    sector_id: Optional[str] = None
    sectorId: Optional[str] = None
    discipline_id: Optional[str] = None
    disciplineId: Optional[str] = None
    eligibility_degree: Optional[str] = "BAMS, BHMS, or Life Sciences"
    eligibilityDegree: Optional[str] = None
    location: Optional[str] = "New Delhi, India"
    work_mode: Optional[str] = "HYBRID"
    workMode: Optional[str] = None
    duration: Optional[str] = "6 Months"
    stipend_salary: Optional[str] = "₹25,000 / month"
    stipendSalary: Optional[str] = None
    deadline: Optional[Union[datetime, str]] = None
    skills: Optional[List[dict]] = None
    requiredSkills: Optional[List[dict]] = None

    @field_validator("deadline", mode="before")
    @classmethod
    def sanitize_deadline(cls, v):
        if not v or v == "":
            return None
        if isinstance(v, str):
            try:
                # Support standard ISO parsing
                clean_str = v.replace("Z", "+00:00")
                return datetime.fromisoformat(clean_str)
            except Exception:
                return None
        return v

    def get_type(self) -> str:
        return self.opportunityType or self.opportunity_type or "INTERNSHIP"

    def get_sector_id(self) -> Optional[str]:
        return self.sectorId or self.sector_id

    def get_discipline_id(self) -> Optional[str]:
        return self.disciplineId or self.discipline_id

    def get_degree(self) -> str:
        return self.eligibilityDegree or self.eligibility_degree or "BAMS or Life Sciences"

    def get_work_mode(self) -> str:
        return self.workMode or self.work_mode or "HYBRID"

    def get_stipend(self) -> str:
        return self.stipendSalary or self.stipend_salary or "Stipend Provided"

    def get_skills(self) -> List[dict]:
        return self.requiredSkills or self.skills or []

class ApplicationStatusUpdate(BaseModel):
    application_id: Optional[str] = None
    applicationId: Optional[str] = None
    status: str  # UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, JOINED, COMPLETED, REJECTED
    notes: Optional[str] = None

    def get_app_id(self) -> Optional[str]:
        return self.application_id or self.applicationId

class SkillRatingItem(BaseModel):
    skill_id: Optional[str] = None
    skillId: Optional[str] = None
    rating: float

    def get_skill_id(self) -> str:
        return self.skill_id or self.skillId or ""

class FeedbackCreate(BaseModel):
    application_id: Optional[str] = None
    applicationId: Optional[str] = None
    overall_rating: Optional[float] = 5.0
    overallRating: Optional[float] = None
    written_feedback: Optional[str] = "Excellent performance during tenure."
    writtenFeedback: Optional[str] = None
    strengths: Optional[str] = ""
    improvements: Optional[str] = ""
    skill_ratings: Optional[List[SkillRatingItem]] = None
    skillRatings: Optional[List[SkillRatingItem]] = None

    def get_app_id(self) -> str:
        return self.application_id or self.applicationId or ""

    def get_rating(self) -> float:
        if self.overallRating is not None:
            return float(self.overallRating)
        if self.overall_rating is not None:
            return float(self.overall_rating)
        return 5.0

    def get_feedback(self) -> str:
        return self.writtenFeedback or self.written_feedback or "Excellent performance."

    def get_ratings(self) -> List[SkillRatingItem]:
        return self.skillRatings or self.skill_ratings or []

class TrainingSkillItem(BaseModel):
    skill_id: Optional[str] = None
    skillId: Optional[str] = None
    proficiency_gain: Optional[float] = 20.0
    proficiencyGain: Optional[float] = None

    def get_skill_id(self) -> str:
        return self.skill_id or self.skillId or ""

    def get_gain(self) -> float:
        if self.proficiencyGain is not None:
            return float(self.proficiencyGain)
        if self.proficiency_gain is not None:
            return float(self.proficiency_gain)
        return 20.0

class TrainingProgramCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "CLINICAL_RESEARCH"
    duration_hours: Optional[int] = 30
    durationHours: Optional[int] = None
    mode: Optional[str] = "ONLINE"  # ONLINE, OFFLINE, HYBRID
    level: Optional[str] = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED
    certificate_provided: Optional[bool] = True
    certificateProvided: Optional[bool] = None
    syllabus: Optional[str] = None
    external_link: Optional[str] = None
    externalLink: Optional[str] = None
    skills: Optional[List[Any]] = None

    def get_duration_hours(self) -> int:
        return self.durationHours if self.durationHours is not None else (self.duration_hours or 30)

    def get_certificate_provided(self) -> bool:
        if self.certificateProvided is not None:
            return bool(self.certificateProvided)
        if self.certificate_provided is not None:
            return bool(self.certificate_provided)
        return True

    def get_external_link(self) -> Optional[str]:
        return self.externalLink or self.external_link

    def get_skills(self) -> List[dict]:
        res = []
        for s in (self.skills or []):
            if isinstance(s, dict):
                s_id = s.get("skill_id") or s.get("skillId") or s.get("id")
                gain = s.get("proficiency_gain") or s.get("proficiencyGain") or 20.0
                if s_id:
                    res.append({"skill_id": s_id, "proficiency_gain": float(gain)})
            elif isinstance(s, str):
                res.append({"skill_id": s, "proficiency_gain": 20.0})
        return res

