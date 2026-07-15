/**
 * Plugin System — KidCode Studio
 * Foundation for extensible plugin architecture
 */

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  category: 'block' | 'theme' | 'engine' | 'ui' | 'ai' | 'export';
  minAppVersion: string;
  maxAppVersion?: string;
  dependencies?: string[];
}

export interface PluginContext {
  registerBlock: (type: string, config: BlockConfig) => void;
  registerRenderer: (type: string, renderer: GameRenderer) => void;
  registerExporter: (format: string, exporter: Exporter) => void;
  getGameState: () => Record<string, unknown>;
  setGameState: (patch: Record<string, unknown>) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  storage: PluginStorage;
  ui: PluginUI;
}

export interface BlockConfig {
  label: string;
  color: string;
  category: string;
  params: Array<{ name: string; type: 'string' | 'number' | 'boolean'; default: unknown }>;
  execute: (params: Record<string, unknown>, ctx: PluginContext) => void;
}

export interface GameRenderer {
  render: (ctx: CanvasRenderingContext2D, state: Record<string, unknown>) => void;
  resize?: (w: number, h: number) => void;
  destroy?: () => void;
}

export interface Exporter {
  export: (project: Record<string, unknown>) => Blob | Promise<Blob>;
  extension: string;
  mimeType: string;
}

export interface PluginStorage {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export interface PluginUI {
  addPanel: (id: string, component: React.ComponentType) => void;
  removePanel: (id: string) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export type PluginLifecycle = 'init' | 'destroy' | 'enable' | 'disable';

export interface Plugin {
  metadata: PluginMetadata;
  onLifecycle: (event: PluginLifecycle, ctx: PluginContext) => void | Promise<void>;
  enabled?: boolean;
}

interface PluginEntry {
  plugin: Plugin;
  enabled: boolean;
  loaded: boolean;
}

export class PluginSystem {
  private plugins: Map<string, PluginEntry> = new Map();
  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private registeredBlocks: Map<string, BlockConfig> = new Map();
  private registeredRenderers: Map<string, GameRenderer> = new Map();
  private registeredExporters: Map<string, Exporter> = new Map();

  async register(plugin: Plugin): Promise<{ success: boolean; error?: string }> {
    const { id } = plugin.metadata;

    if (this.plugins.has(id)) {
      return { success: false, error: `Plugin "${id}" is already registered` };
    }

    const conflicts = this.detectConflicts(plugin);
    if (conflicts.length > 0) {
      return { success: false, error: `Conflicts with: ${conflicts.join(', ')}` };
    }

    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        const depEntry = this.plugins.get(dep);
        if (!depEntry || !depEntry.enabled) {
          return { success: false, error: `Missing dependency: "${dep}"` };
        }
      }
    }

    const entry: PluginEntry = { plugin, enabled: true, loaded: false };
    this.plugins.set(id, entry);

    try {
      const ctx = this.createContext(id);
      await plugin.onLifecycle('init', ctx);
      entry.loaded = true;
    } catch (err) {
      this.plugins.delete(id);
      return { success: false, error: `Init failed: ${(err as Error).message}` };
    }

    return { success: true };
  }

  async unregister(id: string): Promise<boolean> {
    const entry = this.plugins.get(id);
    if (!entry) return false;

    if (entry.loaded) {
      const ctx = this.createContext(id);
      await entry.plugin.onLifecycle('destroy', ctx);
    }

    this.plugins.delete(id);
    return true;
  }

  async enable(id: string): Promise<boolean> {
    const entry = this.plugins.get(id);
    if (!entry || entry.enabled) return false;

    entry.enabled = true;
    if (entry.loaded) {
      const ctx = this.createContext(id);
      await entry.plugin.onLifecycle('enable', ctx);
    }
    return true;
  }

  async disable(id: string): Promise<boolean> {
    const entry = this.plugins.get(id);
    if (!entry || !entry.enabled) return false;

    entry.enabled = false;
    if (entry.loaded) {
      const ctx = this.createContext(id);
      await entry.plugin.onLifecycle('disable', ctx);
    }
    return true;
  }

  getRegistered(id: string): Plugin | undefined {
    return this.plugins.get(id)?.plugin;
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(e => e.enabled && e.loaded)
      .map(e => e.plugin);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).map(e => e.plugin);
  }

  getRegisteredBlocks(): Map<string, BlockConfig> {
    return new Map(this.registeredBlocks);
  }

  getRegisteredRenderers(): Map<string, GameRenderer> {
    return new Map(this.registeredRenderers);
  }

  getRegisteredExporters(): Map<string, Exporter> {
    return new Map(this.registeredExporters);
  }

  detectConflicts(plugin: Plugin): string[] {
    const conflicts: string[] = [];
    for (const [, entry] of this.plugins) {
      if (entry.plugin.metadata.category === plugin.metadata.category &&
          entry.plugin.metadata.category === 'block') {
        conflicts.push(entry.plugin.metadata.name);
      }
    }
    return conflicts;
  }

  private createContext(pluginId: string): PluginContext {
    return {
      registerBlock: (type, config) => {
        this.registeredBlocks.set(type, config);
      },
      registerRenderer: (type, renderer) => {
        this.registeredRenderers.set(type, renderer);
      },
      registerExporter: (format, exporter) => {
        this.registeredExporters.set(format, exporter);
      },
      getGameState: () => ({}),
      setGameState: () => {},
      on: (event, handler) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
      },
      off: (event, handler) => {
        this.eventHandlers.get(event)?.delete(handler);
      },
      emit: (event, ...args) => {
        this.eventHandlers.get(event)?.forEach(h => h(...args));
      },
      storage: {
        get: (key) => {
          try {
            const raw = localStorage.getItem(`plugin_${pluginId}_${key}`);
            return raw ? JSON.parse(raw) : null;
          } catch { return null; }
        },
        set: (key, value) => {
          localStorage.setItem(`plugin_${pluginId}_${key}`, JSON.stringify(value));
        },
        remove: (key) => {
          localStorage.removeItem(`plugin_${pluginId}_${key}`);
        },
        clear: () => {
          const prefix = `plugin_${pluginId}_`;
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k?.startsWith(prefix)) localStorage.removeItem(k);
          }
        },
      },
      ui: {
        addPanel: () => {},
        removePanel: () => {},
        showToast: () => {},
      },
    };
  }
}

export const pluginSystem = new PluginSystem();
