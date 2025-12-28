"""
Profile Analysis Output Schema - Agent 1's data contract
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Strength(BaseModel):
    """A profile strength identified by the analyst"""
    factor: str = Field(..., description="The strength factor")
    impact: str = Field(..., description="How it helps: high/medium/low")
    applicable_countries: List[str] = Field(
        default_factory=list,
        description="Countries where this strength is valuable"
    )
    explanation: str = Field(..., description="Why this is a strength")


class Weakness(BaseModel):
    """A profile weakness or gap identified"""
    factor: str = Field(..., description="The weakness factor")
    severity: str = Field(..., description="Severity: high/medium/low")
    affected_paths: List[str] = Field(
        default_factory=list,
        description="Visa types/countries affected"
    )
    mitigation: Optional[str] = Field(None, description="How to address this")


class EligibleVisa(BaseModel):
    """A visa type the user likely qualifies for"""
    visa_type: str = Field(..., description="Type of visa")
    country: str = Field(..., description="Country offering this visa")
    eligibility_confidence: float = Field(
        ..., 
        description="Confidence of eligibility (0-1)",
        ge=0, le=1
    )
    key_requirements_met: List[str] = Field(
        default_factory=list,
        description="Requirements the user meets"
    )
    potential_gaps: List[str] = Field(
        default_factory=list,
        description="Requirements that may be gaps"
    )


class ProfileAnalysisOutput(BaseModel):
    """
    Output from the Profile Analyst agent.
    Provides a structured understanding of the user's immigration profile.
    """
    # Summary
    profile_summary: str = Field(
        ..., 
        description="2-3 sentence summary of the profile"
    )
    overall_strength_score: float = Field(
        ..., 
        description="Overall profile strength (0-100)",
        ge=0, le=100
    )
    
    # Detailed analysis
    strengths: List[Strength] = Field(
        default_factory=list,
        description="Identified strengths"
    )
    weaknesses: List[Weakness] = Field(
        default_factory=list,
        description="Identified weaknesses/gaps"
    )
    
    # Eligibility
    eligible_visas: List[EligibleVisa] = Field(
        default_factory=list,
        description="Visa types the user may qualify for"
    )
    
    # Recommendations
    recommended_regions: List[str] = Field(
        default_factory=list,
        description="Regions/countries best suited for this profile"
    )
    avoid_regions: List[str] = Field(
        default_factory=list,
        description="Regions that may be difficult for this profile"
    )
    
    # Agent metadata
    agent_name: str = Field(default="Profile Analyst")
    reasoning_notes: Optional[str] = Field(
        None, 
        description="Additional reasoning from the agent"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "profile_summary": "Strong tech professional with 5 years experience and Master's degree. Well-positioned for skilled worker visas in tech-forward countries.",
                "overall_strength_score": 75,
                "strengths": [
                    {
                        "factor": "Technical skills in high-demand field",
                        "impact": "high",
                        "applicable_countries": ["Canada", "Germany", "Australia"],
                        "explanation": "ML/AI skills are on shortage occupation lists"
                    }
                ],
                "weaknesses": [
                    {
                        "factor": "No IELTS score on file",
                        "severity": "medium",
                        "affected_paths": ["Canada Express Entry", "Australia Skilled"],
                        "mitigation": "Take IELTS exam, target 7+ band"
                    }
                ],
                "eligible_visas": [
                    {
                        "visa_type": "Express Entry",
                        "country": "Canada",
                        "eligibility_confidence": 0.8,
                        "key_requirements_met": ["Education", "Work Experience", "Age"],
                        "potential_gaps": ["Language test required"]
                    }
                ],
                "recommended_regions": ["Canada", "Germany", "Netherlands"],
                "avoid_regions": ["USA (H1B lottery dependent)"],
                "agent_name": "Profile Analyst"
            }
        }
