"""
Risk Assessment Output Schema - Agent 3's data contract
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Risk(BaseModel):
    """An identified risk for a mobility path"""
    risk_id: str = Field(..., description="Unique identifier")
    category: str = Field(
        ..., 
        description="Risk category: Financial/Documentation/Eligibility/Timing/Policy"
    )
    description: str = Field(..., description="Description of the risk")
    severity: str = Field(..., description="Severity: Low/Medium/High")
    likelihood: str = Field(..., description="Likelihood: Low/Medium/High")
    impact: str = Field(..., description="Potential impact if risk materializes")
    mitigation: str = Field(..., description="How to mitigate this risk")


class Blocker(BaseModel):
    """A potential blocker for the path"""
    blocker_type: str = Field(
        ..., 
        description="Type: Hard (will reject) or Soft (will delay)"
    )
    description: str = Field(..., description="What the blocker is")
    affected_step: int = Field(..., description="Which step it affects")
    resolution: str = Field(..., description="How to resolve it")


class FinancialReadiness(BaseModel):
    """Assessment of financial readiness"""
    is_adequate: bool = Field(..., description="Meets financial requirements")
    required_amount: str = Field(..., description="Amount required for the path")
    user_available: str = Field(..., description="Amount user has available")
    gap: Optional[str] = Field(None, description="Gap if any")
    recommendation: str = Field(..., description="Financial recommendation")


class PathRiskAssessment(BaseModel):
    """Risk assessment for a single path"""
    path_id: str = Field(..., description="ID of the path being assessed")
    path_name: str = Field(..., description="Name of the path")
    
    # Scores
    risk_score: int = Field(
        ..., 
        description="Overall risk score 0-100 (higher = riskier)",
        ge=0, le=100
    )
    approval_probability: float = Field(
        ..., 
        description="Estimated approval probability (0-1)",
        ge=0, le=1
    )
    
    # Detailed assessment
    risks: List[Risk] = Field(default_factory=list, description="Identified risks")
    blockers: List[Blocker] = Field(default_factory=list, description="Potential blockers")
    financial_readiness: FinancialReadiness
    
    # Factors
    positive_factors: List[str] = Field(
        default_factory=list,
        description="Factors helping approval"
    )
    negative_factors: List[str] = Field(
        default_factory=list,
        description="Factors hurting approval"
    )
    
    # Overall
    overall_assessment: str = Field(
        ..., 
        description="Recommended / Proceed with Caution / Not Recommended"
    )
    conditions_for_success: List[str] = Field(
        default_factory=list,
        description="What needs to happen for success"
    )
    reasoning: str = Field(..., description="Explanation of the assessment")


class RiskAssessmentOutput(BaseModel):
    """
    Output from the Risk Assessor agent.
    Evaluates feasibility and risks of each proposed path.
    """
    # Assessments per path
    path_assessments: List[PathRiskAssessment] = Field(
        ..., 
        description="Risk assessment for each path"
    )
    
    # Comparative analysis
    safest_path: str = Field(..., description="ID of the safest path")
    highest_probability_path: str = Field(..., description="ID of path with best approval odds")
    
    # Overall observations
    common_risks: List[str] = Field(
        default_factory=list,
        description="Risks common across all paths"
    )
    user_specific_concerns: List[str] = Field(
        default_factory=list,
        description="Concerns specific to this user's profile"
    )
    
    # Agent metadata
    agent_name: str = Field(default="Risk Assessor")
    assessment_confidence: float = Field(
        ..., 
        description="Confidence in assessment (0-1)",
        ge=0, le=1
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "path_assessments": [
                    {
                        "path_id": "path_1",
                        "path_name": "UAE Springboard to Canada",
                        "risk_score": 35,
                        "approval_probability": 0.72,
                        "risks": [
                            {
                                "risk_id": "risk_1",
                                "category": "Financial",
                                "description": "UAE job market competitive for expats",
                                "severity": "Medium",
                                "likelihood": "Medium",
                                "impact": "Could delay path by 6-12 months",
                                "mitigation": "Apply to multiple companies, leverage LinkedIn network"
                            }
                        ],
                        "blockers": [
                            {
                                "blocker_type": "Soft",
                                "description": "IELTS score not yet obtained",
                                "affected_step": 2,
                                "resolution": "Schedule IELTS test within 3 months"
                            }
                        ],
                        "financial_readiness": {
                            "is_adequate": True,
                            "required_amount": "$20,000",
                            "user_available": "$50,000",
                            "gap": None,
                            "recommendation": "Financial position is strong for this path"
                        },
                        "positive_factors": ["Strong savings", "In-demand skills", "Good age for points"],
                        "negative_factors": ["No IELTS score", "No international experience yet"],
                        "overall_assessment": "Recommended",
                        "conditions_for_success": ["Secure UAE job within 6 months", "Achieve IELTS 7+"],
                        "reasoning": "Path has moderate risk with good probability. User's strong financial position and skills compensate for lack of international experience."
                    }
                ],
                "safest_path": "path_1",
                "highest_probability_path": "path_1",
                "common_risks": ["IELTS requirement", "Processing time uncertainties"],
                "user_specific_concerns": ["First-time international move", "No existing network abroad"],
                "agent_name": "Risk Assessor",
                "assessment_confidence": 0.85
            }
        }
