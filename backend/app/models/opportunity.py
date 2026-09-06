from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym
from app.database import Base
from app.models.user import generate_id

class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    industry_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("industry_profiles.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    opportunity_type: Mapped[str] = mapped_column(String(64), nullable=False)  # JOB, INTERNSHIP, APPRENTICESHIP, PROJECT, TRAINING, FACULTY_INTERNSHIP, FDP, CONSULTANCY
    description: Mapped[str] = mapped_column(Text, nullable=False)
    sector_id: Mapped[str] = mapped_column(String(36), ForeignKey("sectors.id"), nullable=False)
    discipline_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=True)
    eligibility_degree: Mapped[str] = mapped_column(String(128), default="BAMS, BHMS, or Life Sciences")
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    work_mode: Mapped[str] = mapped_column(String(32), default="HYBRID")  # REMOTE, HYBRID, ONSITE
    duration: Mapped[str] = mapped_column(String(64), default="6 Months")
    stipend_salary: Mapped[str] = mapped_column(String(64), default="₹25,000 / month")
    deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE, CLOSED, DRAFT
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    industry_profile: Mapped["IndustryProfile"] = relationship("IndustryProfile", back_populates="opportunities")
    sector: Mapped["Sector"] = relationship("Sector")
    discipline: Mapped[Optional["AyushDiscipline"]] = relationship("AyushDiscipline")
    required_skills: Mapped[List["OpportunitySkill"]] = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    skills: Mapped[List["OpportunitySkill"]] = relationship("OpportunitySkill", viewonly=True)
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"
    __table_args__ = (UniqueConstraint("opportunity_id", "skill_id", name="uq_opp_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    opportunity_id: Mapped[str] = mapped_column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    required_proficiency: Mapped[float] = mapped_column(Float, default=70.0)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="required_skills")
    skill: Mapped["Skill"] = relationship("Skill", lazy="selectin")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    opportunity_id: Mapped[str] = mapped_column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    student_profile_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True)
    academician_profile_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("academician_profiles.id", ondelete="CASCADE"), nullable=True)
    
    status: Mapped[str] = mapped_column(String(32), default="APPLIED")  # APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, JOINED, COMPLETED, REJECTED
    match_score_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    match_score = synonym("match_score_percentage")
    match_breakdown_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cover_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="applications")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile", back_populates="applications")
    academician_profile: Mapped[Optional["AcademicianProfile"]] = relationship("AcademicianProfile", back_populates="applications")
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")
    feedback: Mapped[Optional["IndustryFeedback"]] = relationship("IndustryFeedback", back_populates="application", uselist=False, cascade="all, delete-orphan")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_histories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    changed_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="status_history")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"
    __table_args__ = (UniqueConstraint("student_profile_id", "opportunity_id", name="uq_saved_opp"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    student_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    opportunity_id: Mapped[str] = mapped_column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
