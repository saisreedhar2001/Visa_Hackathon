"use client";

import { Citation } from "@/lib/api/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";

interface CitationsPanelProps {
    citations: Citation[];
}

export function CitationsPanel({ citations }: CitationsPanelProps) {
    return (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Sources & Citations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-white/50 mb-4">
                    Our AI agents referenced these official sources for their recommendations:
                </p>
                <div className="space-y-3">
                    {citations.map((citation, index) => (
                        <div
                            key={citation.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                        >
                            <span className="text-xs font-mono text-white/40">
                                [{index + 1}]
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{citation.source}</p>
                                <p className="text-xs text-white/50 mt-1">
                                    {citation.text}
                                </p>
                            </div>
                            {citation.url && (
                                <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
