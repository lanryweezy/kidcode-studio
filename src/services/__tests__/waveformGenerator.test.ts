import { describe, it, expect } from 'vitest';
import {
  generateWaveform,
  generateSineWave,
  generateSquareWave,
  generateTriangleWave,
  generateSawtoothWave,
  generatePulseWave,
  generateNoise,
  computeFFT,
  analyzeSignal,
  WaveformType,
} from '../waveformGenerator';

function baseConfig(type: WaveformType = 'sine') {
  return { type, frequency: 100, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 };
}

describe('waveformGenerator', () => {
  const sampleRate = 1000;
  const duration = 0.1;

  describe('generateSineWave', () => {
    it('produces correct number of samples', () => {
      const samples = generateSineWave(baseConfig('sine'), sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are within 0-1 range', () => {
      const samples = generateSineWave(baseConfig('sine'), sampleRate, duration);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('centered around offset for symmetric amplitude', () => {
      const samples = generateSineWave(baseConfig('sine'), sampleRate, duration);
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(avg).toBeCloseTo(0.5, 1);
    });

    it('respects amplitude parameter', () => {
      const low = generateSineWave({ ...baseConfig('sine'), amplitude: 0.1 }, sampleRate, duration);
      const high = generateSineWave({ ...baseConfig('sine'), amplitude: 0.9 }, sampleRate, duration);
      const lowRange = Math.max(...low) - Math.min(...low);
      const highRange = Math.max(...high) - Math.min(...high);
      expect(highRange).toBeGreaterThan(lowRange);
    });

    it('respects frequency parameter', () => {
      const slow = generateSineWave({ ...baseConfig('sine'), frequency: 10 }, sampleRate, duration);
      const fast = generateSineWave({ ...baseConfig('sine'), frequency: 100 }, sampleRate, duration);
      const countCrossings = (s: number[]) => {
        let crossings = 0;
        for (let i = 1; i < s.length; i++) {
          if ((s[i] > 0.5) !== (s[i - 1] > 0.5)) crossings++;
        }
        return crossings;
      };
      expect(countCrossings(fast)).toBeGreaterThan(countCrossings(slow));
    });
  });

  describe('generateSquareWave', () => {
    it('produces correct number of samples', () => {
      const samples = generateSquareWave(baseConfig('square'), sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are either high or low (binary)', () => {
      const samples = generateSquareWave({ ...baseConfig('square'), offset: 0, amplitude: 1 }, sampleRate, duration);
      for (const s of samples) {
        expect(s === 0 || s === 1).toBe(true);
      }
    });

    it('respects duty cycle', () => {
      const config = { ...baseConfig('square'), offset: 0, amplitude: 1, dutyCycle: 0.25 };
      const samples = generateSquareWave(config, sampleRate, duration);
      const highCount = samples.filter(s => s === 1).length;
      const ratio = highCount / samples.length;
      expect(ratio).toBeCloseTo(0.25, 1);
    });

    it('50% duty cycle has roughly equal high and low', () => {
      const config = { ...baseConfig('square'), offset: 0, amplitude: 1, dutyCycle: 0.5 };
      const samples = generateSquareWave(config, sampleRate, duration);
      const highCount = samples.filter(s => s === 1).length;
      const ratio = highCount / samples.length;
      expect(ratio).toBeCloseTo(0.5, 1);
    });
  });

  describe('generateTriangleWave', () => {
    it('produces correct number of samples', () => {
      const samples = generateTriangleWave(baseConfig('triangle'), sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are within 0-1 range', () => {
      const samples = generateTriangleWave(baseConfig('triangle'), sampleRate, duration);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('has correct min/max for triangle shape', () => {
      const config = { ...baseConfig('triangle'), amplitude: 0.5, offset: 0.5 };
      const samples = generateTriangleWave(config, sampleRate, duration);
      const min = Math.min(...samples);
      const max = Math.max(...samples);
      expect(min).toBeCloseTo(0, 1);
      expect(max).toBeCloseTo(1, 1);
    });
  });

  describe('generateSawtoothWave', () => {
    it('produces correct number of samples', () => {
      const samples = generateSawtoothWave(baseConfig('sawtooth'), sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are within 0-1 range', () => {
      const samples = generateSawtoothWave(baseConfig('sawtooth'), sampleRate, duration);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('sawtooth resets at period boundary', () => {
      const config = { ...baseConfig('sawtooth'), amplitude: 0.5, offset: 0.5 };
      const samples = generateSawtoothWave(config, sampleRate, duration);
      const period = Math.floor(sampleRate / config.frequency);
      if (samples.length > period + 1) {
        const reset = samples[period] - samples[period - 1];
        expect(reset).toBeLessThan(0);
      }
    });
  });

  describe('generatePulseWave', () => {
    it('produces correct number of samples', () => {
      const samples = generatePulseWave(baseConfig('pulse'), sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are within 0-1 range', () => {
      const samples = generatePulseWave(baseConfig('pulse'), sampleRate, duration);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('generateNoise', () => {
    it('produces correct number of samples', () => {
      const samples = generateNoise(sampleRate, duration);
      expect(samples).toHaveLength(sampleRate * duration);
    });

    it('values are in 0-1 range', () => {
      const samples = generateNoise(sampleRate, duration);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('generates random values (not all identical)', () => {
      const samples = generateNoise(sampleRate, duration);
      const unique = new Set(samples.map(s => s.toFixed(4)));
      expect(unique.size).toBeGreaterThan(10);
    });
  });

  describe('generateWaveform (dispatcher)', () => {
    const types: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'dc'];
    for (const type of types) {
      it(`generates ${type} waveform`, () => {
        const samples = generateWaveform(baseConfig(type), sampleRate, duration);
        expect(samples.length).toBeGreaterThan(0);
      });
    }

    it('dispatches noise type', () => {
      const samples = generateWaveform({ ...baseConfig('noise'), frequency: 0, amplitude: 0, offset: 0, dutyCycle: 0, phase: 0 }, sampleRate, duration);
      expect(samples.length).toBeGreaterThan(0);
    });
  });

  describe('computeFFT', () => {
    it('detects peak frequency of a sine wave', () => {
      const freq = 50;
      const sr = 1000;
      const n = 128;
      const signal = Array.from({ length: n }, (_, i) =>
        0.5 * Math.sin(2 * Math.PI * freq * (i / sr))
      );
      const result = computeFFT(signal, sr);
      const expectedBin = Math.round(freq * n / sr);
      expect(result.peakFrequency).toBeCloseTo(result.frequencies[expectedBin], 0);
      expect(result.magnitudes.length).toBe(result.frequencies.length);
      expect(result.phases.length).toBe(result.frequencies.length);
    });

    it('returns FFT results with correct structure', () => {
      const signal = Array.from({ length: 128 }, (_, i) =>
        0.5 * Math.sin(2 * Math.PI * 100 * (i / 1000))
      );
      const result = computeFFT(signal, 1000);
      expect(result).toHaveProperty('magnitudes');
      expect(result).toHaveProperty('frequencies');
      expect(result).toHaveProperty('phases');
      expect(result).toHaveProperty('peakFrequency');
      expect(result).toHaveProperty('peakMagnitude');
    });

    it('peak magnitude is positive', () => {
      const signal = Array.from({ length: 128 }, (_, i) =>
        0.5 * Math.sin(2 * Math.PI * 100 * (i / 1000))
      );
      const result = computeFFT(signal, 1000);
      expect(result.peakMagnitude).toBeGreaterThan(0);
    });
  });

  describe('analyzeSignal', () => {
    it('returns zero analysis for empty signal', () => {
      const result = analyzeSignal([]);
      expect(result.frequency).toBe(0);
      expect(result.amplitude).toBe(0);
      expect(result.rms).toBe(0);
    });

    it('calculates DC offset', () => {
      const signal = new Array(100).fill(0.7);
      const result = analyzeSignal(signal);
      expect(result.dcOffset).toBeCloseTo(0.7, 5);
    });

    it('calculates peak-to-peak for square wave', () => {
      const config = { ...baseConfig('square'), offset: 0, amplitude: 1, dutyCycle: 0.5 };
      const signal = generateSquareWave(config, 1000, 0.1);
      const result = analyzeSignal(signal);
      expect(result.peakToPeak).toBeCloseTo(1, 1);
    });

    it('calculates RMS value', () => {
      const config = { ...baseConfig('sine'), amplitude: 0.5, offset: 0.5 };
      const signal = generateSineWave(config, 1000, 0.1);
      const result = analyzeSignal(signal);
      expect(result.rms).toBeGreaterThan(0);
    });

    it('calculates amplitude', () => {
      const config = { ...baseConfig('sine'), amplitude: 0.3, offset: 0.5 };
      const signal = generateSineWave(config, 1000, 0.1);
      const result = analyzeSignal(signal);
      expect(result.amplitude).toBeGreaterThan(0);
    });

    it('duty cycle is 0.5 for 50% square wave', () => {
      const config = { ...baseConfig('square'), offset: 0, amplitude: 1, dutyCycle: 0.5 };
      const signal = generateSquareWave(config, 1000, 0.1);
      const result = analyzeSignal(signal);
      expect(result.dutyCycle).toBeCloseTo(0.5, 1);
    });
  });
});
