"""
Base Agent Configuration - Common patterns for all agents
"""
from typing import List, Optional
from pydantic import BaseModel


class BaseAgentConfig(BaseModel):
    """Base configuration that all agents share"""
    role: str
    goal: str
    backstory: str
    verbose: bool = True
    allow_delegation: bool = False
    max_iterations: int = 5


class AgentContext(BaseModel):
    """Context passed to agents during execution"""
    user_profile: dict
    retrieved_documents: List[dict] = []
    previous_agent_outputs: dict = {}
    session_id: Optional[str] = None


class AgentOutput(BaseModel):
    """Base output structure for all agents"""
    agent_name: str
    reasoning: str
    confidence: float
    citations: List[dict] = []
    metadata: dict = {}
