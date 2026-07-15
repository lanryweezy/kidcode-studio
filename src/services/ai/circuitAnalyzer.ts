
// ============================================================
// Circuit Analysis - diagnosis, power calculations, recommendations
// ============================================================

import { CircuitComponent, Wire } from '../../types';
import { CircuitDesignResult } from './index';

// === COMPONENT KNOWLEDGE BASE ===

export const COMPONENT_KNOWLEDGE: Record<string, {
  description: string;
  pinCount: number;
  typicalUse: string[];
  voltage: number;
  current: number;
}> = {
  ARDUINO_UNO: { description: 'ATmega328P microcontroller', pinCount: 20, typicalUse: ['control', 'read sensors', 'drive outputs'], voltage: 5, current: 0.04 },
  LED_RED: { description: 'Red LED (1.8V forward)', pinCount: 2, typicalUse: ['indicator', 'light', 'status'], voltage: 1.8, current: 0.02 },
  LED_BLUE: { description: 'Blue LED (3.0V forward)', pinCount: 2, typicalUse: ['indicator', 'light'], voltage: 3.0, current: 0.02 },
  LED_GREEN: { description: 'Green LED (2.2V forward)', pinCount: 2, typicalUse: ['indicator', 'status'], voltage: 2.2, current: 0.02 },
  LED_YELLOW: { description: 'Yellow LED (2.0V forward)', pinCount: 2, typicalUse: ['indicator', 'warning'], voltage: 2.0, current: 0.02 },
  LED_ORANGE: { description: 'Orange LED (2.0V forward)', pinCount: 2, typicalUse: ['indicator'], voltage: 2.0, current: 0.02 },
  LED_WHITE: { description: 'White LED (3.2V forward)', pinCount: 2, typicalUse: ['light', 'flashlight'], voltage: 3.2, current: 0.02 },
  RGB_LED: { description: 'RGB LED (3 channels)', pinCount: 4, typicalUse: ['color mixing', 'mood light', 'indicator'], voltage: 2.0, current: 0.06 },
  BULB: { description: 'Incandescent bulb', pinCount: 2, typicalUse: ['light', 'indicator'], voltage: 2.5, current: 0.15 },
  BUZZER: { description: 'Piezo buzzer', pinCount: 2, typicalUse: ['alarm', 'beep', 'music'], voltage: 3.0, current: 0.03 },
  SPEAKER: { description: 'Speaker driver', pinCount: 2, typicalUse: ['music', 'voice', 'sound'], voltage: 2.0, current: 0.05 },
  MOTOR_DC: { description: 'DC motor', pinCount: 2, typicalUse: ['motion', 'fan', 'wheel'], voltage: 5.0, current: 0.2 },
  SERVO: { description: 'Servo motor (180°)', pinCount: 3, typicalUse: ['arm', 'pan', 'tilt', 'lock'], voltage: 5.0, current: 0.15 },
  FAN: { description: 'Cooling fan', pinCount: 2, typicalUse: ['cooling', 'ventilation'], voltage: 5.0, current: 0.1 },
  BUTTON: { description: 'Push button', pinCount: 2, typicalUse: ['input', 'trigger', 'control'], voltage: 5, current: 0.001 },
  BUTTON_TACTILE: { description: 'Tactile switch', pinCount: 2, typicalUse: ['input', 'trigger'], voltage: 5, current: 0.001 },
  POTENTIOMETER: { description: 'Rotary potentiometer', pinCount: 3, typicalUse: ['adjust', 'control', 'dimmer'], voltage: 5, current: 0.001 },
  SWITCH_TOGGLE: { description: 'Toggle switch', pinCount: 2, typicalUse: ['on/off', 'mode select'], voltage: 5, current: 0.01 },
  SWITCH_SLIDE: { description: 'Slide switch', pinCount: 2, typicalUse: ['on/off'], voltage: 5, current: 0.01 },
  ULTRASONIC: { description: 'HC-SR04 distance sensor', pinCount: 4, typicalUse: ['distance', 'obstacle', 'level'], voltage: 5, current: 0.015 },
  DHT11: { description: 'Temperature/humidity sensor', pinCount: 4, typicalUse: ['temperature', 'humidity', 'weather'], voltage: 5, current: 0.0025 },
  DHT22: { description: 'Precision temp/humidity', pinCount: 4, typicalUse: ['temperature', 'humidity', 'weather'], voltage: 5, current: 0.0015 },
  LIGHT_SENSOR: { description: 'Photoresistor (LDR)', pinCount: 2, typicalUse: ['light', 'dark detection', 'brightness'], voltage: 5, current: 0.001 },
  TEMP_SENSOR: { description: 'TMP36 temperature sensor', pinCount: 3, typicalUse: ['temperature', 'heat'], voltage: 5, current: 0.001 },
  MOTION: { description: 'PIR motion sensor', pinCount: 3, typicalUse: ['motion', 'presence', 'security'], voltage: 5, current: 0.001 },
  GAS_SENSOR: { description: 'MQ-2 gas sensor', pinCount: 4, typicalUse: ['gas detection', 'fire safety', 'air quality'], voltage: 5, current: 0.15 },
  FLAME_SENSOR: { description: 'Flame detection sensor', pinCount: 4, typicalUse: ['fire detection', 'safety'], voltage: 5, current: 0.001 },
  RAIN_SENSOR: { description: 'Rain detection sensor', pinCount: 4, typicalUse: ['rain detection', 'weather'], voltage: 5, current: 0.001 },
  SOIL_SENSOR: { description: 'Soil moisture sensor', pinCount: 3, typicalUse: ['plant watering', 'agriculture'], voltage: 5, current: 0.001 },
  PRESSURE_SENSOR: { description: 'BMP280 pressure sensor', pinCount: 4, typicalUse: ['pressure', 'altitude', 'weather'], voltage: 3.3, current: 0.001 },
  LCD: { description: '16×2 character LCD', pinCount: 16, typicalUse: ['display', 'text output', 'menu'], voltage: 5, current: 0.002 },
  OLED: { description: 'SSD1306 OLED display', pinCount: 4, typicalUse: ['graphics', 'display', 'dashboard'], voltage: 3.3, current: 0.01 },
  RESISTOR: { description: 'Current-limiting resistor', pinCount: 2, typicalUse: ['limit current', 'voltage divider', 'pull-up'], voltage: 0, current: 0 },
  BATTERY_9V: { description: '9V battery', pinCount: 2, typicalUse: ['power source'], voltage: 9, current: 0.5 },
  BATTERY_AA: { description: 'AA battery (1.5V)', pinCount: 2, typicalUse: ['power source'], voltage: 1.5, current: 0.5 },
  SOLAR: { description: 'Solar panel (5V)', pinCount: 2, typicalUse: ['power source', 'battery charger'], voltage: 5, current: 0.2 },
  RELAY: { description: '5V relay module', pinCount: 3, typicalUse: ['switch high power', 'isolation'], voltage: 5, current: 0.07 },
  LASER: { description: 'Laser diode', pinCount: 2, typicalUse: ['pointer', 'distance', 'security'], voltage: 2.0, current: 0.02 },
  NEOPIXEL_RING: { description: '12 RGB LEDs in ring', pinCount: 3, typicalUse: ['color display', 'notification', 'clock'], voltage: 5, current: 0.06 },
  SEVEN_SEGMENT: { description: '7-segment display', pinCount: 10, typicalUse: ['number display', 'counter'], voltage: 2.0, current: 0.02 },
  MATRIX: { description: '8×8 LED matrix', pinCount: 16, typicalUse: ['graphics', 'animation'], voltage: 2.0, current: 0.02 },
  GPS: { description: 'NEO-6M GPS module', pinCount: 4, typicalUse: ['location', 'navigation', 'tracking'], voltage: 3.3, current: 0.05 },
  HEARTBEAT: { description: 'Pulse sensor', pinCount: 3, typicalUse: ['heart rate', 'pulse', 'health'], voltage: 5, current: 0.001 },
  COMPASS: { description: 'HMC5883L compass', pinCount: 4, typicalUse: ['direction', 'heading', 'navigation'], voltage: 3.3, current: 0.001 },
  GYRO: { description: 'MPU6050 gyro/accel', pinCount: 6, typicalUse: ['motion', 'tilt', 'rotation'], voltage: 3.3, current: 0.003 },
};

