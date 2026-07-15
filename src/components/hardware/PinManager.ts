import { CircuitComponent } from '../../types';

export const WIRE_COLORS: Record<string, string> = {
    power: '#ef4444',
    ground: '#1e293b',
    signal: '#3b82f6',
    default: '#fbbf24',
};

export const COMPONENT_LABELS: Record<string, string> = {
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

export const PIN_INFO: Record<number, { label: string; type: 'power' | 'ground' | 'digital' | 'analog' | 'pwm' | 'comm' }> = {
    0: { label: 'D0/RX', type: 'digital' },
    1: { label: 'D1/TX', type: 'digital' },
    2: { label: 'D2', type: 'digital' },
    3: { label: 'D3/PWM', type: 'pwm' },
    4: { label: 'D4', type: 'digital' },
    5: { label: 'D5/PWM', type: 'pwm' },
    6: { label: 'D6/PWM', type: 'pwm' },
    7: { label: 'D7', type: 'digital' },
    8: { label: 'D8', type: 'digital' },
    9: { label: 'D9/PWM', type: 'pwm' },
    10: { label: 'D10/PWM', type: 'pwm' },
    11: { label: 'D11/PWM', type: 'pwm' },
    12: { label: 'D12', type: 'digital' },
    13: { label: 'D13/LED', type: 'digital' },
    14: { label: 'A0', type: 'analog' },
    15: { label: 'A1', type: 'analog' },
    16: { label: 'A2', type: 'analog' },
    17: { label: 'A3', type: 'analog' },
    18: { label: 'A4/SDA', type: 'comm' },
    19: { label: 'A5/SCL', type: 'comm' },
    20: { label: 'A6', type: 'analog' },
    21: { label: 'A7', type: 'analog' },
    22: { label: 'VIN', type: 'power' },
    23: { label: 'GND', type: 'ground' },
    24: { label: '5V', type: 'power' },
    25: { label: '3.3V', type: 'power' },
    90: { label: 'BAT+', type: 'power' },
    91: { label: 'BAT-', type: 'ground' },
};

export function getWireColor(comp: CircuitComponent): string {
    const t = comp.type;
    if (t === 'BATTERY_9V' || t === 'BATTERY_AA' || t === 'SOLAR') return WIRE_COLORS.power;
    if (t.includes('SENSOR') || t === 'DHT11' || t === 'DHT22' || t === 'ULTRASONIC' || t === 'LIGHT_SENSOR' || t === 'MOTION') return WIRE_COLORS.signal;
    return WIRE_COLORS.default;
}

export function getPinTypeLabel(pin: number): string {
    const info = PIN_INFO[pin];
    if (info) return info.label;
    if (pin >= 90) return `PIN ${pin}`;
    return `PIN ${pin}`;
}

export function getPinTypeColor(type: string): string {
    switch (type) {
        case 'power': return '#ef4444';
        case 'ground': return '#1e293b';
        case 'pwm': return '#a855f7';
        case 'analog': return '#22c55e';
        case 'comm': return '#06b6d4';
        default: return '#64748b';
    }
}

export function isMicrocontroller(type: string): boolean {
    return type.includes('ARDUINO') || type.includes('ESP') || type.includes('RASPBERRY_PI') || type === 'MICROBIT' || type === 'NODEMCU';
}
