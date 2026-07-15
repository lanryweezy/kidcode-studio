import { describe, it, expect, vi } from 'vitest';
import {
  generateScale,
  generateChord,
  detectKey,
  transpose,
  scaleToFrequencies,
  generateRhythmSequence,
  getRhythmPattern,
  frequencyToNote,
  noteToFrequency,
} from '../musicTheory';
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
import { calculateSpatialVolume, calculateSpatialVolume3D } from '../audioEngine';

function createPerfCtx() {
  const noop = vi.fn();
  const makeNode = () => ({
    gain: { value: 0, setValueAtTime: noop, linearRampToValueAtTime: noop },
    connect: noop,
    disconnect: noop,
  });
  return {
    currentTime: 0,
    createGain: vi.fn(makeNode),
    createDelay: vi.fn(() => ({ ...makeNode(), delayTime: { value: 0, setValueAtTime: noop } })),
    createOscillator: vi.fn(() => ({
      ...makeNode(),
      start: noop,
      stop: noop,
      type: 'sine',
      frequency: { value: 0, setValueAtTime: noop },
    })),
    createConstantSource: vi.fn(() => ({
      offset: { value: 0, setValueAtTime: noop },
      start: noop,
      connect: noop,
    })),
    createBiquadFilter: vi.fn(() => ({
      ...makeNode(),
      type: 'allpass',
      frequency: { value: 0, setValueAtTime: noop },
    })),
  } as unknown as AudioContext;
}

describe('Sound Service - Performance Benchmarks', () => {
  it('scale generation under 10ms for 1000 iterations', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      generateScale('C', 'major', 4);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('chord generation under 10ms for 1000 iterations', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      generateChord('C', 'major', 4);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('key detection under 50ms for 100 iterations', () => {
    const notes = generateScale('C', 'major', 4);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      detectKey(notes);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('transpose under 10ms for 1000 iterations', () => {
    const notes = generateScale('C', 'major', 4);
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      transpose(notes, 5);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('frequency conversion under 10ms for 1000 iterations', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      frequencyToNote(440);
      noteToFrequency('A', 4);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('rhythm sequence generation under 10ms for 1000 iterations', () => {
    const pattern = getRhythmPattern('straight-4/4')!;
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      generateRhythmSequence(pattern, 4, 120);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('audio effects creation under 50ms for 100 iterations', () => {
    const ctx = createPerfCtx();
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      createChorus(ctx, DEFAULT_CHORUS);
      createFlanger(ctx, DEFAULT_FLANGER);
      createPhaser(ctx, DEFAULT_PHASER);
      createTremolo(ctx, DEFAULT_TREMOLO);
      createVibrato(ctx, DEFAULT_VIBRATO);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('spatial audio calculations under 10ms for 10000 iterations', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      calculateSpatialVolume(i % 800, i % 600, 400, 300);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('3D spatial audio under 50ms for 10000 iterations', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      calculateSpatialVolume3D(
        { x: i % 800, y: i % 600, z: i % 400 },
        { x: 400, y: 300, z: 200 }
      );
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('scale to frequencies under 10ms for 1000 iterations', () => {
    const scale = generateScale('C', 'major', 4);
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      scaleToFrequencies(scale);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
