"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AnalysisRequest } from "@/lib/api/analysis";
import { ChevronRight, ChevronLeft, User, Briefcase, Wallet, Target } from "lucide-react";

const COUNTRIES = [
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "SG", name: "Singapore" },
    { code: "NL", name: "Netherlands" },
    { code: "AE", name: "UAE" },
    { code: "PT", name: "Portugal" },
    { code: "JP", name: "Japan" },
];

const NATIONALITIES = [
    "Indian", "Chinese", "Filipino", "Vietnamese", "Indonesian", "Pakistani",
    "Bangladeshi", "Nigerian", "Brazilian", "Mexican", "Turkish", "Egyptian",
    "Other"
];

const SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "React", "Node.js",
    "AWS", "Azure", "Docker", "Kubernetes", "Machine Learning", "Data Science",
    "SQL", "MongoDB", "DevOps", "Product Management", "UX Design"
];

const schema = z.object({
    age: z.number().min(18).max(65),
    nationality: z.string().min(1, "Please select your nationality"),
    educationLevel: z.enum(["high_school", "bachelors", "masters", "phd"]),
    educationField: z.string().min(1),
    yearsOfExperience: z.number().min(0).max(40),
    currentTitle: z.string().min(1),
    skills: z.array(z.string()).min(1, "Please select at least one skill"),
    annualIncome: z.number().min(0),
    savings: z.number().min(0),
    targetCountries: z.array(z.string()).min(1, "Please select at least one target country"),
    timeline: z.enum(["immediate", "within_1_year", "within_2_years", "flexible"]),
    familySize: z.number().min(1).max(10),
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
    onSubmit: (data: AnalysisRequest) => void;
}

const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Career", icon: Briefcase },
    { id: 3, title: "Financial", icon: Wallet },
    { id: 4, title: "Goals", icon: Target },
];

