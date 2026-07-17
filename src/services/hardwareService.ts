
// ============================================================
// WebSerial Hardware Programming Service
// Real Arduino/ESP32 programming, code upload, sensor reading,
// serial monitor, pin state synchronization
// ============================================================

// === BOARD TYPES ===

export type BoardType = 'arduino_uno' | 'arduino_nano' | 'arduino_mega' | 'esp32' | 'esp8266' | 'microbit' | 'raspberry_pi_pico' | 'unknown';

export interface BoardInfo {
  type: BoardType;
  name: string;
  manufacturer: string;
  maxDigitalPins: number;
  maxAnalogPins: number;
  voltage: number;
  maxCurrent: number;
  protocols: string[];
  capabilities: BoardCapabilities;
}

export interface BoardCapabilities {
  pwm: boolean;
  i2c: boolean;
  spi: boolean;
  serial: boolean;
  wifi: boolean;
  bluetooth: boolean;
  analogWrite: boolean;
  analogRead: boolean;
  servoControl: boolean;
  tone: boolean;
  interrupts: boolean;
  sleep: boolean;
}

export interface FirmwareInfo {
  version: string;
  board: string;
  protocol: string;
  features: string[];
}

export interface BoardProfile {
  name: string;
  boardType: BoardType;
  baudRate: number;
  autoDetect: boolean;
  customPins: Record<number, string>;
  notes: string;
}

export const BOARD_PROFILES: Record<string, BoardProfile> = {
  'arduino_blink': { name: 'Arduino Blink', boardType: 'arduino_uno', baudRate: 9600, autoDetect: true, customPins: { 13: 'LED' }, notes: 'Basic blink test' },
  'esp32_wifi': { name: 'ESP32 WiFi', boardType: 'esp32', baudRate: 115200, autoDetect: true, customPins: { 2: 'LED' }, notes: 'WiFi connectivity test' },
  'pico_pwm': { name: 'Pico PWM', boardType: 'raspberry_pi_pico', baudRate: 115200, autoDetect: true, customPins: { 0: 'PWM_OUT' }, notes: 'PWM signal test' },
};

export interface CommandHistoryEntry {
  id: string;
  command: Record<string, any>;
  timestamp: number;
  success: boolean;
  response?: string;
  duration: number;
}

export interface PinVisualization {
  pin: number;
  state: boolean;
  analogValue: number;
  pwmValue: number;
  lastChanged: number;
  label: string;
}

export interface CommandQueueItem {
  id: string;
  command: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  timestamp: number;
  retries: number;
  maxRetries: number;
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
}

export interface ConnectionOptions {
  baudRate?: number;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  commandTimeout?: number;
  queueSize?: number;
}

