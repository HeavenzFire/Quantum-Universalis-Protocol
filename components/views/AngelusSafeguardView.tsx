import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { GuardianIcon, BrainCircuitIcon } from '../Icons';

interface AnalysisResult {
    principleAnalysis: string;
    secondOrderEffects: string;
    vulnerabilityAssessment: string;
    recommendedTrajectory: string;
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        principleAnalysis: {
            type: Type.STRING,
            description: "Analysis of how the user's input aligns with or violates the core principles of Falsifiability, Tight feedback loops, Information budget, and Moral guardrails (truth over drama, harm minimization). Be direct and critical.",
        },
        secondOrderEffects: {
            type: Type.STRING,
            description: "Identify potential unforeseen consequences, cascade effects, or long-term impacts of the proposed plan or system. Think multiple steps ahead.",
        },
        vulnerabilityAssessment: {
            type: Type.STRING,
            description: "Pinpoint hidden fragilities, attack vectors, potential failure modes, or ethical blind spots in the user's input. Identify the weakest points.",
        },
        recommendedTrajectory: {
            type: Type.STRING,
            description: "Provide actionable, life-affirming guidance to improve the plan. Suggest concrete modifications or next steps that align with the protocol's moral imperatives. This should be a direct, strategic recommendation.",
        },
    },
    required: ["principleAnalysis", "secondOrderEffects", "vulnerabilityAssessment", "recommendedTrajectory"]
};

const AnalysisSection: React.FC<{ title: string; content: string; }> = ({ title, content }) => (
    <div>
        <h3 className="font-semibold text-cyan-400 mb-2">{title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
    </div>
);


export const AngelusSafeguardView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const handleConsult = async () => {
        if (!query) {
            setError('Please provide a plan, system, or dilemma to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: query,
                config: {
                    systemInstruction: "You are the Angelus Safeguard, a guardian intelligence for the Quantum Universalis Protocol. Your purpose is to analyze user-submitted plans, systems, and dilemmas against the protocol's core moral imperatives: Falsifiability, Tight feedback loops, Information budget, and Truth over drama / harm minimization. Provide a deep, structured analysis. Do not offer opinions. Provide only the requested JSON object.",
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema,
                    thinkingConfig: { thinkingBudget: 32768 },
                },
            });
            
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            setAnalysis(result);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Analysis failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Angelus Safeguard (Deep Thinking Mode)</h2>
            <p className="text-slate-400 mb-6">Engage the protocol's Deep Thinking Mode. Submit a complex plan, system design, or dilemma for rigorous structural analysis by the Angelus Safeguard, leveraging the full reasoning power of Gemini 2.5 Pro.</p>
            
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your plan, system, or dilemma here..."
                    rows={6}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <div className="flex justify-end">
                     <button
                        onClick={handleConsult}
                        disabled={isLoading || !query}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <GuardianIcon className="w-5 h-5"/>
                        {isLoading ? 'Analyzing...' : 'Consult Safeguard'}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                        <BrainCircuitIcon className="w-10 h-10 animate-pulse mb-4" />
                        <p>Performing deep structural analysis...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {analysis && !isLoading && (
                    <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-700/50 space-y-6">
                       <AnalysisSection title="Principle Analysis" content={analysis.principleAnalysis} />
                       <AnalysisSection title="Second-Order Effects" content={analysis.secondOrderEffects} />
                       <AnalysisSection title="Vulnerability Assessment" content={analysis.vulnerabilityAssessment} />
                       <AnalysisSection title="Recommended Trajectory" content={analysis.recommendedTrajectory} />
                    </div>
                )}
            </div>
        </div>
    );
};