import React, { useEffect, useState } from 'react';
import { Heart, Coins, Star, Shield, Zap, Fuel, Clock, Trophy, Target, Flame, Snowflake, Wind, Sparkles } from 'lucide-react';

interface PowerUpIndicator {
  name: string;
  emoji: string;
  duration: number;
  maxDuration: number;
  color: string;
}

interface StatusEffect {
  type: string;
  duration: number;
  icon: string;
  color: string;
}

interface GameHUDProps {
  health: number;
  maxHealth: number;
  score: number;
  coins: number;
  inventory?: { name: string; icon: string; quantity: number }[];
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  shield?: number;
  maxShield?: number;
  fuel?: number;
  maxFuel?: number;
  combo?: number;
  wave?: number;
  maxWaves?: number;
  level?: number;
  timer?: number;
  timerMax?: number;
  timerWarning?: boolean;
  powerUps?: PowerUpIndicator[];
  statusEffects?: StatusEffect[];
  xp?: number;
  xpToLevel?: number;
  playerName?: string;
  kills?: number;
  accuracy?: number;
}

const STATUS_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  poison: { icon: <Flame size={10} />, color: 'text-green-400' },
  burn: { icon: <Flame size={10} />, color: 'text-orange-400' },
  freeze: { icon: <Snowflake size={10} />, color: 'text-blue-400' },
  stun: { icon: <Zap size={10} />, color: 'text-yellow-400' },
  shield: { icon: <Shield size={10} />, color: 'text-indigo-400' },
  speed: { icon: <Wind size={10} />, color: 'text-cyan-400' },
  regen: { icon: <Sparkles size={10} />, color: 'text-emerald-400' },
};

