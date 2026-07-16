import React, { useState, useCallback } from 'react';
import { Zap, Timer, Users, Trophy, Target, Flag, Circle } from 'lucide-react';

const SPORTS_CATEGORIES = [
  { id: 'match', label: 'Match', icon: Timer, items: ['Set Timer', 'Tick Timer', 'Stop Timer', 'Add Period', 'End Period'] },
  { id: 'ball', label: 'Ball', icon: Circle, items: ['Spawn Ball', 'Kick Ball', 'Pass', 'Shoot'] },
  { id: 'teams', label: 'Teams', icon: Users, items: ['Spawn Teammate', 'Spawn Opponent', 'Switch Player', 'Formation'] },
  { id: 'scoring', label: 'Scoring', icon: Trophy, items: ['Score Goal', 'Win Game', 'Game Over'] },
  { id: 'rules', label: 'Rules', icon: Flag, items: ['Foul', 'Yellow Card', 'Red Card'] },
];

interface SportsToolsPanelProps {
  onSelectCommand?: (command: string, params: Record<string, string | number>) => void;
}

export const SportsToolsPanel: React.FC<SportsToolsPanelProps> = React.memo(({ onSelectCommand }) => {
  const [activeCategory, setActiveCategory] = useState('match');

  const handleCategoryClick = useCallback((e: React.MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.categoryId;
    if (id) setActiveCategory(id);
  }, []);

  const handleToolClick = useCallback((e: React.MouseEvent) => {
    const command = (e.currentTarget as HTMLElement).dataset.command;
    if (command) onSelectCommand?.(command, {});
  }, [onSelectCommand]);

  return (
    <div className="space-y-4" aria-label="Sports tools">
      <div className="text-xs font-bold text-slate-600 uppercase section-heading">Sports Tools</div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-lg">
        {SPORTS_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            data-category-id={cat.id}
            onClick={handleCategoryClick}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
              activeCategory === cat.id ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label={`${cat.label} tools`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tool Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-300 p-2 bg-slate-50 rounded-lg">
        {SPORTS_CATEGORIES.find(c => c.id === activeCategory)?.items.map(item => (
          <button
            key={item}
            data-command={item}
            onClick={handleToolClick}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white text-left transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20 active:scale-95"
            aria-label={`Use ${item} tool`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
});
