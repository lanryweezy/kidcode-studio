import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ENEMY_TYPES, EnemyType } from '../../constants/enemies';
import { Search } from 'lucide-react';

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy', color: 'text-emerald-500' },
  { id: 'medium', label: 'Medium', color: 'text-amber-500' },
  { id: 'hard', label: 'Hard', color: 'text-red-500' },
  { id: 'boss', label: 'Boss', color: 'text-purple-500' },
];

const getDifficulty = (hp: number): string => {
  if (hp <= 30) return 'easy';
  if (hp <= 60) return 'medium';
  if (hp <= 120) return 'hard';
  return 'boss';
};

export const EnemySelector: React.FC = () => {
  const { appState, updateAppState } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType | null>(null);
  const [gameDifficulty, setGameDifficulty] = useState<'casual' | 'normal' | 'hard' | 'nightmare'>('normal');

  const filteredEnemies = ENEMY_TYPES.filter(enemy => {
    const matchesSearch = enemy.name.toLowerCase().includes(search.toLowerCase()) ||
                          enemy.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || getDifficulty(enemy.hp) === filter;
    return matchesSearch && matchesFilter;
  });

  const selectEnemy = (enemy: EnemyType) => {
    setSelectedEnemy(enemy);
    updateAppState({ activeLevelTool: `enemy_${enemy.id}` });
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enemy Types</div>

      {/* Game Difficulty Dropdown */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500">Game Difficulty</span>
        <select
          value={gameDifficulty}
          onChange={(e) => setGameDifficulty(e.target.value as any)}
          className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
            gameDifficulty === 'casual' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            gameDifficulty === 'normal' ? 'bg-blue-50 text-blue-600 border-blue-200' :
            gameDifficulty === 'hard' ? 'bg-amber-50 text-amber-600 border-amber-200' :
            'bg-red-50 text-red-600 border-red-200'
          }`}
          aria-label="Select game difficulty"
        >
          <option value="casual">Casual</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
          <option value="nightmare">Nightmare</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search enemies..."
          className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-sm outline-none"
        />
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-1">
        {DIFFICULTY_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              filter === f.id
                ? 'bg-violet-100 text-violet-600'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Enemy Grid */}
      <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
        {filteredEnemies.map(enemy => {
          const difficulty = getDifficulty(enemy.hp);
          const diffColor = difficulty === 'easy' ? 'border-emerald-300' : difficulty === 'medium' ? 'border-amber-300' : difficulty === 'hard' ? 'border-red-300' : 'border-purple-300';
          return (
            <button
              key={enemy.id}
              onClick={() => selectEnemy(enemy)}
              className={`flex flex-col items-center p-2 rounded-lg text-left transition-all ${
                selectedEnemy?.id === enemy.id
                  ? `bg-violet-100 border-2 ${diffColor} scale-105`
                  : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
              }`}
            >
              <span className="text-2xl mb-1">{enemy.emoji}</span>
              <span className="text-[10px] font-bold text-slate-700 text-center">{enemy.name}</span>
              <span className="text-[8px] text-slate-400 text-center">{enemy.description.slice(0, 30)}...</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[8px] text-red-400">HP:{enemy.hp}</span>
                <span className="text-[8px] text-orange-400">DMG:{enemy.damage}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Enemy Info */}
      {selectedEnemy && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{selectedEnemy.emoji}</span>
            <div>
              <div className="text-sm font-bold text-slate-700">{selectedEnemy.name}</div>
              <div className="text-[10px] text-slate-400">{selectedEnemy.description}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-1">
              <div className="text-xs font-bold text-red-500">{selectedEnemy.hp}</div>
              <div className="text-[8px] text-slate-400">HP</div>
            </div>
            <div className="bg-white rounded-lg p-1">
              <div className="text-xs font-bold text-orange-500">{selectedEnemy.damage}</div>
              <div className="text-[8px] text-slate-400">DMG</div>
            </div>
            <div className="bg-white rounded-lg p-1">
              <div className="text-xs font-bold text-blue-500">{selectedEnemy.xpReward}</div>
              <div className="text-[8px] text-slate-400">XP</div>
            </div>
          </div>
          {selectedEnemy.weakness && (
            <div className="mt-2 text-[10px] text-slate-500">
              Weak to: <span className="font-bold text-amber-500">{selectedEnemy.weakness}</span>
            </div>
          )}
          {selectedEnemy.drops && (
            <div className="text-[10px] text-slate-500">
              Drops: <span className="font-bold text-emerald-500">{selectedEnemy.drops}</span>
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-center text-slate-400">
        {ENEMY_TYPES.length} enemy types • Click to place on canvas
      </div>
    </div>
  );
};
