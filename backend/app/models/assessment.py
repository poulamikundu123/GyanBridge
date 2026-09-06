from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.user import generate_id

class AssessmentTest(Base):
    __tablename__ = "assessment_tests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("skill_categories.id"), nullable=False)
    discipline_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("ayush_disciplines.id"), nullable=True)
    career_role_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("career_roles.id"), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    total_questions: Mapped[int] = mapped_column(Integer, default=15)
    passing_score: Mapped[float] = mapped_column(Float, default=50.0)
    difficulty: Mapped[str] = mapped_column(String(32), default="BALANCED")  # EASY, BALANCED, ADVANCED

    category: Mapped["SkillCategory"] = relationship("SkillCategory")
    discipline: Mapped[Optional["AyushDiscipline"]] = relationship("AyushDiscipline")
    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")
    questions: Mapped[List["AssessmentQuestion"]] = relationship("AssessmentQuestion", back_populates="test", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    test_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_tests.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(32), default="MCQ")  # MCQ, CASE_STUDY, SITUATIONAL
    difficulty: Mapped[str] = mapped_column(String(32), default="MEDIUM")  # EASY, MEDIUM, HARD
    career_relevance: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    test: Mapped["AssessmentTest"] = relationship("AssessmentTest", back_populates="questions")
    skill: Mapped["Skill"] = relationship("Skill")
    options: Mapped[List["AssessmentOption"]] = relationship("AssessmentOption", back_populates="question", cascade="all, delete-orphan")
    skills_mapping: Mapped[List["AssessmentQuestionSkill"]] = relationship("AssessmentQuestionSkill", back_populates="question", cascade="all, delete-orphan")


class AssessmentQuestionSkill(Base):
    __tablename__ = "assessment_question_skills"
    __table_args__ = (UniqueConstraint("question_id", "skill_id", name="uq_q_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    question: Mapped["AssessmentQuestion"] = relationship("AssessmentQuestion", back_populates="skills_mapping")
    skill: Mapped["Skill"] = relationship("Skill")


class AssessmentOption(Base):
    __tablename__ = "assessment_options"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    question: Mapped["AssessmentQuestion"] = relationship("AssessmentQuestion", back_populates="options")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    student_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    test_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_tests.id"), nullable=False)
    career_role_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("career_roles.id"), nullable=True)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    score_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="attempts")
    test: Mapped["AssessmentTest"] = relationship("AssessmentTest")
    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")
    answers: Mapped[List["AssessmentAnswer"]] = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")
    skill_scores: Mapped[List["AssessmentSkillScore"]] = relationship("AssessmentSkillScore", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_questions.id"), nullable=False)
    selected_option_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("assessment_options.id"), nullable=True)
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    score_awarded: Mapped[float] = mapped_column(Float, default=0.0)

    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="answers")
    question: Mapped["AssessmentQuestion"] = relationship("AssessmentQuestion")
    selected_option: Mapped[Optional["AssessmentOption"]] = relationship("AssessmentOption")


class AssessmentSkillScore(Base):
    __tablename__ = "assessment_skill_scores"
    __table_args__ = (UniqueConstraint("attempt_id", "skill_id", name="uq_attempt_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    score_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    questions_count: Mapped[int] = mapped_column(Integer, default=0)
    correct_count: Mapped[int] = mapped_column(Integer, default=0)

    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="skill_scores")
    skill: Mapped["Skill"] = relationship("Skill")
