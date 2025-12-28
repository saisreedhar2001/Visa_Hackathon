"""
Mobility Paths Output Schema - Agent 2's data contract
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class PathStep(BaseModel):
    """A single step in a mobility path"""
    step_number: int = Field(..., description="Order in the path (1, 2, 3...)")
    country: str = Field(..., description="Country for this step")
    visa_type: str = Field(..., description="Visa to apply for")
    duration: str = Field(..., description="Expected duration in this step")
    purpose: str = Field(..., description="What this step achieves")
    key_requirements: List[str] = Field(
        default_factory=list,
        description="Main requirements to meet"
    )
    what_it_unlocks: str = Field(
        ..., 
        description="What this step enables for the next"
    )
    estimated_cost: Optional[str] = Field(
        None, 
        description="Estimated costs for this step"
    )


class MobilityPath(BaseModel):
    """A complete mobility path from origin to destination"""
    path_id: str = Field(..., description="Unique identifier for this path")
    path_name: str = Field(..., description="Descriptive name")
    
    # Route structure
    origin: str = Field(..., description="Starting country")
    destination: str = Field(..., description="Final destination")
    route_summary: str = Field(
        ..., 
        description="Brief route description, e.g., 'India → UAE → Canada'"
    )
    
    # Steps
    steps: List[PathStep] = Field(
        ..., 
        description="Ordered steps in the path",
        min_length=1
    )
    
    # Path characteristics
    total_timeline: str = Field(..., description="Estimated total time")
    difficulty: str = Field(
        ..., 
        description="Difficulty level: Easy/Medium/Hard"
    )
    total_cost_estimate: str = Field(..., description="Estimated total cost")
    success_factors: List[str] = Field(
        default_factory=list,
        description="Key factors for success"
    )
    
    # Why this path
    why_this_path: str = Field(
        ..., 
        description="Explanation of why this path suits the user"
    )
    path_advantages: List[str] = Field(
        default_factory=list,
        description="Key advantages of this path"
    )
    path_trade_offs: List[str] = Field(
        default_factory=list,
        description="Trade-offs to consider"
    )
    
    # Comparison
    vs_direct_application: Optional[str] = Field(
        None,
        description="Why this might be better than direct application"
    )


class MobilityPathsOutput(BaseModel):
    """
    Output from the Path Generator agent.
    Contains 2-3 viable mobility paths for the user.
    """
    # Generated paths
    paths: List[MobilityPath] = Field(
        ..., 
        description="Generated mobility paths",
        min_length=1,
        max_length=3
    )
    
    # Path generation context
    generation_rationale: str = Field(
        ..., 
        description="Why these specific paths were generated"
    )
    
    # Quick comparison
    path_comparison_summary: str = Field(
        ..., 
        description="Quick comparison of the paths"
    )
    
    # Agent metadata
    agent_name: str = Field(default="Path Generator")
    user_goals_addressed: List[str] = Field(
        default_factory=list,
        description="Which user goals each path addresses"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "paths": [
                    {
                        "path_id": "path_1",
                        "path_name": "UAE Springboard to Canada",
                        "origin": "India",
                        "destination": "Canada",
                        "route_summary": "India → UAE (2 years) → Canada (PR)",
                        "steps": [
                            {
                                "step_number": 1,
                                "country": "UAE",
                                "visa_type": "Employment Visa",
                                "duration": "2 years",
                                "purpose": "Build savings and international experience",
                                "key_requirements": ["Job offer from UAE company"],
                                "what_it_unlocks": "Higher savings, international experience for CRS points",
                                "estimated_cost": "$2,000"
                            },
                            {
                                "step_number": 2,
                                "country": "Canada",
                                "visa_type": "Express Entry PR",
                                "duration": "Permanent",
                                "purpose": "Final destination with PR",
                                "key_requirements": ["CRS score 470+", "IELTS 7+"],
                                "what_it_unlocks": "Permanent residency, citizenship path",
                                "estimated_cost": "$15,000"
                            }
                        ],
                        "total_timeline": "2-3 years",
                        "difficulty": "Medium",
                        "total_cost_estimate": "$20,000",
                        "success_factors": ["Securing UAE job", "Saving consistently", "IELTS preparation"],
                        "why_this_path": "Builds financial reserves while adding international experience points",
                        "path_advantages": ["Tax-free savings in UAE", "International experience boosts CRS"],
                        "path_trade_offs": ["Delays Canada entry by 2 years", "Requires UAE job search"],
                        "vs_direct_application": "Direct application may fall short on CRS; UAE step adds 15-20 points"
                    }
                ],
                "generation_rationale": "Generated paths based on profile strengths in tech and need to build savings/CRS points",
                "path_comparison_summary": "Path 1 (UAE route) is safer but slower; Path 2 (direct) is faster but riskier; Path 3 (Germany) offers EU access",
                "agent_name": "Path Generator"
            }
        }
