type GameEvent =
  | { type: 'enemy_defeated'; enemyType: string; x: number; y: number; wave: number }
  | { type: 'item_collected'; itemType: string; x: number; y: number }
  | { type: 'player_damaged'; amount: number; x: number; y: number }
  | { type: 'player_healed'; amount: number }
  | { type: 'wave_complete'; wave: number }
  | { type: 'boss_defeated'; bossName: string; wave: number }
  | { type: 'game_over'; reason: string; score: number; wave: number }
  | { type: 'victory'; score: number; wave: number }
  | { type: 'combo_achieved'; combo: number }
  | { type: 'achievement_unlocked'; achievementId: string; name: string }
  | { type: 'area_entered'; areaName: string }
  | { type: 'checkpoint_reached'; checkpointId: string }
  | { type: 'timer_warning'; secondsRemaining: number }
  | { type: 'custom'; [key: string]: unknown };

type EventHandler = (event: GameEvent) => void;

class GameEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventLog: GameEvent[] = [];
  private maxLogSize: number = 100;

  on(eventType: GameEvent['type'] | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  emit(event: GameEvent) {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
    // Notify specific handlers
    this.handlers.get(event.type)?.forEach(handler => handler(event));
    // Notify wildcard handlers
    this.handlers.get('*')?.forEach(handler => handler(event));
  }

  getLog(): GameEvent[] {
    return [...this.eventLog];
  }

  clear() {
    this.handlers.clear();
    this.eventLog = [];
  }
}

let instance: GameEventBus | null = null;

export function getGameEventBus(): GameEventBus {
  if (!instance) instance = new GameEventBus();
  return instance;
}

export type { GameEvent, EventHandler };
