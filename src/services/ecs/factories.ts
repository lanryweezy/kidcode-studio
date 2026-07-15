import { ECSWorld } from './world';

export function createPlayer(world: ECSWorld, x: number, y: number): string {
  const id = world.createEntity(['player']);
  world.position.set(id, { x, y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  world.velocity.set(id, { vx: 0, vy: 0, vz: 0 });
  world.physics.set(id, { gravity: true, gravityForce: 1, jumpForce: 15, isJumping: false, canDoubleJump: false, restitution: 0.8, friction: 0.1, mass: 1 });
  world.sprite.set(id, { emoji: '🧑', texture: null, scale: 1, opacity: 1, frames: [], animations: {}, currentAnimation: null, animationSpeed: 5 });
  world.health.set(id, { current: 100, max: 100 });
  world.input.set(id, { controlled: true });
  return id;
}

export function createEnemy(world: ECSWorld, x: number, y: number, emoji: string, behavior: 'patrol' | 'chase' = 'chase'): string {
  const id = world.createEntity(['enemy']);
  world.position.set(id, { x, y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  world.velocity.set(id, { vx: 0, vy: 0, vz: 0 });
  world.sprite.set(id, { emoji, texture: null, scale: 1, opacity: 1, frames: [], animations: {}, currentAnimation: null, animationSpeed: 5 });
  world.health.set(id, { current: 50, max: 50 });
  world.ai.set(id, { behavior, range: 100, initialX: x, speed: 1 });
  return id;
}

export function createItem(world: ECSWorld, x: number, y: number, emoji: string): string {
  const id = world.createEntity(['item']);
  world.position.set(id, { x, y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  world.sprite.set(id, { emoji, texture: null, scale: 1, opacity: 1, frames: [], animations: {}, currentAnimation: null, animationSpeed: 5 });
  return id;
}

export function createProjectile(world: ECSWorld, x: number, y: number, vx: number, vy: number, emoji: string): string {
  const id = world.createEntity(['projectile']);
  world.position.set(id, { x, y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  world.velocity.set(id, { vx, vy, vz: 0 });
  world.sprite.set(id, { emoji, texture: null, scale: 0.5, opacity: 1, frames: [], animations: {}, currentAnimation: null, animationSpeed: 5 });
  return id;
}
