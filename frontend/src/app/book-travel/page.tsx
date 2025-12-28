"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plane,
    Hotel,
    MapPin,
    Calendar,
    Users,
    Clock,
    ArrowRight,
    Search,
    Loader2,
    Globe2,
    ChevronDown,
    ExternalLink,
    Star,
    Sparkles,
    ArrowLeftRight,
    Building2,
    Wallet,
    Filter,
    RefreshCw,
    X,
} from "lucide-react";

// Types
interface Location {
    type: string;
    name: string;
    iataCode: string;
    city: string;
    country: string;
    countryCode: string;
    displayName: string;
}

interface Flight {
    id: string;
    price: {
        total: number;
        currency: string;
        formatted: string;
    };
    airline: {
        code: string;
        name: string;
        logo: string;
    };
    departure: {
        airport: string;
        time: string;
        formatted_time: string;
    };
    arrival: {
        airport: string;
        time: string;
        formatted_time: string;
    };
    duration: string;
    stops: number;
    stops_text: string;
    booking_link: string;
}

interface HotelData {
    id: string;
    name: string;
    city_code: string;
    rating: number | null;
    price: {
        total: number | null;
        currency: string;
        formatted: string;
        per_night: string | null;
    } | null;
    room_type: string;
    amenities: string[];
    booking_link: string;
}

