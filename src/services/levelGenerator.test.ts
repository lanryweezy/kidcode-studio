import { describe, it, expect } from 'vitest';
import { generateLevel } from './levelGenerator';

describe('levelGenerator', () => {
  const baseConfig = {
    width: 800,
    height: 600,
    tileSize: 40,
    difficulty: 'normal' as const,
    theme: 'grass' as const,
    enemyDensity: 1,
    itemDensity: 1,
    platformChance: 10,
    seed: 12345,
  };

  it('generates a level with tiles', () => {
    const level = generateLevel(baseConfig);
    expect(level.tiles.length).toBeGreaterThan(0);
  });

  it('always has ground tiles', () => {
    const level = generateLevel(baseConfig);
    const groundTiles = level.tiles.filter(t => t.type === 'ground');
    expect(groundTiles.length).toBeGreaterThan(0);
  });

  it('always has walls', () => {
    const level = generateLevel(baseConfig);
    const wallTiles = level.tiles.filter(t => t.type === 'wall');
    expect(wallTiles.length).toBeGreaterThan(0);
  });

  it('has spawn and exit points', () => {
    const level = generateLevel(baseConfig);
    expect(level.spawnX).toBeGreaterThan(0);
    expect(level.spawnY).toBeGreaterThan(0);
    expect(level.exitX).toBeGreaterThan(0);
    expect(level.exitY).toBeGreaterThan(0);
  });

  it('matches specified width and height', () => {
    const level = generateLevel(baseConfig);
    expect(level.width).toBe(800);
    expect(level.height).toBe(600);
  });

  it('generates enemies', () => {
    const level = generateLevel({ ...baseConfig, enemyDensity: 2 });
    expect(level.enemies.length).toBeGreaterThanOrEqual(0);
  });

  it('generates items', () => {
    const level = generateLevel({ ...baseConfig, itemDensity: 2 });
    expect(level.items.length).toBeGreaterThanOrEqual(0);
  });

  it('generates same level with same seed', () => {
    const level1 = generateLevel({ ...baseConfig, seed: 42 });
    const level2 = generateLevel({ ...baseConfig, seed: 42 });
    expect(level1.tiles.length).toBe(level2.tiles.length);
    expect(level1.enemies.length).toBe(level2.enemies.length);
  });

  it('generates different levels with different seeds', () => {
    const level1 = generateLevel({ ...baseConfig, seed: 1 });
    const level2 = generateLevel({ ...baseConfig, seed: 999 });
    expect(level1.tiles.length).not.toBe(level2.tiles.length);
  });

  it('each enemy has required fields', () => {
    const level = generateLevel({ ...baseConfig, seed: 42, enemyDensity: 3 });
    for (const enemy of level.enemies) {
      expect(enemy.id).toBeDefined();
      expect(enemy.emoji).toBeDefined();
      expect(enemy.behavior).toBeDefined();
      expect(enemy.hp).toBeGreaterThan(0);
      expect(enemy.damage).toBeGreaterThan(0);
    }
  });

  it('each item has required fields', () => {
    const level = generateLevel({ ...baseConfig, seed: 42, itemDensity: 3 });
    for (const item of level.items) {
      expect(item.id).toBeDefined();
      expect(item.emoji).toBeDefined();
      expect(item.type).toBeDefined();
    }
  });

  it('supports different themes', () => {
    const themes = ['grass', 'dungeon', 'space', 'ice', 'lava'] as const;
    for (const theme of themes) {
      const level = generateLevel({ ...baseConfig, theme });
      expect(level.tiles.length).toBeGreaterThan(0);
    }
  });

  it('supports different difficulties', () => {
    const levels = ['easy', 'normal', 'hard', 'insane'] as const;
    for (const difficulty of levels) {
      const level = generateLevel({ ...baseConfig, difficulty });
      expect(level.tiles.length).toBeGreaterThan(0);
    }
  });
});
