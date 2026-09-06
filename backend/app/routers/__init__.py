from app.routers.auth import router as auth_router
from app.routers.student import router as student_router
from app.routers.academician import router as academician_router
from app.routers.faculty import router as faculty_router
from app.routers.industry import router as industry_router
from app.routers.institution import router as institution_router
from app.routers.assessment import router as assessment_router
from app.routers.resume import router as resume_router
from app.routers.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "student_router",
    "academician_router",
    "faculty_router",
    "industry_router",
    "institution_router",
    "assessment_router",
    "resume_router",
    "notifications_router",
]
