"""
Country Information Schema
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class CountryInfo(BaseModel):
    """Information about a country for immigration purposes"""
    code: str = Field(..., description="ISO country code", example="CA")
    name: str = Field(..., description="Country name")
    region: str = Field(..., description="Geographic region")
    
    # Immigration metrics
    immigration_friendliness: int = Field(
        ..., 
        description="Score 1-10",
        ge=1, le=10
    )
    processing_speed: int = Field(
        ..., 
        description="Score 1-10 (10 = fastest)",
        ge=1, le=10
    )
    
    # Fintech
    fintech_readiness: int = Field(
        ..., 
        description="Score 1-10",
        ge=1, le=10
    )
    banking_ease: str = Field(..., description="Easy/Moderate/Difficult")
    crypto_friendly: bool = Field(False)
    
    # Work
    skill_demand_areas: List[str] = Field(default_factory=list)
    average_tech_salary: Optional[str] = Field(None)
    
    # Stepping stone
    stepping_stone_potential: str = Field(
        ..., 
        description="Low/Medium/High - usefulness as intermediate country"
    )
    unlocks_regions: List[str] = Field(
        default_factory=list,
        description="Regions this country can be a gateway to"
    )
    
    # Languages
    official_languages: List[str] = Field(default_factory=list)
    english_proficiency: str = Field(..., description="High/Medium/Low")
    
    # Misc
    cost_of_living: str = Field(..., description="Low/Medium/High/Very High")
    quality_of_life_rank: Optional[int] = Field(None)
    
    notes: Optional[str] = Field(None, description="Additional notes")
