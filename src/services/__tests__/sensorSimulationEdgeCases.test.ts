import { describe, it, expect } from 'vitest';
import {
  simulateSensor,
  simulateAllSensors,
  simulateLightSensor,
  simulateTempSensor,
  simulateDHT11,
  simulateDHT22,
  simulateUltrasonic,
  simulateMotionPIR,
  simulateSoundSensor,
  simulateGasSensor,
  simulateFlameSensor,
  simulateRainSensor,
  simulateSoilSensor,
  simulatePressureSensor,
  simulateFlexSensor,
  simulateTiltSensor,
  simulateHallSensor,
  simulateCompass,
  simulateGyro,
  simulateGPS,
  simulateHeartbeat,
  simulateColorSensor,
  simulateRFID,
  simulateFingerprint,
  simulateThermistor,
  getLuxFromRaw,
  isDark,
  isBright,
  celsiusToFahrenheit,
  thermistorToTemp,
  ultrasonicToInches,
  ultrasonicToCm,
  isLoud,
  soundLevelDB,
  isDangerousGas,
  gasLevelPPM,
  headingToDirection,
  gyroReadings,
  gpsReadings,
  isBeating,
  rawToBPM,
  isColor,
  calibrateSensor,
  calibrateWithOffset,
  createSensorLog,
  simulateDayNightCycle,
  simulateWeather,
  DEFAULT_ENVIRONMENT,
  EnvironmentState,
  SensorState,
} from '../sensorSimulation';

function env(overrides: Partial<EnvironmentState> = {}): EnvironmentState {
  return { ...DEFAULT_ENVIRONMENT, ...overrides };
}

