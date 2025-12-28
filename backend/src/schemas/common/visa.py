"""
Visa Type Schema
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class VisaRequirement(BaseModel):
    """A specific requirement for a visa"""
    requirement: str = Field(..., description="The requirement")
    mandatory: bool = Field(True, description="Is this mandatory?")
    notes: Optional[str] = Field(None)


class VisaType(BaseModel):
    """Information about a visa type"""
    type_code: str = Field(..., description="Visa type code", example="work_visa")
    name: str = Field(..., description="Display name")
    country: str = Field(..., description="Country offering this visa")
    category: str = Field(
        ..., 
        description="Category: work/student/investor/digital_nomad/family"
    )
    
    # Description
    description: str = Field(..., description="What this visa is for")
    
    # Requirements
    requirements: List[VisaRequirement] = Field(default_factory=list)
    minimum_requirements: dict = Field(
        default_factory=dict,
        description="Minimum thresholds (age, experience, etc.)"
    )
    
    # Timeline
    processing_time: str = Field(..., description="Typical processing time")
    validity_period: str = Field(..., description="How long the visa lasts")
    
    # Path forward
    renewable: bool = Field(True)
    path_to_pr: str = Field(
        ..., 
        description="Path to permanent residency from this visa"
    )
    years_to_pr: Optional[int] = Field(None, description="Years to PR eligibility")
    
    # Financials
    application_fee: str = Field(..., description="Visa application fee")
    financial_requirement: Optional[str] = Field(
        None, 
        description="Financial proof required"
    )
    
    # Work rights
    work_permitted: bool = Field(True)
    employer_tied: bool = Field(
        False, 
        description="Is visa tied to specific employer?"
    )
    
    # Family
    family_allowed: bool = Field(True, description="Can bring family?")
    spouse_work_rights: Optional[str] = Field(None)
    
    # Notes
    tips: List[str] = Field(default_factory=list, description="Helpful tips")
    common_rejection_reasons: List[str] = Field(default_factory=list)
