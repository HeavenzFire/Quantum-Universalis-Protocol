import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { EyeIcon, UploadCloudIcon, BrainCircuitIcon } from '../Icons';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const ImageAnalysisView: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setPrompt('');
      setAnalysis(null);
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and provide a question or prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const imagePart = await fileToGenerativePart(imageFile);
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });
      
      setAnalysis(response.text);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setPrompt('');
    setError(null);
    setAnalysis(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">Image Analysis</h2>
      <p className="text-slate-400 mb-6">Upload an image and ask questions to gain insights from its content.</p>
      
      {!imageUrl && (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700/50 border-dashed rounded-lg cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloudIcon className="w-10 h-10 mb-3 text-slate-500"/>
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-cyan-400">Click to upload image</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP, etc.</p>
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleImageUpload} ref={fileInputRef} accept="image/*" />
            </label>
        </div> 
      )}

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <img src={imageUrl} alt="Analysis subject" className="rounded-lg w-full h-auto object-contain border border-slate-700/50" />
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask a question about the image..."
                    rows={3}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <EyeIcon className="w-5 h-5"/>
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/50 min-h-[200px]">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Analysis</h3>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <BrainCircuitIcon className="w-10 h-10 animate-pulse" />
                        <p className="mt-2">Analyzing image...</p>
                    </div>
                )}
                 {error && (
                    <div className="p-4 text-center text-red-400">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {analysis && !isLoading && (
                    <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>
                )}
                 {!isLoading && !error && !analysis && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Your analysis will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
