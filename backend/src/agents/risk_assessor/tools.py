"""
Tools available to the Risk Assessor Agent
"""
from crewai.tools import tool
from typing import List


@tool("check_rejection_patterns")
def check_rejection_patterns(country: str, visa_type: str) -> str:
    """
    Retrieves common rejection patterns for a specific visa type.
    Returns typical reasons applications fail.
    """
    return f"Rejection patterns for {visa_type} in {country}"


@tool("assess_financial_adequacy")
def assess_financial_adequacy(
    required_amount: str, 
    user_savings: str, 
    user_income: str
) -> str:
    """
    Evaluates if user's finances meet visa requirements.
    Returns adequacy assessment with gap analysis.
    """
    return f"Financial assessment: Required {required_amount}, Has {user_savings}"


@tool("check_policy_changes")
def check_policy_changes(country: str) -> str:
    """
    Checks for recent or upcoming policy changes that might
    affect visa applications.
    """
    return f"Policy changes for {country}"


def get_risk_assessor_tools() -> List:
    """Returns all tools available to the Risk Assessor"""
    return [
        check_rejection_patterns,
        assess_financial_adequacy,
        check_policy_changes
    ]
