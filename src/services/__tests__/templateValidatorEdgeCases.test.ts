import { describe, it, expect } from 'vitest';
import { validateTemplate, validateAllTemplates } from '../templateValidator';
import { CommandType, CommandBlock } from '../../types';

const makeBlock = (type: CommandType, params: Record<string, unknown> = {}): CommandBlock => ({
  id: `block_${Math.random().toString(36).slice(2, 6)}`,
  type,
  params,
});

describe('templateValidator edge cases', () => {
  describe('unknown commands', () => {
    it('flags completely unknown command type', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Unknown',
        commands: [makeBlock('FAKE_COMMAND' as CommandType, { value: 5 })],
      });
      expect(result.errors.some(e => e.type === 'unknown_command')).toBe(true);
    });
  });

  describe('missing params edge cases', () => {
    it('catches SET_VAR with missing varName', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Var',
        commands: [makeBlock(CommandType.SET_VAR, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param' && e.message.includes('varName'))).toBe(true);
    });

    it('catches CHANGE_VAR with missing varName', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Var',
        commands: [makeBlock(CommandType.CHANGE_VAR, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param' && e.message.includes('varName'))).toBe(true);
    });

    it('catches REPEAT with missing value', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Value',
        commands: [makeBlock(CommandType.REPEAT, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param' && e.message.includes('value'))).toBe(true);
    });

    it('catches MOVE_X with missing value', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Move',
        commands: [makeBlock(CommandType.MOVE_X, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches MOVE_Y with missing value', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Move',
        commands: [makeBlock(CommandType.MOVE_Y, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches PLAY_SOUND with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Sound',
        commands: [makeBlock(CommandType.PLAY_SOUND, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches SET_EMOJI with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Emoji',
        commands: [makeBlock(CommandType.SET_EMOJI, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches SET_SCENE with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Scene',
        commands: [makeBlock(CommandType.SET_SCENE, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches SET_WEATHER with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Weather',
        commands: [makeBlock(CommandType.SET_WEATHER, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches SWING_WEAPON with missing params', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Weapon',
        commands: [makeBlock(CommandType.SWING_WEAPON, {})],
      });
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('catches SPAWN_ENEMY with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Enemy',
        commands: [makeBlock(CommandType.SPAWN_ENEMY, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches SPAWN_ITEM with missing text', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Item',
        commands: [makeBlock(CommandType.SPAWN_ITEM, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });

    it('catches WAIT with missing value', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'No Wait',
        commands: [makeBlock(CommandType.WAIT, {})],
      });
      expect(result.errors.some(e => e.type === 'missing_param')).toBe(true);
    });
  });

  describe('broken_win_condition edge cases', () => {
    it('IF EQUALS with empty varName', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Bad IF',
        commands: [makeBlock(CommandType.IF, { condition: 'EQUALS', varName: '' })],
      });
      expect(result.errors.some(e => e.type === 'broken_win_condition')).toBe(true);
    });

    it('IF with valid condition does not flag broken', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Good IF',
        commands: [makeBlock(CommandType.IF, { condition: '>', varName: 'score' })],
      });
      expect(result.errors.filter(e => e.type === 'broken_win_condition')).toHaveLength(0);
    });
  });

  describe('multiple errors', () => {
    it('reports all errors in a template', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Multi Error',
        commands: [
          makeBlock(CommandType.MOVE_X, {}),
          makeBlock(CommandType.SAY, {}),
          makeBlock(CommandType.PLAY_SOUND, {}),
          makeBlock(CommandType.SWING_WEAPON, {}),
        ],
      });
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('valid templates', () => {
    it('validates correct template with no errors', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Good Template',
        commands: [
          makeBlock(CommandType.MOVE_X, { value: 10 }),
          makeBlock(CommandType.SAY, { text: 'Hello' }),
          makeBlock(CommandType.PLAY_SOUND, { text: 'coin' }),
          makeBlock(CommandType.SET_EMOJI, { text: '🚀' }),
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates empty template', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Empty',
        commands: [],
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAllTemplates', () => {
    it('validates multiple templates with mixed results', () => {
      const results = validateAllTemplates([
        { id: 't1', name: 'Good', commands: [makeBlock(CommandType.MOVE_X, { value: 5 })] },
        { id: 't2', name: 'Bad', commands: [makeBlock(CommandType.MOVE_X, {})] },
        { id: 't3', name: 'Empty', commands: [] },
      ]);
      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
      expect(results[2].valid).toBe(true);
    });
  });
});
