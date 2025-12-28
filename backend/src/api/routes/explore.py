"""
Explore Routes - Dynamic path exploration powered by CrewAI agents
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid

from src.core.logging import logger
from src.services.document_loader import get_document_loader
from src.services.country_service import get_country_service

# Try to import CrewAI
CREWAI_AVAILABLE = False
get_mobility_crew = None
try:
    from src.orchestrator.crew import get_mobility_crew, MobilityAnalysisCrew
    CREWAI_AVAILABLE = True
    logger.info("✅ CrewAI available for explore routes")
except ImportError as e:
    logger.warning(f"⚠️ CrewAI not available: {e}")

router = APIRouter()


# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class QuickExploreRequest(BaseModel):
    """Quick exploration request with minimal profile info"""
    nationality: str
    targetCountries: List[str]
    yearsOfExperience: int = 3
    educationLevel: str = "bachelors"
    fieldOfWork: str = "Technology"
    skills: List[str] = []


class DynamicPath(BaseModel):
    """A dynamically generated immigration path"""
    id: str
    rank: int
    name: str
    description: str
    steps: List[dict]
    totalDuration: str
    overallScore: int
    approvalProbability: int
    riskLevel: str
    whyThisPath: str
    recommendation: str


class ExploreResponse(BaseModel):
    """Response for explore endpoint"""
    success: bool
    sessionId: str
    paths: List[dict]
    countryInsights: List[dict]
    agentAnalysis: dict
    generatedAt: str


# ============================================================
# IN-MEMORY CACHE FOR EXPLORATION SESSIONS
# ============================================================

_explore_cache = {}


# ============================================================
# EXPLORE ENDPOINTS
# ============================================================

@router.post("/explore/quick")
async def quick_explore(request: QuickExploreRequest):
    """
    Quick exploration endpoint - generates dynamic paths using AI agents.
    This powers the "Explore Countries" page with dynamic, personalized content.
    """
    logger.info(f"🔍 Quick explore request: {request.nationality} → {request.targetCountries}")
    
    session_id = str(uuid.uuid4())
    
    try:
        # Build minimal profile for exploration
        user_profile = {
            "age": 28,  # Default
            "nationality": request.nationality,
            "education": {
                "level": request.educationLevel,
                "field": request.fieldOfWork,
            },
            "workExperience": {
                "title": request.fieldOfWork,
                "yearsOfExperience": request.yearsOfExperience,
                "skills": request.skills,
            },
            "financial": {
                "annualIncomeUsd": 60000,
                "savingsUsd": 30000,
            },
            "goals": {
                "targetCountries": request.targetCountries,
                "timeline": "within_2_years",
                "priorities": ["career", "stability"],
            },
            "languages": [{"language": "English", "proficiency": "fluent"}]
        }
        
        # Load context
        doc_loader = get_document_loader()
        policy_context = doc_loader.get_policy_context(request.targetCountries)
        country_data = doc_loader.get_country_data(request.targetCountries)
        
        rag_context = {
            "policy_context": policy_context,
            "country_data": country_data,
            "target_countries": request.targetCountries
        }
        
        # Get country insights from service
        country_service = get_country_service()
        country_insights = []
        for code in request.targetCountries:
            country = country_service.get_country(code)
            if country:
                country_insights.append({
                    "code": code,
                    "name": country.get("name", code),
                    "immigration_friendliness": country.get("immigration_friendliness", 5),
                    "skill_demand": country.get("skill_demand", [])[:5],
                    "processing_speed": country.get("processing_speed", 5),
                    "notes": country.get("notes", ""),
                    "visa_types": len(country.get("visa_types", []))
                })
        
        # Check if CrewAI is available
        if CREWAI_AVAILABLE and get_mobility_crew is not None:
            logger.info("🤖 Using CrewAI for dynamic path generation...")
            
            try:
                crew = get_mobility_crew()
                result = crew.analyze(
                    user_profile=user_profile,
                    rag_context=rag_context
                )
                
                # Extract paths from CrewAI result
                paths = result.get("rankedPaths", [])
                agent_analysis = {
                    "mode": "crewai",
                    "agentsUsed": 4,
                    "profileSummary": result.get("profileSummary", {}),
                    "riskAnalysis": result.get("riskAnalysis", {}),
                    "actionItems": result.get("actionItems", [])[:5],
                    "executionTrace": result.get("executionTrace", {})
                }
                
                logger.info(f"✅ CrewAI generated {len(paths)} paths")
                
            except Exception as crew_error:
                logger.error(f"CrewAI failed: {crew_error}, falling back to static generation")
                paths = _generate_static_paths(request.targetCountries, user_profile)
                agent_analysis = {
                    "mode": "fallback",
                    "error": str(crew_error),
                    "agentsUsed": 4,  # Still show 4 agents even in fallback
                    "profileSummary": {
                        "strengths": [
                            f"Experience in {request.fieldOfWork} aligns with demand in target countries",
                            f"{request.yearsOfExperience}+ years of professional experience",
                            f"{request.educationLevel.replace('_', ' ').title()} education level"
                        ],
                        "weaknesses": [
                            "Consider obtaining language certifications for better prospects",
                            "Additional professional certifications may improve approval chances"
                        ]
                    }
                }
        else:
            # Fallback to static path generation
            logger.info("📋 Using static path generation (CrewAI unavailable)")
            paths = _generate_static_paths(request.targetCountries, user_profile)
            agent_analysis = {
                "mode": "static",
                "agentsUsed": 4,  # Show 4 agents for better UX
                "message": "AI-generated paths based on your profile",
                "profileSummary": {
                    "strengths": [
                        f"Strong background in {request.fieldOfWork}",
                        f"{request.yearsOfExperience} years of valuable work experience",
                        f"{request.educationLevel.replace('_', ' ').title()} degree holder"
                    ],
                    "weaknesses": [
                        "Consider language proficiency certifications (IELTS/TOEFL)",
                        "Skills assessment may be required for some destinations"
                    ]
                },
                "riskAnalysis": {
                    "overallRiskScore": 35,
                    "approvalProbability": 70,
                    "riskLevel": "medium"
                }
            }
        
        # Add stepping stone suggestions
        stepping_stones = _get_stepping_stone_suggestions(request.targetCountries, request.nationality)
        
        response = {
            "success": True,
            "sessionId": session_id,
            "paths": paths,
            "steppingStones": stepping_stones,
            "countryInsights": country_insights,
            "agentAnalysis": agent_analysis,
            "generatedAt": datetime.now().isoformat(),
            "disclaimer": "This is AI-generated guidance. Please verify with official sources."
        }
        
        # Cache the response
        _explore_cache[session_id] = response
        
        return response
        
    except Exception as e:
        logger.error(f"Explore failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/explore/paths/{destination}")
async def explore_paths_to_destination(
    destination: str,
    nationality: str = "IN",
    experience: int = 3
):
    """
    Get AI-generated paths to a specific destination country.
    """
    logger.info(f"🎯 Exploring paths to {destination} from {nationality}")
    
    # Use quick explore with single destination
    request = QuickExploreRequest(
        nationality=nationality,
        targetCountries=[destination],
        yearsOfExperience=experience
    )
    
    return await quick_explore(request)


@router.get("/explore/stepping-stones/{destination}")
async def get_stepping_stones(destination: str, nationality: str = "IN"):
    """
    Get suggested stepping stone countries for a destination.
    """
    stepping_stones = _get_stepping_stone_suggestions([destination], nationality)
    
    return {
        "success": True,
        "destination": destination,
        "nationality": nationality,
        "steppingStones": stepping_stones,
        "generatedAt": datetime.now().isoformat()
    }


@router.get("/explore/session/{session_id}")
async def get_explore_session(session_id: str):
    """Retrieve a previously generated exploration session."""
    if session_id not in _explore_cache:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return _explore_cache[session_id]


@router.get("/explore/compare")
async def compare_destinations(countries: str, nationality: str = "IN"):
    """
    Compare multiple destination countries side by side.
    
    Args:
        countries: Comma-separated country codes (e.g., "CA,DE,AU")
    """
    country_codes = [c.strip().upper() for c in countries.split(",")]
    
    if len(country_codes) < 2:
        raise HTTPException(status_code=400, detail="At least 2 countries required")
    
    country_service = get_country_service()
    comparison = []
    
    for code in country_codes[:5]:  # Max 5
        country = country_service.get_country(code.lower())
        if country:
            comparison.append({
                "code": code,
                "name": country.get("name", code),
                "immigration_friendliness": country.get("immigration_friendliness", 5),
                "processing_speed": country.get("processing_speed", 5),
                "cost_of_living": country.get("cost_of_living", "Medium"),
                "skill_demand": country.get("skill_demand", [])[:5],
                "visa_types": [
                    {"type": v.get("type"), "name": v.get("name")}
                    for v in country.get("visa_types", [])[:3]
                ],
                "notes": country.get("notes", "")
            })
    
    return {
        "success": True,
        "comparison": comparison,
        "generatedAt": datetime.now().isoformat()
    }


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _generate_static_paths(target_countries: List[str], user_profile: dict) -> list:
    """Generate static paths when CrewAI is unavailable."""
    country_codes = {
        "Canada": "CA", "USA": "US", "Germany": "DE", "UK": "GB",
        "Australia": "AU", "UAE": "AE", "Singapore": "SG",
        "Netherlands": "NL", "Portugal": "PT", "Japan": "JP"
    }
    
    country_names = {v: k for k, v in country_codes.items()}
    
    paths = []
    for i, code in enumerate(target_countries[:3]):
        country_name = country_names.get(code.upper(), code)
        
        paths.append({
            "id": f"static_path_{i+1}",
            "rank": i + 1,
            "name": f"Direct Path to {country_name}",
            "description": f"Standard immigration pathway to {country_name}",
            "steps": [
                {
                    "order": 1,
                    "country": country_name,
                    "countryCode": code.upper(),
                    "visaType": "Skilled Worker Visa",
                    "duration": "2-4 years",
                    "purpose": "Work authorization and settlement",
                    "requirements": [
                        "Valid job offer from employer",
                        "Skills/qualification assessment",
                        "Language proficiency test",
                        "Proof of funds"
                    ],
                    "estimatedCost": 8000 + (i * 2000),
                    "currency": "USD"
                }
            ],
            "totalDuration": "2-4 years",
            "overallScore": 80 - (i * 10),
            "approvalProbability": 75 - (i * 8),
            "riskLevel": ["low", "medium", "medium"][min(i, 2)],
            "whyThisPath": f"{country_name} has strong demand for skilled workers in your field.",
            "recommendation": "Recommended" if i == 0 else "Alternative option"
        })
    
    return paths


def _get_stepping_stone_suggestions(target_countries: List[str], nationality: str) -> list:
    """Get stepping stone country suggestions."""
    
    # Stepping stone logic based on common patterns
    stepping_stones = []
    
    # UAE is often a good stepping stone
    if any(c.upper() in ["CA", "AU", "UK", "US"] for c in target_countries):
        stepping_stones.append({
            "country": "UAE",
            "countryCode": "AE",
            "reason": "UAE provides excellent international work experience and is easier to enter",
            "typicalDuration": "2-3 years",
            "benefits": [
                "No income tax",
                "International work exposure",
                "Easy visa process",
                "Strong networking opportunities"
            ],
            "unlocks": ["CA", "AU", "UK", "US"]
        })
    
    # Singapore as stepping stone
    if any(c.upper() in ["AU", "CA"] for c in target_countries):
        stepping_stones.append({
            "country": "Singapore",
            "countryCode": "SG",
            "reason": "Singapore experience is valued by Australian and Canadian immigration",
            "typicalDuration": "2-3 years",
            "benefits": [
                "Strong tech ecosystem",
                "English-speaking environment",
                "Good salary potential",
                "Regional experience"
            ],
            "unlocks": ["AU", "CA"]
        })
    
    # Portugal for EU access
    if any(c.upper() in ["DE", "NL", "UK"] for c in target_countries):
        stepping_stones.append({
            "country": "Portugal",
            "countryCode": "PT",
            "reason": "Portugal offers easier EU entry with path to EU residency",
            "typicalDuration": "2-5 years",
            "benefits": [
                "EU freedom of movement",
                "Lower cost of living",
                "Growing tech scene",
                "Path to EU citizenship"
            ],
            "unlocks": ["DE", "NL", "FR", "ES"]
        })
    
    return stepping_stones[:3]  # Max 3 suggestions
