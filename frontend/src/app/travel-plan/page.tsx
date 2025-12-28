"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Calendar,
    Clock,
    Star,
    Sparkles,
    Camera,
    Coffee,
    UtensilsCrossed,
    Landmark,
    TreePine,
    Mountain,
    Waves,
    Building,
    ShoppingBag,
    Heart,
    Plane,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    Info,
    Globe2,
    Sun,
    Wind,
    Compass,
    Loader2,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
// Import US day images
// Day 1
import USDay1Activity1 from "../../../Images/US/Day1/Statue of Liberty & Ellis Island.png";
import USDay1Activity2 from "../../../Images/US/Day1/Times Square & Broadway.png";
import USDay1Activity3 from "../../../Images/US/Day1/Dinner at Little Italy.png";

// Day 2
import USDay2Activity1 from "../../../Images/US/Day2/Central Park Exploration.png";
import USDay2Activity2 from "../../../Images/US/Day2/Metropolitan Museum of Art.png";
import USDay2Activity3 from "../../../Images/US/Day2/Brooklyn Bridge Walk.png";

// Day 3
import USDay3Activity1 from "../../../Images/US/Day3/Golden Gate Bridge.png";
import USDay3Activity2 from "../../../Images/US/Day3/Fishermans Wharf.png";
import USDay3Activity3 from "../../../Images/US/Day3/Alcatraz Island Tour.png";

// Day 4
import USDay4Activity1 from "../../../Images/US/Day4/Apple Park Visitor Center.png";
import USDay4Activity2 from "../../../Images/US/Day4/Computer History Museum.png";
import USDay4Activity3 from "../../../Images/US/Day4/Stanford University Campus.png";

// Day 5
import USDay5Activity1 from "../../../Images/US/Day5/Hollywood Walk of Fame.png";
import USDay5Activity2 from "../../../Images/US/Day5/Griffith Observatory.png";
import USDay5Activity3 from "../../../Images/US/Day5/Santa Monica Pier.png";

// Day 6
import USDay6Activity1 from "../../../Images/US/Day6/Grand Canyon South Rim.png";
import USDay6Activity2 from "../../../Images/US/Day6/Bright Angel Trail Hike.png";
import USDay6Activity3 from "../../../Images/US/Day6/Sunset at Mather Point.png";

// Day 7
import USDay7Activity1 from "../../../Images/US/Day7/Las Vegas Strip Walk.png";
import USDay7Activity2 from "../../../Images/US/Day7/Fremont Street Experience.png";
import USDay7Activity3 from "../../../Images/US/Day7/Cirque du Soleil Show.png";

const getCarouselImage = (countryCode: string, dayNumber: number, actIndex: number) => {
    // Only US images available for now
    if (countryCode !== "USA") return null;
    
    const imageMap: Record<string, any> = {
        // Day 1
        "1-0": USDay1Activity1,
        "1-1": USDay1Activity2,
        "1-2": USDay1Activity3,
        // Day 2
        "2-0": USDay2Activity1,
        "2-1": USDay2Activity2,
        "2-2": USDay2Activity3,
        // Day 3
        "3-0": USDay3Activity1,
        "3-1": USDay3Activity2,
        "3-2": USDay3Activity3,
        // Day 4
        "4-0": USDay4Activity1,
        "4-1": USDay4Activity2,
        "4-2": USDay4Activity3,
        // Day 5
        "5-0": USDay5Activity1,
        "5-1": USDay5Activity2,
        "5-2": USDay5Activity3,
        // Day 6
        "6-0": USDay6Activity1,
        "6-1": USDay6Activity2,
        "6-2": USDay6Activity3,
        // Day 7
        "7-0": USDay7Activity1,
        "7-1": USDay7Activity2,
        "7-2": USDay7Activity3,
    };
    
    return imageMap[`${dayNumber}-${actIndex}`] || null;
};

// Dynamically import ThreeGlobe to avoid SSR issues
const ThreeGlobeComponent = dynamic(() => import("@/components/ThreeGlobe"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        </div>
    ),
});

