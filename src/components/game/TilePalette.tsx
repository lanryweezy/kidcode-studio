import React from 'react';
import { useStore } from '../../store/useStore';
import { Eraser } from 'lucide-react';

interface TileOption {
  type: string;
  emoji: string;
  label: string;
  category: string;
}

const TILE_OPTIONS: TileOption[] = [
  { type: 'brick', emoji: '🧱', label: 'Brick', category: 'Blocks' },
  { type: 'stone', emoji: '🪨', label: 'Stone', category: 'Blocks' },
  { type: 'crate', emoji: '📦', label: 'Crate', category: 'Blocks' },
  { type: 'grass', emoji: '🟩', label: 'Grass', category: 'Terrain' },
  { type: 'dirt', emoji: '🟫', label: 'Dirt', category: 'Terrain' },
  { type: 'water', emoji: '🟦', label: 'Water', category: 'Terrain' },
  { type: 'lava', emoji: '🟥', label: 'Lava', category: 'Hazards' },
  { type: 'spike', emoji: '🔺', label: 'Spike', category: 'Hazards' },
  { type: 'coin', emoji: '🪙', label: 'Coin', category: 'Collectibles' },
  { type: 'key', emoji: '🔑', label: 'Key', category: 'Collectibles' },
  { type: 'door', emoji: '🚪', label: 'Door', category: 'Interactive' },
  { type: 'ladder', emoji: '🪜', label: 'Ladder', category: 'Interactive' },
  { type: 'spring', emoji: '🟢', label: 'Spring', category: 'Interactive' },
  { type: 'flag', emoji: '🚩', label: 'Flag', category: 'Goals' },
  { type: 'field_grass', emoji: '🟩', label: 'Field', category: 'Sports' },
  { type: 'court_wood', emoji: '🟫', label: 'Court', category: 'Sports' },
  { type: 'pitch_grass', emoji: '🟩', label: 'Pitch', category: 'Sports' },
  { type: 'net', emoji: '🥅', label: 'Net', category: 'Sports' },
  { type: 'goal', emoji: '🥅', label: 'Goal', category: 'Sports' },
  { type: 'hoop', emoji: '🔴', label: 'Hoop', category: 'Sports' },
  { type: 'tee', emoji: '⛳', label: 'Tee', category: 'Sports' },
  { type: 'bunker', emoji: '🏖️', label: 'Bunker', category: 'Sports' },
  { type: 'mat', emoji: '🧘', label: 'Mat', category: 'Sports' },
  { type: 'ring', emoji: '🥊', label: 'Ring', category: 'Sports' },
  { type: 'ramp', emoji: '🛹', label: 'Ramp', category: 'Sports' },
  { type: 'rail', emoji: '🛤️', label: 'Rail', category: 'Sports' },
  { type: 'track', emoji: '🏃', label: 'Track', category: 'Sports' },
  { type: 'lane', emoji: '🏃', label: 'Lane', category: 'Sports' },
  { type: 'wave', emoji: '🌊', label: 'Wave', category: 'Sports' },
  // Action tiles
  { type: 'arena_floor', emoji: '🟫', label: 'Arena', category: 'Action' },
  { type: 'stone_floor', emoji: '🟫', label: 'Stone Floor', category: 'Action' },
  { type: 'metal_floor', emoji: '⬜', label: 'Metal Floor', category: 'Action' },
  { type: 'lava_pool', emoji: '🟥', label: 'Lava Pool', category: 'Action' },
  { type: 'trap', emoji: '⚠️', label: 'Trap', category: 'Action' },
  { type: 'teleporter', emoji: '🌀', label: 'Teleporter', category: 'Action' },
  // Adventure tiles
  { type: 'path', emoji: '🟫', label: 'Path', category: 'Adventure' },
  { type: 'bridge', emoji: '🌉', label: 'Bridge', category: 'Adventure' },
  { type: 'door_locked', emoji: '🔒', label: 'Locked Door', category: 'Adventure' },
  { type: 'chest', emoji: '📦', label: 'Chest', category: 'Adventure' },
  { type: 'sign', emoji: '🪧', label: 'Sign', category: 'Adventure' },
  { type: 'npc_spot', emoji: '💬', label: 'NPC Spot', category: 'Adventure' },
  // Shooter tiles
  { type: 'crate_cover', emoji: '📦', label: 'Crate Cover', category: 'Shooter' },
  { type: 'sandbag', emoji: '🟤', label: 'Sandbag', category: 'Shooter' },
  { type: 'barrel', emoji: '🛢️', label: 'Barrel', category: 'Shooter' },
  { type: 'barricade', emoji: '🧱', label: 'Barricade', category: 'Shooter' },
  { type: 'wall_metal', emoji: '⬜', label: 'Metal Wall', category: 'Shooter' },
  // Survival tiles
  { type: 'tree', emoji: '🌲', label: 'Tree', category: 'Survival' },
  { type: 'rock', emoji: '🪨', label: 'Rock', category: 'Survival' },
  { type: 'bush', emoji: '🌳', label: 'Bush', category: 'Survival' },
  { type: 'water_source', emoji: '💧', label: 'Water', category: 'Survival' },
  { type: 'campfire', emoji: '🔥', label: 'Campfire', category: 'Survival' },
  { type: 'shelter_wall', emoji: '🏠', label: 'Shelter', category: 'Survival' },
  // Puzzle tiles
  { type: 'puzzle_blue', emoji: '🟦', label: 'Blue Gem', category: 'Puzzle' },
  { type: 'puzzle_red', emoji: '🟥', label: 'Red Gem', category: 'Puzzle' },
  { type: 'puzzle_green', emoji: '🟩', label: 'Green Gem', category: 'Puzzle' },
  { type: 'puzzle_yellow', emoji: '🟨', label: 'Yellow Gem', category: 'Puzzle' },
  { type: 'puzzle_purple', emoji: '🟪', label: 'Purple Gem', category: 'Puzzle' },
  { type: 'puzzle_orange', emoji: '🟧', label: 'Orange Gem', category: 'Puzzle' },
  // Racing tiles
  { type: 'race_road', emoji: '🛣️', label: 'Road', category: 'Racing' },
  { type: 'race_grass', emoji: '🟩', label: 'Grass', category: 'Racing' },
  { type: 'race_sand', emoji: '🏖️', label: 'Sand', category: 'Racing' },
  { type: 'race_water', emoji: '🌊', label: 'Water', category: 'Racing' },
  { type: 'race_boost', emoji: '⚡', label: 'Boost Pad', category: 'Racing' },
  { type: 'race_finish', emoji: '🏁', label: 'Finish Line', category: 'Racing' },
  { type: 'race_barrier', emoji: '🧱', label: 'Barrier', category: 'Racing' },
  { type: 'checkered', emoji: '🏁', label: 'Checkered', category: 'Racing' },
  // Platformer tiles
  { type: 'platform_wood', emoji: '🟫', label: 'Wood Plat', category: 'Platformer' },
  { type: 'platform_stone', emoji: '🟫', label: 'Stone Plat', category: 'Platformer' },
  { type: 'platform_metal', emoji: '⬜', label: 'Metal Plat', category: 'Platformer' },
  { type: 'platform_cloud', emoji: '☁️', label: 'Cloud', category: 'Platformer' },
  { type: 'platform_ice', emoji: '🧊', label: 'Ice Plat', category: 'Platformer' },
  { type: 'spike_up', emoji: '🔺', label: 'Spike Up', category: 'Platformer' },
  { type: 'spike_down', emoji: '🔻', label: 'Spike Down', category: 'Platformer' },
  { type: 'moving_platform', emoji: '🟪', label: 'Moving Plat', category: 'Platformer' },
  { type: 'conveyor_right', emoji: '➡️', label: 'Conveyor R', category: 'Platformer' },
  { type: 'conveyor_left', emoji: '⬅️', label: 'Conveyor L', category: 'Platformer' },
  { type: 'bounce_pad', emoji: '🟢', label: 'Bounce Pad', category: 'Platformer' },
  { type: 'checkpoint_tile', emoji: '🚩', label: 'Checkpoint', category: 'Platformer' },
  { type: 'portal_tile', emoji: '🌀', label: 'Portal', category: 'Platformer' },
  { type: 'vine_tile', emoji: '🌿', label: 'Vine', category: 'Platformer' },
  { type: 'ice_floor', emoji: '🧊', label: 'Ice Floor', category: 'Platformer' },
  { type: 'sand_floor', emoji: '🏖️', label: 'Sand Floor', category: 'Platformer' },
];

