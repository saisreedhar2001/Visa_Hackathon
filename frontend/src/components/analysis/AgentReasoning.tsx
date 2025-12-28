"use client";

import { motion } from "framer-motion";
import { AgentStep } from "@/lib/store/analysisStore";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2, Brain } from "lucide-react";

interface AgentReasoningProps {
    steps: AgentStep[];
}

export function AgentReasoning({ steps }: AgentReasoningProps) {
    return (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="text-xl font-semibold mb-4 text-center text-white">
                    AI Agents Analyzing Your Profile
                </h2>
                <p className="text-center text-white/50 mb-8">
                    Multiple specialized agents are collaborating to find your best pathways
                </p>

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-start gap-4 p-4 rounded-xl transition-colors border ${
                                step.status === "running"
                                    ? "bg-purple-500/10 border-purple-500/30"
                                    : step.status === "complete"
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : "bg-white/5 border-white/10"
                            }`}
                        >
                            {/* Status Icon */}
                            <div className="mt-0.5">
                                {step.status === "complete" && (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                )}
                                {step.status === "running" && (
                                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                )}
                                {step.status === "pending" && (
                                    <Circle className="w-6 h-6 text-white/30" />
                                )}
                                {step.status === "error" && (
                                    <Circle className="w-6 h-6 text-red-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{step.agent}</span>
                                    {step.status === "running" && (
                                        <span className="text-xs text-purple-400 thinking-dots">
                                            Thinking
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-white/60 mt-1">
                                    {step.description}
                                </p>

                                {/* Running Animation */}
                                {step.status === "running" && (
                                    <motion.div
                                        className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                            animate={{
                                                x: ["0%", "100%", "0%"],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                            style={{ width: "30%" }}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-sm text-white/40 mt-8">
                    This typically takes 10-30 seconds as agents collaborate
                </p>
            </CardContent>
        </Card>
    );
}
