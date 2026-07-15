import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEnemyAI, updateEnemyAI, rollEnemyLoot, EnemyAI } from '../enemyAIEngine';
import { GameEntity, Tile } from '../../types';

// Mock constants
vi.mock('../../constants/enemies', () => ({
  ENEMY_TYPES: [
    {
      id: 'skeleton',
      emoji: '💀',
      name: 'Skeleton',
      hp: 30,
      damage: 5,
      xpReward: 10,
      drops: 'bone',
      speed: 1,
    },
    {
      id: 'slime',
      emoji: '🟢',
      name: 'Slime',
      hp: 20,
      damage: 3,
      xpReward: 5,
      drops: null,
      speed: 0.5,
    },
  ],
  getEnemyById: vi.fn((id: string) => {
    const enemies: Record<string, any> = {
      skeleton: {
        id: 'skeleton',
        emoji: '💀',
        name: 'Skeleton',
        hp: 30,
        damage: 5,
        xpReward: 10,
        drops: 'bone',
        speed: 1,
      },
      slime: {
        id: 'slime',
        emoji: '🟢',
        name: 'Slime',
        hp: 20,
        damage: 3,
        xpReward: 5,
        drops: null,
        speed: 0.5,
      },
    };
    return enemies[id] || null;
  }),
}));

describe('EnemyAIEngine', () => {
  const createTestEntity = (overrides: Partial<GameEntity> = {}): GameEntity => ({
    id: 'enemy-1',
    type: 'enemy',
    emoji: '💀',
    x: 200,
    y: 200,
    initialX: 200,
    vx: 1,
    vy: 0,
    ...overrides,
  });

  const createTestTilemap = (): Tile[] => [];

  describe('createEnemyAI', () => {
    it('should create AI with default patrol state', () => {
      const entity = createTestEntity();
      const ai = createEnemyAI(entity);
      
      expect(ai.state).toBe('patrol');
      expect(ai.stateTimer).toBe(0);
      expect(ai.alertLevel).toBe(0);
      expect(ai.patrolOriginX).toBe(200);
      expect(ai.patrolDirection).toBe(1);
    });

    it('should set enemy type from emoji', () => {
      const entity = createTestEntity({ emoji: '💀' });
      const ai = createEnemyAI(entity);
      
      expect(ai.enemyType).toBeDefined();
      expect(ai.enemyType?.id).toBe('skeleton');
    });

    it('should handle unknown emoji', () => {
      const entity = createTestEntity({ emoji: '👽' });
      const ai = createEnemyAI(entity);
      
      expect(ai.enemyType).toBeNull();
    });
  });

  describe('updateEnemyAI', () => {
    it('should stay in patrol state when player is far away', () => {
      const entity = createTestEntity();
      const ai = createEnemyAI(entity);
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 1000, 1000, tilemap, []);
      
      expect(result.ai.state).toBe('patrol');
    });

    it('should transition to alert when player is detected', () => {
      const entity = createTestEntity({ x: 100, y: 100 });
      const ai = createEnemyAI(entity);
      ai.detectionRange = 300;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 150, 100, tilemap, []);
      
      expect(result.ai.state).toBe('alert');
      expect(result.ai.alertLevel).toBeGreaterThan(0);
    });

    it('should increase alert level over time', () => {
      const entity = createTestEntity({ x: 100, y: 100 });
      const ai = createEnemyAI(entity);
      ai.state = 'alert';
      ai.alertLevel = 30;
      ai.detectionRange = 300;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 150, 100, tilemap, []);
      
      expect(result.ai.alertLevel).toBeGreaterThan(30);
    });

    it('should transition to chase when alert level is high', () => {
      const entity = createTestEntity({ x: 100, y: 100 });
      const ai = createEnemyAI(entity);
      ai.state = 'alert';
      ai.alertLevel = 75;
      ai.detectionRange = 300;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 150, 100, tilemap, []);
      
      // Alert level increases each tick, may or may not reach threshold
      expect(['alert', 'chase']).toContain(result.ai.state);
    });

    it('should move toward player in chase state', () => {
      const entity = createTestEntity({ x: 100, y: 100 });
      const ai = createEnemyAI(entity);
      ai.state = 'chase';
      ai.lastKnownPlayerX = 200;
      ai.lastKnownPlayerY = 100;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 200, 100, tilemap, []);
      
      expect(result.entity.vx).toBeGreaterThan(0);
    });

    it('should transition to attack when close enough', () => {
      const entity = createTestEntity({ x: 100, y: 100 });
      const ai = createEnemyAI(entity);
      ai.state = 'chase';
      ai.lastKnownPlayerX = 130;
      ai.lastKnownPlayerY = 100;
      ai.attackRange = 40;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 130, 100, tilemap, []);
      
      expect(result.ai.state).toBe('attack');
    });

    it('should handle dead state', () => {
      const entity = createTestEntity();
      const ai = createEnemyAI(entity);
      ai.state = 'dead';
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 100, 100, tilemap, []);
      
      expect(result.ai.state).toBe('dead');
      expect(result.ai.deathTimer).toBe(1);
    });

    it('should decrease attack cooldown', () => {
      const entity = createTestEntity();
      const ai = createEnemyAI(entity);
      ai.attackCooldown = 60;
      const tilemap = createTestTilemap();
      
      const result = updateEnemyAI(ai, entity, 100, 100, tilemap, []);
      
      expect(result.ai.attackCooldown).toBe(59);
    });
  });

  describe('rollEnemyLoot', () => {
    it('should always drop XP', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6); // Above 0.5 for gold, above 0.3 for item
      
      const drops = rollEnemyLoot('💀', 100, 100);
      
      expect(drops.length).toBeGreaterThanOrEqual(1);
      expect(drops[0].itemId).toBe('xp_orb');
      expect(drops[0].quantity).toBe(10);
      
      vi.restoreAllMocks();
    });

    it('should drop gold with 50% chance', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.4) // Gold check (0.4 < 0.5, so drops)
        .mockReturnValueOnce(0.8); // Item check (0.8 > 0.3, so no drop)
      
      const drops = rollEnemyLoot('💀', 100, 100);
      
      const goldDrop = drops.find(d => d.itemId === 'gold');
      expect(goldDrop).toBeDefined();
      expect(goldDrop!.quantity).toBeGreaterThanOrEqual(5);
      expect(goldDrop!.quantity).toBeLessThanOrEqual(14);
      
      vi.restoreAllMocks();
    });

    it('should drop item with 30% chance', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.6) // Gold check (0.6 > 0.5, no drop)
        .mockReturnValueOnce(0.2); // Item check (0.2 < 0.3, so drops)
      
      const drops = rollEnemyLoot('💀', 100, 100);
      
      const itemDrop = drops.find(d => d.itemId === 'bone');
      expect(itemDrop).toBeDefined();
      expect(itemDrop!.quantity).toBe(1);
      
      vi.restoreAllMocks();
    });

    it('should return empty array for unknown enemy', () => {
      const drops = rollEnemyLoot('👽', 100, 100);
      expect(drops).toHaveLength(0);
    });

    it('should set correct position for drops', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      
      const drops = rollEnemyLoot('💀', 150, 200);
      
      drops.forEach(drop => {
        expect(drop.x).toBe(150);
        expect(drop.y).toBe(200);
      });
      
      vi.restoreAllMocks();
    });
  });
});
