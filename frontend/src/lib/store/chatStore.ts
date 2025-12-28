import { create } from "zustand";
import { 
    sendChatMessage, 
    getChatSuggestions,
    clearChatHistory,
    ChatMessage,
    Citation 
} from "@/lib/api/chat";

// Simple ID generator (no uuid dependency needed)
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface ChatState {
    // State
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sessionId: string;
    suggestions: string[];
    
    // Actions
    sendMessage: (message: string) => Promise<void>;
    clearChat: () => Promise<void>;
    loadSuggestions: () => Promise<void>;
    resetError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: typeof window !== "undefined" ? generateId() : "",
    suggestions: [
        "What are the requirements for a US H-1B visa?",
        "How does Canada's Express Entry system work?",
        "What is the Germany Blue Card?",
        "Compare work visa options between UK and Canada",
    ],

    sendMessage: async (message: string) => {
        const { sessionId, messages } = get();
        
        // Add user message immediately
        const userMessage: ChatMessage = {
            role: "user",
            content: message,
            timestamp: new Date(),
        };
        
        set({
            messages: [...messages, userMessage],
            isLoading: true,
            error: null,
        });

        try {
            const response = await sendChatMessage({
                message,
                session_id: sessionId,
            });

            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                citations: response.citations,
                detectedCountries: response.detected_countries,
            };

            set((state) => ({
                messages: [...state.messages, assistantMessage],
                isLoading: false,
            }));

        } catch (error) {
            console.error("Chat error:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to send message",
                isLoading: false,
            });
        }
    },

    clearChat: async () => {
        const { sessionId } = get();
        await clearChatHistory(sessionId);
        
        set({
            messages: [],
            sessionId: generateId(),
            error: null,
        });
    },

    loadSuggestions: async () => {
        try {
            const response = await getChatSuggestions();
            set({ suggestions: response.suggestions });
        } catch (error) {
            console.error("Failed to load suggestions:", error);
            // Keep default suggestions
        }
    },

    resetError: () => {
        set({ error: null });
    },
}));
