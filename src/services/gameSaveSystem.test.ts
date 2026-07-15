import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveGameState,
  loadAllSaves,
  loadGameState,
  deleteGameState,
  getSaveSlotCount,
  formatPlayTime,
  formatTimestamp,
} from './gameSaveSystem';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] || null),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('gameSaveSystem', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveGameState', () => {
    it('saves a game state and returns a slot', () => {
      const result = saveGameState('Test Save', { score: 100, health: 50 });
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test Save');
      expect(result!.snapshot.score).toBe(100);
      expect(result!.snapshot.health).toBe(50);
    });

    it('defaults score and health when not provided', () => {
      const result = saveGameState('Empty', {});
      expect(result!.snapshot.score).toBe(0);
      expect(result!.snapshot.health).toBe(100);
      expect(result!.snapshot.wave).toBe(1);
    });

    it('stores variables', () => {
      const result = saveGameState('Vars', { variables: { level: 3, coins: 42 } });
      expect(result!.snapshot.variables).toEqual({ level: 3, coins: 42 });
    });

    it('stores optional fields when provided', () => {
      const result = saveGameState('Optional', { shield: 50, fuel: 100, playTime: 3600 });
      expect(result!.snapshot.shield).toBe(50);
      expect(result!.snapshot.fuel).toBe(100);
      expect(result!.snapshot.playTime).toBe(3600);
    });

    it('evicts oldest save when exceeding MAX_SLOTS', () => {
      for (let i = 0; i < 6; i++) {
        saveGameState(`Save ${i}`, { score: i * 10 });
      }
      const saves = loadAllSaves();
      expect(saves.length).toBe(5);
      expect(saves[0].snapshot.score).toBe(10);
    });

    it('persists to localStorage', () => {
      saveGameState('Persist', { score: 42 });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kidcode_game_saves',
        expect.any(String)
      );
    });
  });

  describe('loadAllSaves', () => {
    it('returns empty array when no saves exist', () => {
      expect(loadAllSaves()).toEqual([]);
    });

    it('returns all saved slots', () => {
      saveGameState('A', { score: 1 });
      saveGameState('B', { score: 2 });
      expect(loadAllSaves()).toHaveLength(2);
    });

    it('handles corrupted localStorage data', () => {
      store['kidcode_game_saves'] = 'NOT_JSON';
      expect(loadAllSaves()).toEqual([]);
    });
  });

  describe('loadGameState', () => {
    it('returns snapshot for existing id', () => {
      const saved = saveGameState('Load Me', { score: 99 });
      const result = loadGameState(saved!.id);
      expect(result).not.toBeNull();
      expect(result!.score).toBe(99);
    });

    it('returns null for non-existent id', () => {
      expect(loadGameState('nonexistent')).toBeNull();
    });
  });

  describe('deleteGameState', () => {
    it('deletes a save by id', () => {
      const saved = saveGameState('Delete Me', { score: 50 });
      expect(deleteGameState(saved!.id)).toBe(true);
      expect(loadAllSaves()).toHaveLength(0);
    });

    it('returns true even if id not found', () => {
      expect(deleteGameState('nope')).toBe(true);
    });
  });

  describe('getSaveSlotCount', () => {
    it('returns 0 when no saves', () => {
      expect(getSaveSlotCount()).toBe(0);
    });

    it('returns correct count', () => {
      saveGameState('A', {});
      saveGameState('B', {});
      saveGameState('C', {});
      expect(getSaveSlotCount()).toBe(3);
    });
  });

  describe('formatPlayTime', () => {
    it('formats seconds only', () => {
      expect(formatPlayTime(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatPlayTime(125)).toBe('2m 5s');
    });

    it('formats hours and minutes', () => {
      expect(formatPlayTime(3661)).toBe('1h 1m');
    });
  });

  describe('formatTimestamp', () => {
    it('returns a string representation of the timestamp', () => {
      const result = formatTimestamp(Date.now());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
