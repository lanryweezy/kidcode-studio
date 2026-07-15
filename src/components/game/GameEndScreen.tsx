import React from 'react';
import { RotateCcw, Home, Trophy, Skull, Star, Coins } from 'lucide-react';
import { Button } from '../ui/Button';

interface GameEndScreenProps {
  type: 'victory' | 'gameover';
  score: number;
  coins: number;
  enemiesDefeated: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  type,
  score,
  coins,
  enemiesDefeated,
  onRestart,
  onHome,
}) => {
  const isVictory = type === 'victory';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label={isVictory ? 'Victory' : 'Game Over'}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md mx-4 p-8 rounded-3xl text-center ${
        isVictory
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
          : 'bg-gradient-to-br from-red-50 to-slate-50 border-2 border-red-300'
      }`}>
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center ${
          isVictory
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-glow'
            : 'bg-gradient-to-br from-red-400 to-red-600'
        }`}>
          {isVictory
            ? <Trophy size={40} className="text-white" fill="currentColor" />
            : <Skull size={40} className="text-white" />
          }
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-black mb-2 ${
          isVictory ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {isVictory ? '🎉 Victory!' : '💀 Game Over'}
        </h2>

        <p className="text-slate-500 mb-6">
          {isVictory
            ? 'You saved the kingdom! The dragon is defeated!'
            : 'The adventure ends here... but you can try again!'
          }
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/50 rounded-xl p-3">
            <Star size={20} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-xl font-black text-slate-800">{score}</div>
            <div className="text-[10px] text-slate-400 uppercase">Score</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <span className="text-xl block mb-1">🪙</span>
            <div className="text-xl font-black text-slate-800">{coins}</div>
            <div className="text-[10px] text-slate-400 uppercase">Coins</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <span className="text-xl block mb-1">⚔️</span>
            <div className="text-xl font-black text-slate-800">{enemiesDefeated}</div>
            <div className="text-[10px] text-slate-400 uppercase">Defeated</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth icon={<Home size={16} />} onClick={onHome} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
            Home
          </Button>
          <Button variant={isVictory ? 'success' : 'danger'} fullWidth icon={<RotateCcw size={16} />} onClick={onRestart} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
            {isVictory ? 'Play Again' : 'Try Again'}
          </Button>
        </div>
      </div>
    </div>
  );
};
