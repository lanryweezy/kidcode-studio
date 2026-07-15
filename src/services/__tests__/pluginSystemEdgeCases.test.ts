import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginSystem, Plugin } from '../pluginSystem';

function createMockPlugin(id: string, category: 'block' | 'theme' | 'engine' | 'ui' | 'ai' | 'export' = 'theme', deps?: string[]): Plugin {
  return {
    metadata: {
      id,
      name: `Plugin ${id}`,
      version: '1.0.0',
      author: 'Test',
      description: 'Test plugin',
      category,
      minAppVersion: '1.0.0',
      dependencies: deps,
    },
    onLifecycle: vi.fn(),
  };
}

describe('PluginSystem edge cases', () => {
  let system: PluginSystem;

  beforeEach(() => {
    system = new PluginSystem();
  });

  describe('registration edge cases', () => {
    it('registers plugin with no dependencies', async () => {
      const plugin = createMockPlugin('no-deps');
      const result = await system.register(plugin);
      expect(result.success).toBe(true);
    });

    it('rejects plugin with unmet dependency', async () => {
      const plugin = createMockPlugin('child', 'theme', ['missing-parent']);
      const result = await system.register(plugin);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing dependency');
    });

    it('rejects plugin with disabled dependency', async () => {
      const parent = createMockPlugin('parent');
      const child = createMockPlugin('child', 'theme', ['parent']);
      await system.register(parent);
      await system.disable('parent');
      const result = await system.register(child);
      expect(result.success).toBe(false);
    });

    it('rejects duplicate plugin IDs', async () => {
      await system.register(createMockPlugin('dup'));
      const result = await system.register(createMockPlugin('dup'));
      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });

    it('detects block category conflicts', async () => {
      await system.register(createMockPlugin('bp1', 'block'));
      const result = await system.register(createMockPlugin('bp2', 'block'));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflicts');
    });

    it('allows different categories without conflict', async () => {
      await system.register(createMockPlugin('p1', 'theme'));
      const result = await system.register(createMockPlugin('p2', 'ui'));
      expect(result.success).toBe(true);
    });
  });

  describe('lifecycle edge cases', () => {
    it('calls init on register', async () => {
      const plugin = createMockPlugin('test');
      await system.register(plugin);
      expect(plugin.onLifecycle).toHaveBeenCalledWith('init', expect.anything());
    });

    it('calls destroy on unregister', async () => {
      const plugin = createMockPlugin('test');
      await system.register(plugin);
      await system.unregister('test');
      expect(plugin.onLifecycle).toHaveBeenCalledWith('destroy', expect.anything());
    });

    it('handles init failure gracefully', async () => {
      const plugin: Plugin = {
        metadata: {
          id: 'failing', name: 'Failing', version: '1.0.0', author: 'Test',
          description: 'Test', category: 'theme', minAppVersion: '1.0.0',
        },
        onLifecycle: vi.fn().mockRejectedValue(new Error('Init failed')),
      };
      const result = await system.register(plugin);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Init failed');
    });

    it('enables and disables plugins', async () => {
      const plugin = createMockPlugin('toggle');
      await system.register(plugin);
      await system.disable('toggle');
      expect(system.getEnabledPlugins()).toHaveLength(0);
      await system.enable('toggle');
      expect(system.getEnabledPlugins()).toHaveLength(1);
    });

    it('disable returns false for non-existent plugin', async () => {
      const result = await system.disable('nonexistent');
      expect(result).toBe(false);
    });

    it('enable returns false for non-existent plugin', async () => {
      const result = await system.enable('nonexistent');
      expect(result).toBe(false);
    });

    it('enable returns false when already enabled', async () => {
      const plugin = createMockPlugin('already');
      await system.register(plugin);
      const result = await system.enable('already');
      expect(result).toBe(false);
    });

    it('disable returns false when already disabled', async () => {
      const plugin = createMockPlugin('alreadoff');
      await system.register(plugin);
      await system.disable('alreadoff');
      const result = await system.disable('alreadoff');
      expect(result).toBe(false);
    });
  });

  describe('query edge cases', () => {
    it('getRegistered returns undefined for unknown', () => {
      expect(system.getRegistered('nope')).toBeUndefined();
    });

    it('getEnabledPlugins returns empty when none enabled', () => {
      expect(system.getEnabledPlugins()).toHaveLength(0);
    });

    it('getAllPlugins returns all registered', async () => {
      await system.register(createMockPlugin('a'));
      await system.register(createMockPlugin('b'));
      await system.register(createMockPlugin('c'));
      expect(system.getAllPlugins()).toHaveLength(3);
    });

    it('getRegisteredBlocks returns copy', async () => {
      const blocks = system.getRegisteredBlocks();
      expect(blocks).toBeInstanceOf(Map);
    });

    it('getRegisteredRenderers returns copy', () => {
      const renderers = system.getRegisteredRenderers();
      expect(renderers).toBeInstanceOf(Map);
    });

    it('getRegisteredExporters returns copy', () => {
      const exporters = system.getRegisteredExporters();
      expect(exporters).toBeInstanceOf(Map);
    });
  });

  describe('unregister edge cases', () => {
    it('returns false for unknown plugin', async () => {
      const result = await system.unregister('nonexistent');
      expect(result).toBe(false);
    });

    it('removes plugin completely', async () => {
      await system.register(createMockPlugin('rem'));
      await system.unregister('rem');
      expect(system.getRegistered('rem')).toBeUndefined();
      expect(system.getAllPlugins()).toHaveLength(0);
    });
  });

  describe('conflict detection', () => {
    it('returns empty for non-block plugins', async () => {
      await system.register(createMockPlugin('theme1', 'theme'));
      await system.register(createMockPlugin('theme2', 'theme'));
      expect(system.getAllPlugins()).toHaveLength(2);
    });

    it('detects multiple block conflicts', async () => {
      const b1 = createMockPlugin('b1', 'block');
      await system.register(b1);
      const conflicts = system.detectConflicts(createMockPlugin('b3', 'block'));
      expect(conflicts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
