import { describe, it, expect } from 'vitest';
import { BOARD_INFO, HardwareService, BoardType } from '../hardwareService';

describe('hardwareService', () => {
  describe('BOARD_INFO', () => {
    it('has info for all board types', () => {
      const boardTypes: BoardType[] = [
        'arduino_uno', 'arduino_nano', 'arduino_mega',
        'esp32', 'esp8266', 'microbit', 'unknown',
      ];
      for (const type of boardTypes) {
        expect(BOARD_INFO[type]).toBeDefined();
        expect(BOARD_INFO[type].type).toBe(type);
      }
    });

    it('Arduino Uno has correct specifications', () => {
      const info = BOARD_INFO.arduino_uno;
      expect(info.name).toBe('Arduino Uno');
      expect(info.manufacturer).toBe('Arduino');
      expect(info.maxDigitalPins).toBe(14);
      expect(info.maxAnalogPins).toBe(6);
      expect(info.voltage).toBe(5);
    });

    it('Arduino Nano has correct specifications', () => {
      const info = BOARD_INFO.arduino_nano;
      expect(info.name).toBe('Arduino Nano');
      expect(info.maxDigitalPins).toBe(14);
      expect(info.maxAnalogPins).toBe(8);
    });

    it('Arduino Mega has correct specifications', () => {
      const info = BOARD_INFO.arduino_mega;
      expect(info.name).toBe('Arduino Mega');
      expect(info.maxDigitalPins).toBe(54);
      expect(info.maxAnalogPins).toBe(16);
    });

    it('ESP32 has correct specifications', () => {
      const info = BOARD_INFO.esp32;
      expect(info.name).toBe('ESP32 DevKit');
      expect(info.manufacturer).toBe('Espressif');
      expect(info.voltage).toBe(3.3);
    });

    it('ESP8266 has correct specifications', () => {
      const info = BOARD_INFO.esp8266;
      expect(info.name).toBe('ESP8266');
      expect(info.voltage).toBe(3.3);
      expect(info.maxAnalogPins).toBe(1);
    });

    it('micro:bit has correct specifications', () => {
      const info = BOARD_INFO.microbit;
      expect(info.name).toBe('micro:bit');
      expect(info.manufacturer).toBe('BBC');
      expect(info.voltage).toBe(3);
    });

    it('unknown board has minimal capabilities', () => {
      const info = BOARD_INFO.unknown;
      expect(info.name).toBe('Unknown Board');
      expect(info.capabilities.pwm).toBe(false);
      expect(info.capabilities.wifi).toBe(false);
    });
  });

  describe('board capabilities', () => {
    it('Arduino Uno has PWM, I2C, SPI, no WiFi', () => {
      const caps = BOARD_INFO.arduino_uno.capabilities;
      expect(caps.pwm).toBe(true);
      expect(caps.i2c).toBe(true);
      expect(caps.spi).toBe(true);
      expect(caps.serial).toBe(true);
      expect(caps.wifi).toBe(false);
      expect(caps.bluetooth).toBe(false);
      expect(caps.analogWrite).toBe(true);
      expect(caps.analogRead).toBe(true);
      expect(caps.servoControl).toBe(true);
      expect(caps.tone).toBe(true);
    });

    it('ESP32 has WiFi and Bluetooth', () => {
      const caps = BOARD_INFO.esp32.capabilities;
      expect(caps.wifi).toBe(true);
      expect(caps.bluetooth).toBe(true);
      expect(caps.pwm).toBe(true);
      expect(caps.sleep).toBe(true);
    });

    it('ESP8266 has WiFi but no Bluetooth', () => {
      const caps = BOARD_INFO.esp8266.capabilities;
      expect(caps.wifi).toBe(true);
      expect(caps.bluetooth).toBe(false);
    });

    it('micro:bit has Bluetooth but no WiFi', () => {
      const caps = BOARD_INFO.microbit.capabilities;
      expect(caps.bluetooth).toBe(true);
      expect(caps.wifi).toBe(false);
    });

    it('Arduino boards do not have sleep capability', () => {
      expect(BOARD_INFO.arduino_uno.capabilities.sleep).toBe(false);
      expect(BOARD_INFO.arduino_nano.capabilities.sleep).toBe(false);
      expect(BOARD_INFO.arduino_mega.capabilities.sleep).toBe(false);
    });

    it('ESP32 and micro:bit have sleep capability', () => {
      expect(BOARD_INFO.esp32.capabilities.sleep).toBe(true);
      expect(BOARD_INFO.microbit.capabilities.sleep).toBe(true);
    });
  });

  describe('board protocols', () => {
    it('Arduino Uno supports serial, i2c, spi', () => {
      expect(BOARD_INFO.arduino_uno.protocols).toContain('serial');
      expect(BOARD_INFO.arduino_uno.protocols).toContain('i2c');
      expect(BOARD_INFO.arduino_uno.protocols).toContain('spi');
    });

    it('ESP32 supports wifi and bluetooth', () => {
      expect(BOARD_INFO.esp32.protocols).toContain('wifi');
      expect(BOARD_INFO.esp32.protocols).toContain('bluetooth');
    });

    it('micro:bit supports ble', () => {
      expect(BOARD_INFO.microbit.protocols).toContain('ble');
    });
  });

  describe('HardwareService', () => {
    it('creates instance with default options', () => {
      const service = new HardwareService();
      expect(service.getBoardType()).toBe('unknown');
      expect(service.getIsConnected()).toBe(false);
      expect(service.getIsUploading()).toBe(false);
      expect(service.getUploadProgress()).toBe(0);
    });

    it('creates instance with custom options', () => {
      const service = new HardwareService({
        baudRate: 9600,
        autoReconnect: true,
        maxReconnectAttempts: 3,
      });
      expect(service.getIsConnected()).toBe(false);
    });

    it('initializes with empty pin states', () => {
      const service = new HardwareService();
      const pins = service.getPinStates();
      expect(pins.size).toBe(0);
    });

    it('initializes with empty sensor data', () => {
      const service = new HardwareService();
      const data = service.getSensorData();
      expect(data.size).toBe(0);
    });

    it('initializes with null firmware info', () => {
      const service = new HardwareService();
      expect(service.getFirmwareInfo()).toBeNull();
    });

    it('initializes with zero command queue', () => {
      const service = new HardwareService();
      expect(service.getCommandQueueLength()).toBe(0);
    });

    it('clearCommandQueue clears the queue', () => {
      const service = new HardwareService();
      service.clearCommandQueue();
      expect(service.getCommandQueueLength()).toBe(0);
    });

    it('isReconnecting is false initially', () => {
      const service = new HardwareService();
      expect(service.getIsReconnecting()).toBe(false);
    });
  });
});