describe('sensor simulation edge cases', () => {
  describe('extreme environment values', () => {
    it('handles extreme high temperature', () => {
      const hotEnv = env({ temperature: 150 });
      const state = simulateTempSensor(hotEnv);
      expect(state.value).toBeGreaterThanOrEqual(100);
    });

    it('handles extreme low temperature', () => {
      const coldEnv = env({ temperature: -40 });
      const state = simulateTempSensor(coldEnv);
      expect(state.value).toBeLessThanOrEqual(-30);
    });

    it('handles zero humidity', () => {
      const dryEnv = env({ humidity: 0 });
      const state = simulateDHT11(dryEnv);
      expect(state.humidity).toBe(0);
    });

    it('handles 100% humidity', () => {
      const wetEnv = env({ humidity: 100 });
      const state = simulateDHT22(wetEnv);
      expect(state.humidity).toBeGreaterThanOrEqual(90);
    });

    it('handles zero light level', () => {
      const darkEnv = env({ lightLevel: 0 });
      const state = simulateLightSensor(darkEnv);
      expect(state.value).toBeGreaterThanOrEqual(0);
      expect(state.unit).toBe('lux');
    });

    it('handles maximum light level', () => {
      const brightEnv = env({ lightLevel: 1023 });
      const state = simulateLightSensor(brightEnv);
      expect(state.value).toBeGreaterThan(0);
      expect(state.unit).toBe('lux');
    });

    it('handles zero pressure', () => {
      const lowPressureEnv = env({ pressure: 0 });
      const state = simulatePressureSensor(lowPressureEnv);
      expect(state.value).toBeCloseTo(0, 0);
    });

    it('handles very high pressure', () => {
      const highPressureEnv = env({ pressure: 1100 });
      const state = simulatePressureSensor(highPressureEnv);
      expect(state.value).toBeGreaterThan(1000);
    });

    it('handles maximum gas level', () => {
      const toxicEnv = env({ gasLevel: 1023 });
      const state = simulateGasSensor(toxicEnv);
      expect(state.value).toBeGreaterThan(1000);
    });

    it('handles zero gas level', () => {
      const cleanEnv = env({ gasLevel: 0 });
      const state = simulateGasSensor(cleanEnv);
      expect(state.value).toBeLessThanOrEqual(20);
    });

    it('handles extreme magnetic field', () => {
      const strongEnv = env({ magneticField: 5 });
      const state = simulateHallSensor(strongEnv);
      expect(state.value).toBeGreaterThanOrEqual(4);
    });

    it('handles zero magnetic field', () => {
      const noFieldEnv = env({ magneticField: 0 });
      const state = simulateHallSensor(noFieldEnv);
      expect(state.value).toBeLessThanOrEqual(0.1);
    });

    it('handles extreme heart rate', () => {
      const highHR = env({ heartRate: 200 });
      const state = simulateHeartbeat(highHR);
      expect(state.value).toBeGreaterThanOrEqual(180);
    });

    it('handles minimum heart rate', () => {
      const lowHR = env({ heartRate: 40 });
      const state = simulateHeartbeat(lowHR);
      expect(state.value).toBeGreaterThanOrEqual(35);
    });

    it('handles maximum tilt angle', () => {
      const tiltedEnv = env({ tiltAngle: 90 });
      const state = simulateTiltSensor(tiltedEnv);
      expect(state.value).toBe(1);
    });

    it('handles zero tilt angle', () => {
      const flatEnv = env({ tiltAngle: 0 });
      const state = simulateTiltSensor(flatEnv);
      expect(state.value).toBe(0);
    });

    it('handles maximum bend angle for flex sensor', () => {
      const bentEnv = env({ bendAngle: 90 });
      const state = simulateFlexSensor(bentEnv);
      expect(state.value).toBe(90);
    });

    it('handles zero bend angle for flex sensor', () => {
      const straightEnv = env({ bendAngle: 0 });
      const state = simulateFlexSensor(straightEnv);
      expect(state.value).toBe(0);
    });
  });

  describe('calibration edge cases', () => {
    it('calibrateSensor handles zero range', () => {
      const result = calibrateSensor(500, 500, 500, 0, 100);
      expect(result).toBeNaN();
    });

    it('calibrateSensor with normal range', () => {
      const result = calibrateSensor(512, 0, 1023, 0, 100);
      expect(result).toBeCloseTo(50, 0);
    });

    it('calibrateWithOffset with zero offset', () => {
      const result = calibrateWithOffset(100, 0, 1);
      expect(result).toBe(100);
    });

    it('calibrateWithOffset with negative offset', () => {
      const result = calibrateWithOffset(100, -50, 2);
      expect(result).toBe(100);
    });

    it('calibrateWithOffset with zero scale', () => {
      const result = calibrateWithOffset(100, 0, 0);
      expect(result).toBe(0);
    });

    it('sensor calibration data is present in light sensor', () => {
      const state = simulateLightSensor(env());
      expect(state.calibration).toBeDefined();
      expect(state.calibration?.isValid).toBe(true);
    });

    it('sensor calibration data is present in temp sensor', () => {
      const state = simulateTempSensor(env());
      expect(state.calibration).toBeDefined();
      expect(state.calibration?.isValid).toBe(true);
    });
  });

  describe('sensor helper functions at boundary values', () => {
    it('getLuxFromRaw at zero', () => expect(getLuxFromRaw(0)).toBe(0));
    it('getLuxFromRaw at max', () => expect(getLuxFromRaw(1023)).toBe(10000));
    it('isDark at zero', () => expect(isDark(0)).toBe(true));
    it('isDark at 99', () => expect(isDark(99)).toBe(true));
    it('isDark at 100', () => expect(isDark(100)).toBe(false));
    it('isBright at 801', () => expect(isBright(801)).toBe(true));
    it('isBright at 800', () => expect(isBright(800)).toBe(false));

    it('celsiusToFahrenheit at 0°C', () => expect(celsiusToFahrenheit(0)).toBe(32));
    it('celsiusToFahrenheit at 100°C', () => expect(celsiusToFahrenheit(100)).toBe(212));
    it('celsiusToFahrenheit at -40°C', () => expect(celsiusToFahrenheit(-40)).toBe(-40));

    it('thermistorToTemp at nominal resistance', () => {
      const temp = thermistorToTemp(10000);
      expect(temp).toBeCloseTo(25, 0);
    });

    it('ultrasonicToInches converts correctly', () => {
      expect(ultrasonicToInches(2.54)).toBe(1);
    });

    it('ultrasonicToCm converts correctly', () => {
      const cm = ultrasonicToCm(5800);
      expect(cm).toBeCloseTo(99.5, 0);
    });

    it('isLoud at boundary', () => {
      expect(isLoud(500)).toBe(false);
      expect(isLoud(501)).toBe(true);
    });

    it('soundLevelDB at zero', () => {
      expect(soundLevelDB(0)).toBe(0);
    });

    it('isDangerousGas at threshold', () => {
      expect(isDangerousGas(700)).toBe(false);
      expect(isDangerousGas(701)).toBe(true);
    });

    it('gasLevelPPM at max', () => {
      expect(gasLevelPPM(1023)).toBe(10000);
    });

    it('headingToDirection at cardinal points', () => {
      expect(headingToDirection(0)).toBe('N');
      expect(headingToDirection(90)).toBe('E');
      expect(headingToDirection(180)).toBe('S');
      expect(headingToDirection(270)).toBe('W');
    });

    it('isBeating at threshold', () => {
      expect(isBeating(500)).toBe(false);
      expect(isBeating(501)).toBe(true);
    });

    it('rawToBPM at max', () => {
      expect(rawToBPM(1023)).toBe(200);
    });

    it('rawToBPM at zero', () => {
      expect(rawToBPM(0)).toBe(0);
    });

    it('isColor matches exact color', () => {
      expect(isColor('#808080', 1, { r: 128, g: 128, b: 128 })).toBe(true);
    });

    it('isColor rejects distant color', () => {
      expect(isColor('#000000', 10, { r: 255, g: 255, b: 255 })).toBe(false);
    });
  });

  describe('multi-sensor simulation', () => {
    it('simulates multiple sensors at once', () => {
      const types = ['LIGHT_SENSOR', 'TEMP_SENSOR', 'ULTRASONIC', 'MOTION'];
      const results = simulateAllSensors(types, env());
      expect(results.size).toBe(4);
      expect(results.has('LIGHT_SENSOR')).toBe(true);
      expect(results.has('TEMP_SENSOR')).toBe(true);
    });

    it('handles empty sensor list', () => {
      const results = simulateAllSensors([], env());
      expect(results.size).toBe(0);
    });

    it('simulateSensor handles unknown type', () => {
      const state = simulateSensor('UNKNOWN_SENSOR', env());
      expect(state.value).toBe(0);
    });

    it('ultrasonic with hardware state distance', () => {
      const state = simulateSensor('ULTRASONIC', env(), { distance: 50 });
      expect(state.value).toBeGreaterThan(45);
      expect(state.value).toBeLessThan(55);
    });
  });

  describe('environment simulation', () => {
    it('day/night cycle at noon', () => {
      const result = simulateDayNightCycle(12 * 3600);
      expect(result.lightLevel).toBeGreaterThan(0);
      expect(result.temperature).toBeGreaterThan(20);
    });

    it('day/night cycle at midnight', () => {
      const result = simulateDayNightCycle(0);
      expect(result.lightLevel).toBe(0);
    });

    it('simulateWeather returns valid state', () => {
      const result = simulateWeather(env());
      expect(result.temperature).toBeDefined();
      expect(result.lightLevel).toBeDefined();
      expect(result.humidity).toBeDefined();
      expect(result.pressure).toBeDefined();
    });
  });

  describe('sensor logging', () => {
    it('creates a sensor log entry', () => {
      const log = createSensorLog('TEMP_SENSOR', 25.5, '°C');
      expect(log.sensorType).toBe('TEMP_SENSOR');
      expect(log.value).toBe(25.5);
      expect(log.unit).toBe('°C');
      expect(log.timestamp).toBeGreaterThan(0);
    });
  });

  describe('sensor response model', () => {
    it('light sensor has response model', () => {
      const state = simulateLightSensor(env());
      expect(state.responseModel).toBeDefined();
      expect(state.responseModel?.riseTime).toBeGreaterThan(0);
    });

    it('temp sensor has response model', () => {
      const state = simulateTempSensor(env());
      expect(state.responseModel).toBeDefined();
      expect(state.responseModel?.fallTime).toBeGreaterThan(0);
    });
  });

  describe('GPS extreme values', () => {
    it('handles equator and prime meridian', () => {
      const gpsEnv = env({ latitude: 0, longitude: 0 });
      const readings = gpsReadings(gpsEnv);
      expect(readings.lat).toBeCloseTo(0, 0);
      expect(readings.lng).toBeCloseTo(0, 0);
    });

    it('handles extreme coordinates', () => {
      const gpsEnv = env({ latitude: 89.9999, longitude: 179.9999 });
      const state = simulateGPS(gpsEnv);
      expect(state.value).toBeGreaterThan(89);
    });
  });

  describe('gyro readings', () => {
    it('returns 6-axis data', () => {
      const readings = gyroReadings(env());
      expect(readings).toHaveProperty('x');
      expect(readings).toHaveProperty('y');
      expect(readings).toHaveProperty('z');
      expect(readings).toHaveProperty('pitch');
      expect(readings).toHaveProperty('roll');
    });
  });

  describe('RFID and fingerprint', () => {
    it('RFID returns tag data', () => {
      const rfid = simulateRFID();
      expect(rfid).toHaveProperty('tagId');
      expect(rfid).toHaveProperty('isReading');
    });

    it('fingerprint returns match data', () => {
      const fp = simulateFingerprint();
      expect(fp).toHaveProperty('matchId');
      expect(fp).toHaveProperty('isMatch');
    });
  });

  describe('color sensor', () => {
    it('returns RGB values in range', () => {
      const color = simulateColorSensor(env());
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('DHT22 heat index', () => {
    it('calculates heat index for hot humid environment', () => {
      const hotEnv = env({ temperature: 40, humidity: 80 });
      const readings = simulateDHT22(hotEnv);
      expect(readings.value).toBeGreaterThanOrEqual(35);
    });
  });
});
