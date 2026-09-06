from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

class TokenResponse(BaseModel):
    success: bool = True
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str
    profile_id: Optional[str] = None
    redirect_url: str
    redirectUrl: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class DemoLoginRequest(BaseModel):
    role: str = "STUDENT"
    mode: Optional[str] = "STANDARD"  # STANDARD or FRESH
    profileType: Optional[str] = None
    profile_type: Optional[str] = None

    def get_mode(self) -> str:
        return (self.profileType or self.profile_type or self.mode or "STANDARD").upper()

class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    role: str = Field(..., pattern="^(STUDENT|INDUSTRY|ACADEMICIAN|FACULTY|INSTITUTION)$")
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    
    # Student specific
    degree: Optional[str] = "BAMS"
    institution: Optional[str] = "All India Institute of Ayurveda"
    current_year: Optional[str] = Field(default="Final Year", alias="currentYear")
    graduation_year: Optional[Union[int, str]] = Field(default=2026, alias="graduationYear")
    ayush_discipline_id: Optional[str] = Field(default=None, alias="ayushDisciplineId")
    discipline_name: Optional[str] = Field(default=None, alias="disciplineName")
    target_career_role_id: Optional[str] = Field(default=None, alias="targetCareerRoleId")
    
    # Industry specific
    company_name: Optional[str] = Field(default=None, alias="companyName")
    sector_id: Optional[str] = Field(default=None, alias="sectorId")
    sector_name: Optional[str] = Field(default=None, alias="sectorName")
    description: Optional[str] = None
    location: Optional[str] = "New Delhi, India"
    website: Optional[str] = None
    
    # Academician specific
    designation: Optional[str] = "Assistant Professor"
    department: Optional[str] = "Dravyaguna & Clinical Research"
    specialization: Optional[str] = "Herbal Pharmacology"
    experience_years: Optional[Union[int, str]] = Field(default=5, alias="experienceYears")
    
    # Institution specific
    institution_name: Optional[str] = Field(default=None, alias="institutionName")
    institution_type: Optional[str] = Field(default="STATE_AYUSH", alias="institutionType")
    city: Optional[str] = "New Delhi"
    state: Optional[str] = "Delhi"

    @field_validator("graduation_year", mode="before")
    def parse_grad_year(cls, v):
        if v is None: return 2026
        try: return int(v)
        except (ValueError, TypeError): return 2026

    @field_validator("experience_years", mode="before")
    def parse_exp_years(cls, v):
        if v is None: return 5
        try: return int(v)
        except (ValueError, TypeError): return 5

    def get_company_name(self) -> str:
        return self.company_name or self.name

    def get_institution_name(self) -> str:
        return self.institution_name or self.institution or self.name

    def get_current_year(self) -> str:
        return self.current_year or "Final Year"

    def get_graduation_year(self) -> int:
        return int(self.graduation_year or 2026)

class UserOut(BaseModel):
    id: str
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    profile_id: Optional[str] = None

    class Config:
        from_attributes = True
