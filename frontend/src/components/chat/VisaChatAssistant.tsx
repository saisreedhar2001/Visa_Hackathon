"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    RefreshCw, 
    Globe2,
    MessageSquare,
    BookOpen,
    Lightbulb,
    Loader2
} from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore";
import { ChatMessage } from "@/lib/api/chat";

interface VisaChatAssistantProps {
    onBack?: () => void;
}

export function VisaChatAssistant({ onBack }: VisaChatAssistantProps) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const { 
        messages, 
        isLoading, 
        error, 
        suggestions,
        sendMessage, 
        clearChat,
        loadSuggestions,
        resetError 
    } = useChatStore();

    // Load suggestions on mount
    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    // Keep scroll at top when new messages arrive
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        
        const message = inputValue.trim();
        setInputValue("");
        await sendMessage(message);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                {/* <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-semibold text-white">Visa Assistant</h2>
                        <p className="text-xs text-white/60">Powered by RAG + Groq LLM</p>
                    </div>
                </div> */}
                <p className="text-sm text-white/50 max-w-xl mx-auto">
                    Ask me anything about visas, immigration pathways, requirements, and more. 
                    I have access to comprehensive visa policy knowledge.
                </p>
            </motion.div>

            {/* Chat Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
                {/* Messages Area */}
                <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <EmptyState 
                            suggestions={suggestions} 
                            onSuggestionClick={handleSuggestionClick} 
                        />
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <MessageBubble key={index} message={message} />
                            ))}
                            {isLoading && <TypingIndicator />}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center"
                                >
                                    <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                        {error}
                                        <button 
                                            onClick={resetError}
                                            className="ml-2 underline hover:no-underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-white/10 p-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about visas, requirements, pathways..."
                                disabled={isLoading}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white font-medium transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 px-2">
                        <button
                            onClick={clearChat}
                            disabled={messages.length === 0}
                            className="text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-30 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Clear chat
                        </button>
                        <span className="text-xs text-white/30">
                            Press Enter to send
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-white/30 text-center mt-4 max-w-2xl mx-auto"
            >
                This AI assistant provides general information only. Immigration policies change frequently. 
                Always verify with official government sources and consult a licensed immigration attorney.
            </motion.p>
        </div>
    );
}

// Empty state with suggestions
function EmptyState({ 
    suggestions, 
    onSuggestionClick 
}: { 
    suggestions: string[]; 
    onSuggestionClick: (s: string) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full py-8"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Globe2 className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to Visa Assistant
            </h3>
            <p className="text-white/50 text-center mb-8 max-w-md">
                I'm your AI-powered immigration consultant. Ask me about visa requirements, 
                pathways, costs, timelines, and more!
            </p>
            
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    <span>Try asking:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all group"
                        >
                            <span className="line-clamp-2">{suggestion}</span>
                            <Sparkles className="w-3 h-3 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Message bubble component
function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}
            
            <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
                <div
                    className={`px-4 py-3 rounded-2xl ${
                        isUser
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-white/10 text-white/90"
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <FormattedMessage content={message.content} />
                        </div>
                    )}
                </div>
                
                {/* Citations */}
                {!isUser && message.citations && message.citations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 flex flex-wrap gap-2"
                    >
                        {message.citations.slice(0, 3).map((citation, idx) => (
                            <div
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-white/50"
                            >
                                <BookOpen className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{citation.source}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
                
                {/* Timestamp */}
                <p className={`text-xs text-white/30 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                    })}
                </p>
            </div>
            
            {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </motion.div>
    );
}

// Typing indicator with bouncing balls animation
function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
        >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-5 py-4 bg-white/10 rounded-2xl">
                <div className="flex items-center gap-3">
                    {/* Bouncing balls animation */}
                    <div className="flex gap-1.5 items-end h-5">
                        <motion.div
                            animate={{ 
                                y: [0, -12, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                delay: 0,
                                ease: "easeInOut"
                            }}
                            className="w-2.5 h-2.5 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/50"
                        />
                        <motion.div
                            animate={{ 
                                y: [0, -12, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                delay: 0.15,
                                ease: "easeInOut"
                            }}
                            className="w-2.5 h-2.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full shadow-lg shadow-purple-500/50"
                        />
                        <motion.div
                            animate={{ 
                                y: [0, -12, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                delay: 0.3,
                                ease: "easeInOut"
                            }}
                            className="w-2.5 h-2.5 bg-gradient-to-t from-cyan-500 to-teal-400 rounded-full shadow-lg shadow-cyan-500/50"
                        />
                    </div>
                    {/* Thinking text */}
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm text-white/60"
                    >
                        AI is thinking...
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
}

// Simple formatted message component (basic markdown-like formatting)
function FormattedMessage({ content }: { content: string }) {
    // Split content into paragraphs and format
    const formatText = (text: string) => {
        // Handle bold text (**text**)
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
        // Handle italic text (*text*)
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        // Handle inline code (`code`)
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-white/10 rounded text-sm">$1</code>');
        return formatted;
    };

    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let key = 0;

    const flushList = () => {
        if (currentList.length > 0) {
            if (listType === 'ul') {
                elements.push(
                    <ul key={key++} className="list-disc list-inside mb-2 space-y-1 text-white/90">
                        {currentList.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                        ))}
                    </ul>
                );
            } else {
                elements.push(
                    <ol key={key++} className="list-decimal list-inside mb-2 space-y-1 text-white/90">
                        {currentList.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                        ))}
                    </ol>
                );
            }
            currentList = [];
            listType = null;
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(
                <h3 key={key++} className="text-sm font-semibold mb-1 text-white">
                    {trimmed.substring(4)}
                </h3>
            );
        } else if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(
                <h2 key={key++} className="text-base font-semibold mb-2 text-white">
                    {trimmed.substring(3)}
                </h2>
            );
        } else if (trimmed.startsWith('# ')) {
            flushList();
            elements.push(
                <h1 key={key++} className="text-lg font-bold mb-2 text-white">
                    {trimmed.substring(2)}
                </h1>
            );
        }
        // Unordered list
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            currentList.push(trimmed.substring(2));
        }
        // Ordered list
        else if (/^\d+\.\s/.test(trimmed)) {
            if (listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            currentList.push(trimmed.replace(/^\d+\.\s/, ''));
        }
        // Empty line
        else if (trimmed === '') {
            flushList();
        }
        // Regular paragraph
        else {
            flushList();
            elements.push(
                <p 
                    key={key++} 
                    className="mb-2 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: formatText(trimmed) }}
                />
            );
        }
    }
    
    flushList();
    
    return <>{elements}</>;
}

export default VisaChatAssistant;
