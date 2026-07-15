import { describe, it, expect, beforeEach } from 'vitest';
import { simulateCircuit, SimulationResult } from '../circuitSimulator';
import { validateCircuit } from '../circuitValidator';
import type { CircuitComponent, Wire, HardwareState } from '../../types';

const defaultHardwareState: HardwareState = {
  pins: Array(14).fill(false),
  buzzerActive: false, fanSpeed: 0, temperature: 25, servoAngle: 0,
  lcdLines: ['', '', '', ''], cursorRow: 0, cursorCol: 0,
  potentiometerValue: 512, speakerVolume: 0, rgbColor: '#FF0000',
  sevenSegmentValue: null, distance: 0, motionDetected: false,
  vibrationActive: false, keypadValue: null, joystick: { x: 0, y: 0 },
  pressure: 0, flex: 0, tilt: false, magneticField: 0, detectedColor: '',
  humidity: 0, gasLevel: 0, flameDetected: false, rainLevel: 0,
  soilMoisture: 0, heartbeatRate: 0, compassHeading: 0,
  gyroData: { x: 0, y: 0, z: 0 }, gpsLocation: { lat: 0, lng: 0 },
  fingerprintMatch: false, rfidTag: null, stepperPosition: 0,
  pumpFlowRate: 0, solenoidActive: false, relayState: false,
  laserActive: false, bulbOn: false, continuousServoSpeed: 0,
  rgbLedColor: '#FF0000', rgbStripColors: [], sdCardData: [],
  rtcTime: new Date(), logicGateOutput: false, timerOutput: false,
  wifiConnected: false, bluetoothConnected: false, cpuTemperature: 25,
  freeMemory: 1024, uptime: 0, variables: {}, sensorHistory: [],
};

function makeComp(id: string, type: CircuitComponent['type'], pin: number, x = 0, y = 0): CircuitComponent {
  return { id, type, x, y, pin };
}

function makeWire(id: string, fromId: string, fromPin: number, toId: string, toPin: number): Wire {
  return { id, fromComponentId: fromId, fromPin, toComponentId: toId, toPin };
}

describe('Circuit Integration - Full LED circuit', () => {
  it('battery → resistor → LED: LED is active with brightness > 0', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire1 = makeWire('w1', 'b1', 0, 'r1', 1);
    const wire2 = makeWire('w2', 'r1', 1, 'led1', 2);

    const result = simulateCircuit([battery, resistor, led], [wire1, wire2], { ...defaultHardwareState });

    const ledState = result.componentStates.get('led1');
    expect(ledState).toBeDefined();
    expect(ledState!.isActive).toBe(true);
    expect(ledState!.brightness).toBeGreaterThan(0);
    expect(result.totalVoltage).toBe(9.0);
  });

  it('battery → resistor → LED with validation passes', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire1 = makeWire('w1', 'b1', 0, 'r1', 1);
    const wire2 = makeWire('w2', 'r1', 1, 'led1', 2);

    const validation = validateCircuit([battery, resistor, led], [wire1, wire2]);
    expect(validation.isValid).toBe(true);
  });
});

describe('Circuit Integration - Series circuit', () => {
  it('battery → resistor → LED → resistor → LED: voltage division', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const r1 = makeComp('r1', 'RESISTOR', 1);
    const led1 = makeComp('led1', 'LED_RED', 2);
    const r2 = makeComp('r2', 'RESISTOR', 3);
    const led2 = makeComp('led2', 'LED_RED', 4);

    const wires = [
      makeWire('w1', 'b1', 0, 'r1', 1),
      makeWire('w2', 'r1', 1, 'led1', 2),
      makeWire('w3', 'led1', 2, 'r2', 3),
      makeWire('w4', 'r2', 3, 'led2', 4),
    ];

    const result = simulateCircuit([battery, r1, led1, r2, led2], wires, { ...defaultHardwareState });

    const led1State = result.componentStates.get('led1');
    const led2State = result.componentStates.get('led2');
    expect(led1State).toBeDefined();
    expect(led2State).toBeDefined();
    expect(result.totalResistance).toBeGreaterThan(0);
    expect(result.totalCurrent).toBeGreaterThan(0);
    expect(result.powerDraw).toBeGreaterThan(0);
  });
});

