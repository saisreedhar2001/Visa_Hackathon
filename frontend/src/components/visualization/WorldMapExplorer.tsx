"use client";

import React, { useState, memo, useCallback } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// TopoJSON URL for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country data with coordinates and visa information
export const countryData: Record<string, {
    name: string;
    code: string;
    coordinates: [number, number];
    region: string;
    flag: string;
    popular: boolean;
    visaTypes: string[];
    avgProcessingDays: number;
    avgCostUSD: number;
}> = {
    USA: {
        name: "United States",
        code: "USA",
        coordinates: [-95.7129, 37.0902],
        region: "North America",
        flag: "🇺🇸",
        popular: true,
        visaTypes: ["H-1B", "L-1", "O-1", "EB-1", "EB-2", "EB-3"],
        avgProcessingDays: 180,
        avgCostUSD: 5000,
    },
    CAN: {
        name: "Canada",
        code: "CAN",
        coordinates: [-106.3468, 56.1304],
        region: "North America",
        flag: "🇨🇦",
        popular: true,
        visaTypes: ["Express Entry", "PNP", "LMIA", "Start-up Visa"],
        avgProcessingDays: 120,
        avgCostUSD: 3000,
    },
    GBR: {
        name: "United Kingdom",
        code: "GBR",
        coordinates: [-3.4360, 55.3781],
        region: "Europe",
        flag: "🇬🇧",
        popular: true,
        visaTypes: ["Skilled Worker", "Global Talent", "Innovator"],
        avgProcessingDays: 90,
        avgCostUSD: 4000,
    },
    DEU: {
        name: "Germany",
        code: "DEU",
        coordinates: [10.4515, 51.1657],
        region: "Europe",
        flag: "🇩🇪",
        popular: true,
        visaTypes: ["EU Blue Card", "Job Seeker", "Skilled Worker"],
        avgProcessingDays: 60,
        avgCostUSD: 2500,
    },
    AUS: {
        name: "Australia",
        code: "AUS",
        coordinates: [133.7751, -25.2744],
        region: "Oceania",
        flag: "🇦🇺",
        popular: true,
        visaTypes: ["Skilled Independent 189", "Skilled Nominated 190", "482"],
        avgProcessingDays: 150,
        avgCostUSD: 4500,
    },
    NLD: {
        name: "Netherlands",
        code: "NLD",
        coordinates: [5.2913, 52.1326],
        region: "Europe",
        flag: "🇳🇱",
        popular: true,
        visaTypes: ["Highly Skilled Migrant", "Orientation Year", "EU Blue Card"],
        avgProcessingDays: 45,
        avgCostUSD: 2000,
    },
    SGP: {
        name: "Singapore",
        code: "SGP",
        coordinates: [103.8198, 1.3521],
        region: "Asia",
        flag: "🇸🇬",
        popular: true,
        visaTypes: ["Employment Pass", "S Pass", "EntrePass"],
        avgProcessingDays: 21,
        avgCostUSD: 1500,
    },
    ARE: {
        name: "UAE",
        code: "ARE",
        coordinates: [53.8478, 23.4241],
        region: "Middle East",
        flag: "🇦🇪",
        popular: true,
        visaTypes: ["Golden Visa", "Employment Visa", "Green Visa"],
        avgProcessingDays: 30,
        avgCostUSD: 2000,
    },
    JPN: {
        name: "Japan",
        code: "JPN",
        coordinates: [138.2529, 36.2048],
        region: "Asia",
        flag: "🇯🇵",
        popular: true,
        visaTypes: ["Engineer/Specialist", "Highly Skilled Professional", "Business Manager"],
        avgProcessingDays: 60,
        avgCostUSD: 2500,
    },
    PRT: {
        name: "Portugal",
        code: "PRT",
        coordinates: [-8.2245, 39.3999],
        region: "Europe",
        flag: "🇵🇹",
        popular: true,
        visaTypes: ["D7 Visa", "Tech Visa", "Golden Visa", "Digital Nomad"],
        avgProcessingDays: 90,
        avgCostUSD: 3000,
    },
    FRA: {
        name: "France",
        code: "FRA",
        coordinates: [2.2137, 46.2276],
        region: "Europe",
        flag: "🇫🇷",
        popular: false,
        visaTypes: ["Talent Passport", "EU Blue Card", "Entrepreneur"],
        avgProcessingDays: 75,
        avgCostUSD: 2800,
    },
    IRL: {
        name: "Ireland",
        code: "IRL",
        coordinates: [-8.2439, 53.4129],
        region: "Europe",
        flag: "🇮🇪",
        popular: false,
        visaTypes: ["Critical Skills", "General Employment", "Stamp 4"],
        avgProcessingDays: 60,
        avgCostUSD: 3200,
    },
    NZL: {
        name: "New Zealand",
        code: "NZL",
        coordinates: [174.886, -40.9006],
        region: "Oceania",
        flag: "🇳🇿",
        popular: false,
        visaTypes: ["Skilled Migrant", "Essential Skills", "Entrepreneur"],
        avgProcessingDays: 120,
        avgCostUSD: 3500,
    },
    CHE: {
        name: "Switzerland",
        code: "CHE",
        coordinates: [8.2275, 46.8182],
        region: "Europe",
        flag: "🇨🇭",
        popular: false,
        visaTypes: ["L Permit", "B Permit", "C Permit"],
        avgProcessingDays: 90,
        avgCostUSD: 5000,
    },
    SWE: {
        name: "Sweden",
        code: "SWE",
        coordinates: [18.6435, 60.1282],
        region: "Europe",
        flag: "🇸🇪",
        popular: false,
        visaTypes: ["Work Permit", "EU Blue Card", "Self-Employment"],
        avgProcessingDays: 60,
        avgCostUSD: 2500,
    },
    DNK: {
        name: "Denmark",
        code: "DNK",
        coordinates: [9.5018, 56.2639],
        region: "Europe",
        flag: "🇩🇰",
        popular: false,
        visaTypes: ["Pay Limit Scheme", "Fast-track", "Positive List"],
        avgProcessingDays: 45,
        avgCostUSD: 2800,
    },
    NOR: {
        name: "Norway",
        code: "NOR",
        coordinates: [8.4689, 60.472],
        region: "Europe",
        flag: "🇳🇴",
        popular: false,
        visaTypes: ["Skilled Worker", "Seasonal Worker"],
        avgProcessingDays: 60,
        avgCostUSD: 3000,
    },
    FIN: {
        name: "Finland",
        code: "FIN",
        coordinates: [25.7482, 61.9241],
        region: "Europe",
        flag: "🇫🇮",
        popular: false,
        visaTypes: ["Specialist Permit", "EU Blue Card", "Startup Permit"],
        avgProcessingDays: 60,
        avgCostUSD: 2500,
    },
    ESP: {
        name: "Spain",
        code: "ESP",
        coordinates: [-3.7492, 40.4637],
        region: "Europe",
        flag: "🇪🇸",
        popular: false,
        visaTypes: ["Highly Skilled", "Entrepreneur", "Digital Nomad", "Golden Visa"],
        avgProcessingDays: 90,
        avgCostUSD: 2800,
    },
    ITA: {
        name: "Italy",
        code: "ITA",
        coordinates: [12.5674, 41.8719],
        region: "Europe",
        flag: "🇮🇹",
        popular: false,
        visaTypes: ["EU Blue Card", "Self-Employment", "Digital Nomad"],
        avgProcessingDays: 90,
        avgCostUSD: 2500,
    },
    KOR: {
        name: "South Korea",
        code: "KOR",
        coordinates: [127.7669, 35.9078],
        region: "Asia",
        flag: "🇰🇷",
        popular: false,
        visaTypes: ["E-7", "D-8", "F-2"],
        avgProcessingDays: 45,
        avgCostUSD: 2000,
    },
    MYS: {
        name: "Malaysia",
        code: "MYS",
        coordinates: [101.9758, 4.2105],
        region: "Asia",
        flag: "🇲🇾",
        popular: false,
        visaTypes: ["Employment Pass", "MM2H", "DE Rantau"],
        avgProcessingDays: 30,
        avgCostUSD: 1500,
    },
    THA: {
        name: "Thailand",
        code: "THA",
        coordinates: [100.9925, 15.87],
        region: "Asia",
        flag: "🇹🇭",
        popular: false,
        visaTypes: ["LTR Visa", "Smart Visa", "Non-B"],
        avgProcessingDays: 30,
        avgCostUSD: 1200,
    },
    IND: {
        name: "India",
        code: "IND",
        coordinates: [78.9629, 20.5937],
        region: "Asia",
        flag: "🇮🇳",
        popular: false,
        visaTypes: ["Employment Visa", "Business Visa"],
        avgProcessingDays: 21,
        avgCostUSD: 500,
    },
    CHN: {
        name: "China",
        code: "CHN",
        coordinates: [104.1954, 35.8617],
        region: "Asia",
        flag: "🇨🇳",
        popular: false,
        visaTypes: ["Z Visa", "R Visa", "M Visa"],
        avgProcessingDays: 45,
        avgCostUSD: 1500,
    },
    BRA: {
        name: "Brazil",
        code: "BRA",
        coordinates: [-51.9253, -14.235],
        region: "South America",
        flag: "🇧🇷",
        popular: false,
        visaTypes: ["Work Visa", "Digital Nomad", "Investor"],
        avgProcessingDays: 60,
        avgCostUSD: 1800,
    },
    MEX: {
        name: "Mexico",
        code: "MEX",
        coordinates: [-102.5528, 23.6345],
        region: "North America",
        flag: "🇲🇽",
        popular: false,
        visaTypes: ["Temporary Resident", "Permanent Resident"],
        avgProcessingDays: 45,
        avgCostUSD: 1200,
    },
    CRI: {
        name: "Costa Rica",
        code: "CRI",
        coordinates: [-83.7534, 9.7489],
        region: "Central America",
        flag: "🇨🇷",
        popular: false,
        visaTypes: ["Rentista", "Digital Nomad", "Investor"],
        avgProcessingDays: 60,
        avgCostUSD: 1500,
    },
};

