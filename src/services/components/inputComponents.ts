import { ComponentSchemaMap } from './types';

export const INPUT_COMPONENTS: ComponentSchemaMap = {
  // === INPUTS ===
  BUTTON: {
    properties: [
      { name: 'isPressed', type: 'boolean', default: false, description: 'Whether button is pressed' },
      { name: 'pullup', type: 'boolean', default: false, description: 'Use internal pull-up resistor' },
    ],
    methods: [
      { name: 'isDown', description: 'Check if button is pressed', params: [] },
      { name: 'wasPressed', description: 'Check if button was just pressed (edge)', params: [] },
      { name: 'wasReleased', description: 'Check if button was just released', params: [] },
      { name: 'waitPress', description: 'Wait until button is pressed', params: [] },
    ],
    events: ['press', 'release'],
  },

  BUTTON_TACTILE: {
    properties: [{ name: 'isPressed', type: 'boolean', default: false }],
    methods: [{ name: 'isDown', description: 'Check if pressed', params: [] }, { name: 'wasPressed', description: 'Edge detect', params: [] }, { name: 'waitPress', description: 'Wait for press', params: [] }],
    events: ['press', 'release'],
  },

  SWITCH_TOGGLE: {
    properties: [{ name: 'isOn', type: 'boolean', default: false }],
    methods: [{ name: 'isOn', description: 'Check state', params: [] }, { name: 'toggle', description: 'Toggle switch', params: [] }],
    events: ['toggle'],
  },

  SWITCH_SLIDE: {
    properties: [{ name: 'isOn', type: 'boolean', default: false }],
    methods: [{ name: 'isOn', description: 'Check state', params: [] }],
    events: ['toggle'],
  },

  POTENTIOMETER: {
    properties: [
      { name: 'value', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog value (0-1023)' },
      { name: 'percent', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Percentage value' },
      { name: 'voltage', type: 'number', default: 0, min: 0, max: 5, unit: 'V', description: 'Voltage output' },
    ],
    methods: [
      { name: 'read', description: 'Read raw value', params: [] },
      { name: 'readPercent', description: 'Read as percentage', params: [] },
      { name: 'readVoltage', description: 'Read as voltage', params: [] },
      { name: 'map', description: 'Map to custom range', params: [{ name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
    ],
    events: ['valueChange'],
  },

  SLIDE_POT: {
    properties: [{ name: 'value', type: 'number', default: 0, min: 0, max: 1023 }, { name: 'percent', type: 'number', default: 0, min: 0, max: 100, unit: '%' }],
    methods: [{ name: 'read', description: 'Read raw', params: [] }, { name: 'readPercent', description: 'Read %', params: [] }],
    events: ['valueChange'],
  },

  JOYSTICK: {
    properties: [
      { name: 'x', type: 'number', default: 0, min: -100, max: 100, description: 'X axis (-100 to 100)' },
      { name: 'y', type: 'number', default: 0, min: -100, max: 100, description: 'Y axis (-100 to 100)' },
      { name: 'button', type: 'boolean', default: false, description: 'Joystick button pressed' },
    ],
    methods: [{ name: 'getX', description: 'Get X axis', params: [] }, { name: 'getY', description: 'Get Y axis', params: [] }, { name: 'isPressed', description: 'Button pressed?', params: [] }],
    events: ['move', 'press', 'release'],
  },

  ENCODER: {
    properties: [{ name: 'position', type: 'number', default: 0, description: 'Current position' }, { name: 'direction', type: 'number', default: 0, description: 'Last rotation direction (-1/0/1)' }],
    methods: [{ name: 'getPosition', description: 'Get position', params: [] }, { name: 'getDirection', description: 'Get direction', params: [] }, { name: 'reset', description: 'Reset to zero', params: [] }],
    events: ['rotate'],
  },

  KEYPAD: {
    properties: [{ name: 'lastKey', type: 'string', default: '', description: 'Last key pressed' }, { name: 'keyPressed', type: 'boolean', default: false }],
    methods: [{ name: 'getKey', description: 'Read key press', params: [] }, { name: 'waitKey', description: 'Wait for any key', params: [] }],
    events: ['keypress'],
  },

  // === SENSORS ===
  LIGHT_SENSOR: {
    properties: [
      { name: 'value', type: 'number', default: 512, min: 0, max: 1023, description: 'Light level (0=dark, 1023=bright)' },
      { name: 'lux', type: 'number', default: 0, min: 0, max: 10000, unit: 'lux', description: 'Estimated lux value' },
      { name: 'isDark', type: 'boolean', default: false, description: 'Below dark threshold' },
      { name: 'isBright', type: 'boolean', default: false, description: 'Above bright threshold' },
    ],
    methods: [
      { name: 'read', description: 'Read raw light level (0-1023)', params: [] },
      { name: 'readLux', description: 'Read light in lux (0-10000)', params: [] },
      { name: 'isDark', description: 'Is it dark? (raw < 100)', params: [] },
      { name: 'isBright', description: 'Is it bright? (raw > 800)', params: [] },
      { name: 'isDim', description: 'Is it dim? (raw 100-400)', params: [] },
      { name: 'map', description: 'Map to custom range', params: [{ name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
      { name: 'average', description: 'Average last N readings', params: [{ name: 'count', type: 'number' }] },
      { name: 'calibrate', description: 'Calibrate with known lux', params: [{ name: 'knownLux', type: 'number' }, { name: 'rawReading', type: 'number' }] },
    ],
    events: ['valueChange', 'dark', 'bright'],
  },

  TEMP_SENSOR: {
    properties: [
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Temperature in Celsius' },
      { name: 'fahrenheit', type: 'number', default: 77, unit: '°F', description: 'Temperature in Fahrenheit' },
      { name: 'raw', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
    ],
    methods: [
      { name: 'read', description: 'Read temperature in °C', params: [] },
      { name: 'readFahrenheit', description: 'Read temperature in °F', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'isHot', description: 'Above threshold? (°C)', params: [{ name: 'threshold', type: 'number' }] },
      { name: 'isCold', description: 'Below threshold? (°C)', params: [{ name: 'threshold', type: 'number' }] },
      { name: 'inRange', description: 'Between min and max?', params: [{ name: 'min', type: 'number' }, { name: 'max', type: 'number' }] },
      { name: 'map', description: 'Map raw to custom range', params: [{ name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
      { name: 'average', description: 'Average last N readings', params: [{ name: 'count', type: 'number' }] },
    ],
    events: ['valueChange', 'hot', 'cold'],
  },

  THERMISTOR: {
    properties: [
      { name: 'resistance', type: 'number', default: 10000, unit: 'Ω', description: 'Resistance in ohms' },
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Calculated temperature' },
      { name: 'raw', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
    ],
    methods: [
      { name: 'read', description: 'Read temperature from resistance', params: [] },
      { name: 'readResistance', description: 'Read resistance in ohms', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'setNominal', description: 'Set nominal resistance', params: [{ name: 'ohms', type: 'number' }] },
      { name: 'setBeta', description: 'Set beta coefficient', params: [{ name: 'beta', type: 'number' }] },
      { name: 'resistanceToTemp', description: 'Convert resistance to °C', params: [{ name: 'ohms', type: 'number' }] },
      { name: 'tempToResistance', description: 'Convert °C to resistance', params: [{ name: 'celsius', type: 'number' }] },
    ],
    events: ['valueChange'],
  },

  DHT11: {
    properties: [
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Temperature (±2°C)' },
      { name: 'humidity', type: 'number', default: 50, unit: '%', description: 'Humidity (±5%)' },
      { name: 'heatIndex', type: 'number', default: 25, unit: '°C', description: 'Feels-like temperature' },
    ],
    methods: [
      { name: 'readTemperature', description: 'Read temperature in °C', params: [] },
      { name: 'readHumidity', description: 'Read humidity in %', params: [] },
      { name: 'readHeatIndex', description: 'Calculate heat index', params: [] },
      { name: 'readFahrenheit', description: 'Read temp in °F', params: [] },
      { name: 'isComfortable', description: 'Is it comfortable? (20-26°C, 30-60%)', params: [] },
      { name: 'computeDewPoint', description: 'Calculate dew point °C', params: [] },
      { name: 'computeAbsoluteHumidity', description: 'Absolute humidity g/m³', params: [] },
    ],
    events: ['valueChange', 'comfortable'],
  },

  DHT22: {
    properties: [
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Temperature (±0.5°C)' },
      { name: 'humidity', type: 'number', default: 50, unit: '%', description: 'Humidity (±2%)' },
      { name: 'heatIndex', type: 'number', default: 25, unit: '°C', description: 'Feels-like temperature' },
      { name: 'dewPoint', type: 'number', default: 0, unit: '°C', description: 'Dew point temperature' },
    ],
    methods: [
      { name: 'readTemperature', description: 'Read temperature in °C', params: [] },
      { name: 'readHumidity', description: 'Read humidity in %', params: [] },
      { name: 'readHeatIndex', description: 'Calculate heat index', params: [] },
      { name: 'readDewPoint', description: 'Calculate dew point', params: [] },
      { name: 'readFahrenheit', description: 'Read temp in °F', params: [] },
      { name: 'isComfortable', description: 'Is it comfortable?', params: [] },
      { name: 'computeAbsoluteHumidity', description: 'Absolute humidity g/m³', params: [] },
      { name: 'computeWetBulb', description: 'Wet bulb temperature', params: [] },
      { name: 'computeVaporPressure', description: 'Vapor pressure kPa', params: [] },
      { name: 'computeRelativeHumidity', description: 'From temp and dew point', params: [{ name: 'temp', type: 'number' }, { name: 'dewPoint', type: 'number' }] },
    ],
    events: ['valueChange', 'comfortable', 'warning'],
  },

  ULTRASONIC: {
    properties: [
      { name: 'distance', type: 'number', default: 100, unit: 'cm', description: 'Distance in centimeters' },
      { name: 'inches', type: 'number', default: 39.4, unit: 'in', description: 'Distance in inches' },
      { name: 'raw', type: 'number', default: 0, unit: 'µs', description: 'Raw echo time in microseconds' },
    ],
    methods: [
      { name: 'readDistance', description: 'Read distance in cm', params: [] },
      { name: 'readInches', description: 'Read distance in inches', params: [] },
      { name: 'readRaw', description: 'Read raw echo time (µs)', params: [] },
      { name: 'isCloserThan', description: 'Object closer than threshold?', params: [{ name: 'cm', type: 'number' }] },
      { name: 'isFartherThan', description: 'Object farther than threshold?', params: [{ name: 'cm', type: 'number' }] },
      { name: 'isInRange', description: 'Object between min and max?', params: [{ name: 'minCm', type: 'number' }, { name: 'maxCm', type: 'number' }] },
      { name: 'measureWidth', description: 'Measure width between two sensors', params: [] },
      { name: 'map', description: 'Map distance to custom range', params: [{ name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
    ],
    events: ['valueChange', 'proximity'],
  },

  MOTION: {
    properties: [
      { name: 'detected', type: 'boolean', default: false, description: 'Motion detected' },
      { name: 'value', type: 'number', default: 0, min: 0, max: 1, description: 'Raw digital value' },
      { name: 'holdTime', type: 'number', default: 5, unit: 's', description: 'Detection hold time' },
    ],
    methods: [
      { name: 'isDetected', description: 'Is motion detected?', params: [] },
      { name: 'wasDetected', description: 'Was motion just detected? (edge)', params: [] },
      { name: 'waitMotion', description: 'Wait for motion event', params: [] },
      { name: 'calibrate', description: 'Calibrate sensor', params: [{ name: 'seconds', type: 'number' }] },
      { name: 'setHoldTime', description: 'Set detection hold time', params: [{ name: 'seconds', type: 'number' }] },
      { name: 'getZoneCount', description: 'Number of detection zones', params: [] },
    ],
    events: ['motion', 'noMotion'],
  },

  GAS_SENSOR: {
    properties: [
      { name: 'level', type: 'number', default: 50, min: 0, max: 1023, description: 'Gas level raw reading' },
      { name: 'ppm', type: 'number', default: 0, min: 0, max: 10000, unit: 'ppm', description: 'Estimated PPM' },
      { name: 'isDangerous', type: 'boolean', default: false, description: 'Above dangerous threshold' },
    ],
    methods: [
      { name: 'read', description: 'Read gas level (0-1023)', params: [] },
      { name: 'readPPM', description: 'Read estimated PPM', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'isDangerous', description: 'Above safe threshold?', params: [] },
      { name: 'isWarning', description: 'Above warning level?', params: [] },
      { name: 'calibrate', description: 'Calibrate with known PPM', params: [{ name: 'knownPPM', type: 'number' }, { name: 'rawReading', type: 'number' }] },
      { name: 'warmUp', description: 'Warm up sensor (takes 2-5 min)', params: [{ name: 'minutes', type: 'number' }] },
      { name: 'getAirQuality', description: 'Get air quality index (0-500)', params: [] },
    ],
    events: ['valueChange', 'danger', 'warning'],
  },

  FLAME_SENSOR: {
    properties: [
      { name: 'detected', type: 'boolean', default: false, description: 'Flame detected' },
      { name: 'value', type: 'number', default: 1, min: 0, max: 1, description: 'Digital output (1=no flame, 0=flame)' },
      { name: 'analogValue', type: 'number', default: 0, min: 0, max: 1023, description: 'Analog flame intensity' },
    ],
    methods: [
      { name: 'isDetected', description: 'Is flame detected?', params: [] },
      { name: 'readDigital', description: 'Read digital output', params: [] },
      { name: 'readAnalog', description: 'Read flame intensity', params: [] },
      { name: 'setSensitivity', description: 'Set detection sensitivity', params: [{ name: 'level', type: 'number' }] },
      { name: 'getDirection', description: 'Get flame direction (1-5)', params: [] },
    ],
    events: ['flame', 'noFlame'],
  },

  RAIN_SENSOR: {
    properties: [
      { name: 'isRaining', type: 'boolean', default: false, description: 'Rain detected' },
      { name: 'level', type: 'number', default: 0, min: 0, max: 1023, description: 'Rain intensity level' },
      { name: 'dryLevel', type: 'number', default: 0, min: 0, max: 1023, description: 'Reading when dry' },
      { name: 'wetLevel', type: 'number', default: 1023, min: 0, max: 1023, description: 'Reading when fully wet' },
    ],
    methods: [
      { name: 'isWet', description: 'Is it raining?', params: [] },
      { name: 'read', description: 'Read rain level (0-1023)', params: [] },
      { name: 'readDry', description: 'Read dry calibration value', params: [] },
      { name: 'readWet', description: 'Read wet calibration value', params: [] },
      { name: 'calibrateDry', description: 'Calibrate dry baseline', params: [] },
      { name: 'calibrateWet', description: 'Calibrate wet baseline', params: [] },
      { name: 'getRainfall', description: 'Estimate rainfall mm/hr', params: [] },
      { name: 'setThreshold', description: 'Set rain detection threshold', params: [{ name: 'threshold', type: 'number' }] },
    ],
    events: ['rain', 'dry', 'valueChange'],
  },

  SOIL_SENSOR: {
    properties: [
      { name: 'moisture', type: 'number', default: 50, min: 0, max: 100, unit: '%', description: 'Soil moisture percentage' },
      { name: 'raw', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
      { name: 'isDry', type: 'boolean', default: false, description: 'Soil is too dry' },
      { name: 'needsWater', type: 'boolean', default: false, description: 'Plant needs watering' },
    ],
    methods: [
      { name: 'read', description: 'Read moisture %', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'isDry', description: 'Is soil dry? (below 30%)', params: [] },
      { name: 'isWet', description: 'Is soil wet? (above 70%)', params: [] },
      { name: 'needsWater', description: 'Plant needs water? (below 40%)', params: [] },
      { name: 'calibrateDry', description: 'Calibrate dry value', params: [] },
      { name: 'calibrateWet', description: 'Calibrate wet value', params: [] },
      { name: 'getWaterRecommendation', description: 'Get watering advice', params: [] },
      { name: 'map', description: 'Map to custom range', params: [{ name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
    ],
    events: ['valueChange', 'dry', 'wet'],
  },

  PRESSURE_SENSOR: {
    properties: [
      { name: 'pressure', type: 'number', default: 1013, unit: 'hPa', description: 'Atmospheric pressure' },
      { name: 'altitude', type: 'number', default: 0, unit: 'm', description: 'Estimated altitude' },
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Sensor temperature' },
    ],
    methods: [
      { name: 'readPressure', description: 'Read pressure in hPa', params: [] },
      { name: 'readAltitude', description: 'Read estimated altitude in meters', params: [] },
      { name: 'readTemperature', description: 'Read sensor temperature', params: [] },
      { name: 'readInHg', description: 'Read pressure in inches of mercury', params: [] },
      { name: 'readPSI', description: 'Read pressure in PSI', params: [] },
      { name: 'calibrate', description: 'Calibrate with known altitude', params: [{ name: 'knownAltitude', type: 'number' }] },
      { name: 'isLow', description: 'Pressure below 1000 hPa (storm)?', params: [] },
      { name: 'isHigh', description: 'Pressure above 1020 hPa (fair)?', params: [] },
      { name: 'getWeather', description: 'Estimate weather from pressure', params: [] },
    ],
    events: ['valueChange'],
  },

  FLEX_SENSOR: {
    properties: [
      { name: 'bend', type: 'number', default: 0, min: 0, max: 90, unit: '°', description: 'Bend angle in degrees' },
      { name: 'raw', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
      { name: 'percent', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Bend percentage' },
    ],
    methods: [
      { name: 'read', description: 'Read bend angle (0-90°)', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'readPercent', description: 'Read bend as percentage', params: [] },
      { name: 'isBent', description: 'Is sensor bent? (>10°)', params: [] },
      { name: 'isFullyBent', description: 'Is it fully bent? (>70°)', params: [] },
      { name: 'calibrateStraight', description: 'Calibrate straight position', params: [] },
      { name: 'calibrateBent', description: 'Calibrate fully bent position', params: [] },
    ],
    events: ['valueChange'],
  },

  TILT_SENSOR: {
    properties: [
      { name: 'isTilted', type: 'boolean', default: false, description: 'Tilt detected' },
      { name: 'value', type: 'number', default: 0, min: 0, max: 1, description: 'Digital output' },
    ],
    methods: [
      { name: 'isTilted', description: 'Is sensor tilted?', params: [] },
      { name: 'read', description: 'Read digital value', params: [] },
      { name: 'getDirection', description: 'Get tilt direction', params: [] },
    ],
    events: ['tilt'],
  },

  HALL_SENSOR: {
    properties: [
      { name: 'fieldStrength', type: 'number', default: 0.5, unit: 'G', description: 'Magnetic field strength in gauss' },
      { name: 'polarity', type: 'string', default: 'none', description: 'N/S/none' },
      { name: 'raw', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
    ],
    methods: [
      { name: 'read', description: 'Read field strength', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'hasMagnet', description: 'Magnet detected?', params: [] },
      { name: 'isNorth', description: 'North pole detected?', params: [] },
      { name: 'isSouth', description: 'South pole detected?', params: [] },
      { name: 'getFieldDirection', description: 'Get field direction', params: [] },
      { name: 'calibrate', description: 'Calibrate zero field', params: [] },
    ],
    events: ['fieldChange'],
  },

  COMPASS: {
    properties: [
      { name: 'heading', type: 'number', default: 0, min: 0, max: 360, unit: '°', description: 'Compass heading' },
      { name: 'direction', type: 'string', default: 'N', description: 'Cardinal direction (N/NE/E/SE/S/SW/W/NW)' },
      { name: 'magneticDeclination', type: 'number', default: 0, unit: '°', description: 'Magnetic declination correction' },
    ],
    methods: [
      { name: 'readHeading', description: 'Read heading (0-360°)', params: [] },
      { name: 'getDirection', description: 'Get cardinal direction (N/NE/E/etc)', params: [] },
      { name: 'getBearing', description: 'Get bearing to target lat/lng', params: [{ name: 'lat', type: 'number' }, { name: 'lng', type: 'number' }] },
      { name: 'calibrate', description: 'Run calibration routine', params: [] },
      { name: 'setDeclination', description: 'Set magnetic declination', params: [{ name: 'degrees', type: 'number' }] },
      { name: 'isPointing', description: 'Is compass pointing at heading?', params: [{ name: 'heading', type: 'number' }, { name: 'tolerance', type: 'number' }] },
      { name: 'getPitch', description: 'Get pitch angle', params: [] },
      { name: 'getRoll', description: 'Get roll angle', params: [] },
    ],
    events: ['headingChange'],
  },

  GYRO: {
    properties: [
      { name: 'x', type: 'number', default: 0, unit: '°/s', description: 'X rotation rate' },
      { name: 'y', type: 'number', default: 0, unit: '°/s', description: 'Y rotation rate' },
      { name: 'z', type: 'number', default: 0, unit: '°/s', description: 'Z rotation rate' },
      { name: 'accelX', type: 'number', default: 0, unit: 'g', description: 'X acceleration' },
      { name: 'accelY', type: 'number', default: 0, unit: 'g', description: 'Y acceleration' },
      { name: 'accelZ', type: 'number', default: 1, unit: 'g', description: 'Z acceleration' },
      { name: 'pitch', type: 'number', default: 0, unit: '°', description: 'Pitch angle' },
      { name: 'roll', type: 'number', default: 0, unit: '°', description: 'Roll angle' },
      { name: 'yaw', type: 'number', default: 0, unit: '°', description: 'Yaw angle' },
      { name: 'temperature', type: 'number', default: 25, unit: '°C', description: 'Sensor temperature' },
    ],
    methods: [
      { name: 'readGyro', description: 'Read rotation rates (x,y,z)', params: [] },
      { name: 'readAccel', description: 'Read acceleration (x,y,z)', params: [] },
      { name: 'readPitch', description: 'Read pitch angle', params: [] },
      { name: 'readRoll', description: 'Read roll angle', params: [] },
      { name: 'readYaw', description: 'Read yaw angle', params: [] },
      { name: 'readTemperature', description: 'Read sensor temperature', params: [] },
      { name: 'calibrate', description: 'Zero-point calibration', params: [] },
      { name: 'isMoving', description: 'Is device moving? (|gyro| > threshold)', params: [{ name: 'threshold', type: 'number' }] },
      { name: 'isStationary', description: 'Is device stationary?', params: [] },
      { name: 'getTiltAngle', description: 'Get total tilt from gravity', params: [] },
      { name: 'map', description: 'Map value to custom range', params: [{ name: 'value', type: 'number' }, { name: 'fromLow', type: 'number' }, { name: 'fromHigh', type: 'number' }, { name: 'toLow', type: 'number' }, { name: 'toHigh', type: 'number' }] },
    ],
    events: ['motion', 'freefall', 'tap'],
  },

  HEARTBEAT: {
    properties: [
      { name: 'bpm', type: 'number', default: 72, unit: 'BPM', description: 'Heart rate' },
      { name: 'rawValue', type: 'number', default: 0, min: 0, max: 1023, description: 'Raw analog reading' },
      { name: 'isBeating', type: 'boolean', default: false, description: 'Heartbeat detected' },
      { name: 'lastBeatTime', type: 'number', default: 0, unit: 'ms', description: 'Timestamp of last beat' },
    ],
    methods: [
      { name: 'readBPM', description: 'Read heart rate in BPM', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'isBeating', description: 'Is heartbeat detected?', params: [] },
      { name: 'waitBeat', description: 'Wait for next heartbeat', params: [] },
      { name: 'getBPM', description: 'Calculate BPM from beats', params: [] },
      { name: 'isNormal', description: 'Is heart rate normal? (60-100)', params: [] },
      { name: 'isHigh', description: 'Is heart rate high? (>100)', params: [] },
      { name: 'isLow', description: 'Is heart rate low? (<60)', params: [] },
      { name: 'getHeartRateZone', description: 'Get exercise zone (1-5)', params: [] },
    ],
    events: ['beat', 'irregular'],
  },

  COLOR_SENSOR: {
    properties: [
      { name: 'red', type: 'number', default: 0, min: 0, max: 255, description: 'Red channel value' },
      { name: 'green', type: 'number', default: 0, min: 0, max: 255, description: 'Green channel value' },
      { name: 'blue', type: 'number', default: 0, min: 0, max: 255, description: 'Blue channel value' },
      { name: 'hex', type: 'color', default: '#000000', description: 'Color as hex string' },
      { name: 'hue', type: 'number', default: 0, min: 0, max: 360, unit: '°', description: 'Hue angle' },
      { name: 'saturation', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Color saturation' },
      { name: 'brightness', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Color brightness' },
    ],
    methods: [
      { name: 'readRGB', description: 'Read RGB values', params: [] },
      { name: 'readHex', description: 'Read as hex color', params: [] },
      { name: 'readHSV', description: 'Read as HSV values', params: [] },
      { name: 'isColor', description: 'Is target color? (with tolerance)', params: [{ name: 'color', type: 'string' }, { name: 'tolerance', type: 'number' }] },
      { name: 'getColorName', description: 'Get human-readable color name', params: [] },
      { name: 'getGrayscale', description: 'Get grayscale value (0-255)', params: [] },
      { name: 'calibrateWhite', description: 'Calibrate white point', params: [] },
      { name: 'calibrateBlack', description: 'Calibrate black point', params: [] },
      { name: 'setColorProfile', description: 'Set color profile (RGB/HSV/CMYK)', params: [{ name: 'profile', type: 'string' }] },
    ],
    events: ['colorChange'],
  },

  SOUND_SENSOR: {
    properties: [
      { name: 'level', type: 'number', default: 0, min: 0, max: 1023, description: 'Sound level (0=silent, 1023=loud)' },
      { name: 'isLoud', type: 'boolean', default: false, description: 'Above threshold' },
      { name: 'decibels', type: 'number', default: 0, unit: 'dB', description: 'Estimated decibels' },
    ],
    methods: [
      { name: 'read', description: 'Read sound level (0-1023)', params: [] },
      { name: 'readDecibels', description: 'Read estimated dB level', params: [] },
      { name: 'readRaw', description: 'Read raw analog value', params: [] },
      { name: 'isLoud', description: 'Above threshold?', params: [{ name: 'threshold', type: 'number' }] },
      { name: 'isQuiet', description: 'Below threshold?', params: [{ name: 'threshold', type: 'number' }] },
      { name: 'peak', description: 'Get peak level over time', params: [{ name: 'duration', type: 'number' }] },
      { name: 'average', description: 'Average level over time', params: [{ name: 'duration', type: 'number' }] },
      { name: 'getSoundCategory', description: 'Get category (silent/quiet/moderate/loud)', params: [] },
    ],
    events: ['loud', 'quiet', 'clap'],
  },
};
