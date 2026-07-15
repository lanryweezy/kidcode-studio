// KidCode Studio — Enhanced Game Event System
// 1000% improvement: Comprehensive event system for block-engine communication

import { UnifiedGameEngine } from './unifiedGameEngine';
import { BlockExecutor } from './blockExecutor';

// === 11. EVENT TRIGGER SYSTEM (Enhanced) ===
export interface GameEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  source: string;
}

export class EventTriggerSystem {
  private engine: UnifiedGameEngine;
  private executor: BlockExecutor;
  private eventHandlers: Map<string, Array<{ id: string; handler: (data: Record<string, unknown>) => void; once: boolean }>> = new Map();
  private eventQueue: GameEvent[] = [];
  private eventHistory: GameEvent[] = [];
  private maxHistory: number = 100;

  constructor(engine: UnifiedGameEngine, executor: BlockExecutor) {
    this.engine = engine;
    this.executor = executor;
  }

  on(eventType: string, handler: (data: Record<string, unknown>) => void): string {
    const id = `handler_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push({ id, handler, once: false });
    return id;
  }

  once(eventType: string, handler: (data: Record<string, unknown>) => void): string {
    const id = `handler_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push({ id, handler, once: true });
    return id;
  }

  off(id: string) {
    this.eventHandlers.forEach((handlers, key) => {
      this.eventHandlers.set(key, handlers.filter(h => h.id !== id));
    });
  }

  emit(eventType: string, data: Record<string, unknown>, source: string = 'game') {
    this.eventQueue.push({ type: eventType, data, timestamp: Date.now(), source });
  }

  processEvents() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistory) this.eventHistory.shift();

      const handlers = this.eventHandlers.get(event.type) || [];
      const toRemove: string[] = [];
      handlers.forEach(handler => {
        handler.handler(event.data);
        if (handler.once) toRemove.push(handler.id);
      });

      if (toRemove.length > 0) {
        this.eventHandlers.set(event.type, handlers.filter(h => !toRemove.includes(h.id)));
      }
    }
  }

  getEventHistory(): GameEvent[] {
    return [...this.eventHistory];
  }

  // Pre-defined event emitters
  onEnemyKilled(enemy: { x: number; y: number }) {
    this.emit('enemy_killed', { enemy, score: 10 });
    this.emit('spawn_particles', { x: enemy.x, y: enemy.y, emoji: '💥', count: 5 });
    this.emit('play_sound', { sound: 'explosion' });
  }

  onItemCollected(item: { x: number; y: number }) {
    this.emit('item_collected', { item });
    this.emit('spawn_particles', { x: item.x, y: item.y, emoji: '✨', count: 3 });
  }

  onPlayerDamage(amount: number) {
    this.emit('player_damage', { amount });
    this.emit('screen_shake', { intensity: 5, duration: 200 });
    this.emit('screen_flash', { color: 'red', duration: 0.2 });
  }

  onWaveComplete(wave: number) {
    this.emit('wave_complete', { wave });
    this.emit('play_sound', { sound: 'powerup' });
  }

  onBossSpawn() {
    this.emit('boss_spawn', {});
    this.emit('weather_change', { weather: 'storm' });
    this.emit('screen_effect', { type: 'vignette', duration: 2 });
  }

  onBossDefeated() {
    this.emit('boss_defeated', {});
    this.emit('weather_change', { weather: 'none' });
    this.emit('screen_transition', { type: 'flash', duration: 0.5 });
    this.emit('spawn_particles', { x: 400, y: 300, emoji: '🎉', count: 20 });
  }
}

// === 12. COLLISION CALLBACKS (Enhanced) ===
export interface CollisionEntity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionCallback {
  entityA: string;
  entityB: string;
  callback: (a: CollisionEntity, b: CollisionEntity) => void;
  once: boolean;
}

export class CollisionCallbackSystem {
  private callbacks: CollisionCallback[] = [];

  register(entityA: string, entityB: string, callback: (a: CollisionEntity, b: CollisionEntity) => void, once: boolean = false) {
    this.callbacks.push({ entityA, entityB, callback, once });
  }

  checkCollision(entityA: CollisionEntity, entityB: CollisionEntity, typeA: string, typeB: string) {
    const toRemove: number[] = [];
    this.callbacks.forEach((cb, index) => {
      if ((cb.entityA === typeA && cb.entityB === typeB) ||
          (cb.entityA === typeB && cb.entityB === typeA)) {
        cb.callback(entityA, entityB);
        if (cb.once) toRemove.push(index);
      }
    });
    if (toRemove.length > 0) {
      this.callbacks = this.callbacks.filter((_, i) => !toRemove.includes(i));
    }
  }
}

