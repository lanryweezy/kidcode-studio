import { describe, it, expect } from 'vitest';
import { SpatialHash } from './spatialHash';
import { GameEntity, Tile } from '../types';

describe('SpatialHash', () => {
  const makeEntity = (x: number, y: number, id: string = 'e1'): GameEntity => ({
    id, x, y, type: 'enemy', emoji: '👾', behavior: 'patrol',
  });

  const makeTile = (x: number, y: number, type: Tile['type'] = 'grass'): Tile => ({
    x, y, type,
  });

  it('inserts and queries entities', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(10, 10));
    hash.insertEntity(makeEntity(100, 100));

    const result = hash.query(0, 0, 50, 50);
    expect(result.entities).toHaveLength(1);
  });

  it('returns empty for non-overlapping query', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(100, 100));
    const result = hash.query(0, 0, 10, 10);
    expect(result.entities).toHaveLength(0);
  });

  it('inserts and queries tiles', () => {
    const hash = new SpatialHash(40);
    hash.insertTile(makeTile(0, 0));
    hash.insertTile(makeTile(5, 5));

    const result = hash.query(0, 0, 50, 50);
    expect(result.tiles).toHaveLength(1);
  });

  it('clears all data', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(10, 10));
    hash.insertTile(makeTile(0, 0));
    hash.clear();
    const result = hash.query(0, 0, 200, 200);
    expect(result.entities).toHaveLength(0);
    expect(result.tiles).toHaveLength(0);
  });

  it('buildTilemap replaces tile data', () => {
    const hash = new SpatialHash(40);
    hash.insertTile(makeTile(1, 1));
    hash.buildTilemap([makeTile(5, 5), makeTile(8, 8)]);
    const result = hash.query(0, 0, 400, 400);
    expect(result.tiles).toHaveLength(2);
  });

  it('buildEntityList replaces entity data', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(10, 10));
    hash.buildEntityList([makeEntity(100, 100, 'e2'), makeEntity(120, 120, 'e3')]);
    const result = hash.query(0, 0, 200, 200);
    expect(result.entities).toHaveLength(2);
  });

  it('does not duplicate entities in overlapping cells', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(39, 39, 'e1'));
    const result = hash.query(0, 0, 80, 80);
    expect(result.entities).toHaveLength(1);
  });

  it('getStats returns correct counts', () => {
    const hash = new SpatialHash(40);
    hash.insertEntity(makeEntity(10, 10));
    hash.insertEntity(makeEntity(50, 50));
    hash.insertTile(makeTile(0, 0));
    const stats = hash.getStats();
    expect(stats.totalEntities).toBe(2);
    expect(stats.totalTiles).toBe(1);
  });
});
