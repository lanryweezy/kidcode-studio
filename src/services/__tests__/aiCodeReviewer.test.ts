import { describe, it, expect } from 'vitest';
import {
  analyzeCode,
  applyFix,
  type ReviewIssue,
  type ReviewResult,
} from '../aiCodeReviewer';
import { CommandBlock, CommandType } from '../../types';

function makeBlock(type: CommandType, params: Record<string, unknown> = {}): CommandBlock {
  return {
    id: `b_${Math.random().toString(36).slice(2, 8)}`,
    type,
    params,
  };
}

describe('aiCodeReviewer', () => {
  describe('analyzeCode', () => {
    it('returns empty issues for empty blocks', () => {
      const result = analyzeCode([]);
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBe(100);
      expect(result.summary).toContain('great');
    });

    it('detects infinite forever loops', () => {
      const blocks = [
        makeBlock(CommandType.SET_VAR, { varName: 'x', value: 1 }),
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.END_FOREVER),
      ];
      const result = analyzeCode(blocks);
      const infiniteIssues = result.issues.filter(i => i.title.includes('Empty forever loop'));
      expect(infiniteIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('detects missing win/lose conditions', () => {
      const blocks = [
        makeBlock(CommandType.SPAWN_ENEMY, { text: '👾' }),
        makeBlock(CommandType.CHANGE_SCORE, { value: 10 }),
        makeBlock(CommandType.SET_HEALTH, { value: 100 }),
      ];
      const result = analyzeCode(blocks);
      const winLoseIssues = result.issues.filter(i => i.title.includes('win or lose'));
      expect(winLoseIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('detects unreachable code after WIN_GAME', () => {
      const blocks = [
        makeBlock(CommandType.WIN_GAME),
        makeBlock(CommandType.MOVE_X),
        makeBlock(CommandType.SAY, { text: 'hello' }),
      ];
      const result = analyzeCode(blocks);
      const unreachableIssues = result.issues.filter(i => i.title.includes('Unreachable'));
      expect(unreachableIssues).toHaveLength(2);
    });

    it('detects unreachable code after GAME_OVER', () => {
      const blocks = [
        makeBlock(CommandType.GAME_OVER),
        makeBlock(CommandType.SHOOT),
      ];
      const result = analyzeCode(blocks);
      const unreachableIssues = result.issues.filter(i => i.title.includes('Unreachable'));
      expect(unreachableIssues).toHaveLength(1);
    });

    it('detects unused variables', () => {
      const blocks = [
        makeBlock(CommandType.SET_VAR, { varName: 'unused', value: 42 }),
      ];
      const result = analyzeCode(blocks);
      const unusedIssues = result.issues.filter(i => i.title.includes('Unused variable'));
      expect(unusedIssues).toHaveLength(1);
      expect(unusedIssues[0].description).toContain('unused');
    });

    it('does not flag score/health as unused', () => {
      const blocks = [
        makeBlock(CommandType.SET_VAR, { varName: 'score', value: 0 }),
        makeBlock(CommandType.SET_VAR, { varName: 'health', value: 100 }),
      ];
      const result = analyzeCode(blocks);
      const unusedIssues = result.issues.filter(i => i.title.includes('Unused variable'));
      expect(unusedIssues).toHaveLength(0);
    });

    it('detects nested forever loops', () => {
      const blocks = [
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.END_FOREVER),
        makeBlock(CommandType.END_FOREVER),
      ];
      const result = analyzeCode(blocks);
      const perfIssues = result.issues.filter(i => i.title.includes('Nested forever'));
      expect(perfIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('detects missing closing blocks', () => {
      const blocks = [
        makeBlock(CommandType.IF),
        makeBlock(CommandType.SET_VAR, { varName: 'x', value: 1 }),
      ];
      const result = analyzeCode(blocks);
      const closingIssues = result.issues.filter(i => i.title.includes('Missing closing'));
      expect(closingIssues).toHaveLength(1);
    });

    it('detects extra closing blocks', () => {
      const blocks = [
        makeBlock(CommandType.END_IF),
      ];
      const result = analyzeCode(blocks);
      const openingIssues = result.issues.filter(i => i.title.includes('Missing opening'));
      expect(openingIssues).toHaveLength(1);
    });

    it('detects duplicate SET_SCENE blocks', () => {
      const blocks = [
        makeBlock(CommandType.SET_SCENE, { text: 'forest' }),
        makeBlock(CommandType.SET_SCENE, { text: 'space' }),
      ];
      const result = analyzeCode(blocks);
      const dupIssues = result.issues.filter(i => i.title.includes('Duplicate'));
      expect(dupIssues).toHaveLength(1);
    });

    it('scores lower with more issues', () => {
      const cleanResult = analyzeCode([
        makeBlock(CommandType.MOVE_X),
      ]);
      const badResult = analyzeCode([
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.END_FOREVER),
        makeBlock(CommandType.END_IF),
        makeBlock(CommandType.SPAWN_ENEMY),
      ]);
      expect(badResult.score).toBeLessThan(cleanResult.score);
    });

    it('handles a complex realistic game', () => {
      const blocks = [
        makeBlock(CommandType.SET_SCENE, { text: 'forest' }),
        makeBlock(CommandType.SET_GRAVITY, { condition: 'true' }),
        makeBlock(CommandType.SET_SCORE, { value: 0 }),
        makeBlock(CommandType.FOREVER),
        makeBlock(CommandType.MOVE_X),
        makeBlock(CommandType.SHOOT),
        makeBlock(CommandType.CHANGE_SCORE, { value: 1 }),
        makeBlock(CommandType.WIN_GAME),
        makeBlock(CommandType.END_FOREVER),
      ];
      const result = analyzeCode(blocks);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(typeof result.summary).toBe('string');
    });
  });

  describe('applyFix', () => {
    it('applies fix with custom commands', () => {
      const block = makeBlock(CommandType.SET_SCENE, { text: 'forest' });
      const blocks = [block];
      const issue: ReviewIssue = {
        id: 'test_issue',
        severity: 'warning',
        title: 'Test issue',
        description: 'Test',
        blockId: block.id,
        blockType: block.type,
        category: 'bug',
        fixSuggestion: 'Replace it',
        fixCommands: [{ type: CommandType.SET_SCENE, params: { text: 'space' } }],
      };

      const result = applyFix(blocks, issue);
      expect(result).toHaveLength(1);
      expect(result[0].params.text).toBe('space');
    });

    it('removes duplicate blocks', () => {
      const block = makeBlock(CommandType.SET_SCENE, { text: 'forest' });
      const blocks = [block];
      const issue: ReviewIssue = {
        id: 'test_issue',
        severity: 'info',
        title: 'Duplicate SET_SCENE block',
        description: 'Duplicate',
        blockId: block.id,
        blockType: block.type,
        category: 'style',
        fixSuggestion: 'Remove it',
      };

      const result = applyFix(blocks, issue);
      expect(result).toHaveLength(0);
    });

    it('returns original blocks if block not found', () => {
      const blocks = [makeBlock(CommandType.MOVE_X)];
      const issue: ReviewIssue = {
        id: 'test_issue',
        severity: 'warning',
        title: 'Test',
        description: 'Test',
        blockId: 'nonexistent',
        blockType: CommandType.MOVE_X,
        category: 'bug',
        fixSuggestion: 'Fix it',
      };

      const result = applyFix(blocks, issue);
      expect(result).toHaveLength(1);
    });
  });
});
