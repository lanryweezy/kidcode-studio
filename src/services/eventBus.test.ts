import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from './eventBus';

describe('eventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('emits events to listeners', () => {
    const handler = vi.fn();
    eventBus.on('test', handler);
    eventBus.emit('test', { data: 1 });
    expect(handler).toHaveBeenCalledWith({ data: 1 });
  });

  it('supports multiple listeners on same event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    eventBus.on('multi', h1);
    eventBus.on('multi', h2);
    eventBus.emit('multi');
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('off removes a specific listener', () => {
    const handler = vi.fn();
    eventBus.on('remove', handler);
    eventBus.off('remove', handler);
    eventBus.emit('remove');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off does nothing if listener not registered', () => {
    expect(() => eventBus.off('nonexistent', vi.fn())).not.toThrow();
  });

  it('clear removes all listeners', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    eventBus.on('a', h1);
    eventBus.on('b', h2);
    eventBus.clear();
    eventBus.emit('a');
    eventBus.emit('b');
    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('emits without data', () => {
    const handler = vi.fn();
    eventBus.on('nodata', handler);
    eventBus.emit('nodata');
    expect(handler).toHaveBeenCalledWith(undefined);
  });

  it('different events do not cross-talk', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    eventBus.on('eventA', handlerA);
    eventBus.on('eventB', handlerB);
    eventBus.emit('eventA');
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).not.toHaveBeenCalled();
  });
});
