"""
Handoff Manager - Manages data passing between agents
"""
from typing import Dict, Any, List
from datetime import datetime
import json

from src.core.logging import logger


class HandoffManager:
    """
    Manages the handoff of data between agents.
    
    Responsibilities:
    1. Transform outputs from one agent to inputs for the next
    2. Maintain context chain across the workflow
    3. Extract and preserve citations
    4. Structure final output for API response
    """
    
    def __init__(self):
        self.context_chain: List[Dict] = []
        self.citations: List[Dict] = []
    
    def record_handoff(
        self, 
        from_agent: str, 
        to_agent: str, 
        data: Dict
    ) -> None:
        """Record a handoff between agents for traceability"""
        handoff_record = {
            "from": from_agent,
            "to": to_agent,
            "timestamp": datetime.utcnow().isoformat(),
            "data_keys": list(data.keys()) if isinstance(data, dict) else ["raw_output"]
        }
        self.context_chain.append(handoff_record)
        logger.debug(f"Handoff recorded: {from_agent} → {to_agent}")
    
    def transform_profile_to_paths(self, profile_analysis: str) -> Dict:
        """
        Transform Profile Analyst output for Path Generator.
        Extracts key information needed for path generation.
        """
        return {
            "profile_analysis": profile_analysis,
            "extracted_at": datetime.utcnow().isoformat()
        }
    
    def transform_paths_to_risk(
        self, 
        profile_analysis: str, 
        mobility_paths: str
    ) -> Dict:
        """
        Transform outputs for Risk Assessor.
        Combines profile and paths for comprehensive risk analysis.
        """
        return {
            "profile_summary": profile_analysis,
            "proposed_paths": mobility_paths,
            "extracted_at": datetime.utcnow().isoformat()
        }
    
    def transform_all_to_synthesis(
        self,
        profile_analysis: str,
        mobility_paths: str,
        risk_assessment: str,
        rag_context: Dict = None
    ) -> Dict:
        """
        Transform all outputs for final synthesis.
        Prepares complete context for recommendation generation.
        """
        return {
            "profile_analysis": profile_analysis,
            "proposed_paths": mobility_paths,
            "risk_assessment": risk_assessment,
            "policy_context": rag_context.get('policy_snippets', '') if rag_context else '',
            "citations": rag_context.get('citations', []) if rag_context else [],
            "extracted_at": datetime.utcnow().isoformat()
        }
    
    def extract_citations(self, agent_output: str, source_context: Dict) -> List[Dict]:
        """
        Extract citations from agent output and source context.
        Returns structured citations for UI display.
        """
        citations = []
        
        if source_context and 'citations' in source_context:
            for citation in source_context['citations']:
                citations.append({
                    "id": len(citations) + 1,
                    "source": citation.get('source', 'Unknown'),
                    "title": citation.get('title', 'Policy Document'),
                    "snippet": citation.get('snippet', ''),
                    "relevance": citation.get('relevance', 'general'),
                    "url": citation.get('url', None)
                })
        
        self.citations.extend(citations)
        return citations
    
    def process_final_output(
        self, 
        raw_result: Any, 
        user_profile: Dict
    ) -> Dict:
        """
        Process the raw crew output into structured API response.
        This is what gets sent to the frontend.
        """
        # Handle CrewAI output format
        if hasattr(raw_result, 'raw'):
            raw_output = raw_result.raw
        else:
            raw_output = str(raw_result)
        
        # Structure the final response
        response = {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_profile.get('id', 'anonymous'),
            
            # Main recommendation content
            "recommendation": {
                "raw_output": raw_output,
                "summary": self._extract_summary(raw_output),
                "recommended_path": self._extract_recommended_path(raw_output),
                "alternatives": self._extract_alternatives(raw_output),
                "approval_probability": self._extract_probability(raw_output),
            },
            
            # Supporting information
            "analysis": {
                "strengths": self._extract_strengths(raw_output),
                "concerns": self._extract_concerns(raw_output),
                "next_steps": self._extract_next_steps(raw_output),
            },
            
            # Traceability
            "citations": self.citations,
            "workflow_trace": self.context_chain,
            
            # Metadata
            "metadata": {
                "agents_used": 4,
                "workflow": "full_analysis",
                "model": "gpt-4-turbo-preview"
            }
        }
        
        return response
    
    def _extract_summary(self, output: str) -> str:
        """Extract executive summary from output"""
        # Simple extraction - in production, use more sophisticated parsing
        if "Executive Summary" in output:
            start = output.find("Executive Summary")
            end = output.find("\n\n", start)
            return output[start:end].replace("Executive Summary", "").strip(": \n")
        return "Analysis complete. See detailed recommendation below."
    
    def _extract_recommended_path(self, output: str) -> Dict:
        """Extract the primary recommended path"""
        # Placeholder - actual implementation would parse structured output
        return {
            "path_id": "path_1",
            "route": "To be parsed from output",
            "confidence": 0.75
        }
    
    def _extract_alternatives(self, output: str) -> List[Dict]:
        """Extract alternative paths"""
        return []
    
    def _extract_probability(self, output: str) -> float:
        """Extract approval probability"""
        # Look for percentage in output
        import re
        matches = re.findall(r'(\d+)%', output)
        if matches:
            return float(matches[0]) / 100
        return 0.5
    
    def _extract_strengths(self, output: str) -> List[str]:
        """Extract identified strengths"""
        return []
    
    def _extract_concerns(self, output: str) -> List[str]:
        """Extract identified concerns"""
        return []
    
    def _extract_next_steps(self, output: str) -> List[Dict]:
        """Extract action items"""
        return []