const API_BASE = "http://localhost:8000/api/v1";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Location Autocomplete Component
function LocationAutocomplete({
    label,
    icon: Icon,
    placeholder,
    value,
    onChange,
    onSelect,
    colorClass = "blue",
}: {
    label: string;
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (location: Location) => void;
    colorClass?: string;
}) {
    const [query, setQuery] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search locations when query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setLocations([]);
            return;
        }

        const searchLocations = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${API_BASE}/travel/locations/search?keyword=${encodeURIComponent(debouncedQuery)}`
                );
                const data = await response.json();
                if (data.success) {
                    setLocations(data.locations || []);
                }
            } catch (error) {
                console.error("Location search error:", error);
            } finally {
                setLoading(false);
            }
        };

        searchLocations();
    }, [debouncedQuery]);

    const handleSelect = (location: Location) => {
        onChange(location.iataCode);
        setQuery(location.displayName);
        onSelect(location);
        setIsOpen(false);
    };

    const focusColor = colorClass === "purple" ? "focus:border-purple-500 focus:ring-purple-500/20" : "focus:border-blue-500 focus:ring-blue-500/20";
    const highlightColor = colorClass === "purple" ? "bg-purple-500/20" : "bg-blue-500/20";

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-sm text-white/60 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query || value}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white ${focusColor} focus:ring-2 outline-none transition-all`}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 animate-spin" />
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && locations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                        {locations.map((location, index) => (
                            <button
                                key={`${location.iataCode}-${index}`}
                                onClick={() => handleSelect(location)}
                                className={`w-full px-4 py-3 text-left hover:${highlightColor} transition-colors flex items-center gap-3 border-b border-white/5 last:border-0`}
                            >
                                <div className={`w-10 h-10 rounded-lg ${highlightColor} flex items-center justify-center`}>
                                    {location.type === "AIRPORT" ? (
                                        <Plane className="w-5 h-5 text-white" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {location.name}{" "}
                                        <span className="text-blue-400">({location.iataCode})</span>
                                    </p>
                                    <p className="text-white/50 text-sm">
                                        {location.city}, {location.country}
                                    </p>
                                </div>
                                <span className="text-xs text-white/40 uppercase">
                                    {location.type}
                                </span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BookTravelPage() {
    // State
    const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");
    const [loading, setLoading] = useState(false);

    // Flight search state
    const [originCode, setOriginCode] = useState("");
    const [destinationCode, setDestinationCode] = useState("");
    const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [passengers, setPassengers] = useState(1);
    const [travelClass, setTravelClass] = useState("ECONOMY");
    const [flights, setFlights] = useState<Flight[]>([]);
    const [flightError, setFlightError] = useState("");

    // Hotel search state
    const [hotelCityCode, setHotelCityCode] = useState("");
    const [selectedHotelCity, setSelectedHotelCity] = useState<Location | null>(null);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);
    const [rooms, setRooms] = useState(1);
    const [hotels, setHotels] = useState<HotelData[]>([]);
    const [hotelError, setHotelError] = useState("");
    const [hotelFallbackLink, setHotelFallbackLink] = useState("");

    // Set default dates
    useEffect(() => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const twoWeeks = new Date(today);
        twoWeeks.setDate(today.getDate() + 14);

        const formatDate = (date: Date) => date.toISOString().split("T")[0];

        setDepartureDate(formatDate(nextWeek));
        setReturnDate(formatDate(twoWeeks));
        setCheckInDate(formatDate(nextWeek));
        setCheckOutDate(formatDate(twoWeeks));
    }, []);

    // Search flights
    const searchFlights = async () => {
        if (!originCode || !destinationCode || !departureDate) {
            setFlightError("Please select origin, destination, and departure date");
            return;
        }

        if (originCode.length !== 3 || destinationCode.length !== 3) {
            setFlightError("Please select valid airport codes (3 letters)");
            return;
        }

        setLoading(true);
        setFlightError("");
        setFlights([]);

        try {
            const params = new URLSearchParams({
                origin: originCode.toUpperCase(),
                destination: destinationCode.toUpperCase(),
                departure_date: departureDate,
                adults: passengers.toString(),
                travel_class: travelClass,
            });

            if (returnDate) {
                params.append("return_date", returnDate);
            }

            const response = await fetch(
                `${API_BASE}/travel/flights/search?${params}`
            );
            const data = await response.json();

            if (data.success) {
                setFlights(data.flights || []);
                if (data.flights?.length === 0) {
                    setFlightError("No flights found for this route. Try different dates or airports.");
                }
            } else {
                setFlightError(data.error || "Failed to search flights");
            }
        } catch (error) {
            setFlightError("Failed to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Search hotels
    const searchHotels = async () => {
        if (!hotelCityCode || !checkInDate || !checkOutDate) {
            setHotelError("Please select a city and dates");
            return;
        }

        if (hotelCityCode.length !== 3) {
            setHotelError("Please select a valid city code (3 letters)");
            return;
        }

        setLoading(true);
        setHotelError("");
        setHotels([]);
        setHotelFallbackLink("");

        try {
            const params = new URLSearchParams({
                city_code: hotelCityCode.toUpperCase(),
                check_in: checkInDate,
                check_out: checkOutDate,
                adults: guests.toString(),
                rooms: rooms.toString(),
            });

            const response = await fetch(
                `${API_BASE}/travel/hotels/search?${params}`
            );
            const data = await response.json();

            if (data.success) {
                setHotels(data.hotels || []);
                setHotelFallbackLink(data.fallback_link || "");
                if (data.hotels?.length === 0) {
                    setHotelError(data.message || "No hotels found. You can search on Google Hotels using the link below.");
                }
            } else {
                setHotelError(data.error || "Failed to search hotels");
                setHotelFallbackLink(data.fallback_link || "");
            }
        } catch (error) {
            setHotelError("Failed to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300">
                            Search Any City Worldwide
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
                        Book Your Travel
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Search real-time flights and hotels to <span className="text-blue-400 font-medium">any destination worldwide</span>
                    </p>
                </motion.div>

                {/* Tab Switcher */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex p-1 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-xl">
                        <button
                            onClick={() => setActiveTab("flights")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                                activeTab === "flights"
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            <Plane className="w-5 h-5" />
                            Flights
                        </button>
                        <button
                            onClick={() => setActiveTab("hotels")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                                activeTab === "hotels"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            <Hotel className="w-5 h-5" />
                            Hotels
                        </button>
                    </div>
                </motion.div>

                {/* Search Forms */}
                <AnimatePresence mode="wait">
                    {activeTab === "flights" ? (
                        <motion.div
                            key="flights"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mb-8"
                        >
                            {/* Flight Search Form */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Origin - Autocomplete */}
                                    <LocationAutocomplete
                                        label="From"
                                        icon={MapPin}
                                        placeholder="Type city or airport..."
                                        value={originCode}
                                        onChange={setOriginCode}
                                        onSelect={(loc) => {
                                            setSelectedOrigin(loc);
                                            setOriginCode(loc.iataCode);
                                        }}
                                        colorClass="blue"
                                    />

                                    {/* Destination - Autocomplete */}
                                    <LocationAutocomplete
                                        label="To"
                                        icon={Globe2}
                                        placeholder="Type city or airport..."
                                        value={destinationCode}
                                        onChange={setDestinationCode}
                                        onSelect={(loc) => {
                                            setSelectedDestination(loc);
                                            setDestinationCode(loc.iataCode);
                                        }}
                                        colorClass="blue"
                                    />

                                    {/* Departure Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Departure
                                        </label>
                                        <input
                                            type="date"
                                            value={departureDate}
                                            onChange={(e) =>
                                                setDepartureDate(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Return Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Return (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={returnDate}
                                            onChange={(e) =>
                                                setReturnDate(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* Passengers */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Passengers
                                        </label>
                                        <select
                                            value={passengers}
                                            onChange={(e) =>
                                                setPassengers(
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        >
                                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                                <option key={num} value={num}>
                                                    {num}{" "}
                                                    {num === 1
                                                        ? "Passenger"
                                                        : "Passengers"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Travel Class */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Class
                                        </label>
                                        <select
                                            value={travelClass}
                                            onChange={(e) =>
                                                setTravelClass(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        >
                                            <option value="ECONOMY">Economy</option>
                                            <option value="PREMIUM_ECONOMY">
                                                Premium Economy
                                            </option>
                                            <option value="BUSINESS">
                                                Business
                                            </option>
                                            <option value="FIRST">First</option>
                                        </select>
                                    </div>

                                    {/* Search Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={searchFlights}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-5 h-5" />
                                                    Search Flights
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Selected route info */}
                                {selectedOrigin && selectedDestination && (
                                    <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                                        <Plane className="w-5 h-5 text-blue-400" />
                                        <span className="text-blue-300">
                                            {selectedOrigin.city}, {selectedOrigin.country} ({selectedOrigin.iataCode})
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-300">
                                            {selectedDestination.city}, {selectedDestination.country} ({selectedDestination.iataCode})
                                        </span>
                                    </div>
                                )}

                                {flightError && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {flightError}
                                    </div>
                                )}
                            </div>

                            {/* Flight Loading Skeleton */}
                            {loading && activeTab === "flights" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                                <Plane className="w-6 h-6 text-white animate-pulse" />
                                            </div>
                                            <div className="absolute -inset-1 rounded-full border-2 border-blue-400/50 animate-ping" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Searching flights...</h3>
                                            <p className="text-sm text-white/50">Finding the best deals for you</p>
                                        </div>
                                    </div>

                                    {/* Skeleton Cards */}
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.15 }}
                                            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden relative"
                                        >
                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                            
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                {/* Airline skeleton */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl bg-white/10 animate-pulse" />
                                                    <div className="space-y-2">
                                                        <div className="w-24 h-4 rounded bg-white/10 animate-pulse" />
                                                        <div className="w-16 h-3 rounded bg-white/5 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Route skeleton */}
                                                <div className="flex-1 flex items-center justify-center gap-4">
                                                    <div className="text-center">
                                                        <div className="w-12 h-6 rounded bg-white/10 animate-pulse mx-auto mb-2" />
                                                        <div className="w-20 h-3 rounded bg-white/5 animate-pulse" />
                                                    </div>
                                                    <div className="flex-1 max-w-[200px] flex flex-col items-center">
                                                        <div className="w-16 h-3 rounded bg-white/5 animate-pulse mb-2" />
                                                        <div className="w-full flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-400/50" />
                                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400/30 to-cyan-400/30" />
                                                            <Plane className="w-4 h-4 text-cyan-400/50 animate-pulse" />
                                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400/30 to-blue-400/30" />
                                                            <div className="w-2 h-2 rounded-full bg-blue-400/50" />
                                                        </div>
                                                        <div className="w-12 h-3 rounded bg-blue-400/20 animate-pulse mt-2" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="w-12 h-6 rounded bg-white/10 animate-pulse mx-auto mb-2" />
                                                        <div className="w-20 h-3 rounded bg-white/5 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Price skeleton */}
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="w-20 h-6 rounded bg-green-400/20 animate-pulse mb-1" />
                                                        <div className="w-14 h-3 rounded bg-white/5 animate-pulse" />
                                                    </div>
                                                    <div className="w-20 h-10 rounded-xl bg-blue-500/30 animate-pulse" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Loading progress bar */}
                                    <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "easeInOut" }}
                                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Flight Results */}
                            {!loading && flights.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Plane className="w-5 h-5 text-blue-400" />
                                        {flights.length} Flights Found
                                    </h2>

                                    <div className="grid gap-4">
                                        {flights.map((flight, index) => (
                                            <motion.div
                                                key={flight.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-all"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    {/* Airline Info */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={flight.airline.logo}
                                                                alt={flight.airline.name}
                                                                className="w-12 h-12 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {flight.airline.name}
                                                            </p>
                                                            <p className="text-sm text-white/50">
                                                                {flight.airline.code}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Flight Route */}
                                                    <div className="flex-1 flex items-center justify-center gap-4">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-white">
                                                                {flight.departure.airport}
                                                            </p>
                                                            <p className="text-sm text-white/50">
                                                                {flight.departure.formatted_time}
                                                            </p>
                                                        </div>

                                                        <div className="flex-1 flex flex-col items-center max-w-[200px]">
                                                            <p className="text-xs text-white/50 mb-1">
                                                                {flight.duration}
                                                            </p>
                                                            <div className="w-full flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400" />
                                                                <Plane className="w-4 h-4 text-cyan-400" />
                                                                <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400" />
                                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                            </div>
                                                            <p className="text-xs text-blue-400 mt-1">
                                                                {flight.stops_text}
                                                            </p>
                                                        </div>

                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-white">
                                                                {flight.arrival.airport}
                                                            </p>
                                                            <p className="text-sm text-white/50">
                                                                {flight.arrival.formatted_time}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Price & Book */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                                                {flight.price.formatted}
                                                            </p>
                                                            <p className="text-xs text-white/50">
                                                                per person
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={flight.booking_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                                        >
                                                            Book
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hotels"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="mb-8"
                        >
                            {/* Hotel Search Form */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Destination - Autocomplete */}
                                    <LocationAutocomplete
                                        label="Destination"
                                        icon={Globe2}
                                        placeholder="Type city name..."
                                        value={hotelCityCode}
                                        onChange={setHotelCityCode}
                                        onSelect={(loc) => {
                                            setSelectedHotelCity(loc);
                                            setHotelCityCode(loc.iataCode);
                                        }}
                                        colorClass="purple"
                                    />

                                    {/* Check-in */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Check-in
                                        </label>
                                        <input
                                            type="date"
                                            value={checkInDate}
                                            onChange={(e) =>
                                                setCheckInDate(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Check-out */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Check-out
                                        </label>
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            onChange={(e) =>
                                                setCheckOutDate(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Guests & Rooms */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Guests
                                            </label>
                                            <select
                                                value={guests}
                                                onChange={(e) =>
                                                    setGuests(
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            >
                                                {[1, 2, 3, 4].map((num) => (
                                                    <option key={num} value={num}>
                                                        {num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Rooms
                                            </label>
                                            <select
                                                value={rooms}
                                                onChange={(e) =>
                                                    setRooms(
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            >
                                                {[1, 2, 3, 4].map((num) => (
                                                    <option key={num} value={num}>
                                                        {num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected city info */}
                                {selectedHotelCity && (
                                    <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                                        <Hotel className="w-5 h-5 text-purple-400" />
                                        <span className="text-purple-300">
                                            Searching hotels in {selectedHotelCity.city}, {selectedHotelCity.country} ({selectedHotelCity.iataCode})
                                        </span>
                                    </div>
                                )}

                                {/* Search Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={searchHotels}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                Search Hotels
                                            </>
                                        )}
                                    </button>
                                </div>

                                {hotelError && (
                                    <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm text-center">
                                        {hotelError}
                                        {hotelFallbackLink && (
                                            <a
                                                href={hotelFallbackLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-3 px-4 py-2 mx-auto w-fit rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                                            >
                                                Search on Google Hotels →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hotel Loading Skeleton */}
                            {loading && activeTab === "hotels" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                <Hotel className="w-6 h-6 text-white animate-pulse" />
                                            </div>
                                            <div className="absolute -inset-1 rounded-full border-2 border-purple-400/50 animate-ping" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Searching hotels...</h3>
                                            <p className="text-sm text-white/50">Finding the best accommodations</p>
                                        </div>
                                    </div>

                                    {/* Skeleton Cards */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden relative"
                                            >
                                                {/* Shimmer effect */}
                                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                                
                                                {/* Image skeleton */}
                                                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse mb-4 flex items-center justify-center">
                                                    <Hotel className="w-10 h-10 text-purple-400/30" />
                                                </div>

                                                {/* Title skeleton */}
                                                <div className="w-3/4 h-5 rounded bg-white/10 animate-pulse mb-3" />
                                                
                                                {/* Location skeleton */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-4 h-4 rounded bg-purple-400/20 animate-pulse" />
                                                    <div className="w-20 h-3 rounded bg-white/5 animate-pulse" />
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400/30" />
                                                        <div className="w-8 h-3 rounded bg-white/10 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Room type skeleton */}
                                                <div className="w-1/2 h-3 rounded bg-white/5 animate-pulse mb-3" />

                                                {/* Amenities skeleton */}
                                                <div className="flex gap-1 mb-4">
                                                    {[1, 2, 3].map((j) => (
                                                        <div key={j} className="w-16 h-5 rounded-full bg-purple-500/10 animate-pulse" />
                                                    ))}
                                                </div>

                                                {/* Price section skeleton */}
                                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                    <div>
                                                        <div className="w-20 h-6 rounded bg-green-400/20 animate-pulse mb-1" />
                                                        <div className="w-16 h-3 rounded bg-white/5 animate-pulse" />
                                                    </div>
                                                    <div className="w-16 h-8 rounded-xl bg-purple-500/30 animate-pulse" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Loading progress bar */}
                                    <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "easeInOut" }}
                                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Hotel Results */}
                            {!loading && hotels.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Hotel className="w-5 h-5 text-purple-400" />
                                        {hotels.length} Hotels Found
                                    </h2>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {hotels.map((hotel, index) => (
                                            <motion.div
                                                key={hotel.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
                                            >
                                                {/* Hotel Image Placeholder */}
                                                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                                    <Hotel className="w-12 h-12 text-purple-400/50" />
                                                </div>

                                                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                                    {hotel.name}
                                                </h3>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPin className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm text-white/60">
                                                        {hotel.city_code}
                                                    </span>
                                                    {hotel.rating && (
                                                        <div className="flex items-center gap-1 ml-auto">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="text-sm text-white">
                                                                {hotel.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {hotel.room_type && (
                                                    <p className="text-sm text-white/50 mb-3">
                                                        {hotel.room_type}
                                                    </p>
                                                )}

                                                {hotel.amenities && hotel.amenities.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {hotel.amenities
                                                            .slice(0, 3)
                                                            .map((amenity, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs"
                                                                >
                                                                    {amenity}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                                    {hotel.price ? (
                                                        <div>
                                                            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                                                {hotel.price.formatted}
                                                            </p>
                                                            {hotel.price.per_night && (
                                                                <p className="text-xs text-white/50">
                                                                    {hotel.price.per_night}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-white/50">
                                                            Price on request
                                                        </p>
                                                    )}
                                                    <a
                                                        href={hotel.booking_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                                    >
                                                        Book
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Fallback link when no results */}
                            {hotels.length === 0 && hotelFallbackLink && !hotelError && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 text-center"
                                >
                                    <a
                                        href={hotelFallbackLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                    >
                                        Search on Google Hotels
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20"
                >
                    <p className="text-sm text-blue-300 text-center">
                        ✨ Real-time data powered by Amadeus API • Search any airport or city worldwide • Click "Book" to complete on Google Flights/Hotels
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