// Country data with 7-day itineraries
const countryItineraries: Record<string, {
    name: string;
    flag: string;
    description: string;
    bestTime: string;
    currency: string;
    language: string;
    days: {
        day: number;
        title: string;
        theme: string;
        icon: any;
        color: string;
        activities: {
            time: string;
            activity: string;
            location: string;
            description: string;
            tips: string;
            icon: any;
        }[];
    }[];
}> = {
    USA: {
        name: "United States",
        flag: "🇺🇸",
        description: "Experience the diverse landscapes and vibrant cities of America",
        bestTime: "April to October",
        currency: "USD ($)",
        language: "English",
        days: [
            {
                day: 1,
                title: "New York City - The Big Apple",
                theme: "Urban Exploration",
                icon: Building,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Statue of Liberty & Ellis Island",
                        location: "Liberty Island, NY",
                        description: "Start with America's most iconic symbol of freedom",
                        tips: "Book ferry tickets online in advance",
                        icon: Landmark,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Times Square & Broadway",
                        location: "Midtown Manhattan",
                        description: "Experience the electric atmosphere of NYC",
                        tips: "Visit at sunset for amazing photos",
                        icon: Camera,
                    },
                    {
                        time: "7:00 PM",
                        activity: "Dinner at Little Italy",
                        location: "Mulberry Street",
                        description: "Authentic Italian cuisine in historic neighborhood",
                        tips: "Try the classic carbonara",
                        icon: UtensilsCrossed,
                    },
                ],
            },
            {
                day: 2,
                title: "Central Park & Museums",
                theme: "Culture & Nature",
                icon: TreePine,
                color: "from-emerald-500 to-green-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Central Park Exploration",
                        location: "Central Park",
                        description: "Morning walk through NYC's green oasis",
                        tips: "Rent a bike to cover more ground",
                        icon: TreePine,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Metropolitan Museum of Art",
                        location: "The Met, 5th Avenue",
                        description: "World-class art collection",
                        tips: "Pay-what-you-wish admission",
                        icon: Landmark,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Brooklyn Bridge Walk",
                        location: "Manhattan to Brooklyn",
                        description: "Sunset walk with stunning city views",
                        tips: "Start from Manhattan side",
                        icon: Camera,
                    },
                ],
            },
            {
                day: 3,
                title: "San Francisco Bay Area",
                theme: "Coastal Beauty",
                icon: Waves,
                color: "from-orange-500 to-red-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Golden Gate Bridge",
                        location: "San Francisco",
                        description: "Walk or bike across the iconic bridge",
                        tips: "Go early to avoid crowds",
                        icon: Landmark,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Fisherman's Wharf",
                        location: "Pier 39",
                        description: "See sea lions and enjoy fresh seafood",
                        tips: "Try the clam chowder in sourdough bowl",
                        icon: UtensilsCrossed,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Alcatraz Island Tour",
                        location: "Alcatraz Island",
                        description: "Historic prison tour",
                        tips: "Book weeks in advance",
                        icon: Building,
                    },
                ],
            },
            {
                day: 4,
                title: "Silicon Valley Tech Tour",
                theme: "Innovation Hub",
                icon: Building,
                color: "from-purple-500 to-pink-500",
                activities: [
                    {
                        time: "10:00 AM",
                        activity: "Apple Park Visitor Center",
                        location: "Cupertino",
                        description: "See Apple's futuristic headquarters",
                        tips: "Check out the AR experience",
                        icon: Building,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Computer History Museum",
                        location: "Mountain View",
                        description: "Journey through computing history",
                        tips: "Don't miss the self-driving car exhibit",
                        icon: Landmark,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Stanford University Campus",
                        location: "Palo Alto",
                        description: "Tour the prestigious university",
                        tips: "Visit the Hoover Tower for views",
                        icon: TreePine,
                    },
                ],
            },
            {
                day: 5,
                title: "Los Angeles - City of Angels",
                theme: "Entertainment Capital",
                icon: Star,
                color: "from-yellow-500 to-amber-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Hollywood Walk of Fame",
                        location: "Hollywood Blvd",
                        description: "See celebrity stars on the sidewalk",
                        tips: "Visit Chinese Theatre nearby",
                        icon: Star,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Griffith Observatory",
                        location: "Griffith Park",
                        description: "Panoramic LA views and planetarium",
                        tips: "Free admission to observatory",
                        icon: Camera,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Santa Monica Pier",
                        location: "Santa Monica",
                        description: "Beach, amusement park, and sunset",
                        tips: "Try the Pacific Park rides",
                        icon: Waves,
                    },
                ],
            },
            {
                day: 6,
                title: "Grand Canyon Adventure",
                theme: "Natural Wonder",
                icon: Mountain,
                color: "from-red-500 to-orange-500",
                activities: [
                    {
                        time: "7:00 AM",
                        activity: "Grand Canyon South Rim",
                        location: "Arizona",
                        description: "One of world's greatest natural wonders",
                        tips: "Arrive at sunrise for best light",
                        icon: Mountain,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Bright Angel Trail Hike",
                        location: "Grand Canyon",
                        description: "Scenic hiking trail into canyon",
                        tips: "Bring plenty of water",
                        icon: TreePine,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Sunset at Mather Point",
                        location: "Grand Canyon",
                        description: "Watch sunset paint the canyon walls",
                        tips: "Most popular viewpoint - arrive early",
                        icon: Camera,
                    },
                ],
            },
            {
                day: 7,
                title: "Las Vegas - Entertainment Hub",
                theme: "Nightlife & Shows",
                icon: Sparkles,
                color: "from-pink-500 to-purple-500",
                activities: [
                    {
                        time: "10:00 AM",
                        activity: "Las Vegas Strip Walk",
                        location: "The Strip",
                        description: "Explore themed casino resorts",
                        tips: "Visit Bellagio Fountains",
                        icon: Building,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Fremont Street Experience",
                        location: "Downtown Vegas",
                        description: "Historic old Vegas with LED canopy",
                        tips: "Better than the Strip for some",
                        icon: Star,
                    },
                    {
                        time: "8:00 PM",
                        activity: "Cirque du Soleil Show",
                        location: "Various venues",
                        description: "World-class acrobatic performance",
                        tips: "Book tickets in advance",
                        icon: Sparkles,
                    },
                ],
            },
        ],
    },
    CAN: {
        name: "Canada",
        flag: "🇨🇦",
        description: "Discover pristine wilderness and multicultural cities",
        bestTime: "June to September",
        currency: "CAD ($)",
        language: "English, French",
        days: [
            {
                day: 1,
                title: "Toronto - Urban Diversity",
                theme: "City Exploration",
                icon: Building,
                color: "from-red-500 to-rose-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "CN Tower",
                        location: "Downtown Toronto",
                        description: "Iconic landmark with 360° views",
                        tips: "EdgeWalk for thrill-seekers",
                        icon: Landmark,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Royal Ontario Museum",
                        location: "Bloor Street",
                        description: "World culture and natural history",
                        tips: "Free admission on Tuesdays",
                        icon: Building,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Distillery District",
                        location: "Historic Area",
                        description: "Victorian-era buildings with galleries",
                        tips: "Great for dinner and drinks",
                        icon: Coffee,
                    },
                ],
            },
            {
                day: 2,
                title: "Niagara Falls Wonder",
                theme: "Natural Marvel",
                icon: Waves,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Maid of the Mist Boat Tour",
                        location: "Niagara Falls",
                        description: "Get up close to the falls",
                        tips: "Ponchos provided but you'll get wet",
                        icon: Waves,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Journey Behind the Falls",
                        location: "Niagara Parks",
                        description: "View falls from behind the cascade",
                        tips: "Unique perspective of the falls",
                        icon: Camera,
                    },
                    {
                        time: "7:00 PM",
                        activity: "Falls Illumination",
                        location: "Viewing area",
                        description: "See falls lit up in colors at night",
                        tips: "Best viewing from Canadian side",
                        icon: Star,
                    },
                ],
            },
            {
                day: 3,
                title: "Montreal - French Charm",
                theme: "European Flair",
                icon: Coffee,
                color: "from-purple-500 to-pink-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Old Montreal",
                        location: "Vieux-Montréal",
                        description: "Cobblestone streets and architecture",
                        tips: "Very walkable historic district",
                        icon: Building,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Notre-Dame Basilica",
                        location: "Place d'Armes",
                        description: "Stunning Gothic Revival church",
                        tips: "Light show in evening is spectacular",
                        icon: Landmark,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Mount Royal Park",
                        location: "Parc du Mont-Royal",
                        description: "Panoramic city views",
                        tips: "Sunset is the best time",
                        icon: TreePine,
                    },
                ],
            },
            {
                day: 4,
                title: "Banff National Park",
                theme: "Mountain Paradise",
                icon: Mountain,
                color: "from-emerald-500 to-teal-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Lake Louise",
                        location: "Banff National Park",
                        description: "Turquoise glacial lake surrounded by peaks",
                        tips: "Arrive early to avoid crowds",
                        icon: Waves,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Moraine Lake",
                        location: "Valley of the Ten Peaks",
                        description: "Iconic Canadian Rockies view",
                        tips: "On the old $20 bill",
                        icon: Mountain,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Banff Town Exploration",
                        location: "Banff",
                        description: "Charming mountain town shopping",
                        tips: "Try local elk or bison",
                        icon: ShoppingBag,
                    },
                ],
            },
            {
                day: 5,
                title: "Jasper & Icefields",
                theme: "Glacial Adventure",
                icon: Mountain,
                color: "from-blue-400 to-cyan-400",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Columbia Icefield",
                        location: "Icefields Parkway",
                        description: "Walk on ancient glacier",
                        tips: "Dress warmly even in summer",
                        icon: Mountain,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Athabasca Falls",
                        location: "Near Jasper",
                        description: "Powerful waterfall with hiking trails",
                        tips: "Short walk from parking",
                        icon: Waves,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Jasper SkyTram",
                        location: "Jasper",
                        description: "Aerial tramway to mountain summit",
                        tips: "Sunset ride is magical",
                        icon: Camera,
                    },
                ],
            },
            {
                day: 6,
                title: "Vancouver - Pacific Gateway",
                theme: "Coastal City",
                icon: Waves,
                color: "from-green-500 to-blue-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Stanley Park Seawall",
                        location: "Stanley Park",
                        description: "Scenic waterfront path",
                        tips: "Rent a bike for full loop",
                        icon: TreePine,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Granville Island Market",
                        location: "Granville Island",
                        description: "Public market with local food",
                        tips: "Try the fresh seafood",
                        icon: UtensilsCrossed,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Capilano Suspension Bridge",
                        location: "North Vancouver",
                        description: "Walk among towering trees",
                        tips: "Open until late in summer",
                        icon: TreePine,
                    },
                ],
            },
            {
                day: 7,
                title: "Victoria & Whistler",
                theme: "Island & Mountain",
                icon: Mountain,
                color: "from-purple-500 to-indigo-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Butchart Gardens",
                        location: "Victoria, BC",
                        description: "World-famous floral gardens",
                        tips: "Best in spring and summer",
                        icon: TreePine,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Inner Harbour",
                        location: "Victoria",
                        description: "Historic waterfront area",
                        tips: "Parliament buildings are stunning",
                        icon: Building,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Whistler Village",
                        location: "Whistler",
                        description: "Alpine resort town",
                        tips: "Peak 2 Peak Gondola for views",
                        icon: Mountain,
                    },
                ],
            },
        ],
    },
    GBR: {
        name: "United Kingdom",
        flag: "🇬🇧",
        description: "Rich history, royal heritage, and cultural treasures",
        bestTime: "May to September",
        currency: "GBP (£)",
        language: "English",
        days: [
            {
                day: 1,
                title: "London - Royal Capital",
                theme: "Historic Landmarks",
                icon: Landmark,
                color: "from-red-500 to-blue-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Tower of London",
                        location: "Tower Hill",
                        description: "Crown Jewels and historic fortress",
                        tips: "First visitors see Crown Jewels with no queue",
                        icon: Landmark,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Thames River Cruise",
                        location: "River Thames",
                        description: "See London from the water",
                        tips: "Westminster to Greenwich route",
                        icon: Waves,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Buckingham Palace",
                        location: "Westminster",
                        description: "Changing of the Guard ceremony",
                        tips: "Ceremony at 11am daily in summer",
                        icon: Landmark,
                    },
                    {
                        time: "6:00 PM",
                        activity: "West End Theatre Show",
                        location: "Theatreland",
                        description: "World-class musical or play",
                        tips: "Book in advance for best seats",
                        icon: Star,
                    },
                ],
            },
            {
                day: 2,
                title: "London Museums & Parks",
                theme: "Culture & Leisure",
                icon: Building,
                color: "from-emerald-500 to-green-500",
                activities: [
                    {
                        time: "10:00 AM",
                        activity: "British Museum",
                        location: "Bloomsbury",
                        description: "World history and culture",
                        tips: "Free admission, donations welcome",
                        icon: Landmark,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Hyde Park & Kensington Gardens",
                        location: "Central London",
                        description: "Royal parks and Serpentine lake",
                        tips: "Visit Diana Memorial Fountain",
                        icon: TreePine,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Covent Garden",
                        location: "West End",
                        description: "Shopping and street performers",
                        tips: "Great restaurants in the area",
                        icon: ShoppingBag,
                    },
                ],
            },
            {
                day: 3,
                title: "Oxford - Academic Excellence",
                theme: "University Town",
                icon: Building,
                color: "from-blue-500 to-indigo-500",
                activities: [
                    {
                        time: "10:00 AM",
                        activity: "Christ Church College",
                        location: "Oxford",
                        description: "Harry Potter filming location",
                        tips: "The Great Hall inspired Hogwarts",
                        icon: Landmark,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Bodleian Library",
                        location: "Oxford University",
                        description: "Historic university library",
                        tips: "Tours need advance booking",
                        icon: Building,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Punting on River Cherwell",
                        location: "Oxford",
                        description: "Traditional boat experience",
                        tips: "Relaxing way to see the city",
                        icon: Waves,
                    },
                ],
            },
            {
                day: 4,
                title: "Bath & Stonehenge",
                theme: "Ancient Wonders",
                icon: Landmark,
                color: "from-amber-500 to-yellow-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Roman Baths",
                        location: "Bath",
                        description: "Ancient Roman bathing complex",
                        tips: "Best preserved in Northern Europe",
                        icon: Landmark,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Bath Abbey & City Walk",
                        location: "Bath City Centre",
                        description: "Georgian architecture",
                        tips: "Royal Crescent is must-see",
                        icon: Building,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Stonehenge",
                        location: "Wiltshire",
                        description: "Prehistoric monument",
                        tips: "Book timed entry online",
                        icon: Mountain,
                    },
                ],
            },
            {
                day: 5,
                title: "Edinburgh - Scottish Capital",
                theme: "Highland Heritage",
                icon: Building,
                color: "from-purple-500 to-pink-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Edinburgh Castle",
                        location: "Castle Rock",
                        description: "Historic fortress with crown jewels",
                        tips: "Pre-book to skip queues",
                        icon: Landmark,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Royal Mile Walk",
                        location: "Old Town",
                        description: "Historic street with shops",
                        tips: "Try traditional haggis",
                        icon: ShoppingBag,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Arthur's Seat Hike",
                        location: "Holyrood Park",
                        description: "Extinct volcano with panoramic views",
                        tips: "Moderate 2-hour hike",
                        icon: Mountain,
                    },
                ],
            },
            {
                day: 6,
                title: "Scottish Highlands",
                theme: "Natural Beauty",
                icon: Mountain,
                color: "from-green-500 to-teal-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Loch Ness",
                        location: "Scottish Highlands",
                        description: "Famous lake with monster legend",
                        tips: "Visit Urquhart Castle ruins",
                        icon: Waves,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Glen Coe Valley",
                        location: "Highlands",
                        description: "Dramatic mountain scenery",
                        tips: "One of UK's most scenic drives",
                        icon: Mountain,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Highland Village",
                        location: "Fort William area",
                        description: "Traditional Scottish village",
                        tips: "Try local whisky",
                        icon: Coffee,
                    },
                ],
            },
            {
                day: 7,
                title: "Lake District",
                theme: "Poetic Landscapes",
                icon: TreePine,
                color: "from-cyan-500 to-blue-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Lake Windermere Cruise",
                        location: "Lake District",
                        description: "England's largest lake",
                        tips: "Beatrix Potter's inspiration",
                        icon: Waves,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Grasmere Village",
                        location: "Lake District",
                        description: "Wordsworth's home village",
                        tips: "Try famous gingerbread",
                        icon: Coffee,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Catbells Mountain Hike",
                        location: "Near Keswick",
                        description: "Family-friendly peak with views",
                        tips: "Stunning 360° panoramas",
                        icon: Mountain,
                    },
                ],
            },
        ],
    },
    DEU: {
        name: "Germany",
        flag: "🇩🇪",
        description: "Engineering excellence, historic cities, and Bavarian charm",
        bestTime: "May to October",
        currency: "EUR (€)",
        language: "German",
        days: [
            {
                day: 1,
                title: "Berlin - Historic Capital",
                theme: "Modern History",
                icon: Building,
                color: "from-red-500 to-yellow-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Brandenburg Gate",
                        location: "Pariser Platz",
                        description: "Iconic symbol of German unity",
                        tips: "Visit early for photos without crowds",
                        icon: Landmark,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Berlin Wall Memorial",
                        location: "Bernauer Strasse",
                        description: "Cold War history preserved",
                        tips: "East Side Gallery has best murals",
                        icon: Building,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Reichstag Building",
                        location: "Platz der Republik",
                        description: "German Parliament with glass dome",
                        tips: "Register online in advance",
                        icon: Landmark,
                    },
                ],
            },
            {
                day: 2,
                title: "Berlin Museums & Culture",
                theme: "Art & History",
                icon: Building,
                color: "from-purple-500 to-pink-500",
                activities: [
                    {
                        time: "10:00 AM",
                        activity: "Museum Island",
                        location: "Spree Island",
                        description: "Five world-class museums",
                        tips: "Buy combination ticket",
                        icon: Landmark,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Checkpoint Charlie",
                        location: "Friedrichstraße",
                        description: "Famous Cold War crossing point",
                        tips: "Museum tells border stories",
                        icon: Building,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Kreuzberg District",
                        location: "Kreuzberg",
                        description: "Trendy neighborhood with street art",
                        tips: "Great nightlife and food",
                        icon: Coffee,
                    },
                ],
            },
            {
                day: 3,
                title: "Munich - Bavarian Heart",
                theme: "Traditional Bavaria",
                icon: Coffee,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Marienplatz & New Town Hall",
                        location: "City Center",
                        description: "Central square with glockenspiel",
                        tips: "Show at 11am and noon",
                        icon: Landmark,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Hofbräuhaus",
                        location: "Platzl 9",
                        description: "Famous beer hall since 1589",
                        tips: "Try traditional Bavarian lunch",
                        icon: UtensilsCrossed,
                    },
                    {
                        time: "3:00 PM",
                        activity: "English Garden",
                        location: "Schwabing",
                        description: "Huge urban park with beer gardens",
                        tips: "Watch river surfers at Eisbach",
                        icon: TreePine,
                    },
                ],
            },
            {
                day: 4,
                title: "Neuschwanstein Castle",
                theme: "Fairy Tale Castle",
                icon: Landmark,
                color: "from-emerald-500 to-teal-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Neuschwanstein Castle Tour",
                        location: "Füssen, Bavaria",
                        description: "Disney castle inspiration",
                        tips: "Book tickets weeks in advance",
                        icon: Landmark,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Marienbrücke Viewpoint",
                        location: "Near castle",
                        description: "Best castle photo spot",
                        tips: "Can get crowded at midday",
                        icon: Camera,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Hohenschwangau Castle",
                        location: "Füssen",
                        description: "King Ludwig's childhood home",
                        tips: "Often overlooked but beautiful",
                        icon: Building,
                    },
                ],
            },
            {
                day: 5,
                title: "Black Forest Region",
                theme: "Natural Wilderness",
                icon: TreePine,
                color: "from-green-500 to-emerald-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Triberg Waterfalls",
                        location: "Black Forest",
                        description: "Germany's highest waterfalls",
                        tips: "Scenic hiking trails",
                        icon: Waves,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Cuckoo Clock Shops",
                        location: "Triberg",
                        description: "Traditional Black Forest craft",
                        tips: "World's largest cuckoo clock nearby",
                        icon: ShoppingBag,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Black Forest Cake Tasting",
                        location: "Local café",
                        description: "Original Schwarzwälder Kirschtorte",
                        tips: "The real deal is incredible",
                        icon: Coffee,
                    },
                ],
            },
            {
                day: 6,
                title: "Heidelberg - Romantic Town",
                theme: "Old World Charm",
                icon: Building,
                color: "from-amber-500 to-orange-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Heidelberg Castle",
                        location: "Castle Hill",
                        description: "Renaissance castle ruins",
                        tips: "Take funicular up the hill",
                        icon: Landmark,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Old Bridge Walk",
                        location: "Alte Brücke",
                        description: "Photo-perfect stone bridge",
                        tips: "Touch brass monkey statue for luck",
                        icon: Camera,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Philosopher's Walk",
                        location: "North bank of Neckar",
                        description: "Scenic path with city views",
                        tips: "Named after university professors",
                        icon: TreePine,
                    },
                ],
            },
            {
                day: 7,
                title: "Rhine Valley",
                theme: "River Castles",
                icon: Waves,
                color: "from-blue-500 to-purple-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Rhine River Cruise",
                        location: "Middle Rhine Valley",
                        description: "UNESCO World Heritage site",
                        tips: "Most scenic section: Rüdesheim to Koblenz",
                        icon: Waves,
                    },
                    {
                        time: "1:00 PM",
                        activity: "Lorelei Rock",
                        location: "St. Goarshausen",
                        description: "Legendary cliff with siren tale",
                        tips: "Climb for panoramic views",
                        icon: Mountain,
                    },
                    {
                        time: "4:00 PM",
                        activity: "Wine Tasting in Rüdesheim",
                        location: "Rheingau Wine Region",
                        description: "Sample famous Riesling wines",
                        tips: "Drosselgasse is charming street",
                        icon: Coffee,
                    },
                ],
            },
        ],
    },
    AUS: {
        name: "Australia",
        flag: "🇦🇺",
        description: "Stunning beaches, unique wildlife, and vibrant cities",
        bestTime: "September to November, March to May",
        currency: "AUD ($)",
        language: "English",
        days: [
            {
                day: 1,
                title: "Sydney - Harbour City",
                theme: "Iconic Landmarks",
                icon: Building,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Sydney Opera House",
                        location: "Bennelong Point",
                        description: "World-famous architectural marvel",
                        tips: "Book guided tour in advance",
                        icon: Landmark,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Sydney Harbour Bridge",
                        location: "Sydney Harbour",
                        description: "Climb or walk the iconic bridge",
                        tips: "BridgeClimb for adventurers",
                        icon: Building,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Bondi Beach",
                        location: "Eastern Suburbs",
                        description: "Australia's most famous beach",
                        tips: "Coastal walk to Coogee is stunning",
                        icon: Waves,
                    },
                    {
                        time: "6:00 PM",
                        activity: "The Rocks Historic Area",
                        location: "Circular Quay",
                        description: "Sydney's birthplace with pubs",
                        tips: "Weekend markets on Saturdays",
                        icon: ShoppingBag,
                    },
                ],
            },
            {
                day: 2,
                title: "Blue Mountains",
                theme: "Natural Escape",
                icon: Mountain,
                color: "from-green-500 to-teal-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Three Sisters Rock Formation",
                        location: "Echo Point, Katoomba",
                        description: "Iconic sandstone peaks",
                        tips: "Best light for photos in morning",
                        icon: Mountain,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Scenic World",
                        location: "Katoomba",
                        description: "Cableway, skyway, and railway",
                        tips: "Steepest railway in the world",
                        icon: TreePine,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Wentworth Falls",
                        location: "Blue Mountains",
                        description: "Spectacular waterfall hike",
                        tips: "Multiple viewing platforms",
                        icon: Waves,
                    },
                ],
            },
            {
                day: 3,
                title: "Melbourne - Cultural Capital",
                theme: "Arts & Coffee",
                icon: Coffee,
                color: "from-purple-500 to-pink-500",
                activities: [
                    {
                        time: "9:00 AM",
                        activity: "Federation Square",
                        location: "CBD",
                        description: "Cultural precinct and meeting place",
                        tips: "Free walking tours available",
                        icon: Building,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Laneways & Street Art",
                        location: "City laneways",
                        description: "Graffiti art and hidden cafés",
                        tips: "Hosier Lane is most famous",
                        icon: Camera,
                    },
                    {
                        time: "2:00 PM",
                        activity: "Queen Victoria Market",
                        location: "North Melbourne",
                        description: "Historic market since 1878",
                        tips: "Wednesday night market in summer",
                        icon: ShoppingBag,
                    },
                ],
            },
            {
                day: 4,
                title: "Great Ocean Road",
                theme: "Coastal Beauty",
                icon: Waves,
                color: "from-orange-500 to-red-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Twelve Apostles",
                        location: "Port Campbell",
                        description: "Limestone stacks in ocean",
                        tips: "Sunrise is magical",
                        icon: Mountain,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Loch Ard Gorge",
                        location: "Port Campbell",
                        description: "Dramatic shipwreck site",
                        tips: "Steps down to beach",
                        icon: Waves,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Bells Beach",
                        location: "Torquay",
                        description: "World-famous surf break",
                        tips: "Easter surf competition",
                        icon: Waves,
                    },
                ],
            },
            {
                day: 5,
                title: "Cairns & Great Barrier Reef",
                theme: "Underwater World",
                icon: Waves,
                color: "from-cyan-500 to-blue-500",
                activities: [
                    {
                        time: "7:00 AM",
                        activity: "Great Barrier Reef Snorkeling",
                        location: "Outer Reef",
                        description: "World's largest coral reef system",
                        tips: "Full day tour recommended",
                        icon: Waves,
                    },
                    {
                        time: "12:00 PM",
                        activity: "Reef Pontoon Experience",
                        location: "Moore Reef",
                        description: "Glass bottom boat and diving",
                        tips: "Underwater observatory available",
                        icon: Camera,
                    },
                    {
                        time: "6:00 PM",
                        activity: "Cairns Esplanade",
                        location: "Cairns",
                        description: "Lagoon pool and night markets",
                        tips: "Night markets Thu-Sun",
                        icon: ShoppingBag,
                    },
                ],
            },
            {
                day: 6,
                title: "Daintree Rainforest",
                theme: "Ancient Wilderness",
                icon: TreePine,
                color: "from-green-500 to-emerald-500",
                activities: [
                    {
                        time: "8:00 AM",
                        activity: "Daintree Rainforest Walk",
                        location: "Daintree National Park",
                        description: "World's oldest rainforest",
                        tips: "Look for cassowaries",
                        icon: TreePine,
                    },
                    {
                        time: "11:00 AM",
                        activity: "Mossman Gorge",
                        location: "Near Port Douglas",
                        description: "Swimming in crystal clear river",
                        tips: "Indigenous Dreamtime walk",
                        icon: Waves,
                    },
                    {
                        time: "3:00 PM",
                        activity: "Cape Tribulation Beach",
                        location: "Daintree Coast",
                        description: "Where rainforest meets reef",
                        tips: "Swim carefully - crocodile territory",
                        icon: Waves,
                    },
                ],
            },
            {
                day: 7,
                title: "Uluru - Red Centre",
                theme: "Sacred Land",
                icon: Mountain,
                color: "from-red-500 to-orange-500",
                activities: [
                    {
                        time: "5:00 AM",
                        activity: "Uluru Sunrise",
                        location: "Uluru-Kata Tjuta National Park",
                        description: "Watch the rock change colors",
                        tips: "Most magical time to visit",
                        icon: Mountain,
                    },
                    {
                        time: "9:00 AM",
                        activity: "Uluru Base Walk",
                        location: "Around Uluru",
                        description: "10km walk around the monolith",
                        tips: "Bring plenty of water",
                        icon: TreePine,
                    },
                    {
                        time: "5:00 PM",
                        activity: "Field of Light Installation",
                        location: "Near Uluru",
                        description: "50,000 solar lights at sunset",
                        tips: "Book Sounds of Silence dinner",
                        icon: Star,
                    },
                ],
            },
        ],
    },
    JP: {
        name: "Japan",
        flag: "🇯🇵",
        description: "Ancient traditions meet cutting-edge technology",
        bestTime: "March to May",
        currency: "JPY (¥)",
        language: "Japanese",
        days: [
            {
                day: 1,
                title: "Tokyo - Shibuya & Shinjuku",
                theme: "Urban Energy",
                icon: Building,
                color: "from-red-500 to-pink-500",
                activities: [
                    { time: "9:00 AM", activity: "Meiji Shrine", location: "Shibuya", description: "Serene Shinto shrine in forest", tips: "Arrive early for peace", icon: Landmark },
                    { time: "1:00 PM", activity: "Shibuya Crossing", location: "Shibuya", description: "World's busiest intersection", tips: "View from Starbucks above", icon: Camera },
                    { time: "7:00 PM", activity: "Golden Gai", location: "Shinjuku", description: "Tiny bars in narrow alleys", tips: "Cash only", icon: UtensilsCrossed },
                ],
            },
            {
                day: 2,
                title: "Tokyo - Asakusa & Akihabara",
                theme: "Old Meets New",
                icon: Landmark,
                color: "from-orange-500 to-yellow-500",
                activities: [
                    { time: "8:00 AM", activity: "Senso-ji Temple", location: "Asakusa", description: "Tokyo's oldest temple", tips: "Walk Nakamise shopping street", icon: Landmark },
                    { time: "12:00 PM", activity: "Tokyo Skytree", location: "Sumida", description: "634m tall broadcasting tower", tips: "Book tickets online", icon: Building },
                    { time: "4:00 PM", activity: "Akihabara Electric Town", location: "Akihabara", description: "Anime and electronics paradise", tips: "Visit maid cafés", icon: ShoppingBag },
                ],
            },
            {
                day: 3,
                title: "Kyoto - Temples & Gardens",
                theme: "Ancient Capital",
                icon: TreePine,
                color: "from-green-500 to-emerald-500",
                activities: [
                    { time: "7:00 AM", activity: "Fushimi Inari Shrine", location: "Fushimi", description: "Thousands of orange torii gates", tips: "Go at sunrise", icon: Landmark },
                    { time: "12:00 PM", activity: "Kinkaku-ji", location: "Kyoto", description: "Golden Pavilion temple", tips: "Best in afternoon light", icon: Landmark },
                    { time: "4:00 PM", activity: "Arashiyama Bamboo Grove", location: "Arashiyama", description: "Towering bamboo forest", tips: "Walk through quietly", icon: TreePine },
                ],
            },
            {
                day: 4,
                title: "Kyoto - Geisha District",
                theme: "Traditional Culture",
                icon: Heart,
                color: "from-pink-500 to-rose-500",
                activities: [
                    { time: "10:00 AM", activity: "Gion District Walk", location: "Gion", description: "Traditional geisha neighborhood", tips: "Spot maiko in evening", icon: Camera },
                    { time: "2:00 PM", activity: "Nishiki Market", location: "Downtown Kyoto", description: "Kyoto's kitchen for 400 years", tips: "Try pickles and matcha", icon: UtensilsCrossed },
                    { time: "6:00 PM", activity: "Traditional Tea Ceremony", location: "Gion", description: "Authentic Japanese tea experience", tips: "Book in advance", icon: Coffee },
                ],
            },
            {
                day: 5,
                title: "Osaka - Food Capital",
                theme: "Street Food Heaven",
                icon: UtensilsCrossed,
                color: "from-yellow-500 to-orange-500",
                activities: [
                    { time: "10:00 AM", activity: "Osaka Castle", location: "Chuo-ku", description: "Iconic 16th century castle", tips: "Cherry blossoms in spring", icon: Landmark },
                    { time: "2:00 PM", activity: "Dotonbori", location: "Namba", description: "Neon-lit food street", tips: "Try takoyaki and okonomiyaki", icon: UtensilsCrossed },
                    { time: "8:00 PM", activity: "Shinsekai District", location: "Shinsekai", description: "Retro entertainment district", tips: "Kushikatsu is a must", icon: Building },
                ],
            },
            {
                day: 6,
                title: "Nara - Ancient Temples",
                theme: "Sacred Deer City",
                icon: TreePine,
                color: "from-emerald-500 to-teal-500",
                activities: [
                    { time: "9:00 AM", activity: "Nara Park", location: "Nara", description: "1000+ free-roaming deer", tips: "Buy deer crackers", icon: TreePine },
                    { time: "11:00 AM", activity: "Todai-ji Temple", location: "Nara", description: "World's largest bronze Buddha", tips: "Walk through pillar hole", icon: Landmark },
                    { time: "3:00 PM", activity: "Kasuga Grand Shrine", location: "Nara", description: "3000 stone lanterns", tips: "Beautiful at dusk", icon: Landmark },
                ],
            },
            {
                day: 7,
                title: "Mount Fuji Day Trip",
                theme: "Sacred Mountain",
                icon: Mountain,
                color: "from-blue-500 to-indigo-500",
                activities: [
                    { time: "6:00 AM", activity: "Lake Kawaguchiko", location: "Fujikawaguchiko", description: "Best Fuji reflection views", tips: "Clear mornings best", icon: Camera },
                    { time: "11:00 AM", activity: "Chureito Pagoda", location: "Fujiyoshida", description: "Iconic pagoda with Fuji view", tips: "400 steps to climb", icon: Landmark },
                    { time: "3:00 PM", activity: "Oshino Hakkai", location: "Oshino", description: "8 crystal clear ponds", tips: "Try local mochi", icon: Waves },
                ],
            },
        ],
    },
    FR: {
        name: "France",
        flag: "🇫🇷",
        description: "Romance, art, wine, and world-class cuisine",
        bestTime: "April to October",
        currency: "EUR (€)",
        language: "French",
        days: [
            {
                day: 1,
                title: "Paris - Iconic Landmarks",
                theme: "City of Light",
                icon: Landmark,
                color: "from-blue-500 to-indigo-500",
                activities: [
                    { time: "9:00 AM", activity: "Eiffel Tower", location: "Champ de Mars", description: "Paris's iconic iron lady", tips: "Book summit tickets early", icon: Landmark },
                    { time: "1:00 PM", activity: "Arc de Triomphe", location: "Champs-Élysées", description: "Napoleon's victory arch", tips: "Climb for panoramic views", icon: Landmark },
                    { time: "7:00 PM", activity: "Seine River Cruise", location: "Pont Neuf", description: "See Paris from the water", tips: "Sunset cruise is magical", icon: Waves },
                ],
            },
            {
                day: 2,
                title: "Paris - Art & Culture",
                theme: "Museum Paradise",
                icon: Camera,
                color: "from-purple-500 to-pink-500",
                activities: [
                    { time: "9:00 AM", activity: "Louvre Museum", location: "1st Arr.", description: "World's largest art museum", tips: "See Mona Lisa early", icon: Landmark },
                    { time: "2:00 PM", activity: "Musée d'Orsay", location: "7th Arr.", description: "Impressionist masterpieces", tips: "Former railway station", icon: Camera },
                    { time: "6:00 PM", activity: "Montmartre & Sacré-Cœur", location: "18th Arr.", description: "Artistic hilltop neighborhood", tips: "Watch sunset from steps", icon: Heart },
                ],
            },
            {
                day: 3,
                title: "Versailles Day Trip",
                theme: "Royal Grandeur",
                icon: Landmark,
                color: "from-yellow-500 to-amber-500",
                activities: [
                    { time: "9:00 AM", activity: "Palace of Versailles", location: "Versailles", description: "Louis XIV's magnificent palace", tips: "Arrive when gates open", icon: Landmark },
                    { time: "1:00 PM", activity: "Gardens of Versailles", location: "Versailles", description: "800 hectares of gardens", tips: "Rent a golf cart", icon: TreePine },
                    { time: "4:00 PM", activity: "Marie Antoinette's Estate", location: "Versailles", description: "Queen's private retreat", tips: "Hamlet is charming", icon: Heart },
                ],
            },
            {
                day: 4,
                title: "Loire Valley Castles",
                theme: "Château Country",
                icon: Landmark,
                color: "from-emerald-500 to-green-500",
                activities: [
                    { time: "8:00 AM", activity: "Château de Chambord", location: "Chambord", description: "Renaissance masterpiece", tips: "Double helix staircase", icon: Landmark },
                    { time: "12:00 PM", activity: "Château de Chenonceau", location: "Chenonceaux", description: "Castle spanning the river", tips: "Women's castle history", icon: Landmark },
                    { time: "5:00 PM", activity: "Loire Wine Tasting", location: "Amboise", description: "Vouvray and Chinon wines", tips: "Book cave tours", icon: UtensilsCrossed },
                ],
            },
            {
                day: 5,
                title: "Provence - Lavender Fields",
                theme: "Purple Paradise",
                icon: TreePine,
                color: "from-violet-500 to-purple-500",
                activities: [
                    { time: "8:00 AM", activity: "Sénanque Abbey", location: "Gordes", description: "Lavender fields at monastery", tips: "Peak bloom June-July", icon: Camera },
                    { time: "12:00 PM", activity: "Gordes Village", location: "Gordes", description: "Most beautiful village in France", tips: "Stone architecture stunning", icon: Building },
                    { time: "4:00 PM", activity: "Roussillon Ochre Trail", location: "Roussillon", description: "Red rock formations", tips: "Don't wear white", icon: Mountain },
                ],
            },
            {
                day: 6,
                title: "French Riviera - Nice",
                theme: "Mediterranean Glamour",
                icon: Waves,
                color: "from-cyan-500 to-blue-500",
                activities: [
                    { time: "9:00 AM", activity: "Promenade des Anglais", location: "Nice", description: "Famous seaside walkway", tips: "Rent a bike", icon: Waves },
                    { time: "12:00 PM", activity: "Old Town Nice", location: "Vieux Nice", description: "Colorful baroque buildings", tips: "Try socca pancake", icon: UtensilsCrossed },
                    { time: "5:00 PM", activity: "Castle Hill Sunset", location: "Nice", description: "Panoramic bay views", tips: "Take the elevator up", icon: Camera },
                ],
            },
            {
                day: 7,
                title: "Monaco & Èze",
                theme: "Riviera Luxury",
                icon: Building,
                color: "from-amber-500 to-orange-500",
                activities: [
                    { time: "9:00 AM", activity: "Monte Carlo Casino", location: "Monaco", description: "World-famous gambling palace", tips: "Dress code enforced", icon: Building },
                    { time: "1:00 PM", activity: "Prince's Palace", location: "Monaco", description: "Guard changing ceremony", tips: "11:55 AM daily", icon: Landmark },
                    { time: "4:00 PM", activity: "Èze Village", location: "Èze", description: "Medieval hilltop village", tips: "Exotic garden views", icon: TreePine },
                ],
            },
        ],
    },
    IT: {
        name: "Italy",
        flag: "🇮🇹",
        description: "Art, history, incredible food, and la dolce vita",
        bestTime: "April to June",
        currency: "EUR (€)",
        language: "Italian",
        days: [
            {
                day: 1,
                title: "Rome - Ancient Wonders",
                theme: "Eternal City",
                icon: Landmark,
                color: "from-amber-500 to-orange-500",
                activities: [
                    { time: "8:00 AM", activity: "Colosseum", location: "Rome", description: "Iconic ancient amphitheater", tips: "Book skip-the-line", icon: Landmark },
                    { time: "12:00 PM", activity: "Roman Forum", location: "Rome", description: "Heart of ancient Rome", tips: "Combo ticket with Colosseum", icon: Landmark },
                    { time: "5:00 PM", activity: "Trevi Fountain", location: "Rome", description: "Baroque masterpiece", tips: "Throw coin for luck", icon: Waves },
                ],
            },
            {
                day: 2,
                title: "Vatican City",
                theme: "Sacred Art",
                icon: Landmark,
                color: "from-blue-500 to-indigo-500",
                activities: [
                    { time: "8:00 AM", activity: "Vatican Museums", location: "Vatican", description: "World's greatest art collection", tips: "Book first entry slot", icon: Camera },
                    { time: "11:00 AM", activity: "Sistine Chapel", location: "Vatican", description: "Michelangelo's ceiling masterpiece", tips: "No photos allowed", icon: Landmark },
                    { time: "2:00 PM", activity: "St. Peter's Basilica", location: "Vatican", description: "World's largest church", tips: "Climb the dome", icon: Landmark },
                ],
            },
            {
                day: 3,
                title: "Florence - Renaissance Art",
                theme: "Birthplace of Renaissance",
                icon: Camera,
                color: "from-rose-500 to-pink-500",
                activities: [
                    { time: "9:00 AM", activity: "Uffizi Gallery", location: "Florence", description: "Botticelli and da Vinci", tips: "Reserve weeks ahead", icon: Camera },
                    { time: "2:00 PM", activity: "Ponte Vecchio", location: "Florence", description: "Medieval bridge with shops", tips: "Gold jewelry tradition", icon: Landmark },
                    { time: "6:00 PM", activity: "Piazzale Michelangelo", location: "Florence", description: "Best sunset panorama", tips: "Walk up for exercise", icon: Camera },
                ],
            },
            {
                day: 4,
                title: "Tuscany Countryside",
                theme: "Rolling Hills",
                icon: TreePine,
                color: "from-green-500 to-emerald-500",
                activities: [
                    { time: "9:00 AM", activity: "San Gimignano", location: "Tuscany", description: "Medieval tower town", tips: "Best gelato in Italy", icon: Building },
                    { time: "1:00 PM", activity: "Chianti Wine Tasting", location: "Chianti", description: "Famous red wine region", tips: "Book vineyard tour", icon: UtensilsCrossed },
                    { time: "5:00 PM", activity: "Siena", location: "Tuscany", description: "Gothic cathedral city", tips: "See Piazza del Campo", icon: Landmark },
                ],
            },
            {
                day: 5,
                title: "Venice - City of Canals",
                theme: "Floating City",
                icon: Waves,
                color: "from-cyan-500 to-teal-500",
                activities: [
                    { time: "9:00 AM", activity: "St. Mark's Basilica", location: "Venice", description: "Byzantine gold mosaics", tips: "Free entry, lines long", icon: Landmark },
                    { time: "12:00 PM", activity: "Doge's Palace", location: "Venice", description: "Gothic masterpiece", tips: "Secret itinerary tour", icon: Landmark },
                    { time: "5:00 PM", activity: "Gondola Ride", location: "Grand Canal", description: "Iconic Venice experience", tips: "Share to reduce cost", icon: Waves },
                ],
            },
            {
                day: 6,
                title: "Amalfi Coast",
                theme: "Coastal Paradise",
                icon: Waves,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    { time: "9:00 AM", activity: "Positano", location: "Amalfi Coast", description: "Colorful cliffside village", tips: "Wear comfortable shoes", icon: Camera },
                    { time: "1:00 PM", activity: "Amalfi Town", location: "Amalfi Coast", description: "Historic maritime republic", tips: "Visit the cathedral", icon: Landmark },
                    { time: "5:00 PM", activity: "Ravello Gardens", location: "Ravello", description: "Clifftop garden paradise", tips: "Villa Rufolo concerts", icon: TreePine },
                ],
            },
            {
                day: 7,
                title: "Cinque Terre",
                theme: "Colorful Villages",
                icon: Mountain,
                color: "from-orange-500 to-red-500",
                activities: [
                    { time: "8:00 AM", activity: "Hike Monterosso to Vernazza", location: "Cinque Terre", description: "Scenic coastal trail", tips: "2 hours moderate", icon: Mountain },
                    { time: "12:00 PM", activity: "Manarola Photos", location: "Cinque Terre", description: "Most photographed village", tips: "Sunset is stunning", icon: Camera },
                    { time: "4:00 PM", activity: "Riomaggiore Swimming", location: "Cinque Terre", description: "Swim in crystal waters", tips: "Rocky beaches", icon: Waves },
                ],
            },
        ],
    },
    SG: {
        name: "Singapore",
        flag: "🇸🇬",
        description: "Futuristic city-state with diverse cultures and cuisines",
        bestTime: "February to April",
        currency: "SGD ($)",
        language: "English",
        days: [
            {
                day: 1,
                title: "Marina Bay",
                theme: "Iconic Waterfront",
                icon: Building,
                color: "from-blue-500 to-cyan-500",
                activities: [
                    { time: "10:00 AM", activity: "Gardens by the Bay", location: "Marina Bay", description: "Futuristic nature park", tips: "Cloud Forest is stunning", icon: TreePine },
                    { time: "3:00 PM", activity: "Marina Bay Sands", location: "Marina Bay", description: "Iconic hotel and SkyPark", tips: "Pay for observation deck", icon: Building },
                    { time: "8:00 PM", activity: "Spectra Light Show", location: "Marina Bay", description: "Free water and light show", tips: "8pm and 9pm nightly", icon: Star },
                ],
            },
            {
                day: 2,
                title: "Cultural Districts",
                theme: "Heritage Walk",
                icon: Landmark,
                color: "from-orange-500 to-red-500",
                activities: [
                    { time: "9:00 AM", activity: "Chinatown", location: "Chinatown", description: "Historic Chinese district", tips: "Try dim sum breakfast", icon: UtensilsCrossed },
                    { time: "1:00 PM", activity: "Little India", location: "Little India", description: "Vibrant Indian neighborhood", tips: "Visit Sri Veeramakaliamman", icon: Landmark },
                    { time: "5:00 PM", activity: "Kampong Glam", location: "Arab Street", description: "Malay-Arab quarter", tips: "Sultan Mosque beautiful", icon: Landmark },
                ],
            },
            {
                day: 3,
                title: "Sentosa Island",
                theme: "Island Fun",
                icon: Waves,
                color: "from-yellow-500 to-orange-500",
                activities: [
                    { time: "10:00 AM", activity: "Universal Studios", location: "Sentosa", description: "Theme park adventure", tips: "Express pass worth it", icon: Star },
                    { time: "4:00 PM", activity: "Siloso Beach", location: "Sentosa", description: "Relaxing beach time", tips: "Beach bars at sunset", icon: Waves },
                    { time: "8:00 PM", activity: "Wings of Time Show", location: "Sentosa", description: "Outdoor night show", tips: "Book seats in advance", icon: Star },
                ],
            },
            {
                day: 4,
                title: "Nature & Wildlife",
                theme: "Green Singapore",
                icon: TreePine,
                color: "from-green-500 to-emerald-500",
                activities: [
                    { time: "8:00 AM", activity: "Singapore Botanic Gardens", location: "Tanglin", description: "UNESCO World Heritage Site", tips: "Orchid Garden is stunning", icon: TreePine },
                    { time: "12:00 PM", activity: "Singapore Zoo", location: "Mandai", description: "World-class open zoo", tips: "Orangutan breakfast", icon: TreePine },
                    { time: "7:00 PM", activity: "Night Safari", location: "Mandai", description: "World's first night zoo", tips: "Tram ride essential", icon: Star },
                ],
            },
            {
                day: 5,
                title: "Food Paradise",
                theme: "Hawker Heaven",
                icon: UtensilsCrossed,
                color: "from-red-500 to-pink-500",
                activities: [
                    { time: "8:00 AM", activity: "Tiong Bahru Market", location: "Tiong Bahru", description: "Hipster hawker center", tips: "Chwee kueh is famous", icon: Coffee },
                    { time: "12:00 PM", activity: "Maxwell Food Centre", location: "Chinatown", description: "Michelin star chicken rice", tips: "Tian Tian long queue", icon: UtensilsCrossed },
                    { time: "7:00 PM", activity: "Lau Pa Sat", location: "CBD", description: "Historic Victorian market", tips: "Satay street at night", icon: UtensilsCrossed },
                ],
            },
            {
                day: 6,
                title: "Shopping & Orchard",
                theme: "Retail Therapy",
                icon: ShoppingBag,
                color: "from-pink-500 to-purple-500",
                activities: [
                    { time: "11:00 AM", activity: "Orchard Road", location: "Orchard", description: "Premier shopping belt", tips: "ION and Takashimaya", icon: ShoppingBag },
                    { time: "3:00 PM", activity: "Jewel Changi Airport", location: "Changi", description: "Rain Vortex waterfall", tips: "World's tallest indoor", icon: Building },
                    { time: "7:00 PM", activity: "Clarke Quay", location: "Singapore River", description: "Riverside nightlife", tips: "Great for dinner drinks", icon: UtensilsCrossed },
                ],
            },
            {
                day: 7,
                title: "Hidden Gems",
                theme: "Off the Beaten Path",
                icon: Compass,
                color: "from-teal-500 to-cyan-500",
                activities: [
                    { time: "9:00 AM", activity: "Haw Par Villa", location: "Pasir Panjang", description: "Quirky mythology park", tips: "Ten Courts of Hell", icon: Landmark },
                    { time: "1:00 PM", activity: "Pulau Ubin", location: "Offshore", description: "Rustic island escape", tips: "Rent a bike to explore", icon: TreePine },
                    { time: "6:00 PM", activity: "Sunset at MacRitchie", location: "MacRitchie", description: "Treetop walk and reservoir", tips: "Book treetop walk", icon: TreePine },
                ],
            },
        ],
    },
    AE: {
        name: "UAE",
        flag: "🇦🇪",
        description: "Luxury, innovation, and Arabian culture in the desert",
        bestTime: "November to March",
        currency: "AED (د.إ)",
        language: "Arabic",
        days: [
            {
                day: 1,
                title: "Dubai - Downtown Icons",
                theme: "Superlative City",
                icon: Building,
                color: "from-amber-500 to-yellow-500",
                activities: [
                    { time: "10:00 AM", activity: "Burj Khalifa", location: "Downtown Dubai", description: "World's tallest building", tips: "Book At the Top tickets", icon: Building },
                    { time: "2:00 PM", activity: "Dubai Mall", location: "Downtown Dubai", description: "World's largest mall", tips: "Aquarium is amazing", icon: ShoppingBag },
                    { time: "8:00 PM", activity: "Dubai Fountain Show", location: "Downtown Dubai", description: "Choreographed water show", tips: "Every 30 mins evening", icon: Waves },
                ],
            },
            {
                day: 2,
                title: "Old Dubai",
                theme: "Heritage & Culture",
                icon: Landmark,
                color: "from-orange-500 to-amber-500",
                activities: [
                    { time: "9:00 AM", activity: "Al Fahidi Historical", location: "Bur Dubai", description: "Traditional wind towers", tips: "Coffee Museum nearby", icon: Landmark },
                    { time: "12:00 PM", activity: "Gold & Spice Souks", location: "Deira", description: "Traditional markets", tips: "Bargain for gold", icon: ShoppingBag },
                    { time: "5:00 PM", activity: "Abra Ride", location: "Dubai Creek", description: "Traditional water taxi", tips: "Only 1 dirham", icon: Waves },
                ],
            },
            {
                day: 3,
                title: "Beach & Palm",
                theme: "Coastal Luxury",
                icon: Waves,
                color: "from-cyan-500 to-blue-500",
                activities: [
                    { time: "10:00 AM", activity: "Palm Jumeirah", location: "Palm", description: "Man-made island wonder", tips: "Monorail for views", icon: Building },
                    { time: "1:00 PM", activity: "Atlantis Aquaventure", location: "Palm", description: "Waterpark and aquarium", tips: "Full day needed", icon: Waves },
                    { time: "6:00 PM", activity: "JBR Beach Walk", location: "JBR", description: "Beach dining and shopping", tips: "Great sunset spot", icon: UtensilsCrossed },
                ],
            },
            {
                day: 4,
                title: "Desert Safari",
                theme: "Arabian Adventure",
                icon: Sun,
                color: "from-yellow-500 to-red-500",
                activities: [
                    { time: "3:00 PM", activity: "Dune Bashing", location: "Dubai Desert", description: "4x4 desert adventure", tips: "Hold on tight!", icon: Mountain },
                    { time: "6:00 PM", activity: "Camel Ride", location: "Desert Camp", description: "Sunset camel trek", tips: "Photos included", icon: Camera },
                    { time: "8:00 PM", activity: "BBQ Dinner & Show", location: "Desert Camp", description: "Belly dance and tanoura", tips: "Try shisha", icon: UtensilsCrossed },
                ],
            },
            {
                day: 5,
                title: "Abu Dhabi Day Trip",
                theme: "Capital Wonders",
                icon: Landmark,
                color: "from-white to-blue-500",
                activities: [
                    { time: "9:00 AM", activity: "Sheikh Zayed Mosque", location: "Abu Dhabi", description: "Stunning white marble mosque", tips: "Modest dress required", icon: Landmark },
                    { time: "1:00 PM", activity: "Louvre Abu Dhabi", location: "Saadiyat Island", description: "Art museum masterpiece", tips: "Rain of light dome", icon: Camera },
                    { time: "5:00 PM", activity: "Emirates Palace", location: "Abu Dhabi", description: "Ultra-luxury palace hotel", tips: "Gold cappuccino", icon: Building },
                ],
            },
            {
                day: 6,
                title: "Modern Marvels",
                theme: "Future Architecture",
                icon: Building,
                color: "from-purple-500 to-indigo-500",
                activities: [
                    { time: "10:00 AM", activity: "Museum of the Future", location: "Sheikh Zayed Rd", description: "Immersive future museum", tips: "Book online essential", icon: Building },
                    { time: "2:00 PM", activity: "Dubai Frame", location: "Zabeel Park", description: "Giant picture frame", tips: "Glass floor walkway", icon: Camera },
                    { time: "7:00 PM", activity: "Ain Dubai", location: "Bluewaters", description: "World's largest ferris wheel", tips: "Sunset timing best", icon: Star },
                ],
            },
            {
                day: 7,
                title: "Luxury Experiences",
                theme: "Ultimate Indulgence",
                icon: Star,
                color: "from-gold-500 to-amber-500",
                activities: [
                    { time: "10:00 AM", activity: "Burj Al Arab Tour", location: "Jumeirah", description: "Inside iconic sail hotel", tips: "Book tour in advance", icon: Building },
                    { time: "2:00 PM", activity: "Ski Dubai", location: "Mall of Emirates", description: "Indoor ski resort", tips: "Penguin encounter fun", icon: Mountain },
                    { time: "7:00 PM", activity: "Dhow Cruise Dinner", location: "Dubai Marina", description: "Traditional boat dinner", tips: "Marina has best views", icon: UtensilsCrossed },
                ],
            },
        ],
    },
};

