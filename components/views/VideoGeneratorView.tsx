import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FilmIcon, UploadCloudIcon, XIcon } from '../Icons';

type AspectRatio = '16:9' | '9:16';

const LOADING_MESSAGES = [
  'Initializing quantum loom...',
  'Weaving photonic threads...',
  'Calibrating temporal flux...',
  'Rendering kinetic reality...',
  'This can take a few minutes...',
  'Binding motion to concept...',
  'Finalizing the visual stream...'
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const VideoGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const loadingIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    if (isLoading) {
      loadingIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [isLoading]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition
      setApiKeySelected(true);
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleImageReset = () => {
      setImageFile(null);
      setImageUrl(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  const handleGenerate = async () => {
    if (!prompt && !imageFile) {
      setError('Please enter a prompt or upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      };
      
      if (imageFile) {
        payload.image = {
            imageBytes: await fileToBase64(imageFile),
            mimeType: imageFile.type,
        };
      }
      
      let operation = await ai.models.generateVideos(payload);

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedVideoUrl(url);
      } else {
        throw new Error('Video generation completed, but no download link was provided.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key is invalid. Please select a valid key.");
        setApiKeySelected(false);
      } else {
        setError(`Generation failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
      setPrompt('');
      setAspectRatio('16:9');
      handleImageReset();
      setError(null);
      setGeneratedVideoUrl(null);
      setIsLoading(false);
  }

  if (!apiKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
        <FilmIcon className="w-16 h-16 mb-4 text-slate-500"/>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Veo API Key Required</h2>
        <p className="text-slate-400 mb-6">
          The Video Alchemist uses the Veo API, which requires you to select your own API key and enable billing. You can find more information about billing at{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            ai.google.dev/gemini-api/docs/billing
          </a>.
        </p>
        <button
          onClick={handleSelectKey}
          className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">Video Alchemist</h2>
      <p className="text-slate-400 mb-6">Transmute concepts into motion. Provide a prompt, an optional image, and generate a video with Veo.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {!imageUrl ? (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-700/50 border-dashed rounded-lg cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadCloudIcon className="w-10 h-10 mb-3 text-slate-500"/>
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-cyan-400">Upload an optional image</span></p>
                            <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
                        </div>
                        <input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} ref={fileInputRef} accept="image/*" />
                    </label>
                </div> 
             ) : (
                <div className="relative">
                    <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover rounded-lg"/>
                    <button onClick={handleImageReset} className="absolute top-2 right-2 p-1.5 bg-slate-900/50 rounded-full text-white hover:bg-slate-900/80 transition">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
             )}
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt (e.g., 'A neon hologram of a cat driving at top speed')"
                rows={5}
                className="w-full h-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                disabled={isLoading}
            />
        </div>
        <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                    <span className="text-sm font-medium text-slate-300 mr-4">Aspect Ratio:</span>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" onClick={() => setAspectRatio('16:9')} disabled={isLoading} className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition ${aspectRatio === '16:9' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                            16:9 Landscape
                        </button>
                        <button type="button" onClick={() => setAspectRatio('9:16')} disabled={isLoading} className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition ${aspectRatio === '9:16' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                            9:16 Portrait
                        </button>
                    </div>
                 </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || (!prompt && !imageFile)}
                    className="w-full sm:w-auto px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <FilmIcon className="w-5 h-5"/>
                    {isLoading ? 'Generating...' : 'Generate Video'}
                </button>
            </div>
        </div>
        
        <div className="w-full aspect-video rounded-lg border border-slate-700/50 bg-slate-950/50 flex items-center justify-center">
            {isLoading && (
                <div className="flex flex-col items-center text-slate-400 text-center p-4">
                    <FilmIcon className="w-10 h-10 animate-pulse" />
                    <p className="mt-4 text-lg">{loadingMessage}</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="p-4 text-center text-red-400">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600">Try Again</button>
                </div>
            )}
            {generatedVideoUrl && !isLoading && (
                <video src={generatedVideoUrl} controls className="w-full h-full rounded-lg" />
            )}
            {!isLoading && !error && !generatedVideoUrl && (
                <div className="text-slate-500 flex flex-col items-center">
                    <FilmIcon className="w-12 h-12" />
                    <p className="mt-2">Your generated video will appear here.</p>
                </div>
            )}
        </div>
        
        {(generatedVideoUrl || error) && !isLoading && (
             <div className="flex justify-center">
                 <button onClick={handleReset} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition">
                     Start Over
                 </button>
             </div>
        )}
      </div>
    </div>
  );
};
