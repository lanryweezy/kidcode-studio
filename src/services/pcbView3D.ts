// ============================================================
// 3D PCB Visualization Engine
// Rotatable 3D view using CSS transforms and perspective
// ============================================================

import { CircuitComponent, Wire } from '../types';

// === 3D TRANSFORM TYPES ===

export interface Transform3D {
  rotateX: number;  // -90 to 90 degrees
  rotateY: number;  // -90 to 90 degrees
  rotateZ: number;  // -180 to 180 degrees
  scale: number;    // 0.5 to 2.0
  translateZ: number; // depth offset
}

export interface PCBView3D {
  transform: Transform3D;
  perspective: number;
  showTraces: boolean;
  showSilkscreen: boolean;
  show3DComponents: boolean;
}

// === 3D TRANSFORM CALCULATIONS ===

export function calculate3DTransform(
  rotation: { x: number; y: number; z: number },
  zoom: number
): string {
  return `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${zoom})`;
}

export function getRotationFromMouse(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  currentRotation: { x: number; y: number }
): { x: number; y: number } {
  const deltaX = (currentX - startX) * 0.5;
  const deltaY = (currentY - startY) * 0.5;

  return {
    x: Math.max(-60, Math.min(60, currentRotation.x + deltaY)),
    y: currentRotation.y + deltaX,
  };
}

// === COMPONENT 3D PROPERTIES ===

export interface Component3D {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;         // Height above PCB
  width: number;
  height: number;
  depth: number;
  color: string;
  borderColor: string;
  label: string;
}