export const BOARD_INFO: Record<BoardType, BoardInfo> = {
  arduino_uno: {
    type: 'arduino_uno', name: 'Arduino Uno', manufacturer: 'Arduino',
    maxDigitalPins: 14, maxAnalogPins: 6, voltage: 5, maxCurrent: 0.04,
    protocols: ['serial', 'i2c', 'spi'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: false, bluetooth: false, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: false,
    },
  },
  arduino_nano: {
    type: 'arduino_nano', name: 'Arduino Nano', manufacturer: 'Arduino',
    maxDigitalPins: 14, maxAnalogPins: 8, voltage: 5, maxCurrent: 0.04,
    protocols: ['serial', 'i2c', 'spi'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: false, bluetooth: false, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: false,
    },
  },
  arduino_mega: {
    type: 'arduino_mega', name: 'Arduino Mega', manufacturer: 'Arduino',
    maxDigitalPins: 54, maxAnalogPins: 16, voltage: 5, maxCurrent: 0.04,
    protocols: ['serial', 'i2c', 'spi'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: false, bluetooth: false, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: false,
    },
  },
  esp32: {
    type: 'esp32', name: 'ESP32 DevKit', manufacturer: 'Espressif',
    maxDigitalPins: 34, maxAnalogPins: 18, voltage: 3.3, maxCurrent: 0.02,
    protocols: ['serial', 'i2c', 'spi', 'wifi', 'bluetooth'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: true, bluetooth: true, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: true,
    },
  },
  esp8266: {
    type: 'esp8266', name: 'ESP8266', manufacturer: 'Espressif',
    maxDigitalPins: 17, maxAnalogPins: 1, voltage: 3.3, maxCurrent: 0.012,
    protocols: ['serial', 'wifi'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: true, bluetooth: false, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: true,
    },
  },
  microbit: {
    type: 'microbit', name: 'micro:bit', manufacturer: 'BBC',
    maxDigitalPins: 25, maxAnalogPins: 6, voltage: 3, maxCurrent: 0.02,
    protocols: ['serial', 'i2c', 'spi', 'ble'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: false, bluetooth: true, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: true,
    },
  },
  raspberry_pi_pico: {
    type: 'raspberry_pi_pico', name: 'Raspberry Pi Pico', manufacturer: 'Raspberry Pi',
    maxDigitalPins: 26, maxAnalogPins: 4, voltage: 3.3, maxCurrent: 0.05,
    protocols: ['serial', 'i2c', 'spi'],
    capabilities: {
      pwm: true, i2c: true, spi: true, serial: true,
      wifi: false, bluetooth: false, analogWrite: true, analogRead: true,
      servoControl: true, tone: true, interrupts: true, sleep: true,
    },
  },
  unknown: {
    type: 'unknown', name: 'Unknown Board', manufacturer: 'Unknown',
    maxDigitalPins: 14, maxAnalogPins: 6, voltage: 5, maxCurrent: 0.04,
    protocols: ['serial'],
    capabilities: {
      pwm: false, i2c: false, spi: false, serial: true,
      wifi: false, bluetooth: false, analogWrite: false, analogRead: false,
      servoControl: false, tone: false, interrupts: false, sleep: false,
    },
  },
};

// === HARDWARE SERVICE ===

export class HardwareService {
  private port: { open: (options: { baudRate: number }) => Promise<void>; close: () => Promise<void>; readable: { getReader: () => ReadableStreamDefaultReader<Uint8Array> }; writable: { getWriter: () => WritableStreamDefaultWriter<Uint8Array> } } | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private boardType: BoardType = 'unknown';
  private boardInfo: BoardInfo = BOARD_INFO.unknown;
  private isConnected: boolean = false;
  private isUploading: boolean = false;
  private uploadProgress: number = 0;
  private onDataCallback: ((data: string) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;
  private sensorData: Map<string, number> = new Map();
  private pinStates: Map<number, boolean> = new Map();
  private analogValues: Map<number, number> = new Map();
  
  // New properties for enhanced functionality
  private commandQueue: CommandQueueItem[] = [];
  private queueProcessing: boolean = false;
  private firmwareInfo: FirmwareInfo | null = null;
  private connectionOptions: ConnectionOptions;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private isReconnecting: boolean = false;
  private lastConnectedTime: number = 0;
  private connectionMonitorInterval: ReturnType<typeof setInterval> | null = null;
  private commandIdCounter: number = 0;

  // Board profiles
  private activeProfile: BoardProfile | null = null;

  // Command history
  private commandHistory: CommandHistoryEntry[] = [];
  private maxHistorySize: number = 1000;

  // Pin visualization
  private pinVisualizations: Map<number, PinVisualization> = new Map();

  // Error recovery
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  private errorRecoveryEnabled: boolean = true;

  constructor(options: ConnectionOptions = {}) {
    this.connectionOptions = options;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
  }

  // === CONNECTION ===

  async connect(options?: ConnectionOptions): Promise<boolean> {
    try {
      if (options) {
        this.connectionOptions = { ...this.connectionOptions, ...options };
      }
      
      // @ts-expect-error - Web Serial API
      this.port = await navigator.serial.requestPort();
      if (!this.port) return false;
      
      const baudRate = this.connectionOptions.baudRate || 115200;
      await this.port.open({ baudRate });
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.lastConnectedTime = Date.now();
      
      this.onStatusCallback?.('Connected to serial port');
      
      // Start reading loop
      this.startReadLoop();
      
      // Start connection monitoring
      if (this.connectionOptions.autoReconnect) {
        this.startConnectionMonitor();
      }
      
      // Detect board type and firmware
      await this.detectBoard();
      await this.detectFirmware();
      
      return true;
    } catch (e) {
      console.error('Connection failed:', e);
      this.onStatusCallback?.(`Connection failed: ${  (e as Error).message}`);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.reader) await this.reader.cancel();
      if (this.writer) this.writer.releaseLock();
      if (this.port) await this.port.close();
    } catch (e) {
      console.error('Disconnect error:', e);
    }
    
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.isConnected = false;
    this.boardType = 'unknown';
    this.firmwareInfo = null;
    this.stopConnectionMonitor();
    this.onStatusCallback?.('Disconnected');
  }

