import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Education {
    level: "high_school" | "bachelors" | "masters" | "phd";
    field: string;
    institution?: string;
    country?: string;
    graduationYear?: number;
}

export interface WorkExperience {
    title: string;
    company?: string;
    yearsOfExperience: number;
    isCurrentRole?: boolean;
    skills: string[];
}

export interface Financial {
    annualIncomeUsd: number;
    savingsUsd: number;
    hasDebts?: boolean;
}

export interface Goals {
    targetCountries: string[];
    timeline: "immediate" | "within_1_year" | "within_2_years" | "flexible";
    priorities: string[];
    familySize?: number;
}

export interface AnalysisRequest {
    education: Education;
    workExperience: WorkExperience;
    financial: Financial;
    goals: Goals;
    nationality: string;
    age: number;
    languages?: { language: string; proficiency: string }[];
}

export interface PathStep {
    order: number;
    country: string;
    countryCode: string;
    visaType: string;
    duration: string;
    purpose: string;
    requirements: string[];
    estimatedCost: number;
    currency: string;
}

export interface MobilityPath {
    id: string;
    name: string;
    description: string;
    steps: PathStep[];
    totalDuration: string;
    overallScore: number;
    approvalProbability: number;
    riskLevel: "low" | "medium" | "high";
    whyThisPath: string;
}

export interface RankedPath extends MobilityPath {
    rank: number;
    recommendation: string;
}

export interface Citation {
    id: string;
    source: string;
    text: string;
    url?: string;
}

export interface ActionItem {
    order: number;
    action: string;
    deadline?: string;
    priority: "high" | "medium" | "low";
    details?: string;
}

export interface ProfileSummary {
    strengths: string[];
    weaknesses: string[];
    eligibleVisas: { country: string; visaTypes: string[] }[];
}

export interface AnalysisResponse {
    sessionId: string;
    profileSummary: ProfileSummary;
    rankedPaths: RankedPath[];
    actionItems: ActionItem[];
    citations: Citation[];
    analysisTimestamp: string;
    disclaimer: string;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function analyzeProfile(request: AnalysisRequest): Promise<any> {
    // Use the real LLM-powered endpoint
    const response = await api.post("/api/v1/analyze/real", request);
    console.log("API Response:", response.data);
    return response.data;
}

export async function getCountries(): Promise<any[]> {
    const response = await api.get("/api/v1/countries");
    return response.data;
}

export async function getCountryDetails(countryCode: string): Promise<any> {
    const response = await api.get(`/api/v1/countries/${countryCode}`);
    return response.data;
}

export async function healthCheck(): Promise<boolean> {
    try {
        await api.get("/api/v1/health");
        return true;
    } catch {
        return false;
    }
}

// ============================================================
// ASYNC ANALYSIS WITH CREWAI (Multi-Agent)
// ============================================================

export interface AsyncAnalysisStartResponse {
    success: boolean;
    session_id: string;
    status: "processing";
    message: string;
}

export interface AsyncAnalysisStatusResponse {
    session_id: string;
    status: "processing" | "completed" | "failed";
    created_at: string;
    result?: AnalysisResponse;
    error?: string;
}

/**
 * Start an async analysis using CrewAI multi-agent system.
 * Returns a session ID to poll for results.
 */
export async function startAsyncAnalysis(
    request: AnalysisRequest
): Promise<AsyncAnalysisStartResponse> {
    const response = await api.post("/api/v1/analyze/async", request);
    console.log("Async analysis started:", response.data);
    return response.data;
}

/**
 * Check the status of an async analysis.
 */
export async function getAnalysisStatus(
    sessionId: string
): Promise<AsyncAnalysisStatusResponse> {
    const response = await api.get(`/api/v1/analyze/status/${sessionId}`);
    return response.data;
}

/**
 * Get the full result of a completed async analysis.
 */
export async function getAnalysisResult(sessionId: string): Promise<any> {
    const response = await api.get(`/api/v1/analyze/result/${sessionId}`);
    return response.data;
}

/**
 * Poll for async analysis completion.
 * Returns the result when complete, or throws on failure.
 */
export async function pollForAnalysisResult(
    sessionId: string,
    maxAttempts: number = 60,
    intervalMs: number = 2000,
    onProgress?: (status: AsyncAnalysisStatusResponse) => void
): Promise<AnalysisResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await getAnalysisStatus(sessionId);

