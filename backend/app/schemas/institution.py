from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class InstitutionDashboardKPIs(BaseModel):
    total_students: int
    assessed_students_count: int
    average_skill_score: float
    average_readiness_score: float
    total_applications: int
    placed_count: int
    placement_rate_percentage: float
    active_industry_partners: int

class DemandCurriculumGapItem(BaseModel):
    skill_name: str
    category: str
    industry_demand_percentage: float
    curriculum_coverage_percentage: float
    gap_percentage: float
    urgency: str  # HIGH, MEDIUM, LOW

class InstitutionalReportExport(BaseModel):
    institution_name: str
    report_type: str  # NAAC, NIRF, AYUSH_COUNCIL
    generated_at: str
    summary_metrics: Dict[str, Any]
    department_breakdown: List[Dict[str, Any]]
