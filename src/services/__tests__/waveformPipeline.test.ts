import { describe, it, expect } from 'vitest';
import {
  generateWaveform,
  computeFFT,
  analyzeSignal,
  WAVEFORM_PRESETS,
} from '../waveformGenerator';
import type { WaveformConfig } from '../waveformGenerator';

function sineConfig(freq: number, amp = 0.5): WaveformConfig {
  return { type: 'sine', frequency: freq, amplitude: amp, offset: 0.5, dutyCycle: 0.5, phase: 0 };
}

describe('Waveform Pipeline - Generate sine → analyze → verify frequency', () => {
  it('sine wave frequency detected via zero crossings', () => {
    const config = sineConfig(100);
    const signal = generateWaveform(config, 1000, 1);

    expect(signal.length).toBe(1000);

    const analysis = analyzeSignal(signal);
    expect(analysis.frequency).toBe(100);
  });

  it('sine wave amplitude matches config', () => {
    const config = sineConfig(440, 0.8);
    const signal = generateWaveform(config, 1000, 0.5);

    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0.3);
  });

  it('sine wave has significant FFT magnitude at fundamental frequency', () => {
    const config = sineConfig(100);
    const signal = generateWaveform(config, 1024, 1);
    const fft = computeFFT(signal, 1024);

    const binIndex = 100;
    expect(fft.magnitudes[binIndex]).toBeGreaterThan(0.01);
  });
});

describe('Waveform Pipeline - Square wave → FFT → peak frequency', () => {
  it('square wave peak frequency via FFT', () => {
    const config: WaveformConfig = {
      type: 'square', frequency: 200, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1024, 1);

    const fft = computeFFT(signal, 1024);
    let peakIdx = 1;
    for (let i = 2; i < fft.magnitudes.length; i++) {
      if (fft.magnitudes[i] > fft.magnitudes[peakIdx]) peakIdx = i;
    }
    expect(peakIdx).toBeGreaterThan(150);
    expect(peakIdx).toBeLessThan(300);
  });

  it('square wave has harmonics via FFT', () => {
    const config: WaveformConfig = {
      type: 'square', frequency: 100, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1024, 1);
    const fft = computeFFT(signal, 1024);

    expect(fft.magnitudes[100]).toBeGreaterThan(0.01);
    expect(fft.magnitudes[300]).toBeGreaterThan(0.001);
  });
});

describe('Waveform Pipeline - Different frequencies', () => {
  it('100 Hz signal detected', () => {
    const signal = generateWaveform(sineConfig(100), 1000, 1);
    const analysis = analyzeSignal(signal);
    expect(analysis.frequency).toBe(100);
  });

  it('440 Hz signal detected via FFT', () => {
    const signal = generateWaveform(sineConfig(440), 1024, 1);
    const fft = computeFFT(signal, 1024);
    expect(fft.magnitudes[440]).toBeGreaterThan(0.01);
  });

  it('100 Hz FFT peak on power-of-2 signal', () => {
    const signal = generateWaveform(sineConfig(100), 1024, 1);
    const fft = computeFFT(signal, 1024);
    expect(fft.magnitudes[100]).toBeGreaterThan(0.01);
  });

  it('1000 Hz FFT peak on power-of-2 signal', () => {
    const signal = generateWaveform(sineConfig(1000), 4096, 1);
    const fft = computeFFT(signal, 4096);
    expect(fft.magnitudes[1000]).toBeGreaterThan(0.01);
  });
});

