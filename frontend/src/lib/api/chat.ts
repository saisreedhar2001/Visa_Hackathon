import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    citations?: Citation[];
    detectedCountries?: string[];
}

export interface Citation {
    id: string;
    source: string;
    text: string;
}

export interface ChatRequest {
    message: string;
    session_id?: string;
    context_countries?: string[];
}

export interface ChatResponse {
    response: string;
    session_id: string;
    citations: Citation[];
    detected_countries: string[];
    has_context: boolean;
}

export interface SuggestionsResponse {
    suggestions: string[];
}

/**
 * Send a chat message to the visa assistant
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/api/v1/chat", request);
    return response.data;
}

/**
 * Get suggested starter questions
 */
export async function getChatSuggestions(): Promise<SuggestionsResponse> {
    const response = await api.get<SuggestionsResponse>("/api/v1/chat/suggestions");
    return response.data;
}

/**
 * Clear chat conversation history
 */
export async function clearChatHistory(sessionId: string): Promise<boolean> {
    try {
        await api.post("/api/v1/chat/clear", { session_id: sessionId });
        return true;
    } catch {
        return false;
    }
}

/**
 * Check chat service health
 */
export async function checkChatHealth(): Promise<boolean> {
    try {
        const response = await api.get("/api/v1/chat/health");
        return response.data.status === "healthy";
    } catch {
        return false;
    }
}
