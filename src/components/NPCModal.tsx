
import React from 'react';
import { useStore } from '../store/useStore';
import { MessageSquare, X, ChevronRight } from 'lucide-react';

const NPCModal: React.FC = () => {
  const { npcChat, setNpcChat } = useStore();

  if (!npcChat) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center p-8 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-indigo-500 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex items-start gap-6 p-6">
          {/* Avatar Circle */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0 animate-bounce-sm">
            <MessageSquare size={40} fill="currentColor" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{npcChat.name}</h3>
              <button 
                onClick={() => setNpcChat(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "{npcChat.message}"
            </p>
          </div>
        </div>

        {/* Footer / Interaction */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end items-center border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setNpcChat(null)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NPCModal;
