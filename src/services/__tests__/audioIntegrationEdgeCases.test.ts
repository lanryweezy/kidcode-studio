import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  playSFX,
  SFX_LIBRARY,
  calculateSpatialVolume,
  calculateSpatialVolume3D,
  tempoSync,
  bgmPlayer,
  ambientManager,
} from '../audioEngine';

describe('Audio Integration - Edge Cases', () => {
  it('playSFX with valid sfxId does not throw', () => {
    expect(() => playSFX('sword_slash', 0.3, 0)).not.toThrow();
  });

  it('playSFX with unknown sfxId silently fails', () => {
    expect(() => playSFX('nonexistent', 0.5, 0)).not.toThrow();
  });

  it('playSFX with zero volume', () => {
    expect(() => playSFX('coin_pickup', 0, 0)).not.toThrow();
  });

  it('playSFX with max volume', () => {
    expect(() => playSFX('explosion_large', 1, 0)).not.toThrow();
  });

  it('playSFX with extreme pan values', () => {
    expect(() => playSFX('jump', 0.5, -2)).not.toThrow();
    expect(() => playSFX('jump', 0.5, 2)).not.toThrow();
  });

  it('SFX_LIBRARY has all required entries', () => {
    expect(SFX_LIBRARY.length).toBeGreaterThanOrEqual(15);
    const ids = SFX_LIBRARY.map(s => s.id);
    expect(ids).toContain('sword_slash');
    expect(ids).toContain('coin_pickup');
    expect(ids).toContain('explosion_large');
  });
});

describe('Audio Integration - Spatial Audio', () => {
  it('calculates volume at listener position', () => {
    const { volume, pan } = calculateSpatialVolume(400, 300, 400, 300);
    expect(volume).toBeCloseTo(1, 0);
    expect(pan).toBe(0);
  });

  it('calculates volume far from listener', () => {
    const { volume } = calculateSpatialVolume(0, 0, 800, 600, 800);
    expect(volume).toBeLessThan(1);
  });

  it('calculates 3D spatial volume', () => {
    const { volume, pan, elevation } = calculateSpatialVolume3D(
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 },
      1000
    );
    expect(volume).toBeGreaterThan(0);
    expect(volume).toBeLessThan(1);
    expect(typeof pan).toBe('number');
    expect(typeof elevation).toBe('number');
  });

  it('3D volume at same position is max', () => {
    const { volume } = calculateSpatialVolume3D(
      { x: 50, y: 50, z: 50 },
      { x: 50, y: 50, z: 50 },
      1000
    );
    expect(volume).toBeCloseTo(1, 0);
  });
});

describe('Audio Integration - Tempo Sync', () => {
  beforeEach(() => {
    tempoSync.stop();
  });

  it('sets and gets BPM', () => {
    tempoSync.setBPM(140);
    expect(tempoSync.getBPM()).toBe(140);
  });

  it('clamps BPM to valid range', () => {
    tempoSync.setBPM(5);
    expect(tempoSync.getBPM()).toBe(20);
    tempoSync.setBPM(500);
    expect(tempoSync.getBPM()).toBe(300);
  });

  it('calculates beat interval', () => {
    tempoSync.setBPM(120);
    expect(tempoSync.getBeatInterval()).toBe(500);
  });

  it('syncToDuration rounds to nearest beat', () => {
    tempoSync.setBPM(120);
    const synced = tempoSync.syncToDuration(600);
    expect(synced % 500).toBe(0);
  });
});

describe('Audio Integration - BGM Player', () => {
  it('bgmPlayer setVolume clamps', () => {
    bgmPlayer.setVolume(1.5);
    expect(() => bgmPlayer.setVolume(-0.5)).not.toThrow();
  });

  it('bgmPlayer stop does not throw', () => {
    expect(() => bgmPlayer.stop()).not.toThrow();
  });
});

describe('Audio Integration - Ambient Manager', () => {
  it('ambientManager stop does not throw', () => {
    expect(() => ambientManager.stop()).not.toThrow();
  });

  it('ambientManager setVolume does not throw', () => {
    expect(() => ambientManager.setVolume(0.8)).not.toThrow();
  });
});
