import { describe, it, expect, vi } from 'vitest';
import { handleSurvivalCommand } from '../survivalHandlers';
import { CommandType } from '../../../types';
import { createMockContext, createMockSpriteState } from './mocks';

describe('survivalHandlers', () => {
  it('GATHER adds resource', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.GATHER, params: { text: 'wood', value: 3 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(3);
  });

  it('GATHER defaults to wood with value 1', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.GATHER, params: {} },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(1);
  });

  it('CRAFT deducts wood and marks crafted', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { wood: 10 } }) },
      cmd: { id: '1', type: CommandType.CRAFT, params: { text: 'axe', value: 2 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(8);
    expect(ctx.spriteStateRef.current.variables['_crafted_axe']).toBe(true);
  });

  it('CRAFT does nothing if insufficient wood', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { wood: 1 } }) },
      cmd: { id: '1', type: CommandType.CRAFT, params: { text: 'axe', value: 5 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(1);
    expect(ctx.spriteStateRef.current.variables['_crafted_axe']).toBeUndefined();
  });

  it('EAT increases hunger', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { hunger: 50 } }) },
      cmd: { id: '1', type: CommandType.EAT, params: { value: 30 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['hunger']).toBe(80);
  });

  it('EAT caps at 100', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { hunger: 90 } }) },
      cmd: { id: '1', type: CommandType.EAT, params: { value: 30 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['hunger']).toBe(100);
  });

  it('DRINK increases fresh_water', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { fresh_water: 40 } }) },
      cmd: { id: '1', type: CommandType.DRINK, params: { value: 25 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['fresh_water']).toBe(65);
  });

  it('DRINK caps at 100', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { fresh_water: 90 } }) },
      cmd: { id: '1', type: CommandType.DRINK, params: { value: 25 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['fresh_water']).toBe(100);
  });

  it('BUILD deducts wood and creates structure', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { wood: 15 } }) },
      cmd: { id: '1', type: CommandType.BUILD, params: { text: 'wall', value: 5 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(10);
    expect(ctx.spriteStateRef.current.variables['_built_wall']).toBe(true);
    expect(ctx.spriteStateRef.current.items.length).toBeGreaterThan(0);
  });

  it('BUILD does nothing if insufficient wood', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { wood: 2 } }) },
      cmd: { id: '1', type: CommandType.BUILD, params: { text: 'wall', value: 5 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['wood']).toBe(2);
    expect(ctx.spriteStateRef.current.items.length).toBe(0);
  });

  it('PLACE_TORCH creates torch item', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.PLACE_TORCH, params: {} },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.items.length).toBeGreaterThan(0);
  });

  it('SHELTER increments shelter level', async () => {
    const ctx = createMockContext({
      spriteStateRef: { current: createMockSpriteState({ variables: { '_shelter_level': 1 } }) },
      cmd: { id: '1', type: CommandType.SHELTER, params: { value: 1 } },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(true);
    expect(ctx.spriteStateRef.current.variables['_shelter_level']).toBe(2);
  });

  it('unhandled command returns false', async () => {
    const ctx = createMockContext({
      cmd: { id: '1', type: CommandType.FOREVER, params: {} },
    });
    const result = await handleSurvivalCommand(ctx);
    await expect(result).toBe(false);
  });
});