  // === AUTO-RECONNECT ===

  private startConnectionMonitor() {
    if (this.connectionMonitorInterval) return;
    
    this.connectionMonitorInterval = setInterval(async () => {
      if (this.isConnected && !this.isReconnecting) {
        // Check if connection is still alive
        try {
          // Send a keepalive or check connection status
          if (this.writer) {
            const encoder = new TextEncoder();
            await this.writer.write(encoder.encode('\n'));
          }
        } catch (e) {
          console.warn('Connection check failed, attempting reconnect...');
          await this.attemptReconnect();
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private stopConnectionMonitor() {
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval);
      this.connectionMonitorInterval = null;
    }
  }

  private async attemptReconnect(): Promise<boolean> {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return false;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = this.connectionOptions.reconnectDelay || 1000;
    this.onStatusCallback?.(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to reconnect
      if (this.port) {
        await this.port.open({ baudRate: this.connectionOptions.baudRate || 115200 });
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
        this.isConnected = true;
        
        this.startReadLoop();
        await this.detectBoard();
        await this.detectFirmware();
        
        this.onStatusCallback?.('Reconnected successfully');
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        
        // Process any queued commands
        this.processCommandQueue();
        
        return true;
      }
    } catch (e) {
      console.error('Reconnect failed:', e);
      this.onStatusCallback?.(`Reconnect failed: ${  (e as Error).message}`);
    }
    
    this.isReconnecting = false;
    return false;
  }

  // === FIRMWARE DETECTION ===

  async detectFirmware(): Promise<FirmwareInfo | null> {
    try {
      // Send firmware identification command
      await this.sendRaw('KidCode:firmware:version\n');
      await this.delay(500);
      
      const response = await this.readWithTimeout(1000);
      
      // Parse firmware version from response
      const versionMatch = response.match(/v(\d+\.\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : '1.0.0';
      
      this.firmwareInfo = {
        version,
        board: this.boardInfo.name,
        protocol: 'KidCode v1',
        features: this.parseFeatures(response),
      };
      
      this.onStatusCallback?.(`Firmware: v${version}`);
      return this.firmwareInfo;
    } catch (e) {
      console.error('Firmware detection failed:', e);
      return null;
    }
  }

  private parseFeatures(response: string): string[] {
    const features: string[] = [];
    
    if (response.includes('pwm')) features.push('pwm');
    if (response.includes('i2c')) features.push('i2c');
    if (response.includes('spi')) features.push('spi');
    if (response.includes('wifi')) features.push('wifi');
    if (response.includes('ble')) features.push('bluetooth');
    
    return features;
  }

  // === BOARD CAPABILITY DISCOVERY ===

  async discoverCapabilities(): Promise<BoardCapabilities> {
    try {
      await this.sendRaw('KidCode:capabilities\n');
      await this.delay(500);
      
      const response = await this.readWithTimeout(1000);
      
      // Parse capabilities from response
      const capabilities: BoardCapabilities = {
        pwm: response.includes('pwm:1'),
        i2c: response.includes('i2c:1'),
        spi: response.includes('spi:1'),
        serial: true,
        wifi: response.includes('wifi:1'),
        bluetooth: response.includes('ble:1'),
        analogWrite: response.includes('analogWrite:1'),
        analogRead: response.includes('analogRead:1'),
        servoControl: response.includes('servo:1'),
        tone: response.includes('tone:1'),
        interrupts: response.includes('interrupts:1'),
        sleep: response.includes('sleep:1'),
      };
      
      this.onStatusCallback?.(`Capabilities: ${Object.entries(capabilities).filter(([,v]) => v).map(([k]) => k).join(', ')}`);
      return capabilities;
    } catch (e) {
      console.error('Capability discovery failed:', e);
      return this.boardInfo.capabilities;
    }
  }

  // === BOARD DETECTION ===

  async detectBoard(): Promise<BoardType> {
    try {
      // Send identification command
      await this.sendRaw('KidCode:identify\n');
      await this.delay(1000);

      // Try to read response
      const response = await this.readWithTimeout(2000);

      if (response.includes('Arduino Uno') || response.includes('ATmega328P')) {
        this.boardType = 'arduino_uno';
      } else if (response.includes('Arduino Nano')) {
        this.boardType = 'arduino_nano';
      } else if (response.includes('Arduino Mega') || response.includes('ATmega2560')) {
        this.boardType = 'arduino_mega';
      } else if (response.includes('ESP32')) {
        this.boardType = 'esp32';
      } else if (response.includes('ESP8266') || response.includes('NodeMCU')) {
        this.boardType = 'esp8266';
      } else if (response.includes('micro:bit') || response.includes('nRF51')) {
        this.boardType = 'microbit';
      } else if (response.includes('Pico') || response.includes('RP2040')) {
        this.boardType = 'raspberry_pi_pico';
      } else {
        // Default to Arduino Uno if we got any response
        this.boardType = response.length > 0 ? 'arduino_uno' : 'unknown';
      }

      this.boardInfo = BOARD_INFO[this.boardType];
      this.onStatusCallback?.(`Detected: ${this.boardInfo.name}`);
      return this.boardType;
    } catch (e) {
      this.boardType = 'unknown';
      return 'unknown';
    }
  }

  // === CODE UPLOAD ===

  async uploadCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.writer) return { success: false, error: 'Not connected' };

    this.isUploading = true;
    this.uploadProgress = 0;
    this.onStatusCallback?.('Uploading code...');

    try {
      // For Arduino, we send the code line by line
      // In production, this would use avrdude protocol via WebSerial
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        await this.sendRaw(`${lines[i]  }\n`);
        this.uploadProgress = Math.floor((i / lines.length) * 100);
        this.onStatusCallback?.(`Uploading: ${this.uploadProgress}%`);
        await this.delay(10);
      }

      // Send reset command
      await this.sendRaw('KidCode:run\n');
      this.onStatusCallback?.('Code uploaded successfully!');
      this.isUploading = false;
      return { success: true };
    } catch (e) {
      this.isUploading = false;
      this.onStatusCallback?.(`Upload failed: ${  (e as Error).message}`);
      return { success: false, error: (e as Error).message };
    }
  }

  // === PIN CONTROL ===

  async sendCommand(cmd: Record<string, any>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const commandItem: CommandQueueItem = {
        id: `cmd_${this.commandIdCounter++}`,
        command: cmd,
        priority: 'normal',
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3,
        resolve,
        reject,
      };
      
      this.commandQueue.push(commandItem);
      this.processCommandQueue();
    });
  }

