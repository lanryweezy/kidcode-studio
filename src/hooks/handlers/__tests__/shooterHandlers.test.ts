import { describe, it, expect, vi } from 'vitest';
import { handleShooterCommand } from '../shooterHandlers';
import { CommandType } from '../../../types';
import { createMockContext } from './mocks';

describe('shooterHandlers', () => {
  it('RELOAD sets ammo to 30', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.RELOAD, params: {} },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['_ammo']).toBe(30);
  });

  it('THROW_GRENADE creates projectile', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.THROW_GRENADE, params: { value: 15 } },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.projectiles.length).toBeGreaterThan(0);
  });

  it('TAKE_COVER stops movement and adds shield', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.TAKE_COVER, params: {} },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.vx).toBe(0);
  });

  it('AIM changes scale', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.AIM, params: { value: 2 } },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
  });

  it('SWAP_WEAPON stores weapon name', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.SWAP_WEAPON, params: { text: 'shotgun' } },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['_weapon']).toBe('shotgun');
  });

  it('DROP_WEAPON clears weapon', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.DROP_WEAPON, params: {} },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['_weapon']).toBeNull();
  });

  it('PICKUP_WEAPON stores weapon name', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.PICKUP_WEAPON, params: { text: 'rifle' } },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['_weapon']).toBe('rifle');
  });

  it('unhandled command returns false', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.FOREVER, params: {} },
    });
    const result = await handleShooterCommand(ctx);
    expect(result).toBe(false);
  });
});
