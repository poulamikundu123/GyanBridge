from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class AyushDiscipline(Base):
    __tablename__ = "ayush_disciplines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)  # AYU, YOG, UNA, SID, HOM, CRO
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    career_roles: Mapped[List["CareerRole"]] = relationship("CareerRole", back_populates="discipline")


class Sector(Base):
    __tablename__ = "sectors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    career_roles: Mapped[List["CareerRole"]] = relationship("CareerRole", back_populates="sector")


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("skill_categories.id"), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    category: Mapped["SkillCategory"] = relationship("SkillCategory", back_populates="skills", lazy="selectin")
