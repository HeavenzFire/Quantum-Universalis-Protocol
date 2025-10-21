import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MessageCircleIcon, BrainCircuitIcon } from '../Icons';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export const ChatView: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash-lite',
            config: {
                systemInstruction: "You are the voice of the Quantum Universalis Protocol, a practical operating system built from the methods of history’s sharpest builders. Be concise, insightful, and direct in your responses.",
            },
        });
        setChat(chatInstance);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = modelResponse;
                    return newMessages;
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if(lastMessage.role === 'model' && lastMessage.content === ''){
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Chat</h2>
            <p className="text-slate-400 mb-6">Engage in a low-latency conversation with the protocol's core intelligence.</p>

            <div className="flex-1 p-4 mb-4 rounded-lg bg-slate-950/50 border border-slate-700/50 overflow-y-auto">
                {messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <MessageCircleIcon className="w-16 h-16 mb-4" />
                        <p>Ask a question to begin the conversation.</p>
                    </div>
                )}
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-cyan-400"/></div>}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-cyan-400 animate-pulse"/></div>
                            <div className="p-3 rounded-lg bg-slate-800 text-slate-300">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {error && (
                <div className="p-2 mb-2 text-center text-sm text-red-400 bg-red-900/20 border border-red-500/50 rounded-md">
                    <p>{error}</p>
                </div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder="Ask anything..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
};