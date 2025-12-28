"""
Tools available to the Recommendation Synthesizer Agent
"""
from crewai.tools import tool
from typing import List


@tool("format_citations")
def format_citations(raw_citations: str) -> str:
    """
    Formats raw citation data into user-friendly format.
    Returns formatted citations suitable for UI display.
    """
    return f"Formatted citations from: {raw_citations}"


@tool("generate_action_timeline")
def generate_action_timeline(path_details: str, user_situation: str) -> str:
    """
    Creates a personalized action timeline based on the recommended
    path and user's current situation.
    """
    return f"Action timeline generated for: {path_details}"


@tool("compile_document_checklist")
def compile_document_checklist(country: str, visa_type: str) -> str:
    """
    Compiles a comprehensive document checklist for the visa application.
    Returns prioritized list of required documents.
    """
    return f"Document checklist for {visa_type} in {country}"


def get_synthesizer_tools() -> List:
    """Returns all tools available to the Recommendation Synthesizer"""
    return [
        format_citations,
        generate_action_timeline,
        compile_document_checklist
    ]
