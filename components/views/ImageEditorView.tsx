import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { WandSparklesIcon } from '../Icons';

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

export const ImageEditorView: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImage(null);
      setError(null);
      setPrompt('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const imagePart = await fileToGenerativePart(imageFile);
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      let generatedImage: string | null = null;
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
          generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedImage) {
        setEditedImage(generatedImage);
      } else {
        setError('The model did not return an image. Try a different prompt.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">Image Alchemist</h2>
      <p className="text-slate-400 mb-6">Transmute images with text. Upload a source image, provide a command, and generate a new reality.</p>
      
      {!originalImage && (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700/50 border-dashed rounded-lg cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <WandSparklesIcon className="w-10 h-10 mb-3 text-slate-500"/>
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP, etc.</p>
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleImageUpload} ref={fileInputRef} accept="image/*" />
            </label>
        </div> 
      )}

      {originalImage && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-300">Source Image</h3>
                    <img src={originalImage} alt="Original" className="rounded-lg w-full h-auto object-contain border border-slate-700/50" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-300">Alchemical Result</h3>
                     <div className="w-full aspect-square rounded-lg border border-slate-700/50 bg-slate-950/50 flex items-center justify-center">
                        {isLoading && (
                            <div className="flex flex-col items-center text-slate-400">
                                <WandSparklesIcon className="w-10 h-10 animate-pulse" />
                                <p className="mt-2">Generating...</p>
                            </div>
                        )}
                        {error && (
                            <div className="p-4 text-center text-red-400">
                                <p className="font-semibold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {editedImage && !isLoading && (
                            <img src={editedImage} alt="Edited" className="rounded-lg w-full h-full object-contain" />
                        )}
                        {!isLoading && !error && !editedImage && (
                            <p className="text-slate-500">Your edited image will appear here.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your command, e.g., 'Add a retro filter' or 'Make the background a cyberpunk city'"
                    rows={2}
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
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <WandSparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};