// 3D Globe Component Wrapper
const ThreeGlobeWrapper = () => {
    return (
        <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
            {/* Glow effect behind globe */}
            <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-green-500 opacity-20 blur-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
            {/* Three.js Globe */}
            <div className="relative w-full h-full">
                <ThreeGlobeComponent />
            </div>
        </div>
    );
};

export default function TravelPlanPage() {
     const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);
     const scrollContainerRef = useRef<HTMLDivElement>(null);
     const [isPaused, setIsPaused] = useState(false);
     const [carouselIndex, setCarouselIndex] = useState(0);

     const countries = Object.keys(countryItineraries);

     // Auto-scroll carousel
     useEffect(() => {
         const interval = setInterval(() => {
             setCarouselIndex(prev => prev + 1);
         }, 4000); // Change image every 4 seconds

         return () => clearInterval(interval);
     }, []);

    // Auto-scroll effect
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;
        if (isPaused || loading || selectedCountry) return;

        let animationId: number;
        let lastTime = 0;
        const scrollSpeed = 0.5; // pixels per millisecond

        const autoScroll = (currentTime: number) => {
            if (!scrollContainer) return;
            
            if (lastTime !== 0) {
                const delta = currentTime - lastTime;
                const scrollAmount = scrollSpeed * delta * 0.05;
                
                // Check if we've reached the end
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) {
                    // Reset to beginning
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += scrollAmount;
                }
            }
            
            lastTime = currentTime;
            animationId = requestAnimationFrame(autoScroll);
        };

        // Start after a small delay to ensure DOM is ready
        const timeout = setTimeout(() => {
            animationId = requestAnimationFrame(autoScroll);
        }, 500);

        return () => {
            clearTimeout(timeout);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isPaused, loading, selectedCountry]);

    const handleCountrySelect = (countryCode: string) => {
        setLoading(true);
        setTimeout(() => {
            setSelectedCountry(countryCode);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {!loading && !selectedCountry && (
                <>
                    {/* Hero Section with Globe */}
                    <section className="relative z-10 container mx-auto px-4 pt-16 pb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Explore the World
                                </span>
                            </h1>
                            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                                Discover perfect 7-day travel itineraries for your dream destination
                            </p>

                            {/* 3D Globe */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="my-8"
                            >
                                <ThreeGlobeWrapper />
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Horizontal Country Scroller */}
                    <section className="relative z-10 pb-24">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="container mx-auto px-4"
                        >
                            <h2 className="text-3xl font-bold text-white text-center mb-8">
                                Select Your Destination
                            </h2>

                            {/* Horizontal Scroll Container */}
                            <div className="relative overflow-hidden">
                                <div
                                    ref={scrollContainerRef}
                                    className={`flex gap-4 pb-6 px-2 ${isPaused ? '' : 'animate-scroll'}`}
                                    style={{
                                        animation: isPaused ? 'none' : 'scroll 30s linear infinite',
                                    }}
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                    onTouchStart={() => setIsPaused(true)}
                                    onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
                                >
                                    {/* Duplicate cards for seamless loop */}
                                    {[...countries, ...countries].map((countryCode, index) => {
                                        const country = countryItineraries[countryCode];
                                        return (
                                            <motion.button
                                                key={`${countryCode}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                                onClick={() => handleCountrySelect(countryCode)}
                                                className="flex-shrink-0 w-52 group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-purple-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <div className="p-5">
                                                    <div className="text-5xl mb-3">{country.flag}</div>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {country.name}
                                                    </h3>
                                                    <p className="text-white/60 text-xs mb-3 line-clamp-2">
                                                        {country.description}
                                                    </p>

                                                    <div className="flex flex-col gap-1.5 text-xs text-white/50 mb-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3 text-blue-400" />
                                                            <span className="truncate">{country.bestTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-3 h-3 text-green-400" />
                                                            <span>{country.currency}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-center gap-1.5 text-purple-400 text-sm font-semibold group-hover:text-purple-300 transition-colors">
                                                        <span>View Itinerary</span>
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>

                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Scroll indicators */}
                                <div className="flex justify-center gap-1.5 mt-4">
                                    {countries.map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </>
            )}

            {/* Loading Screen */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                >
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 mx-auto mb-6"
                        >
                            <Loader2 className="w-24 h-24 text-cyan-400" />
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            Preparing Your Journey
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60"
                        >
                            Crafting the perfect 7-day itinerary...
                        </motion.p>
                    </div>
                </motion.div>
            )}

            {/* Vertical Timeline View */}
            {selectedCountry && !loading && (
                <AnimatePresence mode="wait">
                    <motion.section
                        key={selectedCountry}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 container mx-auto px-4 pb-24 pt-8"
                    >
                        {/* Back Button */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedCountry(null)}
                            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-lg">Back to Destinations</span>
                        </motion.button>

                        {/* Country Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-16"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                                className="text-9xl mb-6"
                            >
                                {countryItineraries[selectedCountry].flag}
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                                {countryItineraries[selectedCountry].name}
                            </h2>
                            <p className="text-white/60 text-xl max-w-3xl mx-auto mb-8">
                                {countryItineraries[selectedCountry].description}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30">
                                    <Calendar className="w-4 h-4 inline mr-2 text-blue-400" />
                                    <span className="text-blue-300 font-medium">{countryItineraries[selectedCountry].bestTime}</span>
                                </div>
                                <div className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30">
                                    <MapPin className="w-4 h-4 inline mr-2 text-green-400" />
                                    <span className="text-green-300 font-medium">{countryItineraries[selectedCountry].currency}</span>
                                </div>
                                <div className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
                                    <Info className="w-4 h-4 inline mr-2 text-purple-400" />
                                    <span className="text-purple-300 font-medium">{countryItineraries[selectedCountry].language}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Vertical Timeline */}
                        <div className="max-w-5xl mx-auto relative">
                            {/* Central Vertical Line */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

                            {countryItineraries[selectedCountry].days.map((day, dayIndex) => {
                                const Icon = day.icon;
                                const isLeft = dayIndex % 2 === 0;

                                return (
                                    <motion.div
                                        key={day.day}
                                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: dayIndex * 0.15 }}
                                        className={`relative flex items-center mb-20 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                                    >
                                        {/* Content Card & Carousel - Flex Container */}
                                         <div className={`flex w-full items-center ${isLeft ? "" : "flex-row-reverse"}`}>
                                             {/* Content Card */}
                                             <div className="w-5/12">
                                                 <motion.div
                                                     whileHover={{ scale: 1.05, y: -5 }}
                                                     className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl mr-auto"
                                                 >
                                                     <div className="flex items-start gap-4 mb-4">
                                                         <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${day.color} flex items-center justify-center shadow-lg`}>
                                                             <Icon className="w-8 h-8 text-white" />
                                                         </div>
                                                         <div className="flex-1">
                                                             <h3 className="text-2xl font-bold text-white mb-1">
                                                                 {day.title}
                                                             </h3>
                                                             <p className="text-purple-300 text-sm font-medium">
                                                                 {day.theme}
                                                             </p>
                                                         </div>
                                                     </div>

                                                     {/* Activities Summary */}
                                                     <div className="space-y-3">
                                                         {day.activities.slice(0, 3).map((activity, actIndex) => {
                                                             const ActivityIcon = activity.icon;
                                                             return (
                                                                 <div key={actIndex} className="flex items-start gap-3">
                                                                     <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                                         <ActivityIcon className="w-4 h-4 text-cyan-400" />
                                                                     </div>
                                                                     <div className="flex-1">
                                                                         <h4 className="text-white font-semibold text-sm mb-1">
                                                                             {activity.activity}
                                                                         </h4>
                                                                         <div className="flex items-center gap-2 text-xs text-white/50">
                                                                             <Clock className="w-3 h-3" />
                                                                             <span>{activity.time}</span>
                                                                         </div>
                                                                         <p className="text-white/60 text-xs mt-1 line-clamp-2">
                                                                             {activity.description}
                                                                         </p>
                                                                     </div>
                                                                 </div>
                                                             );
                                                         })}
                                                     </div>

                                                     {/* Location */}
                                                     <div className="mt-4 pt-4 border-t border-white/10">
                                                         <div className="flex items-center gap-2 text-sm text-green-300">
                                                             <MapPin className="w-4 h-4" />
                                                             <span>{day.activities[0]?.location}</span>
                                                         </div>
                                                     </div>
                                                 </motion.div>
                                             </div>

                                             {/* Center Circle with Day Number & Connector */}
                                             <div className="w-2/12 flex items-center justify-center relative z-10">
                                                  {/* Connector line to carousel card */}
                                                  <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 pointer-events-none ${
                                                      isLeft 
                                                          ? "left-1/2 w-20 bg-gradient-to-r from-purple-500 to-transparent" 
                                                          : "right-1/2 w-20 bg-gradient-to-l from-purple-500 to-transparent"
                                                  }`} />
                                                  
                                                  <motion.div
                                                      initial={{ scale: 0 }}
                                                      animate={{ scale: 1 }}
                                                      transition={{ delay: dayIndex * 0.15 + 0.2, type: "spring" }}
                                                      className="relative"
                                                  >
                                                      {/* Outer glow */}
                                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50" />
                                                      
                                                      {/* Main circle */}
                                                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border-4 border-black">
                                                          <span className="text-3xl font-bold text-white">
                                                              {day.day}
                                                          </span>
                                                      </div>
                                                  </motion.div>
                                             </div>

                                             {/* Carousel Card */}
                                             <div className="w-5/12 relative z-20">
                                                 {/* Image Carousel */}
                                                 <div className="relative h-80 rounded-3xl overflow-hidden ml-auto">
                                                         <AnimatePresence mode="wait">
                                                             {day.activities.map((activity, actIndex) => {
                                                                     const currentSlide = carouselIndex % day.activities.length;
                                                                     const activityImage = getCarouselImage(selectedCountry, day.day, actIndex);
                                                                     return (
                                                                         <motion.div
                                                                             key={`carousel-${dayIndex}-${actIndex}`}
                                                                             initial={{ opacity: 0 }}
                                                                             animate={{ opacity: actIndex === currentSlide ? 1 : 0 }}
                                                                             exit={{ opacity: 0 }}
                                                                             transition={{ duration: 0.5 }}
                                                                             className="absolute inset-0"
                                                                         >
                                                                             <div className="w-full h-full relative">
                                                                                 {/* Background Image */}
                                                                                 {activityImage ? (
                                                                                     <Image
                                                                                         src={activityImage}
                                                                                         alt={activity.activity}
                                                                                         fill
                                                                                         className="object-cover"
                                                                                     />
                                                                                 ) : (
                                                                                     <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                                                                                 )}
                                                                                 {/* Overlay */}
                                                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                                                                 {/* Content */}
                                                                                 <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center pb-4">
                                                                                     <h4 className="text-white font-bold text-sm mb-1 line-clamp-2">
                                                                                         {activity.activity}
                                                                                     </h4>
                                                                                     <p className="text-white/80 text-xs">
                                                                                         {activity.location}
                                                                                     </p>
                                                                                 </div>
                                                                             </div>
                                                                         </motion.div>
                                                                     );
                                                                 })}
                                                         </AnimatePresence>

                                                         {/* Carousel Indicators */}
                                                         <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                                                             {day.activities.map((_, actIndex) => {
                                                                 const currentSlide = carouselIndex % day.activities.length;
                                                                 return (
                                                                     <motion.div
                                                                         key={`indicator-${dayIndex}-${actIndex}`}
                                                                         animate={{
                                                                             width: actIndex === currentSlide ? 24 : 8,
                                                                             backgroundColor: actIndex === currentSlide ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 0.3)'
                                                                         }}
                                                                         className="h-2 rounded-full transition-all"
                                                                     />
                                                                 );
                                                             })}
                                                         </div>
                                                     </div>
                                                     </div>
                                         </div>
                                         </motion.div>
                                         );
                                         })}
                                         </div>

                        {/* CTA Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="mt-24 text-center"
                        >
                            <div className="relative max-w-3xl mx-auto bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50 backdrop-blur-2xl rounded-3xl border border-white/20 p-12 overflow-hidden">
                                {/* Background decorations */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                                
                                <div className="relative z-10">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-white mb-4">
                                        Ready to Start Your Adventure?
                                    </h3>
                                    <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                                        Check visa requirements and start planning your dream trip to {countryItineraries[selectedCountry].name}
                                    </p>
                                    <motion.a
                                        href="/analyze"
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-purple-500/50 hover:shadow-3xl transition-all"
                                        whileHover={{ scale: 1.08, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Plane className="w-6 h-6" />
                                        Check Visa Requirements
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.section>
                </AnimatePresence>
            )}
        </div>
    );
}
