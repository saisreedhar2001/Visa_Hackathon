"""
Task Definitions - Templates for each agent's task
"""
from crewai import Task
from typing import List, Optional

from src.agents.profile_analyst.prompts import PROFILE_ANALYSIS_TASK_TEMPLATE
from src.agents.path_generator.prompts import PATH_GENERATION_TASK_TEMPLATE
from src.agents.risk_assessor.prompts import RISK_ASSESSMENT_TASK_TEMPLATE
from src.agents.recommendation_synthesizer.prompts import SYNTHESIS_TASK_TEMPLATE


def create_profile_analysis_task(
    agent,
    user_profile: dict,
    rag_context: dict = None
) -> Task:
    """
    Creates the Profile Analysis task.
    This is the FIRST task in the workflow.
    """
    description = PROFILE_ANALYSIS_TASK_TEMPLATE.format(
        user_profile=_format_profile(user_profile)
    )
    
    if rag_context:
        description += f"\n\n## Additional Context:\n{rag_context.get('profile_context', '')}"
    
    return Task(
        description=description,
        agent=agent,
        expected_output="""
        A structured profile analysis containing:
        1. Profile strengths (list)
        2. Profile weaknesses (list)
        3. Eligible visa categories (list with explanations)
        4. Recommended regions (list with reasoning)
        5. Critical observations and recommendations
        """
    )


def create_path_generation_task(
    agent,
    user_profile: dict,
    context: List[Task] = None
) -> Task:
    """
    Creates the Path Generation task.
    Depends on: Profile Analysis
    """
    target_countries = user_profile.get('target_countries', ['Canada', 'Germany', 'USA'])
    
    description = f"""
    Based on the profile analysis from the previous agent, generate 2-3 viable 
    global mobility paths for this user.
    
    ## Target Countries (User Preference):
    {', '.join(target_countries)}
    
    ## Guidelines:
    - Consider both direct and stepping-stone approaches
    - Include timeline estimates for each path
    - Explain WHY each path suits this specific user
    - Provide paths with different risk/reward profiles
    
    Use the profile analysis output to ensure paths are realistic for this user's situation.
    """
    
    return Task(
        description=description,
        agent=agent,
        context=context,
        expected_output="""
        2-3 detailed mobility paths, each containing:
        1. Path structure (origin → steps → destination)
        2. Step-by-step breakdown with visa types and timelines
        3. Why this path suits the user
        4. Path characteristics (difficulty, timeline, cost)
        """
    )


def create_risk_assessment_task(
    agent,
    user_profile: dict,
    context: List[Task] = None
) -> Task:
    """
    Creates the Risk Assessment task.
    Depends on: Profile Analysis, Path Generation
    """
    description = """
    Evaluate each proposed mobility path from the previous agent for risks and feasibility.
    
    ## Your Assessment Must Include:
    1. Risk score (0-100) for each path
    2. Specific identified risks with severity and likelihood
    3. Potential blockers (hard and soft)
    4. Mitigation strategies
    5. Approval probability estimate with reasoning
    6. Financial readiness assessment
    7. Overall go/no-go recommendation
    
    Be thorough but fair. Identify real risks without being unnecessarily pessimistic.
    """
    
    return Task(
        description=description,
        agent=agent,
        context=context,
        expected_output="""
        A comprehensive risk assessment for each path containing:
        1. Risk score and breakdown
        2. Identified risks with severity ratings
        3. Blockers and mitigation strategies
        4. Approval probability with confidence factors
        5. Overall recommendation (Recommended/Proceed with Caution/Not Recommended)
        """
    )


def create_synthesis_task(
    agent,
    rag_context: dict = None,
    context: List[Task] = None
) -> Task:
    """
    Creates the Synthesis task.
    Depends on: All previous tasks
    """
    policy_context = ""
    if rag_context:
        policy_context = rag_context.get('policy_snippets', '')
    
    description = f"""
    Synthesize all previous analyses into a clear, final recommendation.
    
    ## Retrieved Policy Context:
    {policy_context if policy_context else "Use general knowledge of immigration policies."}
    
    ## Your Final Output Must Include:
    1. Executive summary (2-3 sentences)
    2. Ranked paths with scores
    3. Primary recommendation with detailed justification
    4. Alternative options and when to consider them
    5. What helped and what could hurt chances
    6. Actionable next steps with timeline
    7. Citations and sources
    8. Important disclaimers
    
    Make your output clear, trustworthy, and actionable. This is what the user will see.
    """
    
    return Task(
        description=description,
        agent=agent,
        context=context,
        expected_output="""
        A complete recommendation package containing:
        1. Executive summary
        2. Ranked paths table
        3. Primary recommendation with full justification
        4. Alternatives and trade-offs
        5. Strengths and concerns breakdown
        6. Numbered action items
        7. Formatted citations
        8. Disclaimers
        """
    )


def _format_profile(user_profile: dict) -> str:
    """Format user profile for task description"""
    sections = []
    
    sections.append(f"**Name**: {user_profile.get('name', 'Not provided')}")
    sections.append(f"**Age**: {user_profile.get('age', 'Not provided')}")
    sections.append(f"**Nationality**: {user_profile.get('nationality', 'Not provided')}")
    sections.append(f"**Current Country**: {user_profile.get('current_country', 'Not provided')}")
    
    # Education
    education = user_profile.get('education', {})
    sections.append(f"\n**Education**:")
    sections.append(f"  - Degree: {education.get('degree', 'Not provided')}")
    sections.append(f"  - Field: {education.get('field', 'Not provided')}")
    sections.append(f"  - Institution: {education.get('institution', 'Not provided')}")
    
    # Work Experience
    work = user_profile.get('work_experience', {})
    sections.append(f"\n**Work Experience**:")
    sections.append(f"  - Years: {work.get('years', 'Not provided')}")
    sections.append(f"  - Current Role: {work.get('current_role', 'Not provided')}")
    sections.append(f"  - Industry: {work.get('industry', 'Not provided')}")
    
    # Skills
    skills = user_profile.get('skills', [])
    sections.append(f"\n**Skills**: {', '.join(skills) if skills else 'Not provided'}")
    
    # Languages
    languages = user_profile.get('languages', [])
    sections.append(f"**Languages**: {', '.join(languages) if languages else 'Not provided'}")
    
    # Financial
    financial = user_profile.get('financial', {})
    sections.append(f"\n**Financial Situation**:")
    sections.append(f"  - Savings: ${financial.get('savings', 'Not provided')}")
    sections.append(f"  - Annual Income: ${financial.get('annual_income', 'Not provided')}")
    
    # Goals
    goals = user_profile.get('goals', {})
    sections.append(f"\n**Immigration Goals**:")
    sections.append(f"  - Target Countries: {', '.join(goals.get('target_countries', []))}")
    sections.append(f"  - Timeline: {goals.get('timeline', 'Not provided')}")
    sections.append(f"  - Purpose: {goals.get('purpose', 'Not provided')}")
    
    return "\n".join(sections)
