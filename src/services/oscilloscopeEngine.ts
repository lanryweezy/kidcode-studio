// ============================================================
// Oscilloscope Simulation Engine
// Real-time waveform display, multi-channel, FFT, cursors
// ============================================================

import { CircuitComponent, Wire, HardwareState } from '../types';
import { fft } from './waveformGenerator';

// === OSCILLOSCOPE TYPES ===

export type TriggerMode = 'rising' | 'falling' | 'any' | 'none';
export type TriggerSweep = 'auto' | 'normal' | 'single';
export type CouplingMode = 'dc' | 'ac' | 'ground';
export type ChannelColor = '#22c55e' | '#ef4444' | '#3b82f6' | '#eab308' | '#f97316';
export type MathOperation = 'add' | 'subtract' | 'multiply' | 'fft';
export type ExportFormat = 'csv' | 'json';

export interface OscilloscopeChannel {
  id: number;
  pin: number;
  label: string;
  color: ChannelColor;
  voltageScale: number;   // volts per division
  coupling: CouplingMode;
  enabled: boolean;
  visible: boolean;
}

export interface OscilloscopeConfig {
  timebase: number;       // ms per division (1-1000)
  triggerMode: TriggerMode;
  triggerLevel: number;   // trigger voltage (0-5)
  triggerChannel: number;
  triggerSweep: TriggerSweep;
  horizontalPosition: number; // 0-100%
  channels: OscilloscopeChannel[];
  mathChannels: MathChannelConfig[];
  cursors: OscilloscopeCursor[];
  showGrid: boolean;
  showCursors: boolean;
  singleCaptured: boolean;
}

export interface MathChannelConfig {
  id: number;
  operation: MathOperation;
  sourceA: number;
  sourceB?: number;
  label: string;
  color: ChannelColor;
  visible: boolean;
}

export interface OscilloscopeCursor {
  x: number;            // horizontal position (0-500)
  y: number;            // vertical position (0-80)
  label: string;
}

export interface CursorMeasurement {
  deltaTime: number;
  deltaVoltage: number;
  frequency: number;
  cursorA: OscilloscopeCursor;
  cursorB: OscilloscopeCursor;
}

export interface OscilloscopeMeasurement {
  frequency: number;
  period: number;
  vpp: number;          // peak-to-peak voltage
  vrms: number;         // RMS voltage
  vhigh: number;
  vlow: number;
  dutyCycle: number;
  riseTime: number;
  fallTime: number;
}

// === OSCILLOSCOPE ENGINE ===

export class OscilloscopeEngine {
  private config: OscilloscopeConfig;
  private channels: Map<number, OscilloscopeChannel> = new Map();
  private waveformData: Map<number, number[]> = new Map();
  private mathWaveformData: Map<number, number[]> = new Map();
  private triggerPosition: number = 0;
  private sampleRate: number = 10000;

  constructor() {
    this.config = {
      timebase: 10,
      triggerMode: 'rising',
      triggerLevel: 2.5,
      triggerChannel: 0,
      triggerSweep: 'auto',
      horizontalPosition: 50,
      channels: [
        { id: 0, pin: 0, label: 'CH1', color: '#22c55e', voltageScale: 1, coupling: 'dc', enabled: true, visible: true },
      ],
      mathChannels: [],
      cursors: [
        { x: 100, y: 40, label: 'A' },
        { x: 200, y: 40, label: 'B' },
      ],
      showGrid: true,
      showCursors: false,
      singleCaptured: false,
    };
  }

  // === CONFIGURATION ===

  setTimebase(ms: number) {
    this.config.timebase = Math.max(0.1, Math.min(1000, ms));
  }

  setTrigger(mode: TriggerMode, level: number = 2.5, channel: number = 0) {
    this.config.triggerMode = mode;
    this.config.triggerLevel = level;
    this.config.triggerChannel = channel;
  }

  setTriggerSweep(sweep: TriggerSweep) {
    this.config.triggerSweep = sweep;
    if (sweep === 'single') {
      this.config.singleCaptured = false;
    }
  }

  setVoltageScale(channel: number, scale: number) {
    const ch = this.channels.get(channel);
    if (ch) ch.voltageScale = Math.max(0.01, Math.min(10, scale));
  }

  setCoupling(channel: number, coupling: CouplingMode) {
    const ch = this.channels.get(channel);
    if (ch) ch.coupling = coupling;
  }

  addChannel(pin: number, color: ChannelColor = '#22c55e'): OscilloscopeChannel {
    const id = this.channels.size;
    const channel: OscilloscopeChannel = {
      id, pin, label: `CH${id + 1}`, color,
      voltageScale: 1, coupling: 'dc', enabled: true, visible: true,
    };
    this.channels.set(id, channel);
    this.waveformData.set(id, []);
    return channel;
  }

  removeChannel(id: number) {
    this.channels.delete(id);
    this.waveformData.delete(id);
  }

  // === MATH CHANNELS ===

