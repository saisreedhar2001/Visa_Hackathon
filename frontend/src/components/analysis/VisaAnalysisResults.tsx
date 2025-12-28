"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
    FileText,
    ArrowRight,
    Sparkles,
    Shield,
    TrendingUp,
    Calendar,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Target,
    Plane,
    X,
    ArrowLeft,
    Star,
    Zap,
    Info,
    Download,
    Loader2,
} from "lucide-react";

export interface VisaOption {
    name: string;
    type: string;
    processingTime: string;
    processingDays: number;
    cost: number;
    successRate: number;
    requirements: string[];
    benefits: string[];
    challenges: string[];
    recommended: boolean;
}

export interface AIAnalysisResult {
    countryName: string;
    countryFlag: string;
    countryCode: string;
    overallScore: number;
    estimatedTotalCost: { min: number; max: number };
    estimatedTimeline: { min: string; max: string };
    visaOptions: VisaOption[];
    profileStrengths: string[];
    profileWeaknesses: string[];
    recommendations: string[];
    nextSteps: { step: number; action: string; timeline: string }[];
    riskLevel: "low" | "medium" | "high";
    successProbability: number;
}

interface VisaAnalysisResultsProps {
    result: AIAnalysisResult;
    onBack: () => void;
    onReset: () => void;
}

