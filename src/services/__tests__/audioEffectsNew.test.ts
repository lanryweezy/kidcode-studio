import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createChorus,
  createFlanger,
  createPhaser,
  createTremolo,
  createVibrato,
  DEFAULT_CHORUS,
  DEFAULT_FLANGER,
  DEFAULT_PHASER,
  DEFAULT_TREMOLO,
  DEFAULT_VIBRATO,
} from '../audioEffects';

// ─── Mock AudioContext ───

function createMockCtx(): AudioContext {
  const makeParam = () => ({
    value: 0,
    setValueAtTime: vi.fn().mockReturnThis(),
    linearRampToValueAtTime: vi.fn().mockReturnThis(),
    exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
  });

  const makeNode = () => ({
    gain: makeParam(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    frequency: makeParam(),
    Q: makeParam(),
    type: '',
    pan: { value: 0 },
  });

  return {
    currentTime: 0,
    createGain: vi.fn(makeNode),
    createDelay: vi.fn((max?: number) => ({
      ...makeNode(),
      delayTime: makeParam(),
    })),
    createOscillator: vi.fn(() => ({
      ...makeNode(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
      frequency: makeParam(),
      connect: vi.fn(),
    })),
    createConstantSource: vi.fn(() => ({
      offset: makeParam(),
      start: vi.fn(),
      connect: vi.fn(),
    })),
    createBiquadFilter: vi.fn(() => ({
      ...makeNode(),
      type: 'allpass',
    })),
  } as unknown as AudioContext;
}

// ─── Audio Effects Tests ───

describe('Audio Effects - Chorus', () => {
  it('creates chorus effect with default options', () => {
    const ctx = createMockCtx();
    const { input, output } = createChorus(ctx, DEFAULT_CHORUS);
    expect(input).toBeDefined();
    expect(output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createDelay).toHaveBeenCalled();
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('creates chorus with custom options', () => {
    const ctx = createMockCtx();
    const { input, output } = createChorus(ctx, {
      wet: 0.6, bypass: false, rate: 2.5, depth: 0.9, feedback: 0.5, delay: 0.04,
    });
    expect(input).toBeDefined();
    expect(output).toBeDefined();
  });

  it('chorus defaults have valid ranges', () => {
    expect(DEFAULT_CHORUS.wet).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CHORUS.wet).toBeLessThanOrEqual(1);
    expect(DEFAULT_CHORUS.rate).toBeGreaterThan(0);
    expect(DEFAULT_CHORUS.depth).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CHORUS.depth).toBeLessThanOrEqual(1);
    expect(DEFAULT_CHORUS.feedback).toBeGreaterThanOrEqual(-1);
    expect(DEFAULT_CHORUS.feedback).toBeLessThanOrEqual(1);
  });
});

describe('Audio Effects - Flanger', () => {
  it('creates flanger effect', () => {
    const ctx = createMockCtx();
    const { input, output } = createFlanger(ctx, DEFAULT_FLANGER);
    expect(input).toBeDefined();
    expect(output).toBeDefined();
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('flanger defaults valid', () => {
    expect(DEFAULT_FLANGER.wet).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_FLANGER.wet).toBeLessThanOrEqual(1);
    expect(DEFAULT_FLANGER.rate).toBeGreaterThan(0);
  });
});

describe('Audio Effects - Phaser', () => {
  it('creates phaser effect', () => {
    const ctx = createMockCtx();
    const { input, output } = createPhaser(ctx, DEFAULT_PHASER);
    expect(input).toBeDefined();
    expect(output).toBeDefined();
  });

  it('phaser creates correct number of allpass filters', () => {
    const ctx = createMockCtx();
    createPhaser(ctx, { ...DEFAULT_PHASER, stages: 6 });
    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(6);
  });
});

describe('Audio Effects - Tremolo', () => {
  it('creates tremolo effect', () => {
    const ctx = createMockCtx();
    const { input, output } = createTremolo(ctx, DEFAULT_TREMOLO);
    expect(input).toBeDefined();
    expect(output).toBeDefined();
  });

  it('tremolo defaults valid', () => {
    expect(DEFAULT_TREMOLO.rate).toBeGreaterThan(0);
    expect(DEFAULT_TREMOLO.depth).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_TREMOLO.depth).toBeLessThanOrEqual(1);
  });
});

describe('Audio Effects - Vibrato', () => {
  it('creates vibrato effect', () => {
    const ctx = createMockCtx();
    const { input, output } = createVibrato(ctx, DEFAULT_VIBRATO);
    expect(input).toBeDefined();
    expect(output).toBeDefined();
  });

  it('vibrato defaults valid', () => {
    expect(DEFAULT_VIBRATO.rate).toBeGreaterThan(0);
    expect(DEFAULT_VIBRATO.depth).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_VIBRATO.depth).toBeLessThanOrEqual(1);
  });
});
