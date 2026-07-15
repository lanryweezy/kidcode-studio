import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyADSR,
  createFilter,
  createReverb,
  createDelay,
  createDistortion,
  createCompressor,
  DEFAULT_ADSR,
  playSoundEffect,
  spatialPlaySound,
  setMuted,
  getMuted,
  initSoundPool,
  disposeSoundPool,
} from '../soundService';

describe('Sound Service - ADSR Envelope', () => {
  let mockGainNode: GainNode;
  let mockGainParam: { value: number; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockGainParam = {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    };
    mockGainNode = {
      gain: mockGainParam,
    } as unknown as GainNode;
  });

  it('applies ADSR envelope with default values', () => {
    applyADSR(mockGainNode, 0.5, DEFAULT_ADSR, 0);
    expect(mockGainParam.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(mockGainParam.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 0.01);
    expect(mockGainParam.linearRampToValueAtTime).toHaveBeenCalledWith(0.35, 0.11);
  });

  it('applies ADSR with custom envelope', () => {
    const custom = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 };
    applyADSR(mockGainNode, 1.0, custom, 1.0);
    expect(mockGainParam.setValueAtTime).toHaveBeenCalledWith(0, 1.0);
    expect(mockGainParam.linearRampToValueAtTime).toHaveBeenCalledWith(1.0, 1.1);
    expect(mockGainParam.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 1.3);
  });

  it('handles zero peak volume', () => {
    applyADSR(mockGainNode, 0, DEFAULT_ADSR, 0);
    expect(mockGainParam.setValueAtTime).toHaveBeenCalledWith(0, 0);
  });

  it('DEFAULT_ADSR has valid ranges', () => {
    expect(DEFAULT_ADSR.attack).toBeGreaterThan(0);
    expect(DEFAULT_ADSR.decay).toBeGreaterThan(0);
    expect(DEFAULT_ADSR.sustain).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_ADSR.sustain).toBeLessThanOrEqual(1);
    expect(DEFAULT_ADSR.release).toBeGreaterThan(0);
  });
});

describe('Sound Service - Filter Effects', () => {
  let mockCtx: AudioContext;
  let mockFilter: BiquadFilterNode;
  let mockFrequencyParam: { value: number; setValueAtTime: ReturnType<typeof vi.fn> };
  let mockQParam: { value: number; setValueAtTime: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockFrequencyParam = { value: 0, setValueAtTime: vi.fn() };
    mockQParam = { value: 0, setValueAtTime: vi.fn() };
    mockFilter = {
      type: 'lowpass',
      frequency: mockFrequencyParam,
      Q: mockQParam,
    } as unknown as BiquadFilterNode;
    mockCtx = {
      currentTime: 0,
      createBiquadFilter: vi.fn(() => mockFilter),
    } as unknown as AudioContext;
  });

  it('creates lowpass filter', () => {
    const filter = createFilter(mockCtx, { type: 'lowpass', frequency: 1000, Q: 2 });
    expect(filter.type).toBe('lowpass');
    expect(mockFrequencyParam.setValueAtTime).toHaveBeenCalledWith(1000, 0);
    expect(mockQParam.setValueAtTime).toHaveBeenCalledWith(2, 0);
  });

  it('creates highpass filter', () => {
    const filter = createFilter(mockCtx, { type: 'highpass', frequency: 500, Q: 1 });
    expect(filter.type).toBe('highpass');
  });

  it('creates bandpass filter', () => {
    const filter = createFilter(mockCtx, { type: 'bandpass', frequency: 800, Q: 5 });
    expect(filter.type).toBe('bandpass');
  });

  it('creates notch filter', () => {
    const filter = createFilter(mockCtx, { type: 'notch', frequency: 600, Q: 3 });
    expect(filter.type).toBe('notch');
  });
});

describe('Sound Service - Reverb', () => {
  it('creates reverb convolver', () => {
    const mockBuffer = { numberOfChannels: 2, length: 44100, sampleRate: 44100, getChannelData: vi.fn(() => new Float32Array(44100)) };
    const mockCtx = {
      sampleRate: 44100,
      createBuffer: vi.fn(() => mockBuffer),
      createConvolver: vi.fn(() => ({
        buffer: null,
      })),
    } as unknown as AudioContext;

    const convolver = createReverb(mockCtx, { decay: 2, mix: 0.5 });
    expect(mockCtx.createBuffer).toHaveBeenCalledWith(2, 44100 * 2, 44100);
    expect(mockCtx.createConvolver).toHaveBeenCalled();
  });
});

