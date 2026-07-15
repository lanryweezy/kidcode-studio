import React from 'react';
import { useStore } from '../../store/useStore';
import { Sword, Shield, Heart, Coins, Star, Zap, Ghost, Skull, Crown } from 'lucide-react';

interface EntityOption {
  type: string;
  emoji: string;
  label: string;
  category: string;
}

const ENTITY_OPTIONS: EntityOption[] = [
  { type: 'enemy_basic', emoji: '👾', label: 'Basic Enemy', category: 'Enemies' },
  { type: 'enemy_fast', emoji: '🏃', label: 'Fast Enemy', category: 'Enemies' },
  { type: 'enemy_flying', emoji: '🦇', label: 'Flying Enemy', category: 'Enemies' },
  { type: 'enemy_boss', emoji: '🐉', label: 'Boss', category: 'Enemies' },
  { type: 'enemy_asteroid', emoji: '☄️', label: 'Asteroid', category: 'Enemies' },
  { type: 'enemy_drone', emoji: '🤖', label: 'Drone', category: 'Enemies' },
  { type: 'npc_shop', emoji: '🧙', label: 'Shopkeeper', category: 'NPCs' },
  { type: 'npc_quest', emoji: '📜', label: 'Quest Giver', category: 'NPCs' },
  { type: 'npc_guard', emoji: '🛡️', label: 'Guard', category: 'NPCs' },
  { type: 'npc_pilot', emoji: '🧑‍🚀', label: 'Pilot', category: 'NPCs' },
  { type: 'item_coin', emoji: '🪙', label: 'Coin', category: 'Items' },
  { type: 'item_heart', emoji: '❤️', label: 'Health', category: 'Items' },
  { type: 'item_star', emoji: '⭐', label: 'Power Star', category: 'Items' },
  { type: 'item_key', emoji: '🔑', label: 'Key', category: 'Items' },
  { type: 'item_sword', emoji: '⚔️', label: 'Sword', category: 'Items' },
  { type: 'item_fuel', emoji: '⛽', label: 'Fuel Cell', category: 'Items' },
  { type: 'item_shield', emoji: '🛡️', label: 'Shield Orb', category: 'Items' },
  { type: 'item_crystal', emoji: '💎', label: 'Crystal', category: 'Items' },
  { type: 'item_powerup', emoji: '⚡', label: 'Power Up', category: 'Items' },
  { type: 'spawn_point', emoji: '🚩', label: 'Spawn Point', category: 'Triggers' },
  { type: 'teleporter', emoji: '🌀', label: 'Teleporter', category: 'Triggers' },
  { type: 'checkpoint', emoji: '💾', label: 'Checkpoint', category: 'Triggers' },
  { type: 'waypoint', emoji: '📍', label: 'Waypoint', category: 'Triggers' },
  { type: 'zone_hazard', emoji: '☢️', label: 'Hazard Zone', category: 'Triggers' },
];

const CATEGORIES = [...new Set(ENTITY_OPTIONS.map(e => e.category))];

export const EntityPlacer: React.FC = React.memo(() => {
  const { appState, updateAppState } = useStore();
  const activeEntity = appState.activeLevelTool;

  const selectEntity = React.useCallback((type: string) => {
    updateAppState({ activeLevelTool: activeEntity === type ? undefined : type });
  }, [activeEntity, updateAppState]);

  const handleEntityClick = React.useCallback((e: React.MouseEvent) => {
    const type = (e.currentTarget as HTMLElement).dataset.entityType;
    if (type) selectEntity(type);
  }, [selectEntity]);

  return (
    <div className="space-y-3" aria-label="Entity placer">
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Entity Placer</div>

      {CATEGORIES.map(category => (
        <div key={category}>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">{category}</div>
          <div className="grid grid-cols-2 gap-1">
            {ENTITY_OPTIONS.filter(e => e.category === category).map(entity => (
              <button
                key={entity.type}
                data-entity-type={entity.type}
                onClick={handleEntityClick}
                title={entity.label}
                aria-label={`Place ${entity.label} entity`}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-all ${
                  activeEntity === entity.type
                    ? 'bg-violet-100 border-2 border-violet-400 scale-105 shadow-sm'
                    : 'bg-slate-100 border-2 border-transparent hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{entity.emoji}</span>
                <span className="text-[10px] font-bold text-slate-600 truncate">{entity.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {activeEntity && (
        <div className="text-[10px] text-center text-slate-500 font-medium py-1 bg-slate-50 rounded-lg">
          Click on canvas to place entity
        </div>
      )}
    </div>
  );
});
