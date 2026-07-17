/**
 * Game Intermediate Representation (IR) V5
 * 
 * Complete, engine-independent game model.
 * Captures ALL game logic from visual blocks into a structured IR.
 * Each IR construct maps 1:1 to target code generation.
 * 
 * ARCHITECTURE:
 * Blocks → IR → Code Generator → Target (TS/React/Phaser/etc)
 */

// ═══════════════════════════════════════════════════════════
// ROOT PROJECT
// ═══════════════════════════════════════════════════════════

export interface GameProject {
  meta: ProjectMeta;
  config: GameConfig;
  world: WorldState;
  entities: Entity[];
  systems: System[];
  scripts: Script[];
  ui: UIOverlay[];
  audio: AudioAsset[];
  levels: Level[];
  events: GameEvent[];
  properties: Record<string, any>;
}

export interface ProjectMeta {
  name: string; description: string; version: string;
  author: string; createdAt: string; engine: string;
}

export interface GameConfig {
  canvas: { width: number; height: number; bg: string };
  physics: { enabled: boolean; gravity: number; friction: number; bounce: number };
  input: { keyboard: boolean; touch: boolean; gamepad: boolean };
  audio: { master: number; sfx: number; music: number };
  gameplay: { difficulty: string; lives: number; scoreMultiplier: number };
}

export interface WorldState {
  vars: Record<string, any>;
  score: number; health: number; maxHealth: number;
  wave: number; maxWaves: number;
  gameTime: number; isPaused: boolean;
  gameOver: boolean; victory: boolean;
}

// ═══════════════════════════════════════════════════════════
// ENTITY
// ═══════════════════════════════════════════════════════════

export type EntityType = 'player' | 'enemy' | 'item' | 'projectile' | 'npc' | 'particle' | 'tile';

