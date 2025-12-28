"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { AgentReasoning } from "@/components/analysis/AgentReasoning";
import { VisaChatAssistant } from "@/components/chat/VisaChatAssistant";
import { useAnalysisStore } from "@/lib/store/analysisStore";
import { Brain, Zap, Bot, Globe2, Sparkles, MessageSquare } from "lucide-react";

export default function AnalyzePage() {
    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { 
        analysisResult, 
        isAnalyzing, 
        agentSteps,
        analysisMode,
        asyncStatus,
        setAnalysisMode,
        startAnalysis,
        resetAnalysis 
    } = useAnalysisStore();

    return (
        <div className="min-h-screen relative">
            {/* Animated Background Blurs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                    >
                        <Globe2 className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                            Your Global Mobility Journey
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Starts Here
                        </span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        AI agents analyze your profile across multiple countries to find the best 
                        immigration pathways, stepping stones, and strategies tailored to your goals.
                    </p>
                </motion.div>

                {/* Analysis Mode Toggle - Show only when not analyzing */}
                {!analysisResult && !isAnalyzing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                            <button
                                onClick={() => setAnalysisMode("fast")}
                                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                    analysisMode === "fast"
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Chat Mode
                                <span className="text-xs opacity-75 hidden sm:inline">(RAG)</span>
                            </button>
                            <button
                                onClick={() => setAnalysisMode("deep")}
                                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                    analysisMode === "deep"
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Bot className="w-4 h-4" />
                                Deep Mode
                                <span className="text-xs opacity-75 hidden sm:inline">(CrewAI)</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Mode Description */}
                {!analysisResult && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center mb-8"
                    >
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                            analysisMode === "fast"
                                ? "bg-blue-500/10 border-blue-500/30"
                                : "bg-purple-500/10 border-purple-500/30"
                        }`}>
                            {analysisMode === "fast" ? (
                                <>
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-white/70">
                                        <span className="font-medium text-blue-400">Chat Mode:</span>{" "}
                                        AI-powered visa assistant with RAG knowledge base
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-white/70">
                                        <span className="font-medium text-purple-400">Deep Mode:</span>{" "}
                                        Multi-agent CrewAI analysis for comprehensive results (~30-60 seconds)
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Fast Mode - Show Chat Interface */}
                    {!analysisResult && !isAnalyzing && analysisMode === "fast" && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <VisaChatAssistant />
                        </motion.div>
                    )}

                    {/* Deep Mode - Show Profile Form */}
                    {!analysisResult && !isAnalyzing && analysisMode === "deep" && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <ProfileForm onSubmit={startAnalysis} />
                        </motion.div>
                    )}

                    {isAnalyzing && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            {/* Show mode badge while analyzing */}
                            <div className="text-center mb-6">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                                    analysisMode === "fast" 
                                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                }`}>
                                    {analysisMode === "fast" ? (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Fast Mode (Groq)
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-4 h-4" />
                                            Deep Mode (CrewAI)
                                        </>
                                    )}
                                </span>
                                {asyncStatus && (
                                    <p className="text-sm text-white/50 mt-3">{asyncStatus}</p>
                                )}
                            </div>
                            <AgentReasoning steps={agentSteps} />
                        </motion.div>
                    )}

                    {analysisResult && !isAnalyzing && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-white">Your Analysis Results</h2>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                        analysisMode === "fast" 
                                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                    }`}>
                                        {analysisMode === "fast" ? (
                                            <>
                                                <Zap className="w-3 h-3" />
                                                Groq
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="w-3 h-3" />
                                                CrewAI
                                            </>
                                        )}
                                    </span>
                                </div>
                                <button
                                    onClick={resetAnalysis}
                                    className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
                                >
                                    ← Start New Analysis
                                </button>
                            </div>
                            <AnalysisResults result={analysisResult} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