  addMathChannel(operation: MathOperation, sourceA: number, sourceB?: number): MathChannelConfig {
    const id = 100 + this.config.mathChannels.length;
    const labels: Record<MathOperation, string> = {
      add: 'CH1+CH2', subtract: 'CH1-CH2', multiply: 'CH1*CH2', fft: 'FFT',
    };
    const mathCh: MathChannelConfig = {
      id, operation: operation,
      sourceA, sourceB,
      label: labels[operation],
      color: '#f97316',
      visible: true,
    };
    this.config.mathChannels.push(mathCh);
    this.mathWaveformData.set(id, []);
    return mathCh;
  }

  removeMathChannel(id: number) {
    this.config.mathChannels = this.config.mathChannels.filter(c => c.id !== id);
    this.mathWaveformData.delete(id);
  }

  private computeMathChannels() {
    for (const mathCh of this.config.mathChannels) {
      const dataA = this.waveformData.get(mathCh.sourceA) || [];
      const dataB = this.waveformData.get(mathCh.sourceB ?? 0) || [];
      const len = Math.max(dataA.length, dataB.length);
      const result: number[] = [];

      if (mathCh.operation === 'fft') {
        const signal = dataA.length > 0 ? dataA : dataB;
        if (signal.length >= 4) {
          const n = signal.length;
          const real = [...signal];
          const imag = new Array(n).fill(0);
          const fftResult = fft(real, imag);
          const half = Math.floor(n / 2);
          for (let i = 0; i < half; i++) {
            const mag = Math.sqrt(fftResult.real[i] ** 2 + fftResult.imag[i] ** 2) / n;
            result.push(mag * 2);
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const a = dataA[i] ?? 0;
          const b = dataB[i] ?? 0;
          switch (mathCh.operation) {
            case 'add': result.push(a + b); break;
            case 'subtract': result.push(a - b); break;
            case 'multiply': result.push(a * b); break;
          }
        }
      }

      this.mathWaveformData.set(mathCh.id, result);
    }
  }

  // === CURSOR MEASUREMENTS ===

  setCursor(index: number, x: number, y: number) {
    if (index >= 0 && index < this.config.cursors.length) {
      this.config.cursors[index] = { ...this.config.cursors[index], x, y };
    }
  }

  setCursorA(x: number, y: number) { this.setCursor(0, x, y); }
  setCursorB(x: number, y: number) { this.setCursor(1, x, y); }

  measureCursors(channelId: number): CursorMeasurement | null {
    const cursors = this.config.cursors;
    if (cursors.length < 2) return null;

    const data = this.waveformData.get(channelId) || [];
    if (data.length === 0) return null;

    const ch = this.channels.get(channelId);
    const scaleY = ch ? ch.voltageScale : 1;
    const scaleX = (this.config.timebase * 10) / data.length;

    const deltaV = Math.abs(cursors[0].y - cursors[1].y) * scaleY / 80;
    const deltaX = Math.abs(cursors[0].x - cursors[1].x);
    const deltaTime = deltaX * scaleX / 1000;
    const frequency = deltaTime > 0 ? 1 / deltaTime : 0;

    return {
      deltaTime,
      deltaVoltage: deltaV,
      frequency,
      cursorA: cursors[0],
      cursorB: cursors[1],
    };
  }

  // === EXPORT DATA ===

  exportData(channelId: number, format: ExportFormat): string {
    const data = this.waveformData.get(channelId) || [];
    const ch = this.channels.get(channelId);
    const label = ch?.label || `CH${channelId}`;

    if (format === 'csv') {
      const header = 'Sample,Time(s),Voltage(V)\n';
      const rows = data.map((v, i) => {
        const time = (i / this.sampleRate).toFixed(6);
        const voltage = (v * (ch?.voltageScale || 1)).toFixed(4);
        return `${i},${time},${voltage}`;
      }).join('\n');
      return `${header}${rows}`;
    }

    if (format === 'json') {
      const exportObj = {
        channel: label,
        sampleRate: this.sampleRate,
        timebase: this.config.timebase,
        voltageScale: ch?.voltageScale || 1,
        samples: data.length,
        data: data.map((v, i) => ({
          sample: i,
          time: i / this.sampleRate,
          voltage: v * (ch?.voltageScale || 1),
        })),
      };
      return JSON.stringify(exportObj, null, 2);
    }

    return '';
  }

  exportAllChannels(format: ExportFormat): string {
    if (format === 'json') {
      const channels: Record<string, unknown> = {};
      this.channels.forEach((ch, id) => {
        const data = this.waveformData.get(id) || [];
        channels[ch.label] = {
          sampleRate: this.sampleRate,
          voltageScale: ch.voltageScale,
          data: data.map((v, i) => ({
            time: i / this.sampleRate,
            voltage: v * ch.voltageScale,
          })),
        };
      });
      return JSON.stringify({ channels }, null, 2);
    }
    return this.exportData(0, format);
  }

  // === DATA ACQUISITION ===

  captureData(hardwareState: HardwareState, timestamp: number) {
    if (this.config.triggerSweep === 'single' && this.config.singleCaptured) return;

    this.channels.forEach((channel, id) => {
      if (!channel.enabled) return;

      const data = this.waveformData.get(id) || [];

      // Read pin state
      const pinValue = hardwareState.pins[channel.pin] ? 5 : 0;

      // Apply coupling
      let value = pinValue;
      if (channel.coupling === 'ac') {
        value = pinValue - 2.5; // Remove DC offset
      } else if (channel.coupling === 'ground') {
        value = 0;
      }

      // Apply voltage scale
      value = value / channel.voltageScale;

      data.push(value);

      // Keep only last N samples based on timebase
      const maxSamples = Math.floor(this.sampleRate * (this.config.timebase * 10) / 1000);
      if (data.length > maxSamples) {
        data.splice(0, data.length - maxSamples);
      }

      this.waveformData.set(id, data);
    });

    // Check trigger
    this.checkTrigger(hardwareState);

    // Compute math channels
    this.computeMathChannels();
  }

  // === WAVEFORM RENDERING ===

  private checkTrigger(hardwareState: HardwareState) {
    if (this.config.triggerMode === 'none') return;

    const ch = this.channels.get(this.config.triggerChannel);
    if (!ch) return;

    const pinValue = hardwareState.pins[ch.pin] ? 5 : 0;
    const prevData = this.waveformData.get(ch.id) || [];
    const prevValue = prevData.length > 1 ? prevData[prevData.length - 2] : 0;

    let triggered = false;
    switch (this.config.triggerMode) {
      case 'rising':
        triggered = prevValue < this.config.triggerLevel && pinValue >= this.config.triggerLevel;
        break;
      case 'falling':
        triggered = prevValue >= this.config.triggerLevel && pinValue < this.config.triggerLevel;
        break;
      case 'any':
        triggered = (prevValue < this.config.triggerLevel && pinValue >= this.config.triggerLevel) ||
                    (prevValue >= this.config.triggerLevel && pinValue < this.config.triggerLevel);
        break;
    }

    if (triggered) {
      this.triggerPosition = Date.now();
      if (this.config.triggerSweep === 'single') {
        this.config.singleCaptured = true;
      }
    }
  }

  // === MEASUREMENTS ===

  measure(channelId: number): OscilloscopeMeasurement {
    const data = this.waveformData.get(channelId) || [];
    if (data.length === 0) {
      return { frequency: 0, period: 0, vpp: 0, vrms: 0, vhigh: 0, vlow: 0, dutyCycle: 0, riseTime: 0, fallTime: 0 };
    }

    const vhigh = Math.max(...data);
    const vlow = Math.min(...data);
    const vpp = vhigh - vlow;
    const vrms = Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length);

    // Frequency from zero crossings
    let crossings = 0;
    const threshold = (vhigh + vlow) / 2;
    let lastAbove = data[0] > threshold;
    for (let i = 1; i < data.length; i++) {
      const above = data[i] > threshold;
      if (above !== lastAbove) {
        crossings++;
        lastAbove = above;
      }
    }
    const period = crossings > 0 ? (data.length / crossings) / this.sampleRate : 0;
    const frequency = period > 0 ? 1 / period : 0;

    // Duty cycle
    let highCount = 0;
    for (const v of data) {
      if (v > threshold) highCount++;
    }
    const dutyCycle = data.length > 0 ? (highCount / data.length) * 100 : 0;

    // Rise/Fall time (simplified)
    const riseTime = 0.001;
    const fallTime = 0.001;

    return { frequency, period, vpp, vrms, vhigh, vlow, dutyCycle, riseTime, fallTime };
  }