const VisaAnalysisResults: React.FC<VisaAnalysisResultsProps> = ({
    result,
    onBack,
    onReset,
}) => {
    const [expandedVisa, setExpandedVisa] = useState<string | null>(
        result.visaOptions.find((v) => v.recommended)?.name || null
    );
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            // Dynamic import to avoid SSR issues
            const { jsPDF } = await import("jspdf");
            
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            let yPos = 20;

            // Helper function to add text with word wrap
            const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
                const lines = pdf.splitTextToSize(text, maxWidth);
                lines.forEach((line: string) => {
                    if (yPos > 270) {
                        pdf.addPage();
                        yPos = 20;
                    }
                    pdf.text(line, x, yPos);
                    yPos += lineHeight;
                });
                return yPos;
            };

            // Title
            pdf.setFontSize(24);
            pdf.setTextColor(99, 102, 241);
            pdf.text(`Visa Analysis Report: ${result.countryName}`, pageWidth / 2, yPos, { align: "center" });
            yPos += 15;

            // Success Rate
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Success Probability: ${result.successProbability}%`, 20, yPos);
            yPos += 8;
            pdf.text(`Risk Level: ${result.riskLevel.toUpperCase()}`, 20, yPos);
            yPos += 8;
            pdf.text(`Match Score: ${result.overallScore}/100`, 20, yPos);
            yPos += 15;

            // Cost & Timeline
            pdf.setFontSize(12);
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Estimated Cost: $${result.estimatedTotalCost.min.toLocaleString()} - $${result.estimatedTotalCost.max.toLocaleString()}`, 20, yPos);
            yPos += 7;
            pdf.text(`Timeline: ${result.estimatedTimeline.min} - ${result.estimatedTimeline.max}`, 20, yPos);
            yPos += 15;

            // Profile Strengths
            pdf.setFontSize(14);
            pdf.setTextColor(34, 197, 94);
            pdf.text("Your Strengths:", 20, yPos);
            yPos += 8;
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            result.profileStrengths.forEach(s => {
                addWrappedText(`• ${s}`, 25, yPos, pageWidth - 45);
            });
            yPos += 5;

            // Profile Weaknesses
            pdf.setFontSize(14);
            pdf.setTextColor(245, 158, 11);
            pdf.text("Areas to Address:", 20, yPos);
            yPos += 8;
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            result.profileWeaknesses.forEach(w => {
                addWrappedText(`• ${w}`, 25, yPos, pageWidth - 45);
            });
            yPos += 10;

            // Visa Options
            pdf.setFontSize(14);
            pdf.setTextColor(99, 102, 241);
            pdf.text("Visa Pathways:", 20, yPos);
            yPos += 10;

            result.visaOptions.forEach((visa, index) => {
                if (yPos > 250) {
                    pdf.addPage();
                    yPos = 20;
                }
                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`${index + 1}. ${visa.name} ${visa.recommended ? "(RECOMMENDED)" : ""}`, 20, yPos);
                yPos += 6;
                pdf.setFontSize(10);
                pdf.setTextColor(80, 80, 80);
                pdf.text(`   Type: ${visa.type}`, 20, yPos);
                yPos += 5;
                pdf.text(`   Processing: ${visa.processingTime}`, 20, yPos);
                yPos += 5;
                pdf.text(`   Cost: $${visa.cost.toLocaleString()}`, 20, yPos);
                yPos += 5;
                pdf.text(`   Success Rate: ${visa.successRate}%`, 20, yPos);
                yPos += 10;
            });

            // Next Steps
            if (yPos > 220) {
                pdf.addPage();
                yPos = 20;
            }
            pdf.setFontSize(14);
            pdf.setTextColor(59, 130, 246);
            pdf.text("Your Next Steps:", 20, yPos);
            yPos += 10;
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            result.nextSteps.forEach(step => {
                addWrappedText(`${step.step}. ${step.action} (${step.timeline})`, 20, yPos, pageWidth - 40);
                yPos += 2;
            });

            // Recommendations
            yPos += 5;
            if (yPos > 220) {
                pdf.addPage();
                yPos = 20;
            }
            pdf.setFontSize(14);
            pdf.setTextColor(168, 85, 247);
            pdf.text("AI Recommendations:", 20, yPos);
            yPos += 10;
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            result.recommendations.forEach(rec => {
                addWrappedText(`• ${rec}`, 20, yPos, pageWidth - 40);
                yPos += 2;
            });

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text("Generated by Global Mobility Intelligence Platform", pageWidth / 2, 285, { align: "center" });
            pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 290, { align: "center" });

            // Save the PDF
            pdf.save(`visa-analysis-${result.countryName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case "low":
                return "text-emerald-400 bg-emerald-500/20";
            case "medium":
                return "text-amber-400 bg-amber-500/20";
            case "high":
                return "text-red-400 bg-red-500/20";
            default:
                return "text-gray-400 bg-gray-500/20";
        }
    };

    const getSuccessColor = (rate: number) => {
        if (rate >= 70) return "from-emerald-500 to-emerald-400";
        if (rate >= 50) return "from-amber-500 to-amber-400";
        return "from-red-500 to-red-400";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header with Country Info */}
            <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </motion.button>
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl shadow-xl shadow-purple-500/30">
                            {result.countryFlag}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-yellow-400 font-medium">AI Analysis Complete</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">{result.countryName}</h1>
                            <p className="text-white/60">Your personalized immigration roadmap</p>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <svg className="w-28 h-28 transform -rotate-90">
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="48"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="56"
                                    cy="56"
                                    r="48"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(result.successProbability / 100) * 301.59} 301.59`}
                                    initial={{ strokeDasharray: "0 301.59" }}
                                    animate={{ strokeDasharray: `${(result.successProbability / 100) * 301.59} 301.59` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    className="text-3xl font-bold text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {result.successProbability}%
                                </motion.span>
                                <span className="text-xs text-white/60">Success Rate</span>
                            </div>
                        </div>

                        <div className={`px-4 py-2 rounded-full ${getRiskColor(result.riskLevel)} flex items-center gap-2`}>
                            <Shield className="w-4 h-4" />
                            <span className="font-medium capitalize">{result.riskLevel} Risk</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-sm font-medium">Est. Total Cost</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            ${result.estimatedTotalCost.min.toLocaleString()} - ${result.estimatedTotalCost.max.toLocaleString()}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">Timeline</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {result.estimatedTimeline.min} - {result.estimatedTimeline.max}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">Visa Options</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {result.visaOptions.length} Available
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                        <div className="flex items-center gap-2 text-amber-400 mb-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium">Match Score</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {result.overallScore}/100
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Profile Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-emerald-900/30 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6"
                >
                    <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                        Your Strengths
                    </h3>
                    <ul className="space-y-3">
                        {result.profileStrengths.map((strength, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-start gap-3 text-white/80"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                {strength}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Areas to Improve */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-amber-900/30 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-6"
                >
                    <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400 mb-4">
                        <Lightbulb className="w-5 h-5" />
                        Areas to Address
                    </h3>
                    <ul className="space-y-3">
                        {result.profileWeaknesses.map((weakness, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-start gap-3 text-white/80"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                {weakness}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </div>

            {/* Visa Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8"
            >
                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Visa Pathways
                    <span className="text-sm font-normal text-white/50 ml-2">
                        Click to expand details
                    </span>
                </h3>

                <div className="space-y-4">
                    {result.visaOptions.map((visa, index) => (
                        <motion.div
                            key={visa.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`rounded-2xl border overflow-hidden transition-all ${
                                visa.recommended
                                    ? "border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
                                    : "border-white/10 bg-white/5"
                            }`}
                        >
                            <button
                                onClick={() => setExpandedVisa(expandedVisa === visa.name ? null : visa.name)}
                                className="w-full p-5 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-4">
                                    {visa.recommended && (
                                        <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-lg">{visa.name}</h4>
                                            {visa.recommended && (
                                                <span className="text-xs text-purple-400 font-medium">RECOMMENDED</span>
                                            )}
                                        </div>
                                        <p className="text-white/60 text-sm">{visa.type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-white/60 text-xs">Processing</p>
                                        <p className="text-white font-medium">{visa.processingTime}</p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-white/60 text-xs">Cost</p>
                                        <p className="text-emerald-400 font-medium">${visa.cost.toLocaleString()}</p>
                                    </div>
                                    <div className="w-16">
                                        <p className="text-white/60 text-xs text-right">Success</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${getSuccessColor(visa.successRate)} rounded-full`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${visa.successRate}%` }}
                                                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                                />
                                            </div>
                                            <span className="text-white font-bold text-sm">{visa.successRate}%</span>
                                        </div>
                                    </div>
                                    {expandedVisa === visa.name ? (
                                        <ChevronUp className="w-5 h-5 text-white/60" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-white/60" />
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedVisa === visa.name && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 border-t border-white/10 pt-4">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {/* Requirements */}
                                                <div>
                                                    <h5 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                        Requirements
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {visa.requirements.map((req, i) => (
                                                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                                {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Benefits */}
                                                <div>
                                                    <h5 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        Benefits
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {visa.benefits.map((benefit, i) => (
                                                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                                                {benefit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Challenges */}
                                                <div>
                                                    <h5 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                        Challenges
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {visa.challenges.map((challenge, i) => (
                                                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                                                {challenge}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-blue-900/30 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 lg:p-8"
            >
                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                    <Target className="w-5 h-5 text-blue-400" />
                    Your Next Steps
                </h3>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

                    <div className="space-y-6">
                        {result.nextSteps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className="relative flex items-start gap-6 pl-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 z-10 shadow-lg shadow-purple-500/30">
                                    {step.step}
                                </div>
                                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-white">{step.action}</h4>
                                        <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                                            {step.timeline}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-purple-900/30 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 lg:p-8"
            >
                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Recommendations
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {result.recommendations.map((rec, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-white/80 text-sm">{rec}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <motion.button
                    onClick={onReset}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plane className="w-5 h-5" />
                    Explore Another Country
                </motion.button>
                <motion.button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all disabled:opacity-70"
                    whileHover={{ scale: isDownloading ? 1 : 1.02 }}
                    whileTap={{ scale: isDownloading ? 1 : 0.98 }}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download Full Report
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default VisaAnalysisResults;
