import React, { useState } from 'react';

interface SportsEntityPaletteProps {
  onSelectEntity?: (emoji: string, type: string) => void;
}

const ENTITY_CATEGORIES = [
  {
    id: 'balls',
    label: 'Balls',
    items: [
      { emoji: '⚽', name: 'Football' },
      { emoji: '🏀', name: 'Basketball' },
      { emoji: '🎾', name: 'Tennis' },
      { emoji: '🏈', name: 'American Football' },
      { emoji: '⚾', name: 'Baseball' },
      { emoji: '🏐', name: 'Volleyball' },
      { emoji: '🏉', name: 'Rugby' },
      { emoji: '🏏', name: 'Cricket' },
    ],
  },
  {
    id: 'goals',
    label: 'Goals & Nets',
    items: [
      { emoji: '🥅', name: 'Goal Net' },
      { emoji: '🔴', name: 'Basketball Hoop' },
      { emoji: '⛳', name: 'Golf Flag' },
      { emoji: '🎯', name: 'Target' },
    ],
  },
  {
    id: 'equipment',
    label: 'Equipment',
    items: [
      { emoji: '🥊', name: 'Boxing Glove' },
      { emoji: '🥋', name: 'MMA Glove' },
      { emoji: '🛹', name: 'Skateboard' },
      { emoji: '🏂', name: 'Snowboard' },
      { emoji: '🏄', name: 'Surfboard' },
      { emoji: '👟', name: 'Sneakers' },
      { emoji: '🧤', name: 'Gloves' },
      { emoji: '🎽', name: 'Jersey' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      { emoji: '🏃', name: 'Runner' },
      { emoji: '🚴', name: 'Cyclist' },
      { emoji: '🏋️', name: 'Lifter' },
      { emoji: '🤸', name: 'Gymnast' },
      { emoji: '🏊', name: 'Swimmer' },
      { emoji: '⛷️', name: 'Skier' },
      { emoji: '🧑‍⚖️', name: 'Referee' },
      { emoji: '🧑‍🏫', name: 'Coach' },
    ],
  },
  {
    id: 'rewards',
    label: 'Rewards',
    items: [
      { emoji: '🏆', name: 'Trophy' },
      { emoji: '🏅', name: 'Gold Medal' },
      { emoji: '🥈', name: 'Silver Medal' },
      { emoji: '🥉', name: 'Bronze Medal' },
      { emoji: '🏟️', name: 'Stadium' },
      { emoji: '🎫', name: 'Ticket' },
    ],
  },
  {
    id: 'nature',
    label: 'Environment',
    items: [
      { emoji: '🌊', name: 'Wave' },
      { emoji: '🏔️', name: 'Mountain' },
      { emoji: '🌲', name: 'Tree' },
      { emoji: '☀️', name: 'Sun' },
      { emoji: '🌧️', name: 'Rain' },
      { emoji: '❄️', name: 'Snow' },
    ],
  },
];

export const SportsEntityPalette: React.FC<SportsEntityPaletteProps> = ({ onSelectEntity }) => {
  const [activeCategory, setActiveCategory] = useState('balls');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const activeItems = ENTITY_CATEGORIES.find(c => c.id === activeCategory)?.items || [];

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-slate-400 uppercase">Sports Entities</div>
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {ENTITY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
              activeCategory === cat.id
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Entity grid */}
      <div className="grid grid-cols-4 gap-2">
        {activeItems.map(entity => (
          <button
            key={entity.emoji}
            onClick={() => {
              setSelectedEntity(entity.emoji);
              onSelectEntity?.(entity.emoji, entity.name);
            }}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:scale-110 ${
              selectedEntity === entity.emoji
                ? 'border-green-400 bg-green-900/30'
                : 'border-slate-600 bg-slate-800 hover:border-amber-400'
            }`}
            title={entity.name}
          >
            <div className="text-2xl">{entity.emoji}</div>
            <div className="text-[8px] text-slate-500 mt-0.5 truncate w-full text-center">{entity.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