// === 13. TIMER SYSTEM (Enhanced) ===
export interface TimerBlock {
  id: string;
  delay: number;
  callback: () => void;
  elapsed: number;
  repeat: boolean;
  interval: number;
  paused: boolean;
  label: string;
}

export class TimerSystem {
  private timers: TimerBlock[] = [];

  addTimer(delay: number, callback: () => void, repeat: boolean = false, interval: number = 0, label: string = ''): string {
    const id = `timer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.timers.push({ id, delay, callback, elapsed: 0, repeat, interval, paused: false, label });
    return id;
  }

  removeTimer(id: string) {
    this.timers = this.timers.filter(t => t.id !== id);
  }

  pauseTimer(id: string) {
    const timer = this.timers.find(t => t.id === id);
    if (timer) timer.paused = true;
  }

  resumeTimer(id: string) {
    const timer = this.timers.find(t => t.id === id);
    if (timer) timer.paused = false;
  }

  update(dt: number) {
    this.timers = this.timers.filter(timer => {
      if (timer.paused) return true;
      timer.elapsed += dt;
      if (timer.elapsed >= timer.delay) {
        timer.callback();
        if (timer.repeat) {
          timer.elapsed = 0;
          timer.delay = timer.interval;
          return true;
        }
        return false;
      }
      return true;
    });
  }

  getActiveTimers(): TimerBlock[] {
    return this.timers.filter(t => !t.paused);
  }
}

// === 14. LOOP COUNTERS (Enhanced) ===
export class LoopCounter {
  private counters: Map<string, number> = new Map();
  private maxIterations: Map<string, number> = new Map();
  private completed: Map<string, boolean> = new Map();

  startLoop(id: string, maxIterations: number) {
    this.counters.set(id, 0);
    this.maxIterations.set(id, maxIterations);
    this.completed.set(id, false);
  }

  increment(id: string): boolean {
    const current = (this.counters.get(id) || 0) + 1;
    this.counters.set(id, current);
    const max = this.maxIterations.get(id) || Infinity;
    if (current >= max) {
      this.completed.set(id, true);
      return false;
    }
    return true;
  }

  getCount(id: string): number {
    return this.counters.get(id) || 0;
  }

  isCompleted(id: string): boolean {
    return this.completed.get(id) || false;
  }

  reset(id: string) {
    this.counters.set(id, 0);
    this.completed.set(id, false);
  }
}

// === 15. FUNCTION REGISTRY (Enhanced) ===
export interface FunctionBlock {
  name: string;
  parameters: string[];
  body: Record<string, unknown>[];
  localVariables: Map<string, unknown>;
  callCount: number;
  lastCalled: number;
}

export class FunctionRegistry {
  private functions: Map<string, FunctionBlock> = new Map();

  define(name: string, parameters: string[], body: Record<string, unknown>[]) {
    this.functions.set(name, {
      name, parameters, body,
      localVariables: new Map(),
      callCount: 0,
      lastCalled: 0,
    });
  }

  call(name: string, args: unknown[]): Record<string, unknown>[] | null {
    const func = this.functions.get(name);
    if (!func) return null;

    func.callCount++;
    func.lastCalled = Date.now();

    // Set local variables
    func.parameters.forEach((param, i) => {
      func.localVariables.set(param, args[i]);
    });

    return func.body;
  }

  has(name: string): boolean {
    return this.functions.has(name);
  }

  get(name: string): FunctionBlock | undefined {
    return this.functions.get(name);
  }

  getAll(): FunctionBlock[] {
    return Array.from(this.functions.values());
  }

  getCallCount(name: string): number {
    return this.functions.get(name)?.callCount || 0;
  }
}

// === 16. EVENT LISTENER SYSTEM (Enhanced) ===
export interface EventListener {
  id: string;
  eventType: string;
  condition: (state: Record<string, unknown>) => boolean;
  callback: () => void;
  once: boolean;
  priority: number;
}

export class EventListenerSystem {
  private listeners: EventListener[] = [];

  addListener(eventType: string, condition: (state: Record<string, unknown>) => boolean, callback: () => void, once: boolean = false, priority: number = 0): string {
    const id = `listener_${Date.now()}`;
    this.listeners.push({ id, eventType, condition, callback, once, priority });
    this.listeners.sort((a, b) => b.priority - a.priority);
    return id;
  }

  removeListener(id: string) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  checkListeners(eventType: string, state: Record<string, unknown>) {
    this.listeners = this.listeners.filter(listener => {
      if (listener.eventType === eventType && listener.condition(state)) {
        listener.callback();
        return !listener.once;
      }
      return true;
    });
  }

  getListeners(): EventListener[] {
    return [...this.listeners];
  }
}

// === 17. STATE QUERIES (Enhanced) ===
export class StateQuerySystem {
  private engine: UnifiedGameEngine;

  constructor(engine: UnifiedGameEngine) {
    this.engine = engine;
  }

  query(queryType: string, params: Record<string, unknown> = {}): unknown {
    const state = this.engine.getState();

    switch (queryType) {
      case 'PLAYER_HEALTH': return state.playerHealth;
      case 'PLAYER_MAX_HEALTH': return state.playerMaxHealth;
      case 'PLAYER_X': return state.playerX;
      case 'PLAYER_Y': return state.playerY;
      case 'PLAYER_SPEED': return state.playerSpeed;
      case 'PLAYER_FACING': return state.playerFacing;
      case 'SCORE': return state.score;
      case 'WAVE': return state.wave;
      case 'COMBO': return state.combo;
      case 'MAX_COMBO': return state.maxCombo;
      case 'ENEMY_COUNT': return state.enemies.filter((e) => e.alive).length;
      case 'ITEM_COUNT': return state.items.filter((i) => !i.collected).length;
      case 'PROJECTILE_COUNT': return state.projectiles.filter((p) => p.alive).length;
      case 'HAS_ITEM':
        return state.items.some((i) => i.emoji === params.emoji && !i.collected);
      case 'NEAREST_ENEMY':
        return this.findNearest(state.playerX, state.playerY, state.enemies.filter((e) => e.alive));
      case 'NEAREST_ITEM':
        return this.findNearest(state.playerX, state.playerY, state.items.filter((i) => !i.collected));
      case 'IS_GROUNDED': return state.playerIsGrounded;
      case 'IS_INVINCIBLE': return state.playerInvincible;
      case 'WEATHER': return state.weather;
      case 'TIME_PLAYED': return state.timePlayed;
      case 'COINS': return state.coins;
      case 'KEYS': return state.keys;
      default: return null;
    }
  }

  private findNearest(x: number, y: number, entities: Array<{ x: number; y: number }>): { x: number; y: number } | null {
    let nearest: { x: number; y: number } | null = null;
    let minDist = Infinity;
    entities.forEach((e) => {
      const dist = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
      if (dist < minDist) { minDist = dist; nearest = e; }
    });
    return nearest;
  }
}

// === 18. CAMERA CONTROLLER (Enhanced) ===
export class CameraController {
  private engine: UnifiedGameEngine;
  private shakeX: number = 0;
  private shakeY: number = 0;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeElapsed: number = 0;

  constructor(engine: UnifiedGameEngine) {
    this.engine = engine;
  }

  followPlayer() {
    const state = this.engine.getState();
    const targetX = state.playerX - 400;
    const targetY = state.playerY - 300;
    state.cameraX += (targetX - state.cameraX) * 0.1;
    state.cameraY += (targetY - state.cameraY) * 0.1;
  }

  moveTo(x: number, y: number, speed: number = 0.05) {
    const state = this.engine.getState();
    state.cameraX += (x - state.cameraX) * speed;
    state.cameraY += (y - state.cameraY) * speed;
  }

  zoom(factor: number) {
    this.engine.state.cameraZoom = factor;
  }

  shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeElapsed = 0;
  }

  update(dt: number): { x: number; y: number } {
    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += dt;
      const decay = Math.pow(0.85, this.shakeElapsed * 60);
      return {
        x: (Math.random() - 0.5) * this.shakeIntensity * decay,
        y: (Math.random() - 0.5) * this.shakeIntensity * decay,
      };
    }
    return { x: 0, y: 0 };
  }
}

// === 19. SCREEN EFFECTS (Enhanced) ===
export class ScreenEffectSystem {
  private effects: Array<{ type: string; params: Record<string, unknown>; elapsed: number; duration: number }> = [];

  addEffect(type: string, params: Record<string, unknown>, duration: number = 0.5) {
    this.effects.push({ type, params, elapsed: 0, duration });
  }

  update(dt: number) {
    this.effects = this.effects.filter(e => {
      e.elapsed += dt;
      return e.elapsed < e.duration;
    });
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.effects.forEach(effect => {
      const progress = effect.elapsed / effect.duration;
      const alpha = 1 - progress;

      switch (effect.type) {
        case 'flash':
          ctx.fillStyle = `rgba(${effect.params.r || 255}, ${effect.params.g || 255}, ${effect.params.b || 255}, ${alpha * 0.3})`;
          ctx.fillRect(0, 0, width, height);
          break;
        case 'vignette':
          const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.5})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
          break;
      }
    });
  }
}

// === 20. AUDIO TRIGGER SYSTEM (Enhanced) ===
export class AudioTriggerSystem {
  private triggers: Map<string, () => void> = new Map();
  private volume: number = 1;

  registerTrigger(soundName: string, callback: () => void) {
    this.triggers.set(soundName, callback);
  }

  trigger(soundName: string) {
    const callback = this.triggers.get(soundName);
    if (callback) callback();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume(): number {
    return this.volume;
  }
}
