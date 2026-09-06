from typing import Optional, List, Any
from pydantic import BaseModel

class CareerGoalUpdate(BaseModel):
    career_role_id: Optional[str] = None
    careerRoleId: Optional[str] = None
    roleId: Optional[str] = None

    def get_role_id(self) -> Optional[str]:
        return self.career_role_id or self.careerRoleId or self.roleId

class StudentProfileUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    current_year: Optional[str] = None
    currentYear: Optional[str] = None
    graduation_year: Optional[int] = None
    graduationYear: Optional[int] = None
    cgpa: Optional[float] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    preferred_work_mode: Optional[str] = None
    preferredWorkMode: Optional[str] = None
    ayush_discipline_id: Optional[str] = None
    ayushDisciplineId: Optional[str] = None
    target_career_role_id: Optional[str] = None
    targetCareerRoleId: Optional[str] = None
    targetRoleId: Optional[str] = None

class TrainingEnrollIn(BaseModel):
    training_program_id: Optional[str] = None
    trainingProgramId: Optional[str] = None

    def get_program_id(self) -> Optional[str]:
        return self.training_program_id or self.trainingProgramId

class MentorshipRequestIn(BaseModel):
    mentorship_id: Optional[str] = None
    mentorshipId: Optional[str] = None
    topic: str
    message: str

    def get_mentorship_id(self) -> Optional[str]:
        return self.mentorship_id or self.mentorshipId

class SkillItem(BaseModel):
    skill_id: str
    name: str
    category: str
    proficiency_score: float
    verification_level: str
    required_proficiency: Optional[float] = None
    gap: Optional[float] = None
    status: Optional[str] = None  # STRENGTH, MODERATE_GAP, CRITICAL_GAP

class SkillGapReport(BaseModel):
    target_role_id: Optional[str]
    target_role_title: str
    readiness_score: float
    general_skill_score: float
    radar_data: List[dict]
    critical_gaps: List[SkillItem]
    moderate_gaps: List[SkillItem]
    strengths: List[SkillItem]

class OpportunityApplicationIn(BaseModel):
    opportunity_id: Optional[str] = None
    opportunityId: Optional[str] = None
    cover_note: Optional[str] = None
    coverNote: Optional[str] = None
    resume_url: Optional[str] = None
    resumeUrl: Optional[str] = None

    def get_opportunity_id(self) -> str:
        return self.opportunity_id or self.opportunityId or ""

    def get_cover_note(self) -> Optional[str]:
        return self.cover_note or self.coverNote

    def get_resume_url(self) -> Optional[str]:
        return self.resume_url or self.resumeUrl
