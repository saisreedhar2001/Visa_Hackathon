"""
LLM Service - Groq integration for the analysis
Uses httpx for direct API calls to avoid SDK version conflicts
"""
import json
import httpx
from typing import Dict, List, Optional
from src.core.config import settings
from src.core.logging import logger


class LLMService:
    """
    Service for interacting with Groq's LLM for visa analysis.
    Uses direct HTTP calls to avoid openai/groq SDK version conflicts.
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL
        self.model = settings.GROQ_MODEL
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        logger.info(f"LLMService initialized with Groq model: {self.model}")
    
    def _call_groq_api(self, messages: List[Dict], max_tokens: int = 4000, temperature: float = 0.7) -> str:
        """
        Make a direct HTTP call to Groq API.
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"}
        }
        
        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    
    def analyze_profile(
        self, 
        user_profile: Dict, 
        policy_context: str,
        country_data: List[Dict]
    ) -> Dict:
        """
        Perform complete profile analysis using LLM.
        
        Args:
            user_profile: User's profile data
            policy_context: Retrieved policy documents as context
            country_data: Country-specific visa information
            
        Returns:
            Complete analysis result matching frontend schema
        """
        
        # Build the system prompt
        system_prompt = """You are an expert immigration consultant AI with deep knowledge of global visa policies. 
Your task is to analyze user profiles and provide comprehensive immigration pathway recommendations.

You must respond with a valid JSON object matching this exact structure:
{
    "profileSummary": {
        "strengths": ["string array of user's strengths for immigration"],
        "weaknesses": ["string array of areas that need improvement"],
        "eligibleVisas": [{"country": "string", "visaTypes": ["array of visa types"]}]
    },
    "rankedPaths": [
        {
            "id": "path_1",
            "rank": 1,
            "name": "Path name",
            "description": "Brief description",
            "steps": [
                {
                    "order": 1,
                    "country": "Country Name",
                    "countryCode": "XX",
                    "visaType": "Visa type name",
                    "duration": "Duration string",
                    "purpose": "Purpose of this step",
                    "requirements": ["requirement 1", "requirement 2"],
                    "estimatedCost": 5000,
                    "currency": "USD"
                }
            ],
            "totalDuration": "Total time estimate",
            "overallScore": 85,
            "approvalProbability": 75,
            "riskLevel": "low|medium|high",
            "whyThisPath": "Explanation of why this path suits the user",
            "recommendation": "Specific action recommendation"
        }
    ],
    "actionItems": [
        {
            "order": 1,
            "action": "Action description",
            "deadline": "Timeline",
            "priority": "high|medium|low",
            "details": "Additional details"
        }
    ],
    "citations": [
        {
            "id": "cite_1",
            "source": "Source name",
            "text": "Relevant quote or information",
            "url": "Optional URL"
        }
    ]
}

IMPORTANT:
- Provide 2-3 ranked paths with the best one first
- Consider stepping-stone strategies (e.g., UAE→Canada, Ireland→USA)
- Be realistic about approval probabilities based on the user's profile
- Include specific, actionable next steps
- Base your analysis on the provided policy documents and country data
- Always return valid JSON, nothing else"""

        # Build the user prompt with all context
        user_prompt = f"""
## USER PROFILE:
- Age: {user_profile.get('age', 'N/A')}
- Nationality: {user_profile.get('nationality', 'N/A')}
- Education: {json.dumps(user_profile.get('education', {}), indent=2)}
- Work Experience: {json.dumps(user_profile.get('workExperience', {}), indent=2)}
- Financial: {json.dumps(user_profile.get('financial', {}), indent=2)}
- Goals: {json.dumps(user_profile.get('goals', {}), indent=2)}

## TARGET COUNTRIES:
{user_profile.get('goals', {}).get('targetCountries', ['Canada', 'Germany'])}

## RELEVANT POLICY INFORMATION:
{policy_context}

## COUNTRY-SPECIFIC DATA:
{json.dumps(country_data, indent=2)}

Based on this information, provide a comprehensive immigration analysis with ranked pathways.
Return ONLY valid JSON matching the schema specified."""

        try:
            logger.info("Calling Groq for profile analysis...")
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            result_text = self._call_groq_api(messages, max_tokens=4000, temperature=0.7)
            logger.info("Groq response received, parsing JSON...")
            
            result = json.loads(result_text)
            logger.info("Analysis complete!")
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            raise

    def analyze_profile_deep(
        self, 
        user_profile: Dict, 
        policy_context: str,
        country_data: List[Dict]
    ) -> Dict:
        """
        Deep analysis using multi-step reasoning (CrewAI-style).
        This method simulates the multi-agent approach with enhanced prompts.
        """
        
        # Enhanced system prompt for deep analysis
        system_prompt = """You are a team of 4 expert immigration consultants working together:

1. **Profile Analyst**: Deeply understands the user's background, identifies strengths and weaknesses
2. **Path Generator**: Creates optimal immigration pathways including stepping-stone strategies  
3. **Risk Assessor**: Evaluates approval probabilities and identifies potential blockers
4. **Recommendation Synthesizer**: Combines all analysis into actionable advice

Work through each perspective and provide a comprehensive analysis.

You must respond with a valid JSON object matching this exact structure:
{
    "profileSummary": {
        "strengths": ["detailed strength 1", "detailed strength 2", ...],
        "weaknesses": ["detailed weakness 1", "detailed weakness 2", ...],
        "eligibleVisas": [{"country": "string", "visaTypes": ["array"]}],
        "profileScore": 85,
        "competitiveAdvantages": ["advantage 1", "advantage 2"]
    },
    "rankedPaths": [
        {
            "id": "path_1",
            "rank": 1,
            "name": "Path name",
            "description": "Detailed description of this immigration strategy",
            "steps": [
                {
                    "order": 1,
                    "country": "Country Name",
                    "countryCode": "XX",
                    "visaType": "Visa type name",
                    "duration": "Duration string",
                    "purpose": "Purpose of this step",
                    "requirements": ["requirement 1", "requirement 2"],
                    "estimatedCost": 5000,
                    "currency": "USD",
                    "keyActions": ["action 1", "action 2"],
                    "timeline": "When to start this step"
                }
            ],
            "totalDuration": "Total time estimate",
            "totalCost": 10000,
            "overallScore": 85,
            "approvalProbability": 75,
            "riskLevel": "low|medium|high",
            "riskFactors": ["risk 1", "risk 2"],
            "whyThisPath": "Detailed explanation of why this path suits the user",
            "recommendation": "Specific action recommendation",
            "successFactors": ["factor 1", "factor 2"]
        }
    ],
    "actionItems": [
        {
            "order": 1,
            "action": "Detailed action description",
            "deadline": "Timeline with specific dates if possible",
            "priority": "high|medium|low",
            "details": "Step-by-step guidance",
            "resources": ["resource 1", "resource 2"],
            "estimatedCost": 500,
            "currency": "USD"
        }
    ],
    "riskAnalysis": {
        "overallRisk": "low|medium|high",
        "criticalFactors": ["factor 1", "factor 2"],
        "mitigationStrategies": ["strategy 1", "strategy 2"]
    },
    "citations": [
        {
            "id": "cite_1",
            "source": "Official source name",
            "text": "Relevant quote or information",
            "url": "URL if available",
            "lastUpdated": "Date if known"
        }
    ]
}

IMPORTANT GUIDELINES:
- Provide 2-4 ranked paths with the best one first
- Consider stepping-stone strategies (e.g., UAE→Canada, Ireland→USA)
- Be realistic about approval probabilities based on the user's actual profile
- Include SPECIFIC, actionable next steps with timelines
- Identify potential blockers and how to overcome them
- Consider family implications if applicable
- Base your analysis on the provided policy documents
- Always return valid JSON, nothing else"""

        user_prompt = f"""
## COMPREHENSIVE PROFILE ANALYSIS REQUEST

### USER PROFILE:
- **Age**: {user_profile.get('age', 'N/A')}
- **Nationality**: {user_profile.get('nationality', 'N/A')}
- **Education**: {json.dumps(user_profile.get('education', {}), indent=2)}
- **Work Experience**: {json.dumps(user_profile.get('workExperience', {}), indent=2)}
- **Financial Situation**: {json.dumps(user_profile.get('financial', {}), indent=2)}
- **Immigration Goals**: {json.dumps(user_profile.get('goals', {}), indent=2)}

### TARGET COUNTRIES:
{user_profile.get('goals', {}).get('targetCountries', ['Canada', 'Germany'])}

### RELEVANT POLICY INFORMATION:
{policy_context}

### COUNTRY-SPECIFIC DATA:
{json.dumps(country_data, indent=2)}

---

Please perform a DEEP ANALYSIS considering:
1. How does this profile compare to typical successful applicants?
2. What are the realistic timelines for each pathway?
3. What specific actions can improve success probability?
4. What are the financial implications of each path?
5. Are there any stepping-stone strategies that could work?

Return ONLY valid JSON matching the schema specified."""

        try:
            logger.info("Calling Groq for deep profile analysis (CrewAI-style)...")
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            result_text = self._call_groq_api(messages, max_tokens=6000, temperature=0.7)
            logger.info("Deep analysis response received, parsing JSON...")
            
            result = json.loads(result_text)
            logger.info("Deep analysis complete!")
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse deep analysis response as JSON: {e}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except Exception as e:
            logger.error(f"Deep analysis failed: {e}")
            raise


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
