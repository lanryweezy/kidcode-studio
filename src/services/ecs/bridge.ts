/**
 * ECS ↔ SpriteState Bridge
 * 
 * Converts between the old SpriteState god object and the new ECS World.
 * This enables gradual migration: existing code uses SpriteState, new code uses ECS.
 * 
 * Usage:
 *   const world = new ECSWorld();
 *   importSpriteStateToWorld(world, spriteState); // Old → ECS
 *   exportWorldToSpriteState(world, spriteState); // ECS → Old
 */

import { ECSWorld } from './world';
import { SpriteState, InventoryItem, GameEntity } from '../../types';

/**
 * Import a SpriteState into the ECS World.
 * Creates entities for the player, enemies, items, and projectiles.
 */
export function importSpriteStateToWorld(world: ECSWorld, state: SpriteState): void {
  // Create player entity
  const playerId = world.createEntity(['player']);
  world.position.set(playerId, {
    x: state.x,
    y: state.y,
    z: state.z,
    rotation: state.rotation,
    scaleX: state.scaleX ?? 1,
    scaleY: state.scaleY ?? 1,
  });
  world.velocity.set(playerId, { vx: state.vx, vy: state.vy, vz: state.vz });
  world.physics.set(playerId, {
    gravity: state.gravity,
    gravityForce: state.gravityForce,
    jumpForce: state.jumpForce,
    isJumping: state.isJumping,
    canDoubleJump: state.canDoubleJump,
    restitution: state.restitution ?? 0.8,
    friction: state.friction ?? 0.1,
    mass: 1,
  });
  world.sprite.set(playerId, {
    emoji: state.emoji,
    texture: state.texture,
    scale: state.scale,
    opacity: state.opacity,
    frames: state.frames,
    animations: state.animations,
    currentAnimation: state.currentAnimation,
    animationSpeed: state.animationSpeed,
  });
  world.health.set(playerId, { current: state.health, max: state.maxHealth });
  world.input.set(playerId, { controlled: true });
  world.inventory.set(playerId, {
    items: [...state.inventory],
    maxItems: state.maxInventorySize,
    equippedItem: state.equippedItem,
  });

  // Create enemy entities
  state.enemies.forEach(enemy => {
    const id = world.createEntity(['enemy']);
    world.position.set(id, { x: enemy.x, y: enemy.y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    world.velocity.set(id, { vx: enemy.vx ?? 0, vy: enemy.vy ?? 0, vz: 0 });
    world.sprite.set(id, {
      emoji: enemy.emoji ?? '👾',
      texture: null,
      scale: 1,
      opacity: 1,
      frames: [],
      animations: {},
      currentAnimation: null,
      animationSpeed: 5,
    });
    if (enemy.behavior) {
      world.ai.set(id, {
        behavior: enemy.behavior,
        range: enemy.range ?? 100,
        initialX: enemy.initialX ?? enemy.x,
        speed: enemy.vx ?? 1,
      });
    }
  });

  // Create item entities
  state.items.forEach(item => {
    const id = world.createEntity(['item']);
    world.position.set(id, { x: item.x, y: item.y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    world.sprite.set(id, {
      emoji: item.emoji ?? '💎',
      texture: null,
      scale: 1,
      opacity: 1,
      frames: [],
      animations: {},
      currentAnimation: null,
      animationSpeed: 5,
    });
  });

  // Create projectile entities
  state.projectiles.forEach(proj => {
    const id = world.createEntity(['projectile']);
    world.position.set(id, { x: proj.x, y: proj.y, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    world.velocity.set(id, { vx: proj.vx ?? 0, vy: proj.vy ?? 0, vz: 0 });
    world.sprite.set(id, {
      emoji: proj.emoji ?? '⚡',
      texture: null,
      scale: 1,
      opacity: 1,
      frames: [],
      animations: {},
      currentAnimation: null,
      animationSpeed: 5,
    });
  });
}

/**
 * Export the ECS World back to a SpriteState.
 * This is a one-way sync (ECS → SpriteState) for backward compatibility.
 */
export function exportWorldToSpriteState(world: ECSWorld, state: SpriteState): void {
  // Find player
  const players = world.getEntitiesWithComponents(world.input, world.position);
  if (players.length > 0) {
    const playerId = players[0];
    const pos = world.position.get(playerId)!;
    const vel = world.velocity.get(playerId);
    const phys = world.physics.get(playerId);
    const spr = world.sprite.get(playerId);
    const hp = world.health.get(playerId);
    const inv = world.inventory.get(playerId);

    state.x = pos.x;
    state.y = pos.y;
    state.z = pos.z;
    state.rotation = pos.rotation;
    if (vel) { state.vx = vel.vx; state.vy = vel.vy; state.vz = vel.vz; }
    if (phys) {
      state.gravity = phys.gravity;
      state.isJumping = phys.isJumping;
      state.restitution = phys.restitution;
      state.friction = phys.friction;
    }
    if (spr) {
      state.emoji = spr.emoji;
      state.scale = spr.scale;
      state.opacity = spr.opacity;
    }
    if (hp) {
      state.health = hp.current;
      state.maxHealth = hp.max;
    }
    if (inv) {
      state.inventory = [...inv.items];
    }
  }

  // Export enemies
  const enemyIds = world.getEntitiesWithTag('enemy');
  state.enemies = enemyIds.map(id => {
    const pos = world.position.get(id);
    const vel = world.velocity.get(id);
    const spr = world.sprite.get(id);
    const aiComp = world.ai.get(id);
    return {
      id,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      vx: vel?.vx ?? 0,
      vy: vel?.vy ?? 0,
      emoji: spr?.emoji ?? '👾',
      type: 'enemy' as const,
      behavior: aiComp?.behavior,
      range: aiComp?.range,
      initialX: aiComp?.initialX,
    };
  });

  // Export items
  const itemIds = world.getEntitiesWithTag('item');
  state.items = itemIds.map(id => {
    const pos = world.position.get(id);
    const spr = world.sprite.get(id);
    return {
      id,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      emoji: spr?.emoji ?? '💎',
      type: 'item' as const,
    };
  });

  // Export projectiles
  const projIds = world.getEntitiesWithTag('projectile');
  state.projectiles = projIds.map(id => {
    const pos = world.position.get(id);
    const vel = world.velocity.get(id);
    const spr = world.sprite.get(id);
    return {
      id,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      vx: vel?.vx ?? 0,
      vy: vel?.vy ?? 0,
      emoji: spr?.emoji ?? '⚡',
      type: 'projectile' as const,
    };
  });
}
