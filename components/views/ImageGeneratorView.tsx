import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ImageIcon, WandSparklesIcon } from '../Icons';

type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const ImageGeneratorView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            const base64ImageBytes = response.generatedImages[0]?.image.imageBytes;
            if (base64ImageBytes) {
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
            } else {
                throw new Error('Image generation succeeded but returned no data.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Image Generator</h2>
            <p className="text-slate-400 mb-6">Generate high-quality images from text prompts using the Imagen model.</p>

            <div className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt, e.g., 'A robot holding a red skateboard.'"
                        rows={3}
                        className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isLoading}
                    />
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-sm font-medium text-slate-300 mr-2">Aspect Ratio:</span>
                            <div className="inline-flex rounded-md shadow-sm mt-2 sm:mt-0" role="group">
                                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map(ar => (
                                    <button
                                        key={ar}
                                        type="button"
                                        onClick={() => setAspectRatio(ar)}
                                        disabled={isLoading}
                                        className={`px-3 py-1.5 text-sm font-medium border transition first:rounded-l-lg last:rounded-r-lg ${aspectRatio === ar ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        {ar}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="w-full sm:w-auto px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <WandSparklesIcon className="w-5 h-5"/>
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>
                </div>

                <div className="w-full aspect-square rounded-lg border border-slate-700/50 bg-slate-950/50 flex items-center justify-center">
                    {isLoading && (
                        <div className="flex flex-col items-center text-slate-400">
                            <ImageIcon className="w-10 h-10 animate-pulse" />
                            <p className="mt-2">Generating image...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="p-4 text-center text-red-400">
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {generatedImage && !isLoading && (
                        <img src={generatedImage} alt="Generated art" className="w-full h-full object-contain rounded-lg" />
                    )}
                    {!isLoading && !error && !generatedImage && (
                        <div className="text-slate-500 flex flex-col items-center">
                            <ImageIcon className="w-12 h-12" />
                            <p className="mt-2">Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
