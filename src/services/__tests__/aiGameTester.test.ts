import { describe, it, expect } from 'vitest';
import {
  simulateGame,
  type TestConfig,
} from '../aiGameTester';
import { CommandBlock, CommandType } from '../../types';

function makeBlock(type: CommandType, params: Record<string, unknown> = {}): CommandBlock {
  return {
    id: `b_${Math.random().toString(36).slice(2, 8)}`,
    type,
    params,
  };
}

function makeConfig(blocks: CommandBlock[], maxSteps = 50, seed = 42): TestConfig {
  return { blocks, maxSteps, seed };
}

describe('aiGameTester', () => {
  describe('simulateGame', () => {
    it('handles empty blocks', () => {
      const report = simulateGame(makeConfig([]));
      expect(report.passed).toBeDefined();
      expect(report.totalSteps).toBeGreaterThan(0);
      expect(report.events).toHaveLength(report.totalSteps);
      expect(report.summary).toBeDefined();
    });

    it('detects missing win/lose conditions', () => {
      const blocks = [
        makeBlock(CommandType.SPAWN_ENEMY, { text: '👾' }),
        makeBlock(CommandType.MOVE_X),
      ];
      const report = simulateGame(makeConfig(blocks));
      const criticalBugs = report.bugs.filter(b => b.severity === 'critical');
      expect(criticalBugs.some(b => b.title.includes('win or lose'))).toBe(true);
    });

    it('detects infinite loops without break', () => {
      const blocks = [
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.MOVE_X),
        makeBlock(CommandType.END_FOREVER),
      ];
      const report = simulateGame(makeConfig(blocks));
      expect(report.summary.infiniteLoopSuspected).toBe(true);
      expect(report.bugs.some(b => b.title.includes('infinite loop'))).toBe(true);
    });

    it('does not flag infinite loop with break', () => {
      const blocks = [
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.MOVE_X),
        makeBlock(CommandType.BREAK),
        makeBlock(CommandType.END_FOREVER),
      ];
      const report = simulateGame(makeConfig(blocks));
      expect(report.summary.infiniteLoopSuspected).toBe(false);
    });

    it('simulates collect actions and increases score', () => {
      const blocks = [
        makeBlock(CommandType.SPAWN_ITEM, { text: '🪙' }),
        makeBlock(CommandType.CHANGE_SCORE, { value: 10 }),
        makeBlock(CommandType.WIN_GAME),
      ];
      const report = simulateGame(makeConfig(blocks, 20, 1));
      expect(report.summary.score).toBeGreaterThanOrEqual(0);
    });

    it('tracks projectiles fired', () => {
      const blocks = [
        makeBlock(CommandType.SHOOT),
      ];
      const report = simulateGame(makeConfig(blocks, 30, 1));
      expect(report.summary.projectilesFired).toBeGreaterThanOrEqual(0);
    });

    it('detects too many enemies as a bug', () => {
      const blocks = Array.from({ length: 20 }, (_, i) =>
        makeBlock(CommandType.SPAWN_ENEMY, { text: `👾${i}` })
      );
      const report = simulateGame(makeConfig(blocks));
      expect(report.bugs.some(b => b.title.includes('Too many enemies'))).toBe(true);
    });

    it('suggests improvements for enemies without weapons', () => {
      const blocks = [
        makeBlock(CommandType.SPAWN_ENEMY, { text: '👾' }),
      ];
      const report = simulateGame(makeConfig(blocks));
      expect(report.improvements.some(i => i.title.includes('fight enemies'))).toBe(true);
    });

    it('suggests platforms when gravity is enabled', () => {
      const blocks = [
        makeBlock(CommandType.SET_GRAVITY, { condition: 'true' }),
        makeBlock(CommandType.JUMP),
      ];
      const report = simulateGame(makeConfig(blocks));
      expect(report.improvements.some(i => i.title.includes('platforms'))).toBe(true);
    });

    it('generates events with step numbers', () => {
      const blocks = [makeBlock(CommandType.MOVE_X)];
      const report = simulateGame(makeConfig(blocks, 10, 1));
      for (let i = 0; i < report.events.length; i++) {
        expect(report.events[i].step).toBe(i);
      }
    });

    it('uses seed for deterministic results', () => {
      const blocks = [makeBlock(CommandType.MOVE_X), makeBlock(CommandType.SHOOT)];
      const report1 = simulateGame(makeConfig(blocks, 10, 42));
      const report2 = simulateGame(makeConfig(blocks, 10, 42));
      expect(report1.events.length).toBe(report2.events.length);
      expect(report1.summary.score).toBe(report2.summary.score);
    });

    it('different seeds produce different results', () => {
      const blocks = [makeBlock(CommandType.MOVE_X), makeBlock(CommandType.SHOOT)];
      const report1 = simulateGame(makeConfig(blocks, 20, 1));
      const report2 = simulateGame(makeConfig(blocks, 20, 99));
      const events1 = report1.events.map(e => e.action).join(',');
      const events2 = report2.events.map(e => e.action).join(',');
      expect(events1).not.toBe(events2);
    });

    it('stops when player dies', () => {
      const blocks = [
        makeBlock(CommandType.CHANGE_HEALTH, { value: -200 }),
        makeBlock(CommandType.MOVE_X),
      ];
      const report = simulateGame(makeConfig(blocks, 100, 1));
      expect(report.summary.health).toBeLessThanOrEqual(100);
    });

    it('includes test bug metadata', () => {
      const blocks = [
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.END_FOREVER),
      ];
      const report = simulateGame(makeConfig(blocks));
      for (const bug of report.bugs) {
        expect(bug.id).toBeTruthy();
        expect(bug.title).toBeTruthy();
        expect(bug.description).toBeTruthy();
        expect(bug.reproductionSteps.length).toBeGreaterThan(0);
      }
    });

    it('passed is boolean', () => {
      const report = simulateGame(makeConfig([]));
      expect(typeof report.passed).toBe('boolean');
    });
  });
});
