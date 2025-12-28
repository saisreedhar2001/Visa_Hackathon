"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Clock, DollarSign, CheckCircle2, AlertTriangle, Sparkles, MapPin, Plane } from "lucide-react";

interface PathStep {
    order: number;
    country: string;
    countryCode: string;
    visaType: string;
    duration: string;
    purpose: string;
    requirements: string[];
    estimatedCost: number;
    currency: string;
}

interface DynamicPath {
    id: string;
    rank: number;
    name: string;
    description: string;
    steps: PathStep[];
    totalDuration: string;
    overallScore: number;
    approvalProbability: number;
    riskLevel: "low" | "medium" | "high";
    whyThisPath: string;
    recommendation: string;
}

interface InteractivePathMapProps {
    paths: DynamicPath[];
    onPathSelect?: (path: DynamicPath) => void;
}

const countryFlags: Record<string, string> = {
    CA: "🇨🇦", US: "🇺🇸", UK: "🇬🇧", GB: "🇬🇧", AU: "🇦🇺", DE: "🇩🇪",
    NL: "🇳🇱", SG: "🇸🇬", AE: "🇦🇪", JP: "🇯🇵", PT: "🇵🇹", IN: "🇮🇳",
};

const countryColors: Record<string, { bg: string; border: string; glow: string }> = {
    CA: { bg: "from-red-500 to-red-600", border: "border-red-400", glow: "shadow-red-500/50" },
    US: { bg: "from-blue-500 to-blue-600", border: "border-blue-400", glow: "shadow-blue-500/50" },
    UK: { bg: "from-indigo-500 to-indigo-600", border: "border-indigo-400", glow: "shadow-indigo-500/50" },
    GB: { bg: "from-indigo-500 to-indigo-600", border: "border-indigo-400", glow: "shadow-indigo-500/50" },
    AU: { bg: "from-yellow-500 to-yellow-600", border: "border-yellow-400", glow: "shadow-yellow-500/50" },
    DE: { bg: "from-amber-500 to-amber-600", border: "border-amber-400", glow: "shadow-amber-500/50" },
    NL: { bg: "from-orange-500 to-orange-600", border: "border-orange-400", glow: "shadow-orange-500/50" },
    SG: { bg: "from-rose-500 to-rose-600", border: "border-rose-400", glow: "shadow-rose-500/50" },
    AE: { bg: "from-emerald-500 to-emerald-600", border: "border-emerald-400", glow: "shadow-emerald-500/50" },
    JP: { bg: "from-pink-500 to-pink-600", border: "border-pink-400", glow: "shadow-pink-500/50" },
    PT: { bg: "from-green-500 to-green-600", border: "border-green-400", glow: "shadow-green-500/50" },
    IN: { bg: "from-orange-400 to-green-500", border: "border-orange-400", glow: "shadow-orange-500/50" },
};

const getRiskStyle = (risk: string) => {
    switch (risk) {
        case "low": return { bg: "bg-emerald-500", text: "text-emerald-500", label: "LOW RISK" };
        case "medium": return { bg: "bg-amber-500", text: "text-amber-500", label: "MEDIUM RISK" };
        case "high": return { bg: "bg-red-500", text: "text-red-500", label: "HIGH RISK" };
        default: return { bg: "bg-gray-500", text: "text-gray-500", label: "UNKNOWN" };
    }
};

