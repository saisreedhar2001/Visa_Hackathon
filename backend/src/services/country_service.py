"""
Country Service - Handles country data operations
"""
import json
from pathlib import Path
from typing import Dict, List, Optional
from functools import lru_cache

from src.core.constants import SUPPORTED_COUNTRIES
from src.core.logging import logger


class CountryService:
    """
    Service for accessing and managing country immigration data.
    """
    
    def __init__(self, data_dir: str = None):
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent.parent / "data"
        self._countries_cache: Dict = {}
        self._load_countries()
    
    def _load_countries(self):
        """Load all country data from JSON files"""
        countries_dir = self.data_dir / "countries"
        
        if not countries_dir.exists():
            logger.warning(f"Countries directory not found: {countries_dir}")
            return
        
        for json_file in countries_dir.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    country_data = json.load(f)
                    country_code = json_file.stem.lower()
                    self._countries_cache[country_code] = country_data
                    logger.debug(f"Loaded country data: {country_code}")
            except Exception as e:
                logger.error(f"Error loading {json_file}: {e}")
        
        logger.info(f"Loaded {len(self._countries_cache)} countries")
    
    def get_country(self, country_code: str) -> Optional[Dict]:
        """Get data for a specific country"""
        return self._countries_cache.get(country_code.lower())
    
    def get_all_countries(self) -> List[Dict]:
        """Get all countries with summary info"""
        return [
            {
                "code": code,
                "name": data.get("name", code.title()),
                "immigration_friendliness": data.get("immigration_friendliness", 5),
                "fintech_readiness": data.get("fintech_readiness", 5),
                "visa_types_count": len(data.get("visa_types", []))
            }
            for code, data in self._countries_cache.items()
        ]
    
    def get_visa_types(self, country_code: str) -> List[Dict]:
        """Get all visa types for a country"""
        country = self.get_country(country_code)
        if country:
            return country.get("visa_types", [])
        return []
    
    def get_visa_type(
        self, 
        country_code: str, 
        visa_type: str
    ) -> Optional[Dict]:
        """Get specific visa type for a country"""
        visa_types = self.get_visa_types(country_code)
        for visa in visa_types:
            if visa.get("type") == visa_type:
                return visa
        return None
    
    def search_countries(
        self,
        min_immigration_score: int = 0,
        skill_areas: List[str] = None,
        stepping_stone: bool = False
    ) -> List[Dict]:
        """Search countries by criteria"""
        results = []
        
        for code, data in self._countries_cache.items():
            # Filter by immigration score
            if data.get("immigration_friendliness", 0) < min_immigration_score:
                continue
            
            # Filter by skill demand
            if skill_areas:
                country_skills = data.get("skill_demand", [])
                if not any(skill.lower() in [s.lower() for s in country_skills] for skill in skill_areas):
                    continue
            
            # Filter by stepping stone potential
            if stepping_stone:
                if data.get("stepping_stone_potential", "Low") == "Low":
                    continue
            
            results.append({
                "code": code,
                **data
            })
        
        return sorted(
            results, 
            key=lambda x: x.get("immigration_friendliness", 0), 
            reverse=True
        )
    
    def get_financial_thresholds(self, country_code: str) -> Dict:
        """Get financial requirements for a country"""
        thresholds_file = self.data_dir / "financial_thresholds.json"
        
        if not thresholds_file.exists():
            return {}
        
        try:
            with open(thresholds_file, 'r', encoding='utf-8') as f:
                all_thresholds = json.load(f)
                return all_thresholds.get(country_code.lower(), {})
        except Exception as e:
            logger.error(f"Error loading financial thresholds: {e}")
            return {}
    
    def get_stepping_stone_countries(self, destination: str) -> List[Dict]:
        """Find countries that can serve as stepping stones to a destination"""
        destination_data = self.get_country(destination)
        if not destination_data:
            return []
        
        # Find countries that unlock the destination region
        destination_region = destination_data.get("region", "")
        
        stepping_stones = []
        for code, data in self._countries_cache.items():
            if code == destination.lower():
                continue
                
            unlocks = data.get("unlocks_regions", [])
            potential = data.get("stepping_stone_potential", "Low")
            
            if destination_region in unlocks or potential in ["Medium", "High"]:
                stepping_stones.append({
                    "code": code,
                    "name": data.get("name", code.title()),
                    "potential": potential,
                    "unlocks": unlocks,
                    "why_useful": f"Can help build experience/savings before {destination.title()}"
                })
        
        return sorted(
            stepping_stones,
            key=lambda x: {"High": 3, "Medium": 2, "Low": 1}.get(x["potential"], 0),
            reverse=True
        )
    
    def compare_countries(self, country_codes: List[str]) -> Dict:
        """Compare multiple countries side by side"""
        comparison = {
            "countries": [],
            "metrics": {}
        }
        
        metrics = [
            "immigration_friendliness",
            "fintech_readiness", 
            "processing_speed",
            "cost_of_living"
        ]
        
        for code in country_codes:
            country = self.get_country(code)
            if country:
                comparison["countries"].append({
                    "code": code,
                    "name": country.get("name", code.title())
                })
                
                for metric in metrics:
                    if metric not in comparison["metrics"]:
                        comparison["metrics"][metric] = {}
                    comparison["metrics"][metric][code] = country.get(metric, "N/A")
        
        return comparison


# Singleton instance
_country_service = None

def get_country_service() -> CountryService:
    """Get or create the country service singleton"""
    global _country_service
    if _country_service is None:
        _country_service = CountryService()
    return _country_service
