
import { CircuitComponent, HardwareState } from '../../types';
import { ComponentObject, ComponentSchemaMap } from './types';

export const COMPONENT_LABELS_MAP: Record<string, string> = {
  LED_RED: 'Red LED', LED_BLUE: 'Blue LED', LED_GREEN: 'Green LED',
  LED_YELLOW: 'Yellow LED', LED_ORANGE: 'Orange LED', LED_WHITE: 'White LED',
  RGB_LED: 'RGB LED', RGB_STRIP: 'RGB Strip', BULB: 'Light Bulb',
  BUZZER: 'Piezo Buzzer', RESISTOR: 'Resistor', MOTOR_DC: 'DC Motor',
  SERVO: 'Servo', SERVO_CONTINUOUS: 'Continuous Servo', FAN: 'Fan Motor',
  BATTERY_9V: '9V Battery', BATTERY_AA: 'AA Battery', SOLAR: 'Solar Panel',
  ARDUINO_UNO: 'Arduino Uno', ARDUINO_NANO: 'Arduino Nano', ARDUINO_MEGA: 'Arduino Mega',
  ESP32_DEVKIT: 'ESP32 DevKit', LCD: 'LCD Screen', OLED: 'OLED Screen',
  SEVEN_SEGMENT: '7-Segment', MATRIX: 'LED Matrix', BUTTON: 'Push Button',
  BUTTON_TACTILE: 'Tactile Button', POTENTIOMETER: 'Rotary Knob',
  SWITCH_TOGGLE: 'Toggle Switch', SWITCH_SLIDE: 'Slide Switch',
  ULTRASONIC: 'Distance Sensor', DHT11: 'DHT11 Sensor', DHT22: 'DHT22 Sensor',
  LIGHT_SENSOR: 'Light Sensor', MOTION: 'Motion PIR', RELAY: 'Relay',
  RELAY_MODULE: 'Relay Module', LASER: 'Laser', LASER_DIODE: 'Laser Diode',
  PUMP: 'Water Pump', STEPPER: 'Stepper Motor', SOLENOID: 'Solenoid',
  BREADBOARD: 'Breadboard', MULTIMETER: 'Multimeter', OSCILLOSCOPE: 'Oscilloscope',
  I2C_SENSOR: 'I2C Sensor', SPI_SENSOR: 'SPI Sensor', RFID: 'RFID Reader',
  FINGERPRINT: 'Fingerprint', LOGIC_AND: 'AND Gate', LOGIC_OR: 'OR Gate',
  '555_TIMER': '555 Timer', SPEAKER: 'Speaker', VIBRATION: 'Vibration Motor',
  SWITCH_DIP: 'DIP Switch', SWITCH_ROTARY: 'Rotary Switch', SLIDE_POT: 'Slide Pot',
  JOYSTICK: 'Joystick', KEYPAD: 'Keypad 4x4', ENCODER: 'Rotary Encoder',
  TEMP_SENSOR: 'Temp Sensor', THERMISTOR: 'Thermistor', GAS_SENSOR: 'Gas Sensor',
  FLAME_SENSOR: 'Flame Sensor', RAIN_SENSOR: 'Rain Sensor', SOIL_SENSOR: 'Soil Sensor',
  PRESSURE_SENSOR: 'Pressure Sensor', FLEX_SENSOR: 'Flex Sensor',
  TILT_SENSOR: 'Tilt Switch', HALL_SENSOR: 'Hall Sensor', COMPASS: 'Digital Compass',
  GYRO: 'Gyro/Accel', GPS: 'GPS Module', HEARTBEAT: 'Heartbeat', COLOR_SENSOR: 'Color Sensor',
  WIFI: 'WiFi Module', BLUETOOTH: 'Bluetooth', RADIO: 'Radio Module',
  SD_CARD: 'SD Card', RTC: 'RTC', MOTOR_STEPPER: 'Stepper Motor',
  MOTOR_PUMP: 'Water Pump', MOTOR_SOL: 'Solenoid', KEYPAD_MATRIX: 'Matrix Keypad',
};

