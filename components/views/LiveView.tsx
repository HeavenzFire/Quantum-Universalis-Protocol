import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MicIcon } from '../Icons';

// --- Audio Helper Functions ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---

type SessionState = 'idle' | 'connecting' | 'active' | 'error';
type TranscriptionTurn = { speaker: 'You' | 'Assistant'; text: string };

export const LiveView: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [transcription, setTranscription] = useState<TranscriptionTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const cleanUp = useCallback(() => {
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    
    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;

    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;
    
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

  }, []);

  const handleStop = useCallback(() => {
    cleanUp();
    setSessionState('idle');
    setTranscription([]);
  }, [cleanUp]);
  
  const handleStart = async () => {
    setSessionState('connecting');
    setError(null);
    setTranscription([]);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are the voice of the Quantum Universalis Protocol, a practical operating system built from the methods of history’s sharpest builders. Be concise, insightful, and direct.",
        },
        callbacks: {
          onopen: () => {
            setSessionState('active');
            
            const CrossBrowserAudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!CrossBrowserAudioContext) {
              const errorMessage = "Your browser does not support the Web Audio API, which is required for this feature.";
              setError(errorMessage);
              setSessionState('error');
              cleanUp();
              return;
            }

            inputAudioContextRef.current = new CrossBrowserAudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new CrossBrowserAudioContext({ sampleRate: 24000 });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
             }
             if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
             }

             if(message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();
                setTranscription(prev => {
                    const newTurns: TranscriptionTurn[] = [];
                    if(fullInput) newTurns.push({ speaker: 'You', text: fullInput});
                    if(fullOutput) newTurns.push({ speaker: 'Assistant', text: fullOutput });
                    return [...prev, ...newTurns];
                });
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
             }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (audioData && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => { outputSourcesRef.current.delete(source); });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              outputSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                outputSourcesRef.current.forEach(s => s.stop());
                outputSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(e.message || 'An unknown error occurred.');
            setSessionState('error');
            cleanUp();
          },
          onclose: (e: CloseEvent) => {
            cleanUp();
            if(sessionState !== 'idle' && sessionState !== 'error') {
                setSessionState('idle');
            }
          },
        },
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session.';
      setError(errorMessage);
      setSessionState('error');
      cleanUp();
    }
  };
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);

  useEffect(() => {
    return () => cleanUp();
  }, [cleanUp]);

  const getButtonContent = () => {
      switch(sessionState) {
          case 'idle':
              return 'Start Conversation';
          case 'connecting':
              return 'Connecting...';
          case 'active':
              return 'Stop Conversation';
          case 'error':
              return 'Try Again';
      }
  }

  const handleButtonClick = () => {
      if(sessionState === 'active') {
          handleStop();
      } else {
          handleStart();
      }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Live Conversation</h2>
        <p className="text-slate-400 mb-6">Speak directly with the Quantum Universalis Protocol assistant. Your conversation will be transcribed in real-time below.</p>
        
        <div className="flex-1 p-4 mb-4 rounded-lg bg-slate-950/50 border border-slate-700/50 overflow-y-auto">
            {transcription.length === 0 && sessionState !== 'error' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MicIcon className="w-16 h-16 mb-4" />
                    <p>Your transcribed conversation will appear here.</p>
                </div>
            )}
            <div className="space-y-4">
                {transcription.map((turn, index) => (
                    <div key={index} className="flex gap-3">
                        <span className={`font-bold flex-shrink-0 ${turn.speaker === 'You' ? 'text-cyan-400' : 'text-slate-300'}`}>
                            {turn.speaker}:
                        </span>
                        <p className="text-slate-300 whitespace-pre-wrap">{turn.text}</p>
                    </div>
                ))}
                <div ref={transcriptEndRef} />
            </div>
             {error && (
                <div className="text-red-400 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
                    <p className="font-semibold">An Error Occurred</p>
                    <p>{error}</p>
                </div>
            )}
        </div>

        <div className="flex justify-center">
            <button
                onClick={handleButtonClick}
                disabled={sessionState === 'connecting'}
                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {getButtonContent()}
            </button>
        </div>
    </div>
  );
};