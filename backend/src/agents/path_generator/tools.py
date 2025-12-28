"""
Tools available to the Path Generator Agent
"""
from crewai.tools import tool
from typing import List


@tool("query_visa_requirements")
def query_visa_requirements(country: str, visa_type: str) -> str:
    """
    Queries visa requirements for a specific country and visa type.
    Returns structured requirement information.
    """
    return f"Visa requirements for {visa_type} in {country}"


@tool("check_stepping_stone_routes")
def check_stepping_stone_routes(origin: str, destination: str) -> str:
    """
    Finds intermediate countries that can serve as stepping stones
    from origin to destination.
    """
    return f"Stepping stone routes from {origin} to {destination}"


@tool("get_country_compatibility")
def get_country_compatibility(profile_summary: str, country: str) -> str:
    """
    Evaluates how compatible a user profile is with a specific country's
    immigration requirements.
    """
    return f"Compatibility check for {country}"


def get_path_generator_tools() -> List:
    """Returns all tools available to the Path Generator"""
    return [
        query_visa_requirements,
        check_stepping_stone_routes,
        get_country_compatibility
    ]
