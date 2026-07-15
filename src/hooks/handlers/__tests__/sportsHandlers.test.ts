import { describe, it, expect, vi } from 'vitest';
import { handleSportsCommand } from '../sportsHandlers';
import { CommandType } from '../../../types';
import { createMockContext } from './mocks';

describe('sportsHandlers', () => {
  describe('KICK_BALL', () => {
    it('applies velocity to the ball item', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.KICK_BALL, params: { text: '⚽', value: 10 } },
        spriteStateRef: {
          current: {
            rotation: 90,
            items: [{ id: 'ball', emoji: '⚽', x: 100, y: 100, vx: 0, vy: 0, type: 'item' }],
          },
        } as any,
      });
      expect(await handleSportsCommand(ctx)).toBe(true);
      const ball = ctx.spriteStateRef.current.items[0];
      expect(Math.abs(ball.vx) + Math.abs(ball.vy)).toBeGreaterThan(0);
      expect(ctx.playSound).toHaveBeenCalledWith('kick');
    });

    it('uses default kick force of 10', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.KICK_BALL, params: {} },
        spriteStateRef: {
          current: {
            rotation: 0,
            items: [{ id: 'ball', emoji: '⚽', x: 100, y: 100, vx: 0, vy: 0, type: 'item' }],
          },
        } as any,
      });
      await handleSportsCommand(ctx);
      const ball = ctx.spriteStateRef.current.items[0];
      expect(Math.abs(ball.vx) + Math.abs(ball.vy)).toBeGreaterThan(0);
    });

    it('does nothing if no matching ball', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.KICK_BALL, params: { text: '⚽', value: 10 } },
        spriteStateRef: { current: { rotation: 0, items: [] } } as any,
      });
      expect(await handleSportsCommand(ctx)).toBe(true);
    });
  });

  describe('SET_TIMER / TICK_TIMER / STOP_TIMER', () => {
    it('SET_TIMER sets the _timer variable', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_TIMER, params: { value: 90 } },
      });
      expect(await handleSportsCommand(ctx)).toBe(true);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(90);
    });

    it('SET_TIMER defaults to 90', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_TIMER, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(90);
    });

    it('TICK_TIMER decrements the timer', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TICK_TIMER, params: {} },
        spriteStateRef: { current: { variables: { _timer: 90 } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(89);
    });

    it('TICK_TIMER does not go below 0', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TICK_TIMER, params: {} },
        spriteStateRef: { current: { variables: { _timer: 0 } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(0);
    });

    it('TICK_TIMER ignores non-numeric timer', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TICK_TIMER, params: {} },
        spriteStateRef: { current: { variables: { _timer: 'foo' } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe('foo');
    });

    it('STOP_TIMER pauses the timer', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.STOP_TIMER, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer_paused']).toBe(true);
    });
  });

  describe('SCORE_GOAL', () => {
    it('increments home_score and score', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SCORE_GOAL, params: { value: 1 } },
        spriteStateRef: { current: { variables: { home_score: 0 }, score: 0 } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['home_score']).toBe(1);
      expect(ctx.spriteStateRef.current.score).toBe(100);
    });

    it('defaults to 1 goal', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SCORE_GOAL, params: {} },
        spriteStateRef: { current: { variables: {}, score: 0 } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['home_score']).toBe(1);
      expect(ctx.spriteStateRef.current.score).toBe(100);
    });
  });

  describe('ADD_PERIOD / END_PERIOD', () => {
    it('ADD_PERIOD sets period name', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.ADD_PERIOD, params: { text: '2nd Half' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_period']).toBe('2nd Half');
    });

    it('END_PERIOD clears period', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.END_PERIOD, params: {} },
        spriteStateRef: { current: { variables: { _period: '1st Half' } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_period']).toBeNull();
    });
  });

  describe('SPAWN_BALL / SPAWN_TEAMMATE / SPAWN_OPPONENT', () => {
    it('SPAWN_BALL adds a ball to items', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_BALL, params: { text: '⚽' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.items.length).toBe(1);
      expect(ctx.spriteStateRef.current.items[0].emoji).toBe('⚽');
    });

    it('SPAWN_TEAMMATE adds a teammate to enemies', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_TEAMMATE, params: { text: '🏃' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.enemies.length).toBe(1);
      expect(ctx.spriteStateRef.current.enemies[0].behavior).toBe('teammate');
    });

    it('SPAWN_OPPONENT adds an opponent to enemies', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SPAWN_OPPONENT, params: { text: '🏃' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.enemies.length).toBe(1);
      expect(ctx.spriteStateRef.current.enemies[0].behavior).toBe('chase');
    });
  });

  describe('PENALTY_KICK / CORNER_KICK / FREE_KICK', () => {
    it('PENALTY_KICK sets vx to 20', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.PENALTY_KICK, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(20);
      expect(ctx.playSound).toHaveBeenCalledWith('kick');
    });

    it('CORNER_KICK sets velocity', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CORNER_KICK, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.vy).toBe(-15);
      expect(ctx.spriteStateRef.current.vx).toBe(10);
    });

    it('FREE_KICK uses param value', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.FREE_KICK, params: { value: 25 } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.vx).toBe(25);
    });
  });

  describe('YELLOW_CARD / RED_CARD / FOUL', () => {
    it('YELLOW_CARD increments yellow_cards', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.YELLOW_CARD, params: {} },
        spriteStateRef: { current: { variables: {} } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['yellow_cards']).toBe(1);
    });

    it('RED_CARD sets red_card to true', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.RED_CARD, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['red_card']).toBe(true);
    });

    it('FOUL sets foul variable and plays whistle', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.FOUL, params: { text: 'tripping' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_foul']).toBe('tripping');
      expect(ctx.playSound).toHaveBeenCalledWith('whistle');
    });
  });

  describe('CELEBRATE_GOAL', () => {
    it('sets effectTrigger and adds score', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.CELEBRATE_GOAL, params: {} },
        spriteStateRef: { current: { x: 100, y: 100, score: 0 } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.effectTrigger).toBeDefined();
      expect(ctx.spriteStateRef.current.score).toBe(500);
      expect(ctx.playSound).toHaveBeenCalledWith('victory');
    });
  });

  describe('EXTRA_TIME / INJURY_TIME', () => {
    it('EXTRA_TIME adds time to timer', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.EXTRA_TIME, params: { value: 30 } },
        spriteStateRef: { current: { variables: { _timer: 60 } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(90);
    });

    it('INJURY_TIME adds time to timer', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.INJURY_TIME, params: { value: 5 } },
        spriteStateRef: { current: { variables: { _timer: 90 } } } as any,
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_timer']).toBe(95);
    });
  });

  describe('TEAM_TALK / MAN_MARK / SET_FORMATION', () => {
    it('TEAM_TALK sets morale to 100', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.TEAM_TALK, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_team_morale']).toBe(100);
    });

    it('MAN_MARK enables man marking', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.MAN_MARK, params: {} },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_man_marking']).toBe(true);
    });

    it('SET_FORMATION sets formation', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: CommandType.SET_FORMATION, params: { text: '4-3-3' } },
      });
      await handleSportsCommand(ctx);
      expect(ctx.spriteStateRef.current.variables['_formation']).toBe('4-3-3');
    });
  });

  describe('default case', () => {
    it('returns false for unknown command', async () => {
      const ctx = createMockContext({
        cmd: { id: '1', type: 'UNKNOWN_CMD' as any, params: {} },
      });
      expect(await handleSportsCommand(ctx)).toBe(false);
    });
  });
});
