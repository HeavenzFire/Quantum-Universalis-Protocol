import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FileMetadataResponse } from '@google/genai';
import { MicIcon, AudioLinesIcon } from '../Icons';

type Status = 'idle' | 'recording' | 'processing' | 'error';

export const TranscriptionView: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [transcript, setTranscript] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        setStatus('recording');
        setError(null);
        setTranscript(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleStopRecording;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Could not access microphone.';
            setError(errorMessage);
            setStatus('error');
        }
    };

    const handleStopRecording = async () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        
        // Stop the media stream tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

        setStatus('processing');
        
        if (audioChunksRef.current.length === 0) {
            setError("No audio was recorded.");
            setStatus('error');
            return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        let uploadedFile: FileMetadataResponse | null = null;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const uploadResult = await ai.files.upload({
                file: audioBlob,
                mimeType: audioBlob.type,
                displayName: `transcription-audio-${Date.now()}.webm`,
            });
            uploadedFile = uploadResult.file;
            
            const filePart = { fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri } };
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: ["Transcribe this audio recording.", filePart],
            });

            setTranscript(result.text);
            setStatus('idle');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Transcription failed: ${errorMessage}`);
            setStatus('error');
        } finally {
            if (uploadedFile) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                await ai.files.delete({ name: uploadedFile.name });
            }
        }
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
             if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }
    }, []);

    const isLoading = status === 'processing';
    const isRecording = status === 'recording';

    const renderButton = () => {
        if (isRecording) {
            return (
                <button onClick={handleStopRecording} className="px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition flex items-center justify-center gap-2">
                    <MicIcon className="w-6 h-6"/>
                    Stop Recording
                </button>
            );
        }
        return (
            <button onClick={handleStartRecording} disabled={isLoading} className="px-8 py-4 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <MicIcon className="w-6 h-6"/>
                {isLoading ? 'Processing...' : 'Start Recording'}
            </button>
        );
    }

    return (
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Audio Transcription</h2>
            <p className="text-slate-400 mb-8">Record audio using your microphone and get a transcript using Gemini.</p>

            <div className="flex justify-center mb-8">
                {renderButton()}
            </div>
            
            {isRecording && (
                <div className="flex flex-col items-center justify-center text-slate-400">
                    <AudioLinesIcon className="w-12 h-12 text-cyan-400 animate-pulse" />
                    <p className="mt-2">Recording in progress...</p>
                </div>
            )}
            
            <div className="mt-6 text-left">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-950/50 border border-slate-700/50 rounded-lg">
                        <AudioLinesIcon className="w-10 h-10 animate-pulse mb-4" />
                        <p>Processing audio and generating transcript...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {transcript && !isLoading && (
                    <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-700/50">
                       <h3 className="font-semibold text-cyan-400 mb-2">Transcript</h3>
                       <p className="text-slate-300 whitespace-pre-wrap">{transcript}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
