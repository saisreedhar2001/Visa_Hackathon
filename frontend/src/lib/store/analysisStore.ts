import { create } from "zustand";
import { 
    analyzeProfile, 
    analyzeProfileWithMode,
    AnalysisRequest, 
    AnalysisResponse,
    AsyncAnalysisStatusResponse 
} from "@/lib/api/analysis";

export type AnalysisMode = "fast" | "deep";

export interface AgentStep {
    id: string;
    agent: string;
    status: "pending" | "running" | "complete" | "error";
    title: string;
    description?: string;
    output?: any;
    startedAt?: Date;
    completedAt?: Date;
}

interface AnalysisState {
    // State
    analysisResult: AnalysisResponse | null;
    isAnalyzing: boolean;
    error: string | null;
    agentSteps: AgentStep[];
    analysisMode: AnalysisMode;
    asyncStatus: string | null;
    
    // Actions
    setAnalysisMode: (mode: AnalysisMode) => void;
    startAnalysis: (request: AnalysisRequest) => Promise<void>;
    resetAnalysis: () => void;
    updateAgentStep: (id: string, updates: Partial<AgentStep>) => void;
}

const initialAgentSteps: AgentStep[] = [
    {
        id: "profile",
        agent: "Profile Analyst",
        status: "pending",
        title: "Analyzing Your Profile",
        description: "Evaluating education, experience, and eligibility",
    },
    {
        id: "paths",
        agent: "Path Generator",
        status: "pending",
        title: "Generating Mobility Paths",
        description: "Finding optimal routes to your destination countries",
    },
    {
        id: "risk",
        agent: "Risk Assessor",
        status: "pending",
        title: "Assessing Risks & Blockers",
        description: "Evaluating potential challenges and approval probability",
    },
    {
        id: "synthesis",
        agent: "Recommendation Synthesizer",
        status: "pending",
        title: "Synthesizing Recommendations",
        description: "Creating personalized action plan with citations",
    },
];

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    analysisResult: null,
    isAnalyzing: false,
    error: null,
    agentSteps: [],
    analysisMode: "fast",
    asyncStatus: null,

    setAnalysisMode: (mode: AnalysisMode) => {
        set({ analysisMode: mode });
    },

    startAnalysis: async (request: AnalysisRequest) => {
        const mode = get().analysisMode;
        
        // Reset and initialize
        set({
            isAnalyzing: true,
            error: null,
            analysisResult: null,
            asyncStatus: mode === "deep" ? "Starting CrewAI analysis..." : null,
            agentSteps: initialAgentSteps.map(step => ({ ...step })),
        });

        try {
            const steps = get().agentSteps;

            if (mode === "fast") {
                // Fast mode: Simulate agent progress then call API
                for (let i = 0; i < steps.length; i++) {
                    get().updateAgentStep(steps[i].id, { 
                        status: "running",
                        startedAt: new Date(),
                    });

                    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

                    get().updateAgentStep(steps[i].id, { 
                        status: "complete",
                        completedAt: new Date(),
                    });
                }

                const result = await analyzeProfile(request);
                set({
                    analysisResult: result,
                    isAnalyzing: false,
                });
            } else {
                // Deep mode: Use CrewAI async endpoint with polling
                let currentStepIdx = 0;
                const startTime = Date.now();
                
                // Mark first agent as running
                get().updateAgentStep(steps[0].id, { 
                    status: "running",
                    startedAt: new Date(),
                });

                set({ asyncStatus: "Starting deep analysis with multi-agent system..." });

                const result = await analyzeProfileWithMode(
                    request,
                    "deep",
                    (status: AsyncAnalysisStatusResponse) => {
                        // Update status message during polling
                        const elapsed = Math.floor((Date.now() - startTime) / 1000);
                        set({ asyncStatus: `Analyzing... (${elapsed}s) - ${status.status}` });
                        
                        // Progress through agents based on elapsed time
                        // Each agent takes roughly 5-10 seconds
                        const newStepIdx = Math.min(
                            Math.floor(elapsed / 6),
                            steps.length - 1
                        );
                        
                        if (newStepIdx > currentStepIdx) {
                            // Mark previous step as complete
                            get().updateAgentStep(steps[currentStepIdx].id, { 
                                status: "complete",
                                completedAt: new Date(),
                            });
                            
                            // Mark new step as running
                            get().updateAgentStep(steps[newStepIdx].id, { 
                                status: "running",
                                startedAt: new Date(),
                            });
                            
                            currentStepIdx = newStepIdx;
                        }
                    }
                );

                // Mark all steps as complete
                steps.forEach(step => {
                    get().updateAgentStep(step.id, { 
                        status: "complete",
                        completedAt: new Date(),
                    });
                });

                set({
                    analysisResult: result,
                    isAnalyzing: false,
                    asyncStatus: null,
                });
            }
        } catch (error) {
            console.error("Analysis error:", error);
            
            // Mark current steps as error
            get().agentSteps.forEach(step => {
                if (step.status === "running") {
                    get().updateAgentStep(step.id, { status: "error" });
                }
            });
            
            set({
                error: error instanceof Error ? error.message : "Analysis failed",
                isAnalyzing: false,
                asyncStatus: null,
            });
        }
    },

    resetAnalysis: () => {
        set({
            analysisResult: null,
            isAnalyzing: false,
            error: null,
            agentSteps: [],
        });
    },

    updateAgentStep: (id: string, updates: Partial<AgentStep>) => {
        set(state => ({
            agentSteps: state.agentSteps.map(step =>
                step.id === id ? { ...step, ...updates } : step
            ),
        }));
    },
}));
