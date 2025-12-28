"""
Travel API Routes - Flights & Hotels using Amadeus
Supports worldwide airport and city search
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from src.services.amadeus_service import get_amadeus_service

router = APIRouter(prefix="/travel", tags=["Travel"])


class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: Optional[str] = None
    return_date: Optional[str] = None
    adults: int = 1
    travel_class: str = "ECONOMY"
    non_stop: bool = False


class HotelSearchRequest(BaseModel):
    city_code: str
    check_in_date: Optional[str] = None
    check_out_date: Optional[str] = None
    adults: int = 1
    rooms: int = 1


@router.get("/locations/search")
async def search_locations(
    keyword: str = Query(..., min_length=2, description="Search term (city, airport, or code)"),
    type: str = Query("CITY,AIRPORT", description="Location type: CITY, AIRPORT, or CITY,AIRPORT")
):
    """
    Search for airports and cities worldwide
    
    Example: /travel/locations/search?keyword=london
    Returns matching airports and cities with their IATA codes
    """
    service = get_amadeus_service()
    locations = await service.search_locations(keyword, type)
    
    return {
        "success": True,
        "keyword": keyword,
        "locations": locations,
        "total": len(locations)
    }


@router.get("/flights/search")
async def search_flights(
    origin: str = Query(..., min_length=3, max_length=3, description="Origin airport IATA code (e.g., DEL, JFK)"),
    destination: str = Query(..., min_length=3, max_length=3, description="Destination airport IATA code"),
    departure_date: Optional[str] = Query(None, description="Departure date (YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="Return date (YYYY-MM-DD)"),
    adults: int = Query(1, ge=1, le=9, description="Number of adult passengers"),
    travel_class: str = Query("ECONOMY", description="Travel class"),
    non_stop: bool = Query(False, description="Non-stop flights only")
):
    """
    Search for flights between any two airports worldwide
    
    Example: /travel/flights/search?origin=DEL&destination=JFK&departure_date=2025-01-15
    
    Use /travel/locations/search to find airport codes for any city
    """
    service = get_amadeus_service()
    
    result = await service.search_flights(
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        return_date=return_date,
        adults=adults,
        travel_class=travel_class,
        non_stop=non_stop
    )
    
    return result


@router.post("/flights/search")
async def search_flights_post(request: FlightSearchRequest):
    """Search for flights (POST method)"""
    service = get_amadeus_service()
    
    result = await service.search_flights(
        origin=request.origin,
        destination=request.destination,
        departure_date=request.departure_date,
        return_date=request.return_date,
        adults=request.adults,
        travel_class=request.travel_class,
        non_stop=request.non_stop
    )
    
    return result


@router.get("/hotels/search")
async def search_hotels(
    city_code: str = Query(..., min_length=3, max_length=3, description="City IATA code (e.g., PAR, NYC, LON)"),
    check_in: Optional[str] = Query(None, description="Check-in date (YYYY-MM-DD)"),
    check_out: Optional[str] = Query(None, description="Check-out date (YYYY-MM-DD)"),
    adults: int = Query(1, ge=1, le=4, description="Number of adult guests"),
    rooms: int = Query(1, ge=1, le=4, description="Number of rooms")
):
    """
    Search for hotels by city code
    
    Example: /travel/hotels/search?city_code=PAR&check_in=2025-01-15&check_out=2025-01-18
    
    Use /travel/locations/search to find city codes for any location
    """
    service = get_amadeus_service()
    
    result = await service.search_hotels(
        city_code=city_code,
        check_in_date=check_in,
        check_out_date=check_out,
        adults=adults,
        rooms=rooms
    )
    
    return result


@router.post("/hotels/search")
async def search_hotels_post(request: HotelSearchRequest):
    """Search for hotels (POST method)"""
    service = get_amadeus_service()
    
    result = await service.search_hotels(
        city_code=request.city_code,
        check_in_date=request.check_in_date,
        check_out_date=request.check_out_date,
        adults=request.adults,
        rooms=request.rooms
    )
    
    return result
