"""CrewAI Crew Definition - The Orchestrator that controls all agents.

This module configures CrewAI to use Groq via the ``groq/`` provider on
``crewai.LLM``. We do **not** call OpenAI; a dummy ``OPENAI_API_KEY`` is
only set to satisfy internal validation.
"""

import os
import json
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

from crewai import Crew, Process, LLM

from src.agents.profile_analyst import create_profile_analyst
from src.agents.path_generator import create_path_generator
from src.agents.risk_assessor import create_risk_assessor
from src.agents.recommendation_synthesizer import (
    create_recommendation_synthesizer,
)
from src.orchestrator.task_definitions import (
    create_profile_analysis_task,
    create_path_generation_task,
    create_risk_assessment_task,
    create_synthesis_task,
)
from src.core.config import settings
from src.core.logging import logger


# Disable CrewAI telemetry and OpenTelemetry noise
os.environ.setdefault("CREWAI_DISABLE_TELEMETRY", "true")
os.environ.setdefault("OTEL_SDK_DISABLED", "true")

# Ensure GROQ_API_KEY is available for anything that reads from env
if settings.GROQ_API_KEY:
    os.environ.setdefault("GROQ_API_KEY", settings.GROQ_API_KEY)

# Dummy OpenAI key to keep CrewAI's provider validation happy.
os.environ.setdefault("OPENAI_API_KEY", "dummy")


class AgentExecutionTracker:
    """Tracks each agent's execution status and output."""
    
    def __init__(self):
        self.agent_outputs: Dict[str, Dict] = {}
        self.execution_order: list = []
        self.start_time = datetime.utcnow()
    
    def record_agent_start(self, agent_name: str):
        """Record when an agent starts execution."""
        self.agent_outputs[agent_name] = {
            "status": "running",
            "started_at": datetime.utcnow().isoformat(),
            "output": None
        }
        self.execution_order.append(agent_name)
        logger.info(f"🚀 Agent Started: {agent_name}")
    
    def record_agent_complete(self, agent_name: str, output: Any):
        """Record when an agent completes execution."""
        if agent_name in self.agent_outputs:
            self.agent_outputs[agent_name]["status"] = "completed"
            self.agent_outputs[agent_name]["completed_at"] = datetime.utcnow().isoformat()
            self.agent_outputs[agent_name]["output"] = output
            logger.info(f"✅ Agent Completed: {agent_name}")
    
    def get_summary(self) -> Dict:
        """Get execution summary."""
        return {
            "total_agents": len(self.agent_outputs),
            "execution_order": self.execution_order,
            "duration_seconds": (datetime.utcnow() - self.start_time).total_seconds(),
            "agents": self.agent_outputs
        }


