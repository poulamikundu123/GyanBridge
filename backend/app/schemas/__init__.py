from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.schemas.student import CareerGoalUpdate, StudentProfileUpdate, SkillItem, SkillGapReport, OpportunityApplicationIn
from app.schemas.industry import OpportunityCreate, ApplicationStatusUpdate, FeedbackCreate
from app.schemas.academician import MentorshipAction, MentorshipRequestCreate, ResearchProjectCreate, AcademicianProfileUpdate
from app.schemas.institution import InstitutionDashboardKPIs, DemandCurriculumGapItem, InstitutionalReportExport
from app.schemas.assessment import QuestionOut, TestListOut, TestSubmitIn, AssessmentResultOut
from app.schemas.resume import ATSAnalysisOut, BulletSuggestionOut, BulletActionIn

__all__ = [
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserOut",
    "CareerGoalUpdate",
    "StudentProfileUpdate",
    "SkillItem",
    "SkillGapReport",
    "OpportunityApplicationIn",
    "OpportunityCreate",
    "ApplicationStatusUpdate",
    "FeedbackCreate",
    "MentorshipAction",
    "MentorshipRequestCreate",
    "ResearchProjectCreate",
    "AcademicianProfileUpdate",
    "InstitutionDashboardKPIs",
    "DemandCurriculumGapItem",
    "InstitutionalReportExport",
    "QuestionOut",
    "TestListOut",
    "TestSubmitIn",
    "AssessmentResultOut",
    "ATSAnalysisOut",
    "BulletSuggestionOut",
    "BulletActionIn",
]
