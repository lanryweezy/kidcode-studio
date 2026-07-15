import { describe, it, expect } from 'vitest';
import { ECSWorld } from '../world';
import { importSpriteStateToWorld, exportWorldToSpriteState } from '../bridge';
import { INITIAL_SPRITE_STATE } from '../../../constants';

describe('ECS World', () => {
  describe('entity management', () => {
    it('creates an entity with an ID', () => {
      const world = new ECSWorld();
      const id = world.createEntity();
      expect(id).toBeTruthy();
      expect(world.hasEntity(id)).toBe(true);
    });

    it('creates entities with tags', () => {
      const world = new ECSWorld();
      const id = world.createEntity(['player', 'hero']);
      const entity = world.getEntity(id);
      expect(entity?.tags.has('player')).toBe(true);
      expect(entity?.tags.has('hero')).toBe(true);
    });

    it('destroys an entity and its components', () => {
      const world = new ECSWorld();
      const id = world.createEntity();
      world.position.set(id, { x: 100, y: 200, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      world.destroyEntity(id);
      expect(world.hasEntity(id)).toBe(false);
      expect(world.position.has(id)).toBe(false);
    });

    it('gets entities by tag', () => {
      const world = new ECSWorld();
      world.createEntity(['enemy']);
      world.createEntity(['enemy']);
      world.createEntity(['item']);
      const enemies = world.getEntitiesWithTag('enemy');
      expect(enemies).toHaveLength(2);
    });

    it('gets entities with specific components', () => {
      const world = new ECSWorld();
      const id1 = world.createEntity();
      const id2 = world.createEntity();
      world.position.set(id1, { x: 0, y: 0, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      world.velocity.set(id1, { vx: 5, vy: 0, vz: 0 });
      world.position.set(id2, { x: 10, y: 10, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      // id2 has no velocity
      const physicsEntities = world.getPhysicsEntities();
      expect(physicsEntities).toEqual([id1]);
    });

    it('gets entities near a point', () => {
      const world = new ECSWorld();
      const id1 = world.createEntity();
      const id2 = world.createEntity();
      world.position.set(id1, { x: 100, y: 100, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      world.position.set(id2, { x: 500, y: 500, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      const near = world.getEntitiesNear(110, 110, 50);
      expect(near).toEqual([id1]);
    });
  });

  describe('component operations', () => {
    it('sets and gets components', () => {
      const world = new ECSWorld();
      const id = world.createEntity();
      world.position.set(id, { x: 42, y: 99, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      const pos = world.position.get(id);
      expect(pos?.x).toBe(42);
      expect(pos?.y).toBe(99);
    });

    it('checks component existence', () => {
      const world = new ECSWorld();
      const id = world.createEntity();
      expect(world.position.has(id)).toBe(false);
      world.position.set(id, { x: 0, y: 0, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      expect(world.position.has(id)).toBe(true);
    });

    it('deletes components', () => {
      const world = new ECSWorld();
      const id = world.createEntity();
      world.position.set(id, { x: 0, y: 0, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      world.position.delete(id);
      expect(world.position.has(id)).toBe(false);
    });
  });

  describe('query helpers', () => {
    it('getPlayerEntity returns entity with input component', () => {
      const world = new ECSWorld();
      const id = world.createEntity(['player']);
      world.input.set(id, { controlled: true });
      expect(world.getPlayerEntity()).toBe(id);
    });

    it('getEnemyEntities returns entities with AI component', () => {
      const world = new ECSWorld();
      const id1 = world.createEntity(['enemy']);
      const id2 = world.createEntity(['enemy']);
      world.ai.set(id1, { behavior: 'chase', range: 100, initialX: 0, speed: 2 });
      world.ai.set(id2, { behavior: 'patrol', range: 50, initialX: 100, speed: 1 });
      const enemies = world.getEnemyEntities();
      expect(enemies).toHaveLength(2);
    });
  });

  describe('serialization', () => {
    it('serializes to plain object', () => {
      const world = new ECSWorld();
      const id = world.createEntity(['player']);
      world.position.set(id, { x: 100, y: 200, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      world.velocity.set(id, { vx: 5, vy: 0, vz: 0 });
      const data = world.serialize();
      expect(data.entities).toHaveLength(1);
      expect(data.components.position[id]).toEqual({ x: 100, y: 200, z: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    });
  });
});

describe('ECS ↔ SpriteState Bridge', () => {
  it('imports SpriteState into ECS world', () => {
    const world = new ECSWorld();
    const state = { ...INITIAL_SPRITE_STATE, x: 100, y: 200, enemies: [], items: [], projectiles: [] };
    importSpriteStateToWorld(world, state);

    const players = world.getEntitiesWithComponents(world.input, world.position);
    expect(players).toHaveLength(1);
    const pos = world.position.get(players[0]);
    expect(pos?.x).toBe(100);
    expect(pos?.y).toBe(200);
  });

  it('imports enemies from SpriteState', () => {
    const world = new ECSWorld();
    const state = {
      ...INITIAL_SPRITE_STATE,
      enemies: [
        { id: 'e1', x: 300, y: 400, type: 'enemy' as const, emoji: '👾', behavior: 'chase' as const, vx: 2 },
        { id: 'e2', x: 500, y: 100, type: 'enemy' as const, emoji: '🦇', behavior: 'patrol' as const, vx: 1, range: 80, initialX: 500 },
      ],
      items: [],
      projectiles: [],
    };
    importSpriteStateToWorld(world, state);

    const enemies = world.getEnemyEntities();
    expect(enemies).toHaveLength(2);
    const ai = world.ai.get(enemies[0]);
    expect(ai?.behavior).toBe('chase');
  });

  it('exports ECS world back to SpriteState', () => {
    const world = new ECSWorld();
    const state = { ...INITIAL_SPRITE_STATE, x: 100, y: 200, enemies: [], items: [], projectiles: [] };
    importSpriteStateToWorld(world, state);

    // Modify in ECS
    const playerId = world.getPlayerEntity()!;
    const pos = world.position.get(playerId)!;
    pos.x = 500;
    pos.y = 600;

    // Export back
    const newState = { ...INITIAL_SPRITE_STATE, x: 0, y: 0, enemies: [], items: [], projectiles: [] };
    exportWorldToSpriteState(world, newState);

    expect(newState.x).toBe(500);
    expect(newState.y).toBe(600);
  });

  it('round-trips player position', () => {
    const world = new ECSWorld();
    const state = { ...INITIAL_SPRITE_STATE, x: 100, y: 200, enemies: [], items: [], projectiles: [] };
    importSpriteStateToWorld(world, state);

    const outState = { ...INITIAL_SPRITE_STATE, x: 0, y: 0, enemies: [], items: [], projectiles: [] };
    exportWorldToSpriteState(world, outState);

    expect(outState.x).toBe(state.x);
    expect(outState.y).toBe(state.y);
  });
});