class MobilityAnalysisCrew:
    """
    The main orchestrator that coordinates all AI agents.
    
    This crew manages the complete analysis workflow:
    1. Profile Analyst → Understands the user
    2. Path Generator → Creates mobility options
    3. Risk Assessor → Evaluates feasibility
    4. Recommendation Synthesizer → Produces final advice
    """
    
    def __init__(self):
        """Initialize the crew with Groq LLM and agents."""

        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set; cannot initialize Groq LLM")

        self.llm = LLM(
            model=f"groq/{settings.GROQ_MODEL}",
            api_key=settings.GROQ_API_KEY,
            temperature=0.7,
        )

        logger.info(
            f"🚀 Initializing CrewAI with Groq model: groq/{settings.GROQ_MODEL}"
        )
        
        self.tracker = AgentExecutionTracker()
        
        # Initialize all agents with Groq LLM
        self.profile_analyst = create_profile_analyst(self.llm)
        self.path_generator = create_path_generator(self.llm)
        self.risk_assessor = create_risk_assessor(self.llm)
        self.recommendation_synthesizer = create_recommendation_synthesizer(self.llm)
        
        logger.info("✅ MobilityAnalysisCrew initialized with 4 agents")
    
    def analyze(self, user_profile: dict, rag_context: dict = None) -> dict:
        """
        Run the complete analysis workflow with proper orchestration.
        
        Args:
            user_profile: User's profile data
            rag_context: Retrieved context from RAG layer
            
        Returns:
            Complete analysis result with structured paths and recommendations
        """
        logger.info("="*80)
        logger.info(f"🎯 Starting CrewAI Orchestration for: {user_profile.get('nationality', 'Unknown')} national")
        logger.info("="*80)
        
        # Track agent execution
        self.tracker = AgentExecutionTracker()
        
        # Create tasks with proper context
        profile_task = create_profile_analysis_task(
            agent=self.profile_analyst,
            user_profile=user_profile,
            rag_context=rag_context
        )
        
        path_task = create_path_generation_task(
            agent=self.path_generator,
            user_profile=user_profile,
            context=[profile_task]
        )
        
        risk_task = create_risk_assessment_task(
            agent=self.risk_assessor,
            user_profile=user_profile,
            context=[profile_task, path_task]
        )
        
        synthesis_task = create_synthesis_task(
            agent=self.recommendation_synthesizer,
            rag_context=rag_context,
            context=[profile_task, path_task, risk_task]
        )
        
        # Create the crew with sequential process
        crew = Crew(
            agents=[
                self.profile_analyst,
                self.path_generator,
                self.risk_assessor,
                self.recommendation_synthesizer
            ],
            tasks=[
                profile_task,
                path_task,
                risk_task,
                synthesis_task
            ],
            process=Process.sequential,
            verbose=True,
            memory=False,
            embedder=None,
            full_output=True,
            share_crew=False,
        )
        
        # Execute the crew
        logger.info("🔄 Executing crew workflow sequentially...")
        logger.info("   Step 1/4: Profile Analysis")
        logger.info("   Step 2/4: Path Generation")
        logger.info("   Step 3/4: Risk Assessment")
        logger.info("   Step 4/4: Final Synthesis")
        
        try:
            result = crew.kickoff()
            logger.info("✅ Crew execution completed successfully")
        except Exception as e:
            logger.error(f"❌ Crew execution failed: {str(e)}")
            raise
        
        # Process and structure the result
        final_result = self._process_crew_output(
            crew_result=result,
            user_profile=user_profile,
            rag_context=rag_context
        )
        
        logger.info("="*80)
        logger.info("🎉 Analysis Complete!")
        logger.info("="*80)
        
        return final_result
    
    def _process_crew_output(
        self, 
        crew_result: Any, 
        user_profile: dict,
        rag_context: dict = None
    ) -> dict:
        """Process the raw CrewAI output into structured API response."""
        # Get raw output
        if hasattr(crew_result, 'raw'):
            raw_output = crew_result.raw
        else:
            raw_output = str(crew_result)
        
        # Try to get individual task outputs
        task_outputs = {}
        if hasattr(crew_result, 'tasks_output'):
            agent_names = ["profile_analyst", "path_generator", "risk_assessor", "synthesizer"]
            for i, task_output in enumerate(crew_result.tasks_output):
                if i < len(agent_names):
                    if hasattr(task_output, 'raw'):
                        task_outputs[agent_names[i]] = task_output.raw
                    else:
                        task_outputs[agent_names[i]] = str(task_output)
        
        # Parse the paths from the output
        target_countries = user_profile.get('goals', {}).get('targetCountries', ['Canada', 'Germany'])
        parsed_paths = self._parse_mobility_paths(raw_output, task_outputs.get("path_generator", ""), target_countries)
        
        # Parse risk assessment
        risk_analysis = self._parse_risk_assessment(task_outputs.get("risk_assessor", ""))
        
        # Parse profile summary
        profile_summary = self._parse_profile_summary(task_outputs.get("profile_analyst", ""))
        
        # Parse action items
        action_items = self._parse_action_items(raw_output)
        
        # Build final response
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "profileSummary": profile_summary,
            "rankedPaths": parsed_paths,
            "riskAnalysis": risk_analysis,
            "actionItems": action_items,
            "agentOutputs": {
                "profileAnalyst": task_outputs.get("profile_analyst", "")[:1000],
                "pathGenerator": task_outputs.get("path_generator", "")[:1000],
                "riskAssessor": task_outputs.get("risk_assessor", "")[:1000],
                "synthesizer": (task_outputs.get("synthesizer", "") or raw_output)[:1000]
            },
            "executionTrace": self.tracker.get_summary(),
            "citations": self._extract_citations(rag_context),
            "metadata": {
                "agents_used": 4,
                "workflow": "crewai_sequential",
                "model": f"groq/{settings.GROQ_MODEL}",
                "processing_time_seconds": self.tracker.get_summary().get("duration_seconds", 0)
            }
        }
    
    def _parse_mobility_paths(self, raw_output: str, path_generator_output: str, target_countries: List[str]) -> list:
        """Parse mobility paths from agent output."""
        paths = []
        combined = path_generator_output + "\n" + raw_output
        
        # Country code mapping
        country_codes = {
            "India": "IN", "Canada": "CA", "USA": "US", "United States": "US",
            "Germany": "DE", "UK": "GB", "United Kingdom": "GB", "Australia": "AU",
            "UAE": "AE", "Singapore": "SG", "Netherlands": "NL", "Portugal": "PT",
            "Japan": "JP", "Dubai": "AE"
        }
        
        # Look for country transitions
        transition_pattern = r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[→➔->]+\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)"
        transitions = re.findall(transition_pattern, combined)
        
        if transitions:
            visited = set()
            steps = []
            for from_country, to_country in transitions:
                if from_country not in visited:
                    visited.add(from_country)
                    steps.append({
                        "order": len(steps) + 1,
                        "country": from_country,
                        "countryCode": country_codes.get(from_country, "XX"),
                        "visaType": "Work Visa",
                        "duration": "1-2 years",
                        "purpose": "Initial step or stepping stone",
                        "requirements": ["Valid passport", "Work permit"],
                        "estimatedCost": 5000,
                        "currency": "USD"
                    })
                if to_country not in visited:
                    visited.add(to_country)
                    steps.append({
                        "order": len(steps) + 1,
                        "country": to_country,
                        "countryCode": country_codes.get(to_country, "XX"),
                        "visaType": "Skilled Worker Visa",
                        "duration": "2-5 years",
                        "purpose": "Target destination",
                        "requirements": ["Job offer", "Qualification recognition"],
                        "estimatedCost": 10000,
                        "currency": "USD"
                    })
            
            if steps:
                paths.append({
                    "id": "path_1",
                    "rank": 1,
                    "name": f"Multi-Step Route: {steps[0]['country']} → {steps[-1]['country']}",
                    "description": f"Strategic pathway from {steps[0]['country']} to {steps[-1]['country']}",
                    "steps": steps,
                    "totalDuration": f"{len(steps) * 2} years estimated",
                    "overallScore": 78,
                    "approvalProbability": 72,
                    "riskLevel": "medium",
                    "whyThisPath": "This path optimizes your profile strengths and uses stepping stones strategically.",
                    "recommendation": "Recommended based on profile match"
                })
        
        # Create paths for target countries if no transitions found
        for i, country in enumerate(target_countries[:3]):
            if not any(country in str(p) for p in paths):
                paths.append({
                    "id": f"path_{len(paths) + 1}",
                    "rank": len(paths) + 1,
                    "name": f"Direct Path to {country}",
                    "description": f"Direct immigration pathway to {country}",
                    "steps": [
                        {
                            "order": 1,
                            "country": country,
                            "countryCode": country_codes.get(country, country[:2].upper()),
                            "visaType": "Skilled Worker Visa",
                            "duration": "2-4 years",
                            "purpose": "Primary work authorization and settlement",
                            "requirements": ["Job offer", "Skills assessment", "Language test"],
                            "estimatedCost": 8000,
                            "currency": "USD"
                        }
                    ],
                    "totalDuration": "2-4 years",
                    "overallScore": 75 - (i * 8),
                    "approvalProbability": 70 - (i * 8),
                    "riskLevel": ["low", "medium", "medium"][min(i, 2)],
                    "whyThisPath": f"{country} matches your skills and has active demand in your field.",
                    "recommendation": "Strong alternative" if i > 0 else "Primary recommendation"
                })
        
        return paths[:4]  # Return max 4 paths
    
    def _parse_risk_assessment(self, risk_output: str) -> dict:
        """Parse risk assessment from agent output."""
        risk_score = 45
        score_match = re.search(r"(?:risk\s*score|score)[:\s]*(\d+)", risk_output, re.IGNORECASE)
        if score_match:
            risk_score = int(score_match.group(1))
        
        probability = 65
        prob_match = re.search(r"(\d+)\s*%", risk_output)
        if prob_match:
            probability = int(prob_match.group(1))
        
        return {
            "overallRiskScore": risk_score,
            "approvalProbability": probability,
            "riskLevel": "low" if risk_score < 30 else ("high" if risk_score > 70 else "medium"),
            "factors": ["Documentation completeness", "Financial stability", "Skills demand match"],
            "mitigations": ["Prepare all documents in advance", "Maintain proof of funds", "Get skills assessed"]
        }
    
    def _parse_profile_summary(self, profile_output: str) -> dict:
        """Parse profile summary from agent output."""
        strengths = []
        weaknesses = []
        
        strength_keywords = ["strength", "advantage", "strong", "qualified", "eligible", "positive", "benefit"]
        weakness_keywords = ["weakness", "concern", "gap", "lacking", "improve", "challenge", "risk"]
        
        lines = profile_output.split("\n")
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in strength_keywords) and len(line) > 15:
                cleaned = re.sub(r'^[\s\-\*\d\.]+', '', line).strip()
                if cleaned and len(cleaned) > 10:
                    strengths.append(cleaned[:150])
            elif any(kw in line_lower for kw in weakness_keywords) and len(line) > 15:
                cleaned = re.sub(r'^[\s\-\*\d\.]+', '', line).strip()
                if cleaned and len(cleaned) > 10:
                    weaknesses.append(cleaned[:150])
        
        if not strengths:
            strengths = [
                "Educational qualifications recognized internationally",
                "Relevant work experience in high-demand field",
                "Financial resources meet visa requirements"
            ]
        if not weaknesses:
            weaknesses = [
                "May need language proficiency certification",
                "Consider gathering additional documentation"
            ]
        
        return {
            "strengths": strengths[:5],
            "weaknesses": weaknesses[:5],
            "eligibleVisas": []
        }
    
    def _parse_action_items(self, output: str) -> list:
        """Parse action items from synthesizer output."""
        action_items = []
        
        action_patterns = [
            r"(?:\d+[\.\)]\s*)([A-Z][^\.]{10,100}\.)",
            r"(?:Step|Action|Task|TODO)\s*\d*[:\s]*([^\n]{15,100})"
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, output)
            for i, match in enumerate(matches[:6]):
                action_items.append({
                    "order": i + 1,
                    "action": match.strip()[:150],
                    "priority": "high" if i < 2 else ("medium" if i < 4 else "low"),
                    "deadline": None,
                    "details": None
                })
        
        if not action_items:
            action_items = [
                {"order": 1, "action": "Research visa requirements for target countries", "priority": "high"},
                {"order": 2, "action": "Gather educational credentials and get them authenticated", "priority": "high"},
                {"order": 3, "action": "Take required language proficiency tests (IELTS/TOEFL)", "priority": "medium"},
                {"order": 4, "action": "Prepare proof of funds documentation", "priority": "medium"},
                {"order": 5, "action": "Create a timeline for application submission", "priority": "low"},
            ]
        
        return action_items
    
    def _extract_citations(self, rag_context: dict) -> list:
        """Extract citations from RAG context."""
        citations = []
        if rag_context and 'policy_context' in rag_context:
            citations.append({
                "id": "1",
                "source": "Immigration Policy Database",
                "text": "Based on current immigration policies and official requirements.",
                "url": None
            })
        return citations


# Singleton instance for reuse
_crew_instance: Optional[MobilityAnalysisCrew] = None


def get_mobility_crew() -> MobilityAnalysisCrew:
    """Get or create the MobilityAnalysisCrew singleton."""
    global _crew_instance
    if _crew_instance is None:
        _crew_instance = MobilityAnalysisCrew()
    return _crew_instance
