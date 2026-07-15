import { describe, it, expect } from 'vitest';
import { validateIRNode, validateIRProgram, hasErrors, getErrors, getWarnings } from '../validator';
import { INITIAL_SPRITE_STATE } from '../../../constants';

const makeCtx = (overrides: Partial<typeof INITIAL_SPRITE_STATE> = {}) => ({
  spriteState: { ...INITIAL_SPRITE_STATE, ...overrides },
  mode: 'GAME' as const,
});

describe('IR Validator', () => {
  // === Movement ===
  describe('movement validation', () => {
    it('validates move_x with valid value', () => {
      const errors = validateIRNode(
        { kind: 'move_x', entityId: 'player', dx: 10 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('warns on large movement', () => {
      const errors = validateIRNode(
        { kind: 'move_x', entityId: 'player', dx: 150 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toContain('teleporting');
    });

    it('validates set_friction range', () => {
      const errors = validateIRNode(
        { kind: 'set_friction', entityId: 'player', value: 0.5 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on friction out of range', () => {
      const errors = validateIRNode(
        { kind: 'set_friction', entityId: 'player', value: 2 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('warns on jump while already jumping', () => {
      const errors = validateIRNode(
        { kind: 'jump', entityId: 'player', force: 15 },
        makeCtx({ isJumping: true })
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Appearance ===
  describe('appearance validation', () => {
    it('errors on empty emoji', () => {
      const errors = validateIRNode(
        { kind: 'set_emoji', entityId: 'player', emoji: '' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('validates opacity range', () => {
      const errors = validateIRNode(
        { kind: 'set_opacity', entityId: 'player', opacity: 50 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on opacity > 100', () => {
      const errors = validateIRNode(
        { kind: 'set_opacity', entityId: 'player', opacity: 150 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('warns on long speech text', () => {
      const errors = validateIRNode(
        { kind: 'say', entityId: 'player', text: 'a'.repeat(250) },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Spawning ===
  describe('spawning validation', () => {
    it('validates spawn_enemy', () => {
      const errors = validateIRNode(
        { kind: 'spawn_enemy', emoji: '👾' },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on empty spawn emoji', () => {
      const errors = validateIRNode(
        { kind: 'spawn_enemy', emoji: '' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('warns on too many particles', () => {
      const errors = validateIRNode(
        { kind: 'spawn_particles', count: 200 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toContain('FPS');
    });
  });

  // === Game State ===
  describe('game state validation', () => {
    it('warns on negative score', () => {
      const errors = validateIRNode(
        { kind: 'set_score', value: -10 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });

    it('warns on health going below 0', () => {
      const errors = validateIRNode(
        { kind: 'change_health', delta: -200 },
        makeCtx({ health: 50 })
      );
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors.some(e => e.message.includes('below 0'))).toBe(true);
    });

    it('warns on score command in non-game mode', () => {
      const errors = validateIRNode(
        { kind: 'change_score', delta: 10 },
        { spriteState: INITIAL_SPRITE_STATE, mode: 'APP' }
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Inventory ===
  describe('inventory validation', () => {
    it('errors on empty item name', () => {
      const errors = validateIRNode(
        { kind: 'add_to_inventory', item: '', quantity: 1 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('warns when inventory is full', () => {
      const errors = validateIRNode(
        { kind: 'add_to_inventory', item: 'Sword', quantity: 1 },
        makeCtx({ maxInventorySize: 0 })
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });

    it('errors when removing item not in inventory', () => {
      const errors = validateIRNode(
        { kind: 'remove_from_inventory', item: 'NonExistent', quantity: 1 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });
  });

  // === Dialogue ===
  describe('dialogue validation', () => {
    it('validates npc_talk', () => {
      const errors = validateIRNode(
        { kind: 'npc_talk', name: 'Guard', message: 'Halt!' },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on empty speaker', () => {
      const errors = validateIRNode(
        { kind: 'npc_talk', name: '', message: 'Hello' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });
  });

  // === Boss ===
  describe('boss validation', () => {
    it('validates spawn_boss', () => {
      const errors = validateIRNode(
        { kind: 'spawn_boss', name: 'Dragon', health: 100 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on zero health boss', () => {
      const errors = validateIRNode(
        { kind: 'spawn_boss', name: 'Dragon', health: 0 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('warns when boss already active', () => {
      const errors = validateIRNode(
        { kind: 'spawn_boss', name: 'Dragon', health: 100 },
        makeCtx({ activeBoss: { id: '1', name: 'Existing', emoji: '💀', x: 0, y: 0, health: 50, maxHealth: 100, phase: 1, attackPattern: 'normal', isInvulnerable: false, attackCooldown: 0 } })
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Sports ===
  describe('sports validation', () => {
    it('validates kick_ball', () => {
      const errors = validateIRNode(
        { kind: 'kick_ball', emoji: '⚽', force: 15 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('warns on invalid formation', () => {
      const errors = validateIRNode(
        { kind: 'set_formation', formation: '9-9-9' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Puzzle ===
  describe('puzzle validation', () => {
    it('validates fill_color with hex', () => {
      const errors = validateIRNode(
        { kind: 'fill_color', color: '#ff0000' },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('errors on invalid hex color', () => {
      const errors = validateIRNode(
        { kind: 'fill_color', color: 'red' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('errors on invalid slide direction', () => {
      const errors = validateIRNode(
        { kind: 'slide_puzzle', direction: 'diagonal' },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });
  });

  // === Racing ===
  describe('racing validation', () => {
    it('validates boost', () => {
      const errors = validateIRNode(
        { kind: 'boost', force: 15 },
        makeCtx()
      );
      expect(errors).toHaveLength(0);
    });

    it('warns on excessive boost', () => {
      const errors = validateIRNode(
        { kind: 'boost', force: 50 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });

    it('warns on unknown car stat', () => {
      const errors = validateIRNode(
        { kind: 'upgrade_car', stat: 'fuel', amount: 1 },
        makeCtx()
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
    });
  });

  // === Program validation ===
  describe('validateIRProgram', () => {
    it('returns empty for valid program', () => {
      const nodes = [
        { kind: 'move_x' as const, entityId: 'player', dx: 10 },
        { kind: 'set_gravity' as const, entityId: 'player', enabled: true },
        { kind: 'jump' as const, entityId: 'player', force: 15 },
      ];
      const errors = validateIRProgram(nodes, makeCtx());
      expect(errors).toHaveLength(0);
    });

    it('collects errors from multiple nodes', () => {
      const nodes = [
        { kind: 'set_emoji' as const, entityId: 'player', emoji: '' },
        { kind: 'set_opacity' as const, entityId: 'player', opacity: 150 },
        { kind: 'set_friction' as const, entityId: 'player', value: 2 },
      ];
      const errors = validateIRProgram(nodes, makeCtx());
      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(hasErrors(errors)).toBe(true);
    });
  });

  // === Helper functions ===
  describe('helper functions', () => {
    it('hasErrors returns true when errors exist', () => {
      const errors = [
        { nodeId: '1', kind: 'test', message: 'err', severity: 'error' as const },
        { nodeId: '2', kind: 'test', message: 'warn', severity: 'warning' as const },
      ];
      expect(hasErrors(errors)).toBe(true);
    });

    it('hasErrors returns false for warnings only', () => {
      const errors = [
        { nodeId: '1', kind: 'test', message: 'warn', severity: 'warning' as const },
      ];
      expect(hasErrors(errors)).toBe(false);
    });

    it('getErrors filters to errors only', () => {
      const errors = [
        { nodeId: '1', kind: 'test', message: 'err', severity: 'error' as const },
        { nodeId: '2', kind: 'test', message: 'warn', severity: 'warning' as const },
      ];
      expect(getErrors(errors)).toHaveLength(1);
    });

    it('getWarnings filters to warnings only', () => {
      const errors = [
        { nodeId: '1', kind: 'test', message: 'err', severity: 'error' as const },
        { nodeId: '2', kind: 'test', message: 'warn', severity: 'warning' as const },
      ];
      expect(getWarnings(errors)).toHaveLength(1);
    });
  });
});