// Name to ISO3 mapping for geography identification
const countryNameToCode: Record<string, string> = {
    "United States of America": "USA",
    "United States": "USA",
    "Canada": "CAN",
    "United Kingdom": "GBR",
    "Germany": "DEU",
    "Australia": "AUS",
    "Netherlands": "NLD",
    "Singapore": "SGP",
    "United Arab Emirates": "ARE",
    "Japan": "JPN",
    "Portugal": "PRT",
    "France": "FRA",
    "Ireland": "IRL",
    "New Zealand": "NZL",
    "Switzerland": "CHE",
    "Sweden": "SWE",
    "Denmark": "DNK",
    "Norway": "NOR",
    "Finland": "FIN",
    "Spain": "ESP",
    "Italy": "ITA",
    "South Korea": "KOR",
    "Rep. of Korea": "KOR",
    "Korea": "KOR",
    "Malaysia": "MYS",
    "Thailand": "THA",
    "India": "IND",
    "China": "CHN",
    "Brazil": "BRA",
    "Mexico": "MEX",
    "Costa Rica": "CRI",
};

interface WorldMapExplorerProps {
    selectedCountry: string | null;
    onCountrySelect: (countryCode: string | null) => void;
    hoveredCountry: string | null;
    onCountryHover: (countryCode: string | null) => void;
}

