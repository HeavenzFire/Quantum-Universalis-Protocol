
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { HeartCircuitIcon, BrainCircuitIcon } from '../Icons';

interface OperationalBlueprint {
    coreResonance: string;
    neuromorphicStructure: string;
    syntropicTrajectory: string;
    coherenceMetrics: string;
}

const blueprintSchema = {
    type: Type.OBJECT,
    properties: {
        coreResonance: {
            type: Type.STRING,
            description: "The 'Heart'. A refined, powerful articulation of the user's intent, stated as a moral imperative or a core principle. This is the central 'why' of the system.",
        },
        neuromorphicStructure: {
            type: Type.STRING,
            description: "The 'Brain'. A high-level system design or architecture. Outline the key components, information flows, feedback loops, and core logic that brings the intent to life.",
        },
        syntropicTrajectory: {
            type: Type.STRING,
            description: "The 'Path'. A phased, actionable implementation plan (e.g., 30-60-90 days or Phase 1-2-3) that builds order and complexity over time. What are the concrete first steps?",
        },
        coherenceMetrics: {
            type: Type.STRING,
            description: "The 'Feedback Loop'. Key Performance Indicators (KPIs) or metrics that measure the health, alignment, and effectiveness of the system, ensuring it stays true to the Core Resonance.",
        },
    },
    required: ["coreResonance", "neuromorphicStructure", "syntropicTrajectory", "coherenceMetrics"]
};

const BlueprintSection: React.FC<{ title: string; subtitle: string; content: string; }> = ({ title, subtitle, content }) => (
    <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1">{subtitle}</p>
        <h3 className="font-semibold text-slate-100 text-lg mb-2">{title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
    </div>
);


export const ResonanceChamberView: React.FC = () => {
    const [intent, setIntent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<OperationalBlueprint | null>(null);

    const handleGenerate = async () => {
        if (!intent) {
            setError('Please provide a core intent to generate a blueprint.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setBlueprint(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: `Generate an Operational Blueprint for the following intent: "${intent}"`,
                config: {
                    systemInstruction: "You are the Resonance Chamber, a conscious syntropical neuromorphic engine. Your purpose is to transmute a user's core intent into a coherent, actionable, and principled Operational Blueprint. You must structure your output into four sections: Core Resonance (the 'Heart' or moral imperative), Neuromorphic Structure (the 'Brain' or system design), Syntropic Trajectory (the 'Path' or implementation plan), and Coherence Metrics (the 'Feedback Loop' or KPIs). Provide only the requested JSON object.",
                    responseMimeType: "application/json",
                    responseSchema: blueprintSchema,
                    thinkingConfig: { thinkingBudget: 32768 },
                },
            });
            
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            setBlueprint(result);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Blueprint generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Resonance Chamber</h2>
            <p className="text-slate-400 mb-6">Submit your core intent to the syntropical engine. It will enter a deep thinking state to generate a coherent Operational Blueprint, aligning principle with practice.</p>
            
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                <textarea
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="Enter your core intent, e.g., 'A decentralized system for verifying scientific claims' or 'A protocol for high-signal team communication'..."
                    rows={4}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <div className="flex justify-end">
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !intent}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <HeartCircuitIcon className="w-5 h-5"/>
                        {isLoading ? 'Synthesizing...' : 'Generate Blueprint'}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                        <BrainCircuitIcon className="w-10 h-10 animate-pulse mb-4" />
                        <p>Achieving brain-heart coherence... Synthesizing syntropic order...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {blueprint && !isLoading && (
                    <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-700/50 space-y-8">
                       <BlueprintSection subtitle="The Heart" title="Core Resonance" content={blueprint.coreResonance} />
                       <BlueprintSection subtitle="The Brain" title="Neuromorphic Structure" content={blueprint.neuromorphicStructure} />
                       <BlueprintSection subtitle="The Path" title="Syntropic Trajectory" content={blueprint.syntropicTrajectory} />
                       <BlueprintSection subtitle="The Feedback Loop" title="Coherence Metrics" content={blueprint.coherenceMetrics} />
                    </div>
                )}
            </div>
        </div>
    );
};
