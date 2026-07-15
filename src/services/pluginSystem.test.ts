import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginSystem, Plugin, PluginContext } from './pluginSystem';

describe('PluginSystem', () => {
  let system: PluginSystem;

  beforeEach(() => {
    system = new PluginSystem();
  });

  const createMockPlugin = (id: string, deps?: string[]): Plugin => ({
    metadata: {
      id,
      name: `Plugin ${id}`,
      version: '1.0.0',
      author: 'Test',
      description: 'Test plugin',
      category: 'theme',
      minAppVersion: '1.0.0',
      dependencies: deps,
    },
    onLifecycle: vi.fn(),
  });

  it('registers a plugin', async () => {
    const plugin = createMockPlugin('test-plugin');
    const result = await system.register(plugin);
    expect(result.success).toBe(true);
    expect(system.getRegistered('test-plugin')).toBe(plugin);
  });

  it('rejects duplicate plugin registration', async () => {
    const plugin = createMockPlugin('test-plugin');
    await system.register(plugin);
    const result = await system.register(plugin);
    expect(result.success).toBe(false);
    expect(result.error).toContain('already registered');
  });

  it('rejects plugin with missing dependency', async () => {
    const plugin = createMockPlugin('child', ['missing-parent']);
    const result = await system.register(plugin);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing dependency');
  });

  it('detects block category conflicts', async () => {
    const blockPlugin1: Plugin = {
      metadata: { id: 'bp1', name: 'Block Plugin 1', version: '1.0.0', author: 'Test', description: 'Test', category: 'block', minAppVersion: '1.0.0' },
      onLifecycle: vi.fn(),
    };
    const blockPlugin2: Plugin = {
      metadata: { id: 'bp2', name: 'Block Plugin 2', version: '1.0.0', author: 'Test', description: 'Test', category: 'block', minAppVersion: '1.0.0' },
      onLifecycle: vi.fn(),
    };
    await system.register(blockPlugin1);
    const result = await system.register(blockPlugin2);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Conflicts with');
  });

  it('allows plugin with satisfied dependency', async () => {
    const parent = createMockPlugin('parent');
    const child = createMockPlugin('child', ['parent']);
    await system.register(parent);
    const result = await system.register(child);
    expect(result.success).toBe(true);
  });

  it('calls init lifecycle on register', async () => {
    const plugin = createMockPlugin('test-plugin');
    await system.register(plugin);
    expect(plugin.onLifecycle).toHaveBeenCalledWith('init', expect.anything());
  });

  it('unregisters a plugin', async () => {
    const plugin = createMockPlugin('test-plugin');
    await system.register(plugin);
    const removed = await system.unregister('test-plugin');
    expect(removed).toBe(true);
    expect(system.getRegistered('test-plugin')).toBeUndefined();
  });

  it('calls destroy lifecycle on unregister', async () => {
    const plugin = createMockPlugin('test-plugin');
    await system.register(plugin);
    await system.unregister('test-plugin');
    expect(plugin.onLifecycle).toHaveBeenCalledWith('destroy', expect.anything());
  });

  it('returns false when unregistering unknown plugin', async () => {
    const removed = await system.unregister('nonexistent');
    expect(removed).toBe(false);
  });

  it('enables and disables plugins', async () => {
    const plugin = createMockPlugin('test-plugin');
    await system.register(plugin);
    expect(plugin.onLifecycle).not.toHaveBeenCalledWith('disable', expect.anything());

    await system.disable('test-plugin');
    expect(system.getEnabledPlugins()).toHaveLength(0);

    await system.enable('test-plugin');
    expect(system.getEnabledPlugins()).toHaveLength(1);
  });

  it('returns all plugins', async () => {
    await system.register(createMockPlugin('a'));
    await system.register(createMockPlugin('b'));
    expect(system.getAllPlugins()).toHaveLength(2);
  });

  it('calls init lifecycle even if plugin throws', async () => {
    const failingPlugin: Plugin = {
      metadata: {
        id: 'failing',
        name: 'Failing',
        version: '1.0.0',
        author: 'Test',
        description: 'Test',
        category: 'block',
        minAppVersion: '1.0.0',
      },
      onLifecycle: vi.fn().mockRejectedValue(new Error('Init failed')),
    };
    const result = await system.register(failingPlugin);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Init failed');
  });
});
