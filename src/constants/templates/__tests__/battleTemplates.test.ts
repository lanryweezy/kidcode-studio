import { describe, it, expect } from 'vitest';
import { battleTemplates } from '../battle';
import { ALL_TEMPLATES } from '../index';

describe('Battle Templates', () => {
  it('should export 10 battle templates', () => {
    expect(battleTemplates).toHaveLength(10);
  });

  it('should have unique IDs for all battle templates', () => {
    const ids = battleTemplates.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required fields', () => {
    for (const template of battleTemplates) {
      expect(template.id).toBeDefined();
      expect(template.id).toMatch(/^tpl_battle_/);
      expect(template.mode).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.color).toBeDefined();
      expect(template.commands).toBeDefined();
      expect(Array.isArray(template.commands)).toBe(true);
      expect(template.commands.length).toBeGreaterThan(0);
    }
  });

  it('should have FOREVER loops in all templates', () => {
    for (const template of battleTemplates) {
      const hasForever = template.commands.some(c => c.type === 'FOREVER');
      expect(hasForever).toBe(true);
    }
  });

  it('should have SET_EMOJI commands in all templates', () => {
    for (const template of battleTemplates) {
      const hasEmoji = template.commands.some(c => c.type === 'SET_EMOJI');
      expect(hasEmoji).toBe(true);
    }
  });

  it('should have movement commands in all templates', () => {
    for (const template of battleTemplates) {
      const hasMovement = template.commands.some(c => c.type === 'MOVE_X' || c.type === 'MOVE_Y');
      expect(hasMovement).toBe(true);
    }
  });

  it('should have attack commands in all templates', () => {
    for (const template of battleTemplates) {
      const hasAttack = template.commands.some(c => 
        c.type === 'SWING_WEAPON' || c.type === 'SHOOT' || c.type === 'COMBO_ATTACK'
      );
      expect(hasAttack).toBe(true);
    }
  });

  it('should be included in ALL_TEMPLATES', () => {
    for (const template of battleTemplates) {
      const found = ALL_TEMPLATES.find(t => t.id === template.id);
      expect(found).toBeDefined();
    }
  });

  it('each template should have valid commands array', () => {
    for (const template of battleTemplates) {
      expect(template.commands.length).toBeGreaterThan(5);
      const commandTypes = template.commands.map(c => c.type);
      expect(commandTypes).toContain('SET_EMOJI');
    }
  });
});
