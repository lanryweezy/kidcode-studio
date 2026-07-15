
/**
 * Level Editor Extended - Improvements #59-72
 * Undo/redo, fill tool, layers, triggers, prefabs, templates,
 * collision viz, test play, level metadata
 */

import { Tile, GameEntity } from '../types';

// ─── Undo/Redo System (#59) ───

export interface EditorHistory {
  past: Tile[][];
  future: Tile[][];
  maxHistory: number;
}

export function createEditorHistory(): EditorHistory {
  return { past: [], future: [], maxHistory: 50 };
}

export function pushHistory(history: EditorHistory, tiles: Tile[]): EditorHistory {
  const newPast = [...history.past.slice(-history.maxHistory + 1), tiles];
  return {
    past: newPast,
    future: [],
    maxHistory: history.maxHistory,
  };
}

export function undo(history: EditorHistory, currentTiles: Tile[]): { history: EditorHistory; tiles: Tile[] } | null {
  if (history.past.length === 0) return null;
  const prev = history.past[history.past.length - 1];
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [currentTiles, ...history.future],
      maxHistory: history.maxHistory,
    },
    tiles: prev,
  };
}

export function redo(history: EditorHistory, currentTiles: Tile[]): { history: EditorHistory; tiles: Tile[] } | null {
  if (history.future.length === 0) return null;
  const next = history.future[0];
  return {
    history: {
      past: [...history.past, currentTiles],
      future: history.future.slice(1),
      maxHistory: history.maxHistory,
    },
    tiles: next,
  };
}

// ─── Fill Tool (#60) ───

export function floodFill(
  tiles: Tile[],
  startX: number, startY: number,
  newType: string,
  tileSize: number = 40
): Tile[] {
  const gridX = Math.floor(startX / tileSize);
  const gridY = Math.floor(startY / tileSize);
  const targetTile = tiles.find(t => t.x === gridX && t.y === gridY);
  const targetType = targetTile?.type || 'empty';

  if (targetType === newType) return tiles;

  const newTiles = [...tiles];
  const visited = new Set<string>();
  const stack: [number, number][] = [[gridX, gridY]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const key = `${cx},${cy}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const existing = newTiles.findIndex(t => t.x === cx && t.y === cy);
    const existingType = existing >= 0 ? newTiles[existing].type : 'empty';

    if (existingType === targetType) {
      if (existing >= 0) {
        newTiles[existing] = { ...newTiles[existing], type: newType as Tile['type'] };
      } else {
        newTiles.push({ x: cx, y: cy, type: newType as Tile['type'] });
      }

      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }

  return newTiles;
}

// ─── Layer System (#62) ───

export interface TileLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  tiles: Tile[];
}

export function createDefaultLayers(): TileLayer[] {
  return [
    { id: 'background', name: 'Background', visible: true, locked: false, opacity: 1, tiles: [] },
    { id: 'main', name: 'Main', visible: true, locked: false, opacity: 1, tiles: [] },
    { id: 'foreground', name: 'Foreground', visible: true, locked: false, opacity: 1, tiles: [] },
    { id: 'entities', name: 'Entities', visible: true, locked: false, opacity: 1, tiles: [] },
    { id: 'triggers', name: 'Triggers', visible: true, locked: false, opacity: 0.5, tiles: [] },
  ];
}

// ─── Trigger Zones (#63) ───

export interface TriggerZone {
  id: string;
  type: 'damage' | 'transition' | 'cutscene' | 'spawn' | 'checkpoint' | 'dialogue';
  x: number;
  y: number;
  width: number;
  height: number;
  params: Record<string, any>;
}

export function createTriggerZone(
  type: TriggerZone['type'],
  x: number, y: number,
  width: number = 40, height: number = 40
): TriggerZone {
  return {
    id: `trigger_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type, x, y, width, height, params: {},
  };
}

export function checkTriggerCollision(
  px: number, py: number,
  triggers: TriggerZone[]
): TriggerZone | null {
  for (const t of triggers) {
    if (px >= t.x && px <= t.x + t.width && py >= t.y && py <= t.y + t.height) {
      return t;
    }
  }
  return null;
}

// ─── Level Templates (#65) ───

// ─── Level Templates (New) ───

export interface NewLevelTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tiles?: Array<{ x: number; y: number; type: string }>;
  enemies?: Array<{ x: number; y: number; emoji: string; behavior?: string }>;
  items?: Array<{ x: number; y: number; emoji: string }>;
  entities?: Array<{ x: number; y: number; emoji: string; type: string; [key: string]: unknown }>;
  generate?: () => { tiles: Array<{ x: number; y: number; type: string }>; enemies: Array<{ x: number; y: number; emoji: string }>; items: Array<{ x: number; y: number; emoji: string }> };
}

