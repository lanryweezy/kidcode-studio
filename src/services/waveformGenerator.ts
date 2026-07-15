// ============================================================
// Waveform Generator & Analysis Engine
// Real-time signal generation, FFT analysis, frequency spectrum
// ============================================================

// === WAVEFORM TYPES ===

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'pulse' | 'dc';

export interface WaveformConfig {
  type: WaveformType;
  frequency: number;      // Hz
  amplitude: number;      // 0-1 (normalized)
  offset: number;         // DC offset (0-1)
  dutyCycle: number;      // For square/pulse (0-1)
  phase: number;          // Phase offset in radians
}

export interface SignalAnalysis {
  frequency: number;
  amplitude: number;
  rms: number;
  peakToPeak: number;
  dcOffset: number;
  thd: number;            // Total harmonic distortion
  snr: number;            // Signal-to-noise ratio
  dutyCycle: number;
}

export interface FFTResult {
  magnitudes: number[];
  frequencies: number[];
  phases: number[];
  peakFrequency: number;
  peakMagnitude: number;
}

// === WAVEFORM GENERATORS ===

export function generateSineWave(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = config.amplitude * Math.sin(2 * Math.PI * config.frequency * t + config.phase) + config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

export function generateSquareWave(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const period = 1 / config.frequency;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const phase = (t % period) / period;
    const value = phase < config.dutyCycle ? config.amplitude + config.offset : config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

export function generateTriangleWave(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const period = 1 / config.frequency;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const phase = (t % period) / period;
    const value = config.amplitude * (2 * Math.abs(2 * phase - 1) - 1) + config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

export function generateSawtoothWave(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const period = 1 / config.frequency;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const phase = (t % period) / period;
    const value = config.amplitude * (2 * phase - 1) + config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

export function generatePulseWave(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const period = 1 / config.frequency;
  const pulseWidth = period * config.dutyCycle;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const phase = t % period;
    const value = phase < pulseWidth ? config.amplitude + config.offset : config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

export function generateDCSignal(
  config: WaveformConfig,
  sampleRate: number,
  duration: number
): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  for (let i = 0; i < numSamples; i++) {
    samples.push(Math.max(0, Math.min(1, config.offset + config.amplitude)));
  }
  return samples;
}

export function generateWaveform(
  config: WaveformConfig,
  sampleRate: number = 1000,
  duration: number = 0.1
): number[] {
  switch (config.type) {
    case 'sine': return generateSineWave(config, sampleRate, duration);
    case 'square': return generateSquareWave(config, sampleRate, duration);
    case 'triangle': return generateTriangleWave(config, sampleRate, duration);
    case 'sawtooth': return generateSawtoothWave(config, sampleRate, duration);
    case 'pulse': return generatePulseWave(config, sampleRate, duration);
    case 'dc': return generateDCSignal(config, sampleRate, duration);
    case 'noise': return generateNoise(sampleRate, duration);
    default: return generateSineWave(config, sampleRate, duration);
  }
}

export function generateNoise(sampleRate: number, duration: number): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  for (let i = 0; i < numSamples; i++) {
    samples.push(Math.random());
  }
  return samples;
}

// === PINK NOISE (1/f) ===

export function generatePinkNoise(sampleRate: number, duration: number): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
    samples.push(Math.max(0, Math.min(1, (pink + 1) / 2)));
  }
  return samples;
}

// === BROWNIAN NOISE (random walk) ===

export function generateBrownNoise(sampleRate: number, duration: number): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  let lastOut = 0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + (0.02 * white)) / 1.02;
    samples.push(Math.max(0, Math.min(1, lastOut + 0.5)));
  }
  return samples;
}

// === FREQUENCY MODULATION (FM) ===