export const COMPONENT_3D_MODELS: Record<string, Omit<Component3D, 'id' | 'x' | 'y'>> = {
  // ICs - flat black packages
  ARDUINO_UNO: { type: 'ARDUINO_UNO', z: 2, width: 70, height: 50, depth: 8, color: '#0066cc', borderColor: '#004499', label: 'ARDUINO UNO' },
  ARDUINO_NANO: { type: 'ARDUINO_NANO', z: 2, width: 18, height: 45, depth: 6, color: '#0071a0', borderColor: '#004499', label: 'NANO' },
  ARDUINO_MEGA: { type: 'ARDUINO_MEGA', z: 2, width: 80, height: 60, depth: 8, color: '#0066cc', borderColor: '#004499', label: 'MEGA' },
  ESP32_DEVKIT: { type: 'ESP32_DEVKIT', z: 2, width: 30, height: 50, depth: 6, color: '#1e293b', borderColor: '#000', label: 'ESP32' },
  ESP32_CAM: { type: 'ESP32_CAM', z: 2, width: 25, height: 40, depth: 8, color: '#1e293b', borderColor: '#000', label: 'ESP32-CAM' },
  ESP8266: { type: 'ESP8266', z: 2, width: 24, height: 15, depth: 3, color: '#1e293b', borderColor: '#000', label: 'ESP8266' },
  NODEMCU: { type: 'NODEMCU', z: 2, width: 26, height: 48, depth: 4, color: '#1e293b', borderColor: '#000', label: 'NodeMCU' },
  RASPBERRY_PI_4: { type: 'RASPBERRY_PI_4', z: 3, width: 65, height: 50, depth: 12, color: '#166534', borderColor: '#064e3b', label: 'RPI 4' },
  RASPBERRY_PI_ZERO: { type: 'RASPBERRY_PI_ZERO', z: 2, width: 30, height: 65, depth: 5, color: '#166534', borderColor: '#064e3b', label: 'RPI Zero' },
  MICROBIT: { type: 'MICROBIT', z: 2, width: 50, height: 40, depth: 4, color: '#1e293b', borderColor: '#000', label: 'micro:bit' },

  // LEDs - domed
  LED_RED: { type: 'LED_RED', z: 8, width: 6, height: 6, depth: 10, color: '#dc2626', borderColor: '#991b1b', label: 'RED' },
  LED_BLUE: { type: 'LED_BLUE', z: 8, width: 6, height: 6, depth: 10, color: '#2563eb', borderColor: '#1d4ed8', label: 'BLUE' },
  LED_GREEN: { type: 'LED_GREEN', z: 8, width: 6, height: 6, depth: 10, color: '#16a34a', borderColor: '#15803d', label: 'GREEN' },
  LED_YELLOW: { type: 'LED_YELLOW', z: 8, width: 6, height: 6, depth: 10, color: '#eab308', borderColor: '#a16207', label: 'YELLOW' },
  LED_ORANGE: { type: 'LED_ORANGE', z: 8, width: 6, height: 6, depth: 10, color: '#f97316', borderColor: '#c2410c', label: 'ORANGE' },
  LED_WHITE: { type: 'LED_WHITE', z: 8, width: 6, height: 6, depth: 10, color: '#f8fafc', borderColor: '#94a3b8', label: 'WHITE' },
  RGB_LED: { type: 'RGB_LED', z: 8, width: 6, height: 6, depth: 10, color: '#a855f7', borderColor: '#7c3aed', label: 'RGB' },

  // Passive components
  RESISTOR: { type: 'RESISTOR', z: 4, width: 12, height: 4, depth: 4, color: '#a8a29e', borderColor: '#78716c', label: 'RES' },
  CAPACITOR_ELEC: { type: 'CAPACITOR_ELEC', z: 10, width: 8, height: 8, depth: 14, color: '#1e40af', borderColor: '#1e3a8a', label: 'CAP' },
  CAPACITOR_CERAMIC: { type: 'CAPACITOR_CERAMIC', z: 4, width: 5, height: 3, depth: 5, color: '#d97706', borderColor: '#b45309', label: 'CER' },
  CAPACITOR_TANTALUM: { type: 'CAPACITOR_TANTALUM', z: 4, width: 5, height: 3, depth: 5, color: '#eab308', borderColor: '#ca8a04', label: 'TAN' },

  // Diodes
  DIODE: { type: 'DIODE', z: 3, width: 10, height: 4, depth: 4, color: '#1a1a1a', borderColor: '#333', label: '1N4001' },
  DIODE_SCHOTTKY: { type: 'DIODE_SCHOTTKY', z: 3, width: 10, height: 4, depth: 4, color: '#1a1a1a', borderColor: '#333', label: '1N5819' },
  DIODE_ZENER: { type: 'DIODE_ZENER', z: 3, width: 10, height: 4, depth: 4, color: '#1a1a1a', borderColor: '#333', label: '5.1V Z' },

  // Transistors
  TRANSISTOR_NPN: { type: 'TRANSISTOR_NPN', z: 8, width: 6, height: 6, depth: 10, color: '#1a1a1a', borderColor: '#333', label: 'NPN' },
  TRANSISTOR_PNP: { type: 'TRANSISTOR_PNP', z: 8, width: 6, height: 6, depth: 10, color: '#1a1a1a', borderColor: '#333', label: 'PNP' },
  MOSFET_N: { type: 'MOSFET_N', z: 8, width: 10, height: 10, depth: 12, color: '#1a1a1a', borderColor: '#333', label: 'NMOS' },
  MOSFET_P: { type: 'MOSFET_P', z: 8, width: 10, height: 10, depth: 12, color: '#1a1a1a', borderColor: '#333', label: 'PMOS' },

  // Voltage regulators
  VREG_7805: { type: 'VREG_7805', z: 8, width: 10, height: 10, depth: 12, color: '#1a1a1a', borderColor: '#333', label: '7805' },
  VREG_317: { type: 'VREG_317', z: 8, width: 10, height: 10, depth: 12, color: '#1a1a1a', borderColor: '#333', label: '317' },
  VREG_LDO: { type: 'VREG_LDO', z: 5, width: 6, height: 6, depth: 6, color: '#1a1a1a', borderColor: '#333', label: 'LDO' },

  // Op-amps
  OPAMP_358: { type: 'OPAMP_358', z: 4, width: 12, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'LM358' },
  OPAMP_072: { type: 'OPAMP_072', z: 4, width: 12, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'TL072' },

  // Logic
  LOGIC_AND: { type: 'LOGIC_AND', z: 4, width: 12, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'AND' },
  LOGIC_OR: { type: 'LOGIC_OR', z: 4, width: 12, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'OR' },
  '555_TIMER': { type: '555_TIMER', z: 4, width: 12, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: '555' },

  // Displays
  LCD: { type: 'LCD', z: 6, width: 48, height: 24, depth: 8, color: '#065f46', borderColor: '#047857', label: 'LCD 16x2' },
  LCD_2004: { type: 'LCD_2004', z: 6, width: 56, height: 30, depth: 8, color: '#065f46', borderColor: '#047857', label: 'LCD 20x4' },
  OLED: { type: 'OLED', z: 4, width: 30, height: 20, depth: 4, color: '#000', borderColor: '#333', label: 'OLED' },
  SEVEN_SEGMENT: { type: 'SEVEN_SEGMENT', z: 6, width: 14, height: 20, depth: 8, color: '#1a1a1a', borderColor: '#333', label: '7-SEG' },
  MATRIX: { type: 'MATRIX', z: 4, width: 24, height: 24, depth: 4, color: '#1a1a1a', borderColor: '#333', label: '8x8' },
  NEOPIXEL_RING: { type: 'NEOPIXEL_RING', z: 4, width: 24, height: 24, depth: 4, color: '#a855f7', borderColor: '#7c3aed', label: 'NeoPixel' },

  // Power
  BATTERY_9V: { type: 'BATTERY_9V', z: 14, width: 16, height: 22, depth: 20, color: '#1a1a1a', borderColor: '#333', label: '9V' },
  BATTERY_AA: { type: 'BATTERY_AA', z: 8, width: 8, height: 20, depth: 12, color: '#1a1a1a', borderColor: '#333', label: 'AA' },
  SOLAR: { type: 'SOLAR', z: 3, width: 40, height: 40, depth: 5, color: '#1e3a5f', borderColor: '#1e40af', label: 'SOLAR' },

  // Communication
  WIFI: { type: 'WIFI', z: 4, width: 24, height: 15, depth: 4, color: '#1a1a1a', borderColor: '#333', label: 'WiFi' },
  BLUETOOTH: { type: 'BLUETOOTH', z: 4, width: 24, height: 15, depth: 4, color: '#1a1a1a', borderColor: '#333', label: 'BT' },
  RADIO: { type: 'RADIO', z: 4, width: 24, height: 15, depth: 4, color: '#1a1a1a', borderColor: '#333', label: 'RF' },

  // Sensors
  ULTRASONIC: { type: 'ULTRASONIC', z: 6, width: 30, height: 15, depth: 8, color: '#004d99', borderColor: '#003366', label: 'HC-SR04' },
  DHT11: { type: 'DHT11', z: 5, width: 12, height: 12, depth: 6, color: '#0ea5e9', borderColor: '#0284c7', label: 'DHT11' },
  DHT22: { type: 'DHT22', z: 5, width: 12, height: 12, depth: 6, color: '#f8fafc', borderColor: '#cbd5e1', label: 'DHT22' },
  MOTION: { type: 'MOTION', z: 6, width: 20, height: 20, depth: 8, color: '#f8fafc', borderColor: '#cbd5e1', label: 'PIR' },
  GAS_SENSOR: { type: 'GAS_SENSOR', z: 5, width: 20, height: 20, depth: 6, color: '#1a1a1a', borderColor: '#333', label: 'MQ-2' },
  FLAME_SENSOR: { type: 'FLAME_SENSOR', z: 4, width: 16, height: 12, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'FLAME' },
  RAIN_SENSOR: { type: 'RAIN_SENSOR', z: 3, width: 30, height: 20, depth: 4, color: '#1e3a5f', borderColor: '#1e40af', label: 'RAIN' },
  SOIL_SENSOR: { type: 'SOIL_SENSOR', z: 4, width: 12, height: 20, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'SOIL' },
  PRESSURE_SENSOR: { type: 'PRESSURE_SENSOR', z: 4, width: 16, height: 12, depth: 5, color: '#0891b2', borderColor: '#0e7490', label: 'BMP280' },
  GPS: { type: 'GPS', z: 5, width: 20, height: 20, depth: 6, color: '#1a1a1a', borderColor: '#333', label: 'GPS' },
  HEARTBEAT: { type: 'HEARTBEAT', z: 3, width: 16, height: 12, depth: 4, color: '#1a1a1a', borderColor: '#333', label: 'PULSE' },
  COMPASS: { type: 'COMPASS', z: 4, width: 16, height: 12, depth: 5, color: '#0ea5e9', borderColor: '#0284c7', label: 'HMC5883' },
  GYRO: { type: 'GYRO', z: 4, width: 16, height: 16, depth: 5, color: '#0d9488', borderColor: '#0f766e', label: 'MPU6050' },
  LIGHT_SENSOR: { type: 'LIGHT_SENSOR', z: 3, width: 8, height: 6, depth: 4, color: '#facc15', borderColor: '#ca8a04', label: 'LDR' },
  TEMP_SENSOR: { type: 'TEMP_SENSOR', z: 5, width: 6, height: 6, depth: 6, color: '#1a1a1a', borderColor: '#333', label: 'TMP36' },
  THERMISTOR: { type: 'THERMISTOR', z: 4, width: 6, height: 6, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'NTC' },
  FLEX_SENSOR: { type: 'FLEX_SENSOR', z: 2, width: 40, height: 8, depth: 3, color: '#7c3aed', borderColor: '#6d28d9', label: 'FLEX' },
  TILT_SENSOR: { type: 'TILT_SENSOR', z: 5, width: 6, height: 6, depth: 6, color: '#1a1a1a', borderColor: '#333', label: 'TILT' },
  HALL_SENSOR: { type: 'HALL_SENSOR', z: 4, width: 6, height: 5, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'HALL' },
  SOUND_SENSOR: { type: 'SOUND_SENSOR', z: 4, width: 16, height: 12, depth: 5, color: '#1a1a1a', borderColor: '#333', label: 'MIC' },

  // Motors & Actuators
  SERVO: { type: 'SERVO', z: 8, width: 14, height: 22, depth: 12, color: '#2563eb', borderColor: '#1d4ed8', label: 'SERVO' },
  MOTOR_DC: { type: 'MOTOR_DC', z: 8, width: 12, height: 20, depth: 12, color: '#94a3b8', borderColor: '#64748b', label: 'MOTOR' },
  FAN: { type: 'FAN', z: 6, width: 24, height: 24, depth: 8, color: '#1a1a1a', borderColor: '#333', label: 'FAN' },
  BUZZER: { type: 'BUZZER', z: 8, width: 12, height: 12, depth: 10, color: '#1a1a1a', borderColor: '#333', label: 'BUZZER' },
  SPEAKER: { type: 'SPEAKER', z: 6, width: 20, height: 20, depth: 8, color: '#1a1a1a', borderColor: '#333', label: 'SPK' },
  RELAY: { type: 'RELAY', z: 10, width: 20, height: 24, depth: 12, color: '#2563eb', borderColor: '#1d4ed8', label: 'RELAY' },
  LASER: { type: 'LASER', z: 6, width: 8, height: 16, depth: 8, color: '#b45309', borderColor: '#92400e', label: 'LASER' },
  STEPPER: { type: 'STEPPER', z: 10, width: 20, height: 20, depth: 14, color: '#94a3b8', borderColor: '#64748b', label: 'STEPPER' },
  PUMP: { type: 'PUMP', z: 8, width: 14, height: 24, depth: 10, color: '#f8fafc', borderColor: '#94a3b8', label: 'PUMP' },
  VIBRATION: { type: 'VIBRATION', z: 4, width: 12, height: 12, depth: 5, color: '#94a3b8', borderColor: '#64748b', label: 'VIB' },
  WIRE_SPOOL: { type: 'WIRE_SPOOL', z: 3, width: 12, height: 12, depth: 6, color: '#eab308', borderColor: '#ca8a04', label: 'WIRE' },
};

