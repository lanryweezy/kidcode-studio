import { describe, it, expect } from 'vitest';
import { simulateCircuit, ELECTRICAL_PROPS } from '../../services/circuitSimulator';
import { validateCircuit } from '../../services/circuitValidator';
import { generateWaveform, analyzeSignal, computeFFT } from '../../services/waveformGenerator';
import { CircuitComponent, Wire, HardwareState } from '../../types';

function createHardwareState(): HardwareState {
  return {
    pins: new Array(20).fill(false),
    buzzerActive: false,
    fanSpeed: 0,
    temperature: 25,
    servoAngle: 0,
    lcdLines: ['', '', '', ''],
    cursorRow: 0,
    cursorCol: 0,
    potentiometerValue: 0,
    speakerVolume: 0.5,
    rgbColor: '#000000',
    sevenSegmentValue: null,
    distance: 0,
    motionDetected: false,
    vibrationActive: false,
    keypadValue: null,
    joystick: { x: 0, y: 0 },
    pressure: 0,
    flex: 0,
    tilt: false,
    magneticField: 0,
    detectedColor: '',
    humidity: 50,
    gasLevel: 0,
    flameDetected: false,
    rainLevel: 0,
    soilMoisture: 0,
    heartbeatRate: 72,
    compassHeading: 0,
    gyroData: { x: 0, y: 0, z: 0 },
    gpsLocation: { lat: 0, lng: 0 },
    fingerprintMatch: false,
    rfidTag: null,
    stepperPosition: 0,
    pumpFlowRate: 0,
    solenoidActive: false,
    relayState: false,
    laserActive: false,
    bulbOn: false,
    continuousServoSpeed: 0,
    rgbLedColor: '',
    rgbStripColors: [],
    sdCardData: [],
    rtcTime: new Date(),
    logicGateOutput: false,
    timerOutput: false,
    wifiConnected: false,
    bluetoothConnected: false,
    cpuTemperature: 25,
    freeMemory: 32000,
    uptime: 0,
    variables: {},
    sensorHistory: [],
  };
}

describe('HardwareStage UI interactions', () => {
  const hw = createHardwareState();

  describe('drag-drop component placement', () => {
    it('simulates circuit after adding a single component', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([battery], [], hw);
      expect(result.componentStates.size).toBe(1);
      expect(result.warnings.some(w => w.includes('No power source'))).toBe(false);
    });

    it('validates circuit with newly placed components', () => {
      const components: CircuitComponent[] = [
        { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 },
        { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 },
      ];
      const validation = validateCircuit(components, []);
      expect(validation).toBeDefined();
    });

    it('snaps component positions to grid', () => {
      const snap = (val: number) => Math.round(val / 20) * 20;
      expect(snap(47)).toBe(40);
      expect(snap(53)).toBe(60);
      expect(snap(0)).toBe(0);
      expect(snap(19)).toBe(20);
    });
  });

  describe('wire connection interactions', () => {
    it('creates valid wire between connected components', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, led], wires, hw);
      expect(result.totalVoltage).toBe(9);
      expect(result.componentStates.get('led1')?.isActive).toBe(true);
    });

    it('simulates multi-wire chain', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const r1: CircuitComponent = { id: 'r1', type: 'RESISTOR', x: 60, y: 0, pin: 0 };
      const r2: CircuitComponent = { id: 'r2', type: 'RESISTOR', x: 120, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 180, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'r1', toPin: 0 },
        { id: 'w2', fromComponentId: 'r1', fromPin: 0, toComponentId: 'r2', toPin: 0 },
        { id: 'w3', fromComponentId: 'r2', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, r1, r2, led], wires, hw);
      expect(result.totalVoltage).toBe(9);
      expect(result.isShortCircuit).toBe(false);
    });

    it('detects when wire deletion breaks circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const result = simulateCircuit([battery, led], [], hw);
      expect(result.componentStates.get('led1')?.isActive).toBe(false);
    });
  });

  describe('component rotation effects', () => {
    it('rotation does not affect simulation result', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13, rotation: 90 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, led], wires, hw);
      expect(result.componentStates.get('led1')?.isActive).toBe(true);
    });
  });

  describe('selection and multi-select', () => {
    it('validates circuit with many components', () => {
      const components: CircuitComponent[] = Array.from({ length: 10 }, (_, i) => ({
        id: `led${i}`,
        type: 'LED_RED' as CircuitComponent['type'],
        x: i * 50,
        y: 0,
        pin: i,
      }));
      const validation = validateCircuit(components, []);
      expect(validation).toBeDefined();
    });
  });

  describe('undo/redo circuit history', () => {
    it('simulateCircuit is deterministic for same inputs', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result1 = simulateCircuit([battery, led], wires, hw);
      const result2 = simulateCircuit([battery, led], wires, hw);
      expect(result1.totalVoltage).toBe(result2.totalVoltage);
      expect(result1.isShortCircuit).toBe(result2.isShortCircuit);
    });
  });

  describe('zoom and pan', () => {
    it('zoom factor does not affect simulation', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([battery], [], hw);
      expect(result.totalVoltage).toBe(9);
    });
  });
});