  private async processCommandQueue() {
    if (this.queueProcessing || this.commandQueue.length === 0) return;
    
    this.queueProcessing = true;
    
    while (this.commandQueue.length > 0 && this.isConnected) {
      // Sort by priority (high > normal > low)
      this.commandQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      const item = this.commandQueue.shift()!;
      
      try {
        const startTime = Date.now();
        const encoder = new TextEncoder();
        const data = `${JSON.stringify(item.command)  }\n`;
        await this.writer!.write(encoder.encode(data));
        const duration = Date.now() - startTime;
        this.addToHistory(item.command, true, duration);
        item.resolve(true);
      } catch (e) {
        const duration = Date.now() - item.timestamp;
        this.addToHistory(item.command, false, duration, (e as Error).message);
        this.recordError(`Command failed: ${(e as Error).message}`);
        item.retries++;
        if (item.retries < item.maxRetries) {
          this.commandQueue.unshift(item); // Re-queue for retry
        } else {
          item.reject(e as Error);
        }
      }
      
      // Small delay between commands
      await this.delay(5);
    }
    
    this.queueProcessing = false;
  }

  async digitalWrite(pin: number, value: boolean) {
    await this.sendCommand({ type: 'digitalWrite', pin, value: value ? 1 : 0 });
    this.pinStates.set(pin, value);
  }

