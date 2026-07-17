// ============================================================
// Sensor Simulation Engine v2.0 - All 20+ Sensor Types
// Simulates REAL sensor behavior with physics-based readings,
// noise, calibration, environmental factors, and realistic timing
// ============================================================

// === SENSOR STATE INTERFACES ===

export interface SensorCalibration {
  offset: number;
  scale: number;
  referenceValue: number;
  calibrationDate: number;
  isValid: boolean;
}

export interface SensorResponseModel {
  riseTime: number;      // Time to reach 63% of final value (ms)
  fallTime: number;      // Time to return to 37% of initial value (ms)
  settlingTime: number;  // Time to stabilize (ms)
  lastUpdateTime: number;
  currentValue: number;
  targetValue: number;
}

export interface SensorCrossTalk {
  sourceSensorId: string;
  couplingFactor: number; // 0-1, how much it affects this sensor
  delay: number;         // ms delay in cross-talk effect
}

export interface SensorState {
  value: number;
  rawValue: number;
  unit: string;
  min: number;
  max: number;
  calibrated: boolean;
  lastReading: number;
  readingInterval: number;
  noiseLevel: number;
  drift: number;
  temperature: number;
  humidity: number;
  calibration?: SensorCalibration;
  responseModel?: SensorResponseModel;
  crossTalkSources?: SensorCrossTalk[];
  accumulatedDrift?: number;
  filteredValue?: number;
  noiseFilterEnabled?: boolean;
}

export interface EnvironmentState {
  temperature: number;    // °C (default 25)
  humidity: number;       // % (default 50)
  lightLevel: number;     // 0-1023 (default 512)
  pressure: number;       // hPa (default 1013.25)
  windSpeed: number;      // m/s (default 0)
  altitude: number;       // m (default 0)
  latitude: number;       // GPS (default 0)
  longitude: number;      // GPS (default 0)
  time: number;           // seconds since midnight
  noise: number;          // ambient noise level 0-1023
  soilMoisture: number;   // 0-100%
  isRaining: boolean;
  flameDetected: boolean;
  motionDetected: boolean;
  gasLevel: number;       // 0-1023
  magneticField: number;  // gauss
  heartRate: number;      // BPM
  bendAngle: number;      // degrees
  tiltAngle: number;      // degrees
}

// === DEFAULT ENVIRONMENT ===
export const DEFAULT_ENVIRONMENT: EnvironmentState = {
  temperature: 25,
  humidity: 50,
  lightLevel: 512,
  pressure: 1013.25,
  windSpeed: 0,
  altitude: 0,
  latitude: 37.7749,
  longitude: -122.4194,
  time: 43200,
  noise: 100,
  soilMoisture: 50,
  isRaining: false,
  flameDetected: false,
  motionDetected: false,
  gasLevel: 50,
  magneticField: 0.5,
  heartRate: 72,
  bendAngle: 0,
  tiltAngle: 0,
};