// === 3D RENDERING ===

export function generate3DComponentStyle(
  comp3D: Component3D,
  isActive: boolean
): React.CSSProperties {
  return {
    position: 'absolute' as const,
    left: `${comp3D.x}px`,
    top: `${comp3D.y}px`,
    width: `${comp3D.width}px`,
    height: `${comp3D.height}px`,
    transformStyle: 'preserve-3d' as const,
    transform: `translateZ(${comp3D.z}px)`,
  };
}

export function getComponent3D(
  comp: CircuitComponent,
  isActive: boolean
): Component3D {
  const model = COMPONENT_3D_MODELS[comp.type] || {
    type: comp.type,
    z: 4,
    width: 16,
    height: 16,
    depth: 6,
    color: '#334155',
    borderColor: '#475569',
    label: comp.type.slice(0, 4),
  };

  return {
    ...model,
    id: comp.id,
    x: comp.x,
    y: comp.y,
    color: isActive ? getActiveColor(comp.type, model.color) : model.color,
  };
}

function getActiveColor(type: string, defaultColor: string): string {
  if (type.startsWith('LED')) {
    if (type.includes('RED')) return '#ef4444';
    if (type.includes('BLUE')) return '#3b82f6';
    if (type.includes('GREEN')) return '#22c55e';
    if (type.includes('YELLOW')) return '#eab308';
    if (type.includes('ORANGE')) return '#f97316';
    if (type.includes('WHITE')) return '#f8fafc';
    return '#a855f7';
  }
  if (type === 'BULB') return '#fef08a';
  if (type === 'BUZZER') return '#facc15';
  if (type === 'LCD' || type === 'OLED') return '#22c55e';
  return defaultColor;
}

// === PCB 3D GRID ===

export function generate3DGrid(pcbColor: string): string {
  return `
    <pattern id="pcb-grid-3d" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.15)"/>
    </pattern>
    <rect width="100%" height="100%" fill="${pcbColor}" rx="4"/>
    <rect width="100%" height="100%" fill="url(#pcb-grid-3d)"/>
    <rect width="100%" height="100%" fill="none" stroke="rgba(255,255,255,0.08)" rx="4"/>
  `;
}

// === 3D VIEW PRESETS ===

export const VIEW_PRESETS: Record<string, Transform3D> = {
  'top': { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, translateZ: 0 },
  'front': { rotateX: -45, rotateY: 0, rotateZ: 0, scale: 1, translateZ: 50 },
  'side': { rotateX: 0, rotateY: 45, rotateZ: 0, scale: 1, translateZ: 50 },
  'iso': { rotateX: -30, rotateY: 30, rotateZ: 0, scale: 1, translateZ: 30 },
  'angle': { rotateX: -20, rotateY: 25, rotateZ: 0, scale: 1.1, translateZ: 20 },
};
