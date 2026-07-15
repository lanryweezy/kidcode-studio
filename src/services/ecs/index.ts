/**
 * ECS Module — Entity Component System for KidCode Studio
 * 
 * Provides typed components, entity management, and a bridge from SpriteState.
 * 
 * Usage:
 *   import { ECSWorld } from './ecs';
 *   const world = new ECSWorld();
 *   const playerId = world.createEntity(['player']);
 *   world.position.set(playerId, { x: 100, y: 200, ... });
 */

export { ECSWorld, ComponentStore, EntityQuery } from './world';
export { createPlayer, createEnemy, createItem, createProjectile } from './factories';
export { importSpriteStateToWorld, exportWorldToSpriteState } from './bridge';
export { SystemManager, PhysicsSystem, GravitySystem } from './systems';
export type { System } from './systems';
export type {
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
  ParticleEffect,
} from './components';
