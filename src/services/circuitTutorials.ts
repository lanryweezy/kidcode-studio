// ============================================================
// Interactive Circuit Tutorial System
// Guided lessons with real physics explanations, step validation,
// progressive difficulty, and hands-on learning
// ============================================================

import { CircuitComponent, Wire } from '../types';

// === TUTORIAL TYPES ===

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  icon: string;
  estimatedTime: string;
  prerequisites: string[];
  steps: TutorialStep[];
  finalCircuit: { components: CircuitComponent[]; wires: Wire[] };
}

export interface TutorialStep {
  id: string;
  instruction: string;
  explanation: string;
  physics: string;
  action: StepAction;
  validation: StepValidation;
  hints: string[];
  funFact?: string;
}

export interface StepAction {
  type: 'place_component' | 'connect_wire' | 'set_property' | 'run_code' | 'observe' | 'quiz';
  target?: string;
  value?: string | number | boolean;
  componentType?: string;
  fromComponent?: string;
  toComponent?: string;
}

export interface StepValidation {
  type: 'component_exists' | 'wire_exists' | 'property_set' | 'code_runs' | 'always_pass';
  check: (components: CircuitComponent[], wires: Wire[]) => boolean;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: number;
  completedAt?: number;
  score: number;
}

// === TUTORIAL DATABASE ===

