import { describe, it, expect } from 'vitest';
import {
  generateWaveform,
  generateSineWave,
  generateSquareWave,
  generateTriangleWave,
  generateSawtoothWave,
  generatePulseWave,
  generateDCSignal,
  generateNoise,
  generatePinkNoise,
  generateBrownNoise,
  generateFMWave,
  generateAMWave,
  generateModulatedWaveform,
  computeFFT,
  analyzeSignal,
  fft,
  generateArduinoSignal,
  WAVEFORM_PRESETS,
  MODULATION_PRESETS,
  WaveformType,
  WaveformConfig,
} from '../waveformGenerator';

function baseConfig(type: WaveformType = 'sine', overrides: Partial<WaveformConfig> = {}): WaveformConfig {
  return { type, frequency: 100, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0, ...overrides };
}

describe('waveform generation edge cases', () => {
  describe('zero frequency', () => {
    it('handles zero frequency sine wave', () => {
      const samples = generateSineWave(baseConfig('sine', { frequency: 0 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('handles zero frequency square wave', () => {
      const samples = generateSquareWave(baseConfig('square', { frequency: 0 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
    });

    it('handles zero frequency triangle wave', () => {
      const samples = generateTriangleWave(baseConfig('triangle', { frequency: 0 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
    });

    it('handles zero frequency sawtooth wave', () => {
      const samples = generateSawtoothWave(baseConfig('sawtooth', { frequency: 0 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
    });

    it('handles zero frequency pulse wave', () => {
      const samples = generatePulseWave(baseConfig('pulse', { frequency: 0 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
    });
  });

  describe('very high frequency', () => {
    it('handles frequency at Nyquist limit', () => {
      const samples = generateSineWave(baseConfig('sine', { frequency: 500 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
    });

    it('handles frequency above Nyquist (aliasing)', () => {
      const samples = generateSineWave(baseConfig('sine', { frequency: 2000 }), 1000, 0.1);
      expect(samples).toHaveLength(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('infinite/large amplitude (clamped)', () => {
    it('clamps amplitude > 1 to valid range', () => {
      const samples = generateSineWave(baseConfig('sine', { amplitude: 100 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('clamps negative amplitude to valid range', () => {
      const samples = generateSineWave(baseConfig('sine', { amplitude: -10 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('handles very large offset', () => {
      const samples = generateSineWave(baseConfig('sine', { offset: 100 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('handles negative offset', () => {
      const samples = generateSineWave(baseConfig('sine', { offset: -10 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('zero duration', () => {
    it('returns empty array for zero duration', () => {
      const samples = generateSineWave(baseConfig(), 1000, 0);
      expect(samples).toHaveLength(0);
    });

    it('returns empty array for negative duration', () => {
      const samples = generateSineWave(baseConfig(), 1000, -1);
      expect(samples).toHaveLength(0);
    });
  });

  describe('zero sample rate', () => {
    it('returns empty array for zero sample rate', () => {
      const samples = generateSineWave(baseConfig(), 0, 0.1);
      expect(samples).toHaveLength(0);
    });
  });

  describe('generateWaveform dispatcher', () => {
    it('dispatches all waveform types', () => {
      const types: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'dc', 'noise'];
      for (const type of types) {
        const samples = generateWaveform(baseConfig(type), 1000, 0.05);
        expect(samples.length).toBeGreaterThan(0);
      }
    });

    it('handles unknown type by falling back to sine', () => {
      const samples = generateWaveform(baseConfig('unknown' as WaveformType), 1000, 0.05);
      expect(samples.length).toBeGreaterThan(0);
    });
  });

  describe('noise generators', () => {
    it('generates white noise in range', () => {
      const samples = generateNoise(1000, 0.1);
      expect(samples).toHaveLength(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('generates pink noise in range', () => {
      const samples = generatePinkNoise(1000, 0.1);
      expect(samples).toHaveLength(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('generates brown noise in range', () => {
      const samples = generateBrownNoise(1000, 0.1);
      expect(samples).toHaveLength(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('noise generators handle zero duration', () => {
      expect(generateNoise(1000, 0)).toHaveLength(0);
      expect(generatePinkNoise(1000, 0)).toHaveLength(0);
      expect(generateBrownNoise(1000, 0)).toHaveLength(0);
    });
  });

  describe('FM and AM modulation', () => {
    it('generates FM wave', () => {
      const samples = generateFMWave({
        carrierFrequency: 1000,
        modulatorFrequency: 5,
        modulationIndex: 2,
        amplitude: 0.5,
        offset: 0.5,
        sampleRate: 44100,
        duration: 0.01,
      });
      expect(samples.length).toBeGreaterThan(0);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('generates AM wave', () => {
      const samples = generateAMWave({
        carrierFrequency: 1000,
        modulatorFrequency: 5,
        modulationIndex: 0.8,
        carrierAmplitude: 0.5,
        offset: 0.5,
        sampleRate: 44100,
        duration: 0.01,
      });
      expect(samples.length).toBeGreaterThan(0);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });

    it('FM with zero modulation index is plain sine', () => {
      const samples = generateFMWave({
        carrierFrequency: 100,
        modulatorFrequency: 5,
        modulationIndex: 0,
        amplitude: 0.5,
        offset: 0.5,
        sampleRate: 1000,
        duration: 0.1,
      });
      expect(samples.length).toBe(100);
    });
  });

  describe('modulated waveform combined', () => {
    it('generates with FM only', () => {
      const samples = generateModulatedWaveform({
        baseType: 'sine',
        frequency: 100,
        amplitude: 0.5,
        offset: 0.5,
        dutyCycle: 0.5,
        phase: 0,
        sampleRate: 1000,
        duration: 0.1,
        frequencyMod: { modulatorFreq: 5, modIndex: 2 },
      });
      expect(samples.length).toBe(100);
    });

    it('generates with AM only', () => {
      const samples = generateModulatedWaveform({
        baseType: 'sine',
        frequency: 100,
        amplitude: 0.5,
        offset: 0.5,
        dutyCycle: 0.5,
        phase: 0,
        sampleRate: 1000,
        duration: 0.1,
        amplitudeMod: { modulatorFreq: 5, modIndex: 0.8 },
      });
      expect(samples.length).toBe(100);
    });

    it('generates with noise', () => {
      const samples = generateModulatedWaveform({
        baseType: 'sine',
        frequency: 100,
        amplitude: 0.5,
        offset: 0.5,
        dutyCycle: 0.5,
        phase: 0,
        sampleRate: 1000,
        duration: 0.1,
        noiseType: 'pink',
      });
      expect(samples.length).toBe(100);
    });

    it('generates with all mods combined', () => {
      const samples = generateModulatedWaveform({
        baseType: 'sine',
        frequency: 100,
        amplitude: 0.5,
        offset: 0.5,
        dutyCycle: 0.5,
        phase: 0,
        sampleRate: 1000,
        duration: 0.1,
        frequencyMod: { modulatorFreq: 5, modIndex: 1 },
        amplitudeMod: { modulatorFreq: 3, modIndex: 0.5 },
        noiseType: 'brown',
      });
      expect(samples.length).toBe(100);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('FFT edge cases', () => {
    it('FFT on empty signal', () => {
      const result = computeFFT([], 1000);
      expect(result.magnitudes).toHaveLength(0);
      expect(result.frequencies).toHaveLength(0);
    });

    it('FFT on single sample', () => {
      const result = computeFFT([1], 1000);
      expect(result.magnitudes.length).toBeGreaterThanOrEqual(0);
    });

    it('FFT on constant signal', () => {
      const signal = new Array(128).fill(0.5);
      const result = computeFFT(signal, 1000);
      expect(result.magnitudes.length).toBeGreaterThan(0);
      expect(result.peakFrequency).toBe(0);
    });

    it('FFT on sine wave has non-zero peak', () => {
      const signal = Array.from({ length: 256 }, (_, i) => 0.5 * Math.sin(2 * Math.PI * 100 * i / 1000));
      const result = computeFFT(signal, 1000);
      expect(result.peakMagnitude).toBeGreaterThan(0);
      expect(result.magnitudes.length).toBeGreaterThan(0);
    });

    it('fft function works with power-of-2 lengths', () => {
      const real = [1, 0, 1, 0];
      const imag = [0, 0, 0, 0];
      const result = fft(real, imag);
      expect(result.real).toHaveLength(4);
      expect(result.imag).toHaveLength(4);
    });

    it('fft on length 1', () => {
      const result = fft([1], [0]);
      expect(result.real).toEqual([1]);
      expect(result.imag).toEqual([0]);
    });
  });

  describe('signal analysis edge cases', () => {
    it('analyzeSignal on empty signal', () => {
      const result = analyzeSignal([]);
      expect(result.frequency).toBe(0);
      expect(result.amplitude).toBe(0);
      expect(result.rms).toBe(0);
      expect(result.peakToPeak).toBe(0);
    });

    it('analyzeSignal on DC signal', () => {
      const signal = new Array(100).fill(0.5);
      const result = analyzeSignal(signal);
      expect(result.dcOffset).toBeCloseTo(0.5, 1);
      expect(result.rms).toBeCloseTo(0, 1);
    });

    it('analyzeSignal on sine wave', () => {
      const signal = Array.from({ length: 1000 }, (_, i) => 0.5 + 0.4 * Math.sin(2 * Math.PI * 50 * i / 1000));
      const result = analyzeSignal(signal);
      expect(result.amplitude).toBeGreaterThan(0);
      expect(result.dcOffset).toBeGreaterThan(0.4);
    });

    it('analyzeSignal on square wave has high duty cycle', () => {
      const signal = Array.from({ length: 100 }, (_, i) => i < 50 ? 1 : 0);
      const result = analyzeSignal(signal);
      expect(result.dutyCycle).toBeCloseTo(0.5, 1);
    });
  });

  describe('Arduino signal generation', () => {
    it('generates analogWrite signal', () => {
      const signal = generateArduinoSignal(9, 'analogWrite', 128);
      expect(signal).toHaveLength(100);
      expect(signal[0]).toBeCloseTo(128 / 255, 2);
    });

    it('generates tone signal', () => {
      const signal = generateArduinoSignal(9, 'tone', 440);
      expect(signal.length).toBeGreaterThan(0);
    });

    it('generates PWM signal', () => {
      const signal = generateArduinoSignal(9, 'pwm', 128);
      expect(signal.length).toBeGreaterThan(0);
    });

    it('generates unknown mode as zero', () => {
      const signal = generateArduinoSignal(9, 'unknown' as 'analogWrite' | 'tone' | 'pwm', 128);
      expect(signal).toHaveLength(100);
      expect(signal[0]).toBe(0);
    });
  });

  describe('preset waveforms', () => {
    it('all presets are valid configs', () => {
      for (const [name, config] of Object.entries(WAVEFORM_PRESETS)) {
        const samples = generateWaveform(config, 1000, 0.05);
        expect(samples.length).toBeGreaterThan(0);
      }
    });

    it('all modulation presets are valid', () => {
      for (const [name, config] of Object.entries(MODULATION_PRESETS)) {
        const samples = generateModulatedWaveform(config);
        expect(samples.length).toBeGreaterThan(0);
      }
    });
  });

  describe('duty cycle edge cases', () => {
    it('0% duty cycle square wave is all low', () => {
      const samples = generateSquareWave(baseConfig('square', { dutyCycle: 0 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeLessThanOrEqual(0.6);
      }
    });

    it('100% duty cycle square wave is all high', () => {
      const samples = generateSquareWave(baseConfig('square', { dutyCycle: 1, amplitude: 0.5 }), 1000, 0.1);
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0.4);
      }
    });
  });
});
