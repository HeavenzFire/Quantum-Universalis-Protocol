
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SearchIcon, GlobeIcon, MapIcon, LinkIcon, XIcon, BrainCircuitIcon } from '../Icons';

type GroundingTool = 'googleSearch' | 'googleMaps';
type GroundingChunk = {
    web?: { uri: string; title: string; };
    maps?: { uri: string; title: string; placeAnswerSources?: any[] };
};

export const NexusSearchView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [tool, setTool] = useState<GroundingTool>('googleSearch');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<GenerateContentResponse | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

    useEffect(() => {
        if (tool === 'googleMaps') {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (geoError) => {
                    console.warn("Could not get user location:", geoError.message);
                    setError("Could not get your location. Maps search may be less accurate.");
                }
            );
        }
    }, [tool]);

    const handleSearch = async () => {
        if (!query) {
            setError('Please enter a query.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse(null);
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const config: any = {
                tools: tool === 'googleSearch' ? [{ googleSearch: {} }] : [{ googleMaps: {} }],
            };

            if (tool === 'googleMaps' && userLocation) {
                config.toolConfig = {
                    retrievalConfig: {
                        latLng: userLocation
                    }
                };
            }

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config,
            });

            setResponse(result);
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            setSources(groundingChunks);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Search failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResponse(null);
        setError(null);
        setSources([]);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Nexus Search</h2>
            <p className="text-slate-400 mb-6">Ground your queries in real-time information from Google Search or Google Maps.</p>
            
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                            placeholder={tool === 'googleSearch' ? 'e.g., Who won the most recent F1 race?' : 'e.g., Good coffee shops nearby'}
                            className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm pl-10 pr-10 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            disabled={isLoading}
                        />
                        {query && (
                             <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                <XIcon className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                     <button
                        onClick={handleSearch}
                        disabled={isLoading || !query}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                <div>
                     <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" onClick={() => setTool('googleSearch')} disabled={isLoading} className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition flex items-center gap-2 ${tool === 'googleSearch' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                            <GlobeIcon className="w-4 h-4" /> Google Search
                        </button>
                        <button type="button" onClick={() => setTool('googleMaps')} disabled={isLoading} className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition flex items-center gap-2 ${tool === 'googleMaps' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                           <MapIcon className="w-4 h-4" /> Google Maps
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                        <BrainCircuitIcon className="w-10 h-10 animate-pulse mb-4" />
                        <p>Contacting the nexus...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {response && !isLoading && (
                    <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-700/50">
                        <div className="prose prose-invert prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: response.text.replace(/\n/g, '<br/>') }} />
                        
                        {sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Sources:</h4>
                                <ul className="space-y-2">
                                    {sources.map((chunk, index) => {
                                        const source = chunk.web || chunk.maps;
                                        return source ? (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:underline text-sm">
                                                    <LinkIcon className="w-4 h-4 flex-shrink-0"/>
                                                    <span>{source.title || source.uri}</span>
                                                </a>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
