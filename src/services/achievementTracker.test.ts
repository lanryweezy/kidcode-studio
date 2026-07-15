import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AchievementTracker, ACHIEVEMENTS, GameStats } from './achievementTracker';

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

describe('AchievementTracker', () => {
  let tracker: AchievementTracker;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    tracker = new AchievementTracker();
  });

  afterEach(() => {
    tracker.destroy();
  });

  describe('initial state', () => {
    it('starts with zero stats', () => {
      const stats = tracker.getStats();
      expect(stats.totalKills).toBe(0);
      expect(stats.totalDeaths).toBe(0);
      expect(stats.totalScore).toBe(0);
      expect(stats.highestWave).toBe(0);
      expect(stats.highestCombo).toBe(0);
      expect(stats.victories).toBe(0);
      expect(stats.bossesDefeated).toBe(0);
      expect(stats.itemsCollected).toBe(0);
      expect(stats.gamesPlayed).toBe(0);
    });

    it('starts with no unlocked achievements', () => {
      expect(tracker.getUnlockedAchievements()).toEqual([]);
    });

    it('starts with no pending notifications', () => {
      expect(tracker.getPendingNotification()).toBeNull();
    });
  });

  describe('checkAchievements', () => {
    it('unlocks first_kill achievement when stats meet condition', () => {
      tracker['stats'].totalKills = 1;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('first_kill');
    });

    it('unlocks kill_10 achievement', () => {
      tracker['stats'].totalKills = 10;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('kill_10');
    });

    it('unlocks combo_5 achievement', () => {
      tracker['stats'].highestCombo = 5;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('combo_5');
    });

    it('unlocks wave_10 achievement', () => {
      tracker['stats'].highestWave = 10;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('wave_10');
    });

    it('unlocks score_10000 achievement', () => {
      tracker['stats'].totalScore = 10000;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('score_10000');
    });

    it('unlocks first_victory achievement', () => {
      tracker['stats'].victories = 1;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('first_victory');
    });

    it('unlocks boss_slayer achievement', () => {
      tracker['stats'].bossesDefeated = 5;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('boss_slayer');
    });

    it('unlocks no_damage achievement when no deaths and wave >= 3', () => {
      tracker['stats'].totalDeaths = 0;
      tracker['stats'].highestWave = 3;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('no_damage');
    });

    it('does not unlock no_damage when there are deaths', () => {
      tracker['stats'].totalDeaths = 1;
      tracker['stats'].highestWave = 5;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).not.toContain('no_damage');
    });

    it('creates pending notification for newly unlocked achievements', () => {
      tracker['stats'].totalKills = 1;
      tracker.checkAchievements();
      const notification = tracker.getPendingNotification();
      expect(notification).not.toBeNull();
      expect(notification!.id).toBe('first_kill');
      expect(notification!.name).toBe('First Blood');
      expect(notification!.emoji).toBe('🗡️');
    });

    it('does not re-unlock already unlocked achievements', () => {
      tracker['stats'].totalKills = 1;
      tracker.checkAchievements();
      tracker.getPendingNotification(); // Clear notification
      tracker.checkAchievements(); // Check again
      expect(tracker.getPendingNotification()).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all stats to initial values', () => {
      tracker['stats'].totalKills = 50;
      tracker['stats'].totalScore = 5000;
      tracker.reset();
      const stats = tracker.getStats();
      expect(stats.totalKills).toBe(0);
      expect(stats.totalScore).toBe(0);
    });

    it('clears unlocked achievements', () => {
      tracker['stats'].totalKills = 1;
      tracker.checkAchievements();
      expect(tracker.getUnlockedAchievements()).toContain('first_kill');
      tracker.reset();
      expect(tracker.getUnlockedAchievements()).toEqual([]);
    });

    it('clears pending notifications', () => {
      tracker['stats'].totalKills = 1;
      tracker.checkAchievements();
      tracker.reset();
      expect(tracker.getPendingNotification()).toBeNull();
    });
  });

  describe('persistence', () => {
    it('saves stats to localStorage', () => {
      tracker['stats'].totalKills = 5;
      tracker.checkAchievements();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kidcode_achievements',
        expect.any(String)
      );
    });

    it('loads stats from localStorage on construction', () => {
      const savedData = {
        stats: { totalKills: 10, totalScore: 1000 },
        unlocked: ['first_kill', 'kill_10'],
      };
      store['kidcode_achievements'] = JSON.stringify(savedData);
      
      const newTracker = new AchievementTracker();
      const stats = newTracker.getStats();
      expect(stats.totalKills).toBe(10);
      expect(stats.totalScore).toBe(1000);
      expect(newTracker.getUnlockedAchievements()).toContain('first_kill');
      newTracker.destroy();
    });

    it('handles corrupted localStorage data gracefully', () => {
      store['kidcode_achievements'] = 'NOT_JSON';
      const newTracker = new AchievementTracker();
      const stats = newTracker.getStats();
      expect(stats.totalKills).toBe(0);
      newTracker.destroy();
    });
  });

  describe('getPendingNotification', () => {
    it('returns notifications in order', () => {
      tracker['stats'].totalKills = 10;
      tracker['stats'].highestCombo = 5;
      tracker.checkAchievements();
      
      const n1 = tracker.getPendingNotification();
      const n2 = tracker.getPendingNotification();
      expect(n1).not.toBeNull();
      expect(n2).not.toBeNull();
      expect(n1!.id).not.toBe(n2!.id);
    });

    it('returns null when no notifications', () => {
      expect(tracker.getPendingNotification()).toBeNull();
    });
  });

  describe('ACHIEVEMENTS constant', () => {
    it('has at least 10 achievements', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    });

    it('each achievement has required fields', () => {
      ACHIEVEMENTS.forEach(a => {
        expect(a.id).toBeDefined();
        expect(a.name).toBeDefined();
        expect(a.emoji).toBeDefined();
        expect(a.description).toBeDefined();
        expect(typeof a.condition).toBe('function');
        expect(a.xpReward).toBeGreaterThan(0);
      });
    });

    it('has unique achievement ids', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