        if (onProgress) {
            onProgress(status);
        }

        if (status.status === "completed" && status.result) {
            return status.result;
        }

        if (status.status === "failed") {
            throw new Error(status.error || "Analysis failed");
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Analysis timed out");
}

/**
 * Unified analysis function that supports both modes.
 * @param request - The analysis request
 * @param mode - "fast" for direct Groq, "deep" for CrewAI multi-agent
 * @param onProgress - Optional callback for async progress updates
 */
export async function analyzeProfileWithMode(
    request: AnalysisRequest,
    mode: "fast" | "deep" = "fast",
    onProgress?: (status: AsyncAnalysisStatusResponse) => void
): Promise<AnalysisResponse> {
    if (mode === "fast") {
        // Direct Groq LLM call
        return analyzeProfile(request);
    } else {
        // CrewAI multi-agent async analysis
        const startResponse = await startAsyncAnalysis(request);
        return pollForAnalysisResult(
            startResponse.session_id,
            60,
            2000,
            onProgress
        );
    }
}


// ============================================================
// DYNAMIC PATH EXPLORATION (CrewAI Powered)
// ============================================================

export interface QuickExploreRequest {
    nationality: string;
    targetCountries: string[];
    yearsOfExperience?: number;
    educationLevel?: string;
    fieldOfWork?: string;
    skills?: string[];
}

export interface PathStep {
    order: number;
    country: string;
    countryCode: string;
    visaType: string;
    duration: string;
    purpose: string;
    requirements: string[];
    estimatedCost: number;
    currency: string;
}

export interface DynamicPath {
    id: string;
    rank: number;
    name: string;
    description: string;
    steps: PathStep[];
    totalDuration: string;
    overallScore: number;
    approvalProbability: number;
    riskLevel: "low" | "medium" | "high";
    whyThisPath: string;
    recommendation: string;
}

export interface SteppingStone {
    country: string;
    countryCode: string;
    reason: string;
    typicalDuration: string;
    benefits: string[];
    unlocks: string[];
}

export interface CountryInsight {
    code: string;
    name: string;
    immigration_friendliness: number;
    skill_demand: string[];
    processing_speed: number;
    notes: string;
    visa_types: number;
}

export interface ExploreResponse {
    success: boolean;
    sessionId: string;
    paths: DynamicPath[];
    steppingStones: SteppingStone[];
    countryInsights: CountryInsight[];
    agentAnalysis: {
        mode: string;
        agentsUsed: number;
        profileSummary?: {
            strengths: string[];
            weaknesses: string[];
        };
        riskAnalysis?: {
            overallRiskScore: number;
            approvalProbability: number;
            riskLevel: string;
        };
        actionItems?: { order: number; action: string; priority: string }[];
    };
    generatedAt: string;
    disclaimer: string;
}

/**
 * Quick explore - generates AI-powered dynamic paths.
 * This powers the "Explore Countries" page with personalized content.
 */
export async function quickExplore(
    request: QuickExploreRequest
): Promise<ExploreResponse> {
    const response = await api.post("/api/v1/explore/quick", request);
    console.log("Quick explore response:", response.data);
    return response.data;
}

/**
 * Explore paths to a specific destination
 */
export async function explorePaths(
    destination: string,
    nationality: string = "IN",
    experience: number = 3
): Promise<ExploreResponse> {
    const response = await api.get(`/api/v1/explore/paths/${destination}`, {
        params: { nationality, experience },
    });
    return response.data;
}

/**
 * Get stepping stone suggestions for a destination
 */
export async function getSteppingStones(
    destination: string,
    nationality: string = "IN"
): Promise<{ steppingStones: SteppingStone[] }> {
    const response = await api.get(
        `/api/v1/explore/stepping-stones/${destination}`,
        {
            params: { nationality },
        }
    );
    return response.data;
}

/**
 * Compare multiple destination countries
 */
export async function compareDestinations(
    countries: string[],
    nationality: string = "IN"
): Promise<any> {
    const response = await api.get("/api/v1/explore/compare", {
        params: { countries: countries.join(","), nationality },
    });
    return response.data;
}

