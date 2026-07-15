import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '../gameEngine';

function createMockCanvas() {
  return {
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      ellipse: vi.fn(),
      globalAlpha: 1,
      strokeStyle: '',
      lineWidth: 1,
      setLineDash: vi.fn(),
      closePath: vi.fn(),
      drawImage: vi.fn(),
      roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
    style: {},
    focus: vi.fn(),
    requestAnimationFrame: vi.fn((fn) => fn()),
    cancelAnimationFrame: vi.fn(),
  } as unknown as HTMLCanvasElement;
}

function createCallbacks() {
  return {
    onStateChange: vi.fn(),
    onGameOver: vi.fn(),
    onVictory: vi.fn(),
    onWaveComplete: vi.fn(),
    onEnemyDefeated: vi.fn(),
    onItemCollected: vi.fn(),
    onDamage: vi.fn(),
    onHeal: vi.fn(),
  };
}

describe('Performance Optimizations', () => {
  let canvas: HTMLCanvasElement;
  let callbacks: ReturnType<typeof createCallbacks>;

  beforeEach(() => {
    canvas = createMockCanvas();
    callbacks = createCallbacks();
  });

  describe('Frame Timing', () => {
    it('should track frame count', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const stats = engine.getPerformanceStats();
      expect(stats.fps).toBe(0);
      vi.useRealTimers();
    });

    it('should track entity count', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const stats = engine.getPerformanceStats();
      expect(stats.entityCount).toBe(0);
      vi.useRealTimers();
    });
  });

  describe('Time Scale', () => {
    it('should apply time scale to updates', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.setTimeScale(0.5);
      expect(engine.getTimeScale()).toBe(0.5);
      vi.useRealTimers();
    });

    it('should clamp time scale to valid range', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.setTimeScale(-1);
      expect(engine.getTimeScale()).toBe(0.1);
      engine.setTimeScale(10);
      expect(engine.getTimeScale()).toBe(3);
      vi.useRealTimers();
    });
  });

  describe('Entity Management', () => {
    it('should start with empty entity lists', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const state = engine.getState();
      expect(state.enemies).toHaveLength(0);
      expect(state.items).toHaveLength(0);
      expect(state.projectiles).toHaveLength(0);
      expect(state.particles).toHaveLength(0);
      vi.useRealTimers();
    });

    it('should handle loadFromToolState with empty data', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.loadFromToolState({});
      const state = engine.getState();
      expect(state.enemies).toHaveLength(0);
      vi.useRealTimers();
    });
  });

  describe('Memory Management', () => {
    it('should return memory usage in stats', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const stats = engine.getPerformanceStats();
      expect(typeof stats.memoryUsage).toBe('number');
      vi.useRealTimers();
    });
  });

  describe('State Snapshot', () => {
    it('should create save state snapshot', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'score', value: 500 } },
      ]);
      const saved = engine.saveState();
      expect(saved.score).toBe(500);
      vi.useRealTimers();
    });

    it('should preserve variables in save state', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'health', value: 75 } },
      ]);
      const saved = engine.saveState();
      expect(saved.health).toBe(75);
      vi.useRealTimers();
    });
  });
});
