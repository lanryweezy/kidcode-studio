import {
  BlockCommand, EngineEntity, EngineTile, GameState, GameCallbacks,
  boxCollision, updateEnemyBehavior,
  renderBackground, renderTiles, renderItems, renderEnemies, renderProjectiles,
  renderParticles, renderPlayer, renderFloatingTexts, renderHUD,
  renderWeather, renderDayNight, renderEndScreen, renderEnvironmentalHazards,
  InputEngine, playSoundEffect, PARTICLE_PRESETS, CameraState
} from './engine';
import { saveHighScore } from './gameSaveSystem';
import { spatialPlaySound, getMuted } from './soundService';
import { SCENES, WEATHER_TYPES, CONDITION_VALUES } from '../constants/actions';

// ─── Audio Integration System ───

/** Maps a game event to a sound effect trigger. */
export interface AudioTrigger {
  id: string;
  event: 'enemy_defeated' | 'item_collected' | 'damage_taken' | 'player_heal' | 'wave_complete' | 'boss_phase' | 'level_transition' | 'game_over' | 'victory';
  soundType: string;
  enabled: boolean;
}

/** Tracks the current and target music themes with crossfade state. */
export interface MusicState {
  currentTheme: 'calm' | 'exploration' | 'combat' | 'boss' | 'victory' | 'defeat';
  targetTheme: 'calm' | 'exploration' | 'combat' | 'boss' | 'victory' | 'defeat';
  crossfadeProgress: number;
  isTransitioning: boolean;
}

const DEFAULT_AUDIO_TRIGGERS: AudioTrigger[] = [
  { id: 'at_1', event: 'enemy_defeated', soundType: 'explosion', enabled: true },
  { id: 'at_2', event: 'item_collected', soundType: 'coin', enabled: true },
  { id: 'at_3', event: 'damage_taken', soundType: 'hurt', enabled: true },
  { id: 'at_4', event: 'player_heal', soundType: 'powerup', enabled: true },
  { id: 'at_5', event: 'wave_complete', soundType: 'victory', enabled: true },
  { id: 'at_6', event: 'boss_phase', soundType: 'explosion', enabled: true },
  { id: 'at_7', event: 'level_transition', soundType: 'powerup', enabled: true },
  { id: 'at_8', event: 'game_over', soundType: 'death', enabled: true },
  { id: 'at_9', event: 'victory', soundType: 'victory', enabled: true },
];

const MUSIC_THEME_CONFIGS: Record<string, { intensity: number; priority: number }> = {
  calm: { intensity: 0.1, priority: 1 },
  exploration: { intensity: 0.3, priority: 2 },
  combat: { intensity: 0.6, priority: 3 },
  boss: { intensity: 0.9, priority: 4 },
  victory: { intensity: 0.7, priority: 5 },
  defeat: { intensity: 0.2, priority: 0 },
};

class SoundEffectPool {
  private pool: { ctx: AudioContext; inUse: boolean }[] = [];
  private size: number;

  constructor(size: number = 4) {
    this.size = size;
  }

  acquire(): AudioContext | null {
    const available = this.pool.find(s => !s.inUse);
    if (available) {
      available.inUse = true;
      return available.ctx;
    }
    if (this.pool.length < this.size) {
      try {
        const ctx = new AudioContext();
        this.pool.push({ ctx, inUse: true });
        return ctx;
      } catch { return null; }
    }
    return null;
  }

  release(ctx: AudioContext) {
    const slot = this.pool.find(s => s.ctx === ctx);
    if (slot) {
      slot.inUse = false;
    }
  }

  dispose() {
    this.pool.forEach(({ ctx }) => {
      try { ctx.close(); } catch { /* ignore */ }
    });
    this.pool = [];
  }

  getPoolSize(): number {
    return this.pool.length;
  }

  getActiveCount(): number {
    return this.pool.filter(s => s.inUse).length;
  }
}

interface LevelConfig {
  id: number;
  name: string;
  targetScore: number;
  enemies: number;
  weather: string;
  bossWave: boolean;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { id: 1, name: 'Tutorial', targetScore: 100, enemies: 3, weather: 'none', bossWave: false },
  { id: 2, name: 'Getting Started', targetScore: 200, enemies: 5, weather: 'none', bossWave: false },
  { id: 3, name: 'First Challenge', targetScore: 300, enemies: 6, weather: 'rain', bossWave: false },
  { id: 4, name: 'Storm Rising', targetScore: 400, enemies: 7, weather: 'storm', bossWave: false },
  { id: 5, name: 'Boss Battle', targetScore: 500, enemies: 4, weather: 'storm', bossWave: true },
  { id: 6, name: 'Snow Mountain', targetScore: 600, enemies: 8, weather: 'snow', bossWave: false },
  { id: 7, name: 'Frozen Peak', targetScore: 700, enemies: 8, weather: 'snow', bossWave: false },
  { id: 8, name: 'Desert Heat', targetScore: 800, enemies: 9, weather: 'none', bossWave: false },
  { id: 9, name: 'Sandstorm', targetScore: 900, enemies: 10, weather: 'sand', bossWave: false },
  { id: 10, name: 'Final Boss', targetScore: 1000, enemies: 5, weather: 'storm', bossWave: true },
];

/** Represents a recoverable or fatal error caught by the engine. */
export interface GameEngineError {
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: number;
}

