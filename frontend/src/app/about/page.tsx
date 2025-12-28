"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    Brain,
    Sparkles,
    Zap,
    Shield,
    Target,
    Users,
    Globe2,
    Code2,
    Database,
    Cpu,
    Layers,
    GitBranch,
    Rocket,
    Award,
    Heart,
    ChevronRight,
    ExternalLink,
    Github,
    Linkedin,
    Mail,
} from "lucide-react";

const agents = [
    {
        name: "Profile Analyst",
        icon: Users,
        color: "from-blue-500 to-cyan-500",
        description: "Deeply analyzes your background, skills, education, and career trajectory to understand your unique immigration profile.",
        capabilities: [
            "Skills & Experience Assessment",
            "Education Credential Evaluation",
            "Financial Capacity Analysis",
            "Career Trajectory Mapping",
        ],
    },
    {
        name: "Path Generator",
        icon: GitBranch,
        color: "from-purple-500 to-pink-500",
        description: "Creates multiple immigration pathways including direct routes, stepping-stone strategies, and alternative options.",
        capabilities: [
            "Multi-Path Generation",
            "Stepping Stone Strategies",
            "Timeline Optimization",
            "Cost-Benefit Analysis",
        ],
    },
    {
        name: "Risk Assessor",
        icon: Shield,
        color: "from-amber-500 to-orange-500",
        description: "Evaluates each pathway for potential risks, approval probabilities, and identifies potential blockers.",
        capabilities: [
            "Approval Probability Scoring",
            "Risk Factor Identification",
            "Mitigation Strategies",
            "Blocker Detection",
        ],
    },
    {
        name: "Recommendation Synthesizer",
        icon: Sparkles,
        color: "from-emerald-500 to-teal-500",
        description: "Combines all analyses to produce actionable, ranked recommendations with clear next steps.",
        capabilities: [
            "Final Ranking & Scoring",
            "Action Item Generation",
            "Priority Sequencing",
            "Personalized Advice",
        ],
    },
];

const techStack = [
    {
        category: "Backend",
        icon: Cpu,
        color: "from-blue-500 to-indigo-500",
        items: [
            { name: "FastAPI", desc: "High-performance Python API" },
            { name: "CrewAI", desc: "Multi-agent orchestration" },
            { name: "Groq", desc: "Ultra-fast LLM inference" },
            { name: "LangChain", desc: "LLM framework" },
            { name: "ChromaDB", desc: "Vector database for RAG" },
        ],
    },
    {
        category: "Frontend",
        icon: Code2,
        color: "from-purple-500 to-pink-500",
        items: [
            { name: "Next.js 14", desc: "React framework" },
            { name: "TypeScript", desc: "Type-safe development" },
            { name: "Tailwind CSS", desc: "Utility-first styling" },
            { name: "Framer Motion", desc: "Animations" },
            { name: "React Simple Maps", desc: "Interactive maps" },
        ],
    },
    {
        category: "AI & Data",
        icon: Brain,
        color: "from-emerald-500 to-teal-500",
        items: [
            { name: "RAG Pipeline", desc: "Context retrieval" },
            { name: "Vector Embeddings", desc: "Semantic search" },
            { name: "Multi-Agent System", desc: "Collaborative AI" },
            { name: "Policy Documents", desc: "Real visa data" },
        ],
    },
];

const features = [
    {
        icon: Globe2,
        title: "25+ Countries Covered",
        description: "Comprehensive visa data for major immigration destinations worldwide",
    },
    {
        icon: Zap,
        title: "Real-Time Analysis",
        description: "Get personalized visa recommendations in seconds, not hours",
    },
    {
        icon: Target,
        title: "AI-Powered Accuracy",
        description: "Multi-agent system ensures comprehensive and accurate analysis",
    },
    {
        icon: Shield,
        title: "Risk Assessment",
        description: "Understand your approval chances before you apply",
    },
];

