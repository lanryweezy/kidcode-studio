import React from 'react';
import { Trophy, Star, Coins, Clock, Zap, RotateCcw, Home, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarRating } from './StarRating';

interface LevelCompleteProps {
  score: number;
  coins: number;
  time: number; // seconds
  enemiesDefeated: number;
  combo: number;
  onNextLevel?: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelComplete: React.FC<LevelCompleteProps> = ({
  score,
  coins,
  time,
  enemiesDefeated,
  combo,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  // Calculate star rating based on performance
  const calculateStars = () => {
    let stars = 1;
    if (score > 500) stars++;
    if (coins > 10 && time < 120) stars++;
    return Math.min(3, stars);
  };

  const stars = calculateStars();
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label="Level Complete">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-300 text-center animate-scale-in">
        {/* Trophy */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-glow">
          <Trophy size={40} className="text-white" fill="currentColor" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-violet-600 mb-2">Level Complete!</h2>
        <p className="text-slate-500 mb-4">Great job, adventurer!</p>

        {/* Star Rating */}
        <div className="flex justify-center mb-6">
          <StarRating rating={stars} size="lg" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/50 rounded-xl p-3">
            <Star size={16} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-black text-slate-800">{score}</div>
            <div className="text-[10px] text-slate-500">Score</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <span className="text-lg block mb-1">🪙</span>
            <div className="text-lg font-black text-slate-800">{coins}</div>
            <div className="text-[10px] text-slate-500">Coins</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <Clock size={16} className="text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-black text-slate-800">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</div>
            <div className="text-[10px] text-slate-500">Time</div>
          </div>
          <div className="bg-white/50 rounded-xl p-3">
            <Zap size={16} className="text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-black text-slate-800">{combo}</div>
            <div className="text-[10px] text-slate-500">Best Combo</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" icon={<Home size={16} />} onClick={onHome} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
            Home
          </Button>
          <Button variant="ghost" size="sm" icon={<RotateCcw size={16} />} onClick={onReplay} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
            Replay
          </Button>
          {onNextLevel && (
            <Button variant="primary" size="sm" icon={<ArrowRight size={16} />} onClick={onNextLevel} className="flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
              Next Level
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