const CATEGORIES = [...new Set(TILE_OPTIONS.map(t => t.category))];

export const TilePalette: React.FC = React.memo(() => {
  const { appState, updateAppState } = useStore();
  const activeTool = appState.activeLevelTool;

  const selectTile = React.useCallback((type: string) => {
    updateAppState({ activeLevelTool: activeTool === type ? undefined : type });
  }, [activeTool, updateAppState]);

  const handleTileClick = React.useCallback((e: React.MouseEvent) => {
    const type = (e.currentTarget as HTMLElement).dataset.tileType;
    if (type) selectTile(type);
  }, [selectTile]);

  const handleClearTool = React.useCallback(() => updateAppState({ activeLevelTool: undefined }), [updateAppState]);

  return (
    <div className="space-y-3" aria-label="Tile palette">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tile Painter</h4>
        <button
          onClick={handleClearTool}
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${!activeTool ? 'bg-violet-100 text-violet-600' : 'text-slate-600 hover:text-slate-600'}`}
          aria-label="View Mode"
        >
          View Mode
        </button>
      </div>

      <button
        data-tile-type="eraser"
        onClick={handleTileClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
          activeTool === 'eraser'
            ? 'bg-red-100 text-red-600 border border-red-300'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
        aria-label="Eraser tool"
      >
        <Eraser size={14} /> Eraser
      </button>

      <div className="overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-300">
      {CATEGORIES.map(category => (
        <div key={category}>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">{category}</div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-1">
            {TILE_OPTIONS.filter(t => t.category === category).map(tile => (
              <button
                key={tile.type}
                data-tile-type={tile.type}
                onClick={handleTileClick}
                title={tile.label}
                aria-label={`Place ${tile.label} tile`}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-lg transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20 active:scale-95 ${
                  activeTool === tile.type
                    ? 'bg-violet-100 border-2 border-violet-400 scale-110 shadow-md'
                    : 'bg-slate-100 border-2 border-transparent hover:border-slate-300'
                }`}
              >
                <span>{tile.emoji}</span>
                <span className="text-[8px] font-bold text-slate-500 leading-none mt-0.5">{tile.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      </div>

      {activeTool && (
        <div className="text-[10px] text-center text-slate-500 font-medium py-1 bg-slate-50 rounded-lg">
          Click on the canvas to place tiles
        </div>
      )}
    </div>
  );
});
