"use client";

import { motion } from "framer-motion";
import { getScoreColor } from "@/lib/utils";

interface ScoreGaugeProps {
    score: number;
    label?: string;
    size?: "sm" | "md" | "lg";
}

export function ScoreGauge({ score, label, size = "md" }: ScoreGaugeProps) {
    const sizes = {
        sm: { width: 60, height: 60, strokeWidth: 6, fontSize: "text-lg" },
        md: { width: 100, height: 100, strokeWidth: 8, fontSize: "text-2xl" },
        lg: { width: 140, height: 140, strokeWidth: 10, fontSize: "text-4xl" },
    };

    const { width, height, strokeWidth, fontSize } = sizes[size];
    const radius = (width - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width, height }}>
                {/* Background Circle */}
                <svg
                    width={width}
                    height={height}
                    className="transform -rotate-90"
                >
                    <circle
                        cx={width / 2}
                        cy={height / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted"
                    />
                    <motion.circle
                        cx={width / 2}
                        cy={height / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                        className={`${getScoreColor(score)}`}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className={`font-bold ${fontSize} ${getScoreColor(score)}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}
                    </motion.span>
                </div>
            </div>

            {label && (
                <span className="text-sm text-muted-foreground mt-2">{label}</span>
            )}
        </div>
    );
}
