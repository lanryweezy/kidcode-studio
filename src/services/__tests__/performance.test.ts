import { describe, it, expect } from 'vitest';
import { blocksToIR, validateIR } from '../gameIR';

function makeBlock(type: string, params: Record<string, unknown> = {}) {
  return { id: `b_${Math.random().toString(36).slice(2, 8)}`, type, params };
}

describe('Performance — IR execution speed', () => {
  it('should generate IR for 100 blocks in under 100ms', () => {
    const blocks = Array.from({ length: 100 }, (_, i) =>
      makeBlock('CHANGE_SCORE', { value: i })
    );
    const start = performance.now();
    const project = blocksToIR(blocks, { name: 'PerfGame' });
    const elapsed = performance.now() - start;
    // CHANGE_SCORE now uses num(P.value, 1) which correctly handles 0: sum is 0+1+2+...+99 = 4950
    expect(project.world.score).toBe(4950);
    expect(elapsed).toBeLessThan(100);
  });

  it('should generate IR for 500 blocks in under 500ms', () => {
    const blocks = Array.from({ length: 500 }, (_, i) =>
      makeBlock(i % 2 === 0 ? 'SPAWN_ENEMY' : 'SPAWN_ITEM')
    );
    const start = performance.now();
    const project = blocksToIR(blocks, { name: 'BigPerfGame' });
    const elapsed = performance.now() - start;
    expect(project.entities.length).toBeGreaterThan(500);
    expect(elapsed).toBeLessThan(500);
  });

  it('should generate IR for 1000 mixed blocks in under 1000ms', () => {
    const types = ['CHANGE_SCORE', 'SET_HEALTH', 'SPAWN_ENEMY', 'SPAWN_ITEM', 'SET_VAR'];
    const blocks = Array.from({ length: 1000 }, (_, i) =>
      makeBlock(types[i % types.length], { value: i, text: `val_${i}` })
    );
    const start = performance.now();
    const project = blocksToIR(blocks, { name: 'MegaPerfGame' });
    const elapsed = performance.now() - start;
    expect(validateIR(project).valid).toBe(true);
    expect(elapsed).toBeLessThan(1000);
  });

  it('should validate IR quickly for large projects', () => {
    const blocks = Array.from({ length: 200 }, () =>
      makeBlock('CHANGE_SCORE', { value: 1 })
    );
    const project = blocksToIR(blocks, { name: 'ValidPerf' });
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      validateIR(project);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('should handle rapid IR regeneration', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      const blocks = Array.from({ length: 50 }, () =>
        makeBlock('CHANGE_SCORE', { value: 1 })
      );
      blocksToIR(blocks, { name: `Rapid_${i}` });
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
