"""
Path Generator Agent - Creates multi-step mobility routes
"""
from crewai import Agent
from src.agents.path_generator.prompts import PATH_GENERATOR_BACKSTORY, PATH_GENERATOR_GOAL
from src.agents.path_generator.tools import get_path_generator_tools


def create_path_generator(llm) -> Agent:
    """
    Creates the Path Generator agent.
    
    Role: Strategy Architect
    Purpose: Design 2-3 viable mobility paths based on profile analysis,
             including multi-step routes (e.g., India → UAE → Canada)
    """
    return Agent(
        role="Global Mobility Strategy Architect",
        goal=PATH_GENERATOR_GOAL,
        backstory=PATH_GENERATOR_BACKSTORY,
        tools=get_path_generator_tools(),
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=5
    )
