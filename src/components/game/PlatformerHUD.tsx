import React from 'react';
import { Heart, Star, Coins, Zap, ArrowUp } from 'lucide-react';

interface PlatformerHUDProps {
  health?: number;
  maxHealth?: number;
  stars?: number;
  coins?: number;
  hasDoubleJump?: boolean;
  hasWallJump?: boolean;
  hasDash?: boolean;
}

export const PlatformerHUD: React.FC<PlatformerHUDProps> = React.memo(({
  health = 3,
  maxHealth = 3,
  stars = 0,
  coins = 0,
  hasDoubleJump = false,
  hasWallJump = false,
  hasDash = false,
}) => {
  return (
    <div className="absolute top-4 left-4 z-40 pointer-events-none" role="status" aria-label="Player status">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 p-3 space-y-2">
        {/* Health hearts */}
        <div className="flex items-center gap-1" aria-label={`Health: ${health} of ${maxHealth}`} role="img">
          {Array.from({ length: maxHealth }).map((_, i) => (
            <Heart
              key={i}
              size={16}
              className={i < health ? 'text-red-500 fill-red-500' : 'text-slate-600'}
              aria-hidden="true"
            />
          ))}
        </div>
        
        {/* Stars */}
        <div className="flex items-center gap-2" aria-label={`Stars: ${stars}`}>
          <Star size={14} className="text-yellow-400" aria-hidden="true" />
          <span className="text-sm font-bold text-white">{stars}</span>
        </div>
        
        {/* Coins */}
        <div className="flex items-center gap-2" aria-label={`Coins: ${coins}`}>
          <span className="text-sm" aria-hidden="true">🪙</span>
          <span className="text-sm font-bold text-yellow-300">{coins}</span>
        </div>
        
        {/* Abilities */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-700" role="list" aria-label="Abilities">
          {hasDoubleJump && (
            <span className="text-[9px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded font-bold" role="listitem">DOUBLE JUMP</span>
          )}
          {hasWallJump && (
            <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded font-bold" role="listitem">WALL JUMP</span>
          )}
          {hasDash && (
            <span className="text-[9px] bg-cyan-900/50 text-cyan-300 px-1.5 py-0.5 rounded font-bold" role="listitem">AIR DASH</span>
          )}
        </div>
      </div>
    </div>
  );
});
