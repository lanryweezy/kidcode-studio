import { describe, it, expect, beforeEach } from 'vitest';
import {
  getQuestServiceState,
  resetQuestServiceState,
  acceptQuest,
  updateObjective,
  turnInQuest,
  addQuestChain,
  checkQuestChainUnlocks,
  getTrackedQuest,
  setTrackingQuest,
  getActiveQuests,
  getCompletedQuestIds,
  isQuestCompleted,
  isQuestActive,
  getNotifications,
  clearNotifications,
  removeNotification,
  getQuestProgress,
} from '../questService';
import { RPGQuest } from '../../types/game';

function makeQuest(overrides: Partial<RPGQuest> = {}): RPGQuest {
  return {
    id: 'q1',
    name: 'Kill Goblins',
    description: 'Defeat goblin enemies',
    objectives: [
      { id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 0, description: 'Kill goblins' },
    ],
    xpReward: 100,
    goldReward: 50,
    itemRewards: [{ itemId: 'sword', quantity: 1 }],
    requiredLevel: 1,
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
    ...overrides,
  };
}

describe('questService', () => {
  beforeEach(() => {
    resetQuestServiceState();
  });

  describe('state management', () => {
    it('starts with empty state', () => {
      const state = getQuestServiceState();
      expect(state.activeQuests).toHaveLength(0);
      expect(state.completedQuestIds).toHaveLength(0);
      expect(state.questChains).toHaveLength(0);
      expect(state.notifications).toHaveLength(0);
    });

    it('resetQuestServiceState clears everything', () => {
      acceptQuest(makeQuest());
      resetQuestServiceState();
      expect(getQuestServiceState().activeQuests).toHaveLength(0);
    });
  });

  describe('acceptQuest', () => {
    it('accepts a quest', () => {
      const result = acceptQuest(makeQuest());
      expect(result.success).toBe(true);
      expect(result.state.activeQuests).toHaveLength(1);
      expect(result.state.activeQuests[0].isActive).toBe(true);
    });

    it('creates notification on accept', () => {
      acceptQuest(makeQuest());
      const notifs = getNotifications();
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe('accepted');
    });

    it('does not duplicate quests', () => {
      acceptQuest(makeQuest());
      const result = acceptQuest(makeQuest());
      expect(result.success).toBe(false);
      expect(getQuestServiceState().activeQuests).toHaveLength(1);
    });

    it('resets objective progress on accept', () => {
      const quest = makeQuest({
        objectives: [{ id: 'o1', type: 'kill', target: 'goblin', required: 5, current: 3, description: 'Kill' }],
      });
      acceptQuest(quest);
      expect(getActiveQuests()[0].objectives[0].current).toBe(0);
    });

    it('rejects already completed quest', () => {
      acceptQuest(makeQuest());
      turnInQuest('q1');
      const result = acceptQuest(makeQuest());
      expect(result.success).toBe(false);
    });
  });

  describe('updateObjective', () => {
    it('increments objective progress', () => {
      acceptQuest(makeQuest());
      const result = updateObjective('q1', 'o1', 3);
      expect(result.success).toBe(true);
      expect(result.state.activeQuests[0].objectives[0].current).toBe(3);
    });

    it('caps at required amount', () => {
      acceptQuest(makeQuest());
      const result = updateObjective('q1', 'o1', 100);
      expect(result.state.activeQuests[0].objectives[0].current).toBe(5);
    });

    it('marks quest complete when all objectives met', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      expect(getActiveQuests()[0].isCompleted).toBe(true);
    });

    it('creates notification on update', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 2);
      const notifs = getNotifications();
      expect(notifs.some(n => n.type === 'updated')).toBe(true);
    });

    it('creates completion notification', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      const notifs = getNotifications();
      expect(notifs.some(n => n.type === 'completed')).toBe(true);
    });

    it('returns false for unknown quest', () => {
      const result = updateObjective('nope', 'o1', 1);
      expect(result.success).toBe(false);
    });

    it('returns false for unknown objective', () => {
      acceptQuest(makeQuest());
      const result = updateObjective('q1', 'nope', 1);
      expect(result.success).toBe(false);
    });
  });

  describe('turnInQuest', () => {
    it('returns rewards on turn-in', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      const result = turnInQuest('q1');
      expect(result.success).toBe(true);
      expect(result.xpReward).toBe(100);
      expect(result.goldReward).toBe(50);
      expect(result.itemRewards).toHaveLength(1);
    });

    it('removes from active quests', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      expect(getActiveQuests()).toHaveLength(0);
    });

    it('adds to completed list', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      expect(getCompletedQuestIds()).toContain('q1');
    });

    it('fails for incomplete quest', () => {
      acceptQuest(makeQuest());
      const result = turnInQuest('q1');
      expect(result.success).toBe(false);
    });

    it('fails for unknown quest', () => {
      const result = turnInQuest('nope');
      expect(result.success).toBe(false);
    });

    it('creates turn-in notification', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      const notifs = getNotifications();
      expect(notifs.some(n => n.type === 'turned_in')).toBe(true);
    });
  });

  describe('quest chain', () => {
    it('adds quest chain', () => {
      addQuestChain({ id: 'chain1', questIds: ['q1', 'q2'] });
      expect(getQuestServiceState().questChains).toHaveLength(1);
    });

    it('checks chain unlocks', () => {
      addQuestChain({ id: 'chain1', questIds: ['q1', 'q2'] });
      acceptQuest(makeQuest({ id: 'q1' }));
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      checkQuestChainUnlocks();
      const notifs = getNotifications();
      expect(notifs.some(n => n.type === 'chain_unlocked')).toBe(true);
    });

    it('does not unlock chain when prerequisite not met', () => {
      addQuestChain({ id: 'chain1', questIds: ['q1', 'q2'], prerequisiteQuestId: 'q0' });
      acceptQuest(makeQuest({ id: 'q1' }));
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      checkQuestChainUnlocks();
      const notifs = getNotifications();
      expect(notifs.some(n => n.type === 'chain_unlocked')).toBe(false);
    });
  });

  describe('tracking', () => {
    it('set and get tracked quest', () => {
      acceptQuest(makeQuest());
      setTrackingQuest('q1');
      expect(getTrackedQuest()?.id).toBe('q1');
    });

    it('clears tracking', () => {
      setTrackingQuest(null);
      expect(getTrackedQuest()).toBeNull();
    });

    it('returns null for non-existent quest', () => {
      setTrackingQuest('nope');
      expect(getTrackedQuest()).toBeNull();
    });
  });

  describe('notifications', () => {
    it('clears all notifications', () => {
      acceptQuest(makeQuest());
      clearNotifications();
      expect(getNotifications()).toHaveLength(0);
    });

    it('removes specific notification', () => {
      acceptQuest(makeQuest());
      const notifs = getNotifications();
      removeNotification(notifs[0].id);
      expect(getNotifications()).toHaveLength(0);
    });
  });

  describe('quest progress', () => {
    it('calculates progress percentage', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 2);
      const progress = getQuestProgress('q1');
      expect(progress).not.toBeNull();
      expect(progress!.completed).toBe(2);
      expect(progress!.total).toBe(5);
      expect(progress!.percentage).toBe(40);
    });

    it('returns null for unknown quest', () => {
      expect(getQuestProgress('nope')).toBeNull();
    });

    it('returns 100% when complete', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      const progress = getQuestProgress('q1');
      expect(progress!.percentage).toBe(100);
    });
  });

  describe('isQuestActive / isQuestCompleted', () => {
    it('checks active and completed status', () => {
      expect(isQuestActive('q1')).toBe(false);
      expect(isQuestCompleted('q1')).toBe(false);
      acceptQuest(makeQuest());
      expect(isQuestActive('q1')).toBe(true);
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      expect(isQuestActive('q1')).toBe(false);
      expect(isQuestCompleted('q1')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('updateObjective on completed quest returns false', () => {
      acceptQuest(makeQuest());
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      const result = updateObjective('q1', 'o1', 1);
      expect(result.success).toBe(false);
    });

    it('checkQuestChainUnlocks with no chains returns empty', () => {
      resetQuestServiceState();
      const result = checkQuestChainUnlocks();
      expect(result).toHaveLength(0);
    });

    it('getQuestProgress returns correct percentage', () => {
      acceptQuest(makeQuest({ objectives: [
        { id: 'o1', description: 'Kill 10 slimes', type: 'kill', target: 'slime', required: 10, current: 0 },
        { id: 'o2', description: 'Collect 5 herbs', type: 'collect', target: 'herb', required: 5, current: 0 },
      ] }));
      updateObjective('q1', 'o1', 5);
      const progress = getQuestProgress('q1');
      expect(progress).not.toBeNull();
      expect(progress!.percentage).toBeGreaterThan(0);
      expect(progress!.percentage).toBeLessThanOrEqual(100);
    });

    it('getActiveQuests returns only active quests', () => {
      acceptQuest(makeQuest({ id: 'q1', name: 'Active Quest' }));
      acceptQuest(makeQuest({ id: 'q2', name: 'Another Quest' }));
      updateObjective('q1', 'o1', 5);
      turnInQuest('q1');
      const active = getActiveQuests();
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('q2');
    });

    it('multiple notifications accumulate', () => {
      acceptQuest(makeQuest({ id: 'q1' }));
      acceptQuest(makeQuest({ id: 'q2' }));
      acceptQuest(makeQuest({ id: 'q3' }));
      const notifs = getNotifications();
      expect(notifs.length).toBeGreaterThanOrEqual(3);
    });
  });
});
