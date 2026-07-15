import { describe, it, expect, vi } from 'vitest';
import { handlePuzzleCommand } from '../puzzleHandlers';
import { CommandType } from '../../../types';
import { createMockContext } from './mocks';

describe('puzzleHandlers', () => {
  describe('ROTATE_BLOCK', () => {
    it('adds rotation value to sprite rotation', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ROTATE_BLOCK, params: { value: 90 } },
        spriteStateRef: { current: { rotation: 0 } } as any,
      });
      expect(await handlePuzzleCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.rotation).toBe(90);
      expect(ctx.playSound).toHaveBeenCalledWith('click');
    });

    it('defaults to 90 degrees', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ROTATE_BLOCK, params: {} },
        spriteStateRef: { current: { rotation: 45 } } as any,
      });
      await handlePuzzleCommand(ctx);
      expect(ctx.spriteStateRef.current.rotation).toBe(135);
    });

    it('accumulates rotation', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ROTATE_BLOCK, params: { value: 45 } },
        spriteStateRef: { current: { rotation: 180 } } as any,
      });
      await handlePuzzleCommand(ctx);
      expect(ctx.spriteStateRef.current.rotation).toBe(225);
    });
  });

  describe('FILL_COLOR', () => {
    it('sets fill color variable', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.FILL_COLOR, params: { color: '#00ff00' } },
      });
      expect(await handlePuzzleCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_fill_color']).toBe('#00ff00');
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });

    it('defaults to red', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.FILL_COLOR, params: {} },
      });
      await handlePuzzleCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_fill_color']).toBe('#ff0000');
    });
  });

  describe('UNLOCK_PATTERN', () => {
    it('sets pattern_unlocked to true', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.UNLOCK_PATTERN, params: {} },
      });
      expect(await handlePuzzleCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_pattern_unlocked']).toBe(true);
      expect(ctx.playSound).toHaveBeenCalledWith('victory');
    });
  });

  describe('sound-only commands', () => {
    const soundCommands: [CommandType, string][] = [
      [CommandType.SWAP_TILES, 'click'],
      [CommandType.SLIDE_PUZZLE, 'click'],
      [CommandType.CONNECT_DOTS, 'click'],
      [CommandType.MIRROR_PUZZLE, 'click'],
      [CommandType.FLIP_CARD, 'click'],
      [CommandType.SORT_ITEMS, 'powerup'],
      [CommandType.CHECK_MATCH, 'powerup'],
    ];

    it.each(soundCommands)('%s plays %s sound', async (cmdType, sound) => {
      const ctx = createMockContext({
        cmd: { id: '1', type: cmdType, params: {} },
      });
      expect(await handlePuzzleCommand(ctx)).toBe(true);
      expect(ctx.playSound).toHaveBeenCalledWith(sound);
    });
  });

  describe('default case', () => {
    it('returns false for unknown command', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: 'UNKNOWN_CMD' as any, params: {} },
      });
      expect(await handlePuzzleCommand(ctx)).toBe(false);
    });
  });
});
