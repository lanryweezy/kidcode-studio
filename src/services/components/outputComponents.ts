import { ComponentSchemaMap } from './types';

export const OUTPUT_COMPONENTS: ComponentSchemaMap = {
  LED_RED: {
    properties: [
      { name: 'on', type: 'boolean', default: false, description: 'LED on/off state' },
      { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'LED brightness' },
      { name: 'color', type: 'color', default: '#ef4444', description: 'LED color' },
    ],
    methods: [
      { name: 'turnOn', description: 'Turn the LED on', params: [] },
      { name: 'turnOff', description: 'Turn the LED off', params: [] },
      { name: 'toggle', description: 'Toggle LED state', params: [] },
      { name: 'blink', description: 'Blink the LED', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] },
      { name: 'pulse', description: 'Pulse LED brightness', params: [{ name: 'from', type: 'number' }, { name: 'to', type: 'number' }] },
    ],
    events: ['on', 'off', 'toggle'],
  },
  LED_BLUE: { properties: [{ name: 'on', type: 'boolean', default: false, description: 'LED on/off' }, { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' }], methods: [{ name: 'turnOn', description: 'Turn on', params: [] }, { name: 'turnOff', description: 'Turn off', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }, { name: 'blink', description: 'Blink', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] }], events: ['on', 'off'] },
  LED_GREEN: { properties: [{ name: 'on', type: 'boolean', default: false, description: 'LED on/off' }, { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' }], methods: [{ name: 'turnOn', description: 'Turn on', params: [] }, { name: 'turnOff', description: 'Turn off', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }, { name: 'blink', description: 'Blink', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] }], events: ['on', 'off'] },
  LED_YELLOW: { properties: [{ name: 'on', type: 'boolean', default: false, description: 'LED on/off' }, { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' }], methods: [{ name: 'turnOn', description: 'Turn on', params: [] }, { name: 'turnOff', description: 'Turn off', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }, { name: 'blink', description: 'Blink', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] }], events: ['on', 'off'] },
  LED_ORANGE: { properties: [{ name: 'on', type: 'boolean', default: false, description: 'LED on/off' }, { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' }], methods: [{ name: 'turnOn', description: 'Turn on', params: [] }, { name: 'turnOff', description: 'Turn off', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }, { name: 'blink', description: 'Blink', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] }], events: ['on', 'off'] },
  LED_WHITE: { properties: [{ name: 'on', type: 'boolean', default: false, description: 'LED on/off' }, { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' }], methods: [{ name: 'turnOn', description: 'Turn on', params: [] }, { name: 'turnOff', description: 'Turn off', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }, { name: 'blink', description: 'Blink', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] }], events: ['on', 'off'] },

  RGB_LED: {
    properties: [
      { name: 'on', type: 'boolean', default: false, description: 'LED on/off' },
      { name: 'color', type: 'color', default: '#FF0000', description: 'RGB color' },
      { name: 'red', type: 'number', default: 255, min: 0, max: 255, description: 'Red channel (0-255)' },
      { name: 'green', type: 'number', default: 0, min: 0, max: 255, description: 'Green channel (0-255)' },
      { name: 'blue', type: 'number', default: 0, min: 0, max: 255, description: 'Blue channel (0-255)' },
      { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Overall brightness' },
    ],
    methods: [
      { name: 'setColor', description: 'Set RGB color', params: [{ name: 'r', type: 'number' }, { name: 'g', type: 'number' }, { name: 'b', type: 'number' }] },
      { name: 'rainbow', description: 'Cycle through rainbow colors', params: [{ name: 'speed', type: 'number' }] },
      { name: 'turnOn', description: 'Turn on', params: [] },
      { name: 'turnOff', description: 'Turn off', params: [] },
    ],
    events: ['colorChange'],
  },

  FAN: {
    properties: [
      { name: 'speed', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Fan speed (0=off, 100=max)' },
      { name: 'isSpinning', type: 'boolean', default: false, description: 'Whether fan is spinning' },
      { name: 'direction', type: 'string', default: 'cw', description: 'Spin direction (cw/ccw)' },
    ],
    methods: [
      { name: 'setSpeed', description: 'Set fan speed', params: [{ name: 'speed', type: 'number' }] },
      { name: 'stop', description: 'Stop the fan', params: [] },
      { name: 'fullSpeed', description: 'Run at maximum speed', params: [] },
      { name: 'rampUp', description: 'Gradually increase speed', params: [{ name: 'targetSpeed', type: 'number' }, { name: 'duration', type: 'number' }] },
      { name: 'rampDown', description: 'Gradually decrease speed', params: [{ name: 'duration', type: 'number' }] },
    ],
    events: ['speedChange', 'start', 'stop'],
  },

  SERVO: {
    properties: [
      { name: 'angle', type: 'number', default: 90, min: 0, max: 180, unit: '°', description: 'Servo angle (0-180°)' },
      { name: 'isMoving', type: 'boolean', default: false, description: 'Whether servo is moving' },
      { name: 'speed', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Movement speed' },
    ],
    methods: [
      { name: 'setAngle', description: 'Set servo angle', params: [{ name: 'angle', type: 'number' }] },
      { name: 'sweep', description: 'Sweep back and forth', params: [{ name: 'from', type: 'number' }, { name: 'to', type: 'number' }, { name: 'speed', type: 'number' }] },
      { name: 'center', description: 'Move to center (90°)', params: [] },
      { name: 'calibrate', description: 'Run calibration sweep', params: [] },
    ],
    events: ['angleChange', 'sweepComplete'],
  },

  MOTOR_DC: {
    properties: [
      { name: 'speed', type: 'number', default: 0, min: -100, max: 100, unit: '%', description: 'Motor speed (-100 to 100, negative = reverse)' },
      { name: 'isRunning', type: 'boolean', default: false, description: 'Whether motor is running' },
      { name: 'direction', type: 'string', default: 'cw', description: 'Spin direction (cw/ccw)' },
      { name: 'load', type: 'number', default: 0, min: 0, max: 100, unit: '%', description: 'Motor load (affects speed)' },
    ],
    methods: [
      { name: 'setSpeed', description: 'Set motor speed', params: [{ name: 'speed', type: 'number' }] },
      { name: 'forward', description: 'Run forward', params: [{ name: 'speed', type: 'number' }] },
      { name: 'reverse', description: 'Run in reverse', params: [{ name: 'speed', type: 'number' }] },
      { name: 'brake', description: 'Emergency stop', params: [] },
      { name: 'coast', description: 'Coast to stop', params: [] },
    ],
    events: ['start', 'stop', 'speedChange'],
  },

  BUZZER: {
    properties: [
      { name: 'isPlaying', type: 'boolean', default: false, description: 'Whether buzzer is playing' },
      { name: 'frequency', type: 'number', default: 1000, min: 20, max: 20000, unit: 'Hz', description: 'Tone frequency' },
      { name: 'duration', type: 'number', default: 0.5, min: 0.01, max: 10, unit: 's', description: 'Tone duration' },
      { name: 'volume', type: 'number', default: 50, min: 0, max: 100, unit: '%', description: 'Volume' },
    ],
    methods: [
      { name: 'beep', description: 'Play a beep', params: [{ name: 'duration', type: 'number' }] },
      { name: 'playNote', description: 'Play a musical note', params: [{ name: 'note', type: 'string' }, { name: 'duration', type: 'number' }] },
      { name: 'playMelody', description: 'Play a melody', params: [{ name: 'notes', type: 'string' }] },
      { name: 'alarm', description: 'Play alarm pattern', params: [{ name: 'times', type: 'number' }] },
      { name: 'stop', description: 'Stop playing', params: [] },
    ],
    events: ['play', 'stop'],
  },

  SPEAKER: {
    properties: [
      { name: 'volume', type: 'number', default: 50, min: 0, max: 100, unit: '%', description: 'Speaker volume' },
      { name: 'isPlaying', type: 'boolean', default: false, description: 'Whether playing audio' },
      { name: 'frequency', type: 'number', default: 440, min: 20, max: 20000, unit: 'Hz', description: 'Audio frequency' },
    ],
    methods: [
      { name: 'playTone', description: 'Play a tone', params: [{ name: 'frequency', type: 'number' }, { name: 'duration', type: 'number' }] },
      { name: 'playNote', description: 'Play musical note', params: [{ name: 'note', type: 'string' }, { name: 'duration', type: 'number' }] },
      { name: 'setVolume', description: 'Set volume', params: [{ name: 'volume', type: 'number' }] },
      { name: 'stop', description: 'Stop playing', params: [] },
    ],
    events: ['play', 'stop'],
  },

  BULB: {
    properties: [
      { name: 'on', type: 'boolean', default: false, description: 'Bulb on/off' },
      { name: 'brightness', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Brightness' },
    ],
    methods: [
      { name: 'turnOn', description: 'Turn on', params: [] },
      { name: 'turnOff', description: 'Turn off', params: [] },
      { name: 'toggle', description: 'Toggle', params: [] },
      { name: 'dim', description: 'Set brightness', params: [{ name: 'level', type: 'number' }] },
    ],
    events: ['on', 'off'],
  },

  LASER: {
    properties: [
      { name: 'on', type: 'boolean', default: false, description: 'Laser on/off' },
      { name: 'power', type: 'number', default: 5, min: 1, max: 100, unit: 'mW', description: 'Laser power' },
    ],
    methods: [
      { name: 'turnOn', description: 'Turn on', params: [] },
      { name: 'turnOff', description: 'Turn off', params: [] },
      { name: 'pulse', description: 'Pulse laser', params: [{ name: 'times', type: 'number' }, { name: 'interval', type: 'number' }] },
    ],
    events: ['on', 'off'],
  },

  RELAY: {
    properties: [
      { name: 'on', type: 'boolean', default: false, description: 'Relay state' },
    ],
    methods: [
      { name: 'turnOn', description: 'Close relay', params: [] },
      { name: 'turnOff', description: 'Open relay', params: [] },
      { name: 'toggle', description: 'Toggle', params: [] },
    ],
    events: ['on', 'off', 'toggle'],
  },

  RELAY_MODULE: {
    properties: [{ name: 'on', type: 'boolean', default: false, description: 'Relay state' }],
    methods: [{ name: 'turnOn', description: 'Close relay', params: [] }, { name: 'turnOff', description: 'Open relay', params: [] }, { name: 'toggle', description: 'Toggle', params: [] }],
    events: ['on', 'off'],
  },

  STEPPER: {
    properties: [
      { name: 'position', type: 'number', default: 0, min: -99999, max: 99999, unit: 'steps', description: 'Current position in steps' },
      { name: 'speed', type: 'number', default: 100, min: 1, max: 1000, unit: 'RPM', description: 'Rotation speed' },
    ],
    methods: [
      { name: 'step', description: 'Move N steps', params: [{ name: 'steps', type: 'number' }] },
      { name: 'rotate', description: 'Rotate N degrees', params: [{ name: 'degrees', type: 'number' }] },
      { name: 'home', description: 'Return to home position', params: [] },
      { name: 'setSpeed', description: 'Set RPM', params: [{ name: 'rpm', type: 'number' }] },
    ],
    events: ['move', 'home'],
  },

  SOLENOID: {
    properties: [{ name: 'active', type: 'boolean', default: false, description: 'Solenoid state' }],
    methods: [{ name: 'activate', description: 'Extend solenoid', params: [] }, { name: 'deactivate', description: 'Retract solenoid', params: [] }, { name: 'pulse', description: 'Quick pulse', params: [{ name: 'duration', type: 'number' }] }],
    events: ['activate', 'deactivate'],
  },

  PUMP: {
    properties: [{ name: 'on', type: 'boolean', default: false }, { name: 'flowRate', type: 'number', default: 100, min: 0, max: 100, unit: '%', description: 'Flow rate' }],
    methods: [{ name: 'turnOn', description: 'Start pump', params: [] }, { name: 'turnOff', description: 'Stop pump', params: [] }, { name: 'setFlow', description: 'Set flow rate', params: [{ name: 'rate', type: 'number' }] }],
    events: ['on', 'off'],
  },

  VIBRATION: {
    properties: [{ name: 'isVibrating', type: 'boolean', default: false }, { name: 'intensity', type: 'number', default: 100, min: 0, max: 100, unit: '%' }],
    methods: [{ name: 'vibrate', description: 'Vibrate', params: [{ name: 'duration', type: 'number' }] }, { name: 'pattern', description: 'Vibrate in pattern', params: [{ name: 'pattern', type: 'string' }] }, { name: 'stop', description: 'Stop', params: [] }],
    events: ['start', 'stop'],
  },
};
