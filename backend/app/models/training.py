from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    industry_profile_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("industry_profiles.id"), nullable=True)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="CLINICAL_RESEARCH")
    duration_hours: Mapped[int] = mapped_column(Integer, default=20)
    mode: Mapped[str] = mapped_column(String(32), default="ONLINE")  # ONLINE, OFFLINE, HYBRID
    certificate_provided: Mapped[bool] = mapped_column(Boolean, default=True)
    level: Mapped[str] = mapped_column(String(32), default="INTERMEDIATE")  # BEGINNER, INTERMEDIATE, ADVANCED
    syllabus: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    external_link: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    industry_profile: Mapped[Optional["IndustryProfile"]] = relationship("IndustryProfile", back_populates="training_programs")
    training_skills: Mapped[List["TrainingSkill"]] = relationship("TrainingSkill", back_populates="training_program", cascade="all, delete-orphan")
    enrollments: Mapped[List["TrainingEnrollment"]] = relationship("TrainingEnrollment", back_populates="training_program", cascade="all, delete-orphan")


class TrainingSkill(Base):
    __tablename__ = "training_skills"
    __table_args__ = (UniqueConstraint("training_program_id", "skill_id", name="uq_train_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    training_program_id: Mapped[str] = mapped_column(String(36), ForeignKey("training_programs.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    proficiency_gain: Mapped[float] = mapped_column(Float, default=20.0)

    training_program: Mapped["TrainingProgram"] = relationship("TrainingProgram", back_populates="training_skills")
    skill: Mapped["Skill"] = relationship("Skill", lazy="selectin")


class TrainingEnrollment(Base):
    __tablename__ = "training_enrollments"
    __table_args__ = (UniqueConstraint("student_profile_id", "training_program_id", name="uq_enrollment"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    student_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    training_program_id: Mapped[str] = mapped_column(String(36), ForeignKey("training_programs.id", ondelete="CASCADE"), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ENROLLED")  # ENROLLED, IN_PROGRESS, COMPLETED
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    certificate_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="enrollments")
    training_program: Mapped["TrainingProgram"] = relationship("TrainingProgram", back_populates="enrollments")
