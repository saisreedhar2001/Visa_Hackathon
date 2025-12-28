"use client";

import React, { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
    Globe2,
    Sparkles,
    ArrowLeft,
    MapPin,
    Compass,
    Plane,
    ChevronRight,
    Star,
    Zap,
} from "lucide-react";
import TravelDetailsForm, { TravelDetails } from "@/components/forms/TravelDetailsForm";
import VisaAnalysisResults, { AIAnalysisResult } from "@/components/analysis/VisaAnalysisResults";
import AirplaneLoader from "@/components/ui/AirplaneLoader";

// Dynamically import the map to avoid SSR issues
const WorldMapExplorer = dynamic(
    () => import("@/components/visualization/WorldMapExplorer"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-3xl">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Globe2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-white/60">Loading world map...</p>
                </div>
            </div>
        ),
    }
);

// Import country data
import { countryData } from "@/components/visualization/WorldMapExplorer";

// Helper to generate mock AI analysis (in production, call your backend)
const generateAIAnalysis = async (
    countryCode: string,
    details: TravelDetails
): Promise<AIAnalysisResult> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const country = countryData[countryCode];
    if (!country) throw new Error("Country not found");

    // Calculate base scores
    const educationScore = {
        high_school: 20,
        diploma: 40,
        bachelors: 60,
        masters: 80,
        phd: 95,
    }[details.education] || 50;

    const experienceScore = Math.min(details.yearsExperience * 8, 80);
    const fieldBonus = ["technology", "data_science", "healthcare"].includes(details.field) ? 15 : 5;
    const languageBonus = details.languages.length > 1 ? 10 : 0;

    const overallScore = Math.min(
        Math.round((educationScore + experienceScore + fieldBonus + languageBonus) / 2),
        100
    );

    const successProbability = Math.min(
        Math.round(overallScore * 0.9 + Math.random() * 10),
        95
    );

    // Generate visa options based on country and purpose
    const visaOptions = generateVisaOptions(countryCode, details);

    // Calculate costs
    const baseCost = country.avgCostUSD;
    const purposeMultiplier = details.purpose === "settle" ? 2 : details.purpose === "startup" ? 1.5 : 1;

    return {
        countryName: country.name,
        countryFlag: country.flag,
        countryCode: countryCode,
        overallScore,
        estimatedTotalCost: {
            min: Math.round(baseCost * purposeMultiplier * 0.8),
            max: Math.round(baseCost * purposeMultiplier * 1.5),
        },
        estimatedTimeline: {
            min: `${Math.round(country.avgProcessingDays * 0.7)} days`,
            max: `${Math.round(country.avgProcessingDays * 1.3)} days`,
        },
        visaOptions,
        profileStrengths: generateStrengths(details),
        profileWeaknesses: generateWeaknesses(details),
        recommendations: generateRecommendations(countryCode, details),
        nextSteps: generateNextSteps(countryCode, details),
        riskLevel: successProbability > 70 ? "low" : successProbability > 50 ? "medium" : "high",
        successProbability,
    };
};

const generateVisaOptions = (countryCode: string, details: TravelDetails) => {
    const country = countryData[countryCode];
    const visaTypes = country?.visaTypes || [];

    return visaTypes.slice(0, 3).map((visaType, index) => ({
        name: visaType,
        type: details.purpose === "work" ? "Work Visa" : details.purpose === "study" ? "Student Visa" : "Residence Permit",
        processingTime: `${30 + index * 30}-${60 + index * 45} days`,
        processingDays: 45 + index * 30,
        cost: country.avgCostUSD + index * 500,
        successRate: Math.max(50, 85 - index * 15 + (details.yearsExperience > 5 ? 10 : 0)),
        requirements: [
            "Valid passport (6+ months validity)",
            index === 0 ? "Job offer from local employer" : "Proof of qualifications",
            "Clean criminal record",
            "Health insurance coverage",
            details.education === "masters" || details.education === "phd" 
                ? "Academic credentials verification" 
                : "Skills assessment",
        ],
        benefits: [
            index === 0 ? "Fast-track processing available" : "Standard processing",
            "Work authorization included",
            "Dependent visa options",
            index < 2 ? "Path to permanent residence" : "Renewable annually",
        ],
        challenges: [
            index === 0 ? "Competitive selection process" : "Quota limitations",
            "Language requirements may apply",
            "Employer sponsorship needed",
        ],
        recommended: index === 0,
    }));
};

