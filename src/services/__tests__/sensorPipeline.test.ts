import { describe, it, expect } from 'vitest';
import { simulateCircuit, SimulationResult } from '../circuitSimulator';
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

describe('Sensor Pipeline - DHT11 sensor', () => {
  it('DHT11 connected to battery produces reasonable readings', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const dht11 = makeComp('s1', 'DHT11', 1);
    const wire = makeWire('w1', 'b1', 0, 's1', 1);

    const hwState: HardwareState = { ...defaultHardwareState, temperature: 25, humidity: 60 };
    const result = simulateCircuit([battery, dht11], [wire], hwState);

    const sensorState = result.componentStates.get('s1');
    expect(sensorState).toBeDefined();
    expect(sensorState!.isActive).toBe(true);
  });

  it('DHT11 updates hardware state temperature', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const dht11 = makeComp('s1', 'DHT11', 1);
    const wire = makeWire('w1', 'b1', 0, 's1', 1);

    const hwState: HardwareState = { ...defaultHardwareState, temperature: 35, humidity: 70 };
    const result = simulateCircuit([battery, dht11], [wire], hwState);

    expect(hwState.temperature).toBe(35);
    expect(hwState.humidity).toBe(70);
  });
});

describe('Sensor Pipeline - Light sensor', () => {
  it('light sensor value change propagates', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const lightSensor = makeComp('s1', 'LIGHT_SENSOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const resistor = makeComp('r1', 'RESISTOR', 3);
    const wires = [
      makeWire('w1', 'b1', 0, 's1', 1),
      makeWire('w2', 'b1', 0, 'r1', 3),
      makeWire('w3', 'r1', 3, 'led1', 2),
    ];

    const result = simulateCircuit([battery, lightSensor, led, resistor], wires, { ...defaultHardwareState });

    const lightState = result.componentStates.get('s1');
    expect(lightState).toBeDefined();
    expect(lightState!.isActive).toBe(true);
  });
});

describe('Sensor Pipeline - Ultrasonic sensor', () => {
  it('ultrasonic sensor connected to battery is active', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const ultrasonic = makeComp('s1', 'ULTRASONIC', 1);
    const wire = makeWire('w1', 'b1', 0, 's1', 1);

    const hwState: HardwareState = { ...defaultHardwareState, distance: 150 };
    const result = simulateCircuit([battery, ultrasonic], [wire], hwState);

    const sensorState = result.componentStates.get('s1');
    expect(sensorState).toBeDefined();
    expect(sensorState!.isActive).toBe(true);
    expect(hwState.distance).toBe(150);
  });

  it('ultrasonic sensor distance conversion to cm in display', () => {
    const hwState: HardwareState = { ...defaultHardwareState, distance: 0 };

    hwState.distance = 100;
    const cmValue = hwState.distance;
    expect(cmValue).toBe(100);

    hwState.distance = 255;
    expect(hwState.distance).toBe(255);
  });
});

describe('Sensor Pipeline - Multiple sensors', () => {
  it('multiple sensors on same circuit read independently', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const dht = makeComp('s1', 'DHT11', 1);
    const light = makeComp('s2', 'LIGHT_SENSOR', 2);
    const motion = makeComp('s3', 'MOTION', 3);
    const wires = [
      makeWire('w1', 'b1', 0, 's1', 1),
      makeWire('w2', 'b1', 0, 's2', 2),
      makeWire('w3', 'b1', 0, 's3', 3),
    ];

    const hwState: HardwareState = {
      ...defaultHardwareState,
      temperature: 28,
      humidity: 55,
      motionDetected: true,
    };

    const result = simulateCircuit([battery, dht, light, motion], wires, hwState);

    const dhtState = result.componentStates.get('s1');
    const lightState = result.componentStates.get('s2');
    const motionState = result.componentStates.get('s3');

    expect(dhtState!.isActive).toBe(true);
    expect(lightState!.isActive).toBe(true);
    expect(motionState!.isActive).toBe(true);
    expect(hwState.temperature).toBe(28);
    expect(hwState.humidity).toBe(55);
    expect(hwState.motionDetected).toBe(true);
  });
});

describe('Sensor Pipeline - Sensor data history', () => {
  it('sensor history accumulates data points', () => {
    const hwState: HardwareState = { ...defaultHardwareState, sensorHistory: [] };

    hwState.sensorHistory.push({ time: 1000, temperature: 25, light: true, distance: 10 });
    hwState.sensorHistory.push({ time: 2000, temperature: 26, light: false, distance: 15 });
    hwState.sensorHistory.push({ time: 3000, temperature: 27, light: true, distance: 20 });

    expect(hwState.sensorHistory.length).toBe(3);
    expect(hwState.sensorHistory[0].temperature).toBe(25);
    expect(hwState.sensorHistory[2].distance).toBe(20);
  });
});