// === DIAGNOSIS FUNCTION ===

export function diagnoseCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): { issues: string[]; suggestions: string[] } {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for missing power
  const hasPower = components.some(c => c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR');
  if (components.length > 0 && !hasPower) {
    issues.push('No power source connected');
    suggestions.push('Add a 9V battery or AA battery to power your circuit');
  }

  // Check for LEDs without resistors
  const leds = components.filter(c => c.type.startsWith('LED'));
  const resistors = components.filter(c => c.type === 'RESISTOR');
  if (leds.length > 0 && resistors.length === 0) {
    issues.push('LEDs connected without current-limiting resistors');
    suggestions.push('Add a 220Ω resistor in series with each LED to prevent burnout');
  }

  // Check for motors without drivers
  const motors = components.filter(c => c.type === 'MOTOR_DC' || c.type === 'FAN');
  if (motors.length > 0) {
    const hasDriver = components.some(c => c.type === 'TRANSISTOR_NPN' || c.type === 'TRANSISTOR_PNP' || c.type === 'MOSFET_N' || c.type === 'RELAY');
    if (!hasDriver) {
      issues.push('Motor connected directly to Arduino (may exceed pin current limit)');
      suggestions.push('Use a transistor or relay to switch the motor safely');
    }
  }

  // Check for disconnected components
  components.forEach(comp => {
    const hasConnection = wires.some(w => w.fromComponentId === comp.id || w.toComponentId === comp.id);
    if (!hasConnection && comp.type !== 'BREADBOARD') {
      issues.push(`${comp.type} is not connected to anything`);
      suggestions.push(`Connect ${comp.type} to complete the circuit`);
    }
  });

  return { issues, suggestions };
}

// ============================================================
// COMPONENT RECOMMENDATIONS
// ============================================================

export function recommendComponents(description: string): string[] {
  const desc = description.toLowerCase();
  const recommendations: string[] = [];

  if (desc.includes('light') || desc.includes('led') || desc.includes('blink')) {
    recommendations.push('LED_RED', 'RESISTOR');
  }
  if (desc.includes('button') || desc.includes('press') || desc.includes('switch')) {
    recommendations.push('BUTTON');
  }
  if (desc.includes('sensor') || desc.includes('detect') || desc.includes('read')) {
    recommendations.push('LIGHT_SENSOR', 'TEMP_SENSOR', 'DHT11');
  }
  if (desc.includes('motor') || desc.includes('spin') || desc.includes('move')) {
    recommendations.push('MOTOR_DC', 'TRANSISTOR_NPN');
  }
  if (desc.includes('display') || desc.includes('show') || desc.includes('screen')) {
    recommendations.push('LCD', 'OLED');
  }
  if (desc.includes('sound') || desc.includes('beep') || desc.includes('alarm')) {
    recommendations.push('BUZZER');
  }
  if (desc.includes('temperature') || desc.includes('heat')) {
    recommendations.push('DHT11', 'TEMP_SENSOR');
  }
  if (desc.includes('distance') || desc.includes('ultrasonic')) {
    recommendations.push('ULTRASONIC');
  }
  if (desc.includes('servo') || desc.includes('arm') || desc.includes('pan')) {
    recommendations.push('SERVO');
  }

  return [...new Set(recommendations)];
}

// ============================================================
// VOLTAGE/CURRENT CALCULATIONS
// ============================================================

export function calculateCircuitPower(
  components: CircuitComponent[],
  wires: Wire[]
): { totalPower: number; batteryLife: number; warnings: string[] } {
  const warnings: string[] = [];
  let totalCurrent = 0;
  const batteries = components.filter(c => c.type.startsWith('BATTERY'));

  batteries.forEach(bat => {
    const props = COMPONENT_KNOWLEDGE[bat.type];
    if (props) totalCurrent += props.current;
  });

  const totalPower = totalCurrent * 5; // Assume 5V for simplicity
  const batteryCapacity = 2500; // mAh typical
  const batteryLife = totalCurrent > 0 ? (batteryCapacity / (totalCurrent * 1000)) : Infinity;

  if (totalCurrent > 0.5) {
    warnings.push(`Total current ${totalCurrent.toFixed(2)}A exceeds typical Arduino pin limit`);
  }

  return { totalPower, batteryLife, warnings };
}

// ============================================================
// LEARNING EXPLANATIONS
// ============================================================

export function explainCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): { concepts: string[]; stepByStep: string[] } {
  const concepts: string[] = [];
  const stepByStep: string[] = [];

  // Identify circuit type
  const hasLEDs = components.some(c => c.type.startsWith('LED'));
  const hasMotors = components.some(c => c.type === 'MOTOR_DC' || c.type === 'FAN');
  const hasSensors = components.some(c => c.type.includes('SENSOR') || c.type.includes('DHT'));
  const hasDisplay = components.some(c => c.type === 'LCD' || c.type === 'OLED');
  const hasInput = components.some(c => c.type.includes('BUTTON') || c.type === 'POTENTIOMETER');

  if (hasLEDs) {
    concepts.push('LEDs need current-limiting resistors (Ohm\'s Law: R = V/I)');
    stepByStep.push('1. Power flows from Arduino → Resistor → LED → GND');
  }
  if (hasMotors) {
    concepts.push('Motors draw more current than Arduino pins can handle');
    stepByStep.push('2. Use transistor/relay to switch high-current loads');
  }
  if (hasSensors) {
    concepts.push('Sensors convert physical properties to electrical signals');
    stepByStep.push('3. Read sensor values using analogRead() or digitalRead()');
  }
  if (hasDisplay) {
    concepts.push('Displays require initialization before use');
    stepByStep.push('4. Initialize display in setup(), update in loop()');
  }
  if (hasInput) {
    concepts.push('Input devices provide user control');
    stepByStep.push('5. Read input state and use in if-else logic');
  }

  return { concepts, stepByStep };
}
