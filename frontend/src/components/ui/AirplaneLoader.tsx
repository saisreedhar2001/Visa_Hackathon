"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";

interface AirplaneLoaderProps {
    fromCountry: string;
    toCountry: string;
    toFlag: string;
    onComplete: () => void;
}

const AirplaneLoader: React.FC<AirplaneLoaderProps> = ({
    fromCountry,
    toCountry,
    toFlag,
    onComplete,
}) => {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"
        >
            {/* Animated Stars Background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 1 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random(),
                        }}
                    />
                ))}
            </div>

            {/* Clouds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: "-200px",
                        }}
                        animate={{
                            x: ["0vw", "120vw"],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "linear",
                        }}
                    >
                        <div className="w-32 h-12 bg-white/10 rounded-full blur-xl" />
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center">
                {/* Flight Path */}
                <div className="relative w-[500px] h-[200px] mx-auto mb-8">
                    {/* Dashed Path */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 200">
                        <motion.path
                            d="M 50 150 Q 250 20 450 150"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            strokeDasharray="10 10"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                        />
                        <motion.path
                            d="M 50 150 Q 250 20 450 150"
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, delay: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Origin Point */}
                    <motion.div
                        className="absolute left-[30px] top-[130px]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <p className="text-white/60 text-xs mt-2 text-center w-16 -ml-2">Home</p>
                    </motion.div>

                    {/* Destination Point */}
                    <motion.div
                        className="absolute right-[30px] top-[130px]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                            animate={{
                                boxShadow: [
                                    "0 0 20px rgba(168, 85, 247, 0.5)",
                                    "0 0 40px rgba(168, 85, 247, 0.8)",
                                    "0 0 20px rgba(168, 85, 247, 0.5)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className="text-3xl">{toFlag}</span>
                        </motion.div>
                        <p className="text-white text-sm mt-2 text-center font-medium">{toCountry}</p>
                    </motion.div>

                    {/* Animated Airplane */}
                    <motion.div
                        className="absolute"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{
                            duration: 2.5,
                            delay: 0.5,
                            ease: "easeInOut",
                        }}
                        style={{
                            offsetPath: "path('M 50 150 Q 250 20 450 150')",
                            offsetRotate: "auto",
                        }}
                    >
                        <motion.div
                            className="relative"
                            animate={{
                                y: [0, -5, 0, 5, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                            }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <Plane className="w-7 h-7 text-white transform -rotate-45" />
                            </div>
                            {/* Trail Effect */}
                            <motion.div
                                className="absolute -left-8 top-1/2 -translate-y-1/2 w-12 h-1 bg-gradient-to-l from-white/50 to-transparent rounded-full"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Flying to{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {toCountry}
                        </span>
                    </h2>
                    <p className="text-white/60">Preparing your personalized visa analysis...</p>
                </motion.div>

                {/* Loading Bar */}
                <motion.div
                    className="w-64 h-2 bg-white/10 rounded-full mx-auto mt-8 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                    />
                </motion.div>

                {/* Fun Facts */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <motion.p
                        className="text-white/40 text-sm"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        ✨ Analyzing visa requirements & pathways...
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AirplaneLoader;
