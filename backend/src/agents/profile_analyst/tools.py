"""
Tools available to the Profile Analyst Agent
"""
from crewai.tools import tool
from typing import List


@tool("analyze_education_credentials")
def analyze_education_credentials(education: str) -> str:
    """
    Analyzes education credentials for international recognition.
    Takes education details and returns recognition assessment.
    """
    # This will be enhanced with RAG in the actual implementation
    return f"Education credential analysis for: {education}"


@tool("check_skill_demand")
def check_skill_demand(skills: str, target_region: str) -> str:
    """
    Checks if the user's skills are in demand in target regions.
    Returns skill demand assessment.
    """
    return f"Skill demand check for {skills} in {target_region}"


def get_profile_analyst_tools() -> List:
    """Returns all tools available to the Profile Analyst"""
    return [
        analyze_education_credentials,
        check_skill_demand
    ]