export const TUTORIALS: Tutorial[] = [
  // === BEGINNER TUTORIALS ===
  {
    id: 'led-basics',
    title: 'LED Basics',
    description: 'Learn how to light up an LED with a resistor',
    difficulty: 'beginner',
    category: 'Getting Started',
    icon: '💡',
    estimatedTime: '5 min',
    prerequisites: [],
    steps: [
      {
        id: 'step-1',
        instruction: 'Place an Arduino Uno on the board',
        explanation: 'The Arduino Uno is our microcontroller. It has 14 digital pins and 6 analog inputs.',
        physics: 'Microcontrollers operate at 5V logic. They can source up to 40mA per pin, which is enough for LEDs but not motors.',
        action: { type: 'place_component', componentType: 'ARDUINO_UNO' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'ARDUINO_UNO') },
        hints: ['Drag the Arduino Uno from the components panel to the board'],
        funFact: 'The Arduino Uno uses an ATmega328P chip that runs at 16MHz!',
      },
      {
        id: 'step-2',
        instruction: 'Place a Red LED on the board',
        explanation: 'LEDs (Light Emitting Diodes) convert electrical energy into light. They only work in one direction!',
        physics: 'LEDs have a "forward voltage" — the minimum voltage needed to light them. Red LEDs need about 1.8V.',
        action: { type: 'place_component', componentType: 'LED_RED' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'LED_RED') },
        hints: ['Find the LED in the Outputs section'],
        funFact: 'The first visible LED was red, invented in 1962 by Nick Holonyak!',
      },
      {
        id: 'step-3',
        instruction: 'Place a 220Ω resistor between the Arduino and LED',
        explanation: 'Resistors limit current flow. Without one, too much current will burn out the LED!',
        physics: 'Ohm\'s Law: V = I × R. With 5V source and 220Ω resistor: I = 5V / 220Ω = 22.7mA. This is safe for the LED (max 20-30mA).',
        action: { type: 'place_component', componentType: 'RESISTOR' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'RESISTOR') },
        hints: ['Resistors are in the Components section', 'Set the resistance to 220Ω in the property editor'],
        funFact: 'Resistor color bands: Red-Red-Brown = 220Ω. The gold band means ±5% tolerance.',
      },
      {
        id: 'step-4',
        instruction: 'Wire: Arduino D13 → Resistor → LED → GND',
        explanation: 'Current flows from the Arduino pin, through the resistor (which limits it), through the LED (which lights up), and back to ground.',
        physics: 'In a complete circuit, current flows from + to -. The resistor drops the excess voltage (5V - 1.8V = 3.2V across the resistor).',
        action: { type: 'connect_wire', fromComponent: 'ARDUINO_UNO', toComponent: 'LED_RED' },
        validation: { type: 'wire_exists', check: (c, w) => w.length > 0 },
        hints: ['Click WIRE mode, then click the Arduino, then click the LED'],
        funFact: 'Current actually flows from - to + (electron flow), but we use "conventional current" (+ to -) by convention.',
      },
      {
        id: 'step-5',
        instruction: 'Run the code and watch the LED blink!',
        explanation: 'The code turns the LED on for 500ms, then off for 500ms, creating a blink effect.',
        physics: 'The Arduino sets pin 13 to HIGH (5V) for 500ms, then LOW (0V) for 500ms. The LED responds instantly to voltage changes.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Press the Play button to run your code'],
        funFact: 'Pin 13 is connected to the built-in LED on the Arduino board — you can blink it without any external components!',
      },
    ],
    finalCircuit: {
      components: [
        { id: 'tut-1', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
        { id: 'tut-2', type: 'LED_RED', x: 100, y: 100, pin: 0, rotation: 0 },
        { id: 'tut-3', type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
      ],
      wires: [
        { id: 'tw1', fromComponentId: 'tut-1', fromPin: 13, toComponentId: 'tut-3', toPin: 0, color: '#ef4444' },
        { id: 'tw2', fromComponentId: 'tut-3', fromPin: 0, toComponentId: 'tut-2', toPin: 0, color: '#fbbf24' },
      ],
    },
  },
  {
    id: 'traffic-light',
    title: 'Traffic Light',
    description: 'Build a traffic light with 3 LEDs cycling through colors',
    difficulty: 'beginner',
    category: 'Getting Started',
    icon: '🚦',
    estimatedTime: '10 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'tl-1',
        instruction: 'Place Arduino, Red LED, Yellow LED, and Green LED',
        explanation: 'A traffic light uses 3 LEDs to signal stop, caution, and go.',
        physics: 'Each LED needs its own current-limiting resistor. Different colors have different forward voltages.',
        action: { type: 'place_component', componentType: 'ARDUINO_UNO' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'ARDUINO_UNO') },
        hints: ['Place the Arduino first, then add the 3 LEDs'],
      },
      {
        id: 'tl-2',
        instruction: 'Add 3 resistors (220Ω each) for the LEDs',
        explanation: 'Each LED needs its own resistor to limit current. Without resistors, LEDs will burn out!',
        physics: 'Red: 1.8V, Yellow: 2.0V, Green: 2.2V forward voltage. With 5V source and 220Ω: I = (5-2)/220 ≈ 14mA per LED.',
        action: { type: 'place_component', componentType: 'RESISTOR' },
        validation: { type: 'component_exists', check: (c) => c.filter(comp => comp.type === 'RESISTOR').length >= 3 },
        hints: ['You need 3 resistors total, one for each LED'],
      },
      {
        id: 'tl-3',
        instruction: 'Wire: D2→Red, D3→Yellow, D4→Green (each through its resistor)',
        explanation: 'Each LED connects to a different digital pin so we can control them independently.',
        physics: 'Using separate pins allows the Arduino to turn each LED on/off independently, creating the traffic light sequence.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 3 },
        hints: ['Wire each LED through its resistor to a different pin'],
      },
      {
        id: 'tl-4',
        instruction: 'Code: Red ON 3s → Yellow ON 1s → Green ON 3s → Repeat',
        explanation: 'This mimics a real traffic light timing cycle.',
        physics: 'The timing is controlled by the delay() function. Real traffic lights use similar timing but with sensors.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use "set pin HIGH", "wait 3000ms", "set pin LOW" for each LED'],
        funFact: 'The first traffic light was installed in London in 1868 — it was gas-powered!',
      },
    ],
    finalCircuit: {
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
        { id: 'tw1', fromComponentId: 'tl-mc', fromPin: 2, toComponentId: 'tl-r1', toPin: 0, color: '#ef4444' },
        { id: 'tw2', fromComponentId: 'tl-r1', fromPin: 0, toComponentId: 'tl-red', toPin: 0, color: '#fbbf24' },
        { id: 'tw3', fromComponentId: 'tl-mc', fromPin: 3, toComponentId: 'tl-r2', toPin: 0, color: '#ef4444' },
        { id: 'tw4', fromComponentId: 'tl-r2', fromPin: 0, toComponentId: 'tl-yel', toPin: 0, color: '#fbbf24' },
        { id: 'tw5', fromComponentId: 'tl-mc', fromPin: 4, toComponentId: 'tl-r3', toPin: 0, color: '#ef4444' },
        { id: 'tw6', fromComponentId: 'tl-r3', fromPin: 0, toComponentId: 'tl-grn', toPin: 0, color: '#fbbf24' },
      ],
    },
  },
  {
    id: 'button-controlled-led',
    title: 'Button-Controlled LED',
    description: 'Turn an LED on/off with a push button',
    difficulty: 'beginner',
    category: 'Getting Started',
    icon: '🔘',
    estimatedTime: '8 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'bcl-1',
        instruction: 'Place Arduino, LED, resistor, and push button',
        explanation: 'We\'ll use a button as input to control the LED output.',
        physics: 'Buttons are simple switches — when pressed, they connect two pins, allowing current to flow.',
        action: { type: 'place_component', componentType: 'BUTTON' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'BUTTON') },
        hints: ['Place all 4 components on the board'],
      },
      {
        id: 'bcl-2',
        instruction: 'Wire: Button → D4, LED → D13 (through resistor)',
        explanation: 'The button is an INPUT (reads its state), the LED is an OUTPUT (we control it).',
        physics: 'Digital input reads HIGH (5V) or LOW (0V). When button is pressed, pin reads HIGH.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 2 },
        hints: ['Button to D4, LED (with resistor) to D13'],
      },
      {
        id: 'bcl-3',
        instruction: 'Code: Read button state, turn LED on if pressed',
        explanation: 'We read the button pin and use an if-statement to control the LED.',
        physics: 'The Arduino reads the button 1000 times per second (in the loop). When pressed, it sets the LED pin HIGH.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "read digital pin 4 into btnState", "if btnState = 1, set pin 13 HIGH"'],
        funFact: 'Real buttons "bounce" — they make rapid on/off signals when pressed. We need "debouncing" in code!',
      },
    ],
    finalCircuit: {
      components: [
        { id: 'bcl-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
        { id: 'bcl-led', type: 'LED_RED', x: 100, y: 100, pin: 0, rotation: 0 },
        { id: 'bcl-res', type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
        { id: 'bcl-btn', type: 'BUTTON', x: 100, y: 250, pin: 4, rotation: 0 },
      ],
      wires: [
        { id: 'tw1', fromComponentId: 'bcl-mc', fromPin: 13, toComponentId: 'bcl-res', toPin: 0, color: '#ef4444' },
        { id: 'tw2', fromComponentId: 'bcl-res', fromPin: 0, toComponentId: 'bcl-led', toPin: 0, color: '#fbbf24' },
        { id: 'tw3', fromComponentId: 'bcl-mc', fromPin: 4, toComponentId: 'bcl-btn', toPin: 0, color: '#3b82f6' },
      ],
    },
  },
  // === INTERMEDIATE TUTORIALS ===
  {
    id: 'pot-controlled-led',
    title: 'Potentiometer-Controlled LED',
    description: 'Control LED brightness with a potentiometer',
    difficulty: 'beginner',
    category: 'Getting Started',
    icon: '🎚️',
    estimatedTime: '8 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'pcl-1',
        instruction: 'Place Arduino, LED, resistor, and potentiometer',
        explanation: 'We\'ll use a potentiometer to control LED brightness through analog input.',
        physics: 'Potentiometers are variable resistors that output a voltage between 0-5V based on knob position.',
        action: { type: 'place_component', componentType: 'POTENTIOMETER' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'POTENTIOMETER') },
        hints: ['Find the potentiometer in the Inputs section'],
      },
      {
        id: 'pcl-2',
        instruction: 'Wire: Potentiometer → A0, LED → D9 (PWM)',
        explanation: 'The potentiometer connects to an analog input, the LED to a PWM output for brightness control.',
        physics: 'Analog inputs read 0-5V as 0-1023. PWM pins can output variable brightness using pulse width modulation.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 2 },
        hints: ['Potentiometer signal pin to A0, LED (with resistor) to D9'],
      },
      {
        id: 'pcl-3',
        instruction: 'Code: Read pot value, map to LED brightness',
        explanation: 'We read the potentiometer value (0-1023) and map it to PWM brightness (0-255).',
        physics: 'The map() function scales values: brightness = potValue / 4. Turning the knob changes LED brightness in real-time.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "read analog pin A0 into potValue", "set LED brightness to potValue / 4"'],
        funFact: 'This is how volume knobs work in audio equipment — they\'re potentiometers!',
      },
    ],
    finalCircuit: {
      components: [
        { id: 'pcl-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
        { id: 'pcl-led', type: 'LED_RED', x: 100, y: 100, pin: 9, rotation: 0 },
        { id: 'pcl-res', type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
        { id: 'pcl-pot', type: 'POTENTIOMETER', x: 100, y: 250, pin: 97, rotation: 0 },
      ],
      wires: [
        { id: 'pcw1', fromComponentId: 'pcl-mc', fromPin: 9, toComponentId: 'pcl-res', toPin: 0, color: '#ef4444' },
        { id: 'pcw2', fromComponentId: 'pcl-res', fromPin: 0, toComponentId: 'pcl-led', toPin: 0, color: '#fbbf24' },
        { id: 'pcw3', fromComponentId: 'pcl-mc', fromPin: 14, toComponentId: 'pcl-pot', toPin: 97, color: '#3b82f6' },
      ],
    },
  },
  {
    id: 'temperature-alarm',
    title: 'Temperature Sensor Reading',
    description: 'Read temperature and humidity from a DHT11 sensor',
    difficulty: 'intermediate',
    category: 'Sensors',
    icon: '🌡️',
    estimatedTime: '15 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'ta-1',
        instruction: 'Place Arduino, DHT11 sensor, buzzer, and LED',
        explanation: 'We\'ll read temperature and trigger an alarm when it\'s too hot.',
        physics: 'The DHT11 measures temperature (0-50°C) and humidity (20-90%). It uses a single-wire digital protocol.',
        action: { type: 'place_component', componentType: 'DHT11' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'DHT11') },
        hints: ['DHT11 is in the Sensors section'],
      },
      {
        id: 'ta-2',
        instruction: 'Wire: DHT11 → D2, Buzzer → D8, LED → D13',
        explanation: 'The sensor reads data, the buzzer sounds the alarm, the LED provides visual warning.',
        physics: 'DHT11 sends digital data on a single wire. The buzzer needs a square wave (PWM) to make sound.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 2 },
        hints: ['Connect sensor data pin to D2, buzzer to D8'],
      },
      {
        id: 'ta-3',
        instruction: 'Code: Read temp, if > 30°C sound alarm + flash LED',
        explanation: 'We compare the temperature reading to a threshold and trigger outputs.',
        physics: 'At 30°C, the DHT11 outputs a digital signal representing the temperature. The Arduino decodes this and compares to our threshold.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "read temperature from DHT11", "if temp > 30, set buzzer HIGH, blink LED"'],
        funFact: 'The DHT11 uses a capacitive humidity sensor and a thermistor to measure air properties!',
      },
      {
        id: 'ta-4',
        instruction: 'Display temperature on Serial Monitor',
        explanation: 'We print the temperature and humidity values to see real-time readings.',
        physics: 'Serial communication sends data at 9600 bits per second. Each character takes about 1ms to transmit.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "Serial.print temperature", "Serial.print humidity"'],
        funFact: 'The DHT11 has a sampling rate of 1Hz — it can only be read once per second!',
      },
    ],
    finalCircuit: {
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
    },
  },
  {
    id: 'servo-sweep',
    title: 'Servo Sweep',
    description: 'Make a servo motor sweep back and forth',
    difficulty: 'intermediate',
    category: 'Motors',
    icon: '🔄',
    estimatedTime: '10 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'ss-1',
        instruction: 'Place Arduino and Servo motor',
        explanation: 'Servos are precise motors that can rotate to specific angles (0-180°).',
        physics: 'Servos use PWM signals: 1ms pulse = 0°, 1.5ms = 90°, 2ms = 180°. The servo has an internal controller that maintains position.',
        action: { type: 'place_component', componentType: 'SERVO' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'SERVO') },
        hints: ['Servos are in the Outputs section'],
      },
      {
        id: 'ss-2',
        instruction: 'Wire: Servo signal → D11',
        explanation: 'Servos need a PWM pin for precise angle control.',
        physics: 'PWM (Pulse Width Modulation) rapidly switches a pin ON/OFF. The ratio of ON time controls the servo angle.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length > 0 },
        hints: ['Connect the servo signal wire to pin D11 (PWM capable)'],
      },
      {
        id: 'ss-3',
        instruction: 'Code: Sweep servo from 0° to 180° and back',
        explanation: 'The servo smoothly moves from one angle to another.',
        physics: 'Each step of 1° takes about 15ms. Full sweep (0-180°) takes about 2.7 seconds.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "set servo pin 11 to angle", "wait 15ms"'],
        funFact: 'SG90 servos can rotate 180° and hold position. Continuous rotation servos can spin forever!',
      },
    ],
    finalCircuit: {
      components: [
        { id: 'ss-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
        { id: 'ss-srv', type: 'SERVO', x: 100, y: 150, pin: 11, rotation: 0 },
      ],
      wires: [
        { id: 'ssw1', fromComponentId: 'ss-mc', fromPin: 11, toComponentId: 'ss-srv', toPin: 11, color: '#fbbf24' },
      ],
    },
  },
  {
    id: 'ultrasonic-ranger',
    title: 'Distance Meter',
    description: 'Measure distance using an ultrasonic sensor',
    difficulty: 'intermediate',
    category: 'Sensors',
    icon: '📏',
    estimatedTime: '12 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'ur-1',
        instruction: 'Place Arduino, HC-SR04 ultrasonic sensor, and LCD',
        explanation: 'The ultrasonic sensor measures distance by sending sound waves and timing the echo.',
        physics: 'Sound travels at 343 m/s. The sensor sends a 10µs pulse, measures the echo time, and calculates: distance = (time × 343) / 2.',
        action: { type: 'place_component', componentType: 'ULTRASONIC' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'ULTRASONIC') },
        hints: ['HC-SR04 has 4 pins: VCC, Trig, Echo, GND'],
      },
      {
        id: 'ur-2',
        instruction: 'Wire: Ultrasonic Trig→D2, Echo→D3, LCD→I2C',
        explanation: 'The ultrasonic sensor uses one pin to trigger the pulse and another to read the echo.',
        physics: 'Trig pin sends a 10µs HIGH pulse to start measurement. Echo pin goes HIGH for the duration of the echo.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 2 },
        hints: ['Trig to D2, Echo to D3, LCD via I2C (SDA→A4, SCL→A5)'],
      },
      {
        id: 'ur-3',
        instruction: 'Code: Measure distance and display on LCD',
        explanation: 'We trigger the sensor, measure echo time, calculate distance, and show it.',
        physics: 'Distance (cm) = (Echo pulse time in µs × 0.0343) / 2. Sound speed = 343 m/s = 0.0343 cm/µs.',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "read distance from ultrasonic", "LCD print distance"'],
        funFact: 'Bats use the same principle (echolocation) to navigate in the dark!',
      },
    ],
    finalCircuit: {
      components: [
        { id: 'ur-mc', type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
        { id: 'ur-sonic', type: 'ULTRASONIC', x: 100, y: 100, pin: 92, rotation: 0 },
        { id: 'ur-lcd', type: 'LCD', x: 100, y: 250, pin: 95, rotation: 0 },
      ],
      wires: [
        { id: 'urw1', fromComponentId: 'ur-mc', fromPin: 2, toComponentId: 'ur-sonic', toPin: 92, color: '#3b82f6' },
        { id: 'urw2', fromComponentId: 'ur-mc', fromPin: 4, toComponentId: 'ur-lcd', toPin: 95, color: '#22c55e' },
      ],
    },
  },
  {
    id: 'rgb-color-mixer',
    title: 'RGB Color Mixer',
    description: 'Mix colors using 3 potentiometers and an RGB LED',
    difficulty: 'intermediate',
    category: 'Interactive',
    icon: '🎨',
    estimatedTime: '15 min',
    prerequisites: ['led-basics'],
    steps: [
      {
        id: 'rc-1',
        instruction: 'Place Arduino, RGB LED, and 3 potentiometers',
        explanation: 'Potentiometers are variable resistors — turning the knob changes the resistance.',
        physics: 'A potentiometer has 3 pins: power, signal (wiper), and ground. Turning the knob moves the wiper between power and ground, creating a variable voltage.',
        action: { type: 'place_component', componentType: 'POTENTIOMETER' },
        validation: { type: 'component_exists', check: (c) => c.filter(comp => comp.type === 'POTENTIOMETER').length >= 3 },
        hints: ['Place 3 potentiometers for R, G, and B controls'],
      },
      {
        id: 'rc-2',
        instruction: 'Wire: Pots→A0,A1,A2, RGB→D10',
        explanation: 'Potentiometers connect to analog inputs (A0-A5). The RGB LED needs a PWM pin.',
        physics: 'Analog inputs read voltages 0-5V as values 0-1023. PWM outputs create average voltage by switching fast.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 3 },
        hints: ['Each pot to a different analog pin, RGB LED to D10'],
      },
      {
        id: 'rc-3',
        instruction: 'Code: Read each pot, set RGB values',
        explanation: 'We read each potentiometer (0-1023) and map it to an RGB color channel (0-255).',
        physics: 'The RGB LED mixes light by combining red, green, and blue at different intensities. Any color can be made from these three!',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Read each pot: "read analog pin A0 into redVal", then set RGB color'],
        funFact: 'Your phone screen creates millions of colors using the same RGB mixing principle!',
      },
    ],
    finalCircuit: {
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
    },
  },
  // === ADVANCED TUTORIALS ===
  {
    id: 'transistor-switch',
    title: 'Transistor Motor Switch',
    description: 'Use a transistor to switch a DC motor with Arduino',
    difficulty: 'advanced',
    category: 'Power',
    icon: '🔧',
    estimatedTime: '20 min',
    prerequisites: ['led-basics', 'servo-sweep'],
    steps: [
      {
        id: 'ts-1',
        instruction: 'Place Arduino, NPN transistor, DC motor, 1kΩ resistor, and 9V battery',
        explanation: 'Arduino can\'t drive a motor directly (needs too much current). A transistor acts as a current amplifier.',
        physics: 'NPN transistor: small base current controls large collector current. Ic = β × Ib. With β=200 and Ib=5mA, we can switch 1A!',
        action: { type: 'place_component', componentType: 'TRANSISTOR_NPN' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'TRANSISTOR_NPN') },
        hints: ['Place all 5 components on the board'],
      },
      {
        id: 'ts-2',
        instruction: 'Wire: D6→1kΩ→Base, Motor→Collector, Emitter→GND',
        explanation: 'The 1kΩ resistor limits base current. Motor connects between +9V and collector.',
        physics: 'Base resistor: Ib = (5V - 0.7V) / 1kΩ = 4.3mA. This is safe and sufficient to saturate the transistor.',
        action: { type: 'connect_wire' },
        validation: { type: 'wire_exists', check: (c, w) => w.length >= 3 },
        hints: ['Arduino → Resistor → Transistor Base, Motor → Collector, Emitter → GND'],
      },
      {
        id: 'ts-3',
        instruction: 'Add a flyback diode across the motor',
        explanation: 'Motors generate voltage spikes when turned off (back-EMF). A diode protects the transistor.',
        physics: 'When a motor stops, its magnetic field collapses and generates a reverse voltage spike (could be 100V+!). The diode clamps this spike.',
        action: { type: 'place_component', componentType: 'DIODE' },
        validation: { type: 'component_exists', check: (c) => c.some(comp => comp.type === 'DIODE') },
        hints: ['Place the diode across the motor terminals (reverse biased)'],
        funFact: 'This is called a "flyback diode" or "freewheeling diode" — essential for any inductive load!',
      },
      {
        id: 'ts-4',
        instruction: 'Code: Write HIGH to D6 to turn motor ON',
        explanation: 'Setting D6 HIGH turns on the transistor, which allows current to flow through the motor.',
        physics: 'Arduino D6 → Resistor → Transistor Base → Transistor turns ON → Collector-Emitter conducts → Motor runs!',
        action: { type: 'run_code' },
        validation: { type: 'always_pass', check: () => true },
        hints: ['Use: "set pin 6 HIGH" to turn motor on, "set pin 6 LOW" to turn off'],
        funFact: 'This same circuit is used in robotics, cars, and industrial machines to control high-power loads!',
      },
    ],
    finalCircuit: {
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
    },
  },
];

