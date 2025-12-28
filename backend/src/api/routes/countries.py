"""
Countries Routes - Endpoints for country and visa data
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional

from src.services.country_service import get_country_service

router = APIRouter()


@router.get("/countries")
async def get_countries():
    """Get list of all supported countries"""
    country_service = get_country_service()
    countries = country_service.get_all_countries()
    
    return {
        "success": True,
        "count": len(countries),
        "data": countries
    }


@router.get("/countries/{country_code}")
async def get_country(country_code: str):
    """Get detailed information about a specific country"""
    country_service = get_country_service()
    country = country_service.get_country(country_code)
    
    if not country:
        raise HTTPException(status_code=404, detail=f"Country not found: {country_code}")
    
    return {
        "success": True,
        "data": country
    }


@router.get("/countries/{country_code}/visas")
async def get_country_visas(country_code: str):
    """Get all visa types for a country"""
    country_service = get_country_service()
    visas = country_service.get_visa_types(country_code)
    
    if not visas:
        raise HTTPException(status_code=404, detail=f"No visa data for: {country_code}")
    
    return {
        "success": True,
        "country": country_code,
        "count": len(visas),
        "data": visas
    }


@router.get("/countries/{country_code}/visas/{visa_type}")
async def get_visa_details(country_code: str, visa_type: str):
    """Get detailed information about a specific visa type"""
    country_service = get_country_service()
    visa = country_service.get_visa_type(country_code, visa_type)
    
    if not visa:
        raise HTTPException(
            status_code=404, 
            detail=f"Visa type '{visa_type}' not found for {country_code}"
        )
    
    return {
        "success": True,
        "data": visa
    }


@router.get("/countries/{country_code}/financial")
async def get_financial_requirements(country_code: str):
    """Get financial requirements for a country"""
    country_service = get_country_service()
    thresholds = country_service.get_financial_thresholds(country_code)
    
    return {
        "success": True,
        "country": country_code,
        "data": thresholds
    }


@router.get("/countries/{destination}/stepping-stones")
async def get_stepping_stones(destination: str):
    """Get countries that can serve as stepping stones to the destination"""
    country_service = get_country_service()
    stepping_stones = country_service.get_stepping_stone_countries(destination)
    
    return {
        "success": True,
        "destination": destination,
        "count": len(stepping_stones),
        "data": stepping_stones
    }


@router.post("/countries/compare")
async def compare_countries(country_codes: List[str]):
    """Compare multiple countries side by side"""
    if len(country_codes) < 2:
        raise HTTPException(
            status_code=400, 
            detail="At least 2 countries required for comparison"
        )
    
    if len(country_codes) > 5:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 5 countries for comparison"
        )
    
    country_service = get_country_service()
    comparison = country_service.compare_countries(country_codes)
    
    return {
        "success": True,
        "data": comparison
    }


@router.get("/countries/search")
async def search_countries(
    min_score: Optional[int] = 0,
    skills: Optional[str] = None,
    stepping_stone: Optional[bool] = False
):
    """
    Search countries by criteria.
    
    - min_score: Minimum immigration friendliness score (1-10)
    - skills: Comma-separated list of skills to match
    - stepping_stone: Only return countries good as stepping stones
    """
    country_service = get_country_service()
    
    skill_list = skills.split(",") if skills else None
    
    results = country_service.search_countries(
        min_immigration_score=min_score,
        skill_areas=skill_list,
        stepping_stone=stepping_stone
    )
    
    return {
        "success": True,
        "count": len(results),
        "data": results
    }
