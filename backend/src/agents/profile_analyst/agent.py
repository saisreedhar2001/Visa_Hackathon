"""
Profile Analyst Agent - Understands user background, skills, finances, and goals
"""
from crewai import Agent
from src.agents.profile_analyst.prompts import PROFILE_ANALYST_BACKSTORY, PROFILE_ANALYST_GOAL
from src.agents.profile_analyst.tools import get_profile_analyst_tools


def create_profile_analyst(llm) -> Agent:
    """
    Creates the Profile Analyst agent.
    
    Role: Immigration Consultant
    Purpose: Deeply understand the user's profile and identify their strengths,
             weaknesses, and potential visa eligibility patterns.
    """
    return Agent(
        role="Senior Immigration Profile Analyst",
        goal=PROFILE_ANALYST_GOAL,
        backstory=PROFILE_ANALYST_BACKSTORY,
        tools=get_profile_analyst_tools(),
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=5
    )
