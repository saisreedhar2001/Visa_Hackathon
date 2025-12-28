"""
User Profile Schema - Input data contract for the analysis
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Education(BaseModel):
    """User's educational background"""
    degree: str = Field(..., description="Highest degree obtained", example="Master's")
    field: str = Field(..., description="Field of study", example="Computer Science")
    institution: Optional[str] = Field(None, description="University/college name")
    graduation_year: Optional[int] = Field(None, description="Year of graduation")
    country: Optional[str] = Field(None, description="Country where degree was obtained")


class WorkExperience(BaseModel):
    """User's work experience"""
    years: int = Field(..., description="Total years of experience", ge=0)
    current_role: str = Field(..., description="Current job title")
    industry: str = Field(..., description="Primary industry")
    seniority: Optional[str] = Field(None, description="Seniority level", example="Mid-level")
    is_employed: bool = Field(True, description="Currently employed")


class Financial(BaseModel):
    """User's financial situation"""
    savings: float = Field(..., description="Total savings in USD", ge=0)
    annual_income: float = Field(..., description="Annual income in USD", ge=0)
    has_debt: bool = Field(False, description="Has significant debt")
    can_show_proof: bool = Field(True, description="Can provide bank statements")


class Goals(BaseModel):
    """User's immigration goals"""
    target_countries: List[str] = Field(
        ..., 
        description="Preferred destination countries",
        min_length=1,
        max_length=5
    )
    timeline: str = Field(..., description="Desired timeline", example="1-2 years")
    purpose: str = Field(
        ..., 
        description="Primary purpose", 
        example="career_growth"
    )
    flexibility: Optional[str] = Field(
        "moderate", 
        description="How flexible with destination: low/moderate/high"
    )
    willing_to_study: bool = Field(False, description="Willing to pursue education route")


class UserProfile(BaseModel):
    """
    Complete user profile for mobility analysis.
    This is the primary input to the AI agent system.
    """
    # Basic info
    name: Optional[str] = Field(None, description="User's name")
    age: int = Field(..., description="User's age", ge=18, le=100)
    nationality: str = Field(..., description="Current nationality/citizenship")
    current_country: str = Field(..., description="Country of current residence")
    
    # Background
    education: Education
    work_experience: WorkExperience
    
    # Skills and languages
    skills: List[str] = Field(
        ..., 
        description="Key professional skills",
        min_length=1,
        max_length=10
    )
    languages: List[str] = Field(
        ..., 
        description="Languages spoken with proficiency",
        min_length=1
    )
    
    # Financial
    financial: Financial
    
    # Goals
    goals: Goals
    
    # Optional extras
    has_job_offer: bool = Field(False, description="Has job offer from destination country")
    has_family_abroad: bool = Field(False, description="Has family in target countries")
    previous_visa_rejections: bool = Field(False, description="Any previous visa rejections")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rahul Sharma",
                "age": 28,
                "nationality": "Indian",
                "current_country": "India",
                "education": {
                    "degree": "Master's",
                    "field": "Computer Science",
                    "institution": "IIT Delhi",
                    "graduation_year": 2020,
                    "country": "India"
                },
                "work_experience": {
                    "years": 5,
                    "current_role": "Senior Software Engineer",
                    "industry": "Technology",
                    "seniority": "Mid-level",
                    "is_employed": True
                },
                "skills": ["Python", "Machine Learning", "Cloud Computing", "Data Engineering"],
                "languages": ["English (Fluent)", "Hindi (Native)"],
                "financial": {
                    "savings": 50000,
                    "annual_income": 45000,
                    "has_debt": False,
                    "can_show_proof": True
                },
                "goals": {
                    "target_countries": ["Canada", "Germany", "Australia"],
                    "timeline": "1-2 years",
                    "purpose": "career_growth",
                    "flexibility": "moderate",
                    "willing_to_study": False
                },
                "has_job_offer": False,
                "has_family_abroad": False,
                "previous_visa_rejections": False
            }
        }
