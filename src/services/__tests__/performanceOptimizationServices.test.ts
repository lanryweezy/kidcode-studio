import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from '../objectPool';
import { VirtualScroller } from '../virtualScroll';
import { CanvasOptimizer } from '../renderOptimizer';

describe('ObjectPool', () => {
  it('should create pool with initial size', () => {
    const pool = new ObjectPool<number>(
      () => Math.random(),
      () => {},
      10
    );
    const stats = pool.getStats();
    expect(stats.free).toBe(10);
    expect(stats.active).toBe(0);
  });

  it('should acquire from pool', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      5
    );
    const item = pool.acquire();
    expect(item).toBe(0);
    expect(pool.getStats().active).toBe(1);
    expect(pool.getStats().free).toBe(4);
  });

  it('should create new when pool empty', () => {
    const pool = new ObjectPool<number>(
      () => 42,
      () => {},
      0
    );
    const item = pool.acquire();
    expect(item).toBe(42);
  });

  it('should release back to pool', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      5
    );
    const item = pool.acquire();
    pool.release(item);
    expect(pool.getStats().active).toBe(0);
    expect(pool.getStats().free).toBe(5);
  });

  it('should acquire batch', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      0
    );
    const batch = pool.acquireBatch(5);
    expect(batch).toHaveLength(5);
    expect(pool.getStats().active).toBe(5);
  });

  it('should release batch', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      0
    );
    const batch = pool.acquireBatch(5);
    pool.releaseBatch(batch);
    expect(pool.getStats().active).toBe(0);
  });

  it('should prewarm pool', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      0,
      20
    );
    pool.prewarm(10);
    expect(pool.getStats().free).toBe(10);
  });

  it('should not exceed maxSize', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      0,
      3
    );
    const batch = pool.acquireBatch(5);
    pool.releaseBatch(batch);
    expect(pool.getStats().free).toBe(3);
  });

  it('should track peak count', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      0
    );
    pool.acquireBatch(10);
    expect(pool.getStats().peak).toBe(10);
    const batch = pool.acquireBatch(5);
    expect(pool.getStats().peak).toBe(15);
    pool.releaseBatch(batch);
    expect(pool.getStats().peak).toBe(15);
  });

  it('should clear pool', () => {
    const pool = new ObjectPool<number>(
      () => 0,
      () => {},
      10
    );
    pool.clear();
    const stats = pool.getStats();
    expect(stats.free).toBe(0);
    expect(stats.active).toBe(0);
  });

  it('should return maxSize in stats', () => {
    const pool = new ObjectPool<number>(() => 0, () => {}, 0, 500);
    expect(pool.getStats().maxSize).toBe(500);
  });
});

describe('VirtualScroller', () => {
  const scroller = new VirtualScroller<number>();

  it('should return empty for empty items', () => {
    const result = scroller.getVisibleItems(
      [],
      { x: 0, y: 0, width: 800, height: 600 },
      30
    );
    expect(result).toEqual([]);
  });

  it('should return visible items', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const result = scroller.getVisibleItems(
      items,
      { x: 0, y: 0, width: 800, height: 300 },
      30,
      0
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should return correct range', () => {
    const range = scroller.getVisibleRange(
      100,
      0,
      300,
      30,
      0
    );
    expect(range.start).toBe(0);
    expect(range.end).toBeGreaterThan(0);
    expect(range.totalHeight).toBe(3000);
  });

  it('should handle scrolled viewport', () => {
    const range = scroller.getVisibleRange(
      100,
      600,
      300,
      30,
      0
    );
    expect(range.start).toBeGreaterThan(0);
  });

  it('should return empty range for zero items', () => {
    const range = scroller.getVisibleRange(0, 0, 300, 30);
    expect(range.start).toBe(0);
    expect(range.end).toBe(0);
    expect(range.totalHeight).toBe(0);
  });

  it('should handle grid items', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const result = scroller.getVisibleGridItems(
      items,
      { x: 0, y: 0, width: 800, height: 300 },
      100,
      100,
      8,
      0
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty grid for empty items', () => {
    const result = scroller.getVisibleGridItems(
      [],
      { x: 0, y: 0, width: 800, height: 300 },
      100,
      100,
      8
    );
    expect(result).toEqual([]);
  });

  it('should handle negative viewport y', () => {
    const range = scroller.getVisibleRange(100, -100, 300, 30);
    expect(range.start).toBe(0);
  });

  it('should return offsetTop calculated correctly', () => {
    const range = scroller.getVisibleRange(100, 300, 300, 30, 0);
    expect(range.offsetTop).toBeGreaterThanOrEqual(0);
  });
});

