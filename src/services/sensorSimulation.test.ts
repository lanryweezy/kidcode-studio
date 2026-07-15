import { describe, it, expect } from 'vitest';
import {
  simulateGyro,
  simulateAccelerometer,
  simulateMagnetometer,
  fuseGyroAccelMag,
  createCalibrationProfile,
  applyCalibration,
  calibrateSensor,
  simulateSensor,
  simulateAllSensors,
  DEFAULT_ENVIRONMENT,
  type EnvironmentState,
  type CalibrationProfile,
} from './sensorSimulation';

function makeEnv(overrides: Partial<EnvironmentState> = {}): EnvironmentState {
  return { ...DEFAULT_ENVIRONMENT, ...overrides };
}

describe('Sensor Simulation - Gyroscope', () => {
  it('returns gyro state with correct units', () => {
    const state = simulateGyro(DEFAULT_ENVIRONMENT);
    expect(state.unit).toBe('°/s');
    expect(state.value).toBeDefined();
  });

  it('has correct range', () => {
    const state = simulateGyro(DEFAULT_ENVIRONMENT);
    expect(state.min).toBe(-250);
    expect(state.max).toBe(250);
  });

  it('has fast reading interval', () => {
    const state = simulateGyro(DEFAULT_ENVIRONMENT);
    expect(state.readingInterval).toBe(10);
  });
});

describe('Sensor Simulation - Accelerometer', () => {
  it('returns 3-axis data with magnitude', () => {
    const data = simulateAccelerometer(DEFAULT_ENVIRONMENT);
    expect(data.x).toBeDefined();
    expect(data.y).toBeDefined();
    expect(data.z).toBeDefined();
    expect(data.magnitude).toBeGreaterThan(0);
  });

  it('calculates pitch and roll', () => {
    const data = simulateAccelerometer(DEFAULT_ENVIRONMENT);
    expect(data.pitch).toBeDefined();
    expect(data.roll).toBeDefined();
  });

  it('responds to tilt angle', () => {
    const flat = simulateAccelerometer(makeEnv({ tiltAngle: 0 }));
    const tilted = simulateAccelerometer(makeEnv({ tiltAngle: 45 }));
    expect(Math.abs(tilted.x)).toBeGreaterThan(Math.abs(flat.x));
  });
});

describe('Sensor Simulation - Magnetometer', () => {
  it('returns 3-axis magnetic field data', () => {
    const data = simulateMagnetometer(DEFAULT_ENVIRONMENT);
    expect(data.x).toBeDefined();
    expect(data.y).toBeDefined();
    expect(data.z).toBeDefined();
  });

  it('calculates heading', () => {
    const data = simulateMagnetometer(DEFAULT_ENVIRONMENT);
    expect(data.heading).toBeDefined();
  });

  it('calculates field strength', () => {
    const data = simulateMagnetometer(DEFAULT_ENVIRONMENT);
    expect(data.fieldStrength).toBeGreaterThan(0);
  });
});

describe('Sensor Simulation - Sensor Fusion', () => {
  it('fuses gyro, accel, and mag data', () => {
    const gyro = { x: 0, y: 0, z: 0, pitch: 0, roll: 0 };
    const accel = { x: 0, y: 0, z: 9.81, magnitude: 9.81, pitch: 0, roll: 0 };
    const mag = { x: 0.5, y: 0, z: 0, heading: 0, fieldStrength: 0.5 };

    const fused = fuseGyroAccelMag(gyro, accel, mag);
    expect(fused.orientation).toBeDefined();
    expect(fused.linearAcceleration).toBeDefined();
    expect(fused.gravity).toBeDefined();
    expect(fused.confidence).toBeGreaterThan(0);
  });

  it('calculates gravity vector', () => {
    const gyro = { x: 0, y: 0, z: 0, pitch: 45, roll: 0 };
    const accel = { x: 7, y: 0, z: 7, magnitude: 9.81, pitch: 45, roll: 0 };
    const mag = { x: 0.5, y: 0, z: 0, heading: 0, fieldStrength: 0.5 };

    const fused = fuseGyroAccelMag(gyro, accel, mag);
    expect(fused.gravity.x).toBeDefined();
    expect(fused.gravity.y).toBeDefined();
    expect(fused.gravity.z).toBeDefined();
  });

  it('calculates linear acceleration by removing gravity', () => {
    const gyro = { x: 0, y: 0, z: 0, pitch: 0, roll: 0 };
    const accel = { x: 0, y: 0, z: 9.81, magnitude: 9.81, pitch: 0, roll: 0 };
    const mag = { x: 0.5, y: 0, z: 0, heading: 0, fieldStrength: 0.5 };

    const fused = fuseGyroAccelMag(gyro, accel, mag);
    expect(fused.linearAcceleration.z).toBeCloseTo(0, 0);
  });
});