export interface FMConfig {
  carrierFrequency: number;
  modulatorFrequency: number;
  modulationIndex: number;
  amplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateFMWave(config: FMConfig): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(config.sampleRate * config.duration);
  for (let i = 0; i < numSamples; i++) {
    const t = i / config.sampleRate;
    const modulator = config.modulationIndex * Math.sin(2 * Math.PI * config.modulatorFrequency * t);
    const value = config.amplitude * Math.sin(2 * Math.PI * config.carrierFrequency * t + modulator) + config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

// === AMPLITUDE MODULATION (AM) ===

export interface AMConfig {
  carrierFrequency: number;
  modulatorFrequency: number;
  modulationIndex: number;
  carrierAmplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateAMWave(config: AMConfig): number[] {
  const samples: number[] = [];
  const numSamples = Math.floor(config.sampleRate * config.duration);
  for (let i = 0; i < numSamples; i++) {
    const t = i / config.sampleRate;
    const modulator = 1 + config.modulationIndex * Math.sin(2 * Math.PI * config.modulatorFrequency * t);
    const value = config.carrierAmplitude * modulator * Math.sin(2 * Math.PI * config.carrierFrequency * t) + config.offset;
    samples.push(Math.max(0, Math.min(1, value)));
  }
  return samples;
}

// === MODULATED WAVEFORM COMBINED ===

export type NoiseType = 'white' | 'pink' | 'brown';

export interface ModulatedWaveformConfig {
  baseType: WaveformType;
  frequency: number;
  amplitude: number;
  offset: number;
  dutyCycle: number;
  phase: number;
  sampleRate: number;
  duration: number;
  frequencyMod?: { modulatorFreq: number; modIndex: number };
  amplitudeMod?: { modulatorFreq: number; modIndex: number };
  noiseType?: NoiseType;
}

export function generateModulatedWaveform(config: ModulatedWaveformConfig): number[] {
  const sampleRate = config.sampleRate || 1000;
  const duration = config.duration || 0.1;
  const baseConfig: WaveformConfig = {
    type: config.baseType,
    frequency: config.frequency,
    amplitude: config.amplitude,
    offset: config.offset,
    dutyCycle: config.dutyCycle,
    phase: config.phase,
  };
  let samples = generateWaveform(baseConfig, sampleRate, duration);

  if (config.frequencyMod) {
    const numSamples = samples.length;
    const fm = new Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      fm[i] = config.amplitude * Math.sin(
        2 * Math.PI * config.frequency * t +
        config.frequencyMod.modIndex * Math.sin(2 * Math.PI * config.frequencyMod.modulatorFreq * t)
      ) + config.offset;
    }
    samples = fm.map(v => Math.max(0, Math.min(1, v)));
  }

  if (config.amplitudeMod) {
    samples = samples.map((v, i) => {
      const t = i / sampleRate;
      const mod = 1 + config.amplitudeMod!.modIndex * Math.sin(2 * Math.PI * config.amplitudeMod!.modulatorFreq * t);
      return Math.max(0, Math.min(1, v * mod));
    });
  }

  if (config.noiseType) {
    let noise: number[];
    switch (config.noiseType) {
      case 'pink': noise = generatePinkNoise(sampleRate, duration); break;
      case 'brown': noise = generateBrownNoise(sampleRate, duration); break;
      default: noise = generateNoise(sampleRate, duration);
    }
    samples = samples.map((v, i) => Math.max(0, Math.min(1, v + noise[i] * 0.1)));
  }

  return samples;
}

// === FFT (Fast Fourier Transform) ===

export function fft(real: number[], imag: number[]): { real: number[]; imag: number[] } {
  const n = real.length;
  if (n <= 1) return { real: [...real], imag: [...imag] };

  // Bit reversal
  const bits = Math.log2(n);
  const reversed = new Array(n);
  for (let i = 0; i < n; i++) {
    let rev = 0;
    let x = i;
    for (let j = 0; j < bits; j++) {
      rev = (rev << 1) | (x & 1);
      x >>= 1;
    }
    reversed[i] = rev;
  }

  const realOut = new Array(n);
  const imagOut = new Array(n);
  for (let i = 0; i < n; i++) {
    realOut[i] = real[reversed[i]];
    imagOut[i] = imag[reversed[i]];
  }

  // FFT butterfly
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);

    for (let i = 0; i < n; i += size) {
      let curReal = 1;
      let curImag = 0;

      for (let j = 0; j < halfSize; j++) {
        const tReal = curReal * realOut[i + j + halfSize] - curImag * imagOut[i + j + halfSize];
        const tImag = curReal * imagOut[i + j + halfSize] + curImag * realOut[i + j + halfSize];

        realOut[i + j + halfSize] = realOut[i + j] - tReal;
        imagOut[i + j + halfSize] = imagOut[i + j] - tImag;
        realOut[i + j] += tReal;
        imagOut[i + j] += tImag;

        const newReal = curReal * wReal - curImag * wImag;
        curImag = curReal * wImag + curImag * wReal;
        curReal = newReal;
      }
    }
  }

