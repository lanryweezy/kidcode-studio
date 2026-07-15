import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addXP, getLevelFromXP, getXPForLevel, getXPProgress,
  updateSkillProgress, getSkillProgress, checkAchievements,
  recordProjectComplete, recordBlocksUsed, recordExport,
  updateStreak, getEducationState, getLeaderboard,
  SKILL_CATEGORIES, ACHIEVEMENTS, CURRICULUM_STANDARDS
} from './educationSystem';

describe('Education System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('XP and Level System', () => {
    it('should add XP and update level', () => {
      const result = addXP(100);

      expect(result.level).toBe(2);
      expect(result.leveledUp).toBe(true);
    });

    it('should not level up when XP is insufficient', () => {
      addXP(50);
      const result = addXP(49);

      expect(result.level).toBe(1);
      expect(result.leveledUp).toBe(false);
    });

    it('should calculate level from XP correctly', () => {
      expect(getLevelFromXP(0)).toBe(1);
      expect(getLevelFromXP(100)).toBe(2);
      expect(getLevelFromXP(250)).toBe(3);
      expect(getLevelFromXP(1000)).toBe(11);
    });

    it('should calculate XP needed for level', () => {
      expect(getXPForLevel(1)).toBe(0);
      expect(getXPForLevel(2)).toBe(100);
      expect(getXPForLevel(5)).toBe(400);
    });

    it('should calculate XP progress correctly', () => {
      const progress = getXPProgress(150);

      expect(progress.current).toBe(50);
      expect(progress.needed).toBe(100);
      expect(progress.percent).toBe(50);
    });
  });

  describe('Skill System', () => {
    it('should track skill progress', () => {
      updateSkillProgress('blocks-basics', 5);

      const progress = getSkillProgress('blocks-basics');
      expect(progress).toBe(5);
    });

    it('should accumulate skill progress', () => {
      updateSkillProgress('blocks-basics', 3);
      updateSkillProgress('blocks-basics', 4);

      const progress = getSkillProgress('blocks-basics');
      expect(progress).toBe(7);
    });

    it('should cap skill progress at max', () => {
      for (let i = 0; i < 100; i++) {
        updateSkillProgress('blocks-basics', 100);
      }

      const progress = getSkillProgress('blocks-basics');
      expect(progress).toBe(999);
    });

    it('should return 0 for unknown skills', () => {
      const progress = getSkillProgress('unknown-skill');
      expect(progress).toBe(0);
    });
  });

  describe('Achievement System', () => {
    it('should unlock achievement when criteria met', () => {
      recordProjectComplete();
      const unlocked = checkAchievements();

      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked.some((a: { id: string }) => a.id === 'first-steps')).toBe(true);
    });

    it('should not unlock same achievement twice', () => {
      recordProjectComplete();
      checkAchievements();
      const unlocked2 = checkAchievements();

      expect(unlocked2.some((a: { id: string }) => a.id === 'first-steps')).toBe(false);
    });

    it('should track project completion', () => {
      recordProjectComplete();
      const state = getEducationState();

      expect(state.completedProjects).toBe(1);
    });

    it('should track blocks used', () => {
      recordBlocksUsed(50);
      const state = getEducationState();

      expect(state.blocksUsed).toBe(50);
    });

    it('should track export count', () => {
      recordExport();
      const state = getEducationState();

      expect(state.exportCount).toBe(1);
    });
  });

  describe('Streak System', () => {
    it('should initialize streak', () => {
      const result = updateStreak();

      expect(result.streak).toBeGreaterThanOrEqual(0);
    });

    it('should maintain streak on same day', () => {
      updateStreak();
      const result = updateStreak();

      expect(result.streak).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Skill Categories', () => {
    it('should have all required categories', () => {
      const categoryIds = SKILL_CATEGORIES.map((c: { id: string }) => c.id);

      expect(categoryIds).toContain('coding');
      expect(categoryIds).toContain('game-design');
      expect(categoryIds).toContain('electronics');
      expect(categoryIds).toContain('creativity');
      expect(categoryIds).toContain('problem-solving');
    });

    it('should have skills in each category', () => {
      for (const category of SKILL_CATEGORIES) {
        expect(category.skills.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Achievements', () => {
    it('should have required achievement fields', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.xpReward).toBeGreaterThan(0);
        expect(achievement.rarity).toBeDefined();
        expect(achievement.criteria).toBeDefined();
      }
    });

    it('should have valid rarity values', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

      for (const achievement of ACHIEVEMENTS) {
        expect(validRarities).toContain(achievement.rarity);
      }
    });
  });

  describe('Curriculum Standards', () => {
    it('should have standards with valid structure', () => {
      for (const standard of CURRICULUM_STANDARDS) {
        expect(standard.id).toBeDefined();
        expect(standard.name).toBeDefined();
        expect(standard.organization).toBeDefined();
        expect(standard.skills.length).toBeGreaterThan(0);
        expect(standard.grade).toBeDefined();
      }
    });
  });

  describe('Leaderboard', () => {
    it('should return leaderboard with user entry', () => {
      const leaderboard = getLeaderboard();

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard.some(e => e.userId === 'current-user')).toBe(true);
    });

    it('should sort leaderboard by XP', () => {
      const leaderboard = getLeaderboard();

      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i - 1].xp).toBeGreaterThanOrEqual(leaderboard[i].xp);
      }
    });
  });
});
