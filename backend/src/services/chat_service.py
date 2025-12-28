"""
Chat Service - RAG-powered chat assistant for visa queries
Uses Groq LLM with RAG context from the knowledge base
"""
import httpx
from typing import Dict, List, Optional
from src.core.config import settings
from src.core.logging import logger
from src.services.document_loader import get_document_loader

# Try to import RAG retriever
try:
    from src.rag.retriever import get_retriever
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    logger.warning("RAG retriever not available for chat service")


class ChatService:
    """
    Chat service that provides RAG-powered responses for visa queries.
    Uses Groq LLM for fast responses with context from the knowledge base.
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL
        self.model = settings.GROQ_MODEL
        
        # Try Gemini as fallback if configured
        self.gemini_api_key = getattr(settings, 'GEMINI_API_KEY', None)
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Initialize document loader for context
        self.doc_loader = get_document_loader()
        
        # Initialize RAG retriever if available
        self.retriever = get_retriever() if RAG_AVAILABLE else None
        
        # Conversation history per session
        self.conversations: Dict[str, List[Dict]] = {}
        
        logger.info(f"ChatService initialized with model: {self.model}")
    
    def _call_groq_api(
        self, 
        messages: List[Dict], 
        max_tokens: int = 2000, 
        temperature: float = 0.7
    ) -> str:
        """Make a direct HTTP call to Groq API."""
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise
    
    def _get_rag_context(self, query: str, countries: List[str] = None) -> Dict:
        """
        Get relevant context from RAG for the query.
        """
        context_parts = []
        citations = []
        
        # Use RAG retriever if available
        if self.retriever:
            try:
                # Query the vector store
                if countries:
                    for country in countries:
                        result = self.retriever.retrieve_for_country(country, top_k=3)
                        if result.get("context"):
                            context_parts.append(f"## {country} Policies\n{result['context']}")
                        citations.extend(result.get("citations", []))
                
                # General query for visa-related information
                from src.rag.vector_store import get_vector_store
                vector_store = get_vector_store()
                results = vector_store.query(query_text=query, top_k=5, namespace="policies")
                
                for i, result in enumerate(results):
                    context_parts.append(f"[{i+1}] {result['text']}")
                    citations.append({
                        "id": f"cite_{i+1}",
                        "source": result['metadata'].get('source', 'Policy Document'),
                        "text": result['text'][:200] + "..." if len(result['text']) > 200 else result['text'],
                    })
                    
            except Exception as e:
                logger.warning(f"RAG retrieval failed: {e}, falling back to document loader")
        
        # Fallback to document loader if RAG not available or failed
        if not context_parts:
            # Get all policy documents as context
            all_policies = self.doc_loader.get_all_policies()
            
            # Simple keyword matching to find relevant sections
            query_lower = query.lower()
            for policy_name, policy_content in all_policies.items():
                if any(keyword in query_lower for keyword in ['h1b', 'h-1b', 'usa', 'us', 'america', 'united states']):
                    if 'usa' in policy_name.lower() or 'h1b' in policy_name.lower():
                        context_parts.append(f"## USA H-1B Policy\n{policy_content[:3000]}")
                        break
                        
                if any(keyword in query_lower for keyword in ['express entry', 'canada', 'canadian', 'ca']):
                    if 'canada' in policy_name.lower():
                        context_parts.append(f"## Canada Express Entry\n{policy_content[:3000]}")
                        break
                        
                if any(keyword in query_lower for keyword in ['blue card', 'germany', 'german', 'de']):
                    if 'germany' in policy_name.lower():
                        context_parts.append(f"## Germany Blue Card\n{policy_content[:3000]}")
                        break
                        
                if any(keyword in query_lower for keyword in ['uk', 'britain', 'british', 'england', 'skilled worker']):
                    if 'uk' in policy_name.lower():
                        context_parts.append(f"## UK Skilled Worker Visa\n{policy_content[:3000]}")
                        break
                        
                if any(keyword in query_lower for keyword in ['australia', 'australian', 'au']):
                    if 'australia' in policy_name.lower():
                        context_parts.append(f"## Australia Skilled Migration\n{policy_content[:3000]}")
                        break
            
            # If still no context, add general stepping stone strategies
            if not context_parts and 'stepping_stone' in self.doc_loader._policy_cache:
                context_parts.append(self.doc_loader._policy_cache['stepping_stone_strategies'][:3000])
        
        return {
            "context": "\n\n---\n\n".join(context_parts) if context_parts else "",
            "citations": citations
        }
    
    def _detect_countries(self, text: str) -> List[str]:
        """Detect country mentions in text."""
        country_keywords = {
            "US": ["usa", "us", "america", "united states", "h1b", "h-1b"],
            "CA": ["canada", "canadian", "express entry"],
            "DE": ["germany", "german", "blue card"],
            "GB": ["uk", "britain", "british", "england", "united kingdom"],
            "AU": ["australia", "australian"],
            "AE": ["uae", "dubai", "emirates"],
            "SG": ["singapore"],
            "NL": ["netherlands", "dutch", "holland"],
            "PT": ["portugal", "portuguese"],
            "JP": ["japan", "japanese"],
        }
        
        text_lower = text.lower()
        detected = []
        
        for code, keywords in country_keywords.items():
            if any(kw in text_lower for kw in keywords):
                detected.append(code)
        
        return detected
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the chat assistant."""
        return """You are an expert AI immigration consultant assistant named "Visa Assistant" powered by advanced RAG (Retrieval-Augmented Generation) technology. You have access to comprehensive knowledge about global immigration policies, visa requirements, and mobility pathways.

Your capabilities include:
- Answering questions about visa requirements for different countries
- Explaining immigration pathways and processes
- Providing information about work permits, skilled worker visas, and residency programs
- Offering guidance on stepping-stone strategies (using one country as a pathway to another)
- Explaining eligibility criteria, costs, and timelines
- Comparing visa options across different countries

Guidelines:
1. Be accurate and cite the knowledge base when possible
2. Be helpful and provide actionable information
3. If you're unsure about something, say so rather than making up information
4. Always remind users that immigration policies change and they should verify with official sources
5. Be conversational and friendly while remaining professional
6. If asked about specific personal situations, provide general guidance and recommend consulting an immigration attorney
7. Structure your responses clearly with headings or bullet points when appropriate
8. Provide specific details like processing times, costs, and requirements when available

IMPORTANT: Base your responses on the provided context from the knowledge base. If the context doesn't contain relevant information, use your general knowledge but indicate this to the user."""

    def chat(
        self, 
        session_id: str, 
        message: str,
        context_countries: List[str] = None
    ) -> Dict:
        """
        Process a chat message and return a response.
        
        Args:
            session_id: Unique session identifier for conversation history
            message: User's message
            context_countries: Optional list of country codes for focused context
            
        Returns:
            Dict with response and metadata
        """
        logger.info(f"Chat request - Session: {session_id}, Message: {message[:100]}...")
        
        # Initialize conversation history if needed
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        
        # Detect countries mentioned in the message
        detected_countries = self._detect_countries(message)
        if context_countries:
            detected_countries.extend(context_countries)
        detected_countries = list(set(detected_countries))
        
        # Get RAG context
        rag_result = self._get_rag_context(message, detected_countries)
        context = rag_result["context"]
        citations = rag_result["citations"]
        
        # Build messages
        messages = [
            {"role": "system", "content": self.get_system_prompt()}
        ]
        
        # Add context if available
        if context:
            messages.append({
                "role": "system",
                "content": f"Here is relevant information from the knowledge base to help answer the user's question:\n\n{context}"
            })
        
        # Add conversation history (last 10 messages)
        messages.extend(self.conversations[session_id][-10:])
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # Call LLM
        try:
            response = self._call_groq_api(messages)
            
            # Update conversation history
            self.conversations[session_id].append({"role": "user", "content": message})
            self.conversations[session_id].append({"role": "assistant", "content": response})
            
            # Keep history manageable (last 20 messages)
            if len(self.conversations[session_id]) > 20:
                self.conversations[session_id] = self.conversations[session_id][-20:]
            
            return {
                "response": response,
                "session_id": session_id,
                "citations": citations[:5],  # Top 5 citations
                "detected_countries": detected_countries,
                "has_context": bool(context)
            }
            
        except Exception as e:
            logger.error(f"Chat failed: {e}")
            raise
    
    def clear_conversation(self, session_id: str) -> bool:
        """Clear conversation history for a session."""
        if session_id in self.conversations:
            del self.conversations[session_id]
            return True
        return False
    
    def get_suggested_questions(self) -> List[str]:
        """Get suggested starter questions for the chat."""
        return [
            "What are the requirements for a US H-1B visa?",
            "How does Canada's Express Entry system work?",
            "What is the Germany Blue Card and who is eligible?",
            "Compare work visa options between UK and Canada",
            "What are good stepping-stone countries to reach the US?",
            "How much savings do I need to immigrate to Australia?",
            "What's the difference between work visas and permanent residency?",
            "Which countries have the fastest processing times for skilled workers?",
        ]


# Singleton instance
_chat_service = None

def get_chat_service() -> ChatService:
    """Get or create the chat service singleton"""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
