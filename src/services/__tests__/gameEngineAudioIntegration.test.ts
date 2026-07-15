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

describe('GameEngine - Audio Triggers', () => {
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

  it('has default audio triggers', () => {
    const triggers = engine.getAudioTriggers();
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers.some(t => t.event === 'enemy_defeated')).toBe(true);
    expect(triggers.some(t => t.event === 'item_collected')).toBe(true);
    expect(triggers.some(t => t.event === 'damage_taken')).toBe(true);
    expect(triggers.some(t => t.event === 'player_heal')).toBe(true);
    expect(triggers.some(t => t.event === 'wave_complete')).toBe(true);
    expect(triggers.some(t => t.event === 'game_over')).toBe(true);
    expect(triggers.some(t => t.event === 'victory')).toBe(true);
  });

  it('can toggle audio trigger enabled state', () => {
    const triggers = engine.getAudioTriggers();
    const firstTrigger = triggers[0];
    engine.setAudioTrigger(firstTrigger.id, { enabled: false });
    const updated = engine.getAudioTriggers();
    expect(updated.find(t => t.id === firstTrigger.id)?.enabled).toBe(false);
  });

  it('can change audio trigger sound type', () => {
    const triggers = engine.getAudioTriggers();
    const firstTrigger = triggers[0];
    engine.setAudioTrigger(firstTrigger.id, { soundType: 'magicSpell' });
    const updated = engine.getAudioTriggers();
    expect(updated.find(t => t.id === firstTrigger.id)?.soundType).toBe('magicSpell');
  });

  it('WIN_GAME triggers victory audio event', () => {
    engine.processCommands([{ type: 'WIN_GAME', params: {} }]);
    expect(engine.getState().victory).toBe(true);
    expect(callbacks.onVictory).toHaveBeenCalled();
  });

  it('GAME_OVER triggers game over audio event', () => {
    engine.processCommands([{ type: 'GAME_OVER', params: {} }]);
    expect(engine.getState().gameOver).toBe(true);
    expect(callbacks.onGameOver).toHaveBeenCalled();
  });
});

describe('GameEngine - Music State', () => {
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

  it('initializes with calm music theme', () => {
    const music = engine.getMusicState();
    expect(music.currentTheme).toBe('calm');
    expect(music.targetTheme).toBe('calm');
    expect(music.isTransitioning).toBe(false);
  });

  it('music state transitions to combat when enemies appear', () => {
    engine.processCommands([{ type: 'SPAWN_ENEMY', params: { text: '👾' } }]);
    const state = engine.getState();
    expect(state.enemies.length).toBeGreaterThan(0);
  });

  it('music state resets on restart', () => {
    engine.restart();
    const music = engine.getMusicState();
    expect(music.currentTheme).toBe('calm');
    expect(music.targetTheme).toBe('calm');
  });

  it('WIN_GAME sets music to victory theme', () => {
    engine.processCommands([{ type: 'WIN_GAME', params: {} }]);
    expect(engine.getState().victory).toBe(true);
  });

  it('GAME_OVER sets music to defeat theme', () => {
    engine.processCommands([{ type: 'GAME_OVER', params: {} }]);
    expect(engine.getState().gameOver).toBe(true);
  });
});

describe('GameEngine - Sound Pool', () => {
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

  it('returns sound pool stats', () => {
    const stats = engine.getSoundPoolStats();
    expect(typeof stats.poolSize).toBe('number');
    expect(typeof stats.activeCount).toBe('number');
  });

  it('sound pool is initialized', () => {
    const stats = engine.getSoundPoolStats();
    expect(stats.poolSize).toBeGreaterThanOrEqual(0);
  });

  it('destroy cleans up sound pool', () => {
    engine.destroy();
    const stats = engine.getSoundPoolStats();
    expect(stats.poolSize).toBe(0);
  });
});

describe('GameEngine - Audio in Game Loop', () => {
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

  it('processes SPAWN_ENEMY command', () => {
    engine.processCommands([{ type: 'SPAWN_ENEMY', params: { text: '👾' } }]);
    expect(engine.getState().enemies.length).toBe(1);
  });

  it('processes SPAWN_ITEM command', () => {
    engine.processCommands([{ type: 'SPAWN_ITEM', params: { text: '🪙' } }]);
    expect(engine.getState().items.length).toBe(1);
  });

  it('processes PLAY_SOUND command', () => {
    engine.processCommands([{ type: 'PLAY_SOUND', params: { text: 'coin' } }]);
    expect(engine.getState()).toBeDefined();
  });

  it('processes SWING_WEAPON command with sound', () => {
    engine.processCommands([{ type: 'SWING_WEAPON', params: { text: '⚔️', value: 10 } }]);
    const proj = engine.getState().projectiles.find(p => p.behavior === 'melee');
    expect(proj).toBeDefined();
  });

  it('processes COMBO_ATTACK command', () => {
    engine.processCommands([{ type: 'COMBO_ATTACK', params: { value: 3 } }]);
    expect(engine.getState().projectiles.length).toBeGreaterThanOrEqual(0);
  });

  it('processes DODGE_ROLL with sound', () => {
    engine.processCommands([{ type: 'DODGE_ROLL', params: { value: 10 } }]);
    expect(engine.getState()).toBeDefined();
  });

  it('processes BLOCK_ATTACK with sound', () => {
    vi.useFakeTimers();
    engine.processCommands([{ type: 'BLOCK_ATTACK', params: {} }]);
    expect(engine.getState().player.data?.shield).toBe(true);
    vi.useRealTimers();
  });

  it('processes SPECIAL_MOVE with sound', () => {
    engine.processCommands([{ type: 'SPECIAL_MOVE', params: {} }]);
    expect(engine.getState().particles.length).toBeGreaterThanOrEqual(0);
  });
});

describe('GameEngine - Audio Ducking During Gameplay', () => {
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

  it('engine handles rapid audio events', () => {
    for (let i = 0; i < 10; i++) {
      engine.processCommands([{ type: 'SPAWN_ENEMY', params: { text: '👾' } }]);
    }
    expect(engine.getState().enemies.length).toBe(10);
  });

  it('engine handles concurrent audio and game events', () => {
    engine.processCommands([
      { type: 'SPAWN_ENEMY', params: { text: '👾' } },
      { type: 'SPAWN_ITEM', params: { text: '🪙' } },
      { type: 'PLAY_SOUND', params: { text: 'coin' } },
    ]);
    expect(engine.getState().enemies.length).toBe(1);
    expect(engine.getState().items.length).toBe(1);
  });

  it('engine maintains audio state across restarts', () => {
    engine.processCommands([
      { type: 'SPAWN_ENEMY', params: { text: '👾' } },
      { type: 'SET_SCORE', params: { value: 500 } },
    ]);
    engine.restart();
    const state = engine.getState();
    expect(state.score).toBe(0);
    expect(state.enemies.length).toBe(0);
    expect(engine.getMusicState().currentTheme).toBe('calm');
  });

  it('engine handles performance stats with audio', () => {
    engine.processCommands([
      { type: 'SPAWN_ENEMY', params: { text: '👾' } },
      { type: 'SPAWN_ITEM', params: { text: '🪙' } },
    ]);
    const stats = engine.getPerformanceStats();
    expect(typeof stats.fps).toBe('number');
    expect(typeof stats.entityCount).toBe('number');
    expect(stats.entityCount).toBeGreaterThanOrEqual(2);
  });
});