  // === WAVEFORM RENDERING ===

  getWaveformPath(channelId: number, width: number, height: number): string {
    const data = this.waveformData.get(channelId) || [];
    if (data.length < 2) return '';

    const ch = this.channels.get(channelId);
    if (!ch || !ch.visible) return '';

    const scaleY = height / (ch.voltageScale * 2);
    const scaleX = width / data.length;

    let path = `M 0 ${height / 2}`;
    for (let i = 0; i < data.length; i++) {
      const x = i * scaleX;
      const y = height / 2 - data[i] * scaleY;
      path += ` L ${x} ${Math.max(0, Math.min(height, y))}`;
    }
    return path;
  }

  // === GETTERS ===

  getConfig(): OscilloscopeConfig { return this.config; }
  getChannels(): OscilloscopeChannel[] { return Array.from(this.channels.values()); }
  getWaveformData(channelId: number): number[] { return this.waveformData.get(channelId) || []; }
  getMathWaveformData(channelId: number): number[] { return this.mathWaveformData.get(channelId) || []; }
  getMathChannels(): MathChannelConfig[] { return this.config.mathChannels; }
  getCursors(): OscilloscopeCursor[] { return this.config.cursors; }
  getTriggerPosition(): number { return this.triggerPosition; }
  isSingleCaptured(): boolean { return this.config.singleCaptured; }
}

// === SINGLETON ===
export const oscilloscopeEngine = new OscilloscopeEngine();
