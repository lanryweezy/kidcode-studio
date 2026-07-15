import { UnifiedGameState, GameContext } from './engine/unified/types';
import { render as renderFrame } from './engine/unified/renderEngine';
import {
  updatePlayer,
  updateEnemies,
  updateProjectiles,
  updateParticles,
  updateNPCs,
  updateCamera,
} from './engine/unified/physicsEngine';
import {
  loadLevel as loadLevelFn,
  spawnEnemies as spawnEnemiesFn,
  checkCollisions as checkCollisionsFn,
  checkGameState as checkGameStateFn,
} from './engine/unified/entityManager';

export type { UnifiedGameState } from './engine/unified/types';

function createInitialState(): UnifiedGameState {
  return {
    playerX: 400, playerY: 500, playerVx: 0, playerVy: 0,
    playerEmoji: '🚀', playerHealth: 100, playerMaxHealth: 100,
    playerDamage: 10, playerSpeed: 6, playerJumpForce: 12,
    playerIsGrounded: true, playerFacing: 'right', playerInvincible: false,
    playerInvincibleTimer: 0,
    worldWidth: 2400, worldHeight: 600, cameraX: 0, cameraY: 0, cameraZoom: 1,
    gravity: 0.6, friction: 0.85,
    tiles: [], background: 'space',
    enemies: [], items: [], projectiles: [], particles: [], npcs: [],
    score: 0, combo: 0, maxCombo: 0, wave: 1, health: 100, maxHealth: 100,
    coins: 0, keys: 0, xp: 0, level: 1,
    inventory: [], activeQuests: [], activeDialogue: null,
    weather: 'none', weatherIntensity: 1,
    gameTime: 0, dayNightCycle: 12,
    isPlaying: false, isPaused: false, isGameOver: false, isVictory: false,
    isCutsceneActive: false,
    _lastShot: 0,
    timePlayed: 0, enemiesDefeated: 0, itemsCollected: 0, distanceTraveled: 0,
    variables: {},
  };
}

export class UnifiedGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  state: UnifiedGameState;
  private keys: Set<string> = new Set();
  private lastTime: number = 0;
  private animFrameId: number = 0;
  private running: boolean = false;
  private tileSize: number = 40;
  private frameCount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.state = createInitialState();
    this.setupInput();
  }

  private get context(): GameContext {
    return {
      state: this.state,
      canvas: this.canvas,
      keys: this.keys,
      tileSize: this.tileSize,
      frameCount: this.frameCount,
    };
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  loadLevel(levelData: {
    tiles?: Array<{ x: number; y: number; type: string; emoji?: string }>;
    enemies?: Array<{ id: string; emoji: string; x: number; y: number; hp?: number; damage?: number; speed?: number; behavior?: string }>;
    items?: Array<{ id: string; emoji: string; x: number; y: number; type?: string }>;
    npcs?: Array<{ id: string; emoji: string; x: number; y: number; name: string; dialogue?: string[] }>;
    weather?: string;
    background?: string;
    playerStart?: { x: number; y: number };
  }) {
    loadLevelFn(this.context, levelData);
  }

  start() {
    this.running = true;
    this.state.isPlaying = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
    this.state.isPlaying = false;
    cancelAnimationFrame(this.animFrameId);
  }

  pause() { this.state.isPaused = true; }
  resume() { this.state.isPaused = false; }

  getState(): UnifiedGameState { return { ...this.state }; }

  private loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.frameCount++;

    if (!this.state.isPaused && !this.state.isGameOver && !this.state.isVictory) {
      this.update(dt);
    }
    renderFrame(this.context);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.state.timePlayed += dt;
    this.state.gameTime += dt;

    updatePlayer(this.context, dt);
    updateEnemies(this.context, dt);
    updateProjectiles(this.context, dt);
    updateParticles(this.context, dt);
    updateNPCs(this.context, dt);
    checkCollisionsFn(this.context);
    updateCamera(this.context);
    spawnEnemiesFn(this.context);
    checkGameStateFn(this.context);
  }

  destroy() {
    this.stop();
  }
}