describe('Sensor Simulation - Calibration Profiles', () => {
  it('creates calibration profile from samples', () => {
    const samples = [
      { x: 1, y: 2, z: 3 },
      { x: 3, y: 4, z: 5 },
      { x: 2, y: 3, z: 4 },
    ];
    const profile = createCalibrationProfile('GYRO', 'Test Cal', samples);
    expect(profile.id).toBeTruthy();
    expect(profile.sensorType).toBe('GYRO');
    expect(profile.name).toBe('Test Cal');
    expect(profile.sampleCount).toBe(3);
  });

  it('applies calibration to raw data', () => {
    const samples = [
      { x: 1, y: 2, z: 3 },
      { x: 3, y: 4, z: 5 },
      { x: 2, y: 3, z: 4 },
    ];
    const profile = createCalibrationProfile('GYRO', 'Test Cal', samples);
    const raw = { x: 2, y: 3, z: 4 };
    const calibrated = applyCalibration(raw, profile);
    expect(calibrated.x).toBeDefined();
    expect(calibrated.y).toBeDefined();
    expect(calibrated.z).toBeDefined();
  });

  it('calibrateSensor maps values correctly', () => {
    const result = calibrateSensor(512, 0, 1023, 0, 100);
    expect(result).toBeCloseTo(50, 0);
  });

  it('calibrateSensor handles edge cases', () => {
    expect(calibrateSensor(0, 0, 1023, 0, 100)).toBe(0);
    expect(calibrateSensor(1023, 0, 1023, 0, 100)).toBe(100);
  });
});

describe('Sensor Simulation - Master Dispatcher', () => {
  it('dispatches LIGHT_SENSOR', () => {
    const state = simulateSensor('LIGHT_SENSOR', DEFAULT_ENVIRONMENT);
    expect(state.unit).toBe('lux');
  });

  it('dispatches TEMP_SENSOR', () => {
    const state = simulateSensor('TEMP_SENSOR', DEFAULT_ENVIRONMENT);
    expect(state.unit).toBe('°C');
  });

  it('dispatches ULTRASONIC', () => {
    const state = simulateSensor('ULTRASONIC', DEFAULT_ENVIRONMENT, { distance: 50 });
    expect(state.unit).toBe('cm');
  });

  it('dispatches GYRO', () => {
    const state = simulateSensor('GYRO', DEFAULT_ENVIRONMENT);
    expect(state.unit).toBe('°/s');
  });

  it('returns default for unknown sensor', () => {
    const state = simulateSensor('UNKNOWN_SENSOR', DEFAULT_ENVIRONMENT);
    expect(state.value).toBe(0);
  });
});

describe('Sensor Simulation - Multi-Sensor', () => {
  it('simulates all requested sensors', () => {
    const sensors = ['LIGHT_SENSOR', 'TEMP_SENSOR', 'GYRO'];
    const results = simulateAllSensors(sensors, DEFAULT_ENVIRONMENT);
    expect(results.size).toBe(3);
    expect(results.has('LIGHT_SENSOR')).toBe(true);
    expect(results.has('TEMP_SENSOR')).toBe(true);
    expect(results.has('GYRO')).toBe(true);
  });
});
