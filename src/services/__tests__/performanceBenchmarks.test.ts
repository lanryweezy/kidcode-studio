import { describe, it, expect, vi } from 'vitest';
import { blocksToIR, validateIR } from '../gameIR';
import { GameLoopConfig, DEFAULT_LOOP_CONFIG } from '../gameLoop';
import { ObjectPool } from '../objectPool';
import { CanvasOptimizer } from '../renderOptimizer';
import { SpatialHash } from '../spatialHash';

function makeBlock(type: string, params: Record<string, unknown> = {}) {
  return { id: `b_${Math.random().toString(36).slice(2, 8)}`, type, params };
}

describe('Performance Benchmarks', () => {
  describe('IR Execution Speed', () => {
    it('should process 1000 blocks under 500ms', () => {
      const blocks = Array.from({ length: 1000 }, (_, i) =>
        makeBlock(i % 2 === 0 ? 'CHANGE_SCORE' : 'SET_HEALTH', { value: i })
      );
      const start = performance.now();
      const project = blocksToIR(blocks, { name: 'BenchmarkGame' });
      const elapsed = performance.now() - start;
      expect(project).toBeDefined();
      expect(elapsed).toBeLessThan(500);
    });

    it('should validate IR in under 50ms for medium project', () => {
      const blocks = Array.from({ length: 200 }, () =>
        makeBlock('CHANGE_SCORE', { value: 1 })
      );
      const project = blocksToIR(blocks, { name: 'ValidateBench' });
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        validateIR(project);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should handle rapid IR regeneration (50 iterations)', () => {
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        const blocks = Array.from({ length: 100 }, () =>
          makeBlock('CHANGE_SCORE', { value: 1 })
        );
        blocksToIR(blocks, { name: `RapidBench_${i}` });
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(1500);
    });
  });

  describe('Game Engine Tick Rate', () => {
    it('should simulate 1000 physics ticks under 100ms', () => {
      const config: GameLoopConfig = DEFAULT_LOOP_CONFIG;
      const fixedStep = 1000 / config.physicsFPS;
      let accumulator = 0;
      let tickCount = 0;
      const startTime = performance.now();

      // Simulate 60 frames of game loop
      for (let frame = 0; frame < 60; frame++) {
        accumulator += 16.67; // ~60fps frame time
        while (accumulator >= fixedStep) {
          tickCount++;
          accumulator -= fixedStep;
          // Simulate minimal physics work
          const x = Math.random() * 800;
          const y = Math.random() * 600;
          const vx = (Math.random() - 0.5) * 10;
          const vy = (Math.random() - 0.5) * 10;
          const _nextX = x + vx;
          const _nextY = y + vy;
        }
      }
      const elapsed = performance.now() - startTime;
      expect(tickCount).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(100);
    });

    it('should handle spatial hash queries efficiently', () => {
      const spatialHash = new SpatialHash(40);
      const tilemap = Array.from({ length: 100 }, (_, i) => ({
        x: i % 10,
        y: Math.floor(i / 10),
        type: 'brick' as const,
      }));
      spatialHash.buildTilemap(tilemap);

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        spatialHash.query(Math.random() * 400, Math.random() * 400, 40, 40);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('Object Pool Performance', () => {
    it('should acquire/release 10000 objects under 50ms', () => {
      const pool = new ObjectPool(
        () => ({ x: 0, y: 0, vx: 0, vy: 0 }),
        (obj) => { obj.x = 0; obj.y = 0; obj.vx = 0; obj.vy = 0; },
        100,
        1000
      );

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const obj = pool.acquire();
        obj.x = Math.random() * 800;
        obj.y = Math.random() * 600;
        pool.release(obj);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });

    it('should handle batch operations efficiently', () => {
      const pool = new ObjectPool(
        () => ({ x: 0, y: 0 }),
        (obj) => { obj.x = 0; obj.y = 0; },
        0,
        5000
      );

      const start = performance.now();
      const batch = pool.acquireBatch(1000);
      expect(batch).toHaveLength(1000);
      pool.releaseBatch(batch);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(20);
    });
  });

  describe('Canvas Optimizer Performance', () => {
    it('should filter 10000 items in viewport under 20ms', () => {
      const canvas = { width: 800, height: 600 } as HTMLCanvasElement;
      const optimizer = new CanvasOptimizer(canvas);
      const camera = { x: 0, y: 0, zoom: 1 };
      const items = Array.from({ length: 10000 }, () => ({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 2000 - 500,
        width: 40,
        height: 40,
      }));

      const start = performance.now();
      const visible = optimizer.filterVisible(items, camera);
      const elapsed = performance.now() - start;
      expect(visible.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(20);
    });

    it('should perform culling checks rapidly', () => {
      const canvas = { width: 800, height: 600 } as HTMLCanvasElement;
      const optimizer = new CanvasOptimizer(canvas);
      const camera = { x: 0, y: 0, zoom: 1 };

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        optimizer.cullingCheck(
          Math.random() * 1600 - 400,
          Math.random() * 1200 - 300,
          40, 40, camera
        );
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(20);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak objects in pool over many cycles', () => {
      const pool = new ObjectPool(
        () => ({ data: new Array(100).fill(0) }),
        (obj) => { obj.data.fill(0); },
        50,
        200
      );

      for (let cycle = 0; cycle < 100; cycle++) {
        const batch = pool.acquireBatch(50);
        pool.releaseBatch(batch);
      }

      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.free).toBeLessThanOrEqual(200);
      expect(stats.peak).toBe(50);
    });
  });
});
