const TYCOON_SAVE_PREFIX = 'kidcode_tycoon_';

export interface TycoonSaveData {
  id: string;
  gameId: string;
  gameName: string;
  timestamp: number;
  state: Record<string, unknown>;
}

export function saveTycoonGame(gameId: string, gameName: string, state: Record<string, unknown>): void {
  const saveData: TycoonSaveData = {
    id: `save_${Date.now()}`,
    gameId,
    gameName,
    timestamp: Date.now(),
    state,
  };
  
  try {
    const saves = getTycoonSaves(gameId);
    saves.push(saveData);
    localStorage.setItem(`${TYCOON_SAVE_PREFIX}${gameId}`, JSON.stringify(saves));
  } catch (e) {
    console.error('Failed to save tycoon game:', e);
  }
}

export function getTycoonSaves(gameId: string): TycoonSaveData[] {
  try {
    const data = localStorage.getItem(`${TYCOON_SAVE_PREFIX}${gameId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function loadTycoonGame(gameId: string, saveId: string): TycoonSaveData | null {
  const saves = getTycoonSaves(gameId);
  return saves.find(s => s.id === saveId) || null;
}

export function deleteTycoonSave(gameId: string, saveId: string): void {
  const saves = getTycoonSaves(gameId).filter(s => s.id !== saveId);
  localStorage.setItem(`${TYCOON_SAVE_PREFIX}${gameId}`, JSON.stringify(saves));
}

export function clearTycoonSaves(gameId: string): void {
  localStorage.removeItem(`${TYCOON_SAVE_PREFIX}${gameId}`);
}