export const GameHUD: React.FC<GameHUDProps> = React.memo(({
  health, maxHealth, score, coins, inventory = [],
  bossHp, bossMaxHp, bossName,
  shield, maxShield, fuel, maxFuel,
  combo, wave, maxWaves, level,
  timer, timerMax, timerWarning,
  powerUps = [], statusEffects = [],
  xp, xpToLevel, playerName, kills, accuracy,
}) => {
  const [prevHealth, setPrevHealth] = useState(health);
  const [damageFlash, setDamageFlash] = useState(false);
  const [prevScore, setPrevScore] = useState(score);
  const [scorePopup, setScorePopup] = useState<number | null>(null);

  useEffect(() => {
    if (health < prevHealth) { setDamageFlash(true); setTimeout(() => setDamageFlash(false), 300); }
    setPrevHealth(health);
  }, [health, prevHealth]);

  useEffect(() => {
    if (score > prevScore && prevScore > 0) {
      setScorePopup(score - prevScore);
      setTimeout(() => setScorePopup(null), 800);
    }
    setPrevScore(score);
  }, [score, prevScore]);

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const healthColor = healthPercent > 60 ? 'bg-emerald-500' : healthPercent > 30 ? 'bg-amber-500' : 'bg-red-500';
  const healthGlow = healthPercent <= 25 ? 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' : '';
  const timerPercent = timer !== undefined && timerMax ? (timer / timerMax) * 100 : 100;
  const xpPercent = xp !== undefined && xpToLevel ? (xp / xpToLevel) * 100 : 0;

  return (
    <div 
      className={`absolute inset-x-0 top-0 pointer-events-none z-30 p-3 transition-all ${damageFlash ? 'bg-red-500/10' : ''}`}
      role="status"
      aria-label="Game status"
    >
      <div className="flex items-start justify-between">
        {/* Left: Player Stats */}
        <div className="space-y-1.5">
          {/* Player name + Level */}
          {(playerName || level !== undefined) && (
            <div className="flex items-center gap-2 mb-1">
              {playerName && <span className="text-[10px] font-bold text-white drop-shadow-lg">{playerName}</span>}
              {level !== undefined && (
                <div className="bg-violet-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Trophy size={8} className="text-white" />
                  <span className="text-[9px] font-black text-white">LVL {level}</span>
                </div>
              )}
            </div>
          )}

          {/* XP Bar */}
          {xp !== undefined && xpToLevel !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="w-28 h-1.5 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
              <span className="text-[8px] font-bold text-violet-300">{xp}/{xpToLevel}</span>
            </div>
          )}

          {/* Health Bar */}
          <div className={`flex items-center gap-2 ${healthGlow}`} aria-live="polite" aria-atomic="true">
            <Heart size={14} className="text-red-500 fill-red-500" aria-hidden="true" />
            <div 
              className="w-36 h-3.5 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5"
              role="progressbar"
              aria-valuenow={health}
              aria-valuemin={0}
              aria-valuemax={maxHealth}
              aria-label={`Health: ${health} of ${maxHealth}`}
            >
              <div
                className={`h-full ${healthColor} rounded-full transition-all duration-300`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-lg min-w-[50px]" aria-hidden="true">{Math.round(health)}/{maxHealth}</span>
          </div>

          {/* Shield Bar */}
          {shield !== undefined && maxShield !== undefined && maxShield > 0 && (
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-indigo-400" />
              <div className="w-36 h-2 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${(shield / maxShield) * 100}%` }} />
              </div>
              <span className="text-[9px] font-bold text-indigo-300">{Math.round(shield)}</span>
            </div>
          )}

          {/* Fuel Bar */}
          {fuel !== undefined && maxFuel !== undefined && maxFuel > 0 && (
            <div className="flex items-center gap-2">
              <Fuel size={12} className="text-amber-400" />
              <div className="w-36 h-2 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${fuel > 30 ? 'bg-amber-500' : fuel > 10 ? 'bg-orange-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}
                  style={{ width: `${(fuel / maxFuel) * 100}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold ${fuel > 30 ? 'text-amber-300' : 'text-red-400'}`}>{Math.round(fuel)}%</span>
            </div>
          )}

          {/* Score + Combo + Kill */}
          <div className="flex items-center gap-3 mt-1" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-1.5 relative">
              <Star size={12} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
              <span className="text-sm font-bold text-white drop-shadow-lg" aria-label={`Score: ${score}`}>{score.toLocaleString()}</span>
              {scorePopup && (
                <span className="absolute -top-3 left-8 text-[10px] font-bold text-emerald-400 animate-bounce">+{scorePopup}</span>
              )}
            </div>
            {combo !== undefined && combo > 1 && (
              <div className={`flex items-center gap-0.5 backdrop-blur-sm rounded-full px-2 py-0.5 border ${combo >= 10 ? 'bg-orange-500/80 border-orange-400' : combo >= 5 ? 'bg-amber-500/80 border-amber-400' : 'bg-slate-700/80 border-slate-600'}`}>
                <Zap size={10} className="text-white" />
                <span className="text-[10px] font-black text-white">x{combo}</span>
              </div>
            )}
            {kills !== undefined && (
              <div className="flex items-center gap-1">
                <Target size={10} className="text-red-400" />
                <span className="text-[10px] font-bold text-slate-300">{kills}</span>
              </div>
            )}
          </div>

          {/* Coins */}
          {coins > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-yellow-300 drop-shadow-lg">{coins.toLocaleString()}</span>
            </div>
          )}

          {/* Status Effects */}
          {statusEffects.length > 0 && (
            <div className="flex gap-1 mt-1">
              {statusEffects.map((se, i) => {
                const info = STATUS_ICONS[se.type] || { icon: <Zap size={10} />, color: 'text-white' };
                return (
                  <div key={i} className={`flex items-center gap-0.5 bg-slate-900/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-white/10 ${info.color}`}>
                    {info.icon}
                    <span className="text-[8px] font-bold">{Math.ceil(se.duration)}s</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Timer */}
          {timer !== undefined && (
            <div className={`flex items-center gap-1.5 ${timerWarning ? 'animate-pulse' : ''}`} aria-live="polite" aria-atomic="true">
              <Clock size={12} className={timerWarning ? 'text-red-400' : 'text-cyan-400'} aria-hidden="true" />
              <div 
                className="w-20 h-1.5 bg-slate-900/50 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={timer}
                aria-valuemin={0}
                aria-valuemax={timerMax || 100}
                aria-label={`Timer: ${Math.floor(timer / 60)} minutes ${Math.floor(timer % 60)} seconds`}
              >
                <div className={`h-full rounded-full transition-all ${timerWarning ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${timerPercent}%` }} />
              </div>
              <span className={`text-[10px] font-bold font-mono ${timerWarning ? 'text-red-400' : 'text-cyan-300'}`} aria-hidden="true">
                {Math.floor(timer / 60)}:{String(Math.floor(timer % 60)).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Active Power-Ups */}
          {powerUps.length > 0 && (
            <div className="flex gap-1 mt-1">
              {powerUps.map((pu, i) => (
                <div key={i} className={`flex items-center gap-0.5 bg-slate-900/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 border ${pu.color}`}>
                  <span className="text-[10px]">{pu.emoji}</span>
                  <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-current rounded-full transition-all" style={{ width: `${(pu.duration / pu.maxDuration) * 100}%` }} />
                  </div>
                  <span className="text-[8px] font-bold text-white/70">{Math.ceil(pu.duration)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Boss + Wave + Accuracy */}
        <div className="space-y-2">
          {/* Accuracy */}
          {accuracy !== undefined && (
            <div className="flex items-center gap-1 justify-end">
              <Target size={10} className="text-slate-300" />
              <span className="text-[10px] font-bold text-slate-300">{accuracy}%</span>
            </div>
          )}

          {/* Wave/Level */}
          {(wave !== undefined || level !== undefined) && (
            <div className="flex items-center gap-2 justify-end">
              {wave !== undefined && (
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 border border-slate-600/50">
                  <span className="text-[10px] font-bold text-slate-300">Wave {wave}{maxWaves ? `/${maxWaves}` : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Boss HP */}
          {bossHp !== undefined && bossMaxHp !== undefined && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-red-500/30 shadow-lg shadow-red-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-400">{bossName || 'Boss'}</span>
              </div>
              <div className="w-44 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }} />
              </div>
              <div className="text-[10px] text-slate-300 text-right mt-0.5 font-mono">{Math.round(bossHp)}/{bossMaxHp}</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Inventory Bar */}
      {inventory.length > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-900/60 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10 shadow-lg" role="toolbar" aria-label="Inventory">
          {inventory.slice(0, 8).map((item, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded"
              role="button"
              tabIndex={0}
              aria-label={`${item.name}${item.quantity > 1 ? `, quantity ${item.quantity}` : ''}`}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              {item.quantity > 1 && (
                <span className="text-[9px] font-bold text-white bg-slate-800 rounded-full px-1 -mt-1" aria-hidden="true">{item.quantity}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