const generateStrengths = (details: TravelDetails): string[] => {
    const strengths: string[] = [];

    if (details.education === "masters" || details.education === "phd") {
        strengths.push("Advanced academic qualifications boost eligibility");
    }
    if (details.education === "bachelors") {
        strengths.push("Bachelor's degree meets minimum requirements");
    }
    if (details.yearsExperience >= 5) {
        strengths.push(`${details.yearsExperience}+ years experience is highly valued`);
    }
    if (["technology", "data_science", "healthcare"].includes(details.field)) {
        strengths.push(`${details.field.replace("_", " ")} is in high demand globally`);
    }
    if (details.languages.length > 2) {
        strengths.push("Multilingual skills enhance global mobility");
    }
    if (details.abroadExperience !== "none") {
        strengths.push("Previous international experience is advantageous");
    }
    if (details.budget === "high" || details.budget === "premium") {
        strengths.push("Strong financial capacity supports application");
    }

    return strengths.slice(0, 4);
};

const generateWeaknesses = (details: TravelDetails): string[] => {
    const weaknesses: string[] = [];

    if (details.education === "high_school" || details.education === "diploma") {
        weaknesses.push("Consider additional certifications to strengthen profile");
    }
    if (details.yearsExperience < 3) {
        weaknesses.push("Build more work experience in your field");
    }
    if (details.languages.length === 1) {
        weaknesses.push("Learning local language would improve prospects");
    }
    if (details.abroadExperience === "none") {
        weaknesses.push("Gain some international exposure if possible");
    }
    if (details.budget === "low") {
        weaknesses.push("Budget constraints may limit visa options");
    }

    return weaknesses.slice(0, 3);
};

const generateRecommendations = (countryCode: string, details: TravelDetails): string[] => {
    const country = countryData[countryCode];
    const recs: string[] = [];

    recs.push(`Start job search on ${country?.name || "target country"}'s official job portals 3-6 months before visa application`);
    recs.push("Get all educational documents authenticated and translated if needed");
    
    if (details.field === "technology") {
        recs.push("Build a strong GitHub/portfolio showcasing your technical skills");
    }
    if (details.languages.length === 1) {
        recs.push("Consider taking language certification tests (IELTS, TEF, etc.)");
    }
    recs.push("Connect with immigration consultants specializing in " + (country?.name || "your target country"));
    recs.push("Join expat communities to learn from others' experiences");

    return recs.slice(0, 4);
};

const generateNextSteps = (countryCode: string, details: TravelDetails) => {
    return [
        { step: 1, action: "Research and select specific visa category", timeline: "This week" },
        { step: 2, action: "Gather required documents and certifications", timeline: "2-4 weeks" },
        { step: 3, action: "Begin job search / secure sponsoring employer", timeline: "1-3 months" },
        { step: 4, action: "Submit visa application with all documents", timeline: "Month 3-4" },
        { step: 5, action: "Prepare for potential interview / biometrics", timeline: "Month 4-5" },
        { step: 6, action: "Receive decision and plan relocation", timeline: "Month 5-6" },
    ];
};

