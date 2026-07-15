/**
 * ECS World — Manages entities, components, and systems.
 * 
 * The World is the central data store for the game engine.
 * Entities are IDs. Components are stored in typed maps.
 * Systems iterate over entities with specific component sets.
 * 
 * Design:
 * - Entity = string ID
 * - Component = typed data attached to entity
 * - System = function that processes entities with specific components
 * - World = container for all entities and components
 */

import {
  Entity,
  PositionComponent,
  VelocityComponent,
  PhysicsComponent,
  SpriteComponent,
  HealthComponent,
  AIComponent,
  InputComponent,
  CameraComponent,
  InventoryComponent,
  DialogueComponent,
  AudioComponent,
  PowerupComponent,
  CheckpointComponent,
  CutsceneComponent,
  WeatherComponent,
  WorldComponent,
  EffectsComponent,
} from './components';
import { SpriteState, InventoryItem, DialogueNode, Checkpoint } from '../../types';

// === Component Store ===

export class ComponentStore<T> {
  private data: Map<string, T> = new Map();

  get(entityId: string): T | undefined {
    return this.data.get(entityId);
  }

  set(entityId: string, component: T): void {
    this.data.set(entityId, component);
  }

  has(entityId: string): boolean {
    return this.data.has(entityId);
  }

  delete(entityId: string): boolean {
    return this.data.delete(entityId);
  }

  all(): Map<string, T> {
    return this.data;
  }

  values(): T[] {
    return Array.from(this.data.values());
  }

  entries(): [string, T][] {
    return Array.from(this.data.entries());
  }
}

// === Entity Query ===

export class EntityQuery {
  private world: ECSWorld;
  private requiredComponents: ComponentStore<any>[] = [];
  private excludedComponents: ComponentStore<any>[] = [];

  constructor(world: ECSWorld) {
    this.world = world;
  }

  with(...stores: ComponentStore<any>[]): this {
    this.requiredComponents.push(...stores);
    return this;
  }

  without(...stores: ComponentStore<any>[]): this {
    this.excludedComponents.push(...stores);
    return this;
  }

  execute(): string[] {
    return this.world.getEntitiesWithComponents(...this.requiredComponents)
      .filter(id => !this.excludedComponents.some(s => s.has(id)));
  }
}

// === World ===

export class ECSWorld {
  // Entity registry
  private entities: Map<string, Entity> = new Map();
  private nextId = 1;

  // Component stores
  readonly position = new ComponentStore<PositionComponent>();
  readonly velocity = new ComponentStore<VelocityComponent>();
  readonly physics = new ComponentStore<PhysicsComponent>();
  readonly sprite = new ComponentStore<SpriteComponent>();
  readonly health = new ComponentStore<HealthComponent>();
  readonly ai = new ComponentStore<AIComponent>();
  readonly input = new ComponentStore<InputComponent>();
  readonly camera = new ComponentStore<CameraComponent>();
  readonly inventory = new ComponentStore<InventoryComponent>();
  readonly dialogue = new ComponentStore<DialogueComponent>();
  readonly audio = new ComponentStore<AudioComponent>();
  readonly powerup = new ComponentStore<PowerupComponent>();
  readonly checkpoint = new ComponentStore<CheckpointComponent>();
  readonly cutscene = new ComponentStore<CutsceneComponent>();
  readonly weather = new ComponentStore<WeatherComponent>();
  readonly world = new ComponentStore<WorldComponent>();
  readonly effects = new ComponentStore<EffectsComponent>();

  // === Entity Management ===

  createEntity(tags: string[] = []): string {
    const id = `entity_${this.nextId++}`;
    const entity: Entity = { id, tags: new Set(tags) };
    this.entities.set(id, entity);
    return id;
  }

  destroyEntity(id: string): void {
    this.entities.delete(id);
    // Remove all components
    this.position.delete(id);
    this.velocity.delete(id);
    this.physics.delete(id);
    this.sprite.delete(id);
    this.health.delete(id);
    this.ai.delete(id);
    this.input.delete(id);
    this.camera.delete(id);
    this.inventory.delete(id);
    this.dialogue.delete(id);
    this.audio.delete(id);
    this.powerup.delete(id);
    this.checkpoint.delete(id);
    this.cutscene.delete(id);
    this.weather.delete(id);
    this.world.delete(id);
    this.effects.delete(id);
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  hasEntity(id: string): boolean {
    return this.entities.has(id);
  }

  getEntitiesWithTag(tag: string): string[] {
    const result: string[] = [];
    this.entities.forEach((entity, id) => {
      if (entity.tags.has(tag)) result.push(id);
    });
    return result;
  }

  getEntitiesWithComponents(...componentStores: ComponentStore<any>[]): string[] {
    const result: string[] = [];
    this.entities.forEach((entity, id) => {
      if (componentStores.every(store => store.has(id))) {
        result.push(id);
      }
    });
    return result;
  }

  // === Query Helpers ===

  /** Get all entities that have both position and velocity */
  getPhysicsEntities(): string[] {
    return this.getEntitiesWithComponents(this.position, this.velocity);
  }

  /** Get all entities that have position and sprite */
  getRenderableEntities(): string[] {
    return this.getEntitiesWithComponents(this.position, this.sprite);
  }

  /** Get the player entity (has input component) */
  getPlayerEntity(): string | undefined {
    const players = this.getEntitiesWithComponents(this.input);
    return players[0];
  }

  /** Get all enemy entities (have AI component) */
  getEnemyEntities(): string[] {
    return this.getEntitiesWithComponents(this.ai);
  }

  /** Get all entities within a radius of a point */
  getEntitiesNear(x: number, y: number, radius: number): string[] {
    const result: string[] = [];
    this.position.entries().forEach(([id, pos]) => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (dx * dx + dy * dy <= radius * radius) {
        result.push(id);
      }
    });
    return result;
  }

  // === Query Builder ===

  query(): EntityQuery {
    return new EntityQuery(this);
  }

  // === Serialization ===

  /** Convert world to a plain object for serialization */
  serialize(): Record<string, any> {
    return {
      entities: Array.from(this.entities.values()).map(e => ({
        id: e.id,
        tags: Array.from(e.tags),
      })),
      components: {
        position: Object.fromEntries(this.position.entries()),
        velocity: Object.fromEntries(this.velocity.entries()),
        physics: Object.fromEntries(this.physics.entries()),
        sprite: Object.fromEntries(this.sprite.entries()),
        health: Object.fromEntries(this.health.entries()),
        ai: Object.fromEntries(this.ai.entries()),
        input: Object.fromEntries(this.input.entries()),
        inventory: Object.fromEntries(this.inventory.entries()),
        weather: Object.fromEntries(this.weather.entries()),
        world: Object.fromEntries(this.world.entries()),
      },
    };
  }
}
