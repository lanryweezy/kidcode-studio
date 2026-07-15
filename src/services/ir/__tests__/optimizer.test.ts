import { describe, it, expect } from 'vitest';
import { optimizeIR, formatOptimizationStats } from '../optimizer';

describe('IR Optimizer', () => {
  // === Dead Code Elimination ===
  describe('dead code elimination', () => {
    it('removes redundant SHOW', () => {
      const nodes = [
        { kind: 'show' as const, entityId: 'player' },
        { kind: 'show' as const, entityId: 'player' },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect(result.removed).toBe(1);
    });

    it('removes redundant HIDE', () => {
      const nodes = [
        { kind: 'hide' as const, entityId: 'player' },
        { kind: 'hide' as const, entityId: 'player' },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect(result.removed).toBe(1);
    });

    it('does not remove SHOW followed by HIDE', () => {
      const nodes = [
        { kind: 'show' as const, entityId: 'player' },
        { kind: 'hide' as const, entityId: 'player' },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(2);
    });

    it('removes redundant SET_GRAVITY', () => {
      const nodes = [
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true },
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
    });

    it('does not remove SET_GRAVITY when values differ', () => {
      const nodes = [
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true },
        { kind: 'set_gravity' as const, entityId: 'player', enabled: false },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(2);
    });
  });

  // === Constant Folding ===
  describe('constant folding', () => {
    it('merges consecutive MOVE_X', () => {
      const nodes = [
        { kind: 'move_x' as const, entityId: 'player', dx: 5 },
        { kind: 'move_x' as const, entityId: 'player', dx: 3 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect((result.nodes[0] as any).dx).toBe(8);
      expect(result.folded).toBe(1);
    });

    it('merges consecutive MOVE_Y', () => {
      const nodes = [
        { kind: 'move_y' as const, entityId: 'player', dy: 10 },
        { kind: 'move_y' as const, entityId: 'player', dy: 5 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect((result.nodes[0] as any).dy).toBe(15);
    });

    it('merges consecutive CHANGE_SCORE', () => {
      const nodes = [
        { kind: 'change_score' as const, delta: 10 },
        { kind: 'change_score' as const, delta: 5 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect((result.nodes[0] as any).delta).toBe(15);
    });

    it('last SET_SCORE wins', () => {
      const nodes = [
        { kind: 'set_score' as const, value: 10 },
        { kind: 'set_score' as const, value: 20 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect((result.nodes[0] as any).value).toBe(20);
    });

    it('does not merge non-adjacent nodes', () => {
      const nodes = [
        { kind: 'move_x' as const, entityId: 'player', dx: 5 },
        { kind: 'say' as const, entityId: 'player', text: 'hello' },
        { kind: 'move_x' as const, entityId: 'player', dx: 3 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(3);
    });
  });

  // === Peephole Optimization ===
  describe('peephole optimization', () => {
    it('removes MOVE_X(0)', () => {
      const nodes = [
        { kind: 'move_x' as const, entityId: 'player', dx: 0 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(0);
      expect(result.merged).toBe(1);
    });

    it('removes MOVE_Y(0)', () => {
      const nodes = [
        { kind: 'move_y' as const, entityId: 'player', dy: 0 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(0);
    });

    it('removes duplicate SET_VELOCITY_X', () => {
      const nodes = [
        { kind: 'set_velocity_x' as const, entityId: 'player', vx: 0 },
        { kind: 'set_velocity_x' as const, entityId: 'player', vx: 10 },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
      expect((result.nodes[0] as any).vx).toBe(10);
    });

    it('removes duplicate SET_FORMATION', () => {
      const nodes = [
        { kind: 'set_formation' as const, formation: '4-4-2' },
        { kind: 'set_formation' as const, formation: '4-4-2' },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(1);
    });
  });

  // === Combined Optimizations ===
  describe('combined optimizations', () => {
    it('applies all passes in sequence', () => {
      const nodes = [
        { kind: 'move_x' as const, entityId: 'player', dx: 0 }, // dead
        { kind: 'move_x' as const, entityId: 'player', dx: 5 },  // fold
        { kind: 'move_x' as const, entityId: 'player', dx: 3 },  // fold
        { kind: 'show' as const, entityId: 'player' },            // dead
        { kind: 'show' as const, entityId: 'player' },            // dead
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true },
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true }, // dead
      ];
      const result = optimizeIR(nodes);
      // After all passes: [move_x(8), show, set_gravity(true)]
      expect(result.nodes.length).toBeLessThan(7);
      expect(result.removed).toBeGreaterThan(0);
    });

    it('preserves order of non-adjacent nodes', () => {
      const nodes = [
        { kind: 'say' as const, entityId: 'player', text: 'first' },
        { kind: 'move_x' as const, entityId: 'player', dx: 5 },
        { kind: 'move_x' as const, entityId: 'player', dx: 3 },
        { kind: 'say' as const, entityId: 'player', text: 'second' },
      ];
      const result = optimizeIR(nodes);
      expect(result.nodes).toHaveLength(3);
      expect((result.nodes[0] as any).text).toBe('first');
      expect((result.nodes[1] as any).dx).toBe(8);
      expect((result.nodes[2] as any).text).toBe('second');
    });
  });

  // === formatOptimizationStats ===
  describe('formatOptimizationStats', () => {
    it('formats stats correctly', () => {
      const stats = { nodes: [], removed: 3, merged: 2, folded: 1 };
      expect(formatOptimizationStats(stats)).toBe('3 dead code removed, 2 redundant ops merged, 1 constants folded');
    });

    it('returns message for no optimizations', () => {
      const stats = { nodes: [], removed: 0, merged: 0, folded: 0 };
      expect(formatOptimizationStats(stats)).toBe('No optimizations applied');
    });
  });
});
