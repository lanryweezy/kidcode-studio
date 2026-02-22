
import React from 'react';
import { useStore } from '../store/useStore';
import { Trophy, RotateCcw, Home, Skull } from 'lucide-react';

const GameOverModal: React.FC<any> = ({ onRestart }) => {
  const { gameState, setGameState, setShowHome } = useStore();

  if (gameState === 'playing') return null;

  const isWin = gameState === 'won';

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border-4 border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">
        
        {/* Icon Area */}
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-xl ${isWin ? 'bg-yellow-500 animate-bounce' : 'bg-red-500 animate-pulse'}`}>
          {isWin ? <Trophy size={48} fill="currentColor" /> : <Skull size={48} fill="currentColor" />}
        </div>

        <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase italic">
          {isWin ? 'Level Complete!' : 'Game Over'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-bold">
          {isWin ? "You're a master coder! Ready for the next challenge?" : "Don't give up! Every mistake is a lesson."}
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => { setGameState('playing'); onRestart(); }}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all ${isWin ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <RotateCcw size={20} /> {isWin ? 'PLAY AGAIN' : 'TRY AGAIN'}
          </button>
          
          <button 
            onClick={() => { setGameState('playing'); setShowHome(true); }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-all"
          >
            <Home size={20} /> EXIT TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