export const NEW_LEVEL_TEMPLATES: NewLevelTemplate[] = [
  {
    id: 'platformer_starter',
    name: 'Platformer Starter',
    description: 'Basic platformer with ground, platforms, and coins',
    thumbnail: '🟩',
    tiles: [
      ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 9, type: 'grass' as const })),
      ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 10, type: 'dirt' as const })),
      { x: 5, y: 7, type: 'brick' as const },
      { x: 6, y: 7, type: 'brick' as const },
      { x: 10, y: 6, type: 'stone' as const },
      { x: 11, y: 6, type: 'stone' as const },
      { x: 15, y: 5, type: 'brick' as const },
      { x: 8, y: 8, type: 'coin' as const },
      { x: 10, y: 5, type: 'coin' as const },
      { x: 15, y: 4, type: 'coin' as const },
    ],
    entities: [
      { id: 'e1', type: 'enemy', emoji: '🟢', x: 500, y: 320, behavior: 'patrol', range: 100, initialX: 500, vx: 1, vy: 0 },
    ],
  },
  {
    id: 'dungeon',
    name: 'Dungeon',
    description: 'Indoor dungeon with walls, doors, and traps',
    thumbnail: '🏰',
    tiles: [
      ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 0, type: 'stone' as const })),
      ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 10, type: 'stone' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: 0, y: i, type: 'stone' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: 14, y: i, type: 'stone' as const })),
      { x: 7, y: 5, type: 'spike' as const },
      { x: 8, y: 5, type: 'spike' as const },
      { x: 3, y: 3, type: 'key' as const },
      { x: 12, y: 8, type: 'door' as const },
    ],
    entities: [],
  },
  {
    id: 'arena',
    name: 'Boss Arena',
    description: 'Flat arena for boss fights',
    thumbnail: '⚔️',
    tiles: [
      ...Array.from({ length: 25 }, (_, i) => ({ x: i, y: 9, type: 'stone' as const })),
      ...Array.from({ length: 25 }, (_, i) => ({ x: i, y: 10, type: 'stone' as const })),
    ],
    entities: [],
  },
  {
    id: 'vertical_shaft',
    name: 'Vertical Shaft',
    description: 'Vertical climbing level',
    thumbnail: '⬆️',
    tiles: [
      ...Array.from({ length: 20 }, (_, i) => ({ x: 0, y: i, type: 'stone' as const })),
      ...Array.from({ length: 20 }, (_, i) => ({ x: 10, y: i, type: 'stone' as const })),
      { x: 2, y: 3, type: 'ladder' as const },
      { x: 2, y: 4, type: 'ladder' as const },
      { x: 2, y: 5, type: 'ladder' as const },
      { x: 8, y: 6, type: 'ladder' as const },
      { x: 8, y: 7, type: 'ladder' as const },
    ],
    entities: [],
  },
];

// ─── Prefab System (#71) ───

export interface Prefab {
  id: string;
  name: string;
  tiles: Tile[];
  entities: GameEntity[];
  thumbnail: string;
}

export const BUILTIN_PREFABS: Prefab[] = [
  {
    id: 'treasure_chest',
    name: 'Treasure Chest',
    tiles: [{ x: 0, y: 0, type: 'crate' as const }],
    entities: [{ id: 'chest', type: 'item', emoji: '📦', x: 0, y: 0 }],
    thumbnail: '📦',
  },
  {
    id: 'spike_trap',
    name: 'Spike Trap',
    tiles: [{ x: 0, y: 0, type: 'spike' as const }, { x: 1, y: 0, type: 'spike' as const }],
    entities: [],
    thumbnail: '🔺',
  },
  {
    id: 'enemy_patrol',
    name: 'Enemy Patrol',
    tiles: [],
    entities: [{ id: 'patrol', type: 'enemy', emoji: '🟢', x: 0, y: 0, behavior: 'patrol', range: 100, initialX: 0, vx: 1, vy: 0 }],
    thumbnail: '🟢',
  },
  {
    id: 'coin_row',
    name: 'Coin Row',
    tiles: Array.from({ length: 5 }, (_, i) => ({ x: i, y: 0, type: 'coin' as const })),
    entities: [],
    thumbnail: '🪙',
  },
  {
    id: 'platform_gap',
    name: 'Platform Gap',
    tiles: [{ x: 0, y: 0, type: 'brick' as const }, { x: 1, y: 0, type: 'brick' as const }, { x: 4, y: 0, type: 'brick' as const }, { x: 5, y: 0, type: 'brick' as const }],
    entities: [],
    thumbnail: '🧱',
  },
];

