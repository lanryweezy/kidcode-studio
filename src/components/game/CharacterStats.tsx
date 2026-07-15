import React from 'react';
import { Swords, Shield, Zap, Heart, Star, ChevronUp } from 'lucide-react';
import { CharacterStats, Difficulty } from '../../types';

interface CharacterStatsPanelProps {
  stats: CharacterStats;
  health: number;
  maxHealth: number;
  gold: number;
  level: number;
}

export const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({
  stats, health, maxHealth, gold, level
}) => {
  const healthPercent = maxHealth > 0 ? (health / maxHealth) * 100 : 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 space-y-3">
      {/* Level & XP */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-black text-lg">{level}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-white font-bold text-sm">Level {level}</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              style={{ width: `${stats.xpToLevel > 0 ? (stats.xp / stats.xpToLevel) * 100 : 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stats.xp}/{stats.xpToLevel} XP</div>
        </div>
      </div>

      {/* HP Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-red-400" fill="currentColor" />
            <span className="text-xs text-slate-400">HP</span>
          </div>
          <span className="text-xs text-white font-bold">{health}/{maxHealth}</span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              healthPercent > 60 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              healthPercent > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Swords size={14} className="text-orange-400" />
          <div>
            <div className="text-[10px] text-slate-500">STR</div>
            <div className="text-sm font-bold text-white">{stats.strength}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Shield size={14} className="text-blue-400" />
          <div>
            <div className="text-[10px] text-slate-500">DEF</div>
            <div className="text-sm font-bold text-white">{stats.defense}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Zap size={14} className="text-yellow-400" />
          <div>
            <div className="text-[10px] text-slate-500">SPD</div>
            <div className="text-sm font-bold text-white">{stats.speed}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <ChevronUp size={14} className="text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-500">CRIT</div>
            <div className="text-sm font-bold text-white">{stats.criticalChance}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DifficultySelectorProps {
  current: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; icon: string; color: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', icon: '😊', color: 'bg-green-500', desc: 'Enemies deal 30% less damage' },
  { value: 'normal', label: 'Normal', icon: '😐', color: 'bg-amber-500', desc: 'Standard difficulty' },
  { value: 'hard', label: 'Hard', icon: '😠', color: 'bg-orange-500', desc: 'Enemies are 50% stronger' },
  { value: 'insane', label: 'Insane', icon: '💀', color: 'bg-red-600', desc: 'Enemies are 2x stronger' },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ current, onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</div>
      <div className="grid grid-cols-2 gap-2">
        {DIFFICULTY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`p-3 rounded-xl text-left transition-all ${
              current === opt.value
                ? `${opt.color} text-white ring-2 ring-white/30`
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{opt.icon}</span>
              <span className="font-bold text-sm">{opt.label}</span>
            </div>
            <div className={`text-[10px] mt-1 ${current === opt.value ? 'text-white/80' : 'text-slate-500'}`}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
