"""
Analysis Routes - Main endpoints for mobility analysis
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, List, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

from src.schemas.inputs.user_profile import UserProfile
from src.services.session_service import get_session_service
from src.services.llm_service import get_llm_service
from src.services.document_loader import get_document_loader
from src.core.logging import logger

# Try to import RAG retriever, but allow fallback if chromadb isn't available
RAG_AVAILABLE = False
get_retriever = None
try:
    from src.rag.retriever import get_retriever
    RAG_AVAILABLE = True
    logger.info("✅ RAG retriever is available")
except ImportError as e:
    logger.warning(f"⚠️ RAG retriever not available: {e}")

# Try to import CrewAI, but allow fallback if there are dependency issues
CREWAI_AVAILABLE = False
MobilityAnalysisCrew = None
try:
    from src.orchestrator.crew import MobilityAnalysisCrew
    CREWAI_AVAILABLE = True
    logger.info("✅ CrewAI is available")
except ImportError as e:
    logger.warning(f"⚠️ CrewAI not available due to import error: {e}")
    logger.warning("Deep mode will use enhanced LLM analysis instead")

router = APIRouter()


# Frontend-compatible schema for API endpoints
class DemoEducation(BaseModel):
    level: str
    field: str
    institution: Optional[str] = None
    country: Optional[str] = None
    graduationYear: Optional[int] = None

class DemoWorkExperience(BaseModel):
    title: str
    company: Optional[str] = None
    yearsOfExperience: int
    isCurrentRole: Optional[bool] = True
    skills: List[str] = []

class DemoFinancial(BaseModel):
    annualIncomeUsd: float
    savingsUsd: float
    hasDebts: Optional[bool] = False

class DemoGoals(BaseModel):
    targetCountries: List[str]
    timeline: str
    priorities: List[str] = []
    familySize: Optional[int] = 1

class DemoProfileRequest(BaseModel):
    education: DemoEducation
    workExperience: DemoWorkExperience
    financial: DemoFinancial
    goals: DemoGoals
    nationality: str
    age: int
    languages: Optional[List[Any]] = None


# ============================================================
# REAL LLM-POWERED ANALYSIS ENDPOINT
# ============================================================

@router.post("/analyze/real")
async def analyze_mobility_real(profile: DemoProfileRequest):
    """
    Real LLM-powered analysis endpoint.
    Uses Groq to analyze the user profile and generate recommendations.
    """
    try:
        logger.info(f"Starting REAL analysis for {profile.nationality} national, age {profile.age}")
        
        # Get services
        llm_service = get_llm_service()
        doc_loader = get_document_loader()
        
        # Get target countries
        target_countries = profile.goals.targetCountries
        logger.info(f"Target countries: {target_countries}")
        
        # Load relevant policy documents (RAG context)
        policy_context = doc_loader.get_policy_context(target_countries)
        logger.info(f"Loaded policy context: {len(policy_context)} characters")
        
        # Load country data
        country_data = doc_loader.get_country_data(target_countries)
        logger.info(f"Loaded data for {len(country_data)} countries")
        
        # Convert profile to dict for LLM
        profile_dict = {
            "age": profile.age,
            "nationality": profile.nationality,
            "education": {
                "level": profile.education.level,
                "field": profile.education.field,
                "institution": profile.education.institution,
                "country": profile.education.country,
            },
            "workExperience": {
                "title": profile.workExperience.title,
                "yearsOfExperience": profile.workExperience.yearsOfExperience,
                "skills": profile.workExperience.skills,
                "isCurrentRole": profile.workExperience.isCurrentRole,
            },
            "financial": {
                "annualIncomeUsd": profile.financial.annualIncomeUsd,
                "savingsUsd": profile.financial.savingsUsd,
                "hasDebts": profile.financial.hasDebts,
            },
            "goals": {
                "targetCountries": profile.goals.targetCountries,
                "timeline": profile.goals.timeline,
                "priorities": profile.goals.priorities,
                "familySize": profile.goals.familySize,
            },
            "languages": profile.languages or [],
        }
        
        # Call LLM for analysis
        logger.info("Calling LLM for analysis...")
        analysis_result = llm_service.analyze_profile(
            user_profile=profile_dict,
            policy_context=policy_context,
            country_data=country_data
        )
        
        # Add metadata
        response = {
            "sessionId": str(uuid.uuid4()),
            "profileSummary": analysis_result.get("profileSummary", {}),
            "rankedPaths": analysis_result.get("rankedPaths", []),
            "actionItems": analysis_result.get("actionItems", []),
            "citations": analysis_result.get("citations", []),
            "analysisTimestamp": datetime.now().isoformat(),
            "disclaimer": "This analysis is generated by AI and is for informational purposes only. Immigration policies change frequently. Please verify all information with official government sources and consult a licensed immigration attorney before making decisions."
        }
        
        logger.info("Analysis complete!")
        return response
        
    except Exception as e:
        logger.error(f"Real analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ASYNC ANALYSIS ENDPOINT
# ============================================================

@router.post("/analyze/async")
async def analyze_mobility_async(
    profile: DemoProfileRequest,
    background_tasks: BackgroundTasks
):
    """
    Start an async analysis and return a session ID.
    Use GET /analyze/status/{session_id} to check progress.
    """
    session_service = get_session_service()
    
    # Create session
    session_id = session_service.create_session(profile.model_dump())
    
    # Run analysis in background
    background_tasks.add_task(
        run_analysis_background,
        session_id,
        profile.model_dump()
    )
    
    return {
        "success": True,
        "session_id": session_id,
        "status": "processing",
        "message": "Analysis started. Poll /analyze/status/{session_id} for results."
    }


@router.get("/analyze/status/{session_id}")
async def get_analysis_status(session_id: str):
    """Get the status of an async analysis"""
    session_service = get_session_service()
    session = session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "status": session["status"],
        "created_at": session["created_at"],
        "result": session.get("result") if session["status"] == "completed" else None,
        "error": session.get("error") if session["status"] == "failed" else None
    }


@router.get("/analyze/result/{session_id}")
async def get_analysis_result(session_id: str):
    """Get the full result of a completed analysis"""
    session_service = get_session_service()
    result = session_service.get_session_result(session_id)
    
    if not result:
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session["status"] == "processing":
            raise HTTPException(status_code=202, detail="Analysis still in progress")
        if session["status"] == "failed":
            raise HTTPException(status_code=500, detail=session.get("error", "Analysis failed"))
    
    return {
        "success": True,
        "data": result
    }


def run_analysis_background(session_id: str, profile_data: dict):
    """
    Background task to run analysis.
    If CrewAI is available, runs multi-agent analysis.
    Otherwise, falls back to enhanced LLM analysis.
    
    Note: This is a sync function because CrewAI's kickoff() is blocking.
    FastAPI's BackgroundTasks handles both sync and async functions.
    """
    session_service = get_session_service()
    
    try:
        session_service.update_session_status(session_id, "processing")
        logger.info(f"🤖 Starting analysis for session: {session_id}")
        logger.info("=" * 80)
        
        # Get target countries - handle both camelCase and snake_case
        goals = profile_data.get("goals", {})
        target_countries = goals.get("targetCountries", goals.get("target_countries", []))
        
        logger.info(f"📍 Target countries: {target_countries}")
        
        # Build proper profile dict
        user_profile = {
            "age": profile_data.get("age"),
            "nationality": profile_data.get("nationality"),
            "education": profile_data.get("education", {}),
            "workExperience": profile_data.get("workExperience", {}),
            "financial": profile_data.get("financial", {}),
            "goals": {
                "targetCountries": target_countries,
                "timeline": goals.get("timeline"),
                "priorities": goals.get("priorities", []),
                "familySize": goals.get("familySize", 1),
            },
            "languages": profile_data.get("languages", [])
        }
        
        # Get RAG context
        logger.info("📚 Loading policy documents and country data...")
        from src.services.document_loader import get_document_loader
        doc_loader = get_document_loader()
        
        policy_context = doc_loader.get_policy_context(target_countries)
        country_data = doc_loader.get_country_data(target_countries)
        
        rag_context = {
            "policy_context": policy_context,
            "country_data": country_data,
            "target_countries": target_countries
        }
        
        logger.info(f"✅ Loaded {len(policy_context)} chars of policy context")
        logger.info(f"✅ Loaded data for {len(country_data)} countries")
        
        # Check if CrewAI is available
        if CREWAI_AVAILABLE and MobilityAnalysisCrew is not None:
            # ========================================
            # 🚀 RUN REAL CREWAI MULTI-AGENT WORKFLOW
            # ========================================
            logger.info("=" * 80)
            logger.info("🤖 Initializing CrewAI Multi-Agent System...")
            logger.info("=" * 80)
            
            # Initialize the crew (4 agents with roles, goals, backstories)
            crew = MobilityAnalysisCrew()
            
            logger.info("✅ CrewAI crew initialized with 4 agents:")
            logger.info("   1. 👔 Profile Analyst - Senior Immigration Consultant")
            logger.info("   2. 🗺️  Path Generator - Mobility Strategist")
            logger.info("   3. ⚠️  Risk Assessor - Immigration Risk Analyst")
            logger.info("   4. 💡 Recommendation Synthesizer - Strategic Advisor")
            logger.info("=" * 80)
            
            # Run the crew workflow (this executes all 4 agents sequentially)
            logger.info("🚀 Starting CrewAI sequential workflow...")
            crew_result = crew.analyze(
                user_profile=user_profile,
                rag_context=rag_context
            )
            
            logger.info("=" * 80)
            logger.info("✅ CrewAI workflow completed!")
            logger.info("=" * 80)
            
            # The crew returns a structured result from handoff_manager
            # Convert it to frontend schema
            result = {
                "sessionId": session_id,
                "profileSummary": crew_result.get("recommendation", {}).get("summary", {
                    "strengths": ["Analysis completed"],
                    "weaknesses": [],
                    "eligibleVisas": []
                }),
                "rankedPaths": _extract_paths_from_crew_result(crew_result),
            "actionItems": _extract_action_items_from_crew_result(crew_result),
            "citations": crew_result.get("citations", []),
            "analysisTimestamp": datetime.now().isoformat(),
            "analysisMode": "crewai",
            "agentOutputs": {
                "profileAnalyst": crew_result.get("analysis", {}).get("strengths", []),
                "pathGenerator": crew_result.get("recommendation", {}).get("recommended_path", {}),
                "riskAssessor": crew_result.get("recommendation", {}).get("approval_probability", 0),
                "synthesizer": crew_result.get("recommendation", {}).get("summary", "")
            },
            "disclaimer": "This analysis is generated by AI using CrewAI multi-agent system and is for informational purposes only. Immigration policies change frequently. Please verify all information with official government sources and consult a licensed immigration attorney before making decisions."
        }
        
            session_service.update_session_status(session_id, "completed", result=result)
            logger.info(f"✅ CrewAI analysis completed and saved for session: {session_id}")
        
        else:
            # ========================================
            # 🚀 ENHANCED LLM ANALYSIS (CrewAI unavailable)
            # ========================================
            logger.info("=" * 80)
            logger.info("🤖 Using Enhanced LLM Analysis (CrewAI not available)...")
            logger.info("=" * 80)
            
            llm_service = get_llm_service()
            
            # Use deep analysis method which simulates multi-agent behavior
            analysis_result = llm_service.analyze_profile_deep(
                user_profile=user_profile,
                policy_context=policy_context,
                country_data=country_data
            )
            
            logger.info("=" * 80)
            logger.info("✅ Enhanced LLM analysis completed!")
            logger.info("=" * 80)
            
            result = {
                "sessionId": session_id,
                "profileSummary": analysis_result.get("profileSummary", {}),
                "rankedPaths": analysis_result.get("rankedPaths", []),
                "actionItems": analysis_result.get("actionItems", []),
                "citations": analysis_result.get("citations", []),
                "riskAnalysis": analysis_result.get("riskAnalysis", {}),
                "analysisTimestamp": datetime.now().isoformat(),
                "analysisMode": "enhanced_llm",
                "disclaimer": "This analysis is generated by AI using enhanced LLM analysis and is for informational purposes only. Immigration policies change frequently. Please verify all information with official government sources and consult a licensed immigration attorney before making decisions."
            }
            
            session_service.update_session_status(session_id, "completed", result=result)
            logger.info(f"✅ Enhanced LLM analysis completed and saved for session: {session_id}")
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback to direct LLM analysis
        logger.info("🔄 Attempting fallback to direct LLM analysis...")
        try:
            llm_service = get_llm_service()
            goals = profile_data.get("goals", {})
            target_countries = goals.get("targetCountries", goals.get("target_countries", []))
            
            from src.services.document_loader import get_document_loader
            doc_loader = get_document_loader()
            policy_context = doc_loader.get_policy_context(target_countries)
            country_data = doc_loader.get_country_data(target_countries)
            
            # Build user profile
            user_profile = {
                "age": profile_data.get("age"),
                "nationality": profile_data.get("nationality"),
                "education": profile_data.get("education", {}),
                "workExperience": profile_data.get("workExperience", {}),
                "financial": profile_data.get("financial", {}),
                "goals": {
                    "targetCountries": target_countries,
                    "timeline": goals.get("timeline"),
                    "priorities": goals.get("priorities", []),
                    "familySize": goals.get("familySize", 1),
                },
                "languages": profile_data.get("languages", [])
            }
            
            # Use direct LLM call as fallback
            analysis_result = llm_service.analyze_profile(
                user_profile=user_profile,
                policy_context=policy_context,
                country_data=country_data
            )
            
            result = {
                "sessionId": session_id,
                "profileSummary": analysis_result.get("profileSummary", {}),
                "rankedPaths": analysis_result.get("rankedPaths", []),
                "actionItems": analysis_result.get("actionItems", []),
                "citations": analysis_result.get("citations", []),
                "analysisTimestamp": datetime.now().isoformat(),
                "analysisMode": "fallback_llm",
                "disclaimer": "This analysis is generated by AI and is for informational purposes only."
            }
            
            session_service.update_session_status(session_id, "completed", result=result)
            logger.info(f"✅ Fallback LLM analysis completed for session: {session_id}")
            
        except Exception as fallback_error:
            logger.error(f"❌ Fallback also failed: {str(fallback_error)}")
            import traceback
            traceback.print_exc()
            session_service.update_session_status(session_id, "failed", error=str(fallback_error))


def _extract_paths_from_crew_result(crew_result: dict) -> list:
    """Extract and format paths from CrewAI result"""
    recommended_path = crew_result.get("recommendation", {}).get("recommended_path", {})
    
    if not recommended_path or recommended_path.get("path_id") == "path_1":
        # CrewAI didn't return structured paths, return default
        return [{
            "id": "path_1",
            "rank": 1,
            "name": "Recommended Immigration Path",
            "description": crew_result.get("recommendation", {}).get("summary", "Analysis completed"),
            "steps": [],
            "totalDuration": "Variable",
            "overallScore": 75,
            "approvalProbability": int(crew_result.get("recommendation", {}).get("approval_probability", 0.5) * 100),
            "riskLevel": "medium",
            "whyThisPath": "Based on comprehensive multi-agent analysis",
            "recommendation": crew_result.get("recommendation", {}).get("summary", "See detailed analysis")
        }]
    
    return [recommended_path]


def _extract_action_items_from_crew_result(crew_result: dict) -> list:
    """Extract action items from CrewAI result"""
    next_steps = crew_result.get("analysis", {}).get("next_steps", [])
    
    if not next_steps:
        return [{
            "order": 1,
            "action": "Review detailed analysis",
            "deadline": "Within 1 week",
            "priority": "high",
            "details": "Review the comprehensive analysis provided by our AI agents"
        }]
    
    return [
        {
            "order": i + 1,
            "action": step.get("action", "Action required"),
            "deadline": step.get("deadline", "ASAP"),
            "priority": step.get("priority", "medium"),
            "details": step.get("details", "")
        }
        for i, step in enumerate(next_steps)
    ]


# Demo endpoint with mock response (for frontend testing)
@router.post("/analyze/demo")
async def analyze_mobility_demo(profile: DemoProfileRequest):
    """
    Demo endpoint that returns a mock response for frontend testing.
    Use this during development to test UI without calling real LLM.
    """
    import uuid
    from datetime import datetime
    
    # Get first target country for personalized response
    target_country = profile.goals.targetCountries[0] if profile.goals.targetCountries else "Canada"
    target_country_name = {
        "CA": "Canada", "DE": "Germany", "US": "United States", 
        "GB": "United Kingdom", "AU": "Australia", "SG": "Singapore",
        "NL": "Netherlands", "AE": "UAE", "PT": "Portugal", "JP": "Japan"
    }.get(target_country, target_country)
    
    # Build response matching frontend AnalysisResponse interface
    mock_response = {
        "sessionId": str(uuid.uuid4()),
        "profileSummary": {
            "strengths": [
                f"Strong experience as {profile.workExperience.title} ({profile.workExperience.yearsOfExperience} years)",
                f"Good educational background in {profile.education.field}",
                f"Healthy savings of ${profile.financial.savingsUsd:,.0f} USD",
                f"Young age ({profile.age}) maximizes points in most systems"
            ],
            "weaknesses": [
                "No IELTS/language test score on file",
                "No job offer from destination country yet",
                "Limited international work experience"
            ],
            "eligibleVisas": [
                {"country": "Canada", "visaTypes": ["Express Entry", "Provincial Nominee"]},
                {"country": "Germany", "visaTypes": ["EU Blue Card", "Job Seeker Visa"]},
                {"country": "UAE", "visaTypes": ["Employment Visa", "Golden Visa"]},
                {"country": "Australia", "visaTypes": ["Skilled Worker 189", "Skilled Worker 190"]}
            ]
        },
        "rankedPaths": [
            {
                "id": "path_1",
                "rank": 1,
                "name": f"UAE Springboard to {target_country_name}",
                "description": f"Build international experience in UAE, then transition to {target_country_name}",
                "steps": [
                    {
                        "order": 1,
                        "country": "UAE",
                        "countryCode": "AE",
                        "visaType": "Employment Visa",
                        "duration": "2 years",
                        "purpose": "Gain international experience and savings",
                        "requirements": ["Job offer from UAE company", "Valid passport", "Medical clearance"],
                        "estimatedCost": 3000,
                        "currency": "USD"
                    },
                    {
                        "order": 2,
                        "country": target_country_name,
                        "countryCode": target_country,
                        "visaType": "Skilled Worker Visa",
                        "duration": "Permanent",
                        "purpose": "Permanent residence",
                        "requirements": ["Language test", "Skills assessment", "Proof of funds"],
                        "estimatedCost": 5000,
                        "currency": "USD"
                    }
                ],
                "totalDuration": "2-3 years",
                "overallScore": 85,
                "approvalProbability": 72,
                "riskLevel": "low",
                "whyThisPath": f"UAE provides an excellent stepping stone with tax-free income to build savings, international experience that strengthens your {target_country_name} application, and a thriving tech job market.",
                "recommendation": f"This is your best path. Start applying to UAE tech companies now while preparing for {target_country_name}'s language requirements."
            },
            {
                "id": "path_2",
                "rank": 2,
                "name": "Direct to Germany",
                "description": "Fast-track to Germany via EU Blue Card",
                "steps": [
                    {
                        "order": 1,
                        "country": "Germany",
                        "countryCode": "DE",
                        "visaType": "EU Blue Card",
                        "duration": "4 years",
                        "purpose": "Work and path to permanent residence",
                        "requirements": ["Job offer €45,300+ salary", "University degree", "Health insurance"],
                        "estimatedCost": 4000,
                        "currency": "USD"
                    }
                ],
                "totalDuration": "4 years to PR",
                "overallScore": 78,
                "approvalProbability": 68,
                "riskLevel": "medium",
                "whyThisPath": "Germany has strong demand for tech talent and offers a clear path to permanent residence. No language requirement for the initial visa.",
                "recommendation": "Good alternative if you want to stay in Europe. Start job hunting on LinkedIn and German job boards."
            },
            {
                "id": "path_3",
                "rank": 3,
                "name": f"Direct to {target_country_name}",
                "description": f"Apply directly to {target_country_name}'s skilled worker program",
                "steps": [
                    {
                        "order": 1,
                        "country": target_country_name,
                        "countryCode": target_country,
                        "visaType": "Express Entry / Skilled Worker",
                        "duration": "Permanent",
                        "purpose": "Direct permanent residence",
                        "requirements": ["IELTS 7+", "Education credential assessment", "Proof of funds", "Skills assessment"],
                        "estimatedCost": 6000,
                        "currency": "USD"
                    }
                ],
                "totalDuration": "6-12 months",
                "overallScore": 65,
                "approvalProbability": 55,
                "riskLevel": "medium",
                "whyThisPath": f"Fastest path to {target_country_name} if you meet all requirements. However, your current profile needs strengthening.",
                "recommendation": "Consider this after getting IELTS score and more experience, or as a backup while pursuing the UAE path."
            }
        ],
        "actionItems": [
            {
                "order": 1,
                "action": "Schedule IELTS/TOEFL exam",
                "deadline": "Within 2 weeks",
                "priority": "high",
                "details": "Most countries require English proficiency proof. Aim for IELTS 7+ or TOEFL 100+."
            },
            {
                "order": 2,
                "action": "Start applying to UAE tech companies",
                "deadline": "This week",
                "priority": "high",
                "details": "Focus on Dubai and Abu Dhabi. Update LinkedIn to 'Open to Work' for UAE."
            },
            {
                "order": 3,
                "action": "Get education credentials assessed",
                "deadline": "Within 1 month",
                "priority": "medium",
                "details": "Apply for WES (Canada) or equivalent credential evaluation."
            },
            {
                "order": 4,
                "action": "Build emergency fund",
                "deadline": "Ongoing",
                "priority": "medium",
                "details": f"Aim for ${15000:,} in liquid savings for immigration costs and initial settlement."
            }
        ],
        "citations": [
            {
                "id": "cite_1",
                "source": "Canada Express Entry - Official IRCC Guidelines",
                "text": "Candidates need minimum 67 points under the Federal Skilled Worker criteria including language, education, and work experience.",
                "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"
            },
            {
                "id": "cite_2",
                "source": "UAE Employment Visa Requirements",
                "text": "Employment visa requires sponsorship from a UAE-registered employer, valid passport with 6+ months validity, and medical fitness certificate.",
                "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa"
            },
            {
                "id": "cite_3",
                "source": "Germany EU Blue Card Regulation",
                "text": "EU Blue Card requires a German university degree or recognized equivalent, and a job offer with minimum annual salary of €45,300 (or €41,041 for shortage occupations).",
                "url": "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card"
            }
        ],
        "analysisTimestamp": datetime.now().isoformat(),
        "disclaimer": "This analysis is for informational purposes only and does not constitute legal immigration advice. Immigration policies change frequently. Please verify all information with official government sources and consult a licensed immigration attorney before making decisions."
    }
    
    return mock_response