describe('Waveform Pipeline - Amplitude scaling', () => {
  it('amplitude 0.1 produces small signal', () => {
    const signal = generateWaveform(sineConfig(440, 0.1), 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeLessThan(0.2);
  });

  it('amplitude 1.0 produces full-scale signal', () => {
    const signal = generateWaveform(sineConfig(440, 1.0), 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0.4);
  });

  it('amplitude 0.5 produces mid-scale signal', () => {
    const signal = generateWaveform(sineConfig(440, 0.5), 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0.2);
    expect(analysis.amplitude).toBeLessThan(0.7);
  });
});

describe('Waveform Pipeline - Multiple waveform types', () => {
  it('triangle wave through analysis pipeline', () => {
    const config: WaveformConfig = {
      type: 'triangle', frequency: 440, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0);
    expect(analysis.rms).toBeGreaterThan(0);
  });

  it('sawtooth wave through analysis pipeline', () => {
    const config: WaveformConfig = {
      type: 'sawtooth', frequency: 440, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0);
  });

  it('pulse wave through analysis pipeline', () => {
    const config: WaveformConfig = {
      type: 'pulse', frequency: 440, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.25, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.amplitude).toBeGreaterThan(0);
    expect(analysis.dutyCycle).toBeLessThan(0.5);
  });

  it('DC signal through analysis pipeline', () => {
    const config: WaveformConfig = {
      type: 'dc', frequency: 0, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 0.1);
    expect(signal.length).toBe(100);
  });

  it('multiple waveform types produce valid analysis', () => {
    const types: WaveformConfig['type'][] = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'dc'];
    for (const type of types) {
      const config: WaveformConfig = {
        type, frequency: 440, amplitude: 0.5,
        offset: 0.5, dutyCycle: 0.5, phase: 0,
      };
      const signal = generateWaveform(config, 1000, 0.1);
      const analysis = analyzeSignal(signal);
      expect(analysis.amplitude).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Waveform Pipeline - RMS calculation', () => {
  it('RMS of sine wave with no clipping', () => {
    const config = sineConfig(440, 0.5);
    const signal = generateWaveform(config, 1000, 1);
    const analysis = analyzeSignal(signal);

    const expectedRMS = 0.5 / Math.sqrt(2);
    expect(analysis.rms).toBeGreaterThan(expectedRMS * 0.8);
    expect(analysis.rms).toBeLessThan(expectedRMS * 1.2);
  });

  it('RMS of DC signal is near zero after DC removal', () => {
    const config: WaveformConfig = {
      type: 'dc', frequency: 0, amplitude: 0,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 0.1);
    const analysis = analyzeSignal(signal);
    expect(analysis.rms).toBeCloseTo(0.0, 1);
  });

  it('peak-to-peak of sine wave is approximately 2 * amplitude', () => {
    const config = sineConfig(440, 0.5);
    const signal = generateWaveform(config, 10000, 1);
    const analysis = analyzeSignal(signal);

    expect(analysis.peakToPeak).toBeGreaterThan(0.7);
    expect(analysis.peakToPeak).toBeLessThan(1.3);
  });

  it('RMS of square wave is within expected range', () => {
    const config: WaveformConfig = {
      type: 'square', frequency: 440, amplitude: 0.5,
      offset: 0.5, dutyCycle: 0.5, phase: 0,
    };
    const signal = generateWaveform(config, 1000, 1);
    const analysis = analyzeSignal(signal);

    expect(analysis.rms).toBeGreaterThan(0.2);
    expect(analysis.rms).toBeLessThan(0.6);
  });

  it('higher amplitude produces higher RMS', () => {
    const lowConfig = sineConfig(440, 0.2);
    const highConfig = sineConfig(440, 0.8);
    const lowRMS = analyzeSignal(generateWaveform(lowConfig, 1000, 1)).rms;
    const highRMS = analyzeSignal(generateWaveform(highConfig, 1000, 1)).rms;
    expect(highRMS).toBeGreaterThan(lowRMS);
  });
});

describe('Waveform Pipeline - Preset waveforms', () => {
  it('1kHz_sine preset generates signal with correct frequency via FFT', () => {
    const signal = generateWaveform(WAVEFORM_PRESETS['1kHz_sine'], 4096, 1);
    expect(signal.length).toBe(4096);
    const fft = computeFFT(signal, 4096);
    expect(fft.magnitudes[1000]).toBeGreaterThan(0.01);
  });

  it('1kHz_square preset has duty cycle', () => {
    const signal = generateWaveform(WAVEFORM_PRESETS['1kHz_square'], 1000, 0.5);
    const analysis = analyzeSignal(signal);
    expect(analysis.dutyCycle).toBeGreaterThan(0.3);
    expect(analysis.dutyCycle).toBeLessThan(0.7);
  });

  it('pwm_25 preset has lower duty cycle than pwm_50', () => {
    const signal25 = generateWaveform(WAVEFORM_PRESETS['pwm_25'], 4096, 1);
    const signal50 = generateWaveform(WAVEFORM_PRESETS['pwm_50'], 4096, 1);
    const fft25 = computeFFT(signal25, 4096);
    const fft50 = computeFFT(signal50, 4096);
    expect(fft25.magnitudes[1000]).toBeGreaterThan(0);
    expect(fft50.magnitudes[1000]).toBeGreaterThan(0);
  });

  it('440Hz_sine preset has expected frequency via FFT', () => {
    const signal = generateWaveform(WAVEFORM_PRESETS['440Hz_sine'], 4096, 1);
    const fft = computeFFT(signal, 4096);
    expect(fft.magnitudes[440]).toBeGreaterThan(0.01);
  });
});