  return { real: realOut, imag: imagOut };
}

export function computeFFT(signal: number[], sampleRate: number): FFTResult {
  const n = signal.length;
  const real = [...signal];
  const imag = new Array(n).fill(0);

  const result = fft(real, imag);
  const magnitudes: number[] = [];
  const frequencies: number[] = [];
  const phases: number[] = [];

  for (let i = 0; i < n / 2; i++) {
    const mag = Math.sqrt(result.real[i] ** 2 + result.imag[i] ** 2) / n;
    magnitudes.push(mag);
    frequencies.push((i * sampleRate) / n);
    phases.push(Math.atan2(result.imag[i], result.real[i]));
  }

  let peakIdx = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    if (magnitudes[i] > magnitudes[peakIdx]) peakIdx = i;
  }

  return {
    magnitudes,
    frequencies,
    phases,
    peakFrequency: frequencies[peakIdx],
    peakMagnitude: magnitudes[peakIdx],
  };
}

// === SIGNAL ANALYSIS ===

export function analyzeSignal(signal: number[]): SignalAnalysis {
  if (signal.length === 0) {
    return { frequency: 0, amplitude: 0, rms: 0, peakToPeak: 0, dcOffset: 0, thd: 0, snr: 0, dutyCycle: 0 };
  }

  // DC offset (mean)
  const dcOffset = signal.reduce((a, b) => a + b, 0) / signal.length;

  // RMS
  const rms = Math.sqrt(signal.reduce((sum, val) => sum + (val - dcOffset) ** 2, 0) / signal.length);

  // Peak-to-peak
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const peakToPeak = max - min;

  // Amplitude
  const amplitude = peakToPeak / 2;

  // Duty cycle (for square-like waves)
  const threshold = (max + min) / 2;
  let highCount = 0;
  for (const val of signal) {
    if (val > threshold) highCount++;
  }
  const dutyCycle = signal.length > 0 ? highCount / signal.length : 0;

  // Frequency estimation (zero crossings)
  let crossings = 0;
  let lastSign = signal[0] > dcOffset;
  for (let i = 1; i < signal.length; i++) {
    const currentSign = signal[i] > dcOffset;
    if (currentSign !== lastSign) {
      crossings++;
      lastSign = currentSign;
    }
  }
  const frequency = crossings / 2; // Assuming known sample rate of 1000

  // THD (simplified)
  const thd = rms > 0 ? Math.abs(dutyCycle - 0.5) * 10 : 0;

  // SNR (simplified)
  const signalPower = rms ** 2;
  const noisePower = signal.reduce((sum, val) => sum + (val - dcOffset) ** 2, 0) / signal.length - rms ** 2;
  const snr = noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 100;

  return { frequency, amplitude, rms, peakToPeak, dcOffset, thd, snr, dutyCycle };
}

// === PRESET WAVEFORMS ===

