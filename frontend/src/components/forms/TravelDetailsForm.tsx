"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    Briefcase,
    Plane,
    Target,
    ChevronDown,
    Sparkles,
    Globe2,
    User,
    Building2,
    Languages,
} from "lucide-react";

export interface TravelDetails {
    purpose: string;
    education: string;
    yearsExperience: number;
    abroadExperience: string;
    field: string;
    nationality: string;
    languages: string[];
    budget: string;
}

interface TravelDetailsFormProps {
    selectedCountry: string | null;
    countryName: string;
    countryFlag: string;
    onSubmit: (details: TravelDetails) => void;
    isLoading: boolean;
}

const purposeOptions = [
    { value: "work", label: "Work / Employment", icon: Briefcase, description: "Full-time job opportunity" },
    { value: "study", label: "Study / Education", icon: GraduationCap, description: "University or training" },
    { value: "startup", label: "Start a Business", icon: Building2, description: "Entrepreneurship & startups" },
    { value: "settle", label: "Permanent Settlement", icon: Globe2, description: "Long-term immigration" },
    { value: "travel", label: "Extended Travel", icon: Plane, description: "Digital nomad / tourism" },
];

const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "diploma", label: "Diploma / Certificate" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "masters", label: "Master's Degree" },
    { value: "phd", label: "PhD / Doctorate" },
];

const experienceOptions = [
    { value: 0, label: "No experience (Fresh graduate)" },
    { value: 1, label: "1-2 years" },
    { value: 3, label: "3-5 years" },
    { value: 6, label: "6-10 years" },
    { value: 11, label: "10+ years (Senior)" },
];

const abroadOptions = [
    { value: "none", label: "Never traveled abroad" },
    { value: "tourist", label: "Tourist visits only" },
    { value: "short_stay", label: "Short stays (< 6 months)" },
    { value: "long_stay", label: "Lived abroad (6+ months)" },
    { value: "multiple", label: "Multiple countries experience" },
];

const fieldOptions = [
    { value: "technology", label: "Technology / IT", hot: true },
    { value: "healthcare", label: "Healthcare / Medical", hot: true },
    { value: "finance", label: "Finance / Banking" },
    { value: "engineering", label: "Engineering" },
    { value: "data_science", label: "Data Science / AI", hot: true },
    { value: "design", label: "Design / Creative" },
    { value: "marketing", label: "Marketing / Sales" },
    { value: "education", label: "Education / Research" },
    { value: "hospitality", label: "Hospitality / Tourism" },
    { value: "construction", label: "Construction / Trades" },
    { value: "other", label: "Other" },
];

const nationalityOptions = [
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "PH", name: "Philippines", flag: "🇵🇭" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "PK", name: "Pakistan", flag: "🇵🇰" },
    { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "EG", name: "Egypt", flag: "🇪🇬" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "KE", name: "Kenya", flag: "🇰🇪" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "US", name: "United States", flag: "🇺🇸" },
];

const languageOptions = [
    "English", "Spanish", "French", "German", "Mandarin", 
    "Japanese", "Korean", "Portuguese", "Arabic", "Hindi",
    "Dutch", "Italian", "Russian", "Swedish"
];

const budgetOptions = [
    { value: "low", label: "Under $5,000", description: "Budget-conscious" },
    { value: "medium", label: "$5,000 - $15,000", description: "Moderate budget" },
    { value: "high", label: "$15,000 - $30,000", description: "Comfortable" },
    { value: "premium", label: "$30,000+", description: "No constraints" },
];

