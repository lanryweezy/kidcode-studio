export interface GameStateSnapshot {
  id: string;
  name: string;
  timestamp: number;
  score: number;
  wave: number;
  health: number;
  maxHealth: number;
  shield?: number;
  fuel?: number;
  variables: Record<string, any>;
  playTime: number;
  thumbnail?: string;
  enemies?: Array<{ id: string; x: number; y: number; emoji: string; hp: number; behavior: string }>;
  items?: Array<{ id: string; x: number; y: number; emoji: string }>;
  tiles?: Array<{ x: number; y: number; type: string; emoji: string; solid: boolean }>;
  camera?: { x: number; y: number; followPlayer: boolean; worldWidth: number; worldHeight: number };
  weather?: string;
  scene?: string;
}

interface GameSaveSlot {
  id: string;
  name: string;
  snapshot: GameStateSnapshot;
  slotIndex: number;
}

interface HighScore {
  templateId: string;
  score: number;
  wave: number;
  timestamp: number;
  playerName?: string;
}

const STORAGE_KEY = 'kidcode_game_saves';
const HIGH_SCORE_KEY = 'kidcode_high_scores';
const MAX_SLOTS = 5;
const MAX_HIGH_SCORES = 10;

export function saveGameState(name: string, state: Partial<GameStateSnapshot>): GameSaveSlot | null {
  try {
    const existing = loadAllSaves();
    const slot: GameSaveSlot = {
      id: `save_${Date.now()}`,
      name,
      snapshot: {
        id: `snap_${Date.now()}`,
        name,
        timestamp: Date.now(),
        score: state.score || 0,
        wave: state.wave || 1,
        health: state.health || 100,
        maxHealth: state.maxHealth || 100,
        shield: state.shield,
        fuel: state.fuel,
        variables: state.variables || {},
        playTime: state.playTime || 0,
        thumbnail: state.thumbnail,
        enemies: state.enemies,
        items: state.items,
        tiles: state.tiles,
        camera: state.camera,
        weather: state.weather,
        scene: state.scene,
      },
      slotIndex: existing.length,
    };
    existing.push(slot);
    if (existing.length > MAX_SLOTS) existing.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return slot;
  } catch {
    return null;
  }
}

export function loadAllSaves(): GameSaveSlot[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function loadGameState(id: string): GameStateSnapshot | null {
  const saves = loadAllSaves();
  return saves.find(s => s.id === id)?.snapshot || null;
}

export function deleteGameState(id: string): boolean {
  try {
    const saves = loadAllSaves().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function getSaveSlotCount(): number {
  return loadAllSaves().length;
}

export function saveHighScore(templateId: string, score: number, wave: number): boolean {
  try {
    const scores = loadHighScores(templateId);
    const entry: HighScore = {
      templateId,
      score,
      wave,
      timestamp: Date.now(),
    };
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, MAX_HIGH_SCORES);
    const allScores = loadAllHighScores();
    allScores[templateId] = trimmed;
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(allScores));
    return trimmed[0]?.score === score;
  } catch {
    return false;
  }
}

export function loadHighScores(templateId: string): HighScore[] {
  try {
    const allScores = loadAllHighScores();
    return allScores[templateId] || [];
  } catch {
    return [];
  }
}

function loadAllHighScores(): Record<string, HighScore[]> {
  try {
    const data = localStorage.getItem(HIGH_SCORE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getTopScore(templateId: string): number {
  const scores = loadHighScores(templateId);
  return scores[0]?.score || 0;
}

export function formatPlayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimestamp(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString()  } ${  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