export function createComponentObject(comp: CircuitComponent, COMPONENT_SCHEMA: ComponentSchemaMap): ComponentObject {
  const schema = COMPONENT_SCHEMA[comp.type];
  const properties: Record<string, unknown> = {};

  if (schema) {
    schema.properties.forEach(p => {
      properties[p.name] = p.default;
    });
  }

  return {
    id: comp.id,
    type: comp.type,
    name: COMPONENT_LABELS_MAP[comp.type] || comp.type,
    properties,
    methods: schema?.methods.map(m => m.name) || [],
    events: schema?.events || [],
  };
}

// === EXECUTE METHOD ON COMPONENT ===

function asNumber(val: number | string | undefined, defaultVal: number): number {
  if (val === undefined || val === '') return defaultVal;
  const n = Number(val);
  return isNaN(n) ? defaultVal : n;
}

function asString(val: number | string | undefined, defaultVal: string): string {
  if (val === undefined) return defaultVal;
  return String(val);
}

export function executeComponentMethod(
  comp: CircuitComponent,
  methodName: string,
  args: (number | string)[],
  hardwareState: HardwareState
): boolean | number | string | Record<string, unknown> | null {
  const type = comp.type;

  switch (methodName) {
    // LED methods
    case 'turnOn': hardwareState.pins[comp.pin] = true; return true;
    case 'turnOff': hardwareState.pins[comp.pin] = false; return false;
    case 'toggle': hardwareState.pins[comp.pin] = !hardwareState.pins[comp.pin]; return hardwareState.pins[comp.pin];
    case 'blink': { const times = asNumber(args[0], 3); const interval = asNumber(args[1], 500); return { action: 'blink', times, interval }; }
    case 'pulse': { return { action: 'pulse', from: asNumber(args[0], 0), to: asNumber(args[1], 100) }; }

    // Fan methods
    case 'setSpeed': hardwareState.fanSpeed = Math.max(0, Math.min(100, asNumber(args[0], 0))); return hardwareState.fanSpeed;
    case 'stop': hardwareState.fanSpeed = 0; return 0;
    case 'fullSpeed': hardwareState.fanSpeed = 100; return 100;
    case 'rampUp': { return { action: 'rampUp', target: asNumber(args[0], 100), duration: asNumber(args[1], 2) }; }
    case 'rampDown': { return { action: 'rampDown', duration: asNumber(args[0], 2) }; }

    // Servo methods
    case 'setAngle': hardwareState.servoAngle = Math.max(0, Math.min(180, asNumber(args[0], 90))); return hardwareState.servoAngle;
    case 'sweep': { return { action: 'sweep', from: asNumber(args[0], 0), to: asNumber(args[1], 180), speed: asNumber(args[2], 50) }; }
    case 'center': {
        hardwareState.servoAngle = 90;
        const text = asString(args[0], '');
        const row = asNumber(args[1], 0);
        const padded = text.padStart(Math.floor((16 + text.length) / 2)).padEnd(16);
        return executeComponentMethod(comp, 'printAt', [row, 0, padded], hardwareState);
    }
    case 'calibrate': { return { action: 'calibrate' }; }

    // Motor methods
    case 'forward': hardwareState.motorLoad = Math.max(0, Math.min(100, asNumber(args[0], 50))); return hardwareState.motorLoad;
    case 'reverse': { return { action: 'reverse', speed: asNumber(args[0], 50) }; }
    case 'brake': hardwareState.motorLoad = 0; return 0;
    case 'coast': { return { action: 'coast' }; }

    // Buzzer methods
    case 'beep': { return { action: 'beep', duration: asNumber(args[0], 0.5) }; }
    case 'playNote': { return { action: 'playNote', note: asString(args[0], 'C4'), duration: asNumber(args[1], 0.5) }; }
    case 'playMelody': { return { action: 'playMelody', notes: asString(args[0], 'C4,D4,E4,F4,G4') }; }
    case 'alarm': { return { action: 'alarm', times: asNumber(args[0], 3) }; }

    // Speaker methods
    case 'playTone': { return { action: 'playTone', frequency: asNumber(args[0], 440), duration: asNumber(args[1], 0.5) }; }

    // LCD methods
    case 'print': {
        const text = asString(args[0], '');
        const row = hardwareState.cursorRow || 0;
        const col = hardwareState.cursorCol || 0;
        const lines = [...hardwareState.lcdLines];
        if (row >= 0 && row < lines.length) {
            const lineArr = [...lines[row]];
            for (let i = 0; i < text.length && col + i < 16; i++) {
                lineArr[col + i] = text[i];
            }
            lines[row] = lineArr.join('');
        }
        hardwareState.lcdLines = lines;
        hardwareState.cursorCol = Math.min((col + text.length), 15);
        return true;
    }
    case 'printAt': {
        const row = asNumber(args[0], 0);
        const col = asNumber(args[1], 0);
        const text = asString(args[2], '');
        const lines = [...hardwareState.lcdLines];
        if (row >= 0 && row < lines.length) {
            const lineArr = [...lines[row]];
            for (let i = 0; i < text.length && col + i < 16; i++) {
                lineArr[col + i] = text[i];
            }
            lines[row] = lineArr.join('');
        }
        hardwareState.lcdLines = lines;
        hardwareState.cursorRow = row;
        hardwareState.cursorCol = Math.min(col + text.length, 15);
        return true;
    }
    case 'printNumber': {
        const value = asNumber(args[0], 0);
        const decimals = asNumber(args[1], 0);
        const text = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
        return executeComponentMethod(comp, 'print', [text], hardwareState);
    }
    case 'printFloat': {
        const value = asNumber(args[0], 0);
        const decimals = asNumber(args[1], 2);
        return executeComponentMethod(comp, 'print', [value.toFixed(decimals)], hardwareState);
    }
    case 'printHex': {
        const value = asNumber(args[0], 0);
        const digits = asNumber(args[1], 2);
        return executeComponentMethod(comp, 'print', [`0x${  value.toString(16).toUpperCase().padStart(digits, '0')}`], hardwareState);
    }
    case 'printBinary': {
        const value = asNumber(args[0], 0);
        const digits = asNumber(args[1], 8);
        return executeComponentMethod(comp, 'print', [value.toString(2).padStart(digits, '0')], hardwareState);
    }
    case 'setCursor': hardwareState.cursorRow = asNumber(args[0], 0); hardwareState.cursorCol = asNumber(args[1], 0); return true;
    case 'home': hardwareState.cursorRow = 0; hardwareState.cursorCol = 0; return true;
    case 'clear': hardwareState.lcdLines = ['', '', '', '']; hardwareState.cursorRow = 0; hardwareState.cursorCol = 0; return true;
    case 'cursorOn': return true;
    case 'cursorOff': return false;
    case 'blinkOn': return true;
    case 'blinkOff': return false;
    case 'displayOn': return true;
    case 'displayOff': return false;
    case 'backlightOn': return true;
    case 'backlightOff': return false;
    case 'scrollLeft': return { action: 'scrollLeft' };
    case 'scrollRight': return { action: 'scrollRight' };
    case 'autoScrollOn': return true;
    case 'autoScrollOff': return false;
    case 'leftToRight': return { direction: 'ltr' };
    case 'rightToLeft': return { direction: 'rtl' };
    
    case 'rightAlign': {
        const text = asString(args[0], '');
        const row = asNumber(args[1], 0);
        const padded = text.padStart(16);
        return executeComponentMethod(comp, 'printAt', [row, 0, padded], hardwareState);
    }
    case 'progressBar': {
        const row = asNumber(args[0], 0);
        const percent = Math.max(0, Math.min(100, asNumber(args[1], 0)));
        const width = asNumber(args[2], 16);
        const filled = Math.round((percent / 100) * width);
        const empty = width - filled;
        const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
        return executeComponentMethod(comp, 'printAt', [row, 0, bar], hardwareState);
    }
    case 'formatTime': {
        const seconds = asNumber(args[0], 0);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    case 'formatTemp': {
        const c = asNumber(args[0], 0);
        return `${c.toFixed(1)  }\u00B0C`;
    }
    case 'formatVoltage': {
        const v = asNumber(args[0], 0);
        return `${v.toFixed(2)  }V`;
    }
    case 'formatPercent': {
        const p = asNumber(args[0], 0);
        return `${Math.round(p)  }%`;
    }
    case 'getText': return hardwareState.lcdLines.join('\n');
    case 'getLine': return hardwareState.lcdLines[asNumber(args[0], 0)] || '';
    case 'getCursorPos': return { row: hardwareState.cursorRow || 0, col: hardwareState.cursorCol || 0 };
    case 'isBusy': return false;

    // OLED methods
    case 'drawLine': { return { action: 'drawLine', x1: args[0], y1: args[1], x2: args[2], y2: args[3] }; }
    case 'drawRect': { return { action: 'drawRect', x: args[0], y: args[1], w: args[2], h: args[3] }; }
    case 'drawCircle': { return { action: 'drawCircle', x: args[0], y: args[1], r: args[2] }; }

    // 7-Segment methods
    case 'display': hardwareState.sevenSegmentValue = asNumber(args[0], 0); return hardwareState.sevenSegmentValue;
    case 'countUp': { return { action: 'countUp', to: asNumber(args[0], 9), delay: asNumber(args[1], 500) }; }

    // Matrix methods
    case 'setRow': { return { action: 'setRow', row: asNumber(args[0], 0), pattern: asString(args[1], '00000000') }; }
    case 'drawPattern': { return { action: 'drawPattern', pattern: asString(args[0], '0000000000000000') }; }
    case 'scrollText': { return { action: 'scrollText', text: asString(args[0], 'Hi'), speed: asNumber(args[1], 100) }; }

    // Relay/Solenoid/Laser/Vibration methods
    case 'activate': hardwareState.relayState = true; return true;
    case 'deactivate': hardwareState.relayState = false; return false;
    case 'vibrate': hardwareState.vibrationActive = true; setTimeout(() => { hardwareState.vibrationActive = false; }, asNumber(args[0], 0.5) * 1000); return true;

    // Sensor read methods
    case 'read': return hardwareState.potentiometerValue;
    case 'readDistance': return hardwareState.distance;
    case 'readTemperature': return hardwareState.temperature;
    case 'readHumidity': return hardwareState.humidity;
    case 'readHeading': return hardwareState.compassHeading;
    case 'readBPM': return hardwareState.heartbeatRate;
    case 'readPressure': return hardwareState.pressure;

    // WiFi/BT methods
    case 'connect': hardwareState.wifiConnected = true; return true;
    case 'disconnect': hardwareState.wifiConnected = false; return false;
    case 'isConnected': return hardwareState.wifiConnected;

    // Display clear
    default: return null;
  }
}

// === GET COMPATIBLE COMPONENTS FOR A PIN ===

export function getCompatibleComponents(pin: number): string[] {
  if (pin >= 0 && pin <= 13) return ['LED_RED', 'LED_BLUE', 'LED_GREEN', 'LED_YELLOW', 'LED_ORANGE', 'LED_WHITE', 'BUZZER', 'SPEAKER', 'FAN', 'SERVO', 'MOTOR_DC', 'RELAY', 'LASER', 'BUTTON', 'BUTTON_TACTILE', 'SWITCH_TOGGLE', 'SWITCH_SLIDE', 'VIBRATION', 'STEPPER', 'SOLENOID', 'PUMP'];
  if (pin >= 14 && pin <= 21) return ['POTENTIOMETER', 'SLIDE_POT', 'LIGHT_SENSOR', 'TEMP_SENSOR', 'DHT11', 'DHT22', 'GAS_SENSOR', 'FLAME_SENSOR', 'RAIN_SENSOR', 'SOIL_SENSOR', 'PRESSURE_SENSOR', 'FLEX_SENSOR', 'TILT_SENSOR', 'HALL_SENSOR', 'COMPASS', 'GYRO', 'HEARTBEAT', 'SOUND_SENSOR'];
  if (pin === 22 || pin === 24 || pin === 25) return ['BATTERY_9V', 'BATTERY_AA', 'SOLAR'];
  return [];
}