export default function ExploreCountriesPage() {
    // State management
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<"map" | "flying" | "form" | "results">("map");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [travelDetails, setTravelDetails] = useState<TravelDetails | null>(null);

    // Handlers
    const handleCountrySelect = useCallback((code: string | null) => {
        setSelectedCountry(code);
        if (code) {
            // Show airplane animation first
            setCurrentStep("flying");
        }
    }, []);

    const handleFlightComplete = useCallback(() => {
        setCurrentStep("form");
    }, []);

    const handleCountryHover = useCallback((code: string | null) => {
        setHoveredCountry(code);
    }, []);

    const handleFormSubmit = async (details: TravelDetails) => {
        if (!selectedCountry) return;

        setTravelDetails(details);
        setIsAnalyzing(true);

        try {
            const result = await generateAIAnalysis(selectedCountry, details);
            setAnalysisResult(result);
            setCurrentStep("results");
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBackToMap = () => {
        setCurrentStep("map");
        setSelectedCountry(null);
        setAnalysisResult(null);
    };

    const handleBackToForm = () => {
        setCurrentStep("form");
        setAnalysisResult(null);
    };

    const handleReset = () => {
        setCurrentStep("map");
        setSelectedCountry(null);
        setAnalysisResult(null);
        setTravelDetails(null);
    };

    // Get selected country data
    const selectedCountryData = selectedCountry ? countryData[selectedCountry] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 overflow-hidden">
            {/* Airplane Animation Overlay */}
            <AnimatePresence>
                {currentStep === "flying" && selectedCountryData && (
                    <AirplaneLoader
                        fromCountry="Home"
                        toCountry={selectedCountryData.name}
                        toFlag={selectedCountryData.flag}
                        onComplete={handleFlightComplete}
                    />
                )}
            </AnimatePresence>

            {/* Animated Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-[120px]" />
                
                {/* Animated stars */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="relative z-20 container mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        {currentStep !== "map" && currentStep !== "flying" && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={currentStep === "form" ? handleBackToMap : handleBackToForm}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </motion.button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Globe2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Explore Countries</h1>
                                <p className="text-xs text-white/50">Powered by AI</p>
                            </div>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="hidden md:flex items-center gap-4">
                        {[
                            { id: "map", label: "Select Country", icon: MapPin },
                            { id: "form", label: "Your Details", icon: Compass },
                            { id: "results", label: "AI Analysis", icon: Sparkles },
                        ].map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id || (currentStep === "flying" && step.id === "map");
                            const isPast = 
                                (currentStep === "form" && step.id === "map") ||
                                (currentStep === "flying" && step.id === "map") ||
                                (currentStep === "results" && step.id !== "results");

                            return (
                                <React.Fragment key={step.id}>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                                        isActive
                                            ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/50"
                                            : isPast
                                            ? "bg-white/10 border border-white/10"
                                            : "opacity-40"
                                    }`}>
                                        <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-white/60"}`} />
                                        <span className={`text-sm ${isActive ? "text-white font-medium" : "text-white/60"}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <ChevronRight className="w-4 h-4 text-white/30" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </motion.div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 pb-12">
                <AnimatePresence mode="wait">
                    {/* Step 1: World Map */}
                    {currentStep === "map" && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Hero Section */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                        <span className="text-white/80 text-sm font-medium">AI-Powered Immigration Insights</span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                        <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                                            Where do you want to go?
                                        </span>
                                    </h1>
                                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                                        Click on any highlighted country on the map to start your personalized visa journey
                                    </p>
                                </motion.div>
                            </div>

                            {/* Map Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="relative w-full h-[60vh] min-h-[500px] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/30"
                            >
                                <WorldMapExplorer
                                    selectedCountry={selectedCountry}
                                    onCountrySelect={handleCountrySelect}
                                    hoveredCountry={hoveredCountry}
                                    onCountryHover={handleCountryHover}
                                />
                            </motion.div>

                            {/* Popular Destinations Quick Links */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8"
                            >
                                <h3 className="text-center text-white/60 text-sm mb-4">Popular Destinations</h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {Object.entries(countryData)
                                        .filter(([_, data]) => data.popular)
                                        .slice(0, 8)
                                        .map(([code, data]) => (
                                            <motion.button
                                                key={code}
                                                onClick={() => handleCountrySelect(code)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/30 transition-all group"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="text-xl">{data.flag}</span>
                                                <span className="text-white/80 group-hover:text-white transition-colors">
                                                    {data.name}
                                                </span>
                                                <div className="flex items-center text-xs text-white/40">
                                                    <Star className="w-3 h-3 mr-0.5" />
                                                </div>
                                            </motion.button>
                                        ))}
                                </div>
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="grid md:grid-cols-3 gap-4 mt-12"
                            >
                                {[
                                    {
                                        icon: Zap,
                                        title: "Instant Analysis",
                                        description: "Get visa requirements and costs in seconds",
                                        color: "from-amber-500 to-orange-500",
                                    },
                                    {
                                        icon: Sparkles,
                                        title: "AI-Powered",
                                        description: "Personalized recommendations based on your profile",
                                        color: "from-purple-500 to-pink-500",
                                    },
                                    {
                                        icon: Globe2,
                                        title: "25+ Countries",
                                        description: "Coverage across major immigration destinations",
                                        color: "from-blue-500 to-cyan-500",
                                    },
                                ].map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                                        <p className="text-white/60 text-sm">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Step 2: Details Form */}
                    {currentStep === "form" && selectedCountryData && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TravelDetailsForm
                                selectedCountry={selectedCountry}
                                countryName={selectedCountryData.name}
                                countryFlag={selectedCountryData.flag}
                                onSubmit={handleFormSubmit}
                                isLoading={isAnalyzing}
                            />
                        </motion.div>
                    )}

                    {/* Step 3: Results */}
                    {currentStep === "results" && analysisResult && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <VisaAnalysisResults
                                result={analysisResult}
                                onBack={handleBackToForm}
                                onReset={handleReset}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative z-10 container mx-auto px-4 py-8 text-center">
                <p className="text-white/40 text-sm">
                    Data for informational purposes only. Always verify with official immigration authorities.
                </p>
            </footer>
        </div>
    );
}
