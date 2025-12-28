"""
Document Loader - Loads policy documents and country data for RAG context
"""
import os
import json
from typing import Dict, List, Optional
from pathlib import Path
from src.core.logging import logger


class DocumentLoader:
    """
    Loads and manages policy documents and country data from local files.
    This is a simplified RAG approach that works without external vector stores.
    """
    
    def __init__(self):
        self.base_path = Path(__file__).parent.parent.parent / "data"
        self.policies_path = self.base_path / "policies"
        self.countries_path = self.base_path / "countries"
        
        # Cache loaded documents
        self._policy_cache: Dict[str, str] = {}
        self._country_cache: Dict[str, Dict] = {}
        
        # Load all documents on init
        self._load_all_policies()
        self._load_all_countries()
        
        logger.info(f"DocumentLoader initialized with {len(self._policy_cache)} policies and {len(self._country_cache)} countries")
    
    def _load_all_policies(self):
        """Load all markdown policy documents"""
        if not self.policies_path.exists():
            logger.warning(f"Policies path not found: {self.policies_path}")
            return
            
        for file_path in self.policies_path.glob("*.md"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Use filename without extension as key
                    key = file_path.stem
                    self._policy_cache[key] = content
                    logger.debug(f"Loaded policy: {key}")
            except Exception as e:
                logger.error(f"Failed to load policy {file_path}: {e}")
    
    def _load_all_countries(self):
        """Load all JSON country data files"""
        if not self.countries_path.exists():
            logger.warning(f"Countries path not found: {self.countries_path}")
            return
            
        for file_path in self.countries_path.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Use country code or filename as key
                    key = data.get("code", file_path.stem).upper()
                    self._country_cache[key] = data
                    logger.debug(f"Loaded country: {key}")
            except Exception as e:
                logger.error(f"Failed to load country {file_path}: {e}")
    
    def get_policy_context(self, target_countries: List[str]) -> str:
        """
        Get relevant policy documents for the target countries.
        
        Args:
            target_countries: List of country codes (e.g., ['CA', 'DE', 'US'])
            
        Returns:
            Concatenated policy text for context
        """
        # Map country codes to policy file names
        country_to_policy = {
            "CA": "canada_express_entry",
            "DE": "germany_blue_card",
            "US": "usa_h1b",
            "GB": "uk_skilled_worker",
            "AU": "australia_skilled_migration",
            "AE": "stepping_stone_strategies",
            "SG": "stepping_stone_strategies",
            "NL": "stepping_stone_strategies",
            "PT": "stepping_stone_strategies",
            "JP": "stepping_stone_strategies",
        }
        
        context_parts = []
        
        # Always include stepping stone strategies
        if "stepping_stone_strategies" in self._policy_cache:
            context_parts.append(self._policy_cache["stepping_stone_strategies"])
        
        # Add country-specific policies
        for country_code in target_countries:
            code = country_code.upper()
            policy_key = country_to_policy.get(code)
            
            if policy_key and policy_key in self._policy_cache:
                if policy_key not in ["stepping_stone_strategies"]:  # Avoid duplicate
                    context_parts.append(f"\n\n---\n\n{self._policy_cache[policy_key]}")
        
        return "\n".join(context_parts) if context_parts else "No specific policy documents available."
    
    def get_country_data(self, target_countries: List[str]) -> List[Dict]:
        """
        Get structured country data for target countries.
        
        Args:
            target_countries: List of country codes
            
        Returns:
            List of country data dictionaries
        """
        result = []
        
        for country_code in target_countries:
            code = country_code.upper()
            if code in self._country_cache:
                # Get a simplified version for context (to avoid token overflow)
                country = self._country_cache[code]
                simplified = {
                    "name": country.get("name"),
                    "code": country.get("code"),
                    "immigration_friendliness": country.get("immigration_friendliness"),
                    "skill_demand": country.get("skill_demand", [])[:5],
                    "notes": country.get("notes"),
                    "visa_types": [
                        {
                            "type": vt.get("type"),
                            "name": vt.get("name"),
                            "processing_time": vt.get("processing_time"),
                            "path_to_pr": vt.get("path_to_pr"),
                            "requirements": vt.get("requirements", [])[:5]
                        }
                        for vt in country.get("visa_types", [])[:3]
                    ]
                }
                result.append(simplified)
        
        # Always include UAE as a potential stepping stone
        if "AE" not in [c.upper() for c in target_countries] and "AE" in self._country_cache:
            uae = self._country_cache["AE"]
            result.append({
                "name": uae.get("name"),
                "code": "AE",
                "immigration_friendliness": uae.get("immigration_friendliness"),
                "skill_demand": uae.get("skill_demand", [])[:5],
                "notes": "Potential stepping stone country - " + uae.get("notes", ""),
            })
        
        return result
    
    def get_all_country_codes(self) -> List[str]:
        """Get list of all available country codes"""
        return list(self._country_cache.keys())
    
    def get_all_policies(self) -> Dict[str, str]:
        """Get all cached policy documents"""
        return self._policy_cache.copy()
    
    def get_policy_by_name(self, policy_name: str) -> Optional[str]:
        """Get a specific policy document by name"""
        return self._policy_cache.get(policy_name)


# Singleton instance
_document_loader: Optional[DocumentLoader] = None


def get_document_loader() -> DocumentLoader:
    """Get or create the document loader singleton"""
    global _document_loader
    if _document_loader is None:
        _document_loader = DocumentLoader()
    return _document_loader
