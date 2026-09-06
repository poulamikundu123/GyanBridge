from typing import Optional
from pydantic import BaseModel

class MentorshipAction(BaseModel):
    action: Optional[str] = "ACCEPT"  # ACCEPT, DECLINE, COMPLETE
    status: Optional[str] = None

class MentorshipActionPost(BaseModel):
    requestId: Optional[str] = None
    request_id: Optional[str] = None
    status: Optional[str] = None
    action: Optional[str] = None

    def get_request_id(self) -> str:
        return self.requestId or self.request_id or ""

    def get_status(self) -> str:
        s = self.status or self.action or "ACCEPTED"
        s = s.upper()
        if s == "ACCEPT": return "ACCEPTED"
        if s == "DECLINE": return "DECLINED"
        if s == "COMPLETE": return "COMPLETED"
        return s

class MentorshipRequestCreate(BaseModel):
    mentorship_id: str
    topic: str
    message: str

class ResearchProjectCreate(BaseModel):
    title: str
    description: str
    project_type: str = "RESEARCH_COLLABORATION"
    discipline_id: Optional[str] = None
    seeking_types: str = "Academicians, Researchers, Students, Industry Partners"
    required_areas: str

class CollaborationRequestCreate(BaseModel):
    project_id: str
    proposal_note: str

class AcademicianProfileUpdate(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None

class MentorshipOfferingUpdate(BaseModel):
    expertise: Optional[str] = None
    availability: Optional[str] = None
    bio: Optional[str] = None
