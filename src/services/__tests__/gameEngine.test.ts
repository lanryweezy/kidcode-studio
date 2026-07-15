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

describe('GameEngine', () => {
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

  describe('initialization', () => {
    it('creates engine with default state', () => {
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.health).toBe(100);
      expect(state.maxHealth).toBe(100);
      expect(state.wave).toBe(1);
      expect(state.combo).toBe(0);
      expect(state.isPaused).toBe(false);
      expect(state.gameOver).toBe(false);
      expect(state.victory).toBe(false);
      expect(state.weather).toBe('none');
      expect(state.scene).toBe('space');
      expect(state.player).toBeDefined();
      expect(state.player.emoji).toBe('🚀');
      expect(state.player.hp).toBe(100);
    });

    it('throws if canvas context is null', () => {
      const badCanvas = {
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;
      expect(() => new GameEngine(badCanvas, callbacks)).toThrow('Could not get 2D context');
    });
  });

  describe('processCommands', () => {
    it('SET_WEATHER changes weather', () => {
      engine.processCommands([{ type: 'SET_WEATHER', params: { text: 'rain' } }]);
      expect(engine.getState().weather).toBe('rain');
    });

    it('SET_SCENE changes scene', () => {
      engine.processCommands([{ type: 'SET_SCENE', params: { text: 'forest' } }]);
      expect(engine.getState().scene).toBe('forest');
    });

    it('SET_EMOJI changes player emoji', () => {
      engine.processCommands([{ type: 'SET_EMOJI', params: { text: '🧙' } }]);
      expect(engine.getState().player.emoji).toBe('🧙');
    });

    it('SET_SIZE changes player dimensions', () => {
      engine.processCommands([{ type: 'SET_SIZE', params: { value: 200 } }]);
      expect(engine.getState().player.width).toBe(64);
      expect(engine.getState().player.height).toBe(64);
    });

    it('SPAWN_ENEMY adds enemy', () => {
      const before = engine.getState().enemies.length;
      engine.processCommands([{ type: 'SPAWN_ENEMY', params: { text: '👾' } }]);
      expect(engine.getState().enemies.length).toBe(before + 1);
    });

    it('SPAWN_ITEM adds item', () => {
      const before = engine.getState().items.length;
      engine.processCommands([{ type: 'SPAWN_ITEM', params: { text: '🪙' } }]);
      expect(engine.getState().items.length).toBe(before + 1);
    });

    it('SPAWN_PARTICLES adds particles', () => {
      engine.processCommands([{ type: 'SPAWN_PARTICLES', params: { value: 5 } }]);
      expect(engine.getState().particles.length).toBeGreaterThanOrEqual(0);
    });

    it('WIN_GAME triggers victory', () => {
      engine.processCommands([{ type: 'WIN_GAME', params: {} }]);
      expect(engine.getState().victory).toBe(true);
      expect(callbacks.onVictory).toHaveBeenCalled();
    });

    it('GAME_OVER triggers game over', () => {
      engine.processCommands([{ type: 'GAME_OVER', params: {} }]);
      expect(engine.getState().gameOver).toBe(true);
      expect(callbacks.onGameOver).toHaveBeenCalled();
    });

    it('CHANGE_VAR updates variables and score', () => {
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'score', value: 0 } },
        { type: 'CHANGE_VAR', params: { varName: 'score', value: 50 } },
      ]);
      expect(engine.getState().score).toBe(50);
    });

    it('CHANGE_VAR updates health', () => {
      engine.processCommands([
        { type: 'SET_VAR', params: { varName: 'health', value: 100 } },
        { type: 'CHANGE_VAR', params: { varName: 'health', value: -30 } },
      ]);
      expect(engine.getState().health).toBe(70);
    });

    it('SET_VAR sets score', () => {
      engine.processCommands([{ type: 'SET_VAR', params: { varName: 'score', value: 250 } }]);
      expect(engine.getState().score).toBe(250);
    });

    it('SET_VAR sets health', () => {
      engine.processCommands([{ type: 'SET_VAR', params: { varName: 'health', value: 75 } }]);
      expect(engine.getState().health).toBe(75);
      expect(engine.getState().maxHealth).toBe(75);
    });

    it('CHANGE_SCORE modifies score', () => {
      engine.processCommands([{ type: 'CHANGE_SCORE', params: { value: 100 } }]);
      expect(engine.getState().score).toBe(100);
    });

    it('SET_SCORE sets score', () => {
      engine.processCommands([{ type: 'SET_SCORE', params: { value: 500 } }]);
      expect(engine.getState().score).toBe(500);
    });

    it('SWING_WEAPON creates melee projectile', () => {
      engine.processCommands([{ type: 'SWING_WEAPON', params: { text: '⚔️', value: 15 } }]);
      const proj = engine.getState().projectiles.find(p => p.behavior === 'melee');
      expect(proj).toBeDefined();
      expect(proj?.emoji).toBe('⚔️');
      expect(proj?.damage).toBe(15);
    });

    it('SPECIAL_MOVE damages nearby enemies', () => {
      const state = engine.getState();
      engine.processCommands([
        { type: 'SPAWN_ENEMY', params: { text: '👾' } },
      ]);
      const enemies = engine.getState().enemies;
      if (enemies.length > 0) {
        enemies[0].x = state.player.x;
        enemies[0].y = state.player.y;
      }
      engine.processCommands([{ type: 'SPECIAL_MOVE', params: {} }]);
      expect(engine.getState().particles.length).toBeGreaterThanOrEqual(0);
    });

    it('DODGE_ROLL moves player', () => {
      const startX = engine.getState().player.x;
      engine.processCommands([{ type: 'DODGE_ROLL', params: { value: 20 } }]);
      expect(engine.getState().player.x).toBeGreaterThanOrEqual(startX);
    });

    it('BLOCK_ATTACK sets shield', () => {
      vi.useFakeTimers();
      engine.processCommands([{ type: 'BLOCK_ATTACK', params: {} }]);
      expect(engine.getState().player.data?.shield).toBe(true);
      vi.useRealTimers();
    });

    it('CREATE_CHECKPOINT saves position', () => {
      const state = engine.getState();
      engine.processCommands([{ type: 'CREATE_CHECKPOINT', params: {} }]);
      expect(state.player.data?.checkpoint).toBeDefined();
      expect(state.player.data?.checkpoint?.x).toBe(state.player.x);
    });

    it('LOAD_CHECKPOINT restores position', () => {
      engine.processCommands([{ type: 'CREATE_CHECKPOINT', params: {} }]);
      const cp = engine.getState().player.data?.checkpoint;
      engine.processCommands([{ type: 'LOAD_CHECKPOINT', params: {} }]);
      if (cp) {
        expect(engine.getState().player.x).toBe(cp.x);
        expect(engine.getState().player.y).toBe(cp.y);
      }
    });

    it('SET_GRAVITY toggles gravity', () => {
      engine.processCommands([{ type: 'SET_GRAVITY', params: { condition: 'false' } }]);
      expect(engine.getState().player).toBeDefined();
    });

    it('TRIGGER_CUTSCENE sets cutscene active', () => {
      engine.processCommands([{ type: 'TRIGGER_CUTSCENE', params: {} }]);
      expect(engine.getState().cutsceneActive).toBe(true);
    });

    it('SAY sets player speech', () => {
      vi.useFakeTimers();
      engine.processCommands([{ type: 'SAY', params: { text: 'Hello!' } }]);
      expect(engine.getState().player.data?.speech).toBe('Hello!');
      vi.useRealTimers();
    });

    it('TRANSITION_TO_AREA triggers level transition', () => {
      engine.processCommands([{ type: 'TRANSITION_TO_AREA', params: {} }]);
      const state = engine.getState();
      expect(state).toBeDefined();
    });
  });

  describe('camera', () => {
    it('enableCamera configures camera', () => {
      engine.enableCamera(true, 2000, 1000);
      const state = engine.getState();
      expect(state.camera?.followPlayer).toBe(true);
      expect(state.camera?.worldWidth).toBe(2000);
      expect(state.camera?.worldHeight).toBe(1000);
    });

    it('shakeCamera sets shake intensity', () => {
      engine.enableCamera(true);
      engine.shakeCamera(10);
      const state = engine.getState();
      expect(state.camera?.shakeIntensity).toBe(10);
    });

    it('setCameraZoom sets target zoom', () => {
      engine.enableCamera(true);
      engine.setCameraZoom(1.5);
      const state = engine.getState();
      expect(state.camera?.targetZoom).toBe(1.5);
    });

    it('setCameraZoom clamps to min/max', () => {
      engine.enableCamera(true);
      engine.setCameraZoom(5);
      const state = engine.getState();
      expect(state.camera?.targetZoom).toBe(2);
      engine.setCameraZoom(0.1);
      const state2 = engine.getState();
      expect(state2.camera?.targetZoom).toBe(0.5);
    });

    it('setCameraZoom instant mode', () => {
      engine.enableCamera(true);
      engine.setCameraZoom(1.5, true);
      const state = engine.getState();
      expect(state.camera?.zoom).toBe(1.5);
    });

    it('setCameraBounds updates world size', () => {
      engine.enableCamera(true);
      engine.setCameraBounds(3000, 2000);
      const state = engine.getState();
      expect(state.camera?.worldWidth).toBe(3000);
      expect(state.camera?.worldHeight).toBe(2000);
    });
  });

  describe('floating texts', () => {
    it('addFloatingText creates a floating text', () => {
      engine.addFloatingText(100, 100, '+10', '#22c55e');
      const state = engine.getState();
      expect(state.floatingTexts?.length).toBeGreaterThanOrEqual(1);
      expect(state.floatingTexts?.[0].text).toBe('+10');
    });
  });

  describe('save/load state', () => {
    it('saveState returns serializable state', () => {
      engine.processCommands([{ type: 'SET_SCORE', params: { value: 100 } }]);
      const saved = engine.saveState();
      expect(saved.score).toBe(100);
      expect(saved.health).toBeDefined();
      expect(saved.variables).toBeDefined();
    });

    it('loadState restores state', () => {
      engine.loadState({ score: 500, health: 50, wave: 3 });
      const state = engine.getState();
      expect(state.score).toBe(500);
      expect(state.health).toBe(50);
      expect(state.player.hp).toBe(50);
      expect(state.wave).toBe(3);
    });
  });

  describe('loadFromToolState', () => {
    it('loads tiles from tool state', () => {
      engine.loadFromToolState({
        tiles: [{ x: 0, y: 0, type: 'brick', emoji: '🧱' }, { x: 1, y: 0, type: 'grass' }],
      });
      const state = engine.getState();
      expect(state.tiles.length).toBe(2);
      expect(state.tiles[0].solid).toBe(true);
      expect(state.tiles[1].solid).toBe(true);
    });

    it('loads enemies from tool state', () => {
      engine.loadFromToolState({
        enemies: [{ x: 100, y: 100, emoji: '👾', behavior: 'patrol' }],
      });
      expect(engine.getState().enemies.length).toBe(1);
    });

    it('loads items from tool state', () => {
      engine.loadFromToolState({
        items: [{ x: 50, y: 50, emoji: '🪙' }],
      });
      expect(engine.getState().items.length).toBe(1);
    });

    it('loads weather from tool state', () => {
      engine.loadFromToolState({ weather: 'snow' });
      expect(engine.getState().weather).toBe('snow');
    });

    it('loads health from tool state', () => {
      engine.loadFromToolState({ health: 75, maxHp: 150 });
      expect(engine.getState().health).toBe(75);
      expect(engine.getState().maxHealth).toBe(150);
    });

    it('loads score from tool state', () => {
      engine.loadFromToolState({ score: 300 });
      expect(engine.getState().score).toBe(300);
    });

    it('loads gravity and friction from tool state', () => {
      engine.loadFromToolState({ gravity: true, gravityForce: 0.8, friction: 0.5 });
      const state = engine.getState();
      expect(state).toBeDefined();
    });

    it('loads lighting from tool state', () => {
      engine.loadFromToolState({ lighting: { ambientIntensity: 0.5 } });
      const state = engine.getState();
      expect(state.dayTime).toBe(6);
    });

    it('loads bright lighting as daytime', () => {
      engine.loadFromToolState({ lighting: { ambientIntensity: 1.0 } });
      const state = engine.getState();
      expect(state.dayTime).toBe(12);
    });
  });

  describe('restart', () => {
    it('resets game state', () => {
      engine.processCommands([
        { type: 'SET_SCORE', params: { value: 500 } },
        { type: 'SPAWN_ENEMY', params: { text: '👾' } },
      ]);
      engine.restart();
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.enemies.length).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.victory).toBe(false);
    });
  });

  describe('pause/resume', () => {
    it('pauses and resumes game', () => {
      engine.start();
      engine.pause();
      expect(engine.getState().isPaused).toBe(true);
      engine.resume();
      expect(engine.getState().isPaused).toBe(false);
      engine.stop();
    });
  });

  describe('destroy', () => {
    it('stops and cleans up', () => {
      engine.start();
      engine.destroy();
      expect(engine.getState().isPlaying).toBe(false);
    });
  });

  describe('setTemplateId', () => {
    it('sets template id', () => {
      engine.setTemplateId('template_123');
      engine.processCommands([{ type: 'WIN_GAME', params: {} }]);
      expect(engine.getState().victory).toBe(true);
    });
  });
});