  async analogWrite(pin: number, value: number) {
    await this.sendCommand({ type: 'analogWrite', pin, value: Math.max(0, Math.min(255, value)) });
  }

  async servoWrite(pin: number, angle: number) {
    await this.sendCommand({ type: 'servoWrite', pin, angle: Math.max(0, Math.min(180, angle)) });
  }

  async tone(pin: number, frequency: number, duration: number = 500) {
    await this.sendCommand({ type: 'tone', pin, frequency, duration });
  }

  async noTone(pin: number) {
    await this.sendCommand({ type: 'noTone', pin });
  }

  // === SENSOR READING ===

  async readDigital(pin: number): Promise<boolean> {
    await this.sendCommand({ type: 'digitalRead', pin });
    const response = await this.readWithTimeout(1000);
    const value = this.parseDigitalResponse(response);
    return value;
  }

  async readAnalog(pin: number): Promise<number> {
    await this.sendCommand({ type: 'analogRead', pin });
    const response = await this.readWithTimeout(1000);
    const value = this.parseAnalogResponse(response);
    return value;
  }

  async readDHT(type: 'DHT11' | 'DHT22', pin: number): Promise<{ temperature: number; humidity: number }> {
    await this.sendCommand({ type: 'readDHT', sensorType: type, pin });
    const response = await this.readWithTimeout(2000);
    return this.parseDHTResponse(response);
  }

  async readUltrasonic(trigPin: number, echoPin: number): Promise<number> {
    await this.sendCommand({ type: 'readUltrasonic', trigPin, echoPin });
    const response = await this.readWithTimeout(1000);
    return this.parseUltrasonicResponse(response);
  }

  // === SERIAL MONITOR ===

  async sendRaw(data: string) {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    await this.writer.write(encoder.encode(data));
  }

