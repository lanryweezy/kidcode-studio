import { describe, it, expect } from 'vitest';
import { validateTemplate, validateAllTemplates } from './templateValidator';
import { CommandType, CommandBlock } from '../types';

const makeBlock = (type: CommandType, params: Record<string, unknown> = {}): CommandBlock => ({
  id: `block_${Math.random().toString(36).slice(2, 6)}`,
  type,
  params,
});

describe('templateValidator', () => {
  describe('validateTemplate', () => {
    it('returns valid for empty commands', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Empty Template',
        commands: [],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns valid for valid MOVE_X block', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Move Template',
        commands: [makeBlock(CommandType.MOVE_X, { value: 10 })],
      });
      expect(result.valid).toBe(true);
    });

    it('catches missing required param for MOVE_X', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Bad Template',
        commands: [makeBlock(CommandType.MOVE_X, {})],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].type).toBe('missing_param');
      expect(result.errors[0].message).toContain('value');
    });

    it('catches missing required param for IF', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Bad IF',
        commands: [makeBlock(CommandType.IF, {})],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('condition'))).toBe(true);
    });

    it('catches missing required param for SAY', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Bad SAY',
        commands: [makeBlock(CommandType.SAY, {})],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('text'))).toBe(true);
    });

    it('validates IF EQUALS without varName as broken win condition', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Broken IF',
        commands: [makeBlock(CommandType.IF, { condition: 'EQUALS' })],
      });
      expect(result.errors.some(e => e.type === 'broken_win_condition')).toBe(true);
    });

    it('validates IF EQUALS with varName as valid', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Good IF',
        commands: [makeBlock(CommandType.IF, { condition: 'EQUALS', varName: 'score' })],
      });
      expect(result.errors.filter(e => e.type === 'broken_win_condition')).toHaveLength(0);
    });

    it('includes template metadata in result', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'My Template',
        commands: [],
      });
      expect(result.templateId).toBe('t1');
      expect(result.templateName).toBe('My Template');
    });

    it('catches multiple errors in one template', () => {
      const result = validateTemplate({
        id: 't1',
        name: 'Multi Error',
        commands: [
          makeBlock(CommandType.MOVE_X, {}),
          makeBlock(CommandType.SAY, {}),
        ],
      });
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('validateAllTemplates', () => {
    it('validates multiple templates', () => {
      const results = validateAllTemplates([
        { id: 't1', name: 'Template 1', commands: [makeBlock(CommandType.MOVE_X, { value: 5 })] },
        { id: 't2', name: 'Template 2', commands: [makeBlock(CommandType.MOVE_X, {})] },
      ]);
      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
    });

    it('returns empty array for no templates', () => {
      const results = validateAllTemplates([]);
      expect(results).toHaveLength(0);
    });
  });
});