export interface Entity {
  id: string; name: string; type: EntityType; tags: string[];
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; emoji: string;
  hp: number; maxHp: number; dmg: number; speed: number;
  active: boolean; facing: number; onGround: boolean;
  invuln: number; score: number;
  behavior: string; patrolX: number; patrolRange: number; patrolDir: number;
  isBoss: boolean; bossPhase: number;
  physics: { friction: number; bounce: number; mass: number };
  collider: { isTrigger: boolean; layer: string };
  props: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════
// SYSTEM, SCRIPT, EVENT
// ═══════════════════════════════════════════════════════════

export interface System { id: string; name: string; type: string; priority: number; enabled: boolean; config: Record<string, any> }
export interface Script { id: string; name: string; events: GameEvent[]; vars: Var[] }
export interface GameEvent { trigger: string; conditions: Condition[]; actions: Action[] }
export interface Condition { type: string; params: Record<string, any> }
export interface Action { type: string; params: Record<string, any> }
export interface Var { name: string; type: string; value: string | number | boolean }

// ═══════════════════════════════════════════════════════════
// UI, AUDIO, LEVEL
// ═══════════════════════════════════════════════════════════

export interface UIOverlay { id: string; type: string; x: number; y: number; config: Record<string, any> }
export interface AudioAsset { id: string; name: string; type: string; url: string }
export interface Level { id: string; name: string; tiles: TileData[]; camera: CameraConfig }
export interface TileData { x: number; y: number; type: string; solid: boolean }
export interface CameraConfig { follow: string; smooth: number; bounds: { x: number; y: number; w: number; h: number } }

// ═══════════════════════════════════════════════════════════
// IR GENERATOR
// ═══════════════════════════════════════════════════════════

export interface BlockInput {
  id?: string;
  type?: string;
  params?: Record<string, any>;
  children?: BlockInput[];
}

export interface GameSettings {
  name?: string;
  desc?: string;
  author?: string;
  playerEmoji?: string;
  [key: string]: unknown;
}

export function blocksToIR(blocks: BlockInput[], settings: GameSettings): GameProject {
  const p = makeProject(settings);
  // Add default level before processing blocks
  p.levels.push({ id: 'default', name: 'Level 1', tiles: genTiles(), camera: { follow: 'player', smooth: 0.1, bounds: { x: 0, y: 0, w: 800, h: 600 } } });
  const playerEmoji = settings?.playerEmoji || '🧙';
  p.entities.push(makeEntity('player', 'Player', 'player', 80, 450, playerEmoji, 100, 10, 4, ['player']));
  for (const b of blocks) proc(p, b);
  addDefaults(p);
  return p;
}

function makeProject(s: GameSettings): GameProject {
  return {
    meta: { name: s?.name || 'Game', description: s?.desc || '', version: '1.0.0', author: s?.author || 'Player', createdAt: new Date().toISOString(), engine: 'kidcode' },
    config: {
      canvas: { width: 800, height: 600, bg: '#1e293b' },
      physics: { enabled: true, gravity: 0.6, friction: 0.8, bounce: 0 },
      input: { keyboard: true, touch: true, gamepad: true },
      audio: { master: 1, sfx: 0.7, music: 0.5 },
      gameplay: { difficulty: 'normal', lives: 3, scoreMultiplier: 1 },
    },
    world: { vars: {}, score: 0, health: 100, maxHealth: 100, wave: 1, maxWaves: 10, gameTime: 0, isPaused: false, gameOver: false, victory: false },
    entities: [], systems: [], scripts: [], ui: [], audio: [], levels: [], events: [], properties: {},
  };
}

function makeEntity(id: string, name: string, type: EntityType, x: number, y: number, emoji: string, hp: number, dmg: number, spd: number, tags: string[]): Entity {
  return { id, name, type, tags, x, y, vx: 0, vy: 0, w: 40, h: 40, emoji, hp, maxHp: hp, dmg, speed: spd, active: true, facing: 1, onGround: false, invuln: 0, score: 0, behavior: 'patrol', patrolX: x, patrolRange: 100, patrolDir: 1, isBoss: false, bossPhase: 0, physics: { friction: 0.8, bounce: 0, mass: 1 }, collider: { isTrigger: false, layer: 'default' }, props: {} };
}

function num(v: unknown, def: number = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function str(v: unknown, def: string = ''): string {
  return v !== null ? String(v) : def;
}

function proc(p: GameProject, b: BlockInput) {
  const P = (b.params || {}) as Record<string, any>;
  const W = p.world;
  switch (b.type) {
    case 'SET_SCENE': p.levels[0].name = str(P.text, 'Level 1'); break;
    case 'SET_WEATHER': p.properties.weather = str(P.text); break;
    case 'SET_CAMERA': p.levels[0].camera.follow = 'player'; break;
    case 'SHAKE_CAMERA': p.properties.shake = num(P.value, 0.5); break;
    case 'SET_EMOJI': p.entities[0].emoji = str(P.text, '🧙'); break;
    case 'SET_GRAVITY': p.config.physics.enabled = P.condition === 'true'; break;
    case 'SET_SIZE': p.entities[0].w = num(P.value, 40); p.entities[0].h = num(P.value, 40); break;
    case 'SET_OPACITY': p.entities[0].props.alpha = (num(P.value, 100)) / 100; break;
    case 'SAY': p.entities[0].props.speech = { text: str(P.text), dur: 3 }; break;
    case 'BOUNCE_ON_EDGE': p.entities[0].props.bounceEdge = true; break;
    case 'MOVE_X': p.entities[0].props.moveX = num(P.value, 0); break;
    case 'MOVE_Y': p.entities[0].props.moveY = num(P.value, 0); break;
    case 'JUMP': p.entities[0].props.jump = num(P.value, 13); break;
    case 'DASH': p.entities[0].props.dash = num(P.value, 10); break;
    case 'DOUBLE_JUMP': p.entities[0].props.doubleJump = P.condition === 'true'; break;
    case 'SET_BOUNCINESS': p.entities[0].physics.bounce = num(P.value, 0); break;
    case 'SPAWN_ENEMY': { const e = makeEntity(`e${Math.random().toString(36).slice(2,8)}`, 'Enemy', 'enemy', 400+Math.random()*300, 450, str(P.text, '👾'), 20, 10, 1, ['enemy']); p.entities.push(e); break; }
    case 'SPAWN_ITEM': { const e = makeEntity(`i${Math.random().toString(36).slice(2,8)}`, 'Item', 'item', 300+Math.random()*400, 450, str(P.text, '💎'), 1, 0, 0, ['item','collectible']); e.collider.isTrigger = true; e.score = 10; p.entities.push(e); break; }
    case 'SPAWN_BOSS': { const e = makeEntity(`b${Math.random().toString(36).slice(2,8)}`, 'Boss', 'enemy', 600, 400, str(P.text, '🐲'), num(P.value, 200), 25, 1.5, ['enemy','boss']); e.w=60;e.h=60;e.isBoss=true;e.props.phases=3; p.entities.push(e); break; }
    case 'SPAWN_PARTICLES': p.properties.particles = { count: num(P.value, 10), type: 'burst' }; break;
    case 'SHOOT': p.entities[0].props.shoot = { emoji: str(P.text, '⚡'), speed: 8 }; break;
    case 'ATTACK_ENEMY': p.entities[0].props.attack = { range: 50, dmg: num(P.value, 10) }; break;
    case 'CHANGE_SCORE': W.score += num(P.value, 1); break;
    case 'SET_SCORE': W.score = num(P.value, 0); break;
    case 'CHANGE_HEALTH': W.health = Math.max(0, Math.min(W.maxHealth, W.health + num(P.value, 0))); break;
    case 'SET_HEALTH': W.health = num(P.value, 100); break;
    case 'SET_VAR': W.vars[str(P.varName, 'x')] = num(P.value, 0); break;
    case 'CHANGE_VAR': W.vars[str(P.varName, 'x')] = (num(W.vars[str(P.varName, 'x')], 0)) + (num(P.value, 1)); break;
    case 'START_WAVE': W.wave = num(P.value, 1); break;
    case 'NEXT_WAVE': W.wave++; break;
    case 'PLAY_SOUND': p.audio.push({ id: 'sfx', name: str(P.text, 'click'), type: 'sfx', url: '' }); break;
    case 'SET_BACKGROUND_MUSIC': p.audio.push({ id: 'bgm', name: str(P.text, 'adventure'), type: 'music', url: '' }); break;
    case 'SET_MUSIC_VOLUME': p.config.audio.music = (num(P.value, 50))/100; break;
    case 'ADD_XP': W.vars.xp = (num(W.vars.xp, 0)) + (num(P.value, 50)); break;
    case 'LEVEL_UP': W.vars.level = num(W.vars.level, 1)+1; break;
    case 'SET_STAT': W.vars[`stat_${str(P.text, 'str')}`] = num(P.value, 10); break;
    case 'APPLY_STATUS': W.vars[`status_${str(P.text, 'poison')}`] = 3; break;
    case 'SET_DIFFICULTY': p.config.gameplay.difficulty = str(P.text, 'normal'); break;
    case 'ADD_TO_INVENTORY': p.entities[0].props.inv = [...((p.entities[0].props.inv as unknown[]||[])), { name: str(P.text, 'Item'), qty: num(P.value, 1) }]; break;
    case 'USE_ITEM': p.entities[0].props.useItem = str(P.text); break;
    case 'ACCEPT_QUEST': W.vars.quest = str(P.text, 'Quest'); break;
    case 'UPDATE_QUEST': W.vars.questProg = (num(W.vars.questProg, 0))+(num(P.value, 1)); break;
    case 'COMPLETE_QUEST': W.vars.questDone = true; break;
    case 'TRIGGER_CUTSCENE': p.properties.cutscene = str(P.text, 'intro'); break;
    case 'FADE_IN': p.properties.fadeIn = num(P.value, 1); break;
    case 'FADE_OUT': p.properties.fadeOut = num(P.value, 1); break;
    case 'WAIT': p.properties.wait = num(P.value, 1); break;
    case 'GAME_OVER': W.gameOver = true; break;
    case 'WIN_GAME': W.victory = true; break;
    case 'NPC_TALK': p.properties.npc = { speaker: str(P.text, 'NPC'), msg: str(P.message, 'Hello!') }; break;
    case 'SET_VIEW_3D': p.properties.is3D = P.condition==='true'; break;
  }
}

function addDefaults(p: GameProject) {
  p.systems = [
    { id: 'input', name: 'Input', type: 'input', priority: 0, enabled: true, config: {} },
    { id: 'physics', name: 'Physics', type: 'physics', priority: 1, enabled: true, config: {} },
    { id: 'collision', name: 'Collision', type: 'collision', priority: 2, enabled: true, config: {} },
    { id: 'ai', name: 'AI', type: 'ai', priority: 3, enabled: true, config: {} },
    { id: 'render', name: 'Render', type: 'render', priority: 10, enabled: true, config: {} },
  ];
  p.ui = [
    { id: 'hp', type: 'healthbar', x: 10, y: 10, config: { w: 150, h: 12 } },
    { id: 'score', type: 'score', x: 10, y: 30, config: { color: '#fbbf24' } },
    { id: 'minimap', type: 'minimap', x: 700, y: 10, config: { w: 90, h: 65 } },
  ];
  p.levels.push({ id: 'default', name: 'Level 1', tiles: genTiles(), camera: { follow: 'player', smooth: 0.1, bounds: { x: 0, y: 0, w: 800, h: 600 } } });
}

function genTiles(): TileData[] {
  const t: TileData[] = [];
  for (let i = 0; i < 20; i++) { t.push({ x: i*40, y: 560, type: 'grass', solid: true }); t.push({ x: i*40, y: 520, type: 'dirt', solid: true }); }
  return t;
}

export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[] }
export function validateIR(p: GameProject): ValidationResult {
  const e: string[] = [], w: string[] = [];
  if (!p.meta.name) e.push('Name required');
  if (!p.entities.some(e => e.type === 'player')) w.push('No player');
  return { valid: e.length === 0, errors: e, warnings: w };
}
