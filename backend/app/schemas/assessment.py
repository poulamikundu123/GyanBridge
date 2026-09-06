from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class OptionOut(BaseModel):
    id: str
    option_text: str

class QuestionOut(BaseModel):
    id: str
    question_text: str
    question_type: str
    difficulty: str
    career_relevance: Optional[str] = None
    options: List[OptionOut]

class TestListOut(BaseModel):
    id: str
    title: str
    description: str
    category_name: str
    duration_minutes: int
    total_questions: int
    passing_score: float
    difficulty: str

class AnswerSubmission(BaseModel):
    question_id: Optional[str] = None
    questionId: Optional[str] = None
    selected_option_id: Optional[str] = None
    selectedOptionId: Optional[str] = None
    text_answer: Optional[str] = None
    textAnswer: Optional[str] = None

    def get_question_id(self) -> str:
        return self.question_id or self.questionId or ""

    def get_selected_option_id(self) -> Optional[str]:
        return self.selected_option_id or self.selectedOptionId

    def get_text_answer(self) -> Optional[str]:
        return self.text_answer or self.textAnswer

class TestSubmitIn(BaseModel):
    test_id: Optional[str] = None
    testId: Optional[str] = None
    attempt_id: Optional[str] = None
    attemptId: Optional[str] = None
    answers: List[AnswerSubmission] = []

    def get_test_id(self) -> Optional[str]:
        return self.test_id or self.testId

    def get_attempt_id(self) -> Optional[str]:
        return self.attempt_id or self.attemptId

class AssessmentStartIn(BaseModel):
    career_role_id: Optional[str] = None
    careerRoleId: Optional[str] = None
    test_id: Optional[str] = None
    testId: Optional[str] = None
    opportunity_id: Optional[str] = None
    opportunityId: Optional[str] = None
    assessment_type: Optional[str] = "STANDARD_BENCHMARK"
    assessmentType: Optional[str] = None

    def get_career_role_id(self) -> Optional[str]:
        return self.career_role_id or self.careerRoleId

    def get_test_id(self) -> Optional[str]:
        return self.test_id or self.testId

    def get_opportunity_id(self) -> Optional[str]:
        return self.opportunity_id or self.opportunityId

    def get_assessment_type(self) -> str:
        return self.assessmentType or self.assessment_type or "STANDARD_BENCHMARK"

class SkillScoreResult(BaseModel):
    skill_name: str
    score_percentage: float
    questions_count: int
    correct_count: int

class AssessmentResultOut(BaseModel):
    attempt_id: str
    score_percentage: float
    readiness_score: float
    passed: bool
    skill_scores: List[SkillScoreResult]
