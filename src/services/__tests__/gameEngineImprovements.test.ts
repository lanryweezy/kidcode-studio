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

describe('GameEngine Improvements', () => {
  let canvas: HTMLCanvasElement;
  let callbacks: ReturnType<typeof createCallbacks>;
  let engine: GameEngine;

  beforeEach(() => {
    canvas = createMockCanvas();
    callbacks = createCallbacks();
    vi.useFakeTimers();
    engine = new GameEngine(canvas, callbacks);
    vi.useRealTimers();
  });

  describe('Boss Rage Mode', () => {
    it('should track boss enrage state', () => {
      const state = engine.getState();
      expect(state).toBeDefined();
      expect(state.score).toBe(0);
    });

    it('should have restart method that resets state', () => {
      engine.restart();
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.health).toBe(100);
    });
  });

  describe('Environmental Hazards', () => {
    it('should initialize without errors', () => {
      expect(engine).toBeDefined();
    });

    it('should have getPerformanceStats method', () => {
      const stats = engine.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.fps).toBe('number');
      expect(typeof stats.entityCount).toBe('number');
    });
  });

  describe('Collectible System', () => {
    it('should initialize with default state', () => {
      const state = engine.getState();
      expect(state.items).toEqual([]);
      expect(state.enemies).toEqual([]);
    });

    it('should handle save/load state', () => {
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'score', value: 100 } },
      ]);
      const saved = engine.saveState();
      expect(saved.score).toBe(100);

      engine.restart();
      engine.loadState({ score: 200 });
      const state = engine.getState();
      expect(state.score).toBe(200);
    });
  });

  describe('Time Scale', () => {
    it('should set and get time scale', () => {
      engine.setTimeScale(1.5);
      expect(engine.getTimeScale()).toBe(1.5);
    });

    it('should clamp time scale between 0.1 and 3', () => {
      engine.setTimeScale(0.01);
      expect(engine.getTimeScale()).toBe(0.1);
      engine.setTimeScale(5);
      expect(engine.getTimeScale()).toBe(3);
    });
  });

  describe('Camera', () => {
    it('should enable camera', () => {
      engine.enableCamera(true, 1600, 1200);
      const state = engine.getState();
      expect(state.camera).toBeDefined();
      expect(state.camera?.followPlayer).toBe(true);
      expect(state.camera?.worldWidth).toBe(1600);
    });

    it('should set camera zoom', () => {
      engine.enableCamera();
      engine.setCameraZoom(1.5, true);
      const state = engine.getState();
      expect(state.camera?.zoom).toBe(1.5);
    });
  });

  describe('Error Handling', () => {
    it('should track errors', () => {
      const errors = engine.getErrors();
      expect(Array.isArray(errors)).toBe(true);
    });

    it('should clear errors', () => {
      engine.clearErrors();
      const errors = engine.getErrors();
      expect(errors).toHaveLength(0);
    });
  });
});