describe('CanvasOptimizer', () => {
  let canvas: HTMLCanvasElement;
  let optimizer: CanvasOptimizer;

  beforeEach(() => {
    canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
      })),
    } as unknown as HTMLCanvasElement;
    optimizer = new CanvasOptimizer(canvas);
  });

  it('should mark and detect dirty regions', () => {
    expect(optimizer.isDirty()).toBe(false);
    optimizer.markDirty(0, 0, 100, 100);
    expect(optimizer.isDirty()).toBe(true);
  });

  it('should clear dirty regions', () => {
    optimizer.markDirty(0, 0, 100, 100);
    optimizer.clearDirty();
    expect(optimizer.isDirty()).toBe(false);
  });

  it('should cull on-screen entities', () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    expect(optimizer.cullingCheck(100, 100, 40, 40, camera)).toBe(true);
  });

  it('should cull off-screen entities', () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    expect(optimizer.cullingCheck(-200, -200, 40, 40, camera)).toBe(false);
    expect(optimizer.cullingCheck(2000, 2000, 40, 40, camera)).toBe(false);
  });

  it('should cull with zoom', () => {
    const camera = { x: 0, y: 0, zoom: 2 };
    expect(optimizer.cullingCheck(100, 100, 40, 40, camera)).toBe(true);
  });

  it('should filter visible items', () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    const items = [
      { x: 100, y: 100, width: 40, height: 40 },
      { x: -200, y: -200, width: 40, height: 40 },
      { x: 500, y: 400, width: 40, height: 40 },
    ];
    const visible = optimizer.filterVisible(items, camera);
    expect(visible).toHaveLength(2);
  });

  it('should update and get FPS', () => {
    const fps = optimizer.updateFPS();
    expect(fps).toBeGreaterThanOrEqual(0);
    expect(optimizer.getFPS()).toBeGreaterThanOrEqual(0);
  });

  it('should merge dirty regions', () => {
    optimizer.markDirty(0, 0, 50, 50);
    optimizer.markDirty(100, 100, 50, 50);
    const merged = optimizer.mergeDirtyRegions();
    expect(merged).not.toBeNull();
    expect(merged!.x).toBe(0);
    expect(merged!.y).toBe(0);
    expect(merged!.w).toBe(150);
    expect(merged!.h).toBe(150);
  });

  it('should return null for no dirty regions', () => {
    expect(optimizer.mergeDirtyRegions()).toBeNull();
  });

  it('should handle shouldRender with 0 skip', () => {
    expect(optimizer.shouldRender(0)).toBe(true);
  });

  it('should handle shouldRender with 1 skip', () => {
    expect(optimizer.shouldRender(1)).toBe(false);
  });

  it('should use default size for filterVisible', () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    const items = [
      { x: 100, y: 100 },
      { x: -200, y: -200 },
    ];
    const visible = optimizer.filterVisible(items, camera);
    expect(visible).toHaveLength(1);
  });

  it('should handle empty items in filterVisible', () => {
    const camera = { x: 0, y: 0, zoom: 1 };
    const visible = optimizer.filterVisible([], camera);
    expect(visible).toHaveLength(0);
  });

  it('should handle single dirty region merge', () => {
    optimizer.markDirty(10, 20, 30, 40);
    const merged = optimizer.mergeDirtyRegions();
    expect(merged).toEqual({ x: 10, y: 20, w: 30, h: 40 });
  });
});
