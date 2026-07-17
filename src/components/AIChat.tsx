
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Bot, User, Volume2, StopCircle, Bug, Glasses, Mic, Wand2, BookOpen } from 'lucide-react';
import { generateCodeFromPromptStream, generateSpeech, reviewCode, getFixedCode } from '../services/geminiService';
import { AppMode, CommandBlock, CommandType } from '../types';
import { useStore } from '../store/useStore';
import { playSoundEffect } from '../services/soundService';
import { startVoiceCommands, stopVoiceCommands, isVoiceListening, isVoiceRecognitionSupported } from '../services/voiceCommands';
import { explainCodeBlocks, buildContextAwarePrompt } from '../services/aiServiceWrapper';

interface AIChatProps {
  currentMode: AppMode;
  onAppendCode: (commands: Omit<CommandBlock, 'id'>[]) => void;
  onReplaceCode?: (commands: Omit<CommandBlock, 'id'>[]) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ currentMode, onAppendCode, onReplaceCode }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "👋 Welcome to your AI Copilot! I can help you build games, apps, and circuits. Just describe what you want to create, and I'll write the code blocks for you. Try one of the suggestions below to get started!" }
  ]);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Smart suggestions based on mode
  const suggestions = currentMode === AppMode.GAME 
    ? ["Add a player that can jump", "Create an enemy that chases", "Add coins to collect", "Make a platformer level"]
    : currentMode === AppMode.APP
    ? ["Create a login screen", "Add a button that speaks", "Make a color picker", "Add a slider control"]
    : ["Make an LED blink", "Read a temperature sensor", "Control a servo motor", "Display text on LCD"];

  useEffect(() => {
    const handleVoiceAddBlock = (e: CustomEvent) => {
      const { type, params } = e.detail;
      const newBlock: Omit<CommandBlock, 'id'> = { type: type as CommandType, params };
      onAppendCode([newBlock]);
      setMessages(prev => [...prev, { role: 'assistant', text: `Added a ${type.replace(/_/g, ' ').toLowerCase()} block!` }]);
    };
    const handleVoiceRunGame = () => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Running the game!' }]);
    };
    window.addEventListener('voice-add-block', handleVoiceAddBlock as EventListener);
    window.addEventListener('voice-run-game', handleVoiceRunGame);
    return () => {
      window.removeEventListener('voice-add-block', handleVoiceAddBlock as EventListener);
      window.removeEventListener('voice-run-game', handleVoiceRunGame);
    };
  }, [onAppendCode]);

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

    const storeState = useStore.getState();
    const contextPrompt = buildContextAwarePrompt(userText, {
      commands: storeState.commands.map(c => ({ type: c.type, params: c.params || {} })),
      consoleLogs: storeState.consoleLogs,
      gameMode: currentMode,
      gameState: storeState.gameState,
    });

    setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

    try {
      const stream = generateCodeFromPromptStream(contextPrompt, currentMode);
      let finalCommands: Omit<CommandBlock, 'id'>[] | undefined;

      for await (const chunk of stream) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', text: chunk.text };
          return newMessages;
        });
        if (chunk.isDone && chunk.commands && chunk.commands.length > 0) {
            finalCommands = chunk.commands;
        }
      }

      if (finalCommands) {
        onAppendCode(finalCommands);
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
    
      const handleReview = async () => {
          const { commands } = useStore.getState();
          if (commands.length === 0) {
              setMessages(prev => [...prev, { role: 'assistant', text: "Your code is empty! Add some blocks first so I can review them. 😊" }]);
              return;
          }
    
          setIsLoading(true);
          setMessages(prev => [...prev, { role: 'user', text: "Can you review my code?" }]);
          
                const review = await reviewCode(commands, currentMode);
                setMessages(prev => [...prev, { role: 'assistant', text: review }]);
                setIsLoading(false);
            };
          
            const handleFix = async () => {
                const { commands } = useStore.getState();
                if (commands.length === 0) {
                    setMessages(prev => [...prev, { role: 'assistant', text: "Your code is empty! Add some blocks first so I can fix them. 😊" }]);
                    return;
                }

                setIsLoading(true);
                setMessages(prev => [...prev, { role: 'user', text: "Can you fix my code?" }]);

                try {
                    const fixedCommands = await getFixedCode(commands, currentMode);
                    if (fixedCommands && onReplaceCode) {
                        onReplaceCode(fixedCommands);
                        setMessages(prev => [...prev, { role: 'assistant', text: "I've fixed your code! 🪄 I corrected logic errors and potential bugs for you." }]);
                        playSoundEffect('powerup');
                    } else if (!onReplaceCode) {
                        setMessages(prev => [...prev, { role: 'assistant', text: "I found a way to fix it, but I can't apply the changes right now. Try asking me for advice!" }]);
                    } else {
                        setMessages(prev => [...prev, { role: 'assistant', text: "I couldn't find any obvious bugs to fix right now, but your code looks interesting! Keep building! 🚀" }]);
                    }
                } catch (error) {
                    console.error("AI Fix error:", error);
                    setMessages(prev => [...prev, { role: 'assistant', text: "Oops! I had trouble fixing your code. Try again in a moment." }]);
                } finally {
                    setIsLoading(false);
                }
            };
  const handleExplain = () => {
      const { commands } = useStore.getState();
      if (commands.length === 0) {
          setMessages(prev => [...prev, { role: 'assistant', text: "Your code is empty! Add some blocks first so I can explain them. 😊" }]);
          return;
      }
      const blocks = commands.map(c => ({ type: c.type, params: c.params || {} }));
      const explanation = explainCodeBlocks(blocks);
      setMessages(prev => [...prev, { role: 'user', text: "Explain my code" }]);
      setMessages(prev => [...prev, { role: 'assistant', text: explanation }]);
  };

  const handleVoiceToggle = () => {
      if (!isVoiceRecognitionSupported()) {
          setMessages(prev => [...prev, { role: 'assistant', text: "Voice commands are not supported in this browser. Try Chrome or Edge!" }]);
          return;
      }
      if (isVoiceActive) {
          stopVoiceCommands();
          setIsVoiceActive(false);
          setVoiceTranscript('');
      } else {
          const started = startVoiceCommands({
              onResult: (result) => {
                  if (result.recognized) {
                      setMessages(prev => [...prev, { role: 'assistant', text: `Voice command: "${result.command}" - Action: ${result.action?.replace(/_/g, ' ')}` }]);
                  } else {
                      setMessages(prev => [...prev, { role: 'assistant', text: `I heard "${result.command}" but didn't recognize a command. Try "add a loop block" or "run the game".` }]);
                  }
                  setIsVoiceActive(false);
                  setVoiceTranscript('');
              },
              onTranscript: (transcript) => {
                  setVoiceTranscript(transcript);
              },
              onError: (error) => {
                  setMessages(prev => [...prev, { role: 'assistant', text: `Voice error: ${error}` }]);
                  setIsVoiceActive(false);
                  setVoiceTranscript('');
              }
          });
          if (started) {
              setIsVoiceActive(true);
          }
      }
  };

  const playMessage = async (text: string, index: number) => {
      if (isPlaying === index) {
          // Stop
          sourceRef.current?.stop();
          setIsPlaying(null);
          return;
      }
      
      // Stop current if any
      if (sourceRef.current) {
          try { sourceRef.current.stop(); } catch { void 0; }
      }
      setIsPlaying(index);

      const buffer = await generateSpeech(text);
      if (buffer) {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtxRef.current.destination);
          source.onended = () => setIsPlaying(null);
          source.start();
          sourceRef.current = source;
      } else {
          setIsPlaying(null);
      }
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
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-in`} style={{ animationDelay: `${(idx % 5) * 50}ms` }}>
            {/* Avatar */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div className={`relative group
              max-w-[85%] text-sm leading-relaxed p-3 rounded-2xl shadow-sm border
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-white border-slate-700 rounded-tr-none' 
                : idx === 0
                  ? 'bg-gradient-to-br from-violet-50 to-purple-50 text-slate-700 border-violet-200 rounded-tl-none ring-1 ring-violet-100'
                  : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'}
            `}>
              {msg.text}
              
              {/* TTS Button */}
              {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playMessage(msg.text, idx)}
                    className="absolute -bottom-6 left-0 p-1 text-slate-500 hover:text-violet-500 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase"
                  >
                      {isPlaying === idx ? <StopCircle size={12} className="animate-pulse" /> : <Volume2 size={12} />}
                      {isPlaying === idx ? 'Stop' : 'Read'}
                  </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-slide-in">
             <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} />
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex items-center gap-2 text-violet-500">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium">AI is generating code...</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {/* Smart Suggestions */}
        {messages.length <= 2 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-500 font-semibold mb-2 flex items-center gap-1">
              <Sparkles size={10} className="text-violet-400" />
              Try these:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 hover:from-violet-200 hover:to-purple-200 text-violet-700 text-xs font-medium rounded-lg transition-all border border-violet-200 hover:border-violet-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3">
            <button 
                type="button"
                onClick={handleReview}
                disabled={isLoading}
                className="flex-1 py-2 bg-violet-100 text-violet-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-violet-200 transition-all disabled:opacity-50"
            >
                <Glasses size={14} /> Review Code
            </button>
            <button 
                type="button"
                onClick={handleFix}
                disabled={isLoading}
                className="flex-1 py-2 bg-orange-100 text-orange-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-200 transition-all disabled:opacity-50"
            >
                <Wand2 size={14} /> Fix It!
            </button>
        </div>
        <div className="flex gap-2 mb-3">
            <button 
                type="button"
                onClick={handleExplain}
                disabled={isLoading}
                className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-200 transition-all disabled:opacity-50"
            >
                <BookOpen size={14} /> Explain Code
            </button>
            <button 
                type="button"
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    isVoiceActive 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
            >
                <Mic size={14} /> {isVoiceActive ? 'Stop Voice' : 'Voice Commands'}
            </button>
        </div>
        {isVoiceActive && voiceTranscript && (
            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 italic">
                Hearing: "{voiceTranscript}"
            </div>
        )}
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
            placeholder="Describe what you want to build..."
            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-violet-400 rounded-xl pl-4 pr-12 py-4 text-base focus:ring-2 focus:ring-violet-200 outline-none resize-none custom-scrollbar shadow-inner"
            rows={3}
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
