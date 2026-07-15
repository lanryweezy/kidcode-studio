import { describe, it, expect, beforeEach } from 'vitest';
import {
  simulateCircuit,
  calculateNodeVoltages,
  calculatePropagationDelay,
  detectOpenCircuit,
  getComponentProperties,
  formatValue,
  findConnectedGroups,
  ELECTRICAL_PROPS,
} from '../circuitSimulator';
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

describe('circuitSimulator', () => {
  let hw: HardwareState;

  beforeEach(() => {
    hw = createHardwareState();
  });

  describe('simulateCircuit', () => {
    it('returns empty result for empty components', () => {
      const result = simulateCircuit([], [], hw);
      expect(result.totalCurrent).toBe(0);
      expect(result.totalVoltage).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('warns when no power source present', () => {
      const components: CircuitComponent[] = [
        { id: 'led1', type: 'LED_RED', x: 0, y: 0, pin: 13 },
      ];
      const result = simulateCircuit(components, [], hw);
      expect(result.warnings.some(w => w.includes('No power source'))).toBe(true);
    });

    it('detects short circuit with battery and no load', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([battery], [], hw);
      expect(result.isShortCircuit).toBe(true);
      expect(result.errors.some(e => e.includes('SHORT CIRCUIT'))).toBe(true);
    });

    it('simulates battery + resistor + LED circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const resistor: CircuitComponent = { id: 'r1', type: 'RESISTOR', x: 100, y: 0, pin: 0, resistance: 330 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 200, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'r1', toPin: 0 },
        { id: 'w2', fromComponentId: 'r1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, resistor, led], wires, hw);
      expect(result.totalVoltage).toBe(9);
      expect(result.isShortCircuit).toBe(false);
    });

    it('marks LED as active in battery + LED circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, led], wires, hw);
      const ledState = result.componentStates.get('led1');
      expect(ledState).toBeDefined();
      expect(ledState!.isActive).toBe(true);
    });

    it('calculates LED brightness based on current', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, led], wires, hw);
      const ledState = result.componentStates.get('led1');
      expect(ledState).toBeDefined();
      if (ledState!.isActive && ledState!.brightness !== undefined) {
        expect(ledState!.brightness).toBeGreaterThanOrEqual(0);
        expect(ledState!.brightness).toBeLessThanOrEqual(100);
      }
    });

    it('calculates node voltages', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const nodeVoltages = calculateNodeVoltages([battery, led], wires, 9.0);
      expect(nodeVoltages.size).toBeGreaterThan(0);
    });

    it('calculates propagation delay with different component types', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const diode: CircuitComponent = { id: 'd1', type: 'DIODE', x: 100, y: 0, pin: 0 };
      const transistor: CircuitComponent = { id: 't1', type: 'TRANSISTOR_NPN', x: 200, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 300, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'd1', toPin: 0 },
        { id: 'w2', fromComponentId: 'd1', fromPin: 0, toComponentId: 't1', toPin: 0 },
        { id: 'w3', fromComponentId: 't1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const delay = calculatePropagationDelay([battery, diode, transistor, led], wires);
      expect(delay).toBeGreaterThan(0);
    });

    it('returns propagation delay of 0 for empty circuit', () => {
      const delay = calculatePropagationDelay([], []);
      expect(delay).toBe(0);
    });
  });

  describe('detectOpenCircuit', () => {
    it('detects disconnected components', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const result = detectOpenCircuit([battery, led], []);
      expect(result.isOpen).toBe(true);
      expect(result.disconnectedComponents).toContain('led1');
    });

    it('reports no open circuit when all connected', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const result = detectOpenCircuit([battery, led], wires);
      expect(result.isOpen).toBe(false);
      expect(result.disconnectedComponents).toHaveLength(0);
    });

    it('ignores battery and breadboard for disconnected check', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const breadboard: CircuitComponent = { id: 'bb1', type: 'BREADBOARD', x: 100, y: 0, pin: 0 };
      const result = detectOpenCircuit([battery, breadboard], []);
      expect(result.isOpen).toBe(false);
    });
  });

  describe('findConnectedGroups', () => {
    it('finds single connected group', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const groups = findConnectedGroups([battery, led], wires);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toContain('b1');
      expect(groups[0]).toContain('led1');
    });

    it('finds multiple disconnected groups', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const led1: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 };
      const led2: CircuitComponent = { id: 'led2', type: 'LED_BLUE', x: 200, y: 0, pin: 12 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'led1', toPin: 0 },
      ];
      const groups = findConnectedGroups([battery, led1, led2], wires);
      expect(groups).toHaveLength(2);
    });

    it('handles no wires', () => {
      const components: CircuitComponent[] = [
        { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 },
        { id: 'led1', type: 'LED_RED', x: 100, y: 0, pin: 13 },
      ];
      const groups = findConnectedGroups(components, []);
      expect(groups).toHaveLength(2);
    });
  });

  describe('getComponentProperties', () => {
    it('returns properties for known component', () => {
      const props = getComponentProperties('BATTERY_9V');
      expect(props.voltage).toBe(9);
      expect(props.resistance).toBeDefined();
    });

    it('returns default properties for unknown component', () => {
      const props = getComponentProperties('UNKNOWN_TYPE' as any);
      expect(props.resistance).toBe(1000);
    });

    it('returns LED properties with forward voltage', () => {
      const props = getComponentProperties('LED_RED');
      expect(props.forwardVoltage).toBe(1.8);
      expect(props.maxCurrent).toBe(0.03);
    });
  });

  describe('formatValue', () => {
    it('formats ohms with k and M suffixes', () => {
      expect(formatValue(470, 'Ω')).toBe('470Ω');
      expect(formatValue(1500, 'Ω')).toBe('1.5kΩ');
      expect(formatValue(1500000, 'Ω')).toBe('1.5MΩ');
    });

    it('formats farads with m, µ, and n suffixes', () => {
      expect(formatValue(0.001, 'F')).toBe('1.0mF');
      expect(formatValue(0.000001, 'F')).toBe('1.0µF');
      expect(formatValue(0.000000001, 'F')).toBe('1nF');
    });

    it('formats volts', () => {
      expect(formatValue(5, 'V')).toBe('5.00V');
      expect(formatValue(3.3, 'V')).toBe('3.30V');
    });

    it('formats amps with A, mA, and µA', () => {
      expect(formatValue(1.5, 'A')).toBe('1.50A');
      expect(formatValue(0.015, 'A')).toBe('15.0mA');
      expect(formatValue(0.000015, 'A')).toBe('15µA');
    });

    it('formats watts', () => {
      expect(formatValue(2.5, 'W')).toBe('2.50W');
      expect(formatValue(0.05, 'W')).toBe('50.0mW');
    });
  });

  describe('ELECTRICAL_PROPS', () => {
    it('has properties for all LED types', () => {
      const ledTypes = ['LED_RED', 'LED_BLUE', 'LED_GREEN', 'LED_YELLOW', 'LED_ORANGE', 'LED_WHITE'];
      for (const type of ledTypes) {
        expect(ELECTRICAL_PROPS[type]).toBeDefined();
        expect(ELECTRICAL_PROPS[type].forwardVoltage).toBeGreaterThan(0);
      }
    });

    it('has properties for battery types', () => {
      expect(ELECTRICAL_PROPS['BATTERY_9V'].voltage).toBe(9);
      expect(ELECTRICAL_PROPS['BATTERY_AA'].voltage).toBe(1.5);
    });

    it('has properties for sensor types', () => {
      const sensorTypes = ['DHT11', 'ULTRASONIC', 'LIGHT_SENSOR', 'TEMP_SENSOR'];
      for (const type of sensorTypes) {
        expect(ELECTRICAL_PROPS[type]).toBeDefined();
        expect(ELECTRICAL_PROPS[type].resistance).toBeGreaterThan(0);
      }
    });
  });

  describe('component state calculation', () => {
    it('calculates motor speed when active', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const motor: CircuitComponent = { id: 'm1', type: 'MOTOR_DC', x: 100, y: 0, pin: 3 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'm1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, motor], wires, hw);
      const motorState = result.componentStates.get('m1');
      expect(motorState).toBeDefined();
      expect(motorState!.isActive).toBe(true);
      expect(motorState!.speed).toBeDefined();
    });

    it('calculates buzzer state when active', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const buzzer: CircuitComponent = { id: 'bz1', type: 'BUZZER', x: 100, y: 0, pin: 8 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'bz1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, buzzer], wires, hw);
      const buzzerState = result.componentStates.get('bz1');
      expect(buzzerState).toBeDefined();
      expect(buzzerState!.isActive).toBe(true);
    });

    it('calculates bulb brightness', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const bulb: CircuitComponent = { id: 'bl1', type: 'BULB', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [
        { id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'bl1', toPin: 0 },
      ];
      const result = simulateCircuit([battery, bulb], wires, hw);
      const bulbState = result.componentStates.get('bl1');
      expect(bulbState).toBeDefined();
      expect(bulbState!.isActive).toBe(true);
      expect(bulbState!.brightness).toBeDefined();
    });
  });
});
