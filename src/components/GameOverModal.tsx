
import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  score?: number;
  totalBlocksUsed?: number;
  totalBlocksAvailable?: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, score, totalBlocksUsed, totalBlocksAvailable }) => {
  const { gameState, setGameState, setShowHome } = useStore();
  const allBlocksUsed = totalBlocksUsed && totalBlocksAvailable && totalBlocksUsed >= totalBlocksAvailable;

  useEffect(() => {
    if (gameState === 'playing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setGameState('playing'); setShowHome(true); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState, setShowHome]);

  if (gameState === 'playing') return null;

  const isWin = gameState === 'won';

  return (
    <div 
      className="absolute inset-0 z-[110] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-label={isWin ? 'Level Complete' : 'Game Over'}
    >
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#facc15', '#a78bfa', '#34d399', '#f472b6', '#60a5fa'][i % 5],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      <div className={`w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl border-4 text-center animate-in zoom-in-95 duration-300 ${isWin ? 'border-yellow-300' : 'border-slate-200'}`}>
        
        {/* Icon Area */}
        <div className={`relative w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-xl ${isWin ? 'bg-gradient-to-br from-yellow-400 to-amber-500 animate-bounce' : 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse'}`}>
          {isWin ? <Trophy size={48} fill="currentColor" /> : <Skull size={48} fill="currentColor" />}
          {isWin && (
            <div className="absolute -inset-2 rounded-full border-2 border-yellow-300/50 animate-ping" />
          )}
        </div>

        <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          {isWin ? 'Level Complete!' : 'Game Over'}
        </h2>
        <p className="text-slate-500 mb-4 font-bold">
          {isWin ? "You're a master coder! Ready for the next challenge?" : "Don't give up! Every mistake is a lesson."}
        </p>

        {/* Score display */}
        {score !== undefined && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-black ${isWin ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
            ⭐ Score: {score.toLocaleString()}
          </div>
        )}

        {/* All blocks celebration */}
        {allBlocksUsed && isWin && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
            <p className="text-sm font-bold text-violet-700">
              🎉 Perfect! You used every single block! You're a true coding champion!
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={() => { setGameState('playing'); onRestart(); }}
            className={`touch-feedback w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'}`}
          >
            <RotateCcw size={20} /> {isWin ? 'PLAY AGAIN' : 'TRY AGAIN'}
          </button>
          
          <button 
            onClick={() => { setGameState('playing'); setShowHome(true); }}
            className="touch-feedback w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <Home size={20} /> EXIT TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
