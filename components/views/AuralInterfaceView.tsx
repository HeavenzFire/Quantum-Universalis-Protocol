import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Volume2Icon, XIcon } from '../Icons';

// --- Audio Helper Functions ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const AuralInterfaceView: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopPlayback = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsPlaying(false);
        setIsLoading(false);
    };
    
    const handleSpeak = async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (!text) {
            setError('Please enter some text to speak.');
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error("No audio data received from the API.");
            }

            const CrossBrowserAudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new CrossBrowserAudioContext({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            audioSourceRef.current = source;
            
            source.onended = () => {
                setIsPlaying(false);
                audioSourceRef.current = null;
                 if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
            };
            
            source.start();
            setIsPlaying(true);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate speech: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopPlayback();
        };
    }, []);

    const buttonText = isPlaying ? 'Stop' : (isLoading ? 'Generating...' : 'Speak');

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Aural Interface</h2>
            <p className="text-slate-400 mb-6">Transmute text into speech. The protocol read aloud.</p>
            
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to hear..."
                    rows={8}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <div className="flex justify-end">
                     <button
                        onClick={handleSpeak}
                        disabled={isLoading || !text}
                        className={`px-6 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
                    >
                        {isPlaying ? <XIcon className="w-5 h-5"/> : <Volume2Icon className="w-5 h-5"/>}
                        {buttonText}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {error && (
                    <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};