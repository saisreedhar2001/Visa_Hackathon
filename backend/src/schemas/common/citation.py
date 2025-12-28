"""
Citation Schema - For RAG source tracking
"""
from typing import Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """A citation from a policy source"""
    id: str = Field(..., description="Unique citation ID")
    source: str = Field(..., description="Source name/type")
    title: str = Field(..., description="Document/section title")
    snippet: str = Field(..., description="Relevant text excerpt")
    
    # Categorization
    country: str = Field(default="General")
    category: str = Field(
        default="policy",
        description="Category: policy/financial/requirement/general"
    )
    
    # Relevance
    relevance_score: float = Field(
        default=0.0,
        description="How relevant (0-1)",
        ge=0, le=1
    )
    
    # Display
    icon: str = Field(default="📄", description="Icon for UI")
    confidence: str = Field(
        default="medium",
        description="Confidence: high/medium/low"
    )
    
    # Optional link
    url: Optional[str] = Field(None, description="Link to source if available")
    
    def to_ui_format(self) -> dict:
        """Convert to frontend-friendly format"""
        return {
            "id": self.id,
            "title": self.title,
            "snippet": self.snippet[:150] + "..." if len(self.snippet) > 150 else self.snippet,
            "country": self.country,
            "icon": self.icon,
            "confidence": self.confidence,
            "url": self.url
        }
