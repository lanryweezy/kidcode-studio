import { describe, it, expect } from 'vitest';
import { blocksToIR, validateIR } from './gameIR';

describe('gameIR', () => {
  describe('blocksToIR', () => {
    it('creates a valid game project from empty blocks', () => {
      const project = blocksToIR([], { name: 'Test Game' });
      expect(project.meta.name).toBe('Test Game');
      expect(project.meta.engine).toBe('kidcode');
      expect(project.entities.length).toBeGreaterThanOrEqual(1);
    });

    it('sets default player entity', () => {
      const project = blocksToIR([], {});
      const player = project.entities.find(e => e.type === 'player');
      expect(player).toBeDefined();
      expect(player!.emoji).toBe('🧙');
    });

    it('processes SPAWN_ENEMY block', () => {
      const project = blocksToIR([{ type: 'SPAWN_ENEMY', params: { text: '👾' } }], {});
      const enemies = project.entities.filter(e => e.type === 'enemy');
      expect(enemies.length).toBeGreaterThanOrEqual(1);
    });

    it('processes SPAWN_ITEM block', () => {
      const project = blocksToIR([{ type: 'SPAWN_ITEM', params: { text: '💎' } }], {});
      const items = project.entities.filter(e => e.type === 'item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('processes CHANGE_SCORE block', () => {
      const project = blocksToIR([{ type: 'CHANGE_SCORE', params: { value: 10 } }], {});
      expect(project.world.score).toBe(10);
    });

    it('processes SET_SCORE block', () => {
      const project = blocksToIR([{ type: 'SET_SCORE', params: { value: 50 } }], {});
      expect(project.world.score).toBe(50);
    });

    it('processes SET_HEALTH block', () => {
      const project = blocksToIR([{ type: 'SET_HEALTH', params: { value: 75 } }], {});
      expect(project.world.health).toBe(75);
    });

    it('processes GAME_OVER block', () => {
      const project = blocksToIR([{ type: 'GAME_OVER', params: {} }], {});
      expect(project.world.gameOver).toBe(true);
    });

    it('processes WIN_GAME block', () => {
      const project = blocksToIR([{ type: 'WIN_GAME', params: {} }], {});
      expect(project.world.victory).toBe(true);
    });

    it('processes SET_VAR block', () => {
      const project = blocksToIR([{ type: 'SET_VAR', params: { varName: 'coins', value: 99 } }], {});
      expect(project.world.vars.coins).toBe(99);
    });

    it('processes CHANGE_VAR block', () => {
      const project = blocksToIR([
        { type: 'SET_VAR', params: { varName: 'x', value: 5 } },
        { type: 'CHANGE_VAR', params: { varName: 'x', value: 3 } },
      ], {});
      expect(project.world.vars.x).toBe(8);
    });

    it('processes SET_WEATHER block', () => {
      const project = blocksToIR([{ type: 'SET_WEATHER', params: { text: 'rain' } }], {});
      expect(project.properties.weather).toBe('rain');
    });

    it('processes SET_EMOJI block', () => {
      const project = blocksToIR([{ type: 'SET_EMOJI', params: { text: '🧑‍🚀' } }], {});
      expect(project.entities[0].emoji).toBe('🧑‍🚀');
    });

    it('processes SET_GRAVITY block', () => {
      const project = blocksToIR([{ type: 'SET_GRAVITY', params: { condition: 'false' } }], {});
      expect(project.config.physics.enabled).toBe(false);
    });

    it('processes SPAWN_BOSS block', () => {
      const project = blocksToIR([{ type: 'SPAWN_BOSS', params: { text: '🐲', value: 200 } }], {});
      const bosses = project.entities.filter(e => e.isBoss);
      expect(bosses.length).toBe(1);
      expect(bosses[0].maxHp).toBe(200);
    });

    it('processes START_WAVE block', () => {
      const project = blocksToIR([{ type: 'START_WAVE', params: { value: 5 } }], {});
      expect(project.world.wave).toBe(5);
    });

    it('processes NEXT_WAVE block', () => {
      const project = blocksToIR([{ type: 'NEXT_WAVE', params: {} }], {});
      expect(project.world.wave).toBe(2);
    });

    it('processes SET_DIFFICULTY block', () => {
      const project = blocksToIR([{ type: 'SET_DIFFICULTY', params: { text: 'hard' } }], {});
      expect(project.config.gameplay.difficulty).toBe('hard');
    });

    it('processes multiple blocks in sequence', () => {
      const project = blocksToIR([
        { type: 'CHANGE_SCORE', params: { value: 10 } },
        { type: 'SPAWN_ENEMY', params: { text: '👾' } },
        { type: 'SPAWN_ITEM', params: { text: '🪙' } },
      ], {});
      expect(project.world.score).toBe(10);
      expect(project.entities.filter(e => e.type === 'enemy').length).toBeGreaterThanOrEqual(1);
      expect(project.entities.filter(e => e.type === 'item').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validateIR', () => {
    it('validates a correct project', () => {
      const project = blocksToIR([], { name: 'Good Game' });
      const result = validateIR(project);
      expect(result.valid).toBe(true);
    });

    it('fails validation when name is empty', () => {
      const project = blocksToIR([], { name: '' });
      project.meta.name = '';
      const result = validateIR(project);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name required');
    });

    it('warns when no player', () => {
      const project = blocksToIR([], {});
      project.entities = project.entities.filter(e => e.type !== 'player');
      const result = validateIR(project);
      expect(result.warnings).toContain('No player');
    });
  });
});