const WorldMapExplorer: React.FC<WorldMapExplorerProps> = memo(({
    selectedCountry,
    onCountrySelect,
    hoveredCountry,
    onCountryHover,
}) => {
    // Start with a better zoom level to fill the container
    const [position, setPosition] = useState({ coordinates: [20, 30] as [number, number], zoom: 1.4 });

    const handleZoomIn = useCallback(() => {
        if (position.zoom >= 4) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    }, [position.zoom]);

    const handleZoomOut = useCallback(() => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    }, [position.zoom]);

    const handleReset = useCallback(() => {
        setPosition({ coordinates: [0, 20], zoom: 1 });
        onCountrySelect(null);
    }, [onCountrySelect]);

    const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
    }, []);

    const getCountryCode = useCallback((geo: any): string | null => {
        const name = geo.properties.name;
        return countryNameToCode[name] || null;
    }, []);

    const isCountrySupported = useCallback((code: string | null): boolean => {
        return code !== null && code in countryData;
    }, []);

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomIn}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                    <ZoomIn className="w-5 h-5" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomOut}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                    <ZoomOut className="w-5 h-5" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReset}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-white/70">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-white/70">Selected</span>
                    </div>
                </div>
            </div>

            {/* Selected Country Tooltip */}
            <AnimatePresence>
                {(hoveredCountry || selectedCountry) && countryData[hoveredCountry || selectedCountry || ""] && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px]"
                    >
                        {(() => {
                            const country = countryData[hoveredCountry || selectedCountry || ""];
                            return (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{country.flag}</span>
                                        <div>
                                            <h3 className="font-bold text-white">{country.name}</h3>
                                            <p className="text-xs text-white/60">{country.region}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/70 space-y-1">
                                        <p>⏱️ Avg. Processing: {country.avgProcessingDays} days</p>
                                        <p>💰 Avg. Cost: ${country.avgCostUSD.toLocaleString()}</p>
                                    </div>
                                    {hoveredCountry && !selectedCountry && (
                                        <p className="text-xs text-blue-400 mt-2">Click to select</p>
                                    )}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Map */}
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 120,
                    center: [0, 30],
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    maxZoom={4}
                    minZoom={1}
                >
                    {/* Ocean background */}
                    <rect x={-400} y={-300} width={1200} height={800} fill="#0f172a" />
                    
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryCode = getCountryCode(geo);
                                const isSupported = isCountrySupported(countryCode);
                                const isSelected = selectedCountry === countryCode;
                                const isHovered = hoveredCountry === countryCode;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => {
                                            if (isSupported) {
                                                onCountryHover(countryCode);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            onCountryHover(null);
                                        }}
                                        onClick={() => {
                                            if (isSupported) {
                                                onCountrySelect(isSelected ? null : countryCode);
                                            }
                                        }}
                                        style={{
                                            default: {
                                                fill: isSelected
                                                    ? "#8b5cf6"
                                                    : isSupported
                                                    ? "#10b981"
                                                    : "#334155",
                                                stroke: "#1e293b",
                                                strokeWidth: 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default",
                                                transition: "all 0.3s ease",
                                            },
                                            hover: {
                                                fill: isSelected
                                                    ? "#a78bfa"
                                                    : isSupported
                                                    ? "#34d399"
                                                    : "#475569",
                                                stroke: "#3b82f6",
                                                strokeWidth: isSupported ? 1.5 : 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default",
                                            },
                                            pressed: {
                                                fill: "#7c3aed",
                                                stroke: "#3b82f6",
                                                strokeWidth: 1.5,
                                                outline: "none",
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* Markers for popular countries */}
                    {Object.entries(countryData)
                        .filter(([_, data]) => data.popular)
                        .map(([code, data]) => (
                            <Marker
                                key={code}
                                coordinates={data.coordinates}
                                onClick={() => onCountrySelect(selectedCountry === code ? null : code)}
                            >
                                <motion.g
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <motion.circle
                                        r={selectedCountry === code ? 8 : 6}
                                        fill={selectedCountry === code ? "#8b5cf6" : "#3b82f6"}
                                        stroke="#fff"
                                        strokeWidth={2}
                                        animate={{
                                            scale: selectedCountry === code ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{
                                            repeat: selectedCountry === code ? Infinity : 0,
                                            duration: 2,
                                        }}
                                    />
                                    {selectedCountry === code && (
                                        <motion.circle
                                            r={16}
                                            fill="transparent"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            initial={{ r: 8, opacity: 1 }}
                                            animate={{ r: 20, opacity: 0 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.5,
                                            }}
                                        />
                                    )}
                                </motion.g>
                            </Marker>
                        ))}
                </ZoomableGroup>
            </ComposableMap>

            {/* Instructions Overlay */}
            {!selectedCountry && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10"
                >
                    <p className="text-sm text-white/70 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        Click on a highlighted country to explore
                    </p>
                </motion.div>
            )}
        </div>
    );
});

WorldMapExplorer.displayName = "WorldMapExplorer";

export default WorldMapExplorer;
