import { describe, it, expect } from 'vitest';
import {
  HardwareCodeGenerator,
  SerialMonitorService,
  FirmwareUploader,
  HardwareIntegrationService,
  PLATFORM_CONFIGS,
} from './hardwareIntegration';
import type { ProjectConfig } from './hardwareIntegration';

const arduinoConfig: ProjectConfig = {
  name: 'Test Project',
  platform: 'arduino',
  pins: [
    { pin: 13, mode: 'output', label: 'LED' },
    { pin: 2, mode: 'input', label: 'BUTTON' },
  ],
  sensors: [
    { type: 'DHT11', pin: 4, name: 'temp' },
  ],
  actuators: [
    { type: 'LED', pin: 13, name: 'status_led' },
  ],
  variables: [
    { name: 'counter', type: 'int', initialValue: '0' },
  ],
};

const esp32Config: ProjectConfig = {
  name: 'ESP32 Test',
  platform: 'esp32',
  pins: [
    { pin: 2, mode: 'output', label: 'LED' },
  ],
  sensors: [
    { type: 'analog', pin: 34, name: 'light' },
  ],
  actuators: [
    { type: 'LED', pin: 2, name: 'onboard_led' },
  ],
  wifi: { ssid: 'TestNetwork', password: 'password123' },
};

const piConfig: ProjectConfig = {
  name: 'Pi Test',
  platform: 'raspberry_pi',
  pins: [
    { pin: 17, mode: 'output', label: 'LED' },
  ],
  sensors: [],
  actuators: [
    { type: 'LED', pin: 17, name: 'led' },
  ],
};

describe('Hardware Code Generator', () => {
  describe('Arduino generation', () => {
    it('generates valid Arduino code', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(arduinoConfig);
      expect(result.platform).toBe('arduino');
      expect(result.filename).toContain('.ino');
      expect(result.source).toContain('void setup()');
      expect(result.source).toContain('void loop()');
      expect(result.source).toContain('Serial.begin');
    });

    it('includes required headers', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(arduinoConfig);
      expect(result.includes).toContain('Arduino.h');
      expect(result.includes).toContain('DHT.h');
    });

    it('defines pin modes', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(arduinoConfig);
      expect(result.source).toContain('pinMode');
    });
  });

  describe('ESP32 generation', () => {
    it('generates valid ESP32 code', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(esp32Config);
      expect(result.platform).toBe('esp32');
      expect(result.source).toContain('WiFi.begin');
      expect(result.source).toContain('Serial.begin(115200)');
    });

    it('includes WiFi support', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(esp32Config);
      expect(result.includes).toContain('WiFi.h');
      expect(result.source).toContain('ssid');
    });
  });

  describe('Raspberry Pi generation', () => {
    it('generates valid Python code', () => {
      const gen = new HardwareCodeGenerator();
      const result = gen.generate(piConfig);
      expect(result.platform).toBe('raspberry_pi');
      expect(result.filename).toContain('.py');
      expect(result.source).toContain('def main()');
      expect(result.source).toContain('while True');
    });
  });
});

describe('Serial Monitor Service', () => {
  it('adds messages', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('Hello', 'out');
    monitor.addMessage('Response', 'in');
    expect(monitor.getMessages()).toHaveLength(2);
  });

  it('detects JSON messages', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('{"key": "value"}', 'in');
    const msgs = monitor.getMessages();
    expect(msgs[0].type).toBe('json');
  });

  it('detects error messages', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('Error: timeout', 'in');
    const msgs = monitor.getMessages();
    expect(msgs[0].type).toBe('error');
  });

  it('pauses and resumes', () => {
    const monitor = new SerialMonitorService();
    monitor.pause();
    monitor.addMessage('test', 'in');
    expect(monitor.getMessages()).toHaveLength(0);
    monitor.resume();
    monitor.addMessage('test2', 'in');
    expect(monitor.getMessages()).toHaveLength(1);
  });

  it('clears messages', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('test', 'in');
    monitor.clear();
    expect(monitor.getMessages()).toHaveLength(0);
  });

  it('filters messages', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('Temperature: 25C', 'in');
    monitor.addMessage('Humidity: 60%', 'in');
    monitor.setFilters(['Temperature']);
    const filtered = monitor.getFilteredMessages();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].data).toContain('Temperature');
  });

  it('returns stats', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('test1', 'in');
    monitor.addMessage('test2', 'out');
    monitor.addMessage('Error: fail', 'in');
    const stats = monitor.getStats();
    expect(stats.total).toBe(3);
    expect(stats.inCount).toBe(2);
    expect(stats.outCount).toBe(1);
    expect(stats.errorCount).toBe(1);
  });

  it('exports log', () => {
    const monitor = new SerialMonitorService();
    monitor.addMessage('Hello', 'out');
    const log = monitor.exportLog();
    expect(log).toContain('TX:');
    expect(log).toContain('Hello');
  });
});

describe('Firmware Uploader', () => {
  it('has initial progress state', () => {
    const uploader = new FirmwareUploader();
    const progress = uploader.getProgress();
    expect(progress.stage).toBe('compiling');
    expect(progress.progress).toBe(0);
  });

  it('reports progress during upload', async () => {
    const uploader = new FirmwareUploader();
    const stages: string[] = [];
    uploader.onProgress(p => stages.push(p.stage));

    await uploader.upload('void setup(){} void loop(){}', 'arduino');

    expect(stages).toContain('compiling');
    expect(stages).toContain('uploading');
    expect(stages).toContain('verifying');
    expect(stages).toContain('complete');
  });
});

describe('Hardware Integration Service', () => {
  it('validates config', () => {
    const service = new HardwareIntegrationService();
    const errors = service.validateConfig(arduinoConfig);
    expect(errors).toHaveLength(0);
  });

  it('reports pin out of range', () => {
    const service = new HardwareIntegrationService();
    const badConfig: ProjectConfig = {
      ...arduinoConfig,
      pins: [{ pin: 100, mode: 'output', label: 'BAD' }],
    };
    const errors = service.validateConfig(badConfig);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('reports WiFi not supported', () => {
    const service = new HardwareIntegrationService();
    const badConfig: ProjectConfig = {
      ...arduinoConfig,
      wifi: { ssid: 'test', password: 'pass' },
    };
    const errors = service.validateConfig(badConfig);
    expect(errors.some(e => e.includes('WiFi'))).toBe(true);
  });

  it('returns supported platforms', () => {
    const service = new HardwareIntegrationService();
    const platforms = service.getSupportedPlatforms();
    expect(platforms).toContain('arduino');
    expect(platforms).toContain('esp32');
    expect(platforms).toContain('raspberry_pi');
  });

  it('returns platform info', () => {
    const service = new HardwareIntegrationService();
    const info = service.getPlatformInfo('esp32');
    expect(info.hasWifi).toBe(true);
    expect(info.voltage).toBe(3.3);
  });
});

describe('Platform Configs', () => {
  it('has Arduino config', () => {
    expect(PLATFORM_CONFIGS.arduino.language).toBe('cpp');
    expect(PLATFORM_CONFIGS.arduino.hasWifi).toBe(false);
  });

  it('has ESP32 config', () => {
    expect(PLATFORM_CONFIGS.esp32.hasWifi).toBe(true);
    expect(PLATFORM_CONFIGS.esp32.hasBluetooth).toBe(true);
  });

  it('has Raspberry Pi config', () => {
    expect(PLATFORM_CONFIGS.raspberry_pi.language).toBe('python');
    expect(PLATFORM_CONFIGS.raspberry_pi.hasWifi).toBe(true);
  });
});
