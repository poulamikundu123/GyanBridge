from typing import Optional, List
from pydantic import BaseModel

class BulletSuggestionOut(BaseModel):
    id: str
    original_text: str
    improved_text: str
    explanation: Optional[str] = None
    status: str = "PENDING"

class DetectedSkillOut(BaseModel):
    skill_name: str
    category: str
    status: str  # DEMONSTRATED, PARTIALLY_DEMONSTRATED, NOT_FOUND
    evidence: Optional[str] = None

class ATSAnalysisOut(BaseModel):
    resume_id: str
    file_name: str
    target_role: str
    alignment_score: float  # 0 - 100
    detected_skills: List[DetectedSkillOut]
    missing_keywords: List[str]
    recommendations: List[str]
    bullet_improvements: List[BulletSuggestionOut]

class BulletActionIn(BaseModel):
    bullet_id: Optional[str] = None
    action: str = "ACCEPT"  # ACCEPT, REJECT
