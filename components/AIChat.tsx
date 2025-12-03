import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateCodeFromPrompt } from '../services/geminiService';
import { AppMode, CommandBlock } from '../types';

interface AIChatProps {
  currentMode: AppMode;
  onAppendCode: (commands: Omit<CommandBlock, 'id'>[]) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ currentMode, onAppendCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm KidCode Bot 🤖. Ask me to draw something, make a game, or light up LEDs!" }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const response = await generateCodeFromPrompt(userText, currentMode);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response.text }]);
    
    if (response.commands && response.commands.length > 0) {
      onAppendCode(response.commands);
    }
    
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 md:w-96 mb-4 overflow-hidden flex flex-col h-[400px] animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="animate-pulse" />
              <span className="font-bold">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-violet-500 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-violet-500" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type here..." 
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200 transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-violet-500 hover:bg-violet-600 disabled:bg-slate-300 text-white p-2 rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white pl-5 pr-2 py-2 rounded-full shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
      >
        <span className="font-bold">Ask AI Mentor</span>
        <div className="bg-white/20 p-2 rounded-full">
           <Wand2 size={24} />
        </div>
      </button>
      )}
    </div>
  );
};

export default AIChat;