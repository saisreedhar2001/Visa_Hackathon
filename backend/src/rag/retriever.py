"""
RAG Retriever - Main interface for retrieving relevant context
"""
from typing import List, Dict, Optional

from src.rag.vector_store import get_vector_store
from src.core.logging import logger


class RAGRetriever:
    """
    Main retriever class that agents use to get relevant context.
    Handles querying, formatting, and citation extraction.
    """
    
    def __init__(self):
        self.vector_store = get_vector_store()
    
    def retrieve_for_profile(
        self,
        user_profile: Dict,
        top_k: int = 5
    ) -> Dict:
        """
        Retrieve context relevant to user's profile.
        Used by Profile Analyst agent.
        
        Args:
            user_profile: User's profile data
            top_k: Number of documents to retrieve
            
        Returns:
            Dict with retrieved context and citations
        """
        # Build query from profile
        query_parts = []
        
        if 'nationality' in user_profile:
            query_parts.append(f"visa options for {user_profile['nationality']} citizens")
        
        if 'skills' in user_profile:
            skills = ', '.join(user_profile['skills'][:3])
            query_parts.append(f"skilled worker visa requirements {skills}")
        
        if 'education' in user_profile:
            degree = user_profile['education'].get('degree', '')
            query_parts.append(f"{degree} qualification recognition")
        
        query = ' '.join(query_parts)
        
        results = self.vector_store.query(
            query_text=query,
            top_k=top_k,
            namespace="policies"
        )
        
        return self._format_results(results, "profile_context")
    
    def retrieve_for_country(
        self,
        country: str,
        visa_type: Optional[str] = None,
        top_k: int = 5
    ) -> Dict:
        """
        Retrieve context for a specific country.
        Used by Path Generator and Risk Assessor agents.
        """
        query = f"{country} immigration visa requirements"
        if visa_type:
            query += f" {visa_type}"
        
        # Filter by country if metadata supports it
        filter_dict = {"country": country.lower()} if country else None
        
        results = self.vector_store.query(
            query_text=query,
            top_k=top_k,
            namespace="policies",
            filter_dict=filter_dict
        )
        
        return self._format_results(results, "country_context")
    
    def retrieve_for_path(
        self,
        origin: str,
        destination: str,
        intermediate_countries: List[str] = None,
        top_k: int = 8
    ) -> Dict:
        """
        Retrieve context for a mobility path.
        Gets policies for all countries in the path.
        """
        countries = [origin, destination]
        if intermediate_countries:
            countries.extend(intermediate_countries)
        
        query = f"visa pathway from {origin} to {destination}"
        if intermediate_countries:
            query += f" via {', '.join(intermediate_countries)}"
        
        results = self.vector_store.query(
            query_text=query,
            top_k=top_k,
            namespace="policies"
        )
        
        return self._format_results(results, "path_context")
    
    def retrieve_financial_requirements(
        self,
        country: str,
        visa_type: str
    ) -> Dict:
        """
        Retrieve financial threshold information.
        """
        query = f"{country} {visa_type} financial requirements savings income proof"
        
        results = self.vector_store.query(
            query_text=query,
            top_k=3,
            namespace="financial"
        )
        
        return self._format_results(results, "financial_context")
    
    def retrieve_all_context(
        self,
        user_profile: Dict,
        target_countries: List[str]
    ) -> Dict:
        """
        Comprehensive retrieval for full analysis.
        Combines profile, country, and financial context.
        """
        all_context = {
            "profile_context": "",
            "country_contexts": {},
            "policy_snippets": "",
            "citations": []
        }
        
        # Get profile context
        profile_result = self.retrieve_for_profile(user_profile)
        all_context["profile_context"] = profile_result.get("context", "")
        all_context["citations"].extend(profile_result.get("citations", []))
        
        # Get context for each target country
        for country in target_countries:
            country_result = self.retrieve_for_country(country)
            all_context["country_contexts"][country] = country_result.get("context", "")
            all_context["citations"].extend(country_result.get("citations", []))
        
        # Compile policy snippets
        all_context["policy_snippets"] = self._compile_policy_snippets(all_context)
        
        return all_context
    
    def _format_results(self, results: List[Dict], context_type: str) -> Dict:
        """Format vector store results for agent consumption"""
        if not results:
            return {
                "context": "",
                "citations": [],
                "type": context_type
            }
        
        context_parts = []
        citations = []
        
        for i, result in enumerate(results):
            # Add to context
            context_parts.append(f"[{i+1}] {result['text']}")
            
            # Create citation
            citations.append({
                "id": f"cite_{i+1}",
                "source": result['metadata'].get('source', 'Policy Document'),
                "title": result['metadata'].get('title', 'Immigration Policy'),
                "snippet": result['text'][:200] + "..." if len(result['text']) > 200 else result['text'],
                "country": result['metadata'].get('country', 'Unknown'),
                "relevance_score": result['score'],
                "url": result['metadata'].get('url', None)
            })
        
        return {
            "context": "\n\n".join(context_parts),
            "citations": citations,
            "type": context_type
        }
    
    def _compile_policy_snippets(self, all_context: Dict) -> str:
        """Compile all retrieved context into a single policy summary"""
        snippets = []
        
        if all_context.get("profile_context"):
            snippets.append("## Profile-Relevant Policies\n" + all_context["profile_context"])
        
        for country, context in all_context.get("country_contexts", {}).items():
            if context:
                snippets.append(f"## {country.title()} Policies\n{context}")
        
        return "\n\n---\n\n".join(snippets)


# Singleton instance
_retriever = None

def get_retriever() -> RAGRetriever:
    """Get or create the retriever singleton"""
    global _retriever
    if _retriever is None:
        _retriever = RAGRetriever()
    return _retriever
