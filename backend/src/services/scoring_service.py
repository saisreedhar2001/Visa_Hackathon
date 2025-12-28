"""
Scoring Service - Calculates and explains path scores
"""
from typing import Dict, List, Tuple
from src.core.constants import SCORE_THRESHOLDS, RISK_LEVELS


class ScoringService:
    """
    Provides transparent, explainable scoring for mobility paths.
    
    Design Philosophy:
    - Scores guide reasoning, they don't replace it
    - Every score component is explainable
    - Transparency over complexity
    """
    
    # Scoring weights (transparent and adjustable)
    WEIGHTS = {
        "profile_match": 0.25,      # How well profile fits the path
        "financial_readiness": 0.20, # Financial adequacy
        "skill_demand": 0.20,        # Skills in demand at destination
        "risk_level": 0.15,          # Inverse of risk score
        "timeline_fit": 0.10,        # Matches user's timeline
        "path_complexity": 0.10      # Simpler paths score higher
    }
    
    def calculate_path_score(
        self,
        profile_match: float,
        financial_readiness: float,
        skill_demand: float,
        risk_score: float,
        timeline_fit: float,
        path_steps: int
    ) -> Tuple[int, Dict[str, any]]:
        """
        Calculate overall path score with breakdown.
        
        Args:
            profile_match: 0-100 how well profile matches path requirements
            financial_readiness: 0-100 financial adequacy
            skill_demand: 0-100 how in-demand are user's skills
            risk_score: 0-100 risk level (will be inverted)
            timeline_fit: 0-100 how well it fits user's timeline
            path_steps: Number of steps in the path
            
        Returns:
            Tuple of (final_score, breakdown_dict)
        """
        # Calculate complexity score (fewer steps = higher score)
        complexity_score = max(0, 100 - (path_steps - 1) * 20)
        
        # Invert risk score (lower risk = higher score)
        risk_inverted = 100 - risk_score
        
        # Calculate weighted score
        components = {
            "profile_match": profile_match * self.WEIGHTS["profile_match"],
            "financial_readiness": financial_readiness * self.WEIGHTS["financial_readiness"],
            "skill_demand": skill_demand * self.WEIGHTS["skill_demand"],
            "risk_level": risk_inverted * self.WEIGHTS["risk_level"],
            "timeline_fit": timeline_fit * self.WEIGHTS["timeline_fit"],
            "path_complexity": complexity_score * self.WEIGHTS["path_complexity"]
        }
        
        final_score = sum(components.values())
        
        # Create explanation
        breakdown = {
            "final_score": round(final_score),
            "components": {
                k: {
                    "raw_value": round(v / self.WEIGHTS[k]) if self.WEIGHTS[k] > 0 else 0,
                    "weighted_contribution": round(v, 1),
                    "weight": self.WEIGHTS[k]
                }
                for k, v in components.items()
            },
            "score_label": self._get_score_label(final_score),
            "explanation": self._generate_explanation(components, final_score)
        }
        
        return round(final_score), breakdown
    
    def calculate_approval_probability(
        self,
        path_score: int,
        risk_score: int,
        has_blockers: bool,
        profile_strength: float
    ) -> Tuple[float, str]:
        """
        Estimate approval probability for a path.
        
        Returns probability (0-1) and confidence explanation.
        """
        # Base probability from path score
        base_probability = path_score / 100
        
        # Adjust for risk
        risk_adjustment = (100 - risk_score) / 100
        
        # Adjust for blockers
        blocker_penalty = 0.15 if has_blockers else 0
        
        # Profile strength modifier
        profile_modifier = (profile_strength - 50) / 200  # -0.25 to +0.25
        
        # Calculate final probability
        probability = (base_probability * 0.5 + risk_adjustment * 0.5) + profile_modifier - blocker_penalty
        probability = max(0.1, min(0.95, probability))  # Clamp between 10% and 95%
        
        # Generate confidence explanation
        if probability >= 0.7:
            confidence = "High confidence - strong profile and low risk factors"
        elif probability >= 0.5:
            confidence = "Moderate confidence - some factors need attention"
        else:
            confidence = "Lower confidence - significant challenges to address"
        
        return round(probability, 2), confidence
    
    def rank_paths(self, paths_with_scores: List[Dict]) -> List[Dict]:
        """
        Rank paths by score and return with rankings.
        """
        sorted_paths = sorted(
            paths_with_scores, 
            key=lambda x: x.get('score', 0), 
            reverse=True
        )
        
        for i, path in enumerate(sorted_paths):
            path['rank'] = i + 1
            path['rank_reason'] = self._get_rank_reason(path, i, sorted_paths)
        
        return sorted_paths
    
    def explain_score_factors(
        self, 
        helping_factors: List[str], 
        hurting_factors: List[str]
    ) -> Dict:
        """
        Create user-friendly explanation of what helped and hurt.
        """
        return {
            "what_helped": [
                {"factor": f, "impact": "positive"} 
                for f in helping_factors
            ],
            "what_hurt": [
                {"factor": f, "impact": "negative"} 
                for f in hurting_factors
            ],
            "summary": self._summarize_factors(helping_factors, hurting_factors)
        }
    
    def _get_score_label(self, score: float) -> str:
        """Convert score to human-readable label"""
        for level, thresholds in SCORE_THRESHOLDS.items():
            if thresholds["min"] <= score <= thresholds["max"]:
                return thresholds["label"]
        return "Unknown"
    
    def _generate_explanation(self, components: Dict, final_score: float) -> str:
        """Generate natural language explanation of the score"""
        # Find top contributors
        sorted_components = sorted(
            components.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        top_positive = sorted_components[0][0].replace("_", " ").title()
        
        # Find weakest area
        sorted_asc = sorted(components.items(), key=lambda x: x[1])
        weakest = sorted_asc[0][0].replace("_", " ").title()
        
        if final_score >= 80:
            return f"Excellent score driven by strong {top_positive}. Minor improvement possible in {weakest}."
        elif final_score >= 60:
            return f"Good score with {top_positive} as the main strength. Focus on improving {weakest} for better chances."
        elif final_score >= 40:
            return f"Moderate score. {top_positive} helps, but {weakest} needs significant attention."
        else:
            return f"Challenging score. Consider addressing {weakest} before proceeding."
    
    def _get_rank_reason(
        self, 
        path: Dict, 
        index: int, 
        all_paths: List[Dict]
    ) -> str:
        """Generate reason for this path's ranking"""
        if index == 0:
            return "Highest overall score with best risk-reward balance"
        elif index == 1:
            score_diff = all_paths[0].get('score', 0) - path.get('score', 0)
            return f"Close alternative, {score_diff} points behind top choice"
        else:
            return "Lower ranked due to higher risk or complexity"
    
    def _summarize_factors(
        self, 
        helping: List[str], 
        hurting: List[str]
    ) -> str:
        """Create summary of factors"""
        if len(helping) > len(hurting):
            return "Overall positive profile with more strengths than concerns"
        elif len(hurting) > len(helping):
            return "Some challenges to address, but paths are still viable"
        else:
            return "Balanced profile with both strengths and areas for improvement"