describe('Circuit Integration - Parallel components', () => {
  it('battery connected to two separate LED circuits', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const r1 = makeComp('r1', 'RESISTOR', 1);
    const led1 = makeComp('led1', 'LED_RED', 2);
    const r2 = makeComp('r2', 'RESISTOR', 3);
    const led2 = makeComp('led2', 'LED_GREEN', 4);

    const wires = [
      makeWire('w1', 'b1', 0, 'r1', 1),
      makeWire('w2', 'r1', 1, 'led1', 2),
      makeWire('w3', 'b1', 0, 'r2', 3),
      makeWire('w4', 'r2', 3, 'led2', 4),
    ];

    const result = simulateCircuit([battery, r1, led1, r2, led2], wires, { ...defaultHardwareState });

    expect(result.componentStates.size).toBe(5);
    expect(result.totalCurrent).toBeGreaterThan(0);
  });
});

describe('Circuit Integration - Motor circuit', () => {
  it('battery → motor: motor is active with speed > 0', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const motor = makeComp('m1', 'MOTOR_DC', 1);
    const wire1 = makeWire('w1', 'b1', 0, 'm1', 1);

    const result = simulateCircuit([battery, motor], [wire1], { ...defaultHardwareState });

    const motorState = result.componentStates.get('m1');
    expect(motorState).toBeDefined();
    expect(motorState!.isActive).toBe(true);
    expect(motorState!.speed).toBeGreaterThan(0);
  });
});

describe('Circuit Integration - Complex circuit', () => {
  it('battery → multiple paths with different components', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const r1 = makeComp('r1', 'RESISTOR', 1);
    const led1 = makeComp('led1', 'LED_BLUE', 2);
    const motor = makeComp('m1', 'MOTOR_DC', 3);
    const buzzer = makeComp('bz1', 'BUZZER', 4);

    const wires = [
      makeWire('w1', 'b1', 0, 'r1', 1),
      makeWire('w2', 'r1', 1, 'led1', 2),
      makeWire('w3', 'r1', 1, 'm1', 3),
      makeWire('w4', 'r1', 1, 'bz1', 4),
    ];

    const result = simulateCircuit([battery, r1, led1, motor, buzzer], wires, { ...defaultHardwareState });

    expect(result.componentStates.size).toBe(5);
    expect(result.isShortCircuit).toBe(false);
  });
});

describe('Circuit Integration - Power calculation', () => {
  it('power calculation is correct for battery + LED', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire1 = makeWire('w1', 'b1', 0, 'r1', 1);
    const wire2 = makeWire('w2', 'r1', 1, 'led1', 2);

    const result = simulateCircuit([battery, resistor, led], [wire1, wire2], { ...defaultHardwareState });

    expect(result.powerDraw).toBeGreaterThanOrEqual(0);
    expect(result.totalVoltage).toBeGreaterThan(0);
  });

  it('empty circuit has zero power draw', () => {
    const result = simulateCircuit([], [], { ...defaultHardwareState });
    expect(result.totalCurrent).toBe(0);
    expect(result.totalVoltage).toBe(0);
    expect(result.powerDraw).toBe(0);
  });

  it('circuit without battery generates warning', () => {
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire = makeWire('w1', 'r1', 1, 'led1', 2);

    const result = simulateCircuit([resistor, led], [wire], { ...defaultHardwareState });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.totalCurrent).toBe(0);
  });
});

describe('Circuit Integration - Short circuit detection', () => {
  it('battery alone is detected as short circuit', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const result = simulateCircuit([battery], [], { ...defaultHardwareState });
    expect(result.isShortCircuit).toBe(true);
  });
});
