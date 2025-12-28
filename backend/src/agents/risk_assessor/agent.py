"""
Risk Assessor Agent - Evaluates risks, blockers, and feasibility
"""
from crewai import Agent
from src.agents.risk_assessor.prompts import RISK_ASSESSOR_BACKSTORY, RISK_ASSESSOR_GOAL
from src.agents.risk_assessor.tools import get_risk_assessor_tools


def create_risk_assessor(llm) -> Agent:
    """
    Creates the Risk Assessor agent.
    
    Role: Due Diligence Analyst
    Purpose: Critically evaluate each proposed path for risks,
             potential blockers, and overall feasibility.
    """
    return Agent(
        role="Immigration Risk & Compliance Analyst",
        goal=RISK_ASSESSOR_GOAL,
        backstory=RISK_ASSESSOR_BACKSTORY,
        tools=get_risk_assessor_tools(),
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=5
    )