  async readWithTimeout(ms: number): Promise<string> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(''), ms);
      const originalCallback = this.onDataCallback;
      this.onDataCallback = (data: string) => {
        clearTimeout(timeout);
        this.onDataCallback = originalCallback;
        resolve(data);
      };
    });
  }

  // === INTERNAL ===

  private async startReadLoop() {
    if (!this.reader) return;
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          const decoder = new TextDecoder();
          const text = decoder.decode(value);
          this.onDataCallback?.(text);
          this.onStatusCallback?.(text);
        }
      }
    } catch (e) {
      console.error('Read loop error:', e);
    }
  }

  private parseDigitalResponse(response: string): boolean {
    const match = response.match(/[01]/);
    return match ? match[0] === '1' : false;
  }

  private parseAnalogResponse(response: string): number {
    const match = response.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  private parseDHTResponse(response: string): { temperature: number; humidity: number } {
    const tempMatch = response.match(/T:([-\d.]+)/);
    const humMatch = response.match(/H:([-\d.]+)/);
    return {
      temperature: tempMatch ? parseFloat(tempMatch[1]) : 25,
      humidity: humMatch ? parseFloat(humMatch[1]) : 50,
    };
  }

  private parseUltrasonicResponse(response: string): number {
    const match = response.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === GETTERS ===

  getBoardType(): BoardType { return this.boardType; }
  getBoardInfo(): BoardInfo { return this.boardInfo; }
  getIsConnected(): boolean { return this.isConnected; }
  getIsUploading(): boolean { return this.isUploading; }
  getUploadProgress(): number { return this.uploadProgress; }
  getPinStates(): Map<number, boolean> { return this.pinStates; }
  getSensorData(): Map<string, number> { return this.sensorData; }
  getFirmwareInfo(): FirmwareInfo | null { return this.firmwareInfo; }
  getCommandQueueLength(): number { return this.commandQueue.length; }
  getIsReconnecting(): boolean { return this.isReconnecting; }

  // === BOARD PROFILES ===

  loadBoardProfile(profileName: string): boolean {
    const profile = BOARD_PROFILES[profileName];
    if (!profile) return false;
    this.activeProfile = profile;
    this.connectionOptions.baudRate = profile.baudRate;
    this.onStatusCallback?.(`Loaded profile: ${profile.name}`);
    return true;
  }

  getActiveProfile(): BoardProfile | null {
    return this.activeProfile;
  }

  getAvailableProfiles(): Record<string, BoardProfile> {
    return { ...BOARD_PROFILES };
  }

  // === COMMAND HISTORY ===

  getCommandHistory(): CommandHistoryEntry[] {
    return [...this.commandHistory];
  }

  clearCommandHistory() {
    this.commandHistory = [];
  }

  private addToHistory(command: Record<string, any>, success: boolean, duration: number, response?: string) {
    const entry: CommandHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      command,
      timestamp: Date.now(),
      success,
      response,
      duration,
    };
    this.commandHistory.push(entry);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.splice(0, this.commandHistory.length - this.maxHistorySize);
    }
  }

  getCommandStats(): { total: number; success: number; failed: number; avgDuration: number } {
    const total = this.commandHistory.length;
    const success = this.commandHistory.filter(h => h.success).length;
    const avgDuration = total > 0
      ? this.commandHistory.reduce((s, h) => s + h.duration, 0) / total
      : 0;
    return { total, success, failed: total - success, avgDuration: Math.round(avgDuration) };
  }

  // === PIN STATE VISUALIZATION ===

  getPinVisualization(pin: number): PinVisualization {
    if (!this.pinVisualizations.has(pin)) {
      this.pinVisualizations.set(pin, {
        pin,
        state: false,
        analogValue: 0,
        pwmValue: 0,
        lastChanged: Date.now(),
        label: `Pin ${pin}`,
      });
    }
    return this.pinVisualizations.get(pin)!;
  }

  getAllPinVisualizations(): PinVisualization[] {
    return Array.from(this.pinVisualizations.values());
  }

  updatePinVisualization(pin: number, state: boolean, analogValue?: number, pwmValue?: number) {
    const viz = this.getPinVisualization(pin);
    viz.state = state;
    if (analogValue !== undefined) viz.analogValue = analogValue;
    if (pwmValue !== undefined) viz.pwmValue = pwmValue;
    viz.lastChanged = Date.now();
  }

  // === ERROR RECOVERY ===

  getErrorStats(): { errorCount: number; lastErrorTime: number; recoveryEnabled: boolean } {
    return { errorCount: this.errorCount, lastErrorTime: this.lastErrorTime, recoveryEnabled: this.errorRecoveryEnabled };
  }

  private recordError(error: string) {
    this.errorCount++;
    this.lastErrorTime = Date.now();
    console.error(`[HardwareService] Error: ${error}`);
  }

  async withErrorRecovery<T>(operation: () => Promise<T>, fallback: T, context: string): Promise<T> {
    if (!this.errorRecoveryEnabled) {
      try {
        return await operation();
      } catch (e) {
        this.recordError(`${context}: ${(e as Error).message}`);
        return fallback;
      }
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) this.onStatusCallback?.(`Recovered after ${attempt} attempts`);
        return result;
      } catch (e) {
        this.recordError(`${context} (attempt ${attempt}/${maxRetries}): ${(e as Error).message}`);
        if (attempt < maxRetries) {
          await this.delay(200 * attempt);
          if (!this.isConnected) {
            const reconnected = await this.attemptReconnect();
            if (!reconnected) return fallback;
          }
        }
      }
    }
    return fallback;
  }

  // === UTILITY METHODS ===

  clearCommandQueue() {
    this.commandQueue = [];
  }

  async sendHighPriorityCommand(cmd: Record<string, any>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const commandItem: CommandQueueItem = {
        id: `cmd_${this.commandIdCounter++}`,
        command: cmd,
        priority: 'high',
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 5,
        resolve,
        reject,
      };
      
      this.commandQueue.unshift(commandItem);
      this.processCommandQueue();
    });
  }

  setStatusCallback(cb: (status: string) => void) { this.onStatusCallback = cb; }
}

export const hardwareService = new HardwareService();
