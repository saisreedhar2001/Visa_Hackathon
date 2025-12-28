"""
Amadeus API Service for Flight and Hotel Search
Supports worldwide airport and city search
"""
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from amadeus import Client, ResponseError
from functools import lru_cache


class AmadeusService:
    """Service to interact with Amadeus API for flights and hotels"""
    
    def __init__(self):
        api_key = os.getenv("AMADEUS_API_KEY")
        api_secret = os.getenv("AMADEUS_API_SECRET")
        
        if not api_key or not api_secret:
            print("⚠️ Warning: Amadeus API credentials not found in environment variables")
            print(f"   AMADEUS_API_KEY: {'set' if api_key else 'missing'}")
            print(f"   AMADEUS_API_SECRET: {'set' if api_secret else 'missing'}")
        
        self.client = Client(
            client_id=api_key,
            client_secret=api_secret,
            hostname='test'  # Use 'production' for live data
        )
    
    async def search_locations(self, keyword: str, location_type: str = "CITY,AIRPORT") -> List[Dict]:
        """
        Search for airports and cities worldwide by keyword
        
        Args:
            keyword: Search term (city name, airport name, or code)
            location_type: CITY, AIRPORT, or CITY,AIRPORT
        
        Returns:
            List of matching locations with codes
        """
        try:
            if len(keyword) < 2:
                return []
            
            response = self.client.reference_data.locations.get(
                keyword=keyword,
                subType=location_type,
                page={"limit": 10}
            )
            
            locations = []
            for loc in response.data:
                location = {
                    "type": loc.get("subType", "UNKNOWN"),
                    "name": loc.get("name", ""),
                    "iataCode": loc.get("iataCode", ""),
                    "city": loc.get("address", {}).get("cityName", loc.get("name", "")),
                    "country": loc.get("address", {}).get("countryName", ""),
                    "countryCode": loc.get("address", {}).get("countryCode", ""),
                    "displayName": f"{loc.get('name', '')} ({loc.get('iataCode', '')}) - {loc.get('address', {}).get('countryName', '')}"
                }
                locations.append(location)
            
            return locations
            
        except ResponseError as e:
            print(f"Location search error: {e}")
            return []
        except Exception as e:
            print(f"Location search error: {e}")
            return []
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: Optional[str] = None,
        return_date: Optional[str] = None,
        adults: int = 1,
        travel_class: str = "ECONOMY",
        non_stop: bool = False,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search for flights between any two airports worldwide
        
        Args:
            origin: Origin airport IATA code (e.g., 'DEL', 'JFK', 'LHR')
            destination: Destination airport IATA code
            departure_date: Date in YYYY-MM-DD format
            return_date: Return date in YYYY-MM-DD format (optional)
            adults: Number of adult passengers
            travel_class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
            non_stop: Only show non-stop flights
            max_results: Maximum number of results
        
        Returns:
            Flight search results
        """
        try:
            # Default to 7 days from now if no date provided
            if not departure_date:
                departure_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            
            # Build search parameters
            search_params = {
                "originLocationCode": origin.upper(),
                "destinationLocationCode": destination.upper(),
                "departureDate": departure_date,
                "adults": adults,
                "travelClass": travel_class,
                "max": max_results,
                "currencyCode": "USD"
            }
            
            if return_date:
                search_params["returnDate"] = return_date
            
            if non_stop:
                search_params["nonStop"] = "true"
            
            # Make API call
            response = self.client.shopping.flight_offers_search.get(**search_params)
            
            # Parse and format results
            flights = self._parse_flight_results(response.data, origin, destination)
            
            return {
                "success": True,
                "origin": origin.upper(),
                "destination": destination.upper(),
                "departure_date": departure_date,
                "return_date": return_date,
                "flights": flights,
                "total_results": len(flights)
            }
            
        except ResponseError as e:
            print(f"Amadeus API Error: {e}")
            error_msg = str(e)
            if "INVALID" in error_msg.upper():
                return {
                    "success": False,
                    "error": "Invalid airport code. Please check the origin and destination codes.",
                    "flights": []
                }
            return {
                "success": False,
                "error": str(e),
                "flights": []
            }
        except Exception as e:
            print(f"Flight search error: {e}")
            return {
                "success": False,
                "error": str(e),
                "flights": []
            }
    
    def _parse_flight_results(self, data: List, origin: str, destination: str) -> List[Dict]:
        """Parse Amadeus flight response into clean format"""
        flights = []
        
        for offer in data:
            try:
                price = offer.get("price", {})
                itineraries = offer.get("itineraries", [])
                
                if not itineraries:
                    continue
                
                outbound = itineraries[0]
                segments = outbound.get("segments", [])
                
                if not segments:
                    continue
                
                first_segment = segments[0]
                last_segment = segments[-1]
                
                # Calculate total duration
                duration = outbound.get("duration", "PT0H0M")
                duration_str = self._format_duration(duration)
                
                # Get airline info
                carrier = first_segment.get("carrierCode", "Unknown")
                
                # Get departure date for booking link
                dep_date = first_segment.get("departure", {}).get("at", "")[:10]
                
                flight_info = {
                    "id": offer.get("id"),
                    "price": {
                        "total": float(price.get("total", 0)),
                        "currency": price.get("currency", "USD"),
                        "formatted": f"${float(price.get('total', 0)):,.2f}"
                    },
                    "airline": {
                        "code": carrier,
                        "name": self._get_airline_name(carrier),
                        "logo": f"https://pics.avs.io/200/80/{carrier}.png"
                    },
                    "departure": {
                        "airport": first_segment.get("departure", {}).get("iataCode"),
                        "time": first_segment.get("departure", {}).get("at"),
                        "formatted_time": self._format_datetime(first_segment.get("departure", {}).get("at"))
                    },
                    "arrival": {
                        "airport": last_segment.get("arrival", {}).get("iataCode"),
                        "time": last_segment.get("arrival", {}).get("at"),
                        "formatted_time": self._format_datetime(last_segment.get("arrival", {}).get("at")),
                    },
                    "duration": duration_str,
                    "stops": len(segments) - 1,
                    "stops_text": "Non-stop" if len(segments) == 1 else f"{len(segments) - 1} stop(s)",
                    "segments": [
                        {
                            "departure": seg.get("departure", {}).get("iataCode"),
                            "arrival": seg.get("arrival", {}).get("iataCode"),
                            "carrier": seg.get("carrierCode"),
                            "flight_number": f"{seg.get('carrierCode')}{seg.get('number')}",
                            "duration": self._format_duration(seg.get("duration", "PT0H0M"))
                        }
                        for seg in segments
                    ],
                    "booking_link": self._generate_booking_link(
                        first_segment.get("departure", {}).get("iataCode"),
                        last_segment.get("arrival", {}).get("iataCode"),
                        dep_date
                    )
                }
                
                # Add return flight info if exists
                if len(itineraries) > 1:
                    return_itinerary = itineraries[1]
                    return_segments = return_itinerary.get("segments", [])
                    if return_segments:
                        flight_info["return"] = {
                            "departure": return_segments[0].get("departure", {}).get("at"),
                            "arrival": return_segments[-1].get("arrival", {}).get("at"),
                            "duration": self._format_duration(return_itinerary.get("duration", "PT0H0M")),
                            "stops": len(return_segments) - 1
                        }
                
                flights.append(flight_info)
                
            except Exception as e:
                print(f"Error parsing flight offer: {e}")
                continue
        
        return flights
    
    def _format_duration(self, duration: str) -> str:
        """Convert ISO 8601 duration to readable format"""
        # PT12H30M -> 12h 30m
        duration = duration.replace("PT", "")
        hours = 0
        minutes = 0
        
        if "H" in duration:
            parts = duration.split("H")
            hours = int(parts[0])
            duration = parts[1] if len(parts) > 1 else ""
        
        if "M" in duration:
            minutes = int(duration.replace("M", ""))
        
        return f"{hours}h {minutes}m"
    
    def _format_datetime(self, dt_str: str) -> str:
        """Format datetime string to readable format"""
        if not dt_str:
            return ""
        try:
            dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            return dt.strftime("%I:%M %p, %b %d")
        except:
            return dt_str
    
    def _get_airline_name(self, code: str) -> str:
        """Get airline name from code"""
        airlines = {
            "AA": "American Airlines",
            "UA": "United Airlines",
            "DL": "Delta Air Lines",
            "BA": "British Airways",
            "LH": "Lufthansa",
            "AF": "Air France",
            "EK": "Emirates",
            "QR": "Qatar Airways",
            "SQ": "Singapore Airlines",
            "AI": "Air India",
            "6E": "IndiGo",
            "UK": "Vistara",
            "QF": "Qantas",
            "NH": "ANA",
            "JL": "Japan Airlines",
            "CX": "Cathay Pacific",
            "TK": "Turkish Airlines",
            "EY": "Etihad Airways",
            "KL": "KLM",
            "LX": "Swiss",
            "VS": "Virgin Atlantic",
            "AC": "Air Canada",
            "SU": "Aeroflot",
            "AZ": "ITA Airways",
            "IB": "Iberia",
            "SK": "SAS",
            "OS": "Austrian Airlines",
            "LO": "LOT Polish",
            "TG": "Thai Airways",
            "MH": "Malaysia Airlines",
            "GA": "Garuda Indonesia",
            "CZ": "China Southern",
            "MU": "China Eastern",
            "CA": "Air China",
            "OZ": "Asiana Airlines",
            "KE": "Korean Air",
            "BR": "EVA Air",
            "CI": "China Airlines",
        }
        return airlines.get(code, code)
    
    def _generate_booking_link(self, origin: str, destination: str, date: str, return_date: str = None) -> str:
        """Generate Google Flights booking link - more reliable than Skyscanner"""
        if return_date:
            return f"https://www.google.com/travel/flights?q=flights+from+{origin}+to+{destination}+on+{date}+return+{return_date}"
        return f"https://www.google.com/travel/flights?q=flights+from+{origin}+to+{destination}+on+{date}"
    
    async def search_hotels(
        self,
        city_code: str,
        check_in_date: Optional[str] = None,
        check_out_date: Optional[str] = None,
        adults: int = 1,
        rooms: int = 1,
        radius: int = 50,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search for hotels by city code
        
        Args:
            city_code: City IATA code (e.g., 'PAR', 'NYC', 'LON')
            check_in_date: Check-in date in YYYY-MM-DD format
            check_out_date: Check-out date in YYYY-MM-DD format
            adults: Number of adult guests
            rooms: Number of rooms
            radius: Search radius in km
            max_results: Maximum number of results
        
        Returns:
            Hotel search results
        """
        try:
            # Default dates
            if not check_in_date:
                check_in_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            if not check_out_date:
                check_out_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
            
            city_code = city_code.upper()
            
            # First, get hotels by city
            hotels_data = []
            try:
                hotel_list_response = self.client.reference_data.locations.hotels.by_city.get(
                    cityCode=city_code,
                    radius=radius,
                    radiusUnit="KM"
                )
                if hotel_list_response.data:
                    hotels_data = hotel_list_response.data[:max_results]
            except ResponseError as e:
                print(f"Hotel list error: {e}")
                # Return Google Hotels link as fallback
                return {
                    "success": True,
                    "city_code": city_code,
                    "check_in": check_in_date,
                    "check_out": check_out_date,
                    "hotels": [],
                    "message": "Hotels search unavailable for this location. Use the link below to search on Google Hotels.",
                    "fallback_link": f"https://www.google.com/travel/hotels?q=hotels+in+{city_code}&dates={check_in_date}+to+{check_out_date}"
                }
            
            if not hotels_data:
                return {
                    "success": True,
                    "city_code": city_code,
                    "hotels": [],
                    "message": "No hotels found in this area",
                    "fallback_link": f"https://www.google.com/travel/hotels?q=hotels+in+{city_code}"
                }
            
            # Get hotel IDs
            hotel_ids = [hotel.get("hotelId") for hotel in hotels_data if hotel.get("hotelId")]
            
            # Search for offers (prices) for these hotels
            hotels = []
            
            try:
                offers_response = self.client.shopping.hotel_offers_search.get(
                    hotelIds=hotel_ids[:5],  # Limit to avoid timeout
                    adults=adults,
                    checkInDate=check_in_date,
                    checkOutDate=check_out_date,
                    roomQuantity=rooms,
                    currency="USD"
                )
                
                # Check if response data exists and is iterable
                if offers_response.data:
                    for offer_data in offers_response.data:
                        hotel = self._parse_hotel_offer(offer_data, city_code)
                        if hotel:
                            hotels.append(hotel)
                        
            except ResponseError as e:
                # If offers fail, return basic hotel info without prices
                print(f"Hotel offers error: {e}")
                for hotel_data in hotels_data[:max_results]:
                    hotels.append({
                        "id": hotel_data.get("hotelId"),
                        "name": hotel_data.get("name", "Unknown Hotel"),
                        "city_code": city_code,
                        "distance": hotel_data.get("distance", {}).get("value"),
                        "price": None,
                        "rating": None,
                        "amenities": [],
                        "booking_link": f"https://www.google.com/travel/hotels?q={hotel_data.get('name', '').replace(' ', '+')}"
                    })
            
            return {
                "success": True,
                "city_code": city_code,
                "check_in": check_in_date,
                "check_out": check_out_date,
                "hotels": hotels,
                "total_results": len(hotels),
                "fallback_link": f"https://www.google.com/travel/hotels?q=hotels+in+{city_code}"
            }
            
        except ResponseError as e:
            print(f"Amadeus Hotel API Error: {e}")
            return {
                "success": True,
                "error": str(e),
                "hotels": [],
                "fallback_link": f"https://www.google.com/travel/hotels?q=hotels+in+{city_code}"
            }
        except Exception as e:
            print(f"Hotel search error: {e}")
            return {
                "success": False,
                "error": str(e),
                "hotels": [],
                "fallback_link": f"https://www.google.com/travel/hotels"
            }
    
    def _parse_hotel_offer(self, data: Dict, city_code: str) -> Optional[Dict]:
        """Parse Amadeus hotel offer response"""
        try:
            hotel = data.get("hotel", {})
            offers = data.get("offers", [])
            
            offer = offers[0] if offers else {}
            price = offer.get("price", {})
            room = offer.get("room", {})
            
            hotel_name = hotel.get("name", "Unknown Hotel")
            
            return {
                "id": hotel.get("hotelId"),
                "name": hotel_name,
                "city_code": city_code,
                "rating": hotel.get("rating"),
                "price": {
                    "total": float(price.get("total", 0)) if price.get("total") else None,
                    "currency": price.get("currency", "USD"),
                    "formatted": f"${float(price.get('total', 0)):,.2f}" if price.get("total") else "Price unavailable",
                    "per_night": f"${float(price.get('total', 0)) / 3:,.2f}/night" if price.get("total") else None
                },
                "room_type": room.get("typeEstimated", {}).get("category", "Standard Room"),
                "room_description": room.get("description", {}).get("text", ""),
                "amenities": hotel.get("amenities", [])[:5],
                "address": hotel.get("address", {}),
                "contact": hotel.get("contact", {}),
                "booking_link": f"https://www.google.com/travel/hotels?q={hotel_name.replace(' ', '+')}"
            }
        except Exception as e:
            print(f"Error parsing hotel offer: {e}")
            return None


# Singleton instance
_amadeus_service = None

def get_amadeus_service() -> AmadeusService:
    """Get or create Amadeus service instance"""
    global _amadeus_service
    if _amadeus_service is None:
        _amadeus_service = AmadeusService()
    return _amadeus_service
