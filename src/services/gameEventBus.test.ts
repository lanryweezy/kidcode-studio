import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGameEventBus } from './gameEventBus';

describe('gameEventBus', () => {
  let bus: ReturnType<typeof getGameEventBus>;

  beforeEach(() => {
    bus = getGameEventBus();
    bus.clear();
  });

  it('returns a singleton', () => {
    const b1 = getGameEventBus();
    const b2 = getGameEventBus();
    expect(b1).toBe(b2);
  });

  it('emits events to specific handlers', () => {
    const handler = vi.fn();
    bus.on('enemy_defeated', handler);
    bus.emit({ type: 'enemy_defeated', enemyType: 'slime', x: 10, y: 20, wave: 1 });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'enemy_defeated', enemyType: 'slime' })
    );
  });

  it('supports wildcard handlers', () => {
    const handler = vi.fn();
    bus.on('*', handler);
    bus.emit({ type: 'wave_complete', wave: 3 });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'wave_complete', wave: 3 })
    );
  });

  it('unsubscribe function removes handler', () => {
    const handler = vi.fn();
    const unsub = bus.on('item_collected', handler);
    unsub();
    bus.emit({ type: 'item_collected', itemType: 'coin', x: 0, y: 0 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('logs events', () => {
    bus.emit({ type: 'victory', score: 1000, wave: 10 });
    bus.emit({ type: 'game_over', reason: 'death', score: 500, wave: 5 });
    const log = bus.getLog();
    expect(log).toHaveLength(2);
    expect(log[0].type).toBe('victory');
  });

  it('clears handlers and log', () => {
    const handler = vi.fn();
    bus.on('combo_achieved', handler);
    bus.emit({ type: 'combo_achieved', combo: 5 });
    expect(handler).toHaveBeenCalledTimes(1);
    const logBefore = bus.getLog();
    expect(logBefore.length).toBeGreaterThan(0);
    bus.clear();
    expect(bus.getLog()).toHaveLength(0);
    bus.emit({ type: 'combo_achieved', combo: 10 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('returns a copy of the log', () => {
    bus.emit({ type: 'player_damaged', amount: 10, x: 0, y: 0 });
    const log1 = bus.getLog();
    const log2 = bus.getLog();
    expect(log1).not.toBe(log2);
    expect(log1).toEqual(log2);
  });
});
