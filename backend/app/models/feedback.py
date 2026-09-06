from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class IndustryFeedback(Base):
    __tablename__ = "industry_feedbacks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    reviewer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    
    overall_rating: Mapped[float] = mapped_column(Float, default=5.0)  # 1 - 5 stars
    written_feedback: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    improvements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="feedback")
    reviewer: Mapped["User"] = relationship("User")
    skill_ratings: Mapped[List["IndustryFeedbackSkillRating"]] = relationship("IndustryFeedbackSkillRating", back_populates="feedback", cascade="all, delete-orphan")


class IndustryFeedbackSkillRating(Base):
    __tablename__ = "industry_feedback_skill_ratings"
    __table_args__ = (UniqueConstraint("feedback_id", "skill_id", name="uq_feedback_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    feedback_id: Mapped[str] = mapped_column(String(36), ForeignKey("industry_feedbacks.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0)  # 1 - 5 stars

    feedback: Mapped["IndustryFeedback"] = relationship("IndustryFeedback", back_populates="skill_ratings")
    skill: Mapped["Skill"] = relationship("Skill")
