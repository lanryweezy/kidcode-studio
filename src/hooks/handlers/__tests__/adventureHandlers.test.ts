import { describe, it, expect, vi } from 'vitest';
import { handleAdventureCommand } from '../adventureHandlers';
import { CommandType } from '../../../types';
import { createMockContext, createMockSpriteState } from './mocks';

vi.mock('../../../store/useStore', () => ({
  useStore: {
    getState: vi.fn().mockReturnValue({ npcChat: null }),
  },
}));

describe('adventureHandlers', () => {
  describe('TALK_TO', () => {
    it('sets NPC chat with provided name', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TALK_TO, params: { text: 'Merchant' } },
      });
      const result = await handleAdventureCommand(ctx);
      expect(ctx.setNpcChat).toHaveBeenCalledWith({ name: 'Merchant', message: 'Hello there!' });
      expect(result).toBe(true);
    });

    it('defaults NPC name to "NPC"', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TALK_TO, params: {} },
      });
      handleAdventureCommand(ctx);
      expect(ctx.setNpcChat).toHaveBeenCalledWith({ name: 'NPC', message: 'Hello there!' });
    });
  });

  describe('ADD_QUEST', () => {
    it('sets quest variable on sprite state', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ADD_QUEST, params: { text: 'Find the Dragon Egg' } },
      });
      handleAdventureCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_quest']).toBe('Find the Dragon Egg');
    });

    it('defaults to "Quest"', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ADD_QUEST, params: {} },
      });
      handleAdventureCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_quest']).toBe('Quest');
    });
  });

  describe('COMPLETE_QUEST', () => {
    it('sets _quest_complete to true and adds score', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.COMPLETE_QUEST, params: {} },
        spriteStateRef: { current: createMockSpriteState({ score: 100 }) } as any,
      });
      handleAdventureCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_quest_complete']).toBe(true);
      expect(ctx.spriteStateRef.current.score).toBe(600);
      expect(ctx.playSound).toHaveBeenCalledWith('victory');
    });
  });

  describe('DISCOVER', () => {
    it('sets _discovered variable and adds score', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DISCOVER, params: { text: 'Hidden Cave' } },
        spriteStateRef: { current: createMockSpriteState({ score: 0 }) } as any,
      });
      handleAdventureCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_discovered']).toBe('Hidden Cave');
      expect(ctx.spriteStateRef.current.score).toBe(100);
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });

    it('defaults location to "Location"', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DISCOVER, params: {} },
        spriteStateRef: { current: createMockSpriteState({ score: 0 }) } as any,
      });
      handleAdventureCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_discovered']).toBe('Location');
    });
  });

  describe('EXAMINE', () => {
    it('sets NPC chat with examine message', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.EXAMINE, params: { text: 'old chest' } },
      });
      const result = await handleAdventureCommand(ctx);
      expect(ctx.setNpcChat).toHaveBeenCalledWith({
        name: 'System',
        message: 'You examine the old chest...',
      });
      expect(result).toBe(true);
    });

    it('defaults to "area" when no text', () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.EXAMINE, params: {} },
      });
      handleAdventureCommand(ctx);
      expect(ctx.setNpcChat).toHaveBeenCalledWith({
        name: 'System',
        message: 'You examine the area...',
      });
    });
  });

  describe('default case', () => {
    it('returns false for unknown adventure command', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: 'UNKNOWN_CMD' as any, params: {} },
      });
      expect(await handleAdventureCommand(ctx)).toBe(false);
    });
  });
});
