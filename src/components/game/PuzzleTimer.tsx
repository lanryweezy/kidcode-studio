import React, { useState, useEffect } from 'react';
import { Timer, Star, RotateCcw } from 'lucide-react';

interface PuzzleTimerProps {
  timeRemaining?: number;
  totalTime?: number;
  score?: number;
  moves?: number;
  onRestart?: () => void;
}

export const PuzzleTimer: React.FC<PuzzleTimerProps> = React.memo(({
  timeRemaining = 60,
  totalTime = 60,
  score = 0,
  moves = 0,
  onRestart,
}) => {
  const timePercent = (timeRemaining / totalTime) * 100;
  const timeColor = timePercent > 50 ? 'text-green-400' : timePercent > 20 ? 'text-yellow-400' : 'text-red-400 animate-pulse';
  const stars = score >= 500 ? 3 : score >= 200 ? 2 : score >= 50 ? 1 : 0;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 px-4 py-2 flex items-center gap-4">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <Timer size={16} className={timeColor} />
          <span className={`text-lg font-mono font-black ${timeColor}`}>{timeRemaining}s</span>
        </div>

        {/* Timer Bar */}
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${timePercent > 50 ? 'bg-green-500' : timePercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${timePercent}%` }} />
        </div>

        {/* Score */}
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400" />
          <span className="text-sm font-bold text-white">{score}</span>
        </div>

        {/* Moves */}
        <div className="text-xs text-slate-400">Moves: {moves}</div>

        {/* Stars */}
        <div className="flex gap-0.5">
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-slate-600'}>⭐</span>
          ))}
        </div>
      </div>
    </div>
  );
});
