"use client";

import { motion } from "framer-motion";
import { AnalysisResponse, RankedPath } from "@/lib/api/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { PathStepper } from "@/components/visualization/PathStepper";
import { ScoreGauge } from "@/components/visualization/ScoreGauge";
import { CitationsPanel } from "@/components/results/CitationsPanel";
import { 
    CheckCircle, 
    AlertTriangle, 
    TrendingUp, 
    Calendar, 
    DollarSign,
    FileText,
    ArrowRight
} from "lucide-react";
import { getScoreColor, getRiskColor, formatCurrency } from "@/lib/utils";

interface AnalysisResultsProps {
    result: AnalysisResponse;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
    return (
        <div className="space-y-8">
            {/* Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Profile Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-400">
                                    <CheckCircle className="w-4 h-4" />
                                    Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {result.profileSummary.strengths.map((strength, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2 text-white/80">
                                            <span className="text-emerald-400 mt-1">•</span>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Weaknesses */}
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2 text-amber-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    Areas to Improve
                                </h4>
                                <ul className="space-y-2">
                                    {result.profileSummary.weaknesses.map((weakness, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2 text-white/80">
                                            <span className="text-amber-400 mt-1">•</span>
                                            {weakness}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Eligible Visas */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="font-medium mb-3 text-white">You're Eligible For</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.profileSummary.eligibleVisas.map((visa, i) => (
                                    <Badge key={i} className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {visa.country}: {visa.visaTypes.join(", ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Ranked Paths */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-semibold mb-4 text-white">Recommended Pathways</h2>
                <Accordion type="single" collapsible className="space-y-4">
                    {result.rankedPaths.map((path, index) => (
                        <AccordionItem
                            key={path.id}
                            value={path.id}
                            className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-xl"
                        >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5">
                                <div className="flex items-center gap-4 w-full">
                                    {/* Rank Badge */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                        index === 0 
                                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                                            : "bg-white/10 text-white/80"
                                    }`}>
                                        #{path.rank}
                                    </div>

                                    {/* Path Info */}
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-white">{path.name}</h3>
                                        <p className="text-sm text-white/50">
                                            {path.description}
                                        </p>
                                    </div>

                                    {/* Scores */}
                                    <div className="flex items-center gap-4 mr-4">
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(path.overallScore)}`}>
                                                {path.overallScore}%
                                            </div>
                                            <div className="text-xs text-white/50">Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${getScoreColor(path.approvalProbability)}`}>
                                                {path.approvalProbability}%
                                            </div>
                                            <div className="text-xs text-white/50">Approval</div>
                                        </div>
                                        <Badge className={getRiskColor(path.riskLevel)}>
                                            {path.riskLevel} risk
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                {/* Path Stepper */}
                                <div className="mt-4">
                                    <PathStepper steps={path.steps} />
                                </div>

                                {/* Why This Path */}
                                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="font-medium mb-2 text-white">Why This Path?</h4>
                                    <p className="text-sm text-white/60">
                                        {path.whyThisPath}
                                    </p>
                                </div>

                                {/* Recommendation */}
                                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                    <h4 className="font-medium mb-2 text-purple-300">Recommendation</h4>
                                    <p className="text-sm text-white/80">{path.recommendation}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>

            {/* Action Items */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Your Action Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {result.actionItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-semibold text-white">
                                        {item.order}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{item.action}</span>
                                            <Badge className={
                                                item.priority === "high" 
                                                    ? "bg-red-500/20 text-red-300 border-red-500/30" 
                                                    : item.priority === "medium" 
                                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                                                    : "bg-white/10 text-white/60 border-white/20"
                                            }>
                                                {item.priority}
                                            </Badge>
                                        </div>
                                        {item.details && (
                                            <p className="text-sm text-white/60 mt-1">
                                                {item.details}
                                            </p>
                                        )}
                                        {item.deadline && (
                                            <p className="text-xs text-white/40 mt-2">
                                                Suggested deadline: {item.deadline}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Citations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <CitationsPanel citations={result.citations} />
            </motion.div>

            {/* Disclaimer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 bg-white/5 border border-white/10 rounded-xl"
            >
                <p className="text-sm text-white/50">
                    {result.disclaimer}
                </p>
            </motion.div>
        </div>
    );
}
