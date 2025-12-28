"""
Workflow Definitions - Defines different agent collaboration patterns
"""
from enum import Enum
from typing import List, Dict
from dataclasses import dataclass


class WorkflowType(Enum):
    """Available workflow types"""
    FULL_ANALYSIS = "full_analysis"  # All 4 agents
    QUICK_ASSESSMENT = "quick_assessment"  # Profile + Path only
    RISK_FOCUS = "risk_focus"  # Profile + Risk only


@dataclass
class WorkflowStep:
    """Represents a step in the workflow"""
    agent_name: str
    depends_on: List[str]
    inputs: List[str]
    outputs: List[str]


class WorkflowDefinitions:
    """
    Defines how agents collaborate in different scenarios.
    The orchestrator uses these definitions to determine execution order.
    """
    
    @staticmethod
    def get_full_analysis_workflow() -> List[WorkflowStep]:
        """
        Complete 4-agent workflow for thorough analysis.
        
        Flow: Profile Analyst → Path Generator → Risk Assessor → Synthesizer
        """
        return [
            WorkflowStep(
                agent_name="profile_analyst",
                depends_on=[],  # First agent, no dependencies
                inputs=["user_profile", "rag_context"],
                outputs=["profile_analysis"]
            ),
            WorkflowStep(
                agent_name="path_generator",
                depends_on=["profile_analyst"],
                inputs=["profile_analysis", "target_countries"],
                outputs=["mobility_paths"]
            ),
            WorkflowStep(
                agent_name="risk_assessor",
                depends_on=["profile_analyst", "path_generator"],
                inputs=["profile_analysis", "mobility_paths"],
                outputs=["risk_assessment"]
            ),
            WorkflowStep(
                agent_name="recommendation_synthesizer",
                depends_on=["profile_analyst", "path_generator", "risk_assessor"],
                inputs=["profile_analysis", "mobility_paths", "risk_assessment", "rag_context"],
                outputs=["final_recommendation"]
            )
        ]
    
    @staticmethod
    def get_quick_assessment_workflow() -> List[WorkflowStep]:
        """
        Quick 2-agent workflow for fast initial assessment.
        
        Flow: Profile Analyst → Path Generator
        """
        return [
            WorkflowStep(
                agent_name="profile_analyst",
                depends_on=[],
                inputs=["user_profile"],
                outputs=["profile_analysis"]
            ),
            WorkflowStep(
                agent_name="path_generator",
                depends_on=["profile_analyst"],
                inputs=["profile_analysis", "target_countries"],
                outputs=["mobility_paths"]
            )
        ]
    
    @staticmethod
    def get_workflow(workflow_type: WorkflowType) -> List[WorkflowStep]:
        """Get workflow definition by type"""
        workflows = {
            WorkflowType.FULL_ANALYSIS: WorkflowDefinitions.get_full_analysis_workflow,
            WorkflowType.QUICK_ASSESSMENT: WorkflowDefinitions.get_quick_assessment_workflow,
        }
        return workflows.get(workflow_type, WorkflowDefinitions.get_full_analysis_workflow)()


def visualize_workflow(workflow_type: WorkflowType) -> str:
    """Generate ASCII visualization of workflow"""
    workflow = WorkflowDefinitions.get_workflow(workflow_type)
    
    lines = ["Workflow: " + workflow_type.value, "=" * 40]
    
    for i, step in enumerate(workflow):
        prefix = "└── " if i == len(workflow) - 1 else "├── "
        lines.append(f"{prefix}{step.agent_name}")
        
        if step.depends_on:
            lines.append(f"    Depends on: {', '.join(step.depends_on)}")
        
        lines.append(f"    Inputs: {', '.join(step.inputs)}")
        lines.append(f"    Outputs: {', '.join(step.outputs)}")
        lines.append("")
    
    return "\n".join(lines)
