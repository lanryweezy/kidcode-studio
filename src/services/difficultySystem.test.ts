import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DIFFICULTY_PRESETS,
  getCurrentDifficulty,
  setDifficulty,
  scaleEnemyHealth,
  scaleEnemyDamage,
  scaleEnemySpeed,
  scaleScore,
  scaleXP,
} from './difficultySystem';

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

describe('difficultySystem', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('has 4 difficulty presets', () => {
    expect(DIFFICULTY_PRESETS).toHaveLength(4);
  });

  it('preset names are unique', () => {
    const names = DIFFICULTY_PRESETS.map(d => d.name);
    expect(new Set(names).size).toBe(4);
  });

  describe('getCurrentDifficulty', () => {
    it('returns normal by default', () => {
      const diff = getCurrentDifficulty();
      expect(diff.name).toBe('normal');
    });

    it('returns saved difficulty', () => {
      store['kidcode_difficulty'] = 'hard';
      const diff = getCurrentDifficulty();
      expect(diff.name).toBe('hard');
    });

    it('returns normal for invalid value', () => {
      store['kidcode_difficulty'] = 'invalid';
      const diff = getCurrentDifficulty();
      expect(diff.name).toBe('normal');
    });
  });

  describe('setDifficulty', () => {
    it('saves difficulty name', () => {
      setDifficulty('insane');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kidcode_difficulty', 'insane');
    });
  });

  describe('scaling functions', () => {
    const casual = DIFFICULTY_PRESETS[0];
    const normal = DIFFICULTY_PRESETS[1];
    const hard = DIFFICULTY_PRESETS[2];
    const insane = DIFFICULTY_PRESETS[3];

    it('scaleEnemyHealth scales correctly', () => {
      expect(scaleEnemyHealth(100, normal)).toBe(100);
      expect(scaleEnemyHealth(100, casual)).toBe(60);
      expect(scaleEnemyHealth(100, hard)).toBe(150);
      expect(scaleEnemyHealth(100, insane)).toBe(250);
    });

    it('scaleEnemyDamage scales correctly', () => {
      expect(scaleEnemyDamage(20, normal)).toBe(20);
      expect(scaleEnemyDamage(20, casual)).toBe(10);
      expect(scaleEnemyDamage(20, hard)).toBe(28);
    });

    it('scaleEnemySpeed scales correctly', () => {
      expect(scaleEnemySpeed(2, normal)).toBe(2);
      expect(scaleEnemySpeed(2, casual)).toBe(1.4);
      expect(scaleEnemySpeed(2, hard)).toBe(2.6);
    });

    it('scaleScore scales correctly', () => {
      expect(scaleScore(100, normal)).toBe(100);
      expect(scaleScore(100, insane)).toBe(300);
    });

    it('scaleXP scales correctly', () => {
      expect(scaleXP(50, normal)).toBe(50);
      expect(scaleXP(50, insane)).toBe(125);
    });
  });
});
