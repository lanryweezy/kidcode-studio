// ============================================================
// Logic Analyzer Simulation Engine
// Multi-channel digital signal analysis, protocol decoding
// ============================================================

import { CircuitComponent, Wire, HardwareState } from '../types';

// === LOGIC ANALYZER TYPES ===

export type LogicState = 'high' | 'low' | 'z' | 'x'; // z=high impedance, x=unknown
export type ProtocolType = 'i2c' | 'spi' | 'uart' | 'none';

export interface LogicChannel {
  id: number;
  pin: number;
  label: string;
  color: string;
  enabled: boolean;
  visible: boolean;
}

export interface LogicSample {
  timestamp: number;
  values: Map<number, LogicState>;
}

export interface TimingMeasurement {
  channel: number;
  riseTime: number;
  fallTime: number;
  pulseWidth: number;
  frequency: number;
  period: number;
  dutyCycle: number;
}

export interface ProtocolDecode {
  type: ProtocolType;
  data: (string | number | boolean)[];
  errors: string[];
}

export interface I2CMessage {
  address: number;
  rw: 'read' | 'write';
  register?: number;
  data: number[];
  timestamp: number;
}

export interface SPIMessage {
  mosi: number[];
  miso: number[];
  clock: number[];
  timestamp: number;
}

export interface UARTMessage {
  data: string;
  baudRate: number;
  timestamp: number;
}

// === LOGIC ANALYZER ENGINE ===

export class LogicAnalyzerEngine {
  private channels: Map<number, LogicChannel> = new Map();
  private samples: LogicSample[] = [];
  private maxSamples: number = 10000;
  private isCapturing: boolean = false;
  private sampleRate: number = 100000; // 100kHz
  private triggerChannel: number = 0;
  private triggerEdge: 'rising' | 'falling' = 'rising';

  // Protocol decoding state
  private i2cState: { sda: number; scl: number; bitCount: number; currentByte: number; address: number; rw: 'read' | 'write'; data: number[] } = {
    sda: 0, scl: 0, bitCount: 0, currentByte: 0, address: 0, rw: 'read', data: [],
  };
  private spiState: { mosi: number[]; miso: number[]; clock: number[]; cs: number } = {
    mosi: [], miso: [], clock: [], cs: 1,
  };
  private uartState: { rx: number; bitCount: number; currentByte: number; bits: number[] } = {
    rx: 1, bitCount: 0, currentByte: 0, bits: [],
  };

  private decodedProtocols: { i2c: I2CMessage[]; spi: SPIMessage[]; uart: UARTMessage[] } = {
    i2c: [], spi: [], uart: [],
  };

  // === CHANNEL MANAGEMENT ===

  addChannel(pin: number, color: string = '#22c55e'): LogicChannel {
    const id = this.channels.size;
    const channel: LogicChannel = {
      id, pin, label: `CH${id + 1}`, color, enabled: true, visible: true,
    };
    this.channels.set(id, channel);
    return channel;
  }

  removeChannel(id: number) {
    this.channels.delete(id);
  }

  getChannels(): LogicChannel[] {
    return Array.from(this.channels.values());
  }

  // === DATA CAPTURE ===

  captureData(hardwareState: HardwareState, timestamp: number) {
    if (!this.isCapturing) return;

    const values = new Map<number, LogicState>();
    this.channels.forEach((channel) => {
      if (!channel.enabled) return;
      const pinValue = hardwareState.pins[channel.pin];
      values.set(channel.id, pinValue ? 'high' : 'low');
    });

    this.samples.push({ timestamp, values });

    // Limit samples
    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }

