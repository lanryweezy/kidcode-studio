import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Shield, Zap, Sword, Trophy, Coins, Star,
  Target, Map, Package, Scroll, ChevronUp, ChevronDown,
  AlertTriangle, Clock, Flame, Snowflake, Wind, Skull,
  Minimize2, Maximize2
} from 'lucide-react';
import { SpriteState } from '../../types';

interface RPGGameHUDProps {
  spriteState: SpriteState;
  isVisible: boolean;
}

/**
 * RPG Game HUD - Displays all RPG elements
 * 
 * This component DEMONSTRATES what KidCode Studio is MISSING:
 * - Character stats panel (STR/DEF/SPD)
 * - Status effect indicators
 * - Wave counter
 * - Minimap
 * - Quest tracker
 * - XP bar with level display
 * - Inventory quick bar
 * - Boss health bar
 */

export const RPGGameHUD: React.FC<RPGGameHUDProps> = ({ spriteState, isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMinimap, setShowMinimap] = useState(false);

  if (!isVisible) return null;

  const vars = spriteState.variables || {};
  const playerLevel = (vars.playerLevel as number) || 1;
  const playerXP = (vars.playerXP as number) || 0;
  const playerXPToLevel = (vars.playerXPToLevel as number) || 100;
  const playerSTR = (vars.playerSTR as number) || 10;
  const playerDEF = (vars.playerDEF as number) || 5;
  const playerSPD = (vars.playerSPD as number) || 8;
  const gold = (vars.gold as number) || 0;
  const currentWave = (vars.currentWave as number) || 1;
  const totalWaves = (vars.totalWaves as number) || 10;
  const poisonTimer = (vars.poisonTimer as number) || 0;
  const burnTimer = (vars.burnTimer as number) || 0;
  const freezeTimer = (vars.freezeTimer as number) || 0;
  const stunTimer = (vars.stunTimer as number) || 0;
  const shieldTimer = (vars.shieldTimer as number) || 0;
  const speedBoostTimer = (vars.speedBoostTimer as number) || 0;

  const xpPercent = playerXPToLevel > 0 ? (playerXP / playerXPToLevel) * 100 : 0;
  const healthPercent = spriteState.maxHealth > 0 ? (spriteState.health / spriteState.maxHealth) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      {/* Top Bar: Level, HP, XP */}
      <div className="flex items-start justify-between p-2 pointer-events-auto">
        {/* Left: Level & Stats */}
        <div className="flex flex-col gap-1">
          {/* Level Badge */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2 border border-violet-500/30">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-white font-bold text-sm">Lv.{playerLevel}</span>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{playerXP}/{playerXPToLevel} XP</span>
          </div>

          {/* HP Bar */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2 border border-red-500/30">
            <Heart size={14} className="text-red-400" fill="currentColor" />
            <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  healthPercent > 60 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  healthPercent > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-white text-xs font-bold">{spriteState.health}/{spriteState.maxHealth}</span>
          </div>

          {/* Stats Row */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-3 border border-slate-700/50">
            <div className="flex items-center gap-1" title="Strength">
              <Sword size={10} className="text-orange-400" />
              <span className="text-orange-400 text-[10px] font-bold">{playerSTR}</span>
            </div>
            <div className="flex items-center gap-1" title="Defense">
              <Shield size={10} className="text-blue-400" />
              <span className="text-blue-400 text-[10px] font-bold">{playerDEF}</span>
            </div>
            <div className="flex items-center gap-1" title="Speed">
              <Zap size={10} className="text-yellow-400" />
              <span className="text-yellow-400 text-[10px] font-bold">{playerSPD}</span>
            </div>
            <div className="flex items-center gap-1" title="Gold">
              <Coins size={10} className="text-yellow-500" />
              <span className="text-yellow-500 text-[10px] font-bold">{gold}</span>
            </div>
          </div>
        </div>

        {/* Right: Wave & Status Effects */}
        <div className="flex flex-col items-end gap-1">
          {/* Wave Counter */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2 border border-amber-500/30">
            <Target size={14} className="text-amber-400" />
            <span className="text-white text-xs font-bold">Wave {currentWave}/{totalWaves}</span>
          </div>

          {/* Status Effects */}
          <div className="flex gap-1">
            {poisonTimer > 0 && (
              <div className="bg-purple-900/80 backdrop-blur-sm rounded px-2 py-1 border border-purple-500/30 flex items-center gap-1">
                <Skull size={10} className="text-purple-400" />
                <span className="text-purple-300 text-[10px]">{poisonTimer}s</span>
              </div>
            )}
            {burnTimer > 0 && (
              <div className="bg-orange-900/80 backdrop-blur-sm rounded px-2 py-1 border border-orange-500/30 flex items-center gap-1">
                <Flame size={10} className="text-orange-400" />
                <span className="text-orange-300 text-[10px]">{burnTimer}s</span>
              </div>
            )}
            {freezeTimer > 0 && (
              <div className="bg-blue-900/80 backdrop-blur-sm rounded px-2 py-1 border border-blue-500/30 flex items-center gap-1">
                <Snowflake size={10} className="text-blue-400" />
                <span className="text-blue-300 text-[10px]">{freezeTimer}s</span>
              </div>
            )}
            {stunTimer > 0 && (
              <div className="bg-yellow-900/80 backdrop-blur-sm rounded px-2 py-1 border border-yellow-500/30 flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" />
                <span className="text-yellow-300 text-[10px]">{stunTimer}s</span>
              </div>
            )}
            {shieldTimer > 0 && (
              <div className="bg-emerald-900/80 backdrop-blur-sm rounded px-2 py-1 border border-emerald-500/30 flex items-center gap-1">
                <Shield size={10} className="text-emerald-400" />
                <span className="text-emerald-300 text-[10px]">{shieldTimer}s</span>
              </div>
            )}
            {speedBoostTimer > 0 && (
              <div className="bg-cyan-900/80 backdrop-blur-sm rounded px-2 py-1 border border-cyan-500/30 flex items-center gap-1">
                <Wind size={10} className="text-cyan-400" />
                <span className="text-cyan-300 text-[10px]">{speedBoostTimer}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Quick Inventory */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-700/50">
          {spriteState.inventory.slice(0, 5).map((item, idx) => (
            <div
              key={item.id}
              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border transition-all ${
                idx === 0
                  ? 'bg-violet-900/50 border-violet-500/50 scale-110'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
              }`}
              title={`${item.name} (x${item.quantity})`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.quantity > 1 && (
                <span className="text-[8px] text-slate-400 absolute -mt-4 -mr-4 bg-slate-900 rounded-full px-1">
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Boss Health Bar (when boss is active) */}
      {spriteState.activeBoss && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto w-80">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-500/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{spriteState.activeBoss.emoji}</span>
                <span className="text-red-400 font-bold text-sm">{spriteState.activeBoss.name}</span>
              </div>
              <span className="text-red-300 text-xs">
                {spriteState.activeBoss.health}/{spriteState.activeBoss.maxHealth}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-300"
                style={{ width: `${(spriteState.activeBoss.health / spriteState.activeBoss.maxHealth) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-500">Phase {spriteState.activeBoss.phase}</span>
              <span className="text-[10px] text-red-400">
                {spriteState.activeBoss.attackPattern.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPGGameHUD;