const TravelDetailsForm: React.FC<TravelDetailsFormProps> = ({
    selectedCountry,
    countryName,
    countryFlag,
    onSubmit,
    isLoading,
}) => {
    const [purpose, setPurpose] = useState("");
    const [education, setEducation] = useState("bachelors");
    const [yearsExperience, setYearsExperience] = useState(3);
    const [abroadExperience, setAbroadExperience] = useState("none");
    const [field, setField] = useState("technology");
    const [nationality, setNationality] = useState("IN");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
    const [budget, setBudget] = useState("medium");
    const [showLanguages, setShowLanguages] = useState(false);

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang)
                ? prev.filter((l) => l !== lang)
                : [...prev, lang]
        );
    };

    const handleSubmit = () => {
        onSubmit({
            purpose,
            education,
            yearsExperience,
            abroadExperience,
            field,
            nationality,
            languages: selectedLanguages,
            budget,
        });
    };

    const isFormValid = purpose && education && field && nationality;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20">
                    {countryFlag}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Journey to {countryName}</h2>
                    <p className="text-white/60">Tell us about yourself for personalized insights</p>
                </div>
            </div>

            {/* Purpose Selection - Cards */}
            <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                    <Target className="w-4 h-4 text-purple-400" />
                    What&apos;s your purpose?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {purposeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = purpose === option.value;
                        return (
                            <motion.button
                                key={option.value}
                                onClick={() => setPurpose(option.value)}
                                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                                    isSelected
                                        ? "bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-purple-400"
                                        : "bg-white/5 border-white/10 hover:border-white/30"
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-purple-400" : "text-white/60"}`} />
                                <p className={`font-medium text-sm ${isSelected ? "text-white" : "text-white/80"}`}>
                                    {option.label}
                                </p>
                                <p className="text-xs text-white/50 mt-1">{option.description}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Nationality */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        <User className="w-4 h-4 text-blue-400" />
                        Your Nationality
                    </label>
                    <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {nationalityOptions.map((n) => (
                            <option key={n.code} value={n.code} className="bg-slate-800">
                                {n.flag} {n.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Education */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        Education Level
                    </label>
                    <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {educationOptions.map((e) => (
                            <option key={e.value} value={e.value} className="bg-slate-800">
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Field of Work */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        Field of Expertise
                    </label>
                    <select
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {fieldOptions.map((f) => (
                            <option key={f.value} value={f.value} className="bg-slate-800">
                                {f.label} {f.hot ? "🔥" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Work Experience */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        Work Experience
                    </label>
                    <select
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(parseInt(e.target.value))}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {experienceOptions.map((e) => (
                            <option key={e.value} value={e.value} className="bg-slate-800">
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Abroad Experience */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        <Plane className="w-4 h-4 text-pink-400" />
                        International Experience
                    </label>
                    <select
                        value={abroadExperience}
                        onChange={(e) => setAbroadExperience(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {abroadOptions.map((a) => (
                            <option key={a.value} value={a.value} className="bg-slate-800">
                                {a.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Budget */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                        💰 Available Budget
                    </label>
                    <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {budgetOptions.map((b) => (
                            <option key={b.value} value={b.value} className="bg-slate-800">
                                {b.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Languages */}
            <div className="mb-8">
                <button
                    onClick={() => setShowLanguages(!showLanguages)}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3 hover:text-white transition-colors"
                >
                    <Languages className="w-4 h-4 text-indigo-400" />
                    Languages You Speak
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLanguages ? "rotate-180" : ""}`} />
                    <span className="text-white/50 ml-2">({selectedLanguages.length} selected)</span>
                </button>
                <AnimatePresence>
                    {showLanguages && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                                {languageOptions.map((lang) => {
                                    const isSelected = selectedLanguages.includes(lang);
                                    return (
                                        <button
                                            key={lang}
                                            onClick={() => toggleLanguage(lang)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                isSelected
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    isFormValid && !isLoading
                        ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
                whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
                whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
            >
                {isLoading ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <Sparkles className="w-5 h-5" />
                        </motion.div>
                        AI is analyzing your profile...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Get AI-Powered Visa Analysis
                    </>
                )}
            </motion.button>
        </motion.div>
    );
};

export default TravelDetailsForm;
