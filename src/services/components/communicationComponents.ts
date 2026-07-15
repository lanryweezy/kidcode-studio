import { ComponentSchemaMap } from './types';

export const COMMUNICATION_COMPONENTS: ComponentSchemaMap = {
  // === COMMUNICATION ===
  WIFI: {
    properties: [{ name: 'connected', type: 'boolean', default: false }, { name: 'ssid', type: 'string', default: '' }, { name: 'ip', type: 'string', default: '' }],
    methods: [{ name: 'connect', description: 'Connect to WiFi', params: [{ name: 'ssid', type: 'string' }, { name: 'password', type: 'string' }] }, { name: 'disconnect', description: 'Disconnect', params: [] }, { name: 'isConnected', description: 'Connected?', params: [] }],
    events: ['connect', 'disconnect'],
  },

  BLUETOOTH: {
    properties: [{ name: 'connected', type: 'boolean', default: false }, { name: 'deviceName', type: 'string', default: '' }],
    methods: [{ name: 'connect', description: 'Connect BT', params: [{ name: 'name', type: 'string' }] }, { name: 'disconnect', description: 'Disconnect', params: [] }, { name: 'send', description: 'Send data', params: [{ name: 'data', type: 'string' }] }],
    events: ['connect', 'disconnect', 'data'],
  },

  RADIO: {
    properties: [{ name: 'channel', type: 'number', default: 1, min: 0, max: 125 }, { name: 'isListening', type: 'boolean', default: false }],
    methods: [{ name: 'setChannel', description: 'Set channel', params: [{ name: 'ch', type: 'number' }] }, { name: 'send', description: 'Send data', params: [{ name: 'data', type: 'string' }] }, { name: 'listen', description: 'Start listening', params: [] }],
    events: ['receive'],
  },

  GPS: {
    properties: [
      { name: 'latitude', type: 'number', default: 0, unit: '°', description: 'Latitude' },
      { name: 'longitude', type: 'number', default: 0, unit: '°', description: 'Longitude' },
      { name: 'altitude', type: 'number', default: 0, unit: 'm', description: 'Altitude above sea level' },
      { name: 'speed', type: 'number', default: 0, unit: 'km/h', description: 'Speed over ground' },
      { name: 'course', type: 'number', default: 0, unit: '°', description: 'Course over ground' },
      { name: 'satellites', type: 'number', default: 0, description: 'Satellites in view' },
      { name: 'hdop', type: 'number', default: 0, description: 'Horizontal dilution of precision' },
      { name: 'fix', type: 'boolean', default: false, description: 'GPS fix acquired' },
    ],
    methods: [
      { name: 'readLocation', description: 'Read lat/lng', params: [] },
      { name: 'readSpeed', description: 'Read speed in km/h', params: [] },
      { name: 'readAltitude', description: 'Read altitude in meters', params: [] },
      { name: 'readCourse', description: 'Read course in degrees', params: [] },
      { name: 'readSatellites', description: 'Read satellite count', params: [] },
      { name: 'hasFix', description: 'Has GPS fix?', params: [] },
      { name: 'getDistanceTo', description: 'Distance to target lat/lng (meters)', params: [{ name: 'lat', type: 'number' }, { name: 'lng', type: 'number' }] },
      { name: 'getSpeedKnots', description: 'Speed in knots', params: [] },
      { name: 'getSpeedMPH', description: 'Speed in mph', params: [] },
      { name: 'formatCoordinates', description: 'Format as DMS string', params: [] },
    ],
    events: ['locationUpdate', 'fix'],
  },

  RFID: {
    properties: [{ name: 'tagId', type: 'string', default: '', description: 'Last scanned tag ID' }, { name: 'isReading', type: 'boolean', default: false, description: 'Tag currently being read' }, { name: 'tagType', type: 'string', default: '', description: 'Tag type (MIFARE/NTAG)' }],
    methods: [{ name: 'scan', description: 'Scan for RFID tag', params: [] }, { name: 'isTag', description: 'Match tag?', params: [{ name: 'expected', type: 'string' }] }, { name: 'waitTag', description: 'Wait for tag', params: [] }, { name: 'readBlock', description: 'Read data block', params: [{ name: 'block', type: 'number' }] }, { name: 'writeBlock', description: 'Write data block', params: [{ name: 'block', type: 'number' }, { name: 'data', type: 'string' }] }, { name: 'getTagSize', description: 'Get tag memory size', params: [] }],
    events: ['tagDetected', 'tagLost', 'readComplete'],
  },

  FINGERPRINT: {
    properties: [{ name: 'matchId', type: 'number', default: -1, description: 'Matched fingerprint ID' }, { name: 'isMatch', type: 'boolean', default: false, description: 'Fingerprint matched' }, { name: 'confidence', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Match confidence' }],
    methods: [{ name: 'scan', description: 'Scan fingerprint', params: [] }, { name: 'isEnrolled', description: 'ID enrolled?', params: [{ name: 'id', type: 'number' }] }, { name: 'enroll', description: 'Enroll new fingerprint', params: [{ name: 'id', type: 'number' }] }, { name: 'delete', description: 'Delete fingerprint', params: [{ name: 'id', type: 'number' }] }, { name: 'getEnrolledCount', description: 'Get enrolled count', params: [] }, { name: 'verify', description: 'Verify against ID', params: [{ name: 'id', type: 'number' }] }, { name: 'getImage', description: 'Get fingerprint image', params: [] }],
    events: ['match', 'noMatch', 'enrollComplete'],
  },

  // === POWER ===
  BATTERY_9V: {
    properties: [{ name: 'voltage', type: 'number', default: 9, unit: 'V', description: 'Battery voltage' }, { name: 'percent', type: 'number', default: 100, unit: '%', description: 'Remaining charge' }],
    methods: [{ name: 'readVoltage', description: 'Read voltage', params: [] }, { name: 'readPercent', description: 'Read remaining %', params: [] }],
    events: ['lowBattery'],
  },

  BATTERY_AA: {
    properties: [{ name: 'voltage', type: 'number', default: 1.5, unit: 'V', description: 'Battery voltage' }, { name: 'percent', type: 'number', default: 100, unit: '%', description: 'Remaining charge' }],
    methods: [{ name: 'readVoltage', description: 'Read voltage', params: [] }],
    events: ['lowBattery'],
  },

  SOLAR: {
    properties: [{ name: 'voltage', type: 'number', default: 5, unit: 'V', description: 'Output voltage' }, { name: 'current', type: 'number', default: 0, unit: 'mA', description: 'Output current' }, { name: 'power', type: 'number', default: 0, unit: 'mW', description: 'Output power' }],
    methods: [{ name: 'readVoltage', description: 'Read voltage', params: [] }, { name: 'readCurrent', description: 'Read current', params: [] }, { name: 'readPower', description: 'Read power', params: [] }],
    events: ['valueChange'],
  },

  // === COMPONENTS ===
  RESISTOR: {
    properties: [{ name: 'resistance', type: 'number', default: 1000, unit: 'Ω', description: 'Resistance value' }],
    methods: [{ name: 'getResistance', description: 'Get resistance value', params: [] }, { name: 'voltageDrop', description: 'Calculate voltage drop', params: [{ name: 'current', type: 'number' }] }, { name: 'maxCurrent', description: 'Max safe current', params: [{ name: 'voltage', type: 'number' }] }],
    events: [],
  },

  // === LOGIC ===
  LOGIC_AND: {
    properties: [{ name: 'output', type: 'boolean', default: false, description: 'Logic output' }],
    methods: [{ name: 'compute', description: 'Compute AND', params: [{ name: 'a', type: 'boolean' }, { name: 'b', type: 'boolean' }] }],
    events: ['change'],
  },

  LOGIC_OR: {
    properties: [{ name: 'output', type: 'boolean', default: false, description: 'Logic output' }],
    methods: [{ name: 'compute', description: 'Compute OR', params: [{ name: 'a', type: 'boolean' }, { name: 'b', type: 'boolean' }] }],
    events: ['change'],
  },

  '555_TIMER': {
    properties: [{ name: 'frequency', type: 'number', default: 1, unit: 'Hz', description: 'Oscillation frequency' }, { name: 'dutyCycle', type: 'number', default: 50, unit: '%', description: 'Duty cycle' }, { name: 'output', type: 'boolean', default: false, description: 'Timer output' }],
    methods: [{ name: 'setFrequency', description: 'Set frequency', params: [{ name: 'hz', type: 'number' }] }, { name: 'setDutyCycle', description: 'Set duty cycle', params: [{ name: 'percent', type: 'number' }] }, { name: 'start', description: 'Start oscillator', params: [] }, { name: 'stop', description: 'Stop oscillator', params: [] }],
    events: ['tick'],
  },

  I2C_SENSOR: {
    properties: [{ name: 'address', type: 'string', default: '0x48', description: 'I2C address' }],
    methods: [{ name: 'readByte', description: 'Read byte', params: [{ name: 'register', type: 'number' }] }, { name: 'writeByte', description: 'Write byte', params: [{ name: 'register', type: 'number' }, { name: 'value', type: 'number' }] }],
    events: [],
  },

  SPI_SENSOR: {
    properties: [{ name: 'csPin', type: 'number', default: 10, description: 'Chip select pin' }],
    methods: [{ name: 'transfer', description: 'SPI transfer', params: [{ name: 'data', type: 'number' }] }],
    events: [],
  },
};
