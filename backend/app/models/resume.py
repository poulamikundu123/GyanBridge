from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_role_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("career_roles.id"), nullable=True)
    
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(32), default="pdf")  # pdf, docx, txt
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parsed_data_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    alignment_score: Mapped[float] = mapped_column(Float, default=0.0)  # ATS alignment score 0 - 100
    score_breakdown_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ANALYZED")  # UPLOADED, ANALYZED, FAILED
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="resumes")
    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")
    skill_analyses: Mapped[List["ResumeSkillAnalysis"]] = relationship("ResumeSkillAnalysis", back_populates="resume", cascade="all, delete-orphan")
    recommendations: Mapped[List["ResumeRecommendation"]] = relationship("ResumeRecommendation", back_populates="resume", cascade="all, delete-orphan")
    bullets: Mapped[List["ResumeBullet"]] = relationship("ResumeBullet", back_populates="resume", cascade="all, delete-orphan")


class ResumeSkillAnalysis(Base):
    __tablename__ = "resume_skill_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    resume_id: Mapped[str] = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="DEMONSTRATED")  # DEMONSTRATED, PARTIALLY_DEMONSTRATED, NOT_FOUND
    confidence: Mapped[float] = mapped_column(Float, default=0.85)

    resume: Mapped["Resume"] = relationship("Resume", back_populates="skill_analyses")
    skill: Mapped["Skill"] = relationship("Skill")


class ResumeRecommendation(Base):
    __tablename__ = "resume_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    resume_id: Mapped[str] = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="SKILLS")  # SKILLS, KEYWORDS, EXPERIENCE, STRUCTURE
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(32), default="HIGH")  # HIGH, MEDIUM, LOW

    resume: Mapped["Resume"] = relationship("Resume", back_populates="recommendations")


class ResumeBullet(Base):
    __tablename__ = "resume_bullets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    resume_id: Mapped[str] = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    improved_text: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="PENDING")  # PENDING, ACCEPTED, REJECTED

    resume: Mapped["Resume"] = relationship("Resume", back_populates="bullets")
