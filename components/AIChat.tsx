
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm your AI Copilot. Describe what you want to build, and I'll write the blocks for you." }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md">
          <Sparkles size={16} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 leading-tight">AI Agent</h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Copilot Active</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div className={`
              max-w-[85%] text-sm leading-relaxed p-3 rounded-2xl shadow-sm border
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-white border-slate-700 rounded-tr-none' 
                : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
             <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} />
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                <span className="text-xs text-slate-400 font-medium">Generating blocks...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask to create a game, app, or circuit..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-3 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none resize-none custom-scrollbar"
            rows={2} 
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-300 text-white rounded-lg transition-all"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          AI can make mistakes. Review generated code.
        </p>
      </div>
    </div>
  );
};

export default AIChat;
