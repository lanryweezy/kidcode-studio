/**
 * Component/Instance System
 * Ported from Kreathief: create reusable game object templates.
 * A "Goblin" component can be instanced 50 times, all sharing the same definition.
 */

export interface GameObjectComponent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'character' | 'enemy' | 'item' | 'environment' | 'projectile' | 'ui';
  // Template properties
  template: {
    sprite: string;
    width: number;
    height: number;
    health: number;
    damage: number;
    speed: number;
    behavior: string;
    physics: 'static' | 'dynamic' | 'kinematic';
    collision: boolean;
    gravity: boolean;
  };
  // Custom properties defined by user
  properties: ComponentProperty[];
  // Tags for filtering
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ComponentProperty {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'select' | 'emoji';
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  name: string;
  x: number;
  y: number;
  overrides: Record<string, any>; // Instance-specific overrides
  createdAt: number;
}

// Built-in components
export const BUILTIN_COMPONENTS: GameObjectComponent[] = [
  {
    id: 'comp_goblin', name: 'Goblin', emoji: '👺', description: 'Basic melee enemy',
    category: 'enemy',
    template: { sprite: '👺', width: 32, height: 32, health: 20, damage: 5, speed: 1.5, behavior: 'chase', physics: 'dynamic', collision: true, gravity: false },
    properties: [
      { key: 'aggression', label: 'Aggression', type: 'number', default: 0.5, min: 0, max: 1, step: 0.1, description: 'How aggressively it chases' },
      { key: 'patrolRange', label: 'Patrol Range', type: 'number', default: 100, min: 0, max: 500, step: 10 },
    ],
    tags: ['melee', 'basic', 'forest'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_skeleton', name: 'Skeleton', emoji: '💀', description: 'Ranged enemy',
    category: 'enemy',
    template: { sprite: '💀', width: 32, height: 32, health: 15, damage: 8, speed: 1, behavior: 'shoot', physics: 'dynamic', collision: true, gravity: false },
    properties: [
      { key: 'fireRate', label: 'Fire Rate', type: 'number', default: 2, min: 0.5, max: 5, step: 0.5, description: 'Seconds between shots' },
      { key: 'projectileSpeed', label: 'Projectile Speed', type: 'number', default: 5, min: 1, max: 15, step: 1 },
    ],
    tags: ['ranged', 'undead', 'dungeon'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_slime', name: 'Slime', emoji: '🟢', description: 'Bouncy patrol enemy',
    category: 'enemy',
    template: { sprite: '🟢', width: 24, height: 24, health: 10, damage: 3, speed: 0.8, behavior: 'patrol', physics: 'dynamic', collision: true, gravity: true },
    properties: [
      { key: 'bounceForce', label: 'Bounce Force', type: 'number', default: 5, min: 1, max: 15, step: 1 },
      { key: 'color', label: 'Color', type: 'color', default: '#22c55e' },
    ],
    tags: ['patrol', 'basic', 'cute'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_coin', name: 'Gold Coin', emoji: '🪙', description: 'Collectible currency',
    category: 'item',
    template: { sprite: '🪙', width: 20, height: 20, health: 1, damage: 0, speed: 0, behavior: 'collectible', physics: 'static', collision: true, gravity: false },
    properties: [
      { key: 'value', label: 'Value', type: 'number', default: 10, min: 1, max: 1000, step: 1 },
      { key: 'magnetRange', label: 'Magnet Range', type: 'number', default: 0, min: 0, max: 200, step: 10 },
    ],
    tags: ['collectible', 'currency'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_heart', name: 'Health Heart', emoji: '❤️', description: 'Restores health',
    category: 'item',
    template: { sprite: '❤️', width: 20, height: 20, health: 1, damage: 0, speed: 0, behavior: 'collectible', physics: 'static', collision: true, gravity: false },
    properties: [
      { key: 'healAmount', label: 'Heal Amount', type: 'number', default: 25, min: 1, max: 100, step: 5 },
    ],
    tags: ['collectible', 'health'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_chest', name: 'Treasure Chest', emoji: '📦', description: 'Contains random loot',
    category: 'item',
    template: { sprite: '📦', width: 32, height: 32, health: 1, damage: 0, speed: 0, behavior: 'container', physics: 'static', collision: true, gravity: false },
    properties: [
      { key: 'lootType', label: 'Loot Type', type: 'select', default: 'random', options: ['random', 'coins', 'health', 'weapon', 'key'] },
      { key: 'locked', label: 'Locked', type: 'boolean', default: false },
    ],
    tags: ['container', 'loot'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_spike', name: 'Spike Trap', emoji: '🔺', description: 'Damages on contact',
    category: 'environment',
    template: { sprite: '🔺', width: 32, height: 16, health: 999, damage: 15, speed: 0, behavior: 'hazard', physics: 'static', collision: true, gravity: false },
    properties: [
      { key: 'damage', label: 'Damage', type: 'number', default: 15, min: 1, max: 100, step: 1 },
      { key: 'active', label: 'Active', type: 'boolean', default: true },
    ],
    tags: ['hazard', 'trap'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'comp_player', name: 'Player Character', emoji: '🧑', description: 'The player-controlled character',
    category: 'character',
    template: { sprite: '🧑', width: 32, height: 32, health: 100, damage: 10, speed: 3, behavior: 'player', physics: 'dynamic', collision: true, gravity: true },
    properties: [
      { key: 'jumpForce', label: 'Jump Force', type: 'number', default: 10, min: 1, max: 25, step: 1 },
      { key: 'doubleJump', label: 'Double Jump', type: 'boolean', default: false },
      { key: 'dash', label: 'Dash Ability', type: 'boolean', default: false },
    ],
    tags: ['player', 'character'],
    createdAt: Date.now(), updatedAt: Date.now(),
  },
];

export class ComponentRegistry {
  private components: Map<string, GameObjectComponent> = new Map();
  private instances: Map<string, ComponentInstance> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    BUILTIN_COMPONENTS.forEach(c => this.components.set(c.id, c));
    this.loadCustom();
  }

  // === Component Management ===

  getComponent(id: string): GameObjectComponent | undefined {
    return this.components.get(id);
  }

  getAllComponents(): GameObjectComponent[] {
    return Array.from(this.components.values());
  }

  getComponentsByCategory(category: string): GameObjectComponent[] {
    return this.getAllComponents().filter(c => c.category === category);
  }

  searchComponents(query: string): GameObjectComponent[] {
    const lower = query.toLowerCase();
    return this.getAllComponents().filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower) ||
      c.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  createComponent(definition: Omit<GameObjectComponent, 'id' | 'createdAt' | 'updatedAt'>): GameObjectComponent {
    const component: GameObjectComponent = {
      ...definition,
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.components.set(component.id, component);
    this.saveCustom();
    this.notify();
    return component;
  }

  updateComponent(id: string, updates: Partial<GameObjectComponent>): boolean {
    const component = this.components.get(id);
    if (!component) return false;
    Object.assign(component, updates, { updatedAt: Date.now() });
    this.saveCustom();
    this.notify();
    return true;
  }

  deleteComponent(id: string): boolean {
    if (BUILTIN_COMPONENTS.some(c => c.id === id)) return false; // Can't delete builtins
    this.components.delete(id);
    // Remove all instances
    this.instances.forEach((inst, instId) => {
      if (inst.componentId === id) this.instances.delete(instId);
    });
    this.saveCustom();
    this.notify();
    return true;
  }

  duplicateComponent(id: string, newName?: string): GameObjectComponent | null {
    const original = this.components.get(id);
    if (!original) return null;
    return this.createComponent({
      ...original,
      name: newName || `${original.name} (Copy)`,
      template: { ...original.template },
      properties: [...original.properties],
      tags: [...original.tags],
    } as any);
  }

  // === Instance Management ===

  createInstance(componentId: string, x: number, y: number, overrides: Record<string, any> = {}): ComponentInstance | null {
    const component = this.components.get(componentId);
    if (!component) return null;
    const instance: ComponentInstance = {
      id: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      componentId,
      name: component.name,
      x, y,
      overrides,
      createdAt: Date.now(),
    };
    this.instances.set(instance.id, instance);
    this.notify();
    return instance;
  }

  getInstance(id: string): ComponentInstance | undefined {
    return this.instances.get(id);
  }

  getAllInstances(): ComponentInstance[] {
    return Array.from(this.instances.values());
  }

  getInstancesOfComponent(componentId: string): ComponentInstance[] {
    return this.getAllInstances().filter(i => i.componentId === componentId);
  }

  updateInstance(id: string, updates: Partial<ComponentInstance>): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;
    Object.assign(instance, updates);
    this.notify();
    return true;
  }

  deleteInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  // Get resolved properties (template + overrides)
  getResolvedProperties(instanceId: string): Record<string, any> | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;
    const component = this.components.get(instance.componentId);
    if (!component) return null;

    const resolved: Record<string, any> = { ...component.template };
    component.properties.forEach(prop => {
      resolved[prop.key] = instance.overrides[prop.key] ?? prop.default;
    });
    return resolved;
  }

  // === Persistence ===

  private saveCustom() {
    try {
      const custom = this.getAllComponents().filter(c => !BUILTIN_COMPONENTS.some(b => b.id === c.id));
      localStorage.setItem('kidcode_components', JSON.stringify(custom));
    } catch { /* localStorage unavailable — best-effort persistence */ }
  }

  private loadCustom() {
    try {
      const data = localStorage.getItem('kidcode_components');
      if (data) {
        const custom = JSON.parse(data);
        custom.forEach((c: GameObjectComponent) => this.components.set(c.id, c));
      }
    } catch { /* localStorage unavailable — fall back to builtins */ }
  }

  // === Events ===

  onChanges(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}

let instance: ComponentRegistry | null = null;

export function getComponentRegistry(): ComponentRegistry {
  if (!instance) instance = new ComponentRegistry();
  return instance;
}
