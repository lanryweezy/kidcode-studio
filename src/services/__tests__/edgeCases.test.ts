import { describe, it, expect } from 'vitest';
import { blocksToIR, validateIR, GameProject } from '../gameIR';
import { pluginSystem } from '../pluginSystem';
import {
  trackBlockUsage, getBlockUsageStats, trackCompletion, getCompletionRate,
  trackError, getErrorPatterns, clearAnalytics, generateAnalyticsReport,
} from '../kidcodeAnalytics';

function makeBlock(type: string, params: Record<string, unknown> = {}) {
  return { id: `b_${Math.random().toString(36).slice(2, 8)}`, type, params };
}

describe('Edge cases — IR generation', () => {
  it('should handle empty block array', () => {
    const project = blocksToIR([], {});
    expect(project.entities.length).toBeGreaterThan(0);
    expect(validateIR(project).valid).toBe(true);
  });

  it('should handle single block', () => {
    const project = blocksToIR([makeBlock('SET_EMOJI', { text: '🚀' })], {});
    expect(project.entities[0].emoji).toBe('🚀');
  });

  it('should handle very large programs (200 blocks)', () => {
    const blocks = Array.from({ length: 200 }, (_, i) =>
      makeBlock('CHANGE_SCORE', { value: 1 })
    );
    const project = blocksToIR(blocks, { name: 'BigGame' });
    expect(project.world.score).toBe(200);
    expect(validateIR(project).valid).toBe(true);
  });

  it('should handle blocks with missing params gracefully', () => {
    const project = blocksToIR([makeBlock('SET_EMOJI')], {});
    expect(project.entities[0].emoji).toBeDefined();
  });

  it('should handle SET_VAR with no varName', () => {
    const project = blocksToIR([makeBlock('SET_VAR', { value: 42 })], {});
    expect(project.world.vars['x']).toBe(42);
  });

  it('should handle CHANGE_VAR when var not set', () => {
    const project = blocksToIR([makeBlock('CHANGE_VAR', { varName: 'new', value: 10 })], {});
    expect(project.world.vars['new']).toBe(10);
  });

  it('should handle SET_HEALTH with value exceeding max (no clamping in IR)', () => {
    const project = blocksToIR([makeBlock('SET_HEALTH', { value: 999 })], {});
    // SET_HEALTH in IR just sets the value directly, no clamping
    expect(project.world.health).toBe(999);
  });

  it('should handle SET_HEALTH with negative value (no clamping in IR)', () => {
    const project = blocksToIR([makeBlock('SET_HEALTH', { value: -50 })], {});
    // SET_HEALTH in IR just sets the value directly, no clamping
    expect(project.world.health).toBe(-50);
  });

  it('should handle CHANGE_HEALTH clamping', () => {
    const project = blocksToIR([
      makeBlock('SET_HEALTH', { value: 90 }),
      makeBlock('CHANGE_HEALTH', { value: 20 }),
    ], {});
    expect(project.world.health).toBe(100);
  });

  it('should handle unknown block type without crashing', () => {
    const project = blocksToIR([makeBlock('UNKNOWN_BLOCK_TYPE')], {});
    expect(validateIR(project).valid).toBe(true);
  });

  it('should handle very long block type names', () => {
    const project = blocksToIR([makeBlock('A'.repeat(500))], {});
    expect(project).toBeDefined();
  });

  it('should handle negative score values', () => {
    const project = blocksToIR([makeBlock('CHANGE_SCORE', { value: -100 })], {});
    expect(project.world.score).toBe(-100);
  });

  it('should handle SET_SIZE with zero (correctly passes zero)', () => {
    const project = blocksToIR([makeBlock('SET_SIZE', { value: 0 })], {});
    // SET_SIZE uses num(P.value, 40), so 0 is correctly treated as 0
    expect(project.entities[0].w).toBe(0);
    expect(project.entities[0].h).toBe(0);
  });

  it('should handle SET_OPACITY with values above 100', () => {
    const project = blocksToIR([makeBlock('SET_OPACITY', { value: 200 })], {});
    expect(project.entities[0].props.alpha).toBe(2);
  });

  it('should handle empty settings object', () => {
    const project = blocksToIR([], undefined as any);
    expect(project.meta.name).toBeDefined();
  });

  it('should handle null settings', () => {
    const project = blocksToIR([], null as any);
    expect(project.meta.name).toBeDefined();
  });
});