describe('Sound Service - Delay', () => {
  it('creates delay with feedback', () => {
    const mockDelayNode = { delayTime: { setValueAtTime: vi.fn() }, connect: vi.fn() };
    const mockGainNodes = Array.from({ length: 5 }, () => ({
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    }));
    let gainIndex = 0;
    const mockCtx = {
      currentTime: 0,
      createDelay: vi.fn(() => mockDelayNode),
      createGain: vi.fn(() => mockGainNodes[gainIndex++]),
    } as unknown as AudioContext;

    const result = createDelay(mockCtx, { time: 0.3, feedback: 0.4, mix: 0.3 });
    expect(result).toHaveProperty('input');
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('delay');
  });
});

describe('Sound Service - Distortion', () => {
  it('creates waveshaper distortion', () => {
    const mockShaper = {
      curve: null,
      oversample: '',
      connect: vi.fn(),
    };
    const mockCtx = {
      createWaveShaper: vi.fn(() => mockShaper),
    } as unknown as AudioContext;

    const shaper = createDistortion(mockCtx, 0.5);
    expect(mockCtx.createWaveShaper).toHaveBeenCalled();
    expect(shaper.curve).toBeInstanceOf(Float32Array);
    expect(shaper.oversample).toBe('4x');
  });

  it('creates distortion curve with correct length', () => {
    const mockShaper = { curve: null as Float32Array | null, oversample: '' };
    const mockCtx = { createWaveShaper: vi.fn(() => mockShaper) } as unknown as AudioContext;

    createDistortion(mockCtx, 0.8);
    expect((mockShaper.curve as Float32Array).length).toBe(44100);
  });
});

describe('Sound Service - Compressor', () => {
  it('creates dynamics compressor', () => {
    const mockCompressor = {
      threshold: { setValueAtTime: vi.fn() },
      knee: { setValueAtTime: vi.fn() },
      ratio: { setValueAtTime: vi.fn() },
      attack: { setValueAtTime: vi.fn() },
      release: { setValueAtTime: vi.fn() },
    };
    const mockCtx = {
      currentTime: 0,
      createDynamicsCompressor: vi.fn(() => mockCompressor),
    } as unknown as AudioContext;

    const compressor = createCompressor(mockCtx);
    expect(mockCtx.createDynamicsCompressor).toHaveBeenCalled();
    expect(mockCompressor.threshold.setValueAtTime).toHaveBeenCalledWith(-24, 0);
    expect(mockCompressor.knee.setValueAtTime).toHaveBeenCalledWith(30, 0);
    expect(mockCompressor.ratio.setValueAtTime).toHaveBeenCalledWith(12, 0);
  });
});

describe('Sound Service - Sound Pool', () => {
  beforeEach(() => {
    setMuted(false);
  });

  it('initSoundPool does not throw', () => {
    expect(() => initSoundPool(4)).not.toThrow();
  });

  it('disposeSoundPool does not throw', () => {
    expect(() => disposeSoundPool()).not.toThrow();
  });
});

describe('Sound Service - Spatial Audio', () => {
  beforeEach(() => {
    setMuted(false);
  });

  it('spatialPlaySound calculates pan from entity position', () => {
    expect(() => spatialPlaySound('coin', 0, 800)).not.toThrow();
    expect(() => spatialPlaySound('coin', 400, 800)).not.toThrow();
    expect(() => spatialPlaySound('coin', 800, 800)).not.toThrow();
  });

  it('spatialPlaySound handles edge positions', () => {
    expect(() => spatialPlaySound('jump', -100, 800)).not.toThrow();
    expect(() => spatialPlaySound('jump', 900, 800)).not.toThrow();
  });
});

describe('Sound Service - playSoundEffect extended types', () => {
  beforeEach(() => {
    setMuted(false);
  });

  it('plays all new sound types', () => {
    const newTypes = [
      'coinCollect', 'levelComplete', 'gameOver', 'menuSelect', 'menuBack',
      'typing', 'notification', 'achievement', 'bossIntro', 'healing',
      'damageTaken', 'shieldBlock', 'magicSpell', 'swordSlash', 'arrowShoot',
      'explosionSmall', 'explosionLarge', 'thunder', 'wind',
    ] as const;
    for (const type of newTypes) {
      expect(() => playSoundEffect(type)).not.toThrow();
    }
  });

  it('does not play when muted', () => {
    setMuted(true);
    expect(() => playSoundEffect('achievement')).not.toThrow();
    expect(() => playSoundEffect('bossIntro')).not.toThrow();
    setMuted(false);
  });
});
