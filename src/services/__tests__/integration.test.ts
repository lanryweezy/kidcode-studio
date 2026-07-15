import { describe, it, expect } from 'vitest';
import { blocksToIR, validateIR, GameProject } from '../gameIR';

function makeBlock(type: string, params: Record<string, unknown> = {}) {
  return { id: `b_${Math.random().toString(36).slice(2, 8)}`, type, params };
}

describe('IR → Execute → Verify state', () => {
  it('should produce a valid project from empty blocks', () => {
    const project = blocksToIR([], { name: 'TestGame' });
    const result = validateIR(project);
    expect(result.valid).toBe(true);
    expect(project.meta.name).toBe('TestGame');
  });

  it('should add a player entity by default', () => {
    const project = blocksToIR([], {});
    const player = project.entities.find(e => e.type === 'player');
    expect(player).toBeDefined();
    expect(player!.hp).toBe(100);
  });

  it('should process SET_EMOJI block', () => {
    const project = blocksToIR([makeBlock('SET_EMOJI', { text: '🐱' })], {});
    expect(project.entities[0].emoji).toBe('🐱');
  });

  it('should process CHANGE_SCORE block', () => {
    const project = blocksToIR([makeBlock('CHANGE_SCORE', { value: 50 })], {});
    expect(project.world.score).toBe(50);
  });

  it('should process SET_HEALTH block', () => {
    const project = blocksToIR([makeBlock('SET_HEALTH', { value: 75 })], {});
    expect(project.world.health).toBe(75);
  });

  it('should process GAME_OVER block', () => {
    const project = blocksToIR([makeBlock('GAME_OVER')], {});
    expect(project.world.gameOver).toBe(true);
  });

  it('should process WIN_GAME block', () => {
    const project = blocksToIR([makeBlock('WIN_GAME')], {});
    expect(project.world.victory).toBe(true);
  });

  it('should process SPAWN_ENEMY block', () => {
    const project = blocksToIR([makeBlock('SPAWN_ENEMY', { text: '👻' })], {});
    const enemies = project.entities.filter(e => e.type === 'enemy');
    expect(enemies.length).toBe(1);
    expect(enemies[0].emoji).toBe('👻');
  });

  it('should process SPAWN_ITEM block', () => {
    const project = blocksToIR([makeBlock('SPAWN_ITEM', { text: '⭐' })], {});
    const items = project.entities.filter(e => e.type === 'item');
    expect(items.length).toBe(1);
    expect(items[0].emoji).toBe('⭐');
  });

  it('should process multiple blocks in sequence', () => {
    const project = blocksToIR([
      makeBlock('CHANGE_SCORE', { value: 100 }),
      makeBlock('CHANGE_HEALTH', { value: -20 }),
      makeBlock('SPAWN_ENEMY'),
      makeBlock('SPAWN_ENEMY'),
    ], {});
    expect(project.world.score).toBe(100);
    expect(project.world.health).toBe(80);
    expect(project.entities.filter(e => e.type === 'enemy').length).toBe(2);
  });

  it('should process SET_VAR and CHANGE_VAR blocks', () => {
    const project = blocksToIR([
      makeBlock('SET_VAR', { varName: 'coins', value: 10 }),
      makeBlock('CHANGE_VAR', { varName: 'coins', value: 5 }),
    ], {});
    expect(project.world.vars.coins).toBe(15);
  });

  it('should process SET_DIFFICULTY block', () => {
    const project = blocksToIR([makeBlock('SET_DIFFICULTY', { text: 'hard' })], {});
    expect(project.config.gameplay.difficulty).toBe('hard');
  });

  it('should add default systems', () => {
    const project = blocksToIR([], {});
    expect(project.systems.length).toBeGreaterThan(0);
    expect(project.systems.some(s => s.type === 'physics')).toBe(true);
  });

  it('should add default UI overlays', () => {
    const project = blocksToIR([], {});
    expect(project.ui.length).toBeGreaterThan(0);
  });

  it('should add default level', () => {
    const project = blocksToIR([], {});
    expect(project.levels.length).toBeGreaterThan(0);
  });

  it('should validate with name missing (falls back to default)', () => {
    const project = blocksToIR([], { name: '' });
    // makeProject uses `s?.name || 'Game'`, so empty string becomes 'Game'
    expect(project.meta.name).toBe('Game');
    const result = validateIR(project);
    expect(result.valid).toBe(true);
  });

  it('should warn when no player entity', () => {
    const project = blocksToIR([], {});
    project.entities = project.entities.filter(e => e.type !== 'player');
    const result = validateIR(project);
    expect(result.warnings).toContain('No player');
  });

  it('should process SET_WEATHER block', () => {
    const project = blocksToIR([makeBlock('SET_WEATHER', { text: 'rain' })], {});
    expect(project.properties.weather).toBe('rain');
  });

  it('should process START_WAVE block', () => {
    const project = blocksToIR([makeBlock('START_WAVE', { value: 3 })], {});
    expect(project.world.wave).toBe(3);
  });

  it('should process NEXT_WAVE block', () => {
    const project = blocksToIR([makeBlock('NEXT_WAVE')], {});
    expect(project.world.wave).toBe(2);
  });

  it('should process PLAY_SOUND block', () => {
    const project = blocksToIR([makeBlock('PLAY_SOUND', { text: 'jump' })], {});
    expect(project.audio.some(a => a.name === 'jump')).toBe(true);
  });
});
