"""
Final Recommendation Output Schema - Agent 4's data contract
This is what the frontend receives and displays.
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Citation(BaseModel):
    """A citation from policy sources"""
    id: str = Field(..., description="Citation identifier")
    title: str = Field(..., description="Source title")
    snippet: str = Field(..., description="Relevant excerpt")
    source_type: str = Field(..., description="Type: official/policy/financial")
    country: str = Field(..., description="Related country")
    url: Optional[str] = Field(None, description="Link if available")


class RankedPath(BaseModel):
    """A path with its ranking"""
    rank: int = Field(..., description="Ranking position (1 = best)")
    path_id: str = Field(..., description="Path identifier")
    path_name: str = Field(..., description="Path name")
    route_summary: str = Field(..., description="Route in A→B→C format")
    score: int = Field(..., description="Overall score 0-100", ge=0, le=100)
    approval_probability: float = Field(..., ge=0, le=1)
    one_line_reason: str = Field(..., description="Why this ranking")


class ActionItem(BaseModel):
    """An actionable next step"""
    order: int = Field(..., description="Order to do this")
    action: str = Field(..., description="What to do")
    timeline: str = Field(..., description="When: Immediate/This Week/This Month/Before Application")
    priority: str = Field(..., description="Priority: High/Medium/Low")
    details: Optional[str] = Field(None, description="Additional details")


class StrengthExplanation(BaseModel):
    """How a strength helps"""
    strength: str = Field(..., description="The strength")
    impact: str = Field(..., description="How it helps")
    countries_benefited: List[str] = Field(default_factory=list)


class ConcernExplanation(BaseModel):
    """How a concern affects chances"""
    concern: str = Field(..., description="The concern")
    impact: str = Field(..., description="How it affects")
    mitigation: str = Field(..., description="How to address")


class PrimaryRecommendation(BaseModel):
    """The main recommendation details"""
    path_id: str
    path_name: str
    route_summary: str
    approval_probability: float
    confidence_level: str = Field(..., description="How confident: High/Medium/Low")
    
    why_this_path: str = Field(..., description="Detailed explanation")
    key_advantages: List[str]
    trade_offs: List[str]
    
    timeline_estimate: str
    cost_estimate: str


class FinalRecommendation(BaseModel):
    """
    Complete final recommendation from the Recommendation Synthesizer.
    This is the primary output sent to the frontend.
    """
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = Field(None)
    
    # Executive Summary
    executive_summary: str = Field(
        ..., 
        description="2-3 sentence summary of the recommendation"
    )
    
    # Ranked paths
    ranked_paths: List[RankedPath] = Field(
        ..., 
        description="All paths ranked from best to worst"
    )
    
    # Primary recommendation
    primary_recommendation: PrimaryRecommendation
    
    # Alternatives
    alternatives: List[dict] = Field(
        default_factory=list,
        description="Alternative paths with when to consider them"
    )
    why_not_others: str = Field(
        ..., 
        description="Why other paths ranked lower"
    )
    
    # What helped / What could hurt
    strengths_explained: List[StrengthExplanation] = Field(default_factory=list)
    concerns_explained: List[ConcernExplanation] = Field(default_factory=list)
    
    # Action items
    next_steps: List[ActionItem] = Field(
        ..., 
        description="Ordered list of actions to take"
    )
    
    # Citations
    citations: List[Citation] = Field(
        default_factory=list,
        description="Policy sources referenced"
    )
    
    # Disclaimers
    disclaimers: List[str] = Field(
        default_factory=list,
        description="Important caveats and limitations"
    )
    
    # Agent metadata
    agent_name: str = Field(default="Recommendation Synthesizer")
    agents_consulted: List[str] = Field(
        default=["Profile Analyst", "Path Generator", "Risk Assessor"]
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "executive_summary": "Based on your strong tech background and solid savings, I recommend the UAE-to-Canada pathway. This approach builds your CRS score while growing your savings tax-free, giving you a 72% estimated approval probability for Canadian PR within 2-3 years.",
                "ranked_paths": [
                    {
                        "rank": 1,
                        "path_id": "path_1",
                        "path_name": "UAE Springboard to Canada",
                        "route_summary": "India → UAE → Canada",
                        "score": 82,
                        "approval_probability": 0.72,
                        "one_line_reason": "Best balance of feasibility, timeline, and success probability"
                    }
                ],
                "primary_recommendation": {
                    "path_id": "path_1",
                    "path_name": "UAE Springboard to Canada",
                    "route_summary": "India → UAE (2 years) → Canada (PR)",
                    "approval_probability": 0.72,
                    "confidence_level": "High",
                    "why_this_path": "This path leverages your software engineering skills which are in high demand in UAE, while allowing you to save significantly (tax-free income) and gain international experience that boosts your CRS score by 15-20 points.",
                    "key_advantages": [
                        "Tax-free income builds savings faster",
                        "International experience adds CRS points",
                        "UAE tech scene values your ML skills"
                    ],
                    "trade_offs": [
                        "Delays Canada arrival by ~2 years",
                        "Requires securing UAE employment first"
                    ],
                    "timeline_estimate": "2-3 years total",
                    "cost_estimate": "$18,000-22,000 total"
                },
                "next_steps": [
                    {
                        "order": 1,
                        "action": "Schedule IELTS exam",
                        "timeline": "Immediate",
                        "priority": "High",
                        "details": "Book for within 3 months, target 7+ band score"
                    }
                ],
                "disclaimers": [
                    "Immigration policies change frequently; verify current requirements before applying",
                    "This analysis is informational only; consult a licensed immigration advisor for legal advice",
                    "Processing times are estimates and may vary significantly"
                ]
            }
        }
