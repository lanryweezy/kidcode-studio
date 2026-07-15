import { ECSWorld } from './world';

export interface System {
  name: string;
  priority: number;
  update(world: ECSWorld, dt: number): void;
}

export class SystemManager {
  private systems: System[] = [];

  register(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  unregister(name: string): void {
    this.systems = this.systems.filter(s => s.name !== name);
  }

  update(world: ECSWorld, dt: number): void {
    for (const system of this.systems) {
      system.update(world, dt);
    }
  }
}

export const PhysicsSystem: System = {
  name: 'physics',
  priority: 0,
  update(world: ECSWorld, dt: number) {
    const entities = world.getPhysicsEntities();
    for (const id of entities) {
      const pos = world.position.get(id)!;
      const vel = world.velocity.get(id)!;
      const phys = world.physics.get(id);

      if (phys?.gravity) {
        vel.vy += 9.8 * dt;
      }

      pos.x += vel.vx * dt;
      pos.y += vel.vy * dt;
      pos.z += vel.vz * dt;
    }
  }
};

export const GravitySystem: System = {
  name: 'gravity',
  priority: -1,
  update(world: ECSWorld, dt: number) {
    const entities = world.getEntitiesWithComponents(world.velocity, world.physics);
    for (const id of entities) {
      const phys = world.physics.get(id)!;
      const vel = world.velocity.get(id)!;
      if (phys.gravity) {
        vel.vy += phys.gravityForce * 9.8 * dt;
      }
    }
  }
};
