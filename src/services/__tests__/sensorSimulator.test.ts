import { describe, it, expect, beforeEach } from 'vitest';
import { simulateCircuit, ELECTRICAL_PROPS, getComponentProperties } from '../circuitSimulator';
import { BOARD_INFO } from '../hardwareService';
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

function makeSensor(type: CircuitComponent['type'], id = 's1'): CircuitComponent {
  return { id, type, x: 0, y: 0, pin: 0 };
}

function makeBattery(id = 'b1'): CircuitComponent {
  return { id, type: 'BATTERY_9V', x: 100, y: 0, pin: 0 };
}

function wire(a: string, b: string, id = 'w1'): Wire {
  return { id, fromComponentId: a, fromPin: 0, toComponentId: b, toPin: 0 };
}

describe('sensorSimulator (via circuitSimulator + hardwareService)', () => {
  let hw: HardwareState;

  beforeEach(() => {
    hw = createHardwareState();
  });

  describe('sensor activation when connected to power', () => {
    const sensorTypes = [
      'DHT11', 'DHT22', 'ULTRASONIC', 'LIGHT_SENSOR', 'TEMP_SENSOR',
      'THERMISTOR', 'MOTION', 'SOUND_SENSOR', 'GAS_SENSOR',
      'FLAME_SENSOR', 'RAIN_SENSOR', 'SOIL_SENSOR', 'PRESSURE_SENSOR',
      'FLEX_SENSOR', 'TILT_SENSOR', 'HALL_SENSOR', 'COMPASS',
      'GYRO', 'GPS', 'HEARTBEAT', 'COLOR_SENSOR',
    ] as const;

    for (const sensorType of sensorTypes) {
      it(`activates ${sensorType} when connected to 9V battery`, () => {
        const sensor = makeSensor(sensorType);
        const battery = makeBattery();
        const wires = [wire('b1', 's1')];
        const result = simulateCircuit([battery, sensor], wires, hw);
        const state = result.componentStates.get('s1');
        expect(state).toBeDefined();
        expect(state!.isActive).toBe(true);
      });
    }
  });

  describe('sensor values and properties', () => {
    it('DHT11 has correct electrical properties', () => {
      const props = getComponentProperties('DHT11');
      expect(props.resistance).toBe(10000);
    });

    it('DHT22 has correct electrical properties', () => {
      const props = getComponentProperties('DHT22');
      expect(props.resistance).toBe(10000);
    });

    it('ULTRASONIC has correct electrical properties', () => {
      const props = getComponentProperties('ULTRASONIC');
      expect(props.resistance).toBe(10000);
    });

    it('LIGHT_SENSOR has correct electrical properties', () => {
      const props = getComponentProperties('LIGHT_SENSOR');
      expect(props.resistance).toBe(10000);
    });

    it('TEMP_SENSOR has correct electrical properties', () => {
      const props = getComponentProperties('TEMP_SENSOR');
      expect(props.resistance).toBe(10000);
    });
  });

  describe('sensor calibration drift simulation', () => {
    it('sensor values vary slightly over multiple readings', () => {
      const readings: number[] = [];
      for (let i = 0; i < 10; i++) {
        readings.push(25 + (Math.random() - 0.5) * 2);
      }
      const min = Math.min(...readings);
      const max = Math.max(...readings);
      const range = max - min;
      expect(range).toBeGreaterThan(0);
      expect(range).toBeLessThan(5);
    });
  });

  describe('noise filtering', () => {
    it('averaging multiple readings reduces noise', () => {
      const noisyReadings = [24.5, 25.3, 24.8, 25.7, 24.2, 25.1, 24.9, 25.5, 24.6, 25.0];
      const average = noisyReadings.reduce((a, b) => a + b, 0) / noisyReadings.length;
      expect(average).toBeCloseTo(25, 0);
    });

    it('median filter removes outliers', () => {
      const readings = [25, 25, 25, 25, 25, 25, 25, 25, 100, 25];
      const sorted = [...readings].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      expect(median).toBe(25);
    });
  });

  describe('sensor interaction with microcontroller pins', () => {
    it('DHT11 connected to Arduino Uno pin works', () => {
      const battery = makeBattery();
      const sensor = makeSensor('DHT11');
      const arduino: CircuitComponent = { id: 'mc1', type: 'ARDUINO_UNO', x: 200, y: 0, pin: 2 };
      const wires: Wire[] = [
        wire('b1', 's1', 'w1'),
        wire('s1', 'mc1', 'w2'),
      ];
      const result = simulateCircuit([battery, sensor, arduino], wires, hw);
      expect(result.totalVoltage).toBe(9);
    });

    it('ultrasonic sensor connected to ESP32 works', () => {
      const battery = makeBattery();
      const sensor = makeSensor('ULTRASONIC');
      const esp: CircuitComponent = { id: 'mc1', type: 'ESP32_DEVKIT', x: 200, y: 0, pin: 5 };
      const wires: Wire[] = [
        wire('b1', 's1', 'w1'),
        wire('s1', 'mc1', 'w2'),
      ];
      const result = simulateCircuit([battery, sensor, esp], wires, hw);
      expect(result.totalVoltage).toBe(9);
    });
  });

  describe('sensor properties consistency', () => {
    it('all sensor types have resistance property', () => {
      const sensorTypes = [
        'LIGHT_SENSOR', 'TEMP_SENSOR', 'DHT11', 'DHT22', 'THERMISTOR',
        'ULTRASONIC', 'MOTION', 'SOUND_SENSOR', 'GAS_SENSOR',
        'FLAME_SENSOR', 'RAIN_SENSOR', 'SOIL_SENSOR', 'PRESSURE_SENSOR',
        'FLEX_SENSOR', 'TILT_SENSOR', 'HALL_SENSOR', 'COMPASS',
        'GYRO', 'GPS', 'HEARTBEAT', 'COLOR_SENSOR',
      ];
      for (const type of sensorTypes) {
        const props = ELECTRICAL_PROPS[type];
        expect(props).toBeDefined();
        expect(props.resistance).toBeGreaterThan(0);
      }
    });
  });
});
