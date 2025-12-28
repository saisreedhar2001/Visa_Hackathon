"use client";

import { motion } from "framer-motion";
import { PathStep } from "@/lib/api/analysis";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, FileCheck, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PathStepperProps {
    steps: PathStep[];
}

// Country code to flag emoji mapping
const getCountryFlag = (code: string): string => {
    const flags: Record<string, string> = {
        CA: "🇨🇦",
        DE: "🇩🇪",
        US: "🇺🇸",
        GB: "🇬🇧",
        AU: "🇦🇺",
        SG: "🇸🇬",
        NL: "🇳🇱",
        AE: "🇦🇪",
        PT: "🇵🇹",
        JP: "🇯🇵",
    };
    return flags[code] || "🌍";
};

export function PathStepper({ steps }: PathStepperProps) {
    return (
        <div className="relative">
            {/* Steps */}
            <div className="space-y-0">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-500/30" />
                        )}

                        <div className="flex gap-4">
                            {/* Step Number & Flag */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full bg-purple-500/10 border-2 border-purple-500 flex flex-col items-center justify-center">
                                    <span className="text-2xl">{getCountryFlag(step.countryCode)}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="mt-2 mb-2">
                                        <Plane className="w-4 h-4 text-white/40 rotate-90" />
                                    </div>
                                )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 pb-8">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 text-white">
                                                Step {step.order}: {step.country}
                                            </h4>
                                            <Badge className="mt-1 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                {step.visaType}
                                            </Badge>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="flex items-center gap-1 text-white/60">
                                                <Clock className="w-3 h-3" />
                                                {step.duration}
                                            </div>
                                            <div className="flex items-center gap-1 text-white/60 mt-1">
                                                <DollarSign className="w-3 h-3" />
                                                {formatCurrency(step.estimatedCost, step.currency)}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/60 mb-3">
                                        {step.purpose}
                                    </p>

                                    {/* Requirements Preview */}
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-white/40">
                                            Key Requirements:
                                        </span>
                                        <ul className="text-xs text-white/60 space-y-0.5">
                                            {step.requirements.slice(0, 3).map((req, i) => (
                                                <li key={i} className="flex items-center gap-1">
                                                    <FileCheck className="w-3 h-3 text-emerald-400" />
                                                    {req}
                                                </li>
                                            ))}
                                            {step.requirements.length > 3 && (
                                                <li className="text-purple-400">
                                                    +{step.requirements.length - 3} more requirements
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Final Destination Marker */}
                <div className="flex gap-4">
                    <div className="w-14 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white font-bold">✓</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold text-emerald-400">
                            Permanent Residence / Goal Achieved
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