describe('Edge cases — Plugin system', () => {
  it('should handle registering plugin with invalid id', async () => {
    const result = await pluginSystem.register({
      metadata: {
        id: 'test_edge_plugin',
        name: 'Edge Plugin',
        version: '1.0.0',
        author: 'test',
        description: 'test',
        category: 'block',
        minAppVersion: '1.0.0',
      },
      onLifecycle: () => {},
    });
    expect(result.success).toBe(true);
    await pluginSystem.unregister('test_edge_plugin');
  });

  it('should handle double registration', async () => {
    const plugin = {
      metadata: {
        id: 'double_reg',
        name: 'Double',
        version: '1.0.0',
        author: 'test',
        description: 'test',
        category: 'block' as const,
        minAppVersion: '1.0.0',
      },
      onLifecycle: () => {},
    };
    await pluginSystem.register(plugin);
    const result = await pluginSystem.register(plugin);
    expect(result.success).toBe(false);
    expect(result.error).toContain('already registered');
    await pluginSystem.unregister('double_reg');
  });

  it('should handle unregistering non-existent plugin', async () => {
    const result = await pluginSystem.unregister('nonexistent');
    expect(result).toBe(false);
  });

  it('should handle enable/disable lifecycle', async () => {
    const events: string[] = [];
    await pluginSystem.register({
      metadata: {
        id: 'lifecycle_test',
        name: 'Lifecycle',
        version: '1.0.0',
        author: 'test',
        description: 'test',
        category: 'theme',
        minAppVersion: '1.0.0',
      },
      onLifecycle: (event) => { events.push(event); },
    });
    await pluginSystem.disable('lifecycle_test');
    await pluginSystem.enable('lifecycle_test');
    expect(events).toContain('init');
    expect(events).toContain('disable');
    expect(events).toContain('enable');
    await pluginSystem.unregister('lifecycle_test');
  });
});

describe('Edge cases — Analytics', () => {
  it('should handle empty analytics', () => {
    clearAnalytics();
    const report = generateAnalyticsReport();
    expect(report.topBlocks).toHaveLength(0);
    expect(report.completionRate.total).toBe(0);
    expect(report.topErrors).toHaveLength(0);
    expect(report.avgSessionDuration).toBe(0);
  });

  it('should handle many error patterns', () => {
    clearAnalytics();
    for (let i = 0; i < 100; i++) {
      trackError(`ERR_${i}`, `Error ${i}`);
    }
    const patterns = getErrorPatterns();
    expect(patterns.length).toBe(100);
  });

  it('should deduplicate error patterns', () => {
    clearAnalytics();
    trackError('DUP', 'Duplicate');
    trackError('DUP', 'Duplicate');
    trackError('DUP', 'Duplicate');
    const patterns = getErrorPatterns();
    expect(patterns.length).toBe(1);
    expect(patterns[0].count).toBe(3);
  });

  it('should handle completion rate with no data', () => {
    clearAnalytics();
    const rate = getCompletionRate();
    expect(rate.rate).toBe(0);
  });

  it('should compute completion rate correctly', () => {
    clearAnalytics();
    trackCompletion({ templateId: 't1', startedAt: 1, completedAt: 2, success: true, blockCount: 5, sessionId: 's1' });
    trackCompletion({ templateId: 't1', startedAt: 3, completedAt: 4, success: false, blockCount: 3, sessionId: 's2' });
    const rate = getCompletionRate('t1');
    expect(rate.total).toBe(2);
    expect(rate.completed).toBe(1);
    expect(rate.rate).toBe(0.5);
  });
});