export default function AboutPage() {
    const [activeAgent, setActiveAgent] = useState(0);

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-4 pt-16 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                    >
                        <Globe2 className="w-12 h-12 text-white" />
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                            About Global Mobility
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Intelligence
                        </span>
                    </h1>

                    <p className="text-xl text-white/60 max-w-3xl mx-auto mb-12">
                        An AI-powered platform that revolutionizes how professionals navigate 
                        international immigration through intelligent multi-agent analysis and 
                        personalized pathway recommendations.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
                            >
                                <feature.icon className="w-4 h-4 text-purple-400" />
                                <span className="text-white/80 text-sm">{feature.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Our platform uses a sophisticated multi-step process to deliver accurate, 
                        personalized immigration guidance.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {[
                        { step: 1, title: "Input Profile", desc: "Share your background, skills, and goals", icon: Users, color: "blue" },
                        { step: 2, title: "AI Analysis", desc: "Multi-agent system processes your data", icon: Brain, color: "purple" },
                        { step: 3, title: "RAG Context", desc: "Retrieves relevant policy documents", icon: Database, color: "pink" },
                        { step: 4, title: "Get Results", desc: "Receive ranked pathways & action items", icon: Rocket, color: "emerald" },
                    ].map((item, index) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {index < 3 && (
                                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                            )}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center hover:border-white/20 transition-all group">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                    {item.step}
                                </div>
                                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-white/60">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Agents Section */}
            <section className="relative z-10 container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-6">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">Powered by CrewAI</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Multi-Agent Architecture</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Four specialized AI agents work together to analyze your profile and generate 
                        comprehensive immigration recommendations.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Agent Selector */}
                    <div className="space-y-4">
                        {agents.map((agent, index) => {
                            const Icon = agent.icon;
                            const isActive = activeAgent === index;

                            return (
                                <motion.button
                                    key={agent.name}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setActiveAgent(index)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                                        isActive
                                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50"
                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold ${isActive ? "text-white" : "text-white/80"}`}>
                                            {agent.name}
                                        </h3>
                                        <p className="text-sm text-white/50 line-clamp-1">{agent.description}</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "text-purple-400 rotate-90" : "text-white/30"}`} />
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Agent Details */}
                    <motion.div
                        key={activeAgent}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
                    >
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agents[activeAgent].color} flex items-center justify-center shadow-xl mb-6`}>
                            {React.createElement(agents[activeAgent].icon, { className: "w-10 h-10 text-white" })}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{agents[activeAgent].name}</h3>
                        <p className="text-white/70 mb-6">{agents[activeAgent].description}</p>
                        <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Capabilities</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {agents[activeAgent].capabilities.map((cap, idx) => (
                                <motion.div
                                    key={cap}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-2 text-sm text-white/80"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    {cap}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="relative z-10 container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Technology Stack</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Built with cutting-edge technologies for performance, scalability, and reliability.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {techStack.map((stack, index) => {
                        const Icon = stack.icon;
                        return (
                            <motion.div
                                key={stack.category}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stack.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-4">{stack.category}</h3>
                                <div className="space-y-3">
                                    {stack.items.map((item) => (
                                        <div key={item.name} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                                            <div>
                                                <span className="text-white/90 text-sm font-medium">{item.name}</span>
                                                <span className="text-white/40 text-xs ml-2">{item.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-12"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                        Let our AI agents analyze your profile and discover the best immigration 
                        pathways for your global mobility goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.a
                            href="/analyze"
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Brain className="w-5 h-5" />
                            Analyze My Profile
                        </motion.a>
                        <motion.a
                            href="/explore"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Globe2 className="w-5 h-5" />
                            Explore Countries
                        </motion.a>
                    </div>
                </motion.div>
            </section>

            {/* Hackathon Badge */}
            <section className="relative z-10 container mx-auto px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-300 font-medium">Built for Hackathon 2025</span>
                        <Heart className="w-4 h-4 text-red-400" />
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