// === TUTORIAL MANAGER ===

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find(t => t.id === id);
}

export function getTutorialsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Tutorial[] {
  return TUTORIALS.filter(t => t.difficulty === difficulty);
}

export function getTutorialsByCategory(category: string): Tutorial[] {
  return TUTORIALS.filter(t => t.category === category);
}

export function validateTutorialStep(
  step: TutorialStep,
  components: CircuitComponent[],
  wires: Wire[]
): boolean {
  return step.validation.check(components, wires);
}

export function getTutorialProgress(tutorialId: string): TutorialProgress | null {
  const stored = localStorage.getItem(`tutorial_${tutorialId}`);
  return stored ? JSON.parse(stored) : null;
}

export function saveTutorialProgress(progress: TutorialProgress): void {
  localStorage.setItem(`tutorial_${progress.tutorialId}`, JSON.stringify(progress));
}

export function completeTutorial(tutorialId: string): void {
  const progress = getTutorialProgress(tutorialId);
  if (progress) {
    progress.completedAt = Date.now();
    progress.score = 100;
    saveTutorialProgress(progress);
  }
}

export function getCompletedTutorials(): string[] {
  const completed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tutorial_')) {
      const progress = getTutorialProgress(key.replace('tutorial_', ''));
      if (progress?.completedAt) completed.push(progress.tutorialId);
    }
  }
  return completed;
}

export function getNextTutorial(): Tutorial | null {
  const completed = getCompletedTutorials();
  for (const tutorial of TUTORIALS) {
    if (!completed.includes(tutorial.id)) {
      const prereqsMet = tutorial.prerequisites.every(p => completed.includes(p));
      if (prereqsMet) return tutorial;
    }
  }
  return null;
}
