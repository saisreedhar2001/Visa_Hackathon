"""
Application constants
"""

# Supported countries
SUPPORTED_COUNTRIES = [
    "canada",
    "germany", 
    "usa",
    "uk",
    "uae",
    "singapore",
    "australia",
    "netherlands",
    "portugal",
    "japan"
]

# Visa categories
VISA_CATEGORIES = [
    "work_visa",
    "student_visa",
    "investor_visa",
    "digital_nomad",
    "skilled_worker",
    "entrepreneur",
    "family_sponsorship"
]

# Risk levels
RISK_LEVELS = {
    "LOW": {"min": 0, "max": 30, "label": "Low Risk"},
    "MEDIUM": {"min": 31, "max": 60, "label": "Medium Risk"},
    "HIGH": {"min": 61, "max": 100, "label": "High Risk"}
}

# Score thresholds
SCORE_THRESHOLDS = {
    "EXCELLENT": {"min": 80, "max": 100, "label": "Excellent Match"},
    "GOOD": {"min": 60, "max": 79, "label": "Good Match"},
    "MODERATE": {"min": 40, "max": 59, "label": "Moderate Match"},
    "CHALLENGING": {"min": 0, "max": 39, "label": "Challenging"}
}

# Agent names
AGENT_NAMES = {
    "PROFILE_ANALYST": "Profile Analyst",
    "PATH_GENERATOR": "Path Generator", 
    "RISK_ASSESSOR": "Risk Assessor",
    "RECOMMENDATION_SYNTHESIZER": "Recommendation Synthesizer"
}