    // Protocol decoding
    this.decodeProtocols(values, timestamp);
  }

  startCapture() {
    this.isCapturing = true;
    this.samples = [];
    this.decodedProtocols = { i2c: [], spi: [], uart: [] };
  }

  stopCapture() {
    this.isCapturing = false;
  }

  clearCapture() {
    this.samples = [];
    this.decodedProtocols = { i2c: [], spi: [], uart: [] };
  }

  // === PROTOCOL DECODING ===

  private decodeProtocols(values: Map<number, LogicState>, timestamp: number) {
    // Simple I2C decoder (SDA on channel 0, SCL on channel 1)
    const sdaCh = this.channels.get(0);
    const sclCh = this.channels.get(1);

    if (sdaCh && sclCh) {
      const sda = values.get(sdaCh.id) === 'high' ? 1 : 0;
      const scl = values.get(sclCh.id) === 'high' ? 1 : 0;

      // Detect START condition: SDA goes low while SCL is high
      if (this.i2cState.scl === 1 && this.i2cState.sda === 1 && scl === 1 && sda === 0) {
        this.i2cState.bitCount = 0;
        this.i2cState.currentByte = 0;
        this.i2cState.data = [];
      }

      // Sample data on SCL rising edge
      if (this.i2cState.scl === 0 && scl === 1) {
        this.i2cState.currentByte = (this.i2cState.currentByte << 1) | sda;
        this.i2cState.bitCount++;

        if (this.i2cState.bitCount === 8) {
          if (this.i2cState.data.length === 0) {
            this.i2cState.address = this.i2cState.currentByte >> 1;
            this.i2cState.rw = this.i2cState.currentByte & 1 ? 'read' : 'write';
          } else {
            this.i2cState.data.push(this.i2cState.currentByte);
          }
          this.i2cState.bitCount = 0;
          this.i2cState.currentByte = 0;
        }
      }

      // Detect STOP condition: SDA goes high while SCL is high
      if (this.i2cState.scl === 1 && this.i2cState.sda === 0 && scl === 1 && sda === 1) {
        if (this.i2cState.data.length > 0) {
          this.decodedProtocols.i2c.push({
            address: this.i2cState.address,
            rw: this.i2cState.rw,
            data: [...this.i2cState.data],
            timestamp,
          });
        }
        this.i2cState.data = [];
      }

      this.i2cState.sda = sda;
      this.i2cState.scl = scl;
    }

    // Simple UART decoder (RX on channel 0)
    const rxCh = this.channels.get(0);
    if (rxCh) {
      const rx = values.get(rxCh.id) === 'high' ? 1 : 0;

      // Start bit: RX goes low
      if (this.uartState.rx === 1 && rx === 0) {
        this.uartState.bitCount = 0;
        this.uartState.currentByte = 0;
        this.uartState.bits = [];
      }

      // Sample at mid-bit
      if (this.uartState.bitCount > 0 && this.uartState.bitCount < 9) {
        this.uartState.currentByte = (this.uartState.currentByte << 1) | rx;
        this.uartState.bits.push(rx);
        this.uartState.bitCount++;

        if (this.uartState.bitCount === 9) {
          // Stop bit
          this.decodedProtocols.uart.push({
            data: String.fromCharCode(this.uartState.currentByte),
            baudRate: 9600,
            timestamp,
          });
          this.uartState.bitCount = 0;
        }
      } else if (this.uartState.bitCount === 0 && rx === 1) {
        // Idle high
      } else {
        this.uartState.bitCount++;
      }

      this.uartState.rx = rx;
    }
  }

  // === TIMING MEASUREMENTS ===

  measureTiming(channelId: number): TimingMeasurement {
    const data: number[] = [];
    this.samples.forEach(s => {
      const val = s.values.get(channelId);
      data.push(val === 'high' ? 1 : 0);
    });

    if (data.length < 2) {
      return { channel: channelId, riseTime: 0, fallTime: 0, pulseWidth: 0, frequency: 0, period: 0, dutyCycle: 0 };
    }

    // Count transitions
    let riseCount = 0;
    let fallCount = 0;
    let highCount = 0;
    let lastState = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i] === 1 && lastState === 0) riseCount++;
      if (data[i] === 0 && lastState === 1) fallCount++;
      if (data[i] === 1) highCount++;
      lastState = data[i];
    }

    const transitions = riseCount + fallCount;
    const period = transitions > 0 ? data.length / transitions : 0;
    const frequency = period > 0 ? 1 / (period / this.sampleRate) : 0;
    const dutyCycle = data.length > 0 ? (highCount / data.length) * 100 : 0;

    return {
      channel: channelId,
      riseTime: 0.000001,
      fallTime: 0.000001,
      pulseWidth: period / 2 / this.sampleRate,
      frequency,
      period: period / this.sampleRate,
      dutyCycle,
    };
  }

  // === PROTOCOL DECODING ===

  getDecodedI2C(): I2CMessage[] {
    return this.decodedProtocols.i2c;
  }

  getDecodedSPI(): SPIMessage[] {
    return this.decodedProtocols.spi;
  }

  getDecodedUART(): UARTMessage[] {
    return this.decodedProtocols.uart;
  }

  // === WAVEFORM RENDERING ===

  getChannelWaveform(channelId: number, width: number, height: number): string {
    const data: LogicState[] = [];
    this.samples.forEach(s => {
      const val = s.values.get(channelId);
      data.push(val || 'low');
    });

    if (data.length < 2) return '';

    const stepX = width / data.length;
    let path = '';

    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = data[i] === 'high' ? 10 : height - 10;

      if (i === 0) {
        path = `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }

    return path;
  }

  // === GETTERS ===

  getSamples(): LogicSample[] { return this.samples; }
  getIsCapturing(): boolean { return this.isCapturing; }
  getDecodedProtocols() { return this.decodedProtocols; }
}

// === SINGLETON ===
export const logicAnalyzerEngine = new LogicAnalyzerEngine();