// === NOISE GENERATION ===
function gaussianNoise(mean: number = 0, stddev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// === SENSOR RESPONSE TIME MODELING ===

function createResponseModel(riseTime: number, fallTime: number): SensorResponseModel {
  return {
    riseTime,
    fallTime,
    settlingTime: riseTime * 3,
    lastUpdateTime: Date.now(),
    currentValue: 0,
    targetValue: 0,
  };
}

function updateResponseModel(model: SensorResponseModel, newValue: number): SensorResponseModel {
  const now = Date.now();
  const dt = now - model.lastUpdateTime;
  
  const isRising = newValue > model.currentValue;
  const timeConstant = isRising ? model.riseTime / 1000 : model.fallTime / 1000;
  
  // First-order response: value += (target - current) * (1 - e^(-dt/tau))
  const alpha = 1 - Math.exp(-dt / timeConstant);
  const newCurrentValue = model.currentValue + (newValue - model.currentValue) * alpha;
  
  return {
    ...model,
    currentValue: Math.round(newCurrentValue * 100) / 100,
    targetValue: newValue,
    lastUpdateTime: now,
  };
}

// === DRIFT ACCUMULATION ===

function calculateDrift(driftRate: number, elapsedSeconds: number): number {
  // Random walk drift
  return driftRate * Math.sqrt(elapsedSeconds) * (Math.random() > 0.5 ? 1 : -1);
}

// === ENVIRONMENTAL NOISE FILTERING ===

function applyNoiseFilter(value: number, previousValue: number, alpha: number = 0.3): number {
  // Exponential moving average filter
  return previousValue * (1 - alpha) + value * alpha;
}

// === SENSOR CROSS-TALK ===

function applyCrossTalk(
  baseValue: number,
  crossTalkSources: SensorCrossTalk[],
  otherSensorValues: Map<string, number>
): number {
  let crossTalkEffect = 0;
  
  crossTalkSources.forEach(source => {
    const sourceValue = otherSensorValues.get(source.sourceSensorId) || 0;
    crossTalkEffect += sourceValue * source.couplingFactor;
  });
  
  return baseValue + crossTalkEffect;
}

// === DEFAULT SENSOR STATE FACTORY ===

function createDefaultSensorState(
  value: number,
  rawValue: number,
  unit: string,
  min: number,
  max: number,
  readingInterval: number,
  noiseLevel: number,
  drift: number,
  temperature: number,
  humidity: number,
  riseTime: number = 50,
  fallTime: number = 50,
  crossTalkSources: SensorCrossTalk[] = []
): SensorState {
  return {
    value,
    rawValue,
    unit,
    min,
    max,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval,
    noiseLevel,
    drift,
    temperature,
    humidity,
    calibration: {
      offset: 0,
      scale: 1,
      referenceValue: 0,
      calibrationDate: Date.now(),
      isValid: true,
    },
    responseModel: createResponseModel(riseTime, fallTime),
    crossTalkSources,
    accumulatedDrift: 0,
    filteredValue: value,
    noiseFilterEnabled: true,
  };
}

// === SENSOR SIMULATION FUNCTIONS ===

// --- 1. LIGHT SENSOR (LDR) ---
export function simulateLightSensor(
  env: EnvironmentState,
  otherSensorValues: Map<string, number> = new Map()
): SensorState {
  const baseValue = env.lightLevel;
  const noise = gaussianNoise(0, 5);
  let value = clamp(baseValue + noise, 0, 1023);
  
  // Apply cross-talk from nearby sensors
  value = applyCrossTalk(value, [
    { sourceSensorId: 'TEMP_SENSOR', couplingFactor: 0.02, delay: 10 },
    { sourceSensorId: 'GAS_SENSOR', couplingFactor: 0.01, delay: 5 },
  ], otherSensorValues);
  
  // Apply calibration
  const calibration: SensorCalibration = {
    offset: 0,
    scale: 1,
    referenceValue: 512,
    calibrationDate: Date.now(),
    isValid: true,
  };
  value = (value + calibration.offset) * calibration.scale;
  
  // Apply noise filter
  const filteredValue = applyNoiseFilter(value, 512, 0.3);
  
  const lux = Math.round((filteredValue / 1023) * 10000);
  const state = createDefaultSensorState(
    Math.round(lux), Math.round(filteredValue), 'lux', 0, 1023, 100, 5, 0.1, env.temperature, env.humidity, 20, 30
  );
  
  return {
    ...state,
    calibration,
    filteredValue: Math.round(filteredValue),
    accumulatedDrift: calculateDrift(0.1, 60),
  };
}

export function getLuxFromRaw(raw: number): number {
  return Math.round((raw / 1023) * 10000);
}

export function isDark(raw: number): boolean {
  return raw < 100;
}

export function isBright(raw: number): boolean {
  return raw > 800;
}

// --- 2. TEMPERATURE SENSOR (TMP36/LM35) ---
export function simulateTempSensor(
  env: EnvironmentState,
  otherSensorValues: Map<string, number> = new Map()
): SensorState {
  const baseTemp = env.temperature;
  const noise = gaussianNoise(0, 0.3);
  let tempC = baseTemp + noise;
  
  // Apply cross-talk from heat-generating sensors
  tempC = applyCrossTalk(tempC, [
    { sourceSensorId: 'MOTOR_DC', couplingFactor: 0.5, delay: 100 },
    { sourceSensorId: 'FAN', couplingFactor: -0.2, delay: 200 },
  ], otherSensorValues);
  
  // Apply calibration
  const calibration: SensorCalibration = {
    offset: 0,
    scale: 1,
    referenceValue: 25,
    calibrationDate: Date.now(),
    isValid: true,
  };
  tempC = (tempC + calibration.offset) * calibration.scale;
  
  const rawValue = Math.round((tempC / 50) * 1023);
  const filteredValue = applyNoiseFilter(tempC, 25, 0.2);
  
  const state = createDefaultSensorState(
    Math.round(tempC * 10) / 10,
    clamp(rawValue, 0, 1023),
    '°C', -40, 125, 500, 0.3, 0.01, env.temperature, env.humidity, 100, 200
  );
  
  return {
    ...state,
    calibration,
    filteredValue: Math.round(filteredValue * 10) / 10,
    accumulatedDrift: calculateDrift(0.01, 60),
  };
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

// --- 3. THERMISTOR ---
export function simulateThermistor(env: EnvironmentState, nominalR: number = 10000, beta: number = 3950): SensorState {
  const tempK = env.temperature + 273.15;
  const T0 = 298.15;
  const resistance = nominalR * Math.exp(beta * (1 / tempK - 1 / T0));
  const rawValue = Math.round((resistance / 100000) * 1023);
  return {
    value: Math.round(resistance),
    rawValue: clamp(rawValue, 0, 1023),
    unit: 'Ω',
    min: 100,
    max: 100000,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 500,
    noiseLevel: 10,
    drift: 0.05,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function thermistorToTemp(resistance: number, nominalR: number = 10000, beta: number = 3950): number {
  const T0 = 298.15;
  const tempK = 1 / (1 / T0 + Math.log(resistance / nominalR) / beta);
  return Math.round((tempK - 273.15) * 10) / 10;
}

// --- 4. DHT11 ---
export function simulateDHT11(env: EnvironmentState): SensorState {
  const temp = Math.round(env.temperature);
  const hum = Math.round(env.humidity);
  return {
    value: temp,
    rawValue: temp,
    unit: '°C',
    min: 0,
    max: 50,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 1000,
    noiseLevel: 1,
    drift: 0,
    temperature: temp,
    humidity: hum,
  };
}

export function dht11Readings(env: EnvironmentState): { temperature: number; humidity: number } {
  return {
    temperature: Math.round(env.temperature),
    humidity: clamp(Math.round(env.humidity), 20, 90),
  };
}

// --- 5. DHT22 ---
export function simulateDHT22(env: EnvironmentState): SensorState {
  const noise = gaussianNoise(0, 0.2);
  const temp = Math.round((env.temperature + noise) * 10) / 10;
  const hum = Math.round((env.humidity + gaussianNoise(0, 0.5)) * 10) / 10;
  return {
    value: temp,
    rawValue: Math.round(temp * 10),
    unit: '°C',
    min: -40,
    max: 80,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 2000,
    noiseLevel: 0.2,
    drift: 0.01,
    temperature: temp,
    humidity: clamp(hum, 0, 100),
  };
}

export function dht22Readings(env: EnvironmentState): { temperature: number; humidity: number; heatIndex: number } {
  const temp = Math.round((env.temperature + gaussianNoise(0, 0.2)) * 10) / 10;
  const hum = clamp(Math.round((env.humidity + gaussianNoise(0, 0.5)) * 10) / 10, 0, 100);
  const heatIndex = calculateHeatIndex(temp, hum);
  return { temperature: temp, humidity: hum, heatIndex };
}

function calculateHeatIndex(tempC: number, hum: number): number {
  const T = tempC * 9 / 5 + 32;
  const hi = -42.379 + 2.04901523 * T + 10.14333127 * hum
    - 0.22475541 * T * hum - 0.00683783 * T * T
    - 0.05481717 * hum * hum + 0.00122874 * T * T * hum
    + 0.00085282 * T * hum * hum - 0.00000199 * T * T * hum * hum;
  return Math.round((hi - 32) * 5 / 9 * 10) / 10;
}

// --- 6. ULTRASONIC (HC-SR04) ---
export function simulateUltrasonic(env: EnvironmentState, distance: number = 100): SensorState {
  const noise = gaussianNoise(0, 0.5);
  const dist = clamp(distance + noise, 2, 400);
  const rawValue = Math.round(dist);
  return {
    value: Math.round(dist * 10) / 10,
    rawValue,
    unit: 'cm',
    min: 2,
    max: 400,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 60,
    noiseLevel: 0.5,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function ultrasonicToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

export function ultrasonicToCm(timeUs: number): number {
  return Math.round((timeUs * 0.0343) / 2 * 10) / 10;
}

// --- 7. MOTION PIR ---
export function simulateMotionPIR(env: EnvironmentState): SensorState {
  const detected = env.motionDetected;
  return {
    value: detected ? 1 : 0,
    rawValue: detected ? 1 : 0,
    unit: 'bool',
    min: 0,
    max: 1,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 0,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 8. SOUND SENSOR ---
export function simulateSoundSensor(env: EnvironmentState): SensorState {
  const baseLevel = env.noise;
  const noise = gaussianNoise(0, 10);
  const value = clamp(baseLevel + noise, 0, 1023);
  return {
    value: Math.round(value),
    rawValue: Math.round(value),
    unit: 'level',
    min: 0,
    max: 1023,
    calibrated: false,
    lastReading: Date.now(),
    readingInterval: 50,
    noiseLevel: 10,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function isLoud(raw: number, threshold: number = 500): boolean {
  return raw > threshold;
}

export function soundLevelDB(raw: number): number {
  return Math.round(20 * Math.log10(raw / 10 + 1));
}

// --- 9. GAS SENSOR (MQ-2) ---
export function simulateGasSensor(env: EnvironmentState): SensorState {
  const baseLevel = env.gasLevel;
  const noise = gaussianNoise(0, 5);
  const value = clamp(baseLevel + noise, 0, 1023);
  const ppm = Math.round((value / 1023) * 10000);
  return {
    value: Math.round(value),
    rawValue: Math.round(value),
    unit: 'ppm',
    min: 0,
    max: 1023,
    calibrated: false,
    lastReading: Date.now(),
    readingInterval: 500,
    noiseLevel: 5,
    drift: 0.5,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function isDangerousGas(raw: number): boolean {
  return raw > 700;
}

export function gasLevelPPM(raw: number): number {
  return Math.round((raw / 1023) * 10000);
}

// --- 10. FLAME SENSOR ---
export function simulateFlameSensor(env: EnvironmentState): SensorState {
  return {
    value: env.flameDetected ? 0 : 1,
    rawValue: env.flameDetected ? 0 : 1,
    unit: 'bool',
    min: 0,
    max: 1,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 50,
    noiseLevel: 0,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 11. RAIN SENSOR ---
export function simulateRainSensor(env: EnvironmentState): SensorState {
  const level = env.isRaining ? clamp(800 + gaussianNoise(0, 50), 500, 1023) : clamp(50 + gaussianNoise(0, 10), 0, 200);
  return {
    value: Math.round(level),
    rawValue: Math.round(level),
    unit: 'level',
    min: 0,
    max: 1023,
    calibrated: false,
    lastReading: Date.now(),
    readingInterval: 1000,
    noiseLevel: 10,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 12. SOIL MOISTURE ---
export function simulateSoilSensor(env: EnvironmentState): SensorState {
  const moisture = env.soilMoisture;
  const noise = gaussianNoise(0, 2);
  const raw = clamp(((100 - moisture) / 100) * 1023 + noise, 0, 1023);
  return {
    value: Math.round(moisture),
    rawValue: Math.round(raw),
    unit: '%',
    min: 0,
    max: 100,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 1000,
    noiseLevel: 2,
    drift: 0.1,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 13. PRESSURE SENSOR (BMP280) ---
export function simulatePressureSensor(env: EnvironmentState): SensorState {
  const noise = gaussianNoise(0, 0.1);
  const pressure = env.pressure + noise;
  const altitude = 44330 * (1 - Math.pow(pressure / 1013.25, 1 / 5.255));
  return {
    value: Math.round(pressure * 10) / 10,
    rawValue: Math.round(pressure),
    unit: 'hPa',
    min: 300,
    max: 1100,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 0.1,
    drift: 0.01,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function pressureToAltitude(pressure: number): number {
  return Math.round(44330 * (1 - Math.pow(pressure / 1013.25, 1 / 5.255)));
}

// --- 14. FLEX SENSOR ---
export function simulateFlexSensor(env: EnvironmentState): SensorState {
  const bend = env.bendAngle;
  const noise = gaussianNoise(0, 3);
  const raw = clamp(200 + (bend / 90) * 800 + noise, 200, 1000);
  return {
    value: Math.round(bend),
    rawValue: Math.round(raw),
    unit: '°',
    min: 0,
    max: 90,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 3,
    drift: 0.1,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 15. TILT SENSOR ---
export function simulateTiltSensor(env: EnvironmentState): SensorState {
  const tilted = Math.abs(env.tiltAngle) > 45;
  return {
    value: tilted ? 1 : 0,
    rawValue: tilted ? 1 : 0,
    unit: 'bool',
    min: 0,
    max: 1,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 0,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 16. HALL SENSOR ---
export function simulateHallSensor(env: EnvironmentState): SensorState {
  const field = env.magneticField;
  const noise = gaussianNoise(0, 0.01);
  const value = clamp(field + noise, 0, 5);
  const gauss = Math.round(value * 100);
  return {
    value: Math.round(value * 100) / 100,
    rawValue: gauss,
    unit: 'G',
    min: 0,
    max: 5,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 0.01,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

// --- 17. COMPASS (HMC5883) ---
export function simulateCompass(env: EnvironmentState): SensorState {
  const heading = (env.latitude * 3.7 + env.longitude * 2.1) % 360;
  const noise = gaussianNoise(0, 0.5);
  const value = ((heading + noise) % 360 + 360) % 360;
  return {
    value: Math.round(value * 10) / 10,
    rawValue: Math.round(value),
    unit: '°',
    min: 0,
    max: 360,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 0.5,
    drift: 0.1,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function headingToDirection(heading: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(heading / 45) % 8];
}

// --- 18. GYRO/ACCEL (MPU6050) ---
export function simulateGyro(env: EnvironmentState): SensorState {
  const noise = gaussianNoise(0, 0.5);
  const value = noise;
  return {
    value: Math.round(value * 100) / 100,
    rawValue: Math.round((value + 125) * 100),
    unit: '°/s',
    min: -250,
    max: 250,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 10,
    noiseLevel: 0.5,
    drift: 0.1,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function gyroReadings(env: EnvironmentState): { x: number; y: number; z: number; pitch: number; roll: number } {
  const x = Math.round((gaussianNoise(0, 2)) * 100) / 100;
  const y = Math.round((gaussianNoise(0, 2)) * 100) / 100;
  const z = Math.round((gaussianNoise(0, 2)) * 100) / 100;
  const pitch = Math.round((env.tiltAngle + gaussianNoise(0, 0.5)) * 10) / 10;
  const roll = Math.round((gaussianNoise(0, 0.5)) * 10) / 10;
  return { x, y, z, pitch, roll };
}

// --- 19. GPS (NEO-6M) ---
export function simulateGPS(env: EnvironmentState): SensorState {
  const noise = gaussianNoise(0, 0.0001);
  const lat = env.latitude + noise;
  const lng = env.longitude + gaussianNoise(0, 0.0001);
  return {
    value: Math.round(lat * 10000) / 10000,
    rawValue: Math.round(lat * 10000),
    unit: 'lat',
    min: -90,
    max: 90,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 1000,
    noiseLevel: 0.0001,
    drift: 0.00001,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function gpsReadings(env: EnvironmentState): { lat: number; lng: number; alt: number; speed: number; satellites: number; fix: boolean } {
  return {
    lat: Math.round((env.latitude + gaussianNoise(0, 0.0001)) * 10000) / 10000,
    lng: Math.round((env.longitude + gaussianNoise(0, 0.0001)) * 10000) / 10000,
    alt: Math.round(env.altitude + gaussianNoise(0, 0.5)),
    speed: Math.round(env.windSpeed * 3.6 * 10) / 10,
    satellites: Math.floor(Math.random() * 6) + 6,
    fix: true,
  };
}

// --- 20. HEARTBEAT (Pulse Sensor) ---
export function simulateHeartbeat(env: EnvironmentState): SensorState {
  const bpm = env.heartRate;
  const noise = gaussianNoise(0, 2);
  const value = clamp(bpm + noise, 40, 200);
  const raw = Math.round((value / 200) * 1023);
  return {
    value: Math.round(value),
    rawValue: clamp(raw, 0, 1023),
    unit: 'BPM',
    min: 40,
    max: 200,
    calibrated: true,
    lastReading: Date.now(),
    readingInterval: 100,
    noiseLevel: 2,
    drift: 0,
    temperature: env.temperature,
    humidity: env.humidity,
  };
}

export function isBeating(raw: number): boolean {
  return raw > 500;
}

export function rawToBPM(raw: number): number {
  return Math.round((raw / 1023) * 200);
}

// --- 21. COLOR SENSOR (TCS3200) ---
export function simulateColorSensor(env: EnvironmentState): { r: number; g: number; b: number; hex: string } {
  const r = clamp(Math.round(128 + gaussianNoise(0, 20)), 0, 255);
  const g = clamp(Math.round(128 + gaussianNoise(0, 20)), 0, 255);
  const b = clamp(Math.round(128 + gaussianNoise(0, 20)), 0, 255);
  const hex = `#${  [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  return { r, g, b, hex };
}

export function isColor(target: string, tolerance: number = 30, current: { r: number; g: number; b: number }): boolean {
  const [tr, tg, tb] = hexToRGB(target);
  return Math.abs(current.r - tr) < tolerance &&
         Math.abs(current.g - tg) < tolerance &&
         Math.abs(current.b - tb) < tolerance;
}

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// --- 22. RFID (RC522) ---
export function simulateRFID(): { tagId: string; isReading: boolean } {
  const tags = ['A3 B2 C1 D0', '1B 2C 3D 4E', 'FF 00 AA 55', '12 34 56 78'];
  const isReading = Math.random() > 0.7;
  return {
    tagId: isReading ? tags[Math.floor(Math.random() * tags.length)] : '',
    isReading,
  };
}

// --- 23. FINGERPRINT (R307) ---
export function simulateFingerprint(): { matchId: number; isMatch: boolean } {
  const isMatch = Math.random() > 0.6;
  return {
    matchId: isMatch ? Math.floor(Math.random() * 100) : -1,
    isMatch,
  };
}

// === MASTER SENSOR DISPATCHER ===

export function simulateSensor(
  sensorType: string,
  env: EnvironmentState,
  hardwareState?: Record<string, unknown>,
  otherSensorValues: Map<string, number> = new Map()
): SensorState {
  switch (sensorType) {
    case 'LIGHT_SENSOR': return simulateLightSensor(env, otherSensorValues);
    case 'TEMP_SENSOR': return simulateTempSensor(env, otherSensorValues);
    case 'THERMISTOR': return simulateThermistor(env);
    case 'DHT11': return simulateDHT11(env);
    case 'DHT22': return simulateDHT22(env);
    case 'ULTRASONIC': return simulateUltrasonic(env, (hardwareState?.distance as number) || 100);
    case 'MOTION': return simulateMotionPIR(env);
    case 'SOUND_SENSOR': return simulateSoundSensor(env);
    case 'GAS_SENSOR': return simulateGasSensor(env);
    case 'FLAME_SENSOR': return simulateFlameSensor(env);
    case 'RAIN_SENSOR': return simulateRainSensor(env);
    case 'SOIL_SENSOR': return simulateSoilSensor(env);
    case 'PRESSURE_SENSOR': return simulatePressureSensor(env);
    case 'FLEX_SENSOR': return simulateFlexSensor(env);
    case 'TILT_SENSOR': return simulateTiltSensor(env);
    case 'HALL_SENSOR': return simulateHallSensor(env);
    case 'COMPASS': return simulateCompass(env);
    case 'GYRO': return simulateGyro(env);
    case 'GPS': return simulateGPS(env);
    case 'HEARTBEAT': return simulateHeartbeat(env);
    default: return createDefaultSensorState(0, 0, '', 0, 1023, 1000, 0, 0, 25, 50);
  }
}

// === MULTI-SENSOR SIMULATION WITH CROSS-TALK ===

export function simulateAllSensors(
  sensorTypes: string[],
  env: EnvironmentState,
  hardwareState?: Record<string, unknown>
): Map<string, SensorState> {
  const results = new Map<string, SensorState>();
  const sensorValues = new Map<string, number>();
  
  // First pass - simulate all sensors to get initial values
  sensorTypes.forEach(type => {
    const state = simulateSensor(type, env, hardwareState);
    results.set(type, state);
    sensorValues.set(type, state.value);
  });
  
  // Second pass - apply cross-talk effects
  sensorTypes.forEach(type => {
    const state = results.get(type);
    if (state && state.crossTalkSources && state.crossTalkSources.length > 0) {
      const updatedValue = applyCrossTalk(state.value, state.crossTalkSources, sensorValues);
      results.set(type, {
        ...state,
        value: updatedValue,
        filteredValue: applyNoiseFilter(updatedValue, state.filteredValue || state.value, 0.3),
      });
    }
  });
  
  return results;
}

// === SENSOR CALIBRATION ===

export function calibrateSensor(raw: number, minRaw: number, maxRaw: number, minOut: number, maxOut: number): number {
  return minOut + ((raw - minRaw) / (maxRaw - minRaw)) * (maxOut - minOut);
}

export function calibrateWithOffset(raw: number, offset: number, scale: number): number {
  return (raw + offset) * scale;
}

// === 24. ACCELEROMETER (ADXL345) ---
export function simulateAccelerometer(env: EnvironmentState): { x: number; y: number; z: number; magnitude: number; pitch: number; roll: number } {
  const tiltRad = (env.tiltAngle || 0) * Math.PI / 180;
  const x = Math.round((Math.sin(tiltRad) * 9.81 + gaussianNoise(0, 0.1)) * 100) / 100;
  const y = Math.round((Math.cos(tiltRad) * 9.81 + gaussianNoise(0, 0.1)) * 100) / 100;
  const z = Math.round((gaussianNoise(0, 0.15)) * 100) / 100;
  const magnitude = Math.round(Math.sqrt(x * x + y * y + z * z) * 100) / 100;
  const pitch = Math.round(Math.atan2(x, Math.sqrt(y * y + z * z)) * 180 / Math.PI * 10) / 10;
  const roll = Math.round(Math.atan2(y, Math.sqrt(x * x + z * z)) * 180 / Math.PI * 10) / 10;
  return { x, y, z, magnitude, pitch, roll };
}

// --- 25. MAGNETOMETER (HMC5883L) ---
export function simulateMagnetometer(env: EnvironmentState): { x: number; y: number; z: number; heading: number; fieldStrength: number } {
  const baseField = env.magneticField;
  const x = Math.round((gaussianNoise(baseField * 0.6, 0.02)) * 100) / 100;
  const y = Math.round((gaussianNoise(baseField * 0.3, 0.02)) * 100) / 100;
  const z = Math.round((gaussianNoise(baseField * 0.1, 0.02)) * 100) / 100;
  const heading = Math.round(Math.atan2(y, x) * 180 / Math.PI * 10) / 10;
  const fieldStrength = Math.round(Math.sqrt(x * x + y * y + z * z) * 100) / 100;
  return { x, y, z, heading, fieldStrength };
}

// === SENSOR FUSION ===

export interface FusedSensorData {
  orientation: { roll: number; pitch: number; yaw: number };
  linearAcceleration: { x: number; y: number; z: number };
  gravity: { x: number; y: number; z: number };
  confidence: number;
}

export function fuseGyroAccelMag(
  gyro: { x: number; y: number; z: number; pitch: number; roll: number },
  accel: { x: number; y: number; z: number; magnitude: number; pitch: number; roll: number },
  mag: { x: number; y: number; z: number; heading: number; fieldStrength: number }
): FusedSensorData {
  const alpha = 0.98;
  const roll = Math.round((alpha * gyro.roll + (1 - alpha) * accel.roll) * 10) / 10;
  const pitch = Math.round((alpha * gyro.pitch + (1 - alpha) * accel.pitch) * 10) / 10;
  const yaw = Math.round(mag.heading * 10) / 10;

  const gravityX = Math.round(9.81 * Math.sin(pitch * Math.PI / 180) * 100) / 100;
  const gravityY = Math.round(-9.81 * Math.sin(roll * Math.PI / 180) * Math.cos(pitch * Math.PI / 180) * 100) / 100;
  const gravityZ = Math.round(9.81 * Math.cos(roll * Math.PI / 180) * Math.cos(pitch * Math.PI / 180) * 100) / 100;

  const linearX = Math.round((accel.x - gravityX) * 100) / 100;
  const linearY = Math.round((accel.y - gravityY) * 100) / 100;
  const linearZ = Math.round((accel.z - gravityZ) * 100) / 100;

  const accelNorm = accel.magnitude / 9.81;
  const magNorm = mag.fieldStrength > 0 ? 1 : 0;
  const confidence = Math.round((Math.min(1, accelNorm) * 0.5 + magNorm * 0.3 + (mag.fieldStrength > 0.01 ? 0.2 : 0)) * 100) / 100;

  return {
    orientation: { roll, pitch, yaw },
    linearAcceleration: { x: linearX, y: linearY, z: linearZ },
    gravity: { x: gravityX, y: gravityY, z: gravityZ },
    confidence,
  };
}

// === CALIBRATION PROFILES ===

export interface CalibrationProfile {
  id: string;
  sensorType: string;
  name: string;
  offset: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  bias: number;
  createdAt: number;
  lastUsed: number;
  sampleCount: number;
}

const calibrationStore: Map<string, CalibrationProfile> = new Map();

export function createCalibrationProfile(
  sensorType: string,
  name: string,
  samples: { x: number; y: number; z: number }[]
): CalibrationProfile {
  const avgX = samples.reduce((s, v) => s + v.x, 0) / samples.length;
  const avgY = samples.reduce((s, v) => s + v.y, 0) / samples.length;
  const avgZ = samples.reduce((s, v) => s + v.z, 0) / samples.length;

  const minX = Math.min(...samples.map(v => v.x));
  const maxX = Math.max(...samples.map(v => v.x));
  const minY = Math.min(...samples.map(v => v.y));
  const maxY = Math.max(...samples.map(v => v.y));
  const minZ = Math.min(...samples.map(v => v.z));
  const maxZ = Math.max(...samples.map(v => v.z));

  const profile: CalibrationProfile = {
    id: `cal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sensorType,
    name,
    offset: { x: -avgX, y: -avgY, z: -avgZ },
    scale: {
      x: (maxX - minX) || 1,
      y: (maxY - minY) || 1,
      z: (maxZ - minZ) || 1,
    },
    bias: 0,
    createdAt: Date.now(),
    lastUsed: Date.now(),
    sampleCount: samples.length,
  };

  calibrationStore.set(profile.id, profile);
  return profile;
}

export function applyCalibration(
  raw: { x: number; y: number; z: number },
  profile: CalibrationProfile
): { x: number; y: number; z: number } {
  profile.lastUsed = Date.now();
  return {
    x: (raw.x + profile.offset.x) / profile.scale.x,
    y: (raw.y + profile.offset.y) / profile.scale.y,
    z: (raw.z + profile.offset.z) / profile.scale.z,
  };
}

export function saveCalibrationProfile(profile: CalibrationProfile): void {
  calibrationStore.set(profile.id, profile);
}

export function loadCalibrationProfile(id: string): CalibrationProfile | undefined {
  const profile = calibrationStore.get(id);
  if (profile) profile.lastUsed = Date.now();
  return profile;
}

export function getCalibrationProfiles(sensorType?: string): CalibrationProfile[] {
  const profiles = Array.from(calibrationStore.values());
  return sensorType ? profiles.filter(p => p.sensorType === sensorType) : profiles;
}

export function deleteCalibrationProfile(id: string): boolean {
  return calibrationStore.delete(id);
}

// === SENSOR DATA LOGGING ===

export interface SensorLog {
  timestamp: number;
  sensorType: string;
  value: number;
  unit: string;
}

export function createSensorLog(sensorType: string, value: number, unit: string): SensorLog {
  return { timestamp: Date.now(), sensorType, value, unit };
}

export interface SensorLogger {
  logs: SensorLog[];
  maxEntries: number;
  startTime: number;
  isRecording: boolean;
}

export function createSensorLogger(maxEntries: number = 10000): SensorLogger {
  return { logs: [], maxEntries, startTime: Date.now(), isRecording: false };
}

export function startLogging(logger: SensorLogger): SensorLogger {
  return { ...logger, isRecording: true, startTime: Date.now() };
}

export function stopLogging(logger: SensorLogger): SensorLogger {
  return { ...logger, isRecording: false };
}

export function addLogEntry(logger: SensorLogger, log: SensorLog): SensorLogger {
  if (!logger.isRecording) return logger;
  const logs = [...logger.logs, log];
  if (logs.length > logger.maxEntries) logs.splice(0, logs.length - logger.maxEntries);
  return { ...logger, logs };
}

export function getLogsInRange(
  logger: SensorLogger,
  startTime: number,
  endTime: number,
  sensorType?: string
): SensorLog[] {
  return logger.logs.filter(l =>
    l.timestamp >= startTime && l.timestamp <= endTime &&
    (!sensorType || l.sensorType === sensorType)
  );
}

export function getLogStats(logs: SensorLog[]): { min: number; max: number; avg: number; count: number } {
  if (logs.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
  const values = logs.map(l => l.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return { min, max, avg: Math.round(avg * 100) / 100, count: logs.length };
}

// === ALERT THRESHOLDS ===

export interface SensorAlert {
  id: string;
  sensorType: string;
  condition: 'above' | 'below' | 'equals' | 'between';
  threshold: number;
  thresholdMax?: number;
  action: 'log' | 'sound' | 'notify' | 'stop';
  enabled: boolean;
  lastTriggered: number;
  triggerCount: number;
}

const alertStore: Map<string, SensorAlert> = new Map();

export function createSensorAlert(
  sensorType: string,
  condition: SensorAlert['condition'],
  threshold: number,
  thresholdMax?: number,
  action: SensorAlert['action'] = 'log'
): SensorAlert {
  const alert: SensorAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sensorType,
    condition,
    threshold,
    thresholdMax,
    action,
    enabled: true,
    lastTriggered: 0,
    triggerCount: 0,
  };
  alertStore.set(alert.id, alert);
  return alert;
}

export function checkAlerts(sensorType: string, value: number): SensorAlert[] {
  const triggered: SensorAlert[] = [];
  alertStore.forEach(alert => {
    if (!alert.enabled || alert.sensorType !== sensorType) return;
    let matches = false;
    switch (alert.condition) {
      case 'above': matches = value > alert.threshold; break;
      case 'below': matches = value < alert.threshold; break;
      case 'equals': matches = Math.abs(value - alert.threshold) < 0.01; break;
      case 'between': matches = value >= alert.threshold && value <= (alert.thresholdMax ?? alert.threshold); break;
    }
    if (matches) {
      alert.lastTriggered = Date.now();
      alert.triggerCount++;
      triggered.push(alert);
    }
  });
  return triggered;
}

export function getAlerts(sensorType?: string): SensorAlert[] {
  const alerts = Array.from(alertStore.values());
  return sensorType ? alerts.filter(a => a.sensorType === sensorType) : alerts;
}

export function deleteAlert(id: string): boolean {
  return alertStore.delete(id);
}

export function toggleAlert(id: string, enabled: boolean): boolean {
  const alert = alertStore.get(id);
  if (!alert) return false;
  alert.enabled = enabled;
  return true;
}

// === ENVIRONMENT SIMULATION ===

export function simulateDayNightCycle(timeSeconds: number): { temperature: number; lightLevel: number } {
  const hour = (timeSeconds / 3600) % 24;
  const temp = 20 + 10 * Math.sin((hour - 6) * Math.PI / 12);
  const light = hour >= 6 && hour <= 18 ? Math.sin((hour - 6) * Math.PI / 12) * 1023 : 0;
  return { temperature: Math.round(temp * 10) / 10, lightLevel: Math.round(light) };
}

export function simulateWeather(env: EnvironmentState): EnvironmentState {
  const hour = (env.time / 3600) % 24;
  return {
    ...env,
    temperature: 20 + 10 * Math.sin((hour - 6) * Math.PI / 12) + gaussianNoise(0, 0.5),
    lightLevel: hour >= 6 && hour <= 18 ? Math.sin((hour - 6) * Math.PI / 12) * 1023 : 0,
    humidity: 40 + 20 * Math.sin((hour - 14) * Math.PI / 12) + gaussianNoise(0, 2),
    pressure: 1013.25 + gaussianNoise(0, 0.5),
  };
}