// ─── Collision Visualization (#69) ───

export const COLLISION_COLORS: Record<string, string> = {
  solid: 'rgba(255, 0, 0, 0.3)',
  hazard: 'rgba(255, 165, 0, 0.3)',
  platform: 'rgba(0, 255, 0, 0.3)',
  passthrough: 'rgba(0, 0, 255, 0.3)',
  liquid: 'rgba(0, 150, 255, 0.3)',
};

export function getTileCollisionType(tileType: string): string {
  if (['brick', 'grass', 'dirt', 'stone', 'crate'].includes(tileType)) return 'solid';
  if (['spike', 'lava'].includes(tileType)) return 'hazard';
  if (['ladder', 'spring'].includes(tileType)) return 'passthrough';
  if (tileType === 'water') return 'liquid';
  return 'passthrough';
}

// ─── Level Metadata (#68) ───

export interface LevelMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  parTime: number; // seconds
  totalCoins: number;
  totalEnemies: number;
  author: string;
  createdAt: number;
  modifiedAt: number;
}

export function createLevelMetadata(name: string): LevelMetadata {
  return {
    id: `level_${Date.now()}`,
    name,
    description: '',
    difficulty: 'medium',
    parTime: 120,
    totalCoins: 0,
    totalEnemies: 0,
    author: 'Player',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 10 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Copy/Paste System ───

export interface Clipboard {
  tiles: Tile[];
  entities: GameEntity[];
}

export function copyTiles(tiles: Tile[], selection: { x: number; y: number; width: number; height: number }): Tile[] {
  return tiles.filter(t =>
    t.x >= selection.x &&
    t.x < selection.x + selection.width &&
    t.y >= selection.y &&
    t.y < selection.y + selection.height
  );
}

export function pasteTiles(
  tiles: Tile[],
  clipboard: Clipboard,
  offsetX: number,
  offsetY: number
): Tile[] {
  const newTiles = [...tiles];
  const offset = { x: offsetX, y: offsetY };

  for (const tile of clipboard.tiles) {
    const newTile = {
      ...tile,
      x: tile.x + offset.x,
      y: tile.y + offset.y,
    };
    // Replace existing tile or add new
    const existingIdx = newTiles.findIndex(t => t.x === newTile.x && t.y === newTile.y);
    if (existingIdx >= 0) {
      newTiles[existingIdx] = newTile;
    } else {
      newTiles.push(newTile);
    }
  }

  return newTiles;
}

// ─── Selection Tool ───

export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createSelection(x: number, y: number, width: number, height: number): Selection {
  return { x, y, width, height };
}

export function isTileInSelection(tile: Tile, selection: Selection): boolean {
  return (
    tile.x >= selection.x &&
    tile.x < selection.x + selection.width &&
    tile.y >= selection.y &&
    tile.y < selection.y + selection.height
  );
}

export function moveSelection(tiles: Tile[], selection: Selection, dx: number, dy: number): Tile[] {
  const selectedTiles = tiles.filter(t => isTileInSelection(t, selection));
  const otherTiles = tiles.filter(t => !isTileInSelection(t, selection));

  const movedTiles = selectedTiles.map(t => ({
    ...t,
    x: t.x + dx,
    y: t.y + dy,
  }));

  return [...otherTiles, ...movedTiles];
}

// ─── Snap to Grid ───

export function snapToGrid(x: number, y: number, gridSize: number = 40): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

export function snapTileToGrid(tile: Tile, gridSize: number = 40): Tile {
  return {
    ...tile,
    x: Math.round(tile.x / gridSize) * gridSize,
    y: Math.round(tile.y / gridSize) * gridSize,
  };
}

// ─── Level Statistics ───

export interface LevelStats {
  totalTiles: number;
  tilesByType: Record<string, number>;
  totalEnemies: number;
  totalItems: number;
  totalCoins: number;
  totalKeys: number;
  totalDoors: number;
  totalSpikes: number;
  totalLava: number;
  totalWater: number;
}

export function calculateLevelStats(tiles: Tile[], enemies: GameEntity[], items: GameEntity[]): LevelStats {
  const stats: LevelStats = {
    totalTiles: tiles.length,
    tilesByType: {},
    totalEnemies: enemies.length,
    totalItems: items.length,
    totalCoins: 0,
    totalKeys: 0,
    totalDoors: 0,
    totalSpikes: 0,
    totalLava: 0,
    totalWater: 0,
  };

  for (const tile of tiles) {
    stats.tilesByType[tile.type] = (stats.tilesByType[tile.type] || 0) + 1;

    switch (tile.type) {
      case 'coin': stats.totalCoins++; break;
      case 'key': stats.totalKeys++; break;
      case 'door': stats.totalDoors++; break;
      case 'spike': stats.totalSpikes++; break;
      case 'lava': stats.totalLava++; break;
      case 'water': stats.totalWater++; break;
    }
  }

  return stats;
}

// ─── Level Validation ───

export interface LevelValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLevel(tiles: Tile[], enemies: GameEntity[]): LevelValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for spawn point
  const hasSpawn = tiles.some(t => t.type === 'spawn');
  if (!hasSpawn) {
    warnings.push('No spawn point defined');
  }

  // Check for finish flag
  const hasFlag = tiles.some(t => t.type === 'flag');
  if (!hasFlag) {
    warnings.push('No finish flag placed');
  }

  // Check for keys without doors
  const keyCount = tiles.filter(t => t.type === 'key').length;
  const doorCount = tiles.filter(t => t.type === 'door').length;
  if (keyCount > doorCount) {
    warnings.push('More keys than doors - some keys may be useless');
  }

  // Check for floating platforms
  const hasGround = tiles.some(t => t.type === 'grass' || t.type === 'dirt' || t.type === 'stone');
  if (!hasGround) {
    warnings.push('No ground tiles - level may be unplayable');
  }

  // Check enemy count
  if (enemies.length === 0) {
    warnings.push('No enemies placed');
  }

  // Check for too many hazards
  const hazardCount = tiles.filter(t => t.type === 'spike' || t.type === 'lava').length;
  if (hazardCount > tiles.length * 0.3) {
    warnings.push('More than 30% hazards - may be too difficult');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Auto-Generate Level ───

export function autoGenerateLevel(
  width: number,
  height: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { tiles: Tile[]; enemies: GameEntity[]; items: GameEntity[] } {
  const tiles: Tile[] = [];
  const enemies: GameEntity[] = [];
  const items: GameEntity[] = [];

  // Generate ground
  for (let x = 0; x < width; x++) {
    tiles.push({ x, y: height - 2, type: 'grass' });
    tiles.push({ x, y: height - 1, type: 'dirt' });
  }

  // Generate platforms
  const platformCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  for (let i = 0; i < platformCount; i++) {
    const px = Math.floor(Math.random() * (width - 3)) + 1;
    const py = Math.floor(Math.random() * (height - 4)) + 2;
    const pWidth = Math.floor(Math.random() * 3) + 2;

    for (let x = 0; x < pWidth; x++) {
      tiles.push({ x: px + x, y: py, type: 'brick' });
    }
  }

  // Generate coins
  const coinCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
  for (let i = 0; i < coinCount; i++) {
    const cx = Math.floor(Math.random() * (width - 2)) + 1;
    const cy = Math.floor(Math.random() * (height - 4)) + 1;
    tiles.push({ x: cx, y: cy, type: 'coin' });
  }

  // Generate enemies
  const enemyCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  const enemyEmojis = ['🟢', '🦇', '💀'];
  for (let i = 0; i < enemyCount; i++) {
    const ex = Math.floor(Math.random() * (width - 2)) + 1;
    const ey = height - 3;
    enemies.push({
      id: `enemy_${i}`,
      type: 'enemy',
      emoji: enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)],
      x: ex * 40,
      y: ey * 40,
    });
  }

  // Place spawn and flag
  tiles.push({ x: 1, y: height - 3, type: 'spawn' });
  tiles.push({ x: width - 2, y: height - 3, type: 'flag' });

  // Place key and door
  tiles.push({ x: Math.floor(width / 2), y: 2, type: 'key' });
  tiles.push({ x: width - 3, y: height - 3, type: 'door' });

  return { tiles, enemies, items };
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 16 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Layer System ───

export function createTileLayer(name: string, visible: boolean = true): TileLayer {
  return {
    id: crypto.randomUUID(),
    name,
    visible,
    locked: false,
    opacity: 1,
    tiles: [],
  };
}

export function addTileToLayer(layer: TileLayer, tile: Tile): TileLayer {
  if (layer.locked) return layer;
  return {
    ...layer,
    tiles: [...layer.tiles, tile],
  };
}

export function removeTileFromLayer(layer: TileLayer, tileIndex: number): TileLayer {
  if (layer.locked) return layer;
  const newTiles = [...layer.tiles];
  newTiles.splice(tileIndex, 1);
  return { ...layer, tiles: newTiles };
}

export function toggleLayerVisibility(layer: TileLayer): TileLayer {
  return { ...layer, visible: !layer.visible };
}

export function toggleLayerLock(layer: TileLayer): TileLayer {
  return { ...layer, locked: !layer.locked };
}

// ─── Tile Palette ───

export interface TilePaletteEntry {
  type: string;
  emoji: string;
  label: string;
  category: string;
}

export const TILE_PALETTE: TilePaletteEntry[] = [
  { type: 'grass', emoji: '🟩', label: 'Grass', category: 'terrain' },
  { type: 'brick', emoji: '🧱', label: 'Brick', category: 'terrain' },
  { type: 'stone', emoji: '🪨', label: 'Stone', category: 'terrain' },
  { type: 'dirt', emoji: '🟫', label: 'Dirt', category: 'terrain' },
  { type: 'water', emoji: '🟦', label: 'Water', category: 'hazard' },
  { type: 'lava', emoji: '🟥', label: 'Lava', category: 'hazard' },
  { type: 'spike', emoji: '🔺', label: 'Spike', category: 'hazard' },
  { type: 'coin', emoji: '🪙', label: 'Coin', category: 'item' },
  { type: 'key', emoji: '🔑', label: 'Key', category: 'item' },
  { type: 'door', emoji: '🚪', label: 'Door', category: 'item' },
  { type: 'crate', emoji: '📦', label: 'Crate', category: 'object' },
  { type: 'ladder', emoji: '🪜', label: 'Ladder', category: 'object' },
  { type: 'spring', emoji: '🟢', label: 'Spring', category: 'object' },
  { type: 'flag', emoji: '🚩', label: 'Flag', category: 'object' },
  { type: 'spawn', emoji: '🏁', label: 'Spawn', category: 'special' },
];

export function getTilePaletteByCategory(category: string): TilePaletteEntry[] {
  return TILE_PALETTE.filter(t => t.category === category);
}

// ─── Tile Properties ───

export interface TileProperties {
  solid: boolean;
  hazard: boolean;
  climbable: boolean;
  bouncy: boolean;
  destroyable: boolean;
}

export const TILE_PROPERTIES: Record<string, TileProperties> = {
  grass: { solid: true, hazard: false, climbable: false, bouncy: false, destroyable: false },
  brick: { solid: true, hazard: false, climbable: false, bouncy: false, destroyable: false },
  stone: { solid: true, hazard: false, climbable: false, bouncy: false, destroyable: false },
  dirt: { solid: true, hazard: false, climbable: false, bouncy: false, destroyable: false },
  water: { solid: false, hazard: true, climbable: false, bouncy: false, destroyable: false },
  lava: { solid: false, hazard: true, climbable: false, bouncy: false, destroyable: false },
  spike: { solid: false, hazard: true, climbable: false, bouncy: false, destroyable: false },
  coin: { solid: false, hazard: false, climbable: false, bouncy: false, destroyable: false },
  key: { solid: false, hazard: false, climbable: false, bouncy: false, destroyable: false },
  door: { solid: true, hazard: false, climbable: false, bouncy: false, destroyable: true },
  crate: { solid: true, hazard: false, climbable: false, bouncy: true, destroyable: true },
  ladder: { solid: false, hazard: false, climbable: true, bouncy: false, destroyable: false },
  spring: { solid: true, hazard: false, climbable: false, bouncy: true, destroyable: false },
  flag: { solid: false, hazard: false, climbable: false, bouncy: false, destroyable: false },
  spawn: { solid: false, hazard: false, climbable: false, bouncy: false, destroyable: false },
};

export function getTileProperties(tileType: string): TileProperties {
  return TILE_PROPERTIES[tileType] || { solid: false, hazard: false, climbable: false, bouncy: false, destroyable: false };
}

// ─── Level Templates ───

export interface LevelTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generate: () => { tiles: Tile[]; enemies: GameEntity[]; items: GameEntity[] };
}

// ─── Entity Placement ───

export interface EntityPlacement {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  properties: Record<string, any>;
}

export function createEntityPlacement(
  type: string,
  emoji: string,
  x: number,
  y: number
): EntityPlacement {
  return {
    id: crypto.randomUUID(),
    type,
    emoji,
    x,
    y,
    properties: {},
  };
}

export function updateEntityProperties(
  entity: EntityPlacement,
  properties: Record<string, any>
): EntityPlacement {
  return {
    ...entity,
    properties: { ...entity.properties, ...properties },
  };
}