export function ProfileForm({ onSubmit }: ProfileFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            age: 28,
            nationality: "",
            educationLevel: "bachelors",
            educationField: "Computer Science",
            yearsOfExperience: 5,
            currentTitle: "Software Engineer",
            skills: [],
            annualIncome: 60000,
            savings: 30000,
            targetCountries: [],
            timeline: "within_1_year",
            familySize: 1,
        },
    });

    const handleSkillToggle = (skill: string) => {
        const updated = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];
        setSelectedSkills(updated);
        setValue("skills", updated);
    };

    const handleCountryToggle = (code: string) => {
        if (selectedCountries.includes(code)) {
            const updated = selectedCountries.filter(c => c !== code);
            setSelectedCountries(updated);
            setValue("targetCountries", updated);
        } else if (selectedCountries.length < 3) {
            const updated = [...selectedCountries, code];
            setSelectedCountries(updated);
            setValue("targetCountries", updated);
        }
    };

    const onFormSubmit = (data: FormData) => {
        console.log("Form submitted with data:", data);
        const request: AnalysisRequest = {
            age: data.age,
            nationality: data.nationality,
            education: {
                level: data.educationLevel,
                field: data.educationField,
            },
            workExperience: {
                title: data.currentTitle,
                yearsOfExperience: data.yearsOfExperience,
                skills: data.skills,
                isCurrentRole: true,
            },
            financial: {
                annualIncomeUsd: data.annualIncome,
                savingsUsd: data.savings,
            },
            goals: {
                targetCountries: data.targetCountries,
                timeline: data.timeline,
                priorities: ["permanent_residence", "career_growth"],
                familySize: data.familySize,
            },
        };
        console.log("Sending API request:", request);
        onSubmit(request);
    };

    const onFormError = (errors: any) => {
        console.log("Form validation errors:", errors);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <Card className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Tell Us About Yourself</CardTitle>
                <CardDescription className="text-white/60">
                    Our AI agents will analyze your profile to find the best immigration pathways
                </CardDescription>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-between mt-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                    currentStep >= step.id
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                        : "bg-white/10 text-white/50"
                                }`}
                            >
                                <step.icon className="w-5 h-5" />
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-16 h-0.5 mx-2 transition-colors ${
                                        currentStep > step.id ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit, onFormError)}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-white/80">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                            {...register("age", { valueAsNumber: true })}
                                        />
                                        {errors.age && (
                                            <p className="text-sm text-red-400">{errors.age.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality" className="text-white/80">Nationality</Label>
                                        <Select onValueChange={(v) => setValue("nationality", v)}>
                                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                <SelectValue placeholder="Select nationality" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/20">
                                                {NATIONALITIES.map(nat => (
                                                    <SelectItem key={nat} value={nat} className="text-white hover:bg-white/10">{nat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.nationality && (
                                            <p className="text-sm text-red-400">{errors.nationality.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="familySize" className="text-white/80">Family Size (including you)</Label>
                                    <Input
                                        id="familySize"
                                        type="number"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                        {...register("familySize", { valueAsNumber: true })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Career */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Education Level</Label>
                                        <Select onValueChange={(v: any) => setValue("educationLevel", v)}>
                                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/20">
                                                <SelectItem value="high_school" className="text-white hover:bg-white/10">High School</SelectItem>
                                                <SelectItem value="bachelors" className="text-white hover:bg-white/10">Bachelor's</SelectItem>
                                                <SelectItem value="masters" className="text-white hover:bg-white/10">Master's</SelectItem>
                                                <SelectItem value="phd" className="text-white hover:bg-white/10">PhD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="educationField" className="text-white/80">Field of Study</Label>
                                        <Input
                                            id="educationField"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                            {...register("educationField")}
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentTitle" className="text-white/80">Current Job Title</Label>
                                        <Input
                                            id="currentTitle"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                            {...register("currentTitle")}
                                            placeholder="e.g., Software Engineer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearsOfExperience" className="text-white/80">Years of Experience</Label>
                                        <Input
                                            id="yearsOfExperience"
                                            type="number"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                            {...register("yearsOfExperience", { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80">Skills (select all that apply)</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {SKILLS.map(skill => (
                                            <Badge
                                                key={skill}
                                                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                                className={`cursor-pointer transition-all ${
                                                    selectedSkills.includes(skill) 
                                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0" 
                                                        : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                                                }`}
                                                onClick={() => handleSkillToggle(skill)}
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    {errors.skills && (
                                        <p className="text-sm text-red-400">{errors.skills.message}</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Financial */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="annualIncome" className="text-white/80">Annual Income (USD)</Label>
                                    <Input
                                        id="annualIncome"
                                        type="number"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                        {...register("annualIncome", { valueAsNumber: true })}
                                    />
                                    <p className="text-xs text-white/50">
                                        Your current annual salary in USD equivalent
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="savings" className="text-white/80">Total Savings (USD)</Label>
                                    <Input
                                        id="savings"
                                        type="number"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                        {...register("savings", { valueAsNumber: true })}
                                    />
                                    <p className="text-xs text-white/50">
                                        Liquid savings available for immigration costs
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Goals */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-white/80">Target Countries (select up to 3)</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {COUNTRIES.map(country => (
                                            <div
                                                key={country.code}
                                                onClick={() => handleCountryToggle(country.code)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                    selectedCountries.includes(country.code)
                                                        ? "border-purple-500 bg-purple-500/20 text-white"
                                                        : "border-white/20 text-white/70 hover:border-white/40"
                                                }`}
                                            >
                                                <span className="font-medium">{country.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.targetCountries && (
                                        <p className="text-sm text-red-400">{errors.targetCountries.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80">Timeline</Label>
                                    <Select 
                                        defaultValue="within_1_year"
                                        onValueChange={(v: any) => setValue("timeline", v)}
                                    >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="When do you want to move?" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/20">
                                            <SelectItem value="immediate" className="text-white hover:bg-white/10">As soon as possible</SelectItem>
                                            <SelectItem value="within_1_year" className="text-white hover:bg-white/10">Within 1 year</SelectItem>
                                            <SelectItem value="within_2_years" className="text-white hover:bg-white/10">Within 2 years</SelectItem>
                                            <SelectItem value="flexible" className="text-white hover:bg-white/10">Flexible / No rush</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        {currentStep < 4 ? (
                            <Button 
                                type="button" 
                                onClick={nextStep}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button 
                                type="submit" 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/30"
                            >
                                Analyze My Profile
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
