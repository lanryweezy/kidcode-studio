
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, HelpCircle, Globe, MessageSquare, Zap, Cpu, 
  Gamepad2, Layout, Sparkles, BookOpen, ChevronRight 
} from 'lucide-react';

const HelpModal: React.FC = () => {
  const { showHelp, setShowHelp } = useStore();
  const [activeTopic, setActiveTab] = useState<'app' | 'game' | 'hw'>('app');

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-violet-500 overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-violet-500 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={28} fill="currentColor" className="opacity-80" />
            <div>
              <h2 className="text-2xl font-black tracking-tight">KIDCODE ACADEMY</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Master the new blocks!</p>
            </div>
          </div>
          <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation */}
          <div className="w-64 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('app')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTopic === 'app' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 translate-x-2' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            >
              <Layout size={20} /> App Builder
            </button>
            <button 
              onClick={() => setActiveTab('game')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTopic === 'game' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 translate-x-2' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            >
              <Gamepad2 size={20} /> Game Maker
            </button>
            <button 
              onClick={() => setActiveTab('hw')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTopic === 'hw' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-2' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            >
              <Cpu size={20} /> Circuit Lab
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
            {activeTopic === 'app' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-blue-500">
                    <Globe size={24} fill="currentColor" className="opacity-20" />
                    <h3 className="text-xl font-black uppercase italic">Global Variables</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
                    Want to share data between screens? Use variables that start with <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-blue-500 font-bold">global_</code>!
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">Example:</p>
                    <p className="text-xs font-mono text-slate-500 italic">"Save user name on Login screen, show it on Profile screen!"</p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 text-violet-500">
                    <Sparkles size={24} fill="currentColor" className="opacity-20" />
                    <h3 className="text-xl font-black uppercase italic">Custom Widgets</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
                    Create a complex screen and use <span className="font-bold text-violet-500">Define Widget</span> to save it. Then use <span className="font-bold text-violet-500">Use Widget</span> to paste it anywhere else!
                  </p>
                </section>
              </div>
            )}

            {activeTopic === 'game' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-orange-500">
                    <MessageSquare size={24} fill="currentColor" className="opacity-20" />
                    <h3 className="text-xl font-black uppercase italic">AI NPCs</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
                    Use the <span className="font-bold text-orange-500">NPC Chat</span> block to start a conversation. The game will pause until the player reads the message!
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4 text-pink-500">
                    <Zap size={24} fill="currentColor" className="opacity-20" />
                    <h3 className="text-xl font-black uppercase italic">Pro Physics</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
                    Tiles are now solid! You can stand on <span className="font-bold text-slate-800 dark:text-slate-200">Bricks</span> or jump on <span className="font-bold text-pink-500">Springs</span>. Watch out for <span className="font-bold text-red-500">Lava</span>!
                  </p>
                </section>
              </div>
            )}

            {activeTopic === 'hw' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center gap-2 mb-4 text-emerald-500">
                    <Zap size={24} fill="currentColor" className="opacity-20" />
                    <h3 className="text-xl font-black uppercase italic">Logic Gates</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
                    Build smart circuits with <span className="font-bold text-emerald-600 italic">AND, OR, and NOT</span> blocks. They work just like real computer chips!
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase">AND GATE</p>
                      <p className="text-xs italic">Only ON if both inputs are ON.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase">NOT GATE</p>
                      <p className="text-xs italic">Flips ON to OFF and OFF to ON.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Keep building, keep coding, keep creating! 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