/** Core game engine managing physics, rendering, audio, and entity lifecycle. */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private callbacks: GameCallbacks;
  private input: InputEngine;
  private lastTime: number = 0;
  private animFrameId: number = 0;
  private tileSize: number = 40;
  private gravity: number = 0.5;
  private friction: number = 0.1;
  private running: boolean = false;
  private level: number = 1;
  private transitionActive: boolean = false;
  private transitionAlpha: number = 0;
  private transitionTarget: number = 0;
  private bossPhase: number = 0;
  private bossPhaseThresholds: number[] = [];
  private waveTimer: number = 0;
  private waveInterval: number = 10;
  private currentTemplateId: string = '';
  private startTime: number = 0;
  private timeScale: number = 1;
  private invincibleUntil: number = 0;
  private jumpCount: number = 0;
  private maxJumps: number = 2;
  private canWallJump: boolean = false;
  private wallDirection: number = 0;
  private shakeDuration: number = 0;
  private frameTimes: number[] = [];
  private fps: number = 0;
  private lastFpsTime: number = 0;
  private frameCount: number = 0;
  private errors: GameEngineError[] = [];
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private respawnTimer: number = 0;
  private respawnDelay: number = 2;
  private waveCountdown: number = 0;
  private waveCountdownActive: boolean = false;
  private activePowerUp: string | null = null;
  private powerUpTimer: number = 0;
  private comboMultiplier: number = 1;
  private lastKillTime: number = 0;
  private comboTimeout: number = 2;
  private bossEnraged: boolean = false;
  private bossEnrageThreshold: number = 0.2;
  private environmentalHazards: { x: number; y: number; width: number; height: number; type: string; damage: number; active: boolean }[] = [];
  private hazardSpawnTimer: number = 0;
  private hazardSpawnInterval: number = 15;
  private collectibleTypes: { emoji: string; value: number; effect: string }[] = [
    { emoji: '🪙', value: 10, effect: 'score' },
    { emoji: '💎', value: 50, effect: 'score' },
    { emoji: '⭐', value: 100, effect: 'score' },
    { emoji: '❤️', value: 25, effect: 'heal' },
    { emoji: '🛡️', value: 50, effect: 'heal' },
    { emoji: '⚡', value: 1, effect: 'speed' },
    { emoji: '🔥', value: 1, effect: 'damage' },
  ];
  private collectibleSpawnTimer: number = 0;
  private collectibleSpawnInterval: number = 8;
  private totalKills: number = 0;
  private totalCollectibles: number = 0;
  private damageBonus: number = 0;
  private damageBonusTimer: number = 0;
  private speedBonus: number = 0;
  private speedBonusTimer: number = 0;

  // Audio integration
  private audioTriggers: AudioTrigger[] = [...DEFAULT_AUDIO_TRIGGERS];
  private musicState: MusicState = {
    currentTheme: 'calm',
    targetTheme: 'calm',
    crossfadeProgress: 0,
    isTransitioning: false,
  };
  private soundPool: SoundEffectPool = new SoundEffectPool(4);
  private lastMusicEvaluation: number = 0;
  private musicEvaluationInterval: number = 1;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.state = this.createInitialState();
    this.input = new InputEngine();
  }

  private reportError(code: string, message: string, recoverable: boolean = true): void {
    const error: GameEngineError = { code, message, recoverable, timestamp: Date.now() };
    this.errors.push(error);
    if (this.errors.length > 50) this.errors = this.errors.slice(-50);
    console.error(`[GameEngine] ${code}: ${message}`);
  }

  /**
   * Get all recorded engine errors.
   * @returns Array of GameEngineError objects
   */
  getErrors(): GameEngineError[] {
    return [...this.errors];
  }

  /**
   * Clear all recorded engine errors.
   */
  clearErrors(): void {
    this.errors = [];
  }

  private withRecovery<T>(operation: () => T, fallback: T, errorCode: string): T {
    try {
      return operation();
    } catch (e) {
      this.reportError(errorCode, (e as Error).message || 'Unknown error');
      return fallback;
    }
  }

  /**
   * Set the template ID for tracking purposes.
   * @param templateId - The template identifier
   */
  setTemplateId(templateId: string) {
    this.currentTemplateId = templateId;
  }

  /**
   * Process an array of block commands.
   * Commands are executed sequentially and may modify game state.
   * @param commands - Array of BlockCommand objects to execute
   */
  processCommands(commands: BlockCommand[]) {
    try {
      commands.forEach(cmd => {
        switch (cmd.type) {
          case 'SET_WEATHER':
            this.state.weather = cmd.params.text || WEATHER_TYPES.NONE;
            break;
          case 'SET_SCENE':
            this.state.scene = cmd.params.text || SCENES.GRID;
            break;
          case 'SET_EMOJI':
            this.state.player.emoji = cmd.params.text || '🚀';
            break;
          case 'SET_SIZE': {
            const scale = (cmd.params.value || 100) / 100;
            this.state.player.width = 32 * scale;
            this.state.player.height = 32 * scale;
            break;
          }
          case 'SET_GRAVITY':
            this.gravity = cmd.params.condition === CONDITION_VALUES.TRUE ? 0.5 : 0;
            break;
          case 'SET_FRICTION':
            this.friction = (cmd.params.value ?? 80) / 100;
            break;
          case 'SET_BOUNCINESS':
            this.state.player.restitution = (cmd.params.value ?? 80) / 100;
            break;
          case 'SET_BACKGROUND_MUSIC':
            break;
          case 'SPAWN_ENEMY':
            this.spawnSpecificEnemy(cmd.params.text || '👾');
            break;
          case 'SPAWN_ITEM':
            this.spawnSpecificItem(cmd.params.text || '🪙');
            break;
          case 'SPAWN_PARTICLES':
            this.spawnParticles(
              this.state.player.x + this.state.player.width / 2,
              this.state.player.y,
              '💥',
              cmd.params.value || 5
            );
            break;
          case 'TRIGGER_CUTSCENE':
            this.state.cutsceneActive = true;
            break;
          case 'SAY':
            this.state.player.data = { ...this.state.player.data, speech: cmd.params.text };
            setTimeout(() => {
              if (this.state.player.data) this.state.player.data.speech = null;
            }, 3000);
            break;
          case 'PLAY_SOUND':
            playSoundEffect(cmd.params.text || 'click');
            break;
          case 'WIN_GAME':
            this.state.victory = true;
            if (this.currentTemplateId) {
              saveHighScore(this.currentTemplateId, this.state.score, this.state.wave);
            }
            this.callbacks.onVictory();
            break;
          case 'GAME_OVER':
            this.state.gameOver = true;
            this.callbacks.onGameOver();
            break;
          case 'CHANGE_VAR': {
            const varName = cmd.params.varName;
            if (varName) {
              this.state.variables[varName] = (this.state.variables[varName] || 0) + (cmd.params.value || 0);
              if (varName === 'score') this.state.score = this.state.variables[varName];
              if (varName === 'health') {
                this.state.health = Math.max(0, Math.min(this.state.maxHealth, this.state.variables[varName]));
                this.state.player.hp = this.state.health;
              }
            }
            break;
          }
          case 'SET_VAR': {
            const setVarName = cmd.params.varName;
            if (setVarName) {
              this.state.variables[setVarName] = cmd.params.value || 0;
              if (setVarName === 'score') this.state.score = cmd.params.value || 0;
              if (setVarName === 'health') {
                this.state.health = cmd.params.value || 100;
                this.state.maxHealth = cmd.params.value || 100;
                this.state.player.hp = this.state.health;
                this.state.player.maxHp = this.state.maxHealth;
              }
            }
            break;
          }
          case 'SWING_WEAPON':
            this.state.projectiles.push({
              id: `melee_${Date.now()}`,
              type: 'projectile',
              emoji: cmd.params.text || '⚔️',
              x: this.state.player.x + this.state.player.width,
              y: this.state.player.y,
              vx: 8,
              vy: 0,
              width: 24,
              height: 24,
              hp: 1,
              maxHp: 1,
              damage: cmd.params.value || 10,
              speed: 8,
              behavior: 'melee',
              alive: true,
            });
            playSoundEffect('attack');
            break;
          case 'COMBO_ATTACK':
            for (let i = 0; i < (cmd.params.value || 3); i++) {
              setTimeout(() => {
                this.state.projectiles.push({
                  id: `combo_${Date.now()}_${i}`,
                  type: 'projectile',
                  emoji: '💥',
                  x: this.state.player.x + (Math.random() - 0.5) * 60,
                  y: this.state.player.y + (Math.random() - 0.5) * 60,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  width: 16,
                  height: 16,
                  hp: 1,
                  maxHp: 1,
                  damage: 5,
                  speed: 8,
                  behavior: 'scatter',
                  alive: true,
                });
              }, i * 100);
            }
            playSoundEffect('explosion');
            break;
          case 'DODGE_ROLL': {
            const dashDist = cmd.params.value || 8;
            this.state.player.x += dashDist;
            this.spawnParticles(this.state.player.x, this.state.player.y, '💨', 3);
            playSoundEffect('dash');
            break;
          }
          case 'SCREEN_SHAKE':
            this.state.player.data = { ...this.state.player.data, shake: true };
            setTimeout(() => {
              if (this.state.player.data) this.state.player.data.shake = false;
            }, (cmd.params.value || 0.3) * 1000);
            break;
          case 'BLOCK_ATTACK':
            this.state.player.data = { ...this.state.player.data, shield: true };
            setTimeout(() => {
              if (this.state.player.data) this.state.player.data.shield = false;
            }, 1000);
            playSoundEffect('powerup');
            break;
          case 'SPECIAL_MOVE':
            this.spawnParticles(this.state.player.x, this.state.player.y, '✨', 15);
            this.state.enemies.forEach(e => {
              if (e.alive) {
                const dx = e.x - this.state.player.x;
                const dy = e.y - this.state.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                  e.hp -= 20;
                  if (e.hp <= 0) {
                    e.alive = false;
                    this.state.score += 10;
                  }
                }
              }
            });
            this.state.enemies = this.state.enemies.filter(e => e.alive);
            playSoundEffect('explosion');
            break;
          case 'CREATE_CHECKPOINT':
            this.state.player.data = { ...this.state.player.data, checkpoint: { x: this.state.player.x, y: this.state.player.y } };
            break;
          case 'LOAD_CHECKPOINT': {
            const cp = this.state.player.data?.checkpoint as { x: number; y: number } | undefined;
            if (cp) {
              this.state.player.x = cp.x;
              this.state.player.y = cp.y;
            }
            break;
          }
          case 'CHANGE_SCORE':
            this.state.score += cmd.params.value || 0;
            this.state.variables.score = this.state.score;
            break;
          case 'SET_SCORE':
            this.state.score = cmd.params.value || 0;
            this.state.variables.score = this.state.score;
            break;
          case 'TRANSITION_TO_AREA':
            this.startLevelTransition();
            break;
        }
      });
    } catch (e) {
      this.reportError('COMMAND_ERROR', `Command processing error: ${(e as Error).message}`);
    }
  }

  private spawnSpecificEnemy(emoji: string) {
    const behaviors = ['patrol', 'chase', 'float_h', 'shoot'];
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    this.state.enemies.push({
      id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'enemy',
      emoji,
      x: Math.random() * (this.canvas.width - 40),
      y: -40,
      vx: behavior === 'patrol' ? (Math.random() - 0.5) * 2 : 0,
      vy: behavior === 'chase' ? 1 : 0,
      width: 32,
      height: 32,
      hp: 20 + this.state.wave * 5,
      maxHp: 20 + this.state.wave * 5,
      damage: 5 + this.state.wave * 2,
      speed: 0.5 + this.state.wave * 0.1,
      behavior,
      alive: true,
      data: { initialX: Math.random() * this.canvas.width, range: 100 + this.state.wave * 20 },
    });
  }

  private spawnSpecificItem(emoji: string) {
    this.state.items.push({
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'item',
      emoji,
      x: Math.random() * (this.canvas.width - 24),
      y: Math.random() * (this.canvas.height - 100) + 50,
      vx: 0,
      vy: 0,
      width: 24,
      height: 24,
      hp: 1,
      maxHp: 1,
      damage: 0,
      speed: 0,
      behavior: 'collectible',
      alive: true,
    });
  }

  private createInitialState(): GameState {
    return {
      player: {
        id: 'player',
        type: 'player',
        emoji: '🚀',
        x: 400,
        y: 500,
        vx: 0,
        vy: 0,
        width: 32,
        height: 32,
        hp: 100,
        maxHp: 100,
        damage: 10,
        speed: 8,
        behavior: 'player',
        alive: true,
      },
      enemies: [],
      items: [],
      projectiles: [],
      particles: [],
      tiles: [],
      variables: {},
      score: 0,
      health: 100,
      maxHealth: 100,
      wave: 1,
      combo: 0,
      maxCombo: 0,
      isPlaying: false,
      isPaused: false,
      gameOver: false,
      victory: false,
      weather: 'none',
      scene: 'space',
      dayTime: 12,
      cutsceneActive: false,
      camera: {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        followPlayer: false,
        smoothing: 0.08,
        worldWidth: 800,
        worldHeight: 600,
        zoom: 1,
        targetZoom: 1,
        shakeX: 0, shakeY: 0,
        shakeIntensity: 0,
        shakeDecay: 0.9,
        minZoom: 0.5,
        maxZoom: 2,
      },
      floatingTexts: [],
      wrapWorld: false,
      particlePool: [],
      activeParticles: 0,
    };
  }

  private getWeatherSpeedMultiplier(): number {
    switch (this.state.weather) {
      case 'rain': return 0.75;
      case 'snow': return 0.85;
      case 'sand': return 0.9;
      case 'storm': return 0.7;
      default: return 1;
    }
  }

  private startLevelTransition() {
    this.transitionActive = true;
    this.transitionAlpha = 0;
    this.transitionTarget = 1;
  }

  private completeLevelTransition() {
    this.level = Math.min(this.level + 1, LEVEL_CONFIGS.length);
    const config = LEVEL_CONFIGS[this.level - 1];
    this.state.wave = 1;
    this.state.score = 0;
    this.state.enemies = [];
    this.state.projectiles = [];
    this.state.particles = [];
    if (config.weather !== 'none') {
      this.state.weather = config.weather;
    }
    this.state.player.x = 400;
    this.state.player.y = 500;
    this.state.player.hp = this.state.maxHealth;
    this.state.health = this.state.maxHealth;
    this.bossPhase = 0;
    this.bossPhaseThresholds = [];
    this.bossEnraged = false;
    this.environmentalHazards = [];
    this.hazardSpawnTimer = 0;
    this.collectibleSpawnTimer = 0;
    this.transitionActive = false;
    this.transitionAlpha = 0;
    this.callbacks.onWaveComplete(this.level);
    this.triggerAudioEvent('level_transition');
  }

  private updateBossPhase() {
    const boss = this.state.enemies.find(e => e.alive && e.data?.isBoss);
    if (!boss) return;

    const hpPercent = boss.hp / boss.maxHp;
    const newPhase = hpPercent > 0.66 ? 0 : hpPercent > 0.33 ? 1 : 2;

    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase;
      playSoundEffect('explosion');
      this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '🔥', 10);

      switch (this.bossPhase) {
        case 1:
          boss.speed = 2;
          boss.damage = 40;
          boss.behavior = 'chase';
          break;
        case 2:
          boss.speed = 3;
          boss.damage = 50;
          boss.behavior = 'chase';
          this.state.weather = 'storm';
          this.shakeCamera(8);
          break;
      }
    }

    if (!this.bossEnraged && hpPercent <= this.bossEnrageThreshold) {
      this.bossEnraged = true;
      boss.speed *= 1.5;
      boss.damage *= 1.3;
      boss.emoji = '🐲';
      playSoundEffect('explosion');
      this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '💢', 15);
      this.shakeCamera(12);
      this.state.weather = 'storm';
    }
  }

  private updateEnemyWaves(dt: number) {
    this.waveTimer += dt;
    if (this.waveTimer >= this.waveInterval) {
      this.waveTimer = 0;
      this.waveInterval = Math.max(5, 10 - this.level * 0.5);

      const config = LEVEL_CONFIGS[Math.min(this.level - 1, LEVEL_CONFIGS.length - 1)];
      if (this.state.enemies.length < config.enemies) {
        const count = Math.min(3, config.enemies - this.state.enemies.length);
        for (let i = 0; i < count; i++) {
          const types = ['👾', '🦇', '💀', '👺', '👻'];
          const emoji = types[Math.floor(Math.random() * types.length)];
          this.spawnSpecificEnemy(emoji);
        }
      }
    }
  }

  loadFromToolState(toolState: { tiles?: Array<{ x: number; y: number; type: string; emoji?: string }>; enemies?: Array<{ id?: string; x: number; y: number; emoji?: string; vx?: number; vy?: number; hp?: number; damage?: number; speed?: number; behavior?: string; initialX?: number; range?: number }>; items?: Array<{ id?: string; x: number; y: number; emoji?: string }>; weather?: string; health?: number; maxHp?: number; score?: number; gravity?: boolean; gravityForce?: number; friction?: number; lighting?: { ambientIntensity: number } }) {
    if (toolState.tiles) {
      this.state.tiles = toolState.tiles.map((t) => ({
        x: t.x,
        y: t.y,
        type: t.type,
        emoji: t.emoji || '',
        solid: ['brick', 'stone', 'crate', 'dirt', 'grass'].includes(t.type),
      }));
    }
    if (toolState.enemies) {
      this.state.enemies = toolState.enemies.map((e) => ({
        id: e.id || `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'enemy' as const,
        emoji: e.emoji || '👾',
        x: e.x,
        y: e.y,
        vx: e.vx || 0,
        vy: e.vy || 0,
        width: 32,
        height: 32,
        hp: e.hp || 30,
        maxHp: e.hp || 30,
        damage: e.damage || 10,
        speed: e.speed || 1,
        behavior: e.behavior || 'patrol',
        alive: true,
        data: { initialX: e.initialX || e.x, range: e.range || 100 },
      }));
    }
    if (toolState.items) {
      this.state.items = toolState.items.map((i) => ({
        id: i.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'item' as const,
        emoji: i.emoji || '🪙',
        x: i.x,
        y: i.y,
        vx: 0,
        vy: 0,
        width: 24,
        height: 24,
        hp: 1,
        maxHp: 1,
        damage: 0,
        speed: 0,
        behavior: 'collectible',
        alive: true,
      }));
    }
    if (toolState.weather) this.state.weather = toolState.weather;
    if (toolState.health) {
      this.state.health = toolState.health;
      this.state.player.hp = toolState.health;
      this.state.player.maxHp = toolState.maxHp || toolState.health;
      this.state.maxHealth = toolState.maxHp || toolState.health;
    }
    if (toolState.score !== undefined) this.state.score = toolState.score;
    if (toolState.gravity !== undefined) this.gravity = toolState.gravityForce || 0.5;
    if (toolState.friction !== undefined) this.friction = toolState.friction;
    if (toolState.lighting) this.state.dayTime = toolState.lighting.ambientIntensity > 0.8 ? 12 : 6;
  }

  /**
   * Start the game loop.
   * Initializes canvas, input handlers, and begins requestAnimationFrame loop.
   */
  start() {
    try {
      this.running = true;
      this.state.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    } catch (e) {
      this.reportError('START_FAILED', `Failed to start engine: ${(e as Error).message}`, true);
      this.running = false;
      this.state.isPlaying = false;
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.start(), 100);
      }
    }
  }

  /**
   * Stop the game loop and clean up resources.
   */
  stop() {
    this.running = false;
    this.state.isPlaying = false;
    cancelAnimationFrame(this.animFrameId);
  }

  /** Pause the game loop. */
  pause() { this.state.isPaused = true; }
  /** Resume the game loop. */
  resume() { this.state.isPaused = false; }

  /**
   * Get current game state (returns a copy).
   * @returns Current GameState object
   */
  getState(): GameState { return { ...this.state }; }

  /**
   * Save current game state for persistence.
   * @returns Serializable game state object
   */
  saveState() {
    return {
      score: this.state.score,
      health: this.state.health,
      variables: { ...this.state.variables },
      wave: this.state.wave,
      playTime: 0,
    };
  }

  /**
   * Restore game state from a saved snapshot.
   * @param saved - Previously saved state from saveState()
   */
  loadState(saved: { score?: number; health?: number; variables?: Record<string, number>; wave?: number }) {
    if (saved.score !== undefined) this.state.score = saved.score;
    if (saved.health !== undefined) {
      this.state.health = saved.health;
      this.state.player.hp = saved.health;
    }
    if (saved.variables) this.state.variables = { ...saved.variables };
    if (saved.wave !== undefined) this.state.wave = saved.wave;
  }

  private loop = () => {
    if (!this.running) return;

    try {
      const now = performance.now();
      const rawDt = Math.min((now - this.lastTime) / 1000, 0.05);
      const dt = rawDt * this.timeScale;
      this.lastTime = now;

      this.frameCount++;
      if (now - this.lastFpsTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsTime = now;
      }
      this.frameTimes.push(rawDt * 1000);
      if (this.frameTimes.length > 60) this.frameTimes.shift();

      if (this.shakeDuration > 0) {
        this.shakeDuration -= rawDt;
        if (this.shakeDuration <= 0 && this.state.camera) {
          this.state.camera.shakeIntensity = 0;
          this.state.camera.shakeX = 0;
          this.state.camera.shakeY = 0;
        }
      }

      if (!this.state.isPaused && !this.state.gameOver && !this.state.victory) {
        this.update(dt);
      }
      this.render();
      this.retryCount = 0;
    } catch (e) {
      this.reportError('LOOP_ERROR', `Game loop error: ${(e as Error).message}`);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    try {
      if (this.transitionActive) {
        this.transitionAlpha += dt * 2;
        if (this.transitionAlpha >= 1 && this.transitionTarget === 1) {
          this.completeLevelTransition();
          this.transitionTarget = 0;
        }
        if (this.transitionTarget === 0) {
          this.transitionAlpha -= dt * 2;
          if (this.transitionAlpha <= 0) {
            this.transitionActive = false;
            this.transitionAlpha = 0;
          }
        }
        return;
      }

      this.updatePlayer(dt);
      this.updateEnemies(dt);
      this.updateProjectiles(dt);
      this.updateParticles(dt);
      this.updateFloatingTexts(dt);
      this.updateEnvironmentalHazards(dt);
      this.updateCollectibleBonuses(dt);
      this.updateCamera(dt);
      this.checkCollisions();
      this.spawnEnemies();
      this.updateEnemyWaves(dt);
      this.updateBossPhase();
      this.spawnEnvironmentalHazards(dt);
      this.spawnCollectibles(dt);
      this.checkGameState();
      this.updateMusicState(dt);
      this.callbacks.onStateChange(this.state);
    } catch (e) {
      this.reportError('UPDATE_ERROR', `Update phase error: ${(e as Error).message}`);
    }
  }

  private updateCamera(dt: number) {
    const cam = this.state.camera;
    if (!cam || !cam.followPlayer) return;
    const p = this.state.player;
    
    cam.targetX = p.x + p.width / 2 - this.canvas.width / (2 * cam.zoom);
    cam.targetY = p.y + p.height / 2 - this.canvas.height / (2 * cam.zoom);
    
    const lerpFactor = 1 - Math.pow(1 - cam.smoothing, dt * 60);
    cam.x += (cam.targetX - cam.x) * lerpFactor;
    cam.y += (cam.targetY - cam.y) * lerpFactor;
    
    cam.x = Math.max(0, Math.min(cam.worldWidth - this.canvas.width / cam.zoom, cam.x));
    cam.y = Math.max(0, Math.min(cam.worldHeight - this.canvas.height / cam.zoom, cam.y));
    
    cam.zoom += (cam.targetZoom - cam.zoom) * lerpFactor;
    cam.zoom = Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom));
    
    if (cam.shakeIntensity > 0.1) {
      cam.shakeX = (Math.random() - 0.5) * cam.shakeIntensity;
      cam.shakeY = (Math.random() - 0.5) * cam.shakeIntensity;
      cam.shakeIntensity *= cam.shakeDecay;
    } else {
      cam.shakeX = 0;
      cam.shakeY = 0;
      cam.shakeIntensity = 0;
    }
  }

  private updateFloatingTexts(dt: number) {
    if (!this.state.floatingTexts) return;
    this.state.floatingTexts = this.state.floatingTexts.filter(ft => {
      ft.y += ft.vy;
      ft.life -= dt;
      return ft.life > 0;
    });
  }

  addFloatingText(x: number, y: number, text: string, color: string = '#fff') {
    if (!this.state.floatingTexts) this.state.floatingTexts = [];
    this.state.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x, y, text, color,
      life: 1.2,
      vy: -1.5,
    });
  }

  enableCamera(followPlayer: boolean = true, worldWidth?: number, worldHeight?: number) {
    if (!this.state.camera) {
      this.state.camera = {
        x: 0, y: 0, targetX: 0, targetY: 0,
        followPlayer, smoothing: 0.08,
        worldWidth: worldWidth || 800, worldHeight: worldHeight || 600,
        zoom: 1, targetZoom: 1, shakeX: 0, shakeY: 0,
        shakeIntensity: 0, shakeDecay: 0.9,
        minZoom: 0.5, maxZoom: 2,
      };
    } else {
      this.state.camera.followPlayer = followPlayer;
      if (worldWidth) this.state.camera.worldWidth = worldWidth;
      if (worldHeight) this.state.camera.worldHeight = worldHeight;
    }
  }

  shakeCamera(intensity: number = 5) {
    if (this.state.camera) {
      this.state.camera.shakeIntensity = intensity;
      this.state.camera.shakeX = (Math.random() - 0.5) * intensity;
      this.state.camera.shakeY = (Math.random() - 0.5) * intensity;
    }
  }

  setCameraZoom(zoom: number, instant: boolean = false) {
    if (this.state.camera) {
      this.state.camera.targetZoom = Math.max(
        this.state.camera.minZoom,
        Math.min(this.state.camera.maxZoom, zoom)
      );
      if (instant) {
        this.state.camera.zoom = this.state.camera.targetZoom;
      }
    }
  }

  setCameraBounds(width: number, height: number) {
    if (this.state.camera) {
      this.state.camera.worldWidth = width;
      this.state.camera.worldHeight = height;
    }
  }

  private updatePlayer(dt: number) {
    const p = this.state.player;
    if (!p.alive) return;

    const speedMult = this.getWeatherSpeedMultiplier() + this.speedBonus * 0.2;

    if (this.input.isPressed('ArrowLeft') || this.input.isPressed('KeyA')) p.vx = -p.speed * speedMult;
    else if (this.input.isPressed('ArrowRight') || this.input.isPressed('KeyD')) p.vx = p.speed * speedMult;
    else p.vx *= (1 - this.friction);

    if (this.input.isPressed('ArrowUp') || this.input.isPressed('KeyW')) p.vy = -p.speed * speedMult;
    else if (this.input.isPressed('ArrowDown') || this.input.isPressed('KeyS')) p.vy = p.speed * speedMult;
    else p.vy *= (1 - this.friction);

    if (this.gravity > 0) {
      p.vy += this.gravity;
    }

    if (this.state.weather === 'snow') {
      p.vx += (Math.random() - 0.5) * 0.5;
    }

    const isOnGround = p.y >= this.canvas.height - p.height - 10;
    const jumpPressed = this.input.isPressed('Space') || this.input.isPressed('KeyX');
    const jumpBuffered = this.input.wasJustPressed('Space') || this.input.wasJustPressed('KeyX');

    if (isOnGround) {
      this.jumpCount = 0;
      this.canWallJump = false;
    }

    const atLeftWall = p.x <= 0 && this.gravity > 0;
    const atRightWall = p.x >= this.canvas.width - p.width && this.gravity > 0;
    if ((atLeftWall || atRightWall) && !isOnGround) {
      this.canWallJump = true;
      this.wallDirection = atLeftWall ? 1 : -1;
    } else if (!isOnGround) {
      this.canWallJump = false;
    }

    if ((jumpPressed || jumpBuffered) && this.gravity > 0) {
      if (this.jumpCount < this.maxJumps) {
        if (this.canWallJump && this.jumpCount > 0) {
          p.vy = -14;
          p.vx = this.wallDirection * 8;
        } else {
          p.vy = -12;
        }
        this.jumpCount++;
        playSoundEffect('jump');
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    if (this.state.wrapWorld) {
      const ww = this.state.camera?.worldWidth || this.canvas.width;
      const wh = this.state.camera?.worldHeight || this.canvas.height;
      if (p.x < -p.width) p.x = ww;
      if (p.x > ww) p.x = -p.width;
      if (p.y < -p.height) p.y = wh;
      if (p.y > wh) p.y = -p.height;
    } else {
      p.x = Math.max(0, Math.min(this.canvas.width - p.width, p.x));
      p.y = Math.max(0, Math.min(this.canvas.height - p.height, p.y));
    }

    if (this.input.isPressed('Space') || this.input.isPressed('KeyZ')) {
      this.shoot();
    }
    
    this.input.update();
  }

  private shoot() {
    const p = this.state.player;
    const now = Date.now();
    const lastShot = (p.data as { lastShot?: number })?.lastShot || 0;
    if (now - lastShot < 200) return;

    const baseDamage = p.damage + this.damageBonus;
    const speedMult = 1 + this.speedBonus * 0.1;

    this.state.projectiles.push({
      id: `proj_${now}`,
      type: 'projectile',
      emoji: '🔥',
      x: p.x + p.width / 2 - 4,
      y: p.y,
      vx: 0,
      vy: -12 * speedMult,
      width: 8,
      height: 16,
      hp: 1,
      maxHp: 1,
      damage: baseDamage,
      speed: 12 * speedMult,
      behavior: 'straight',
      alive: true,
    });

    p.data = { ...p.data, lastShot: now };
    playSoundEffect('laser');
  }

  private updateEnemies(dt: number) {
    const p = this.state.player;

    this.state.enemies.forEach(e => {
      if (!e.alive) return;
      updateEnemyBehavior(e, p, dt, this.canvas.width, this.canvas.height);
    });
  }

  private updateProjectiles(dt: number) {
    this.state.projectiles = this.state.projectiles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      return p.y > -20 && p.y < this.canvas.height + 20 && p.alive;
    });
  }

  private updateParticles(dt: number) {
    const particlesToRemove: EngineEntity[] = [];
    
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      const data = p.data || {};
      p.vy += data.gravity !== null ? (data.gravity as number) * dt * 60 : 0.1;
      
      p.hp -= dt;
      
      if (p.hp <= 0) {
        particlesToRemove.push(p);
        return false;
      }
      return true;
    });
    
    particlesToRemove.forEach(p => {
      p.alive = false;
      this.state.particlePool.push(p);
    });
    
    this.state.activeParticles = this.state.particles.length;
  }

  private checkCollisions() {
    const p = this.state.player;

    this.state.projectiles.forEach(proj => {
      if (!proj.alive) return;
      this.state.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        if (boxCollision(proj, enemy)) {
          enemy.hp -= proj.damage;
          proj.alive = false;
          this.spawnParticles(enemy.x, enemy.y, '💥', 3);
          this.addFloatingText(
            enemy.x + enemy.width / 2,
            enemy.y - 10,
            `-${proj.damage}`,
            enemy.hp <= 0 ? '#fbbf24' : '#ef4444'
          );
          this.triggerAudioEvent('enemy_defeated', enemy.x + enemy.width / 2);

          if (enemy.hp <= 0) {
            enemy.alive = false;
            this.state.score += 10;
            this.state.combo++;
            this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
            this.totalKills++;
            this.addFloatingText(enemy.x + enemy.width / 2, enemy.y - 20, '+10', '#22c55e');
            this.state.enemies = this.state.enemies.filter(e => e.alive);
            this.callbacks.onEnemyDefeated(enemy);
          }
        }
      });
    });

    this.state.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      if (boxCollision(p, enemy)) {
        this.damagePlayer(enemy.damage);
        this.spawnParticles(p.x, p.y, '💔', 2);
        this.triggerAudioEvent('damage_taken', p.x + p.width / 2);
      }
    });

    this.state.items.forEach(item => {
      if (!item.alive) return;
      if (boxCollision(p, item)) {
        item.alive = false;
        this.collectItem(item);
      }
    });

    this.state.items = this.state.items.filter(i => i.alive);
  }

  private damagePlayer(amount: number) {
    if (Date.now() < this.invincibleUntil) return;
    
    if (this.activePowerUp === 'shield') {
      this.spawnParticles(this.state.player.x, this.state.player.y, '🛡️', 3);
      playSoundEffect('hit');
      this.invincibleUntil = Date.now() + 200;
      return;
    }
    
    let actualDamage = amount;
    if (this.activePowerUp === 'double_damage') {
      actualDamage = Math.floor(amount * 0.5);
    }
    
    this.state.health -= actualDamage;
    this.state.player.hp = this.state.health;
    this.state.combo = 0;
    this.comboMultiplier = 1;
    this.invincibleUntil = Date.now() + 500;
    this.addFloatingText(
      this.state.player.x + this.state.player.width / 2,
      this.state.player.y - 10,
      `-${actualDamage}`,
      '#ef4444'
    );
    this.shakeCamera(4);
    this.callbacks.onDamage(actualDamage);

    if (this.state.health <= 0) {
      this.state.health = 0;
      this.state.player.hp = 0;
      this.state.player.alive = false;
      
      const checkpoint = this.state.player.data?.checkpoint as { x: number; y: number } | undefined;
      if (checkpoint) {
        this.respawnTimer = this.respawnDelay;
        this.state.player.data = { ...this.state.player.data, pendingRespawn: true };
      } else {
        this.state.gameOver = true;
        this.triggerAudioEvent('game_over');
        this.callbacks.onGameOver();
      }
    }
  }

  private collectItem(item: EngineEntity) {
    try {
      const effect = item.data?.collectibleEffect as string | undefined;
      const value = (item.data?.collectibleValue as number) || 0;
      const emoji = item.emoji;

      if (effect === 'heal') {
        this.state.health = Math.min(this.state.maxHealth, this.state.health + value);
        this.state.player.hp = this.state.health;
        this.triggerAudioEvent('player_heal', item.x);
        this.callbacks.onHeal(value);
      } else if (effect === 'score') {
        this.state.score += value;
        this.state.variables.score = this.state.score;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (effect === 'speed') {
        this.speedBonus = 3;
        this.speedBonusTimer = 5;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (effect === 'damage') {
        this.damageBonus = 10;
        this.damageBonusTimer = 5;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (emoji === '❤️') {
        this.state.health = Math.min(this.state.maxHealth, this.state.health + 25);
        this.state.player.hp = this.state.health;
        this.triggerAudioEvent('player_heal', item.x);
        this.callbacks.onHeal(25);
      } else if (emoji === '⚡') {
        this.state.score += 50;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (emoji === '🛡️') {
        this.state.health = Math.min(this.state.maxHealth, this.state.health + 50);
        this.state.player.hp = this.state.health;
        this.triggerAudioEvent('player_heal', item.x);
        this.callbacks.onHeal(50);
      } else if (emoji === '⭐') {
        this.state.score += 100;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (emoji === '🪙') {
        this.state.score += 10;
        this.triggerAudioEvent('item_collected', item.x);
      } else if (emoji === '💎') {
        this.state.score += 50;
        this.triggerAudioEvent('item_collected', item.x);
      }
      this.totalCollectibles++;
      this.callbacks.onItemCollected(item);
    } catch (e) {
      this.reportError('ITEM_COLLECT_ERROR', `Failed to collect item: ${(e as Error).message}`);
      this.callbacks.onItemCollected(item);
    }
  }

  private spawnEnemies() {
    if (this.state.enemies.length < 3 + this.state.wave) {
      const types = ['👾', '🦇', '💀', '👺', '👻'];
      const behaviors = ['patrol', 'chase', 'float_h', 'shoot'];
      const emoji = types[Math.floor(Math.random() * types.length)];
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      this.state.enemies.push({
        id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'enemy',
        emoji,
        x: Math.random() * (this.canvas.width - 40),
        y: -40,
        vx: behavior === 'patrol' ? (Math.random() - 0.5) * 2 : 0,
        vy: behavior === 'chase' ? 1 : 0,
        width: 32,
        height: 32,
        hp: 20 + this.state.wave * 5,
        maxHp: 20 + this.state.wave * 5,
        damage: 5 + this.state.wave * 2,
        speed: 0.5 + this.state.wave * 0.1,
        behavior,
        alive: true,
        data: { initialX: Math.random() * this.canvas.width, range: 100 + this.state.wave * 20 },
      });
    }
  }

  private checkGameState() {
    const config = LEVEL_CONFIGS[Math.min(this.level - 1, LEVEL_CONFIGS.length - 1)];

    if (this.state.score > this.state.wave * 100) {
      this.state.wave++;
      this.state.combo = 0;
      this.callbacks.onWaveComplete(this.state.wave);
      this.triggerAudioEvent('wave_complete');
    }

    if (this.state.score >= config.targetScore && !this.transitionActive) {
      this.startLevelTransition();
    }

    if (config.bossWave && this.state.enemies.length === 0 && this.state.score >= config.targetScore / 2) {
      this.spawnBoss();
    }

    if (this.level >= LEVEL_CONFIGS.length && this.state.enemies.length === 0) {
      this.state.victory = true;
      if (this.currentTemplateId) {
        saveHighScore(this.currentTemplateId, this.state.score, this.state.wave);
      }
      this.triggerAudioEvent('victory');
      this.callbacks.onVictory();
    }
  }

  private spawnBoss() {
    const bossHp = 200 + this.state.wave * 20;
    this.bossPhaseThresholds = [bossHp * 0.66, bossHp * 0.33];
    this.bossPhase = 0;
    this.bossEnraged = false;

    this.state.enemies.push({
      id: `boss_${Date.now()}`,
      type: 'enemy',
      emoji: '🐲',
      x: this.canvas.width / 2 - 40,
      y: -80,
      vx: 0,
      vy: 1,
      width: 64,
      height: 64,
      hp: bossHp,
      maxHp: bossHp,
      damage: 30,
      speed: 1,
      behavior: 'chase',
      alive: true,
      data: { isBoss: true, phase: 0 },
    });
    this.state.weather = 'storm';
    this.triggerAudioEvent('boss_phase', this.canvas.width / 2);
  }

  private spawnEnvironmentalHazards(dt: number) {
    this.hazardSpawnTimer += dt;
    if (this.hazardSpawnTimer < this.hazardSpawnInterval) return;
    this.hazardSpawnTimer = 0;
    this.hazardSpawnInterval = Math.max(5, 15 - this.state.wave * 0.5);

    const hazardTypes = ['🔥', '⚡', '💀', '☠️'];
    const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    const damage = 5 + this.state.wave * 3;
    const w = 40 + Math.random() * 40;
    const h = 20 + Math.random() * 20;

    this.environmentalHazards.push({
      x: Math.random() * (this.canvas.width - w),
      y: Math.random() * (this.canvas.height - 100) + 50,
      width: w,
      height: h,
      type,
      damage,
      active: true,
    });

    if (this.environmentalHazards.length > 8) {
      this.environmentalHazards.shift();
    }
  }

  private updateEnvironmentalHazards(dt: number) {
    const p = this.state.player;
    for (const hazard of this.environmentalHazards) {
      if (!hazard.active) continue;
      if (
        p.x < hazard.x + hazard.width &&
        p.x + p.width > hazard.x &&
        p.y < hazard.y + hazard.height &&
        p.y + p.height > hazard.y
      ) {
        this.damagePlayer(hazard.damage);
        this.spawnParticles(hazard.x + hazard.width / 2, hazard.y + hazard.height / 2, hazard.type, 5);
        playSoundEffect('hurt');
      }
    }
    this.environmentalHazards = this.environmentalHazards.filter(h => h.active);
  }

  private spawnCollectibles(dt: number) {
    this.collectibleSpawnTimer += dt;
    if (this.collectibleSpawnTimer < this.collectibleSpawnInterval) return;
    this.collectibleSpawnTimer = 0;

    const ct = this.collectibleTypes[Math.floor(Math.random() * this.collectibleTypes.length)];
    this.state.items.push({
      id: `collectible_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'item',
      emoji: ct.emoji,
      x: Math.random() * (this.canvas.width - 24),
      y: Math.random() * (this.canvas.height - 100) + 50,
      vx: 0,
      vy: 0,
      width: 24,
      height: 24,
      hp: 1,
      maxHp: 1,
      damage: 0,
      speed: 0,
      behavior: 'collectible',
      alive: true,
      data: { collectibleEffect: ct.effect, collectibleValue: ct.value },
    });

    if (this.state.items.length > 15) {
      this.state.items = this.state.items.slice(-15);
    }
  }

  private updateCollectibleBonuses(dt: number) {
    if (this.damageBonusTimer > 0) {
      this.damageBonusTimer -= dt;
      if (this.damageBonusTimer <= 0) {
        this.damageBonus = 0;
      }
    }
    if (this.speedBonusTimer > 0) {
      this.speedBonusTimer -= dt;
      if (this.speedBonusTimer <= 0) {
        this.speedBonus = 0;
      }
    }
  }

  private spawnParticles(x: number, y: number, emoji: string, count: number, particleType?: string) {
    const preset = particleType ? PARTICLE_PRESETS[particleType] : PARTICLE_PRESETS[emoji as keyof typeof PARTICLE_PRESETS];
    
    for (let i = 0; i < count; i++) {
      let particle: EngineEntity;
      
      if (this.state.particlePool.length > 0) {
        particle = this.state.particlePool.pop()!;
      } else {
        particle = {
          id: '',
          type: 'particle',
          emoji: '',
          x: 0, y: 0, vx: 0, vy: 0,
          width: 16, height: 16,
          hp: 1, maxHp: 1, damage: 0, speed: 0,
          behavior: 'none', alive: true,
        };
      }
      
      particle.id = `particle_${Date.now()}_${i}`;
      particle.emoji = emoji;
      particle.x = x + (Math.random() - 0.5) * 10;
      particle.y = y + (Math.random() - 0.5) * 10;
      
      if (preset) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.hp = preset.lifetime;
        particle.maxHp = preset.lifetime;
        particle.data = {
          gravity: preset.gravity,
          fadeOut: preset.fadeOut,
          scaleOverLife: preset.scaleOverLife,
          color: preset.color,
        };
      } else {
        particle.vx = (Math.random() - 0.5) * 6;
        particle.vy = (Math.random() - 0.5) * 6;
        particle.hp = 1;
        particle.maxHp = 1;
        particle.data = {};
      }
      
      particle.alive = true;
      this.state.particles.push(particle);
    }
  }

  private render() {
    try {
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const cam = this.state.camera;

      renderBackground(ctx, this.state.scene || 'grid', width, height);

      ctx.save();
      if (cam) {
        ctx.translate(
          -cam.x * cam.zoom + (cam.shakeX || 0),
          -cam.y * cam.zoom + (cam.shakeY || 0)
        );
        if (cam.zoom !== 1) ctx.scale(cam.zoom, cam.zoom);
      }

      renderTiles(ctx, this.state.tiles, this.tileSize);
      renderEnvironmentalHazards(ctx, this.environmentalHazards);
      renderItems(ctx, this.state.items);
      renderEnemies(ctx, this.state.enemies);
      renderProjectiles(ctx, this.state.projectiles);
      renderParticles(ctx, this.state.particles);
      renderPlayer(ctx, this.state.player);
      renderFloatingTexts(ctx, this.state.floatingTexts);

      ctx.restore();

      renderHUD(ctx, this.state, width, height);
      renderWeather(ctx, this.state.weather, width, height);
      renderDayNight(ctx, this.state.dayTime, width, height);

      if (this.transitionActive && this.transitionAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(this.transitionAlpha, 1)})`;
        ctx.fillRect(0, 0, width, height);
        if (this.transitionAlpha > 0.5) {
          const config = LEVEL_CONFIGS[Math.min(this.level, LEVEL_CONFIGS.length - 1)];
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 32px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`Level ${this.level + 1}: ${config.name}`, width / 2, height / 2);
        }
      }

      if (this.state.gameOver || this.state.victory) {
        renderEndScreen(ctx, this.state, width, height);
        if (this.input.isPressed('KeyR')) {
          this.restart();
        }
      }
    } catch (e) {
      this.reportError('RENDER_ERROR', `Render error: ${(e as Error).message}`);
    }
  }

  restart() {
    this.state = this.createInitialState();
    this.loadFromToolState({ enemies: [], items: [], tiles: this.state.tiles });
    this.level = 1;
    this.bossPhase = 0;
    this.bossPhaseThresholds = [];
    this.bossEnraged = false;
    this.waveTimer = 0;
    this.waveInterval = 10;
    this.transitionActive = false;
    this.transitionAlpha = 0;
    this.environmentalHazards = [];
    this.hazardSpawnTimer = 0;
    this.collectibleSpawnTimer = 0;
    this.totalKills = 0;
    this.totalCollectibles = 0;
    this.damageBonus = 0;
    this.damageBonusTimer = 0;
    this.speedBonus = 0;
    this.speedBonusTimer = 0;
    this.activePowerUp = null;
    this.powerUpTimer = 0;
    this.musicState = {
      currentTheme: 'calm',
      targetTheme: 'calm',
      crossfadeProgress: 0,
      isTransitioning: false,
    };
    this.callbacks.onStateChange(this.state);
  }

  destroy() {
    this.stop();
    this.input.destroy();
    this.soundPool.dispose();
  }

  screenShake(intensity: number = 5, duration: number = 0.3) {
    if (this.state.camera) {
      this.state.camera.shakeIntensity = intensity;
      this.state.camera.shakeX = (Math.random() - 0.5) * intensity;
      this.state.camera.shakeY = (Math.random() - 0.5) * intensity;
      this.shakeDuration = duration;
    }
  }

  setTimeScale(scale: number) {
    this.timeScale = Math.max(0.1, Math.min(3, scale));
  }

  getTimeScale(): number {
    return this.timeScale;
  }

  // ─── Audio Integration Methods ───

  private triggerAudioEvent(event: AudioTrigger['event'], entityX?: number) {
    const trigger = this.audioTriggers.find(t => t.event === event && t.enabled);
    if (!trigger) return;
    if (getMuted()) return;

    if (entityX !== undefined) {
      spatialPlaySound(trigger.soundType as any, entityX, this.canvas.width);
    } else {
      playSoundEffect(trigger.soundType as any);
    }
  }

  private updateMusicState(dt: number) {
    this.lastMusicEvaluation += dt;
    if (this.lastMusicEvaluation < this.musicEvaluationInterval) return;
    this.lastMusicEvaluation = 0;

    const enemiesNearby = this.state.enemies.filter(e => {
      if (!e.alive) return false;
      const dx = e.x - this.state.player.x;
      const dy = e.y - this.state.player.y;
      return Math.sqrt(dx * dx + dy * dy) < 300;
    }).length;

    const isBossActive = this.state.enemies.some(e => e.alive && e.data?.isBoss);
    const healthPercent = this.state.health / this.state.maxHealth;

    let targetTheme: MusicState['targetTheme'];

    if (this.state.victory) {
      targetTheme = 'victory';
    } else if (this.state.gameOver) {
      targetTheme = 'defeat';
    } else if (isBossActive) {
      targetTheme = 'boss';
    } else if (enemiesNearby > 0 || healthPercent < 0.3) {
      targetTheme = 'combat';
    } else if (this.state.enemies.length > 0) {
      targetTheme = 'exploration';
    } else {
      targetTheme = 'calm';
    }

    if (targetTheme !== this.musicState.targetTheme) {
      const currentPriority = MUSIC_THEME_CONFIGS[this.musicState.currentTheme]?.priority || 0;
      const targetPriority = MUSIC_THEME_CONFIGS[targetTheme]?.priority || 0;

      if (targetPriority >= currentPriority || this.musicState.currentTheme === 'defeat') {
        this.musicState.targetTheme = targetTheme;
        this.musicState.isTransitioning = true;
        this.musicState.crossfadeProgress = 0;
      }
    }

    if (this.musicState.isTransitioning) {
      this.musicState.crossfadeProgress += dt * 0.5;
      if (this.musicState.crossfadeProgress >= 1) {
        this.musicState.currentTheme = this.musicState.targetTheme;
        this.musicState.isTransitioning = false;
        this.musicState.crossfadeProgress = 0;
      }
    }
  }

  getMusicState(): MusicState {
    return { ...this.musicState };
  }

  setAudioTrigger(triggerId: string, updates: Partial<Pick<AudioTrigger, 'enabled' | 'soundType'>>) {
    this.audioTriggers = this.audioTriggers.map(t =>
      t.id === triggerId ? { ...t, ...updates } : t
    );
  }

  getAudioTriggers(): AudioTrigger[] {
    return [...this.audioTriggers];
  }

  private playSpatialSound(type: string, entityX: number) {
    spatialPlaySound(type as any, entityX, this.canvas.width);
  }

  getSoundPoolStats(): { poolSize: number; activeCount: number } {
    return {
      poolSize: this.soundPool.getPoolSize(),
      activeCount: this.soundPool.getActiveCount(),
    };
  }

  getPerformanceStats(): { fps: number; entityCount: number; memoryUsage: number } {
    return {
      fps: this.fps,
      entityCount: this.state.enemies.length + this.state.items.length + this.state.projectiles.length + this.state.particles.length,
      memoryUsage: (performance as any).memory?.usedJSHeapSize
        ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
        : 0,
    };
  }

  // ─── Level Editor Integration ───

  placeTile(x: number, y: number, type: string, emoji?: string) {
    const gridX = Math.floor(x / this.tileSize) * this.tileSize;
    const gridY = Math.floor(y / this.tileSize) * this.tileSize;
    const existing = this.state.tiles.find(t => t.x === gridX && t.y === gridY);
    if (existing) {
      existing.type = type;
      existing.emoji = emoji || '';
    } else {
      this.state.tiles.push({
        x: gridX, y: gridY, type, emoji: emoji || '',
        solid: ['brick', 'stone', 'crate', 'dirt', 'grass'].includes(type),
      });
    }
  }

  removeTile(x: number, y: number) {
    const gridX = Math.floor(x / this.tileSize) * this.tileSize;
    const gridY = Math.floor(y / this.tileSize) * this.tileSize;
    this.state.tiles = this.state.tiles.filter(t => !(t.x === gridX && t.y === gridY));
  }

  placeEnemy(x: number, y: number, emoji: string, behavior: string = 'patrol') {
    this.state.enemies.push({
      id: `editor_enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'enemy', emoji, x, y, vx: 0, vy: 0,
      width: 32, height: 32, hp: 30, maxHp: 30,
      damage: 10, speed: 1, behavior, alive: true,
      data: { initialX: x, range: 100 },
    });
  }

  removeEnemy(id: string) {
    this.state.enemies = this.state.enemies.filter(e => e.id !== id);
  }

  placeItem(x: number, y: number, emoji: string) {
    this.state.items.push({
      id: `editor_item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'item', emoji, x, y, vx: 0, vy: 0,
      width: 24, height: 24, hp: 1, maxHp: 1,
      damage: 0, speed: 0, behavior: 'collectible', alive: true,
    });
  }

  removeItem(id: string) {
    this.state.items = this.state.items.filter(i => i.id !== id);
  }

  clearEditorEntities() {
    this.state.tiles = [];
    this.state.enemies = [];
    this.state.items = [];
  }

  exportLevelData() {
    return {
      tiles: [...this.state.tiles],
      enemies: this.state.enemies.map(e => ({ x: e.x, y: e.y, emoji: e.emoji, behavior: e.behavior })),
      items: this.state.items.map(i => ({ x: i.x, y: i.y, emoji: i.emoji })),
    };
  }

  importLevelData(data: { tiles?: Array<{ x: number; y: number; type: string; emoji: string; solid: boolean }>; enemies?: Array<{ x: number; y: number; emoji: string; behavior?: string }>; items?: Array<{ x: number; y: number; emoji: string }> }) {
    if (data.tiles) this.state.tiles = data.tiles;
    if (data.enemies) {
      this.state.enemies = data.enemies.map((e, i) => ({
        id: `import_enemy_${i}`, type: 'enemy' as const, emoji: e.emoji,
        x: e.x, y: e.y, vx: 0, vy: 0, width: 32, height: 32,
        hp: 30, maxHp: 30, damage: 10, speed: 1,
        behavior: e.behavior || 'patrol', alive: true,
        data: { initialX: e.x, range: 100 },
      }));
    }
    if (data.items) {
      this.state.items = data.items.map((i, idx) => ({
        id: `import_item_${idx}`, type: 'item' as const, emoji: i.emoji,
        x: i.x, y: i.y, vx: 0, vy: 0, width: 24, height: 24,
        hp: 1, maxHp: 1, damage: 0, speed: 0,
        behavior: 'collectible', alive: true,
      }));
    }
  }

  // ─── Enhanced Camera Shake with Decay ───

  shakeCameraDecay(intensity: number = 5, duration: number = 0.5, decayRate: number = 0.92) {
    if (this.state.camera) {
      this.state.camera.shakeIntensity = intensity;
      this.state.camera.shakeDecay = decayRate;
      this.state.camera.shakeX = (Math.random() - 0.5) * intensity;
      this.state.camera.shakeY = (Math.random() - 0.5) * intensity;
      this.shakeDuration = duration;
    }
  }

  // ─── Slow Motion Effect ───

  triggerSlowMotion(scale: number = 0.3, duration: number = 1) {
    this.timeScale = Math.max(0.1, scale);
    setTimeout(() => {
      this.timeScale = 1;
    }, duration * 1000);
  }

  pulseSlowMotion(scale: number = 0.2, rampUpTime: number = 0.5) {
    this.timeScale = Math.max(0.1, scale);
    const rampInterval = setInterval(() => {
      if (this.timeScale < 1) {
        this.timeScale = Math.min(1, this.timeScale + 0.1);
      } else {
        clearInterval(rampInterval);
      }
    }, rampUpTime * 100);
  }

  // ─── Invincibility Frames ───

  grantInvincibility(durationMs: number = 1500) {
    this.invincibleUntil = Date.now() + durationMs;
  }

  isInvincible(): boolean {
    return Date.now() < this.invincibleUntil;
  }

  getInvincibilityTimeLeft(): number {
    return Math.max(0, this.invincibleUntil - Date.now());
  }

  // ─── Enhanced Double Jump / Wall Jump ───

  configureJump(maxJumps: number = 2, wallJumpEnabled: boolean = true) {
    this.maxJumps = maxJumps;
    this.canWallJump = wallJumpEnabled;
  }

  getJumpState(): { jumpCount: number; maxJumps: number; canWallJump: boolean; wallDirection: number } {
    return {
      jumpCount: this.jumpCount,
      maxJumps: this.maxJumps,
      canWallJump: this.canWallJump,
      wallDirection: this.wallDirection,
    };
  }
}
