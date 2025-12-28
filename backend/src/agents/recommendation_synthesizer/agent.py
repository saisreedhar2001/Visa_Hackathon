"""
Recommendation Synthesizer Agent - Final synthesis and advice
"""
from crewai import Agent
from src.agents.recommendation_synthesizer.prompts import (
    SYNTHESIZER_BACKSTORY, 
    SYNTHESIZER_GOAL
)
from src.agents.recommendation_synthesizer.tools import get_synthesizer_tools


def create_recommendation_synthesizer(llm) -> Agent:
    """
    Creates the Recommendation Synthesizer agent.
    
    Role: Senior Advisor
    Purpose: Synthesize all analyses into a clear, actionable recommendation
             with proper citations and explanations.
    """
    return Agent(
        role="Senior Global Mobility Advisor",
        goal=SYNTHESIZER_GOAL,
        backstory=SYNTHESIZER_BACKSTORY,
        tools=get_synthesizer_tools(),
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=5
    )
