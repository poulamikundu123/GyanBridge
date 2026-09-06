from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class Mentorship(Base):
    __tablename__ = "mentorships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    academician_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("academician_profiles.id", ondelete="CASCADE"), nullable=False)
    expertise: Mapped[str] = mapped_column(String(255), nullable=False)  # Clinical Protocols, Pharmacognosy, Dravyaguna
    availability: Mapped[str] = mapped_column(String(64), default="2 hrs/week")
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    academician_profile: Mapped["AcademicianProfile"] = relationship("AcademicianProfile", back_populates="mentorships")
    requests: Mapped[List["MentorshipRequest"]] = relationship("MentorshipRequest", back_populates="mentorship", cascade="all, delete-orphan")


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    mentorship_id: Mapped[str] = mapped_column(String(36), ForeignKey("mentorships.id", ondelete="CASCADE"), nullable=False)
    student_profile_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True)
    academician_profile_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("academician_profiles.id", ondelete="CASCADE"), nullable=True)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="REQUESTED")  # REQUESTED, ACCEPTED, ACTIVE, COMPLETED, DECLINED
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    mentorship: Mapped["Mentorship"] = relationship("Mentorship", back_populates="requests")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile")


class CollaborationProject(Base):
    __tablename__ = "collaboration_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    creator_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    project_type: Mapped[str] = mapped_column(String(64), default="RESEARCH_COLLABORATION")  # RESEARCH_COLLABORATION, FDP, CONSULTANCY, LIVE_PROJECT, INNOVATION_CHALLENGE
    discipline_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=True)
    seeking_types: Mapped[str] = mapped_column(String(255), default="Academicians, Researchers, Students, Industry Partners")
    required_areas: Mapped[str] = mapped_column(String(255), nullable=False)  # Pharmacognosy, Analytical Chemistry, Standardization
    status: Mapped[str] = mapped_column(String(32), default="OPEN")  # OPEN, IN_DISCUSSION, ACTIVE, COMPLETED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    creator: Mapped["User"] = relationship("User")
    discipline: Mapped[Optional["AyushDiscipline"]] = relationship("AyushDiscipline")
    requests: Mapped[List["CollaborationRequest"]] = relationship("CollaborationRequest", back_populates="project", cascade="all, delete-orphan")


class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("collaboration_projects.id", ondelete="CASCADE"), nullable=False)
    requester_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    proposal_note: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="REQUESTED")  # REQUESTED, UNDER_DISCUSSION, ACCEPTED, DECLINED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["CollaborationProject"] = relationship("CollaborationProject", back_populates="requests")
    requester: Mapped["User"] = relationship("User")
