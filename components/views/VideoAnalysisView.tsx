import React, { useState, useRef } from 'react';
import { GoogleGenAI, FileMetadataResponse } from '@google/genai';
import { VideoSearchIcon, BrainCircuitIcon } from '../Icons';

type Status = 'idle' | 'uploading' | 'analyzing' | 'error';

export const VideoAnalysisView: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Provide a detailed summary of this video, including key topics discussed and any important visual elements.");
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
      setStatus('idle');
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile || !prompt) {
      setError('Please upload a video and provide a prompt.');
      return;
    }

    setStatus('uploading');
    setError(null);
    setAnalysis(null);
    let uploadedFile: FileMetadataResponse | null = null;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const uploadResult = await ai.files.upload({
        file: videoFile,
        mimeType: videoFile.type,
      });
      uploadedFile = uploadResult.file;

      setStatus('analyzing');

      const filePart = {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      };

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [prompt, filePart],
      });

      setAnalysis(result.text);
      setStatus('idle');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
      setStatus('error');
    } finally {
      if (uploadedFile) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        await ai.files.delete({ name: uploadedFile.name });
      }
    }
  };
  
  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setAnalysis(null);
    setError(null);
    setStatus('idle');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }
  
  const getStatusMessage = () => {
    switch (status) {
        case 'uploading': return 'Uploading video...';
        case 'analyzing': return 'Analyzing video with Gemini...';
        default: return 'Idle';
    }
  };

  const isLoading = status === 'uploading' || status === 'analyzing';

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">Video Analysis</h2>
      <p className="text-slate-400 mb-6">Upload a video and provide a prompt to extract key information using Gemini 2.5 Pro.</p>

      {!videoUrl && (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700/50 border-dashed rounded-lg cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <VideoSearchIcon className="w-10 h-10 mb-3 text-slate-500"/>
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-cyan-400">Click to upload video</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">MP4, MOV, WEBM, etc.</p>
                </div>
                <input id="video-upload" type="file" className="hidden" onChange={handleFileChange} ref={fileInputRef} accept="video/*" />
            </label>
        </div>
      )}

      {videoUrl && (
        <div className="space-y-6">
            <video src={videoUrl} controls className="w-full rounded-lg border border-slate-700/50" />
            
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your analysis prompt..."
                    rows={3}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-4">
                     <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition"
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt || !videoFile}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <VideoSearchIcon className="w-5 h-5"/>
                        {isLoading ? 'Processing...' : 'Analyze Video'}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-950/50 border border-slate-700/50 rounded-lg">
                        <BrainCircuitIcon className="w-10 h-10 animate-pulse mb-4" />
                        <p>{getStatusMessage()}</p>
                    </div>
                )}
                {error && status === 'error' && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {analysis && !isLoading && (
                    <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-700/50">
                       <h3 className="font-semibold text-cyan-400 mb-2">Analysis Result</h3>
                       <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};