export const WAVEFORM_PRESETS: Record<string, WaveformConfig> = {
  '1kHz_sine': { type: 'sine', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  '1kHz_square': { type: 'square', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  '1kHz_triangle': { type: 'triangle', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  '1kHz_sawtooth': { type: 'sawtooth', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  '440Hz_sine': { type: 'sine', frequency: 440, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 },
  'pwm_50': { type: 'square', frequency: 1000, amplitude: 1, offset: 0, dutyCycle: 0.5, phase: 0 },
  'pwm_25': { type: 'square', frequency: 1000, amplitude: 1, offset: 0, dutyCycle: 0.25, phase: 0 },
  'pwm_75': { type: 'square', frequency: 1000, amplitude: 1, offset: 0, dutyCycle: 0.75, phase: 0 },
};

// === MODULATION PRESETS ===

export const MODULATION_PRESETS: Record<string, ModulatedWaveformConfig> = {
  'fm_radio': {
    baseType: 'sine', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0,
    sampleRate: 44100, duration: 0.1,
    frequencyMod: { modulatorFreq: 5, modIndex: 2 },
  },
  'am_radio': {
    baseType: 'sine', frequency: 1000, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0,
    sampleRate: 44100, duration: 0.1,
    amplitudeMod: { modulatorFreq: 5, modIndex: 0.8 },
  },
  'vibrato': {
    baseType: 'sine', frequency: 440, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0,
    sampleRate: 44100, duration: 0.1,
    frequencyMod: { modulatorFreq: 6, modIndex: 0.3 },
  },
  'tremolo': {
    baseType: 'sine', frequency: 440, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0,
    sampleRate: 44100, duration: 0.1,
    amplitudeMod: { modulatorFreq: 6, modIndex: 0.5 },
  },
};

// === SIGNAL GENERATOR (for Arduino emulation) ===

export function generateArduinoSignal(
  pin: number,
  mode: 'analogWrite' | 'tone' | 'pwm',
  value: number,
  sampleRate: number = 1000
): number[] {
  switch (mode) {
    case 'analogWrite': // 0-255 mapped to 0-1
      return new Array(100).fill(value / 255);
    case 'tone': // Frequency in Hz
      return generateWaveform({ type: 'square', frequency: value, amplitude: 0.5, offset: 0.5, dutyCycle: 0.5, phase: 0 }, sampleRate, 0.1);
    case 'pwm': // Duty cycle 0-255
      return generateWaveform({ type: 'square', frequency: 490, amplitude: 1, offset: 0, dutyCycle: value / 255, phase: 0 }, sampleRate, 0.1);
    default:
      return new Array(100).fill(0);
  }
}

// === MULTI-OSCILLATOR SYNTHESIS ===

export interface OscillatorLayer {
  type: WaveformType;
  frequency: number;
  amplitude: number;
  phase: number;
  dutyCycle: number;
}

export interface MultiOscConfig {
  layers: OscillatorLayer[];
  mixMode: 'add' | 'multiply' | 'average';
  outputAmplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateMultiOscillator(config: MultiOscConfig): number[] {
  const numSamples = Math.floor(config.sampleRate * config.duration);
  const layerSamples: number[][] = config.layers.map(layer =>
    generateWaveform({
      type: layer.type,
      frequency: layer.frequency,
      amplitude: layer.amplitude,
      offset: 0,
      dutyCycle: layer.dutyCycle,
      phase: layer.phase,
    }, config.sampleRate, config.duration)
  );

  const result: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    let value = 0;
    switch (config.mixMode) {
      case 'add':
        value = layerSamples.reduce((sum, layer) => sum + (layer[i] || 0), 0) / config.layers.length;
        break;
      case 'multiply':
        value = layerSamples.reduce((product, layer) => product * ((layer[i] || 0) * 2 - 1), 1);
        value = (value + 1) / 2;
        break;
      case 'average':
        value = layerSamples.reduce((sum, layer) => sum + (layer[i] || 0), 0) / config.layers.length;
        break;
    }
    result.push(Math.max(0, Math.min(1, value * config.outputAmplitude + config.offset)));
  }
  return result;
}

// === GRANULAR SYNTHESIS ===

export interface GranularConfig {
  sourceWaveform: WaveformType;
  sourceFrequency: number;
  sourceAmplitude: number;
  grainSize: number;
  grainDensity: number;
  pitchVariation: number;
  timeVariation: number;
  envelopeType: 'gaussian' | 'triangle' | 'rectangular';
  sampleRate: number;
  duration: number;
}

function generateGrainEnvelope(type: GranularConfig['envelopeType'], size: number): number[] {
  const env: number[] = [];
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    switch (type) {
      case 'gaussian':
        env.push(Math.exp(-0.5 * Math.pow((t - 0.5) * 4, 2)));
        break;
      case 'triangle':
        env.push(1 - Math.abs(2 * t - 1));
        break;
      case 'rectangular':
        env.push(t > 0.1 && t < 0.9 ? 1 : 0);
        break;
    }
  }
  return env;
}

export function generateGranular(config: GranularConfig): number[] {
  const numSamples = Math.floor(config.sampleRate * config.duration);
  const result = new Array(numSamples).fill(0);
  const grainSamples = Math.floor(config.grainSize * config.sampleRate);
  const grainEnv = generateGrainEnvelope(config.envelopeType, grainSamples);
  const numGrains = Math.floor(config.duration / config.grainSize);

  for (let g = 0; g < numGrains; g++) {
    const pitchShift = 1 + (Math.random() * 2 - 1) * config.pitchVariation;
    const timeOffset = Math.floor((Math.random() * 2 - 1) * config.timeVariation * config.sampleRate * config.grainSize);
    const startPos = Math.floor(g * config.grainSize * config.sampleRate) + timeOffset;

    const grainConfig: WaveformConfig = {
      type: config.sourceWaveform,
      frequency: config.sourceFrequency * pitchShift,
      amplitude: config.sourceAmplitude,
      offset: 0,
      dutyCycle: 0.5,
      phase: 0,
    };
    const grainSamplesData = generateWaveform(grainConfig, config.sampleRate, config.grainSize);

    for (let i = 0; i < grainSamples && startPos + i < numSamples; i++) {
      if (startPos + i >= 0) {
        result[startPos + i] += grainSamplesData[i] * grainEnv[i] * config.grainDensity;
      }
    }
  }

  return result.map(v => Math.max(0, Math.min(1, v)));
}

// === WAVETABLE SYNTHESIS ===

export interface WavetableConfig {
  tableSize: number;
  waveforms: WaveformType[];
  frequency: number;
  scanRate: number;
  scanDepth: number;
  amplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateWavetable(config: WavetableConfig): number[] {
  const numSamples = Math.floor(config.sampleRate * config.duration);
  const tableLen = config.tableSize;
  const waveformCount = config.waveforms.length;

  const tables: number[][] = config.waveforms.map(type =>
    generateWaveform({
      type,
      frequency: 1,
      amplitude: 1,
      offset: 0,
      dutyCycle: 0.5,
      phase: 0,
    }, tableLen, 1 / tableLen)
  );

  const result: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / config.sampleRate;
    const readPos = (t * config.frequency) % 1;
    const scanPos = (t * config.scanRate) % 1;
    const tableIdx = Math.floor(scanPos * (waveformCount - 1));
    const tableFrac = (scanPos * (waveformCount - 1)) % 1;

    const sampleIdx = Math.floor(readPos * tableLen);
    const val1 = tables[tableIdx]?.[sampleIdx] || 0;
    const val2 = tables[Math.min(tableIdx + 1, waveformCount - 1)]?.[sampleIdx] || 0;
    const value = val1 + (val2 - val1) * tableFrac;

    result.push(Math.max(0, Math.min(1, value * config.amplitude + config.offset)));
  }
  return result;
}

// === RING MODULATION ===

export interface RingModConfig {
  carrierFrequency: number;
  modulatorFrequency: number;
  amplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateRingModulation(config: RingModConfig): number[] {
  const numSamples = Math.floor(config.sampleRate * config.duration);
  const result: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / config.sampleRate;
    const carrier = Math.sin(2 * Math.PI * config.carrierFrequency * t);
    const modulator = Math.sin(2 * Math.PI * config.modulatorFrequency * t);
    const value = config.amplitude * carrier * modulator + config.offset;
    result.push(Math.max(0, Math.min(1, value)));
  }
  return result;
}

// === PHYSICAL MODELING (Karplus-Strong) ===

export interface KarplusStrongConfig {
  frequency: number;
  damping: number;
  brightness: number;
  amplitude: number;
  offset: number;
  sampleRate: number;
  duration: number;
}

export function generateKarplusStrong(config: KarplusStrongConfig): number[] {
  const period = Math.floor(config.sampleRate / config.frequency);
  const numSamples = Math.floor(config.sampleRate * config.duration);
  const buffer = new Float32Array(period);

  for (let i = 0; i < period; i++) {
    buffer[i] = (Math.random() * 2 - 1) * config.brightness;
  }

  const result: number[] = [];
  let idx = 0;
  for (let i = 0; i < numSamples; i++) {
    const current = buffer[idx % period];
    const next = buffer[(idx + 1) % period];
    const averaged = (current + next) * 0.5;
    buffer[idx % period] = averaged * config.damping;
    result.push(Math.max(0, Math.min(1, averaged * config.amplitude + config.offset)));
    idx++;
  }
  return result;
}
