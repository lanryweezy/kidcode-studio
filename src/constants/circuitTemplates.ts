import { CircuitComponent, Wire } from '../types';

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  icon: string;
  components: CircuitComponent[];
  wires: Wire[];
  tutorial: string[];
}

export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  {
    id: 'led-blink',
    name: 'LED Blink',
    description: 'Blink an LED on and off using digital output',
    difficulty: 'beginner',
    category: 'Basics',
    icon: '💡',
    components: [
      { id: 't1-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 't1-led', type: 'LED_RED', x: 100, y: 100, pin: 0, rotation: 0 },
      { id: 't1-res', type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'tw1', fromComponentId: 't1-mc', fromPin: 13, toComponentId: 't1-res', toPin: 0, color: '#ef4444' },
      { id: 'tw2', fromComponentId: 't1-res', fromPin: 0, toComponentId: 't1-led', toPin: 0, color: '#fbbf24' },
    ],
    tutorial: [
      'Add an Arduino Uno to the board',
      'Connect a Red LED to pin 13',
      'Add a 220Ω resistor in series',
      'Wire: Arduino D13 → Resistor → LED anode → GND',
      'Use blocks: "set pin 13 HIGH", "wait 500ms", "set pin 13 LOW", "wait 500ms"',
    ],
  },
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    description: '3 LEDs cycle like a real traffic light',
    difficulty: 'beginner',
    category: 'Basics',
    icon: '🚦',
    components: [
      { id: 'tl-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'tl-red', type: 'LED_RED', x: 80, y: 60, pin: 0, rotation: 0 },
      { id: 'tl-yel', type: 'LED_YELLOW', x: 80, y: 120, pin: 0, rotation: 0 },
      { id: 'tl-grn', type: 'LED_GREEN', x: 80, y: 180, pin: 0, rotation: 0 },
      { id: 'tl-r1', type: 'RESISTOR', x: 180, y: 60, pin: 0, rotation: 0, resistance: 220 },
      { id: 'tl-r2', type: 'RESISTOR', x: 180, y: 120, pin: 0, rotation: 0, resistance: 220 },
      { id: 'tl-r3', type: 'RESISTOR', x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'tlw1', fromComponentId: 'tl-mc', fromPin: 2, toComponentId: 'tl-r1', toPin: 0, color: '#ef4444' },
      { id: 'tlw2', fromComponentId: 'tl-r1', fromPin: 0, toComponentId: 'tl-red', toPin: 0, color: '#fbbf24' },
      { id: 'tlw3', fromComponentId: 'tl-mc', fromPin: 3, toComponentId: 'tl-r2', toPin: 0, color: '#ef4444' },
      { id: 'tlw4', fromComponentId: 'tl-r2', fromPin: 0, toComponentId: 'tl-yel', toPin: 0, color: '#fbbf24' },
      { id: 'tlw5', fromComponentId: 'tl-mc', fromPin: 4, toComponentId: 'tl-r3', toPin: 0, color: '#ef4444' },
      { id: 'tlw6', fromComponentId: 'tl-r3', fromPin: 0, toComponentId: 'tl-grn', toPin: 0, color: '#fbbf24' },
    ],
    tutorial: [
      'Add Arduino, 3 LEDs (Red, Yellow, Green), and 3 resistors',
      'Wire each LED through a 220Ω resistor',
      'Connect: D2→Red, D3→Yellow, D4→Green',
      'Program: Red ON 3s, Yellow ON 1s, Green ON 3s',
      'Loop forever!',
    ],
  },
  {
    id: 'temp-alarm',
    name: 'Temperature Alarm',
    description: 'Buzzer sounds when temperature exceeds threshold',
    difficulty: 'intermediate',
    category: 'Sensors',
    icon: '🌡️',
    components: [
      { id: 'ta-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ta-dht', type: 'DHT11', x: 80, y: 80, pin: 28, rotation: 0 },
      { id: 'ta-buz', type: 'BUZZER', x: 80, y: 180, pin: 8, rotation: 0 },
      { id: 'ta-led', type: 'LED_RED', x: 180, y: 80, pin: 0, rotation: 0 },
      { id: 'ta-res', type: 'RESISTOR', x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'taw1', fromComponentId: 'ta-mc', fromPin: 2, toComponentId: 'ta-dht', toPin: 28, color: '#3b82f6' },
      { id: 'taw2', fromComponentId: 'ta-mc', fromPin: 8, toComponentId: 'ta-buz', toPin: 8, color: '#fbbf24' },
      { id: 'taw3', fromComponentId: 'ta-mc', fromPin: 13, toComponentId: 'ta-res', toPin: 0, color: '#ef4444' },
      { id: 'taw4', fromComponentId: 'ta-res', fromPin: 0, toComponentId: 'ta-led', toPin: 0, color: '#fbbf24' },
    ],
    tutorial: [
      'Add Arduino, DHT11 sensor, buzzer, LED, resistor',
      'Wire DHT11 data pin to Arduino D2',
      'Wire buzzer to D8, LED through resistor to D13',
      'Read temperature: if > 30°C, buzz + LED on',
      'Use variables to store threshold',
    ],
  },
  {
    id: 'night-light',
    name: 'Night Light',
    description: 'LED turns on when it gets dark (light sensor)',
    difficulty: 'beginner',
    category: 'Sensors',
    icon: '🌙',
    components: [
      { id: 'nl-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'nl-sen', type: 'LIGHT_SENSOR', x: 80, y: 100, pin: 5, rotation: 0 },
      { id: 'nl-led', type: 'LED_WHITE', x: 80, y: 200, pin: 0, rotation: 0 },
      { id: 'nl-res', type: 'RESISTOR', x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 },
    ],
    wires: [
      { id: 'nlw1', fromComponentId: 'nl-mc', fromPin: 5, toComponentId: 'nl-sen', toPin: 5, color: '#3b82f6' },
      { id: 'nlw2', fromComponentId: 'nl-mc', fromPin: 13, toComponentId: 'nl-res', toPin: 0, color: '#ef4444' },
      { id: 'nlw3', fromComponentId: 'nl-res', fromPin: 0, toComponentId: 'nl-led', toPin: 0, color: '#fbbf24' },
    ],
    tutorial: [
      'Add Arduino, light sensor (LDR), white LED, resistor',
      'Wire LDR to analog pin A5',
      'Wire LED through 220Ω to D13',
      'Read analog value: if < 200 (dark), turn LED ON',
      'Add a delay to prevent flickering',
    ],
  },
  {
    id: 'servo-sweep',
    name: 'Servo Sweep',
    description: 'Servo motor sweeps back and forth',
    difficulty: 'beginner',
    category: 'Motors',
    icon: '🔄',
    components: [
      { id: 'ss-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ss-srv', type: 'SERVO', x: 100, y: 150, pin: 11, rotation: 0 },
    ],
    wires: [
      { id: 'ssw1', fromComponentId: 'ss-mc', fromPin: 11, toComponentId: 'ss-srv', toPin: 11, color: '#fbbf24' },
    ],
    tutorial: [
      'Add Arduino and Servo motor',
      'Wire servo signal to PWM pin D11',
      'Use blocks: "set servo pin 11 to 0°", "wait 20ms"',
      'Sweep: 0→180→0 in steps of 1°',
      'Add 15ms delay between steps for smooth motion',
    ],
  },
  {
    id: 'ultrasonic-ranger',
    name: 'Distance Meter',
    description: 'Ultrasonic sensor measures distance in cm',
    difficulty: 'intermediate',
    category: 'Sensors',
    icon: '📏',
    components: [
      { id: 'ur-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ur-sonic', type: 'ULTRASONIC', x: 100, y: 100, pin: 92, rotation: 0 },
      { id: 'ur-lcd', type: 'LCD', x: 100, y: 250, pin: 95, rotation: 0 },
    ],
    wires: [
      { id: 'urw1', fromComponentId: 'ur-mc', fromPin: 2, toComponentId: 'ur-sonic', toPin: 92, color: '#3b82f6' },
      { id: 'urw2', fromComponentId: 'ur-mc', fromPin: 4, toComponentId: 'ur-lcd', toPin: 95, color: '#22c55e' },
    ],
    tutorial: [
      'Add Arduino, HC-SR04 ultrasonic sensor, LCD screen',
      'Wire Trig→D2, Echo→D3 (or use combined pin)',
      'Wire LCD via I2C (SDA→A4, SCL→A5)',
      'Measure: pulse trig 10µs, read echo pulse width',
      'Display distance in cm on LCD',
    ],
  },
  {
    id: 'rgb-color-mixer',
    name: 'RGB Color Mixer',
    description: '3 potentiometers control RGB LED color',
    difficulty: 'intermediate',
    category: 'Interactive',
    icon: '🎨',
    components: [
      { id: 'rc-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'rc-rgb', type: 'RGB_LED', x: 100, y: 100, pin: 10, rotation: 0 },
      { id: 'rc-p1', type: 'POTENTIOMETER', x: 80, y: 250, pin: 97, rotation: 0 },
      { id: 'rc-p2', type: 'POTENTIOMETER', x: 180, y: 250, pin: 97, rotation: 0 },
      { id: 'rc-p3', type: 'POTENTIOMETER', x: 280, y: 250, pin: 97, rotation: 0 },
    ],
    wires: [
      { id: 'rcw1', fromComponentId: 'rc-mc', fromPin: 10, toComponentId: 'rc-rgb', toPin: 10, color: '#fbbf24' },
      { id: 'rcw2', fromComponentId: 'rc-mc', fromPin: 14, toComponentId: 'rc-p1', toPin: 97, color: '#ef4444' },
      { id: 'rcw3', fromComponentId: 'rc-mc', fromPin: 15, toComponentId: 'rc-p2', toPin: 97, color: '#22c55e' },
      { id: 'rcw4', fromComponentId: 'rc-mc', fromPin: 16, toComponentId: 'rc-p3', toPin: 97, color: '#3b82f6' },
    ],
    tutorial: [
      'Add Arduino, RGB LED, 3 potentiometers',
      'Wire pots to analog pins A0, A1, A2',
      'Wire RGB LED common pin to GND',
      'Read each pot: map 0-1023 to 0-255',
      'Set RGB values: analogWrite(R, val), etc.',
    ],
  },
  {
    id: 'transistor-switch',
    name: 'Transistor Motor Switch',
    description: 'Use NPN transistor to switch a DC motor with Arduino',
    difficulty: 'advanced',
    category: 'Power',
    icon: '🔧',
    components: [
      { id: 'ts-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
      { id: 'ts-trn', type: 'TRANSISTOR_NPN', x: 150, y: 150, pin: 0, rotation: 0 },
      { id: 'ts-mot', type: 'MOTOR_DC', x: 80, y: 80, pin: 6, rotation: 0 },
      { id: 'ts-res', type: 'RESISTOR', x: 220, y: 150, pin: 0, rotation: 0, resistance: 1000 },
      { id: 'ts-bat', type: 'BATTERY_9V', x: 80, y: 250, pin: 90, rotation: 0 },
    ],
    wires: [
      { id: 'tsw1', fromComponentId: 'ts-mc', fromPin: 6, toComponentId: 'ts-res', toPin: 0, color: '#fbbf24' },
      { id: 'tsw2', fromComponentId: 'ts-res', fromPin: 0, toComponentId: 'ts-trn', toPin: 0, color: '#fbbf24' },
      { id: 'tsw3', fromComponentId: 'ts-bat', fromPin: 90, toComponentId: 'ts-mot', toPin: 6, color: '#ef4444' },
    ],
    tutorial: [
      'Add Arduino, NPN transistor (2N2222), DC motor, 1kΩ resistor, 9V battery',
      'Arduino D6 → 1kΩ resistor → Transistor Base',
      'Motor: 9V+ → Motor → Collector, Emitter → GND',
      'Arduino GND and Battery GND connected',
      'Write HIGH to D6 to turn motor ON',
      'Flyback diode recommended for production!',
    ],
  },
];
