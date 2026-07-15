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

describe('GameEngine - advanced features', () => {
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

  describe('time scale (slow-mo)', () => {
    it('get/set time scale', () => {
      engine.setTimeScale(0.5);
      expect(engine.getTimeScale()).toBe(0.5);
    });

    it('clamps to min/max', () => {
      engine.setTimeScale(0.01);
      expect(engine.getTimeScale()).toBe(0.1);
      engine.setTimeScale(10);
      expect(engine.getTimeScale()).toBe(3);
    });
  });

  describe('screen shake', () => {
    it('screenShake sets camera shake', () => {
      engine.enableCamera(true);
      engine.screenShake(8, 0.5);
      const state = engine.getState();
      expect(state.camera?.shakeIntensity).toBe(8);
    });
  });

  describe('error reporting', () => {
    it('getErrors returns errors', () => {
      const errors = engine.getErrors();
      expect(Array.isArray(errors)).toBe(true);
    });

    it('clearErrors clears error list', () => {
      engine.clearErrors();
      expect(engine.getErrors()).toHaveLength(0);
    });
  });

  describe('processCommands - edge cases', () => {
    it('SPAWN_PARTICLES with default count', () => {
      engine.processCommands([{ type: 'SPAWN_PARTICLES', params: {} }]);
      expect(engine.getState().particles).toBeDefined();
    });

    it('COMBO_ATTACK with default count', () => {
      engine.processCommands([{ type: 'COMBO_ATTACK', params: {} }]);
      expect(engine.getState().projectiles).toBeDefined();
    });

    it('DODGE_ROLL with default distance', () => {
      const startX = engine.getState().player.x;
      engine.processCommands([{ type: 'DODGE_ROLL', params: {} }]);
      expect(engine.getState().player.x).toBeGreaterThanOrEqual(startX);
    });

    it('SCREEN_SHAKE with default value', () => {
      engine.processCommands([{ type: 'SCREEN_SHAKE', params: {} }]);
      const state = engine.getState();
      expect(state).toBeDefined();
    });

    it('LOAD_CHECKPOINT with no checkpoint', () => {
      const startX = engine.getState().player.x;
      engine.processCommands([{ type: 'LOAD_CHECKPOINT', params: {} }]);
      expect(engine.getState().player.x).toBe(startX);
    });

    it('SWING_WEAPON with default params', () => {
      engine.processCommands([{ type: 'SWING_WEAPON', params: {} }]);
      const proj = engine.getState().projectiles.find(p => p.behavior === 'melee');
      expect(proj).toBeDefined();
    });

    it('SET_SIZE with 100 (default)', () => {
      engine.processCommands([{ type: 'SET_SIZE', params: {} }]);
      const state = engine.getState();
      expect(state.player.width).toBe(32);
      expect(state.player.height).toBe(32);
    });

    it('SET_GRAVITY with no condition', () => {
      engine.processCommands([{ type: 'SET_GRAVITY', params: {} }]);
      expect(engine.getState()).toBeDefined();
    });

    it('SAY with empty text', () => {
      vi.useFakeTimers();
      engine.processCommands([{ type: 'SAY', params: {} }]);
      expect(engine.getState().player.data?.speech).toBeUndefined();
      vi.useRealTimers();
    });

    it('CHANGE_VAR with missing varName', () => {
      engine.processCommands([{ type: 'CHANGE_VAR', params: { value: 10 } }]);
      expect(engine.getState()).toBeDefined();
    });

    it('SET_VAR with missing varName', () => {
      engine.processCommands([{ type: 'SET_VAR', params: { value: 10 } }]);
      expect(engine.getState()).toBeDefined();
    });
  });

  describe('camera zoom instant', () => {
    it('instant zoom applies immediately', () => {
      engine.enableCamera(true);
      engine.setCameraZoom(1.5, true);
      expect(engine.getState().camera?.zoom).toBe(1.5);
    });
  });

  describe('loadFromToolState - edge cases', () => {
    it('handles empty enemies array', () => {
      engine.loadFromToolState({ enemies: [] });
      expect(engine.getState().enemies).toHaveLength(0);
    });

    it('handles enemies with default fields', () => {
      engine.loadFromToolState({
        enemies: [{ x: 100, y: 100 }],
      });
      expect(engine.getState().enemies).toHaveLength(1);
      expect(engine.getState().enemies[0].hp).toBe(30);
    });

    it('handles items with default fields', () => {
      engine.loadFromToolState({
        items: [{ x: 50, y: 50 }],
      });
      expect(engine.getState().items).toHaveLength(1);
    });

    it('handles health with no maxHp', () => {
      engine.loadFromToolState({ health: 80 });
      expect(engine.getState().health).toBe(80);
      expect(engine.getState().maxHealth).toBe(80);
    });

    it('handles score undefined', () => {
      engine.loadFromToolState({});
      expect(engine.getState().score).toBe(0);
    });

    it('handles gravity with force', () => {
      engine.loadFromToolState({ gravity: true, gravityForce: 1.0 });
      expect(engine.getState()).toBeDefined();
    });

    it('handles friction', () => {
      engine.loadFromToolState({ friction: 0.5 });
      expect(engine.getState()).toBeDefined();
    });

    it('handles dark lighting', () => {
      engine.loadFromToolState({ lighting: { ambientIntensity: 0.3 } });
      expect(engine.getState().dayTime).toBe(6);
    });
  });
});
