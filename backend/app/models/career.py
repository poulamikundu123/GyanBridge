from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class CareerRole(Base):
    __tablename__ = "career_roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    title: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    sector_id: Mapped[str] = mapped_column(String(36), ForeignKey("sectors.id"), nullable=False)
    discipline_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    min_education: Mapped[str] = mapped_column(String(128), nullable=False)
    average_salary: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    demand_level: Mapped[str] = mapped_column(String(32), default="HIGH")  # HIGH, VERY_HIGH, MEDIUM

    sector: Mapped["Sector"] = relationship("Sector", back_populates="career_roles")
    discipline: Mapped[Optional["AyushDiscipline"]] = relationship("AyushDiscipline", back_populates="career_roles")
    role_skills: Mapped[List["CareerRoleSkill"]] = relationship("CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan")


class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"
    __table_args__ = (UniqueConstraint("career_role_id", "skill_id", name="uq_role_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    career_role_id: Mapped[str] = mapped_column(String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    required_proficiency: Mapped[float] = mapped_column(Float, default=70.0)  # 0 - 100
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    career_role: Mapped["CareerRole"] = relationship("CareerRole", back_populates="role_skills")
    skill: Mapped["Skill"] = relationship("Skill", lazy="selectin")


class StudentSkill(Base):
    __tablename__ = "student_skills"
    __table_args__ = (UniqueConstraint("student_profile_id", "skill_id", name="uq_student_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    student_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    proficiency_score: Mapped[float] = mapped_column(Float, default=50.0)  # 0 - 100
    verification_level: Mapped[str] = mapped_column(String(32), default="SELF_REPORTED")  # SELF_REPORTED, ASSESSMENT_VERIFIED, INSTITUTION_VERIFIED, INDUSTRY_VERIFIED
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", lazy="selectin")
