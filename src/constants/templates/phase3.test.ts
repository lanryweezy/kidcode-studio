import { describe, it, expect } from 'vitest';
import { phase3Templates } from './phase3';
import { AppMode } from '../../types';

describe('Phase 3 Templates', () => {
  it('should export 10 templates', () => {
    expect(phase3Templates).toHaveLength(10);
  });

  it('should have unique IDs for all templates', () => {
    const ids = phase3Templates.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required fields', () => {
    for (const template of phase3Templates) {
      expect(template.id).toBeDefined();
      expect(template.id).toMatch(/^tpl_p3_/);
      expect(template.mode).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.color).toBeDefined();
      expect(template.commands).toBeDefined();
      expect(template.commands.length).toBeGreaterThan(0);
    }
  });

  it('should all be GAME mode', () => {
    for (const template of phase3Templates) {
      expect(template.mode).toBe(AppMode.GAME);
    }
  });

  it('should have valid command structure', () => {
    for (const template of phase3Templates) {
      for (const cmd of template.commands) {
        expect(cmd.id).toBeDefined();
        expect(cmd.type).toBeDefined();
        expect(cmd.params).toBeDefined();
      }
    }
  });

  it('should include stealth game template', () => {
    const stealth = phase3Templates.find(t => t.id === 'tpl_p3_stealth');
    expect(stealth).toBeDefined();
    expect(stealth?.name).toBe('Stealth Mission');
  });

  it('should include cooking game template', () => {
    const cooking = phase3Templates.find(t => t.id === 'tpl_p3_cooking');
    expect(cooking).toBeDefined();
    expect(cooking?.name).toBe('Kitchen Chaos');
  });

  it('should include pet game template', () => {
    const pet = phase3Templates.find(t => t.id === 'tpl_p3_pet');
    expect(pet).toBeDefined();
    expect(pet?.name).toBe('Virtual Pet');
  });

  it('should include memory game template', () => {
    const memory = phase3Templates.find(t => t.id === 'tpl_p3_memory');
    expect(memory).toBeDefined();
    expect(memory?.name).toBe('Memory Matrix');
  });

  it('should include strength game template', () => {
    const strength = phase3Templates.find(t => t.id === 'tpl_p3_strength');
    expect(strength).toBeDefined();
    expect(strength?.name).toBe('Strength Challenge');
  });

  it('should include pattern puzzle template', () => {
    const pattern = phase3Templates.find(t => t.id === 'tpl_p3_pattern');
    expect(pattern).toBeDefined();
    expect(pattern?.name).toBe('Pattern Puzzle');
  });

  it('should include DJ mixer template', () => {
    const dj = phase3Templates.find(t => t.id === 'tpl_p3_dj');
    expect(dj).toBeDefined();
    expect(dj?.name).toBe('DJ Mixer');
  });

  it('should include pixel painter template', () => {
    const paint = phase3Templates.find(t => t.id === 'tpl_p3_paint');
    expect(paint).toBeDefined();
    expect(paint?.name).toBe('Pixel Painter');
  });

  it('should include speed typer template', () => {
    const typing = phase3Templates.find(t => t.id === 'tpl_p3_typing');
    expect(typing).toBeDefined();
    expect(typing?.name).toBe('Speed Typer');
  });

  it('should include lucky spinner template', () => {
    const lucky = phase3Templates.find(t => t.id === 'tpl_p3_lucky');
    expect(lucky).toBeDefined();
    expect(lucky?.name).toBe('Lucky Spinner');
  });

  it('should have win and lose conditions in most templates', () => {
    const templatesWithConditions = phase3Templates.filter(t =>
      t.commands.some(c => c.type === 'WIN_GAME' || c.type === 'GAME_OVER')
    );
    expect(templatesWithConditions.length).toBeGreaterThanOrEqual(8);
  });

  it('should have FOREVER loop in all templates', () => {
    for (const template of phase3Templates) {
      const hasForever = template.commands.some(c => c.type === 'FOREVER');
      expect(hasForever).toBe(true);
    }
  });

  it('should have END_FOREVER in all templates', () => {
    for (const template of phase3Templates) {
      const hasEndForever = template.commands.some(c => c.type === 'END_FOREVER');
      expect(hasEndForever).toBe(true);
    }
  });
});
