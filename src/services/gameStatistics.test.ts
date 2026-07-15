import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recordGameSession,
  getGameStatistics,
  resetGameStatistics,
  formatDuration,
} from './gameStatistics';

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

describe('gameStatistics', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getGameStatistics', () => {
    it('returns default stats when empty', () => {
      const stats = getGameStatistics();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.totalScore).toBe(0);
      expect(stats.recentSessions).toEqual([]);
    });
  });

  describe('recordGameSession', () => {
    it('records a game session', () => {
      const now = Date.now();
      recordGameSession({
        gameName: 'Space Shooter',
        startTime: now - 60000,
        endTime: now,
        score: 500,
        wave: 5,
        enemiesDefeated: 10,
        itemsCollected: 3,
        deaths: 1,
        highestCombo: 4,
        result: 'victory',
      });

      const stats = getGameStatistics();
      expect(stats.totalSessions).toBe(1);
      expect(stats.totalScore).toBe(500);
      expect(stats.totalKills).toBe(10);
      expect(stats.totalDeaths).toBe(1);
      expect(stats.highestScore).toBe(500);
      expect(stats.highestWave).toBe(5);
      expect(stats.highestCombo).toBe(4);
      expect(stats.favoriteGame).toBe('Space Shooter');
    });

    it('accumulates across sessions', () => {
      const now = Date.now();
      recordGameSession({
        gameName: 'Game1', startTime: now - 10000, endTime: now,
        score: 100, wave: 2, enemiesDefeated: 5, itemsCollected: 1, deaths: 0, highestCombo: 2, result: 'game_over',
      });
      recordGameSession({
        gameName: 'Game2', startTime: now - 5000, endTime: now,
        score: 200, wave: 3, enemiesDefeated: 8, itemsCollected: 2, deaths: 1, highestCombo: 3, result: 'victory',
      });

      const stats = getGameStatistics();
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalScore).toBe(300);
      expect(stats.totalKills).toBe(13);
    });

    it('tracks win rate', () => {
      const now = Date.now();
      recordGameSession({
        gameName: 'G', startTime: now - 1000, endTime: now,
        score: 0, wave: 1, enemiesDefeated: 0, itemsCollected: 0, deaths: 0, highestCombo: 0, result: 'victory',
      });
      recordGameSession({
        gameName: 'G', startTime: now - 1000, endTime: now,
        score: 0, wave: 1, enemiesDefeated: 0, itemsCollected: 0, deaths: 1, highestCombo: 0, result: 'game_over',
      });
      const stats = getGameStatistics();
      expect(stats.winRate).toBe(50);
    });
  });

  describe('resetGameStatistics', () => {
    it('resets all stats to defaults', () => {
      const now = Date.now();
      recordGameSession({
        gameName: 'G', startTime: now - 1000, endTime: now,
        score: 100, wave: 1, enemiesDefeated: 1, itemsCollected: 0, deaths: 0, highestCombo: 0, result: 'victory',
      });
      resetGameStatistics();
      const stats = getGameStatistics();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalScore).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(90)).toBe('1m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
    });
  });
});