export function InteractivePathMap({ paths, onPathSelect }: InteractivePathMapProps) {
    const [selectedPath, setSelectedPath] = useState<DynamicPath | null>(null);
    const [selectedStep, setSelectedStep] = useState<PathStep | null>(null);
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePathClick = (path: DynamicPath) => {
        setSelectedPath(path);
        onPathSelect?.(path);
    };

    const handleStepClick = (step: PathStep, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStep(step);
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>
                {/* Glowing orbs */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/80 text-sm font-medium">AI-Generated Immigration Pathways</span>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Journey Map</h2>
                    <p className="text-white/60">Click on any path to explore the details</p>
                </div>

                {/* Paths Grid */}
                <div className="space-y-6">
                    {paths.map((path, pathIndex) => {
                        const riskStyle = getRiskStyle(path.riskLevel);
                        const isHovered = hoveredPath === path.id;
                        const isTopPath = pathIndex === 0;

                        return (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pathIndex * 0.15 }}
                                className="relative"
                                onMouseEnter={() => setHoveredPath(path.id)}
                                onMouseLeave={() => setHoveredPath(null)}
                            >
                                {/* Top Path Badge */}
                                {isTopPath && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-3 left-6 z-20"
                                    >
                                        <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-black shadow-lg shadow-yellow-500/30">
                                            ⭐ TOP RECOMMENDED
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div
                                    className={`relative backdrop-blur-md rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                                        isTopPath 
                                            ? 'bg-gradient-to-r from-white/15 to-white/5 border-yellow-400/50' 
                                            : 'bg-white/10 border-white/20 hover:border-white/40'
                                    } ${isHovered ? 'shadow-2xl scale-[1.02]' : ''}`}
                                    onClick={() => handlePathClick(path)}
                                    whileHover={{ y: -4 }}
                                >
                                    {/* Path Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{path.name}</h3>
                                                <p className="text-white/60 text-sm">{path.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-3xl font-bold text-white">
                                                    {path.overallScore}<span className="text-lg text-white/50">%</span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${riskStyle.bg} text-white`}>
                                                    {riskStyle.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Steps Flow */}
                                    <div className="px-6 pb-6">
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {/* Starting Point */}
                                            <motion.div
                                                className="flex-shrink-0 flex flex-col items-center"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: pathIndex * 0.15 + 0.2 }}
                                            >
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30 border-2 border-white/30">
                                                    🇮🇳
                                                </div>
                                                <span className="text-white/60 text-xs mt-2 font-medium">START</span>
                                            </motion.div>

                                            {path.steps.map((step, stepIndex) => {
                                                const colors = countryColors[step.countryCode] || countryColors.US;
                                                return (
                                                    <div key={stepIndex} className="flex items-center">
                                                        {/* Animated Connection Line */}
                                                        <div className="relative w-16 h-1">
                                                            <div className="absolute inset-0 bg-white/20 rounded-full" />
                                                            <motion.div
                                                                className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-full`}
                                                                initial={{ scaleX: 0 }}
                                                                animate={{ scaleX: 1 }}
                                                                transition={{ delay: pathIndex * 0.15 + stepIndex * 0.1 + 0.3, duration: 0.5 }}
                                                                style={{ transformOrigin: 'left' }}
                                                            />
                                                            <motion.div
                                                                className="absolute top-1/2 -translate-y-1/2"
                                                                initial={{ x: 0, opacity: 0 }}
                                                                animate={{ x: [0, 64, 0], opacity: [0, 1, 0] }}
                                                                transition={{ delay: pathIndex * 0.15 + stepIndex * 0.1 + 0.5, duration: 2, repeat: Infinity }}
                                                            >
                                                                <Plane className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        </div>

                                                        {/* Country Node */}
                                                        <motion.button
                                                            className={`flex-shrink-0 relative group`}
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ delay: pathIndex * 0.15 + stepIndex * 0.1 + 0.4, type: "spring" }}
                                                            onClick={(e) => handleStepClick(step, e)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.bg} flex flex-col items-center justify-center shadow-lg ${colors.glow} border-2 border-white/40 transition-all duration-300 group-hover:shadow-2xl`}>
                                                                <span className="text-3xl mb-1">{countryFlags[step.countryCode] || "🌍"}</span>
                                                                <span className="text-white text-xs font-bold">{step.countryCode}</span>
                                                            </div>
                                                            {/* Tooltip */}
                                                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                                                                <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap border border-white/20">
                                                                    <div className="font-bold">{step.country}</div>
                                                                    <div className="text-white/70">{step.visaType}</div>
                                                                    <div className="text-white/50">{step.duration}</div>
                                                                </div>
                                                            </div>
                                                            {/* Step Number Badge */}
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-800 shadow-md">
                                                                {step.order}
                                                            </div>
                                                        </motion.button>
                                                    </div>
                                                );
                                            })}

                                            {/* Success Destination */}
                                            <div className="flex items-center">
                                                <div className="w-16 h-1 bg-gradient-to-r from-white/20 to-emerald-500 rounded-full" />
                                                <motion.div
                                                    className="flex-shrink-0 flex flex-col items-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: pathIndex * 0.15 + path.steps.length * 0.1 + 0.5 }}
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white/30">
                                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                                    </div>
                                                    <span className="text-emerald-400 text-xs mt-2 font-bold">SUCCESS</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="px-6 pb-6 flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Clock className="w-4 h-4" />
                                            <span>{path.totalDuration}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <DollarSign className="w-4 h-4" />
                                            <span>${path.steps.reduce((sum, s) => sum + s.estimatedCost, 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{path.approvalProbability}% approval rate</span>
                                        </div>
                                    </div>

                                    {/* Expand hint */}
                                    <div className="absolute bottom-4 right-4">
                                        <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Step Detail Modal */}
            <AnimatePresence>
                {selectedStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedStep(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-lg w-full border border-white/20 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${countryColors[selectedStep.countryCode]?.bg || 'from-blue-500 to-blue-600'} flex items-center justify-center text-3xl`}>
                                        {countryFlags[selectedStep.countryCode] || "🌍"}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedStep.country}</h3>
                                        <p className="text-white/60">{selectedStep.visaType}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStep(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-white/60 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">Duration</span>
                                        </div>
                                        <p className="text-white font-semibold">{selectedStep.duration}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-white/60 mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Est. Cost</span>
                                        </div>
                                        <p className="text-white font-semibold">${selectedStep.estimatedCost.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-white/60 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">Purpose</span>
                                    </div>
                                    <p className="text-white">{selectedStep.purpose}</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-white/60 text-sm mb-3">Requirements</h4>
                                    <ul className="space-y-2">
                                        {selectedStep.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2 text-white text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
