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

describe('Error Handling Edge Cases', () => {
  let canvas: HTMLCanvasElement;
  let callbacks: ReturnType<typeof createCallbacks>;

  beforeEach(() => {
    canvas = createMockCanvas();
    callbacks = createCallbacks();
  });

  describe('Engine Initialization', () => {
    it('should create engine without errors', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      expect(engine).toBeDefined();
      vi.useRealTimers();
    });

    it('should handle missing canvas context gracefully', () => {
      const badCanvas = {
        ...canvas,
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      expect(() => new GameEngine(badCanvas, callbacks)).toThrow('Could not get 2D context');
    });
  });

  describe('State Management', () => {
    it('should return a copy of state', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
      vi.useRealTimers();
    });

    it('should handle saveState with empty state', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const saved = engine.saveState();
      expect(saved).toBeDefined();
      expect(saved.score).toBe(0);
      expect(saved.health).toBe(100);
      vi.useRealTimers();
    });

    it('should handle loadState with partial data', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.loadState({});
      const state = engine.getState();
      expect(state.score).toBe(0);
      vi.useRealTimers();
    });

    it('should handle loadState with undefined fields', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.loadState({ score: undefined, health: undefined });
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.health).toBe(100);
      vi.useRealTimers();
    });
  });

  describe('Error Tracking', () => {
    it('should initialize with empty errors', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const errors = engine.getErrors();
      expect(errors).toEqual([]);
      vi.useRealTimers();
    });

    it('should clear errors', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.clearErrors();
      expect(engine.getErrors()).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('Process Commands Edge Cases', () => {
    it('should handle empty command list', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      expect(() => engine.processCommands([])).not.toThrow();
      vi.useRealTimers();
    });

    it('should handle unknown command types', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      expect(() => engine.processCommands([
        { type: 'UNKNOWN_COMMAND', params: {} }
      ])).not.toThrow();
      vi.useRealTimers();
    });

    it('should handle commands with missing params', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      expect(() => engine.processCommands([
        { type: 'SET_VAR', params: {} }
      ])).not.toThrow();
      vi.useRealTimers();
    });
  });

  describe('Restart Edge Cases', () => {
    it('should restart cleanly', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.restart();
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.health).toBe(100);
      expect(state.gameOver).toBe(false);
      expect(state.victory).toBe(false);
      vi.useRealTimers();
    });

    it('should reset all state on restart', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'score', value: 100 } },
      ]);
      engine.restart();
      const state = engine.getState();
      expect(state.score).toBe(0);
      vi.useRealTimers();
    });
  });

  describe('Performance Stats', () => {
    it('should return performance stats', () => {
      vi.useFakeTimers();
      const engine = new GameEngine(canvas, callbacks);
      const stats = engine.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.fps).toBe('number');
      expect(typeof stats.entityCount).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
      vi.useRealTimers();
    });
  });
});
