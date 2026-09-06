from datetime import datetime
import uuid
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def generate_id() -> str:
    return uuid.uuid4().hex[:16]

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), index=True, nullable=False)  # STUDENT, INDUSTRY, ACADEMICIAN, INSTITUTION
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 1-to-1 Profile Relationships
    student_profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    industry_profile: Mapped[Optional["IndustryProfile"]] = relationship("IndustryProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    academician_profile: Mapped[Optional["AcademicianProfile"]] = relationship("AcademicianProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_profile: Mapped[Optional["InstitutionProfile"]] = relationship("InstitutionProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Notifications & Logs
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    degree: Mapped[str] = mapped_column(String(64), nullable=False)  # BAMS, BHMS, BUMS, BSMS, BNYS, MPharm, MSc
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    current_year: Mapped[str] = mapped_column(String(64), default="Final Year")
    graduation_year: Mapped[int] = mapped_column(Integer, default=2026)
    cgpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    ayush_discipline_id: Mapped[str] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=False)
    target_career_role_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("career_roles.id"), nullable=True)
    
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    preferred_work_mode: Mapped[str] = mapped_column(String(32), default="HYBRID")  # REMOTE, HYBRID, ONSITE
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    general_skill_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="student_profile")
    discipline: Mapped["AyushDiscipline"] = relationship("AyushDiscipline")
    target_career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")
    
    skills: Mapped[List["StudentSkill"]] = relationship("StudentSkill", back_populates="student_profile", cascade="all, delete-orphan")
    education: Mapped[List["Education"]] = relationship("Education", back_populates="student_profile", cascade="all, delete-orphan")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="student_profile", cascade="all, delete-orphan")
    certifications: Mapped[List["Certification"]] = relationship("Certification", back_populates="student_profile", cascade="all, delete-orphan")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="student_profile", cascade="all, delete-orphan")
    attempts: Mapped[List["AssessmentAttempt"]] = relationship("AssessmentAttempt", back_populates="student_profile", cascade="all, delete-orphan")
    enrollments: Mapped[List["TrainingEnrollment"]] = relationship("TrainingEnrollment", back_populates="student_profile", cascade="all, delete-orphan")
    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="student", cascade="all, delete-orphan")


class IndustryProfile(Base):
    __tablename__ = "industry_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector_id: Mapped[str] = mapped_column(String(36), ForeignKey("sectors.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="industry_profile")
    sector: Mapped["Sector"] = relationship("Sector")
    opportunities: Mapped[List["Opportunity"]] = relationship("Opportunity", back_populates="industry_profile", cascade="all, delete-orphan")
    training_programs: Mapped[List["TrainingProgram"]] = relationship("TrainingProgram", back_populates="industry_profile")


class AcademicianProfile(Base):
    __tablename__ = "academician_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    designation: Mapped[str] = mapped_column(String(128), default="Assistant Professor")
    department: Mapped[str] = mapped_column(String(128), default="Dravyaguna & Clinical Research")
    specialization: Mapped[str] = mapped_column(String(255), nullable=False)
    ayush_discipline_id: Mapped[str] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=5)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="academician_profile")
    discipline: Mapped["AyushDiscipline"] = relationship("AyushDiscipline")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="academician_profile")
    mentorships: Mapped[List["Mentorship"]] = relationship("Mentorship", back_populates="academician_profile", cascade="all, delete-orphan")


class InstitutionProfile(Base):
    __tablename__ = "institution_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    institution_type: Mapped[str] = mapped_column(String(64), default="STATE_AYUSH")  # CENTRAL_UNIVERSITY, DEEMED, STATE_AYUSH, RESEARCH_COUNCIL
    established_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="institution_profile")
