import { describe, it, expect, vi } from 'vitest';
import { handleActionCommand } from '../actionHandlers';
import { CommandType, GameEntity } from '../../../types';
import { createMockContext } from './mocks';

const makeEnemy = (x: number, y: number, behavior?: string): GameEntity => ({
  id: 'e1', x, y, type: 'enemy', emoji: '👹', behavior: behavior as any,
});

describe('actionHandlers', () => {
  describe('SWING_WEAPON', () => {
    it('knocks back nearby enemies and plays attack sound', async () => {
      const enemy = makeEnemy(130, 110);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SWING_WEAPON, params: { value: 10 } },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [enemy] } } as any,
      });
      expect(await handleActionCommand(ctx)).toBe(true);
      expect(enemy.x).toBe(160);
      expect(enemy.y).toBe(130);
      expect(ctx.playSound).toHaveBeenCalledWith('attack');
    });

    it('does not knock back teammates', async () => {
      const teammate = makeEnemy(130, 110, 'teammate');
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SWING_WEAPON, params: { value: 10 } },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [teammate] } } as any,
      });
      await handleActionCommand(ctx);
      expect(teammate.x).toBe(130);
      expect(teammate.y).toBe(110);
    });

    it('ignores enemies out of range', async () => {
      const farEnemy = makeEnemy(500, 500);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SWING_WEAPON, params: { value: 10 } },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [farEnemy] } } as any,
      });
      await handleActionCommand(ctx);
      expect(farEnemy.x).toBe(500);
    });
  });

  describe('COMBO_ATTACK', () => {
    it('applies knockback multiple times', async () => {
      const enemy = makeEnemy(130, 110);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.COMBO_ATTACK, params: { value: 3 } },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [enemy] } } as any,
      });
      await handleActionCommand(ctx);
      expect(enemy.x).toBe(160);
    });
  });

  describe('DODGE_ROLL', () => {
    it('adds dodge velocity in positive direction', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DODGE_ROLL, params: { value: 8 } },
        spriteStateRef: { current: { vx: 0, scale: 1 } } as any,
      });
      await handleActionCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(8);
      expect(ctx.playSound).toHaveBeenCalledWith('dash');
    });

    it('subtracts dodge velocity when scale is negative', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DODGE_ROLL, params: { value: 8 } },
        spriteStateRef: { current: { vx: 0, scale: -1 } } as any,
      });
      await handleActionCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(-8);
    });
  });

  describe('BLOCK_ATTACK', () => {
    it('sets shield powerup to 30', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.BLOCK_ATTACK, params: {} },
        spriteStateRef: { current: { powerups: {} } } as any,
      });
      await handleActionCommand(ctx);
      expect(ctx.spriteStateRef.current.powerups.shield).toBe(30);
    });
  });

  describe('SPECIAL_MOVE', () => {
    it('knocks back nearby enemies and sets effect trigger', async () => {
      const enemy = makeEnemy(150, 120);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPECIAL_MOVE, params: {} },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [enemy] } } as any,
      });
      await handleActionCommand(ctx);
      expect(enemy.x).toBe(150 + 80);
      expect(enemy.y).toBe(120 + 60);
      expect(ctx.spriteStateRef.current.effectTrigger?.type).toBe('explosion');
      expect(ctx.playSound).toHaveBeenCalledWith('explosion');
    });

    it('ignores enemies beyond 120px range', async () => {
      const farEnemy = makeEnemy(300, 300);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPECIAL_MOVE, params: {} },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [farEnemy] } } as any,
      });
      await handleActionCommand(ctx);
      expect(farEnemy.x).toBe(300);
    });
  });

  describe('SWITCH_WEAPON', () => {
    it('sets weapon variable', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SWITCH_WEAPON, params: { text: 'bow' } },
      });
      await handleActionCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_weapon']).toBe('bow');
    });
  });

  describe('CHARGE_ATTACK', () => {
    it('knocks back nearby non-teammate enemies', async () => {
      const enemy = makeEnemy(150, 100);
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CHARGE_ATTACK, params: {} },
        spriteStateRef: { current: { x: 100, y: 100, enemies: [enemy] } } as any,
      });
      await handleActionCommand(ctx);
      expect(enemy.x).toBe(150 + 50);
    });
  });

  describe('SCREEN_SHAKE', () => {
    it('sets screenShake based on param value', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SCREEN_SHAKE, params: { value: 1 } },
        spriteStateRef: { current: { screenShake: 0 } } as any,
      });
      await handleActionCommand(ctx);
      expect(ctx.spriteStateRef.current.screenShake).toBe(60);
    });
  });

  describe('default case', () => {
    it('returns false for unknown command', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: 'UNKNOWN_CMD' as any, params: {} },
      });
      expect(await handleActionCommand(ctx)).toBe(false);
    });
  });
});
