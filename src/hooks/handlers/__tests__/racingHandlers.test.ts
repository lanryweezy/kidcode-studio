import { describe, it, expect, vi } from 'vitest';
import { handleRacingCommand } from '../racingHandlers';
import { CommandType } from '../../../types';
import { createMockContext } from './mocks';

describe('racingHandlers', () => {
  describe('BOOST', () => {
    it('adds velocity and sets speed powerup', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.BOOST, params: { value: 30 } },
        spriteStateRef: { current: { vx: 0, powerups: {} } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.vx).toBe(30);
      expect(ctx.spriteStateRef.current.powerups.speed).toBe(30);
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });

    it('defaults boost to 20', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.BOOST, params: {} },
        spriteStateRef: { current: { vx: 0, powerups: {} } } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(20);
    });
  });

  describe('DRIFT', () => {
    it('halves vx and adds vy', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DRIFT, params: { value: 5 } },
        spriteStateRef: { current: { vx: 20, vy: 0 } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.vx).toBe(10);
      expect(ctx.spriteStateRef.current.vy).toBe(5);
      expect(ctx.playSound).toHaveBeenCalledWith('dash');
    });

    it('defaults drift vy to 0', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.DRIFT, params: {} },
        spriteStateRef: { current: { vx: 40, vy: 0 } } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(20);
      expect(ctx.spriteStateRef.current.vy).toBe(0);
    });
  });

  describe('LAP_COMPLETE', () => {
    it('increments laps and adds score', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.LAP_COMPLETE, params: {} },
        spriteStateRef: { current: { variables: { laps: 0 }, score: 0 } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['laps']).toBe(1);
      expect(ctx.spriteStateRef.current.score).toBe(100);
      expect(ctx.playSound).toHaveBeenCalledWith('victory');
    });

    it('defaults laps from 0', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.LAP_COMPLETE, params: {} },
        spriteStateRef: { current: { variables: {}, score: 50 } } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['laps']).toBe(1);
      expect(ctx.spriteStateRef.current.score).toBe(150);
    });
  });

  describe('START_RACE', () => {
    it('sets _race_started to true', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.START_RACE, params: {} },
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_race_started']).toBe(true);
    });
  });

  describe('SET_CHECKPOINT', () => {
    it('sets _checkpoint variable and plays coin sound', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_CHECKPOINT, params: {} },
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_checkpoint']).toBe(true);
      expect(ctx.playSound).toHaveBeenCalledWith('coin');
    });
  });

  describe('CREATE_CHECKPOINT', () => {
    it('creates a checkpoint object', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CREATE_CHECKPOINT, params: { text: 'Start Line' } },
        spriteStateRef: { current: { x: 200, y: 300 } } as any,
      });
      await handleRacingCommand(ctx);
      const cp = ctx.spriteStateRef.current.lastCheckpoint;
      expect(cp).toBeDefined();
      expect(cp!.x).toBe(200);
      expect(cp!.y).toBe(300);
      expect(cp!.name).toBe('Start Line');
      expect(cp!.unlocked).toBe(true);
    });
  });

  describe('LOAD_CHECKPOINT', () => {
    it('restores position from lastCheckpoint', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.LOAD_CHECKPOINT, params: {} },
        spriteStateRef: {
          current: {
            x: 0, y: 0,
            lastCheckpoint: { id: 'cp1', x: 500, y: 600, name: 'cp', unlocked: true },
          },
        } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.x).toBe(500);
      expect(ctx.spriteStateRef.current.y).toBe(600);
    });

    it('does nothing without a checkpoint', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.LOAD_CHECKPOINT, params: {} },
        spriteStateRef: { current: { x: 10, y: 20 } } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.x).toBe(10);
    });
  });

  describe('UPGRADE_CAR', () => {
    it('increments car stat variable', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.UPGRADE_CAR, params: { text: 'speed', value: 2 } },
        spriteStateRef: { current: { variables: {} } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_car_speed']).toBe(2);
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });

    it('defaults stat to speed and value to 1', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.UPGRADE_CAR, params: {} },
        spriteStateRef: { current: { variables: {} } } as any,
      });
      await handleRacingCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_car_speed']).toBe(1);
    });
  });

  describe('PIT_STOP', () => {
    it('restores health to maxHealth', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.PIT_STOP, params: {} },
        spriteStateRef: { current: { health: 30, maxHealth: 100 } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.health).toBe(100);
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });
  });

  describe('USE_BOOST_PAD', () => {
    it('adds 15 velocity and sets effect', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.USE_BOOST_PAD, params: {} },
        spriteStateRef: { current: { x: 100, y: 100, vx: 0 } } as any,
      });
      expect(await handleRacingCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.vx).toBe(15);
      expect(ctx.spriteStateRef.current.effectTrigger?.type).toBe('sparkle');
      expect(ctx.playSound).toHaveBeenCalledWith('powerup');
    });
  });

  describe('default case', () => {
    it('returns false for unknown command', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: 'UNKNOWN_CMD' as any, params: {} },
      });
      expect(await handleRacingCommand(ctx)).toBe(false);
    });
  });
});
