import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCoreCommand } from '../coreHandlers';
import { CommandType } from '../../../types';
import { createMockContext, createMockSpriteState } from './mocks';

describe('coreHandlers', () => {
  describe('MOVE_X', () => {
    it('adds value to sprite x position', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.MOVE_X, params: { value: 10 } },
        spriteStateRef: { current: createMockSpriteState({ x: 100 }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.x).toBe(110);
      expect(ctx.playSound).toHaveBeenCalledWith('move');
    });

    it('defaults to 0 if no value provided', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.MOVE_X, params: {} },
        spriteStateRef: { current: createMockSpriteState({ x: 100 }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.x).toBe(100);
    });
  });

  describe('MOVE_Y', () => {
    it('subtracts value from sprite y position', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.MOVE_Y, params: { value: 10 } },
        spriteStateRef: { current: createMockSpriteState({ y: 200 }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.y).toBe(190);
    });

    it('defaults to 0 if no value provided', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.MOVE_Y, params: {} },
        spriteStateRef: { current: createMockSpriteState({ y: 200 }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.y).toBe(200);
    });
  });

  describe('JUMP', () => {
    it('sets negative vy and marks isJumping when not already jumping', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.JUMP, params: { value: 15 } },
        spriteStateRef: { current: createMockSpriteState({ isJumping: false }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.vy).toBe(-15);
      expect(ctx.spriteStateRef.current.isJumping).toBe(true);
      expect(ctx.playSound).toHaveBeenCalledWith('move');
    });

    it('does nothing when already jumping', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.JUMP, params: { value: 15 } },
        spriteStateRef: { current: createMockSpriteState({ isJumping: true, vy: 0 }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.vy).toBe(0);
    });

    it('defaults jump force to 10', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.JUMP, params: {} },
        spriteStateRef: { current: createMockSpriteState({ isJumping: false }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.vy).toBe(-10);
    });
  });

  describe('SET_GRAVITY', () => {
    it('sets gravity to true when condition is "true"', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
        spriteStateRef: { current: createMockSpriteState({ gravity: false }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.gravity).toBe(true);
    });

    it('sets gravity to false when condition is not "true"', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_GRAVITY, params: { condition: 'false' } },
        spriteStateRef: { current: createMockSpriteState({ gravity: true }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.gravity).toBe(false);
    });
  });

  describe('SET_VAR', () => {
    it('sets variable on sprite state in GAME mode', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_VAR, params: { varName: 'score', value: 42 } },
        mode: 'GAME',
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['score']).toBe(42);
    });

  });

  describe('CHANGE_VAR', () => {
    it('increments variable value in GAME mode', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 10 } },
        mode: 'GAME',
        spriteStateRef: { current: createMockSpriteState({ variables: { score: 5 } }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['score']).toBe(15);
    });

    it('treats missing variable as 0', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CHANGE_VAR, params: { varName: 'newVar', value: 5 } },
        mode: 'GAME',
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['newVar']).toBe(5);
    });
  });

  describe('SAY', () => {
    it('sets speech text on sprite', () => {
      vi.useFakeTimers();
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SAY, params: { text: 'Hello!' } },
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.speech).toBe('Hello!');
      vi.useRealTimers();
    });

    it('defaults to empty string when no text', () => {
      vi.useFakeTimers();
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SAY, params: {} },
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.speech).toBe('');
      vi.useRealTimers();
    });
  });

  describe('SPAWN_ENEMY', () => {
    it('pushes a new enemy to spriteState enemies array', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_ENEMY, params: { text: '👻' } },
        spriteStateRef: { current: createMockSpriteState({ enemies: [] }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.enemies).toHaveLength(1);
      expect(ctx.spriteStateRef.current.enemies[0].emoji).toBe('👻');
      expect(ctx.spriteStateRef.current.enemies[0].type).toBe('enemy');
    });

    it('defaults emoji to 👾', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_ENEMY, params: {} },
        spriteStateRef: { current: createMockSpriteState({ enemies: [] }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.enemies[0].emoji).toBe('👾');
    });
  });

  describe('SPAWN_ITEM', () => {
    it('pushes a new item to spriteState items array', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_ITEM, params: { text: '⭐' } },
        spriteStateRef: { current: createMockSpriteState({ items: [] }) } as any,
      });
      handleCoreCommand(ctx);
      expect(ctx.spriteStateRef.current.items).toHaveLength(1);
      expect(ctx.spriteStateRef.current.items[0].emoji).toBe('⭐');
      expect(ctx.spriteStateRef.current.items[0].type).toBe('item');
    });
  });

  describe('GAME_OVER', () => {
    it('sets game state to "over" and stops execution', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.GAME_OVER, params: {} },
      });
      handleCoreCommand(ctx);
      expect(ctx.setGameState).toHaveBeenCalledWith('over');
      expect(ctx.stopExecution.current).toBe(true);
    });
  });

  describe('WIN_GAME', () => {
    it('sets game state to "won" and stops execution', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.WIN_GAME, params: {} },
      });
      handleCoreCommand(ctx);
      expect(ctx.setGameState).toHaveBeenCalledWith('won');
      expect(ctx.stopExecution.current).toBe(true);
    });
  });
});
