
// ============================================================
// Circuit Generation - all generate* functions, patterns, and design logic
// ============================================================

import { CircuitComponent, Wire, ComponentType, AppMode } from '../../types';
import { generateCodeFromPrompt } from '../geminiService';
import { CircuitDesignRequest, CircuitDesignResult } from './index';

// === CIRCUIT DESIGN PATTERNS ===

const DESIGN_PATTERNS: Record<string, (req: CircuitDesignRequest) => CircuitDesignResult> = {
  // LED blink
  'led blink': (req) => generateLEDBlink(req),
  'blink led': (req) => generateLEDBlink(req),
  'flash led': (req) => generateLEDBlink(req),
  'led flash': (req) => generateLEDBlink(req),

  // Traffic light
  'traffic light': (req) => generateTrafficLight(req),
  'traffic signal': (req) => generateTrafficLight(req),

  // Button controlled
  'button led': (req) => generateButtonLED(req),
  'push button': (req) => generateButtonLED(req),
  'switch led': (req) => generateButtonLED(req),

  // Temperature
  'temperature alarm': (req) => generateTempAlarm(req),
  'temp alarm': (req) => generateTempAlarm(req),
  'heat alarm': (req) => generateTempAlarm(req),
  'temperature sensor': (req) => generateTempDisplay(req),

  // Distance
  'distance meter': (req) => generateDistanceMeter(req),
  'ultrasonic': (req) => generateDistanceMeter(req),
  'obstacle detector': (req) => generateObstacleDetector(req),

  // Servo
  'servo sweep': (req) => generateServoSweep(req),
  'servo control': (req) => generateServoControl(req),
  'pan tilt': (req) => generatePanTilt(req),

  // Motor
  'motor control': (req) => generateMotorControl(req),
  'dc motor': (req) => generateMotorControl(req),
  'fan control': (req) => generateFanControl(req),

  // RGB
  'rgb led': (req) => generateRGBMixer(req),
  'color mixer': (req) => generateRGBMixer(req),
  'rgb color': (req) => generateRGBMixer(req),

  // Light
  'night light': (req) => generateNightLight(req),
  'light sensor': (req) => generateLightSensor(req),
  'auto light': (req) => generateNightLight(req),

  // Security
  'motion alarm': (req) => generateMotionAlarm(req),
  'pir sensor': (req) => generateMotionAlarm(req),
  'security': (req) => generateMotionAlarm(req),

  // Display
  'lcd display': (req) => generateLCDDisplay(req),
  'oled display': (req) => generateOLEDDisplay(req),
  'countdown timer': (req) => generateCountdownTimer(req),

  // Sound
  'buzzer alarm': (req) => generateBuzzerAlarm(req),
  'music': (req) => generateMusicBox(req),
  'melody': (req) => generateMusicBox(req),

  // Advanced
  'transistor switch': (req) => generateTransistorSwitch(req),
  'motor driver': (req) => generateTransistorSwitch(req),
  'relay control': (req) => generateRelayControl(req),
  'power supply': (req) => generatePowerSupply(req),
};

// === CIRCUIT GENERATORS ===

function generateLEDBlink(req: CircuitDesignRequest): CircuitDesignResult {
  const components: CircuitComponent[] = [
    { id: crypto.randomUUID(), type: 'ARDUINO_UNO', x: 300, y: 200, pin: 13, rotation: 0 },
    { id: crypto.randomUUID(), type: 'LED_RED', x: 100, y: 100, pin: 0, rotation: 0 },
    { id: crypto.randomUUID(), type: 'RESISTOR', x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 },
  ];
  const mcId = components[0].id;
  const ledId = components[1].id;
  const resId = components[2].id;
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mcId, fromPin: 13, toComponentId: resId, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: resId, fromPin: 0, toComponentId: ledId, toPin: 0, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: {
      components, wires,
      code: '// LED Blink\nvoid setup() { pinMode(13, OUTPUT); }\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}',
      explanation: 'This circuit blinks an LED. The 220Ω resistor limits current to ~15mA, protecting the LED from burning out. Pin 13 toggles HIGH/LOW every 500ms.',
    },
    alternatives: [],
    warnings: ['LED must have a current-limiting resistor'],
    estimatedTime: '5 min',
    difficulty: 'beginner',
  };
}

function generateTrafficLight(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const red = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 80, y: 60, pin: 0, rotation: 0 };
  const yel = { id: crypto.randomUUID(), type: 'LED_YELLOW' as ComponentType, x: 80, y: 120, pin: 0, rotation: 0 };
  const grn = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 80, y: 180, pin: 0, rotation: 0 };
  const r1 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 60, pin: 0, rotation: 0, resistance: 220 };
  const r2 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 120, pin: 0, rotation: 0, resistance: 220 };
  const r3 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, red, yel, grn, r1, r2, r3];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: r1.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: r1.id, fromPin: 0, toComponentId: red.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 3, toComponentId: r2.id, toPin: 0, color: '#eab308' },
    { id: crypto.randomUUID(), fromComponentId: r2.id, fromPin: 0, toComponentId: yel.id, toPin: 0, color: '#eab308' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: r3.id, toPin: 0, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: r3.id, fromPin: 0, toComponentId: grn.id, toPin: 0, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Traffic Light\nvoid loop() {\n  digitalWrite(2, HIGH); delay(3000);\n  digitalWrite(2, LOW); digitalWrite(3, HIGH); delay(1000);\n  digitalWrite(3, LOW); digitalWrite(4, HIGH); delay(3000);\n  digitalWrite(4, LOW);\n}',
      explanation: 'Traffic light cycles: Red(3s) → Yellow(1s) → Green(3s). Each LED has a 220Ω resistor. Pins 2,3,4 control the colors.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateButtonLED(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 100, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 200, y: 100, pin: 0, rotation: 0, resistance: 220 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 250, pin: 4, rotation: 0 };
  const components = [mc, led, res, btn];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 0, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Button LED\nvoid loop() {\n  if (digitalRead(4) == HIGH) digitalWrite(13, HIGH);\n  else digitalWrite(13, LOW);\n}',
      explanation: 'Button on pin 4 controls LED on pin 13. When button is pressed, pin 4 reads HIGH, turning on the LED.',
    },
    alternatives: [], warnings: ['Use internal pull-up resistor or external pull-down'], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateTempAlarm(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const dht = { id: crypto.randomUUID(), type: 'DHT11' as ComponentType, x: 80, y: 80, pin: 28, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 80, y: 180, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 80, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, dht, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: dht.id, toPin: 28, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Temperature Alarm\nvoid loop() {\n  float t = readDHT11();\n  if (t > 30.0) {\n    digitalWrite(8, HIGH); // Buzzer ON\n    digitalWrite(13, HIGH); // LED ON\n  } else {\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(1000);\n}',
      explanation: 'DHT11 reads temperature. If above 30°C, buzzer sounds and red LED lights up as warning.',
    },
    alternatives: [], warnings: ['DHT11 has ±2°C accuracy'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateTempDisplay(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const dht = { id: crypto.randomUUID(), type: 'DHT11' as ComponentType, x: 80, y: 80, pin: 28, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const components = [mc, dht, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: dht.id, toPin: 28, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Temperature Display\nvoid loop() {\n  float t = readDHT11();\n  lcd.setCursor(0, 0);\n  lcd.print("Temp: ");\n  lcd.print(t);\n  lcd.print(" C");\n  delay(1000);\n}',
      explanation: 'Reads temperature from DHT11 and displays it on the 16×2 LCD.',
    },
    alternatives: [], warnings: [], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateDistanceMeter(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const sonic = { id: crypto.randomUUID(), type: 'ULTRASONIC' as ComponentType, x: 100, y: 100, pin: 92, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const components = [mc, sonic, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: sonic.id, toPin: 92, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Distance Meter\nvoid loop() {\n  float d = readUltrasonic();\n  lcd.setCursor(0, 0);\n  lcd.print("Dist: ");\n  lcd.print(d);\n  lcd.print(" cm");\n  delay(100);\n}',
      explanation: 'HC-SR04 measures distance using sound waves. Distance = (echo time × 0.0343) / 2.',
    },
    alternatives: [], warnings: [], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateObstacleDetector(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const sonic = { id: crypto.randomUUID(), type: 'ULTRASONIC' as ComponentType, x: 100, y: 100, pin: 92, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, sonic, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: sonic.id, toPin: 92, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Obstacle Detector\nvoid loop() {\n  float d = readUltrasonic();\n  if (d < 20) {\n    digitalWrite(8, HIGH); // Buzzer\n    digitalWrite(13, HIGH); // LED\n    delay(200);\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(50);\n}',
      explanation: 'When object is within 20cm, buzzer beeps and LED flashes. Sound frequency increases as object gets closer.',
    },
    alternatives: [], warnings: [], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateServoSweep(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const srv = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 100, y: 150, pin: 11, rotation: 0 };
  const components = [mc, srv];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 11, toComponentId: srv.id, toPin: 11, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Servo Sweep\nvoid loop() {\n  for (int a = 0; a <= 180; a++) {\n    servo.write(a);\n    delay(15);\n  }\n  for (int a = 180; a >= 0; a--) {\n    servo.write(a);\n    delay(15);\n  }\n}',
      explanation: 'Servo sweeps from 0° to 180° and back. Each degree takes 15ms. Full cycle takes ~5.4 seconds.',
    },
    alternatives: [], warnings: ['SG90 servo: max 180° rotation'], estimatedTime: '10 min', difficulty: 'intermediate',
  };
}

function generateServoControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const srv = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 100, y: 150, pin: 11, rotation: 0 };
  const pot = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 100, y: 250, pin: 97, rotation: 0 };
  const components = [mc, srv, pot];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 11, toComponentId: srv.id, toPin: 11, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: pot.id, toPin: 97, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Servo Control with Potentiometer\nvoid loop() {\n  int val = analogRead(A0);\n  int angle = map(val, 0, 1023, 0, 180);\n  servo.write(angle);\n  delay(15);\n}',
      explanation: 'Potentiometer controls servo angle. Rotate knob to move servo from 0° to 180°.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'intermediate',
  };
}

function generatePanTilt(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const srv1 = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 100, y: 100, pin: 9, rotation: 0 };
  const srv2 = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 100, y: 200, pin: 10, rotation: 0 };
  const components = [mc, srv1, srv2];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 9, toComponentId: srv1.id, toPin: 9, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 10, toComponentId: srv2.id, toPin: 10, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Pan/Tilt\nvoid loop() {\n  for (int a = 0; a <= 180; a += 5) {\n    servoPan.write(a);\n    delay(20);\n    for (int b = 0; b <= 90; b += 5) {\n      servoTilt.write(b);\n      delay(20);\n    }\n  }\n}',
      explanation: 'Two servos control pan (horizontal) and tilt (vertical) movement. Great for cameras or sensors.',
    },
    alternatives: [], warnings: ['Two servos draw ~300mA total'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateMotorControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const trn = { id: crypto.randomUUID(), type: 'TRANSISTOR_NPN' as ComponentType, x: 150, y: 150, pin: 0, rotation: 0 };
  const mot = { id: crypto.randomUUID(), type: 'MOTOR_DC' as ComponentType, x: 80, y: 80, pin: 6, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 220, y: 150, pin: 0, rotation: 0, resistance: 1000 };
  const bat = { id: crypto.randomUUID(), type: 'BATTERY_9V' as ComponentType, x: 80, y: 250, pin: 90, rotation: 0 };
  const components = [mc, trn, mot, res, bat];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 6, toComponentId: res.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: trn.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: bat.id, fromPin: 90, toComponentId: mot.id, toPin: 6, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Motor Control\nvoid loop() {\n  digitalWrite(6, HIGH); // Motor ON\n  delay(2000);\n  digitalWrite(6, LOW); // Motor OFF\n  delay(1000);\n}',
      explanation: 'NPN transistor switches high-current motor. Arduino controls base through 1kΩ resistor. Motor runs from 9V battery.',
    },
    alternatives: [], warnings: ['Add flyback diode across motor'], estimatedTime: '20 min', difficulty: 'advanced',
  };
}

function generateFanControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const fan = { id: crypto.randomUUID(), type: 'FAN' as ComponentType, x: 100, y: 150, pin: 9, rotation: 0 };
  const pot = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 100, y: 250, pin: 97, rotation: 0 };
  const components = [mc, fan, pot];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 9, toComponentId: fan.id, toPin: 9, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: pot.id, toPin: 97, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Fan Speed Control\nvoid loop() {\n  int val = analogRead(A0);\n  int speed = map(val, 0, 1023, 0, 255);\n  analogWrite(9, speed);\n  delay(50);\n}',
      explanation: 'Potentiometer controls fan speed via PWM. Rotate to adjust from off to full speed.',
    },
    alternatives: [], warnings: [], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateRGBMixer(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const rgb = { id: crypto.randomUUID(), type: 'RGB_LED' as ComponentType, x: 100, y: 100, pin: 10, rotation: 0 };
  const p1 = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 80, y: 250, pin: 97, rotation: 0 };
  const p2 = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 180, y: 250, pin: 97, rotation: 0 };
  const p3 = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 280, y: 250, pin: 97, rotation: 0 };
  const components = [mc, rgb, p1, p2, p3];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 10, toComponentId: rgb.id, toPin: 10, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: p1.id, toPin: 97, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 15, toComponentId: p2.id, toPin: 97, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 16, toComponentId: p3.id, toPin: 97, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// RGB Color Mixer\nvoid loop() {\n  int r = map(analogRead(A0), 0, 1023, 0, 255);\n  int g = map(analogRead(A1), 0, 1023, 0, 255);\n  int b = map(analogRead(A2), 0, 1023, 0, 255);\n  analogWrite(9, r); analogWrite(10, g); analogWrite(11, b);\n}',
      explanation: 'Three potentiometers control RGB channels. Mix any color by adjusting R, G, B values.',
    },
    alternatives: [], warnings: [], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateNightLight(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const ldr = { id: crypto.randomUUID(), type: 'LIGHT_SENSOR' as ComponentType, x: 100, y: 100, pin: 5, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_WHITE' as ComponentType, x: 100, y: 200, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, ldr, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: ldr.id, toPin: 5, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Night Light\nvoid loop() {\n  int light = analogRead(A5);\n  if (light < 200) digitalWrite(13, HIGH);\n  else digitalWrite(13, LOW);\n  delay(100);\n}',
      explanation: 'LDR detects ambient light. When dark (value < 200), white LED turns on automatically.',
    },
    alternatives: [], warnings: [], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateLightSensor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const ldr = { id: crypto.randomUUID(), type: 'LIGHT_SENSOR' as ComponentType, x: 100, y: 100, pin: 5, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const components = [mc, ldr, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: ldr.id, toPin: 5, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Light Sensor Display\nvoid loop() {\n  int lux = analogRead(A5);\n  lcd.setCursor(0, 0);\n  lcd.print("Light: ");\n  lcd.print(lux);\n  delay(500);\n}',
      explanation: 'LDR reads light level (0-1023). Displays value on LCD.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'intermediate',
  };
}

function generateMotionAlarm(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const pir = { id: crypto.randomUUID(), type: 'MOTION' as ComponentType, x: 100, y: 100, pin: 3, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, pir, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 3, toComponentId: pir.id, toPin: 3, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Motion Alarm\nvoid loop() {\n  if (digitalRead(3) == HIGH) {\n    digitalWrite(8, HIGH);\n    digitalWrite(13, HIGH);\n    delay(500);\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n    delay(500);\n  }\n  delay(100);\n}',
      explanation: 'PIR sensor detects motion. When triggered, buzzer sounds and LED flashes for 1 second.',
    },
    alternatives: [], warnings: ['PIR needs 30-60 seconds to calibrate on first power-up'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateLCDDisplay(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 150, pin: 95, rotation: 0 };
  const components = [mc, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// LCD Display\nvoid setup() {\n  lcd.begin(16, 2);\n  lcd.print("Hello World!");\n  lcd.setCursor(0, 1);\n  lcd.print("KidCode Studio");\n}',
      explanation: 'LCD displays text on 2 lines of 16 characters. Use I2C backpack for simpler wiring.',
    },
    alternatives: [], warnings: ['LCD needs I2C backpack or 6+ data wires'], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateOLEDDisplay(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const oled = { id: crypto.randomUUID(), type: 'OLED' as ComponentType, x: 100, y: 150, pin: 11, rotation: 0 };
  const components = [mc, oled];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 11, toComponentId: oled.id, toPin: 11, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// OLED Display\nvoid setup() {\n  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  oled.clearDisplay();\n  oled.setTextSize(1);\n  oled.setTextColor(WHITE);\n  oled.setCursor(0,0);\n  oled.println("Hello World!");\n  oled.display();\n}',
      explanation: 'OLED shows graphics and text on 128×64 pixels. Uses only 2 wires (I2C).',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'intermediate',
  };
}

function generateCountdownTimer(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const seg = { id: crypto.randomUUID(), type: 'SEVEN_SEGMENT' as ComponentType, x: 100, y: 150, pin: 96, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 250, pin: 8, rotation: 0 };
  const components = [mc, seg, buzzer];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: seg.id, toPin: 96, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Countdown Timer\nint count = 10;\nvoid loop() {\n  while (count > 0) {\n    displayDigit(count);\n    delay(1000);\n    count--;\n  }\n  // Alarm\n  for (int i = 0; i < 5; i++) {\n    digitalWrite(8, HIGH); delay(200);\n    digitalWrite(8, LOW); delay(200);\n  }\n}',
      explanation: 'Counts down from 10 to 0, then sounds alarm. Uses 7-segment display.',
    },
    alternatives: [], warnings: [], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateBuzzerAlarm(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 150, pin: 8, rotation: 0 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 250, pin: 4, rotation: 0 };
  const components = [mc, buzzer, btn];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 4, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Buzzer Alarm\nvoid loop() {\n  if (digitalRead(4) == HIGH) {\n    for (int f = 200; f < 2000; f += 50) {\n      tone(8, f, 100);\n      delay(50);\n    }\n  }\n}',
      explanation: 'Button triggers alarm with rising frequency sweep. Sound goes from low to high pitch.',
    },
    alternatives: [], warnings: [], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateMusicBox(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const speaker = { id: crypto.randomUUID(), type: 'SPEAKER' as ComponentType, x: 100, y: 150, pin: 8, rotation: 0 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 250, pin: 4, rotation: 0 };
  const components = [mc, speaker, btn];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: speaker.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 4, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Music Box - Twinkle Twinkle Little Star\nint melody[] = {262, 262, 392, 392, 440, 440, 392};\nint beats[] = {500, 500, 500, 500, 500, 500, 1000};\nvoid loop() {\n  if (digitalRead(4) == HIGH) {\n    for (int i = 0; i < 7; i++) {\n      tone(8, melody[i], beats[i]);\n      delay(beats[i] * 1.2);\n    }\n  }\n}',
      explanation: 'Speaker plays "Twinkle Twinkle Little Star" when button is pressed. Frequency determines pitch, duration determines note length.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateTransistorSwitch(req: CircuitDesignRequest): CircuitDesignResult {
  return generateMotorControl(req);
}

function generateRelayControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const relay = { id: crypto.randomUUID(), type: 'RELAY' as ComponentType, x: 100, y: 150, pin: 14, rotation: 0 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 250, pin: 4, rotation: 0 };
  const components = [mc, relay, btn];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: relay.id, toPin: 14, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 4, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Relay Control\nvoid loop() {\n  if (digitalRead(4) == HIGH) {\n    digitalWrite(14, HIGH); // Relay ON\n  } else {\n    digitalWrite(14, LOW); // Relay OFF\n  }\n  delay(100);\n}',
      explanation: 'Button controls relay. Relay can switch high-power loads (up to 10A) that Arduino cannot handle directly.',
    },
    alternatives: [], warnings: ['Relay can switch up to 10A at 250VAC'], estimatedTime: '10 min', difficulty: 'intermediate',
  };
}

function generatePowerSupply(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const reg = { id: crypto.randomUUID(), type: 'VREG_7805' as ComponentType, x: 100, y: 100, pin: 95, rotation: 0 };
  const bat = { id: crypto.randomUUID(), type: 'BATTERY_9V' as ComponentType, x: 100, y: 200, pin: 90, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, reg, bat, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: bat.id, fromPin: 90, toComponentId: reg.id, toPin: 95, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: reg.id, fromPin: 95, toComponentId: res.id, toPin: 0, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Power Supply\n// 9V battery → LM7805 → 5V regulated output\n// Green LED indicates power is on',
      explanation: 'LM7805 regulates 9V battery down to stable 5V. Green LED shows power is on. Input must be ≥7V.',
    },
    alternatives: [], warnings: ['LM7805 needs ≥7V input', 'Add 0.33µF input and 0.1µF output capacitors'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

// ============================================================
// EXPANDED PATTERNS (20 → 50+)
// ============================================================

const EXPANDED_PATTERNS: Record<string, (req: CircuitDesignRequest) => CircuitDesignResult> = {
  // Lighting
  'led fade': (req) => generateLEDFade(req),
  'pwm dimmer': (req) => generateLEDFade(req),
  'breathing led': (req) => generateLEDFade(req),
  'led chaser': (req) => generateLEDChaser(req),
  'running lights': (req) => generateLEDChaser(req),

  // Sensors
  'light alarm': (req) => generateLightAlarm(req),
  'dark detector': (req) => generateNightLight(req),
  'soil monitor': (req) => generateSoilMonitor(req),
  'plant waterer': (req) => generatePlantWaterer(req),
  'fire detector': (req) => generateFireDetector(req),
  'gas detector': (req) => generateGasDetector(req),
  'rain detector': (req) => generateRainDetector(req),
  'heart monitor': (req) => generateHeartMonitor(req),
  'compass': (req) => generateCompass(req),
  'gps tracker': (req) => generateGPSTracker(req),

  // Motors & Actuators
  'robot arm': (req) => generateRobotArm(req),
  'robot car': (req) => generateRobotCar(req),
  'line follower': (req) => generateLineFollower(req),
  'stepper motor': (req) => generateStepperControl(req),

  // Communication
  'bluetooth control': (req) => generateBluetoothControl(req),
  'wifi sensor': (req) => generateWiFiSensor(req),
  'serial monitor': (req) => generateSerialMonitor(req),

  // Display
  'countdown': (req) => generateCountdownTimer(req),
  'score counter': (req) => generateScoreCounter(req),
  'clock': (req) => generateDigitalClock(req),
  'matrix animation': (req) => generateMatrixAnimation(req),

  // Sound
  'piano': (req) => generatePiano(req),
  'alarm siren': (req) => generateAlarmSiren(req),
  'doorbell': (req) => generateDoorbell(req),

  // Power
  'battery monitor': (req) => generateBatteryMonitor(req),
  'solar charger': (req) => generateSolarCharger(req),
  'voltage regulator': (req) => generatePowerSupply(req),

  // Advanced
  'op-amp amplifier': (req) => generateOpAmpAmplifier(req),
  'zener regulator': (req) => generateZenerRegulator(req),
  'logic gates': (req) => generateLogicGates(req),
  '555 timer': (req) => generate555Timer(req),
  'capacitor charge': (req) => generateCapacitorCharge(req),
};

// ============================================================
// NEW CIRCUIT GENERATORS
// ============================================================

function generateLEDFade(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 100, y: 150, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 200, y: 150, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 9, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// LED Fade (PWM)\nvoid loop() {\n  for (int i = 0; i <= 255; i++) {\n    analogWrite(9, i);\n    delay(10);\n  }\n  for (int i = 255; i >= 0; i--) {\n    analogWrite(9, i);\n    delay(10);\n  }\n}',
      explanation: 'PWM fades LED from off to full brightness and back. Pin 9 is PWM-capable.',
    },
    alternatives: [], warnings: ['Use PWM-capable pin (3,5,6,9,10,11)'], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateLEDChaser(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const leds = [2,3,4,5,6,7].map((pin, i) => ({
    id: crypto.randomUUID(), type: `LED_${['RED','YELLOW','GREEN','RED','YELLOW','GREEN'][i]}` as ComponentType,
    x: 80 + i * 40, y: 100, pin: 0, rotation: 0
  }));
  const components = [mc, ...leds];
  const wires: Wire[] = leds.map((led, i) => ({
    id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: i + 2, toComponentId: led.id, toPin: 0, color: '#ef4444'
  }));
  return {
    success: true,
    circuit: { components, wires,
      code: '// LED Chaser\nint pins[] = {2,3,4,5,6,7};\nvoid loop() {\n  for (int i = 0; i < 6; i++) {\n    digitalWrite(pins[i], HIGH);\n    delay(100);\n    digitalWrite(pins[i], LOW);\n  }\n}',
      explanation: 'LEDs light up one after another creating a chasing effect.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateLightAlarm(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const ldr = { id: crypto.randomUUID(), type: 'LIGHT_SENSOR' as ComponentType, x: 100, y: 80, pin: 5, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 180, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_YELLOW' as ComponentType, x: 180, y: 80, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 180, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, ldr, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: ldr.id, toPin: 5, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Light Alarm\nvoid loop() {\n  int light = analogRead(A5);\n  if (light > 800) {\n    digitalWrite(8, HIGH);\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(100);\n}',
      explanation: 'When light exceeds threshold, buzzer and LED activate.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateSoilMonitor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const soil = { id: crypto.randomUUID(), type: 'SOIL_SENSOR' as ComponentType, x: 100, y: 100, pin: 33, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, soil, lcd, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 3, toComponentId: soil.id, toPin: 33, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Soil Moisture Monitor\nvoid loop() {\n  int moisture = analogRead(A3);\n  lcd.setCursor(0, 0);\n  lcd.print("Soil: ");\n  lcd.print(moisture);\n  if (moisture < 300) digitalWrite(13, HIGH);\n  else digitalWrite(13, LOW);\n  delay(1000);\n}',
      explanation: 'Reads soil moisture. Low value = dry soil. LED indicates when watering needed.',
    },
    alternatives: [], warnings: ['Calibrate sensor in dry and wet soil'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generatePlantWaterer(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const soil = { id: crypto.randomUUID(), type: 'SOIL_SENSOR' as ComponentType, x: 100, y: 80, pin: 33, rotation: 0 };
  const pump = { id: crypto.randomUUID(), type: 'PUMP' as ComponentType, x: 100, y: 200, pin: 7, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_BLUE' as ComponentType, x: 180, y: 80, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, soil, pump, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 3, toComponentId: soil.id, toPin: 33, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 7, toComponentId: pump.id, toPin: 7, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Auto Plant Waterer\nvoid loop() {\n  int moisture = analogRead(A3);\n  if (moisture < 300) {\n    digitalWrite(7, HIGH); // Pump ON\n    digitalWrite(13, HIGH); // LED ON\n    delay(5000); // Water for 5 seconds\n    digitalWrite(7, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(60000); // Check every minute\n}',
      explanation: 'When soil is dry, pump activates for 5 seconds. Checks every minute.',
    },
    alternatives: [], warnings: ['Use relay for pump if > 200mA'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateFireDetector(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const flame = { id: crypto.randomUUID(), type: 'FLAME_SENSOR' as ComponentType, x: 100, y: 100, pin: 31, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, flame, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: flame.id, toPin: 31, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Fire Detector\nvoid loop() {\n  if (digitalRead(5) == LOW) { // Flame = LOW\n    digitalWrite(8, HIGH); // Alarm\n    digitalWrite(13, HIGH); // LED\n    delay(500);\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(100);\n}',
      explanation: 'Flame sensor output goes LOW when fire is detected. Triggers alarm and LED.',
    },
    alternatives: [], warnings: ['Sensor needs clear line of sight to flame'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateGasDetector(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const gas = { id: crypto.randomUUID(), type: 'GAS_SENSOR' as ComponentType, x: 100, y: 100, pin: 30, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, gas, buzzer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: gas.id, toPin: 30, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Gas Detector\nvoid loop() {\n  int gasLevel = analogRead(A5);\n  if (gasLevel > 400) {\n    digitalWrite(8, HIGH);\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(8, LOW);\n    digitalWrite(13, LOW);\n  }\n  delay(500);\n}',
      explanation: 'MQ-2 detects gas/smoke. High analog value = dangerous gas levels.',
    },
    alternatives: [], warnings: ['Sensor needs 2-5 min warm-up time'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateRainDetector(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const rain = { id: crypto.randomUUID(), type: 'RAIN_SENSOR' as ComponentType, x: 100, y: 100, pin: 32, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const components = [mc, rain, buzzer];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 6, toComponentId: rain.id, toPin: 32, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Rain Detector\nvoid loop() {\n  int rainLevel = analogRead(A6);\n  if (rainLevel > 500) {\n    digitalWrite(8, HIGH); // Alarm\n    delay(2000);\n    digitalWrite(8, LOW);\n  }\n  delay(1000);\n}',
      explanation: 'Rain sensor detects water. High value = raining. Triggers alarm.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateHeartMonitor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const pulse = { id: crypto.randomUUID(), type: 'HEARTBEAT' as ComponentType, x: 100, y: 100, pin: 40, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, pulse, lcd, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 7, toComponentId: pulse.id, toPin: 40, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Heart Rate Monitor\nunsigned long lastBeat = 0;\nint bpm = 0;\nvoid loop() {\n  int val = analogRead(A7);\n  if (val > 600 && millis() - lastBeat > 300) {\n    bpm = 60000 / (millis() - lastBeat);\n    lastBeat = millis();\n    digitalWrite(13, HIGH);\n    delay(50);\n    digitalWrite(13, LOW);\n  }\n  lcd.setCursor(0, 0);\n  lcd.print("BPM: ");\n  lcd.print(bpm);\n  delay(100);\n}',
      explanation: 'Pulse sensor detects heartbeats. Calculates BPM from time between beats.',
    },
    alternatives: [], warnings: ['Finger must be still for accurate reading'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateCompass(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const compass = { id: crypto.randomUUID(), type: 'COMPASS' as ComponentType, x: 100, y: 100, pin: 20, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const components = [mc, compass, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 18, toComponentId: compass.id, toPin: 20, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Digital Compass\nvoid loop() {\n  int heading = readCompass();\n  lcd.setCursor(0, 0);\n  lcd.print("Heading: ");\n  lcd.print(heading);\n  lcd.print(" deg");\n  delay(200);\n}',
      explanation: 'HMC5883L compass reads magnetic heading (0-360°). Display on LCD.',
    },
    alternatives: [], warnings: ['Keep away from magnets and metal'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateGPSTracker(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const gps = { id: crypto.randomUUID(), type: 'GPS' as ComponentType, x: 100, y: 100, pin: 0, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const components = [mc, gps, lcd];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 0, toComponentId: gps.id, toPin: 0, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// GPS Tracker\nvoid loop() {\n  if (gps.available()) {\n    float lat = gps.location.lat();\n    float lng = gps.location.lng();\n    lcd.setCursor(0, 0);\n    lcd.print("Lat: "); lcd.print(lat, 4);\n    lcd.setCursor(0, 1);\n    lcd.print("Lng: "); lcd.print(lng, 4);\n  }\n  delay(1000);\n}',
      explanation: 'NEO-6M GPS reads latitude and longitude. Display on LCD.',
    },
    alternatives: [], warnings: ['Needs outdoor sky view for GPS fix'], estimatedTime: '15 min', difficulty: 'advanced',
  };
}

function generateRobotArm(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const srv1 = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 80, y: 100, pin: 9, rotation: 0 };
  const srv2 = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 180, y: 100, pin: 10, rotation: 0 };
  const srv3 = { id: crypto.randomUUID(), type: 'SERVO' as ComponentType, x: 280, y: 100, pin: 11, rotation: 0 };
  const components = [mc, srv1, srv2, srv3];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 9, toComponentId: srv1.id, toPin: 9, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 10, toComponentId: srv2.id, toPin: 10, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 11, toComponentId: srv3.id, toPin: 11, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Robot Arm (3 Servos)\nServo base, shoulder, gripper;\nvoid setup() {\n  base.attach(9); shoulder.attach(10); gripper.attach(11);\n}\nvoid loop() {\n  base.write(90); delay(500);\n  shoulder.write(45); delay(500);\n  gripper.write(0); delay(500);\n  gripper.write(90); delay(500);\n}',
      explanation: '3 servos control base rotation, shoulder, and gripper for a simple robot arm.',
    },
    alternatives: [], warnings: ['Each servo draws ~150mA, total ~450mA'], estimatedTime: '20 min', difficulty: 'advanced',
  };
}

function generateRobotCar(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const mot1 = { id: crypto.randomUUID(), type: 'MOTOR_DC' as ComponentType, x: 80, y: 80, pin: 6, rotation: 0 };
  const mot2 = { id: crypto.randomUUID(), type: 'MOTOR_DC' as ComponentType, x: 80, y: 200, pin: 5, rotation: 0 };
  const trn1 = { id: crypto.randomUUID(), type: 'TRANSISTOR_NPN' as ComponentType, x: 180, y: 80, pin: 0, rotation: 0 };
  const trn2 = { id: crypto.randomUUID(), type: 'TRANSISTOR_NPN' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0 };
  const res1 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 250, y: 80, pin: 0, rotation: 0, resistance: 1000 };
  const res2 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 250, y: 200, pin: 0, rotation: 0, resistance: 1000 };
  const components = [mc, mot1, mot2, trn1, trn2, res1, res2];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 6, toComponentId: res1.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 5, toComponentId: res2.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: res1.id, fromPin: 0, toComponentId: trn1.id, toPin: 0, color: '#fbbf24' },
    { id: crypto.randomUUID(), fromComponentId: res2.id, fromPin: 0, toComponentId: trn2.id, toPin: 0, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Robot Car (2 Motors)\nvoid forward() { digitalWrite(6, HIGH); digitalWrite(5, HIGH); }\nvoid backward() { digitalWrite(6, LOW); digitalWrite(5, LOW); }\nvoid turnLeft() { digitalWrite(6, LOW); digitalWrite(5, HIGH); }\nvoid turnRight() { digitalWrite(6, HIGH); digitalWrite(5, LOW); }',
      explanation: 'Two DC motors control left and right wheels. Transistors switch high-current motors.',
    },
    alternatives: [], warnings: ['Need motor driver board for production'], estimatedTime: '25 min', difficulty: 'advanced',
  };
}

function generateLineFollower(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const ldr1 = { id: crypto.randomUUID(), type: 'LIGHT_SENSOR' as ComponentType, x: 100, y: 80, pin: 14, rotation: 0 };
  const ldr2 = { id: crypto.randomUUID(), type: 'LIGHT_SENSOR' as ComponentType, x: 100, y: 200, pin: 15, rotation: 0 };
  const mot = { id: crypto.randomUUID(), type: 'MOTOR_DC' as ComponentType, x: 180, y: 140, pin: 6, rotation: 0 };
  const components = [mc, ldr1, ldr2, mot];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: ldr1.id, toPin: 14, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 15, toComponentId: ldr2.id, toPin: 15, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 6, toComponentId: mot.id, toPin: 6, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Line Follower\nvoid loop() {\n  int left = analogRead(A0);\n  int right = analogRead(A1);\n  if (left < right) { digitalWrite(6, HIGH); }\n  else { digitalWrite(6, LOW); }\n  delay(50);\n}',
      explanation: 'Two LDRs detect black line. Motor turns toward the darker side.',
    },
    alternatives: [], warnings: ['Needs IR sensors for better performance'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateStepperControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const stepper = { id: crypto.randomUUID(), type: 'STEPPER' as ComponentType, x: 100, y: 150, pin: 16, rotation: 0 };
  const components = [mc, stepper];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: stepper.id, toPin: 16, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Stepper Motor\nvoid loop() {\n  for (int i = 0; i < 200; i++) {\n    digitalWrite(8, HIGH); delay(2);\n    digitalWrite(8, LOW); delay(2);\n  }\n  delay(1000);\n}',
      explanation: 'Stepper motor moves in discrete steps. 200 steps = 1 full revolution.',
    },
    alternatives: [], warnings: ['Needs driver board (ULN2003 or A4988)'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateBluetoothControl(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const bt = { id: crypto.randomUUID(), type: 'BLUETOOTH' as ComponentType, x: 100, y: 150, pin: 43, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, bt, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 1, toComponentId: bt.id, toPin: 43, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Bluetooth Control\nvoid loop() {\n  if (Serial.available()) {\n    char cmd = Serial.read();\n    if (cmd == \'1\') digitalWrite(13, HIGH);\n    if (cmd == \'0\') digitalWrite(13, LOW);\n  }\n}',
      explanation: 'Send "1" or "0" via Bluetooth to control LED. HC-05 default baud: 9600.',
    },
    alternatives: [], warnings: ['HC-05 RX needs voltage divider (5V→3.3V)'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateWiFiSensor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ESP32_DEVKIT' as ComponentType, x: 300, y: 200, pin: 2, rotation: 0 };
  const dht = { id: crypto.randomUUID(), type: 'DHT11' as ComponentType, x: 100, y: 100, pin: 4, rotation: 0 };
  const components = [mc, dht];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: dht.id, toPin: 4, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// WiFi Temperature Sensor (ESP32)\n#include <WiFi.h>\nvoid setup() {\n  WiFi.begin("SSID", "password");\n}\nvoid loop() {\n  float t = readDHT11();\n  // Send to web server or MQTT\n  delay(5000);\n}',
      explanation: 'ESP32 reads temperature and sends data over WiFi. Can post to web server or MQTT broker.',
    },
    alternatives: [], warnings: ['ESP32 uses 3.3V logic'], estimatedTime: '15 min', difficulty: 'advanced',
  };
}

function generateSerialMonitor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const pot = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 100, y: 150, pin: 97, rotation: 0 };
  const components = [mc, pot];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: pot.id, toPin: 97, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Serial Monitor\nvoid loop() {\n  int val = analogRead(A0);\n  Serial.print("Pot value: ");\n  Serial.println(val);\n  delay(500);\n}',
      explanation: 'Reads potentiometer and displays value on Serial Monitor (9600 baud).',
    },
    alternatives: [], warnings: [], estimatedTime: '5 min', difficulty: 'beginner',
  };
}

function generateScoreCounter(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const seg = { id: crypto.randomUUID(), type: 'SEVEN_SEGMENT' as ComponentType, x: 100, y: 150, pin: 96, rotation: 0 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 250, pin: 4, rotation: 0 };
  const components = [mc, seg, btn];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: seg.id, toPin: 96, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 4, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Score Counter\nint score = 0;\nvoid loop() {\n  if (digitalRead(4) == HIGH && score < 9) {\n    score++;\n    displayDigit(score);\n    delay(500);\n  }\n}',
      explanation: 'Button increments score displayed on 7-segment display.',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateDigitalClock(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 150, pin: 95, rotation: 0 };
  const rtc = { id: crypto.randomUUID(), type: 'RTC' as ComponentType, x: 100, y: 250, pin: 46, rotation: 0 };
  const components = [mc, lcd, rtc];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 18, toComponentId: rtc.id, toPin: 46, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Digital Clock\nvoid loop() {\n  DateTime now = rtc.now();\n  lcd.setCursor(0, 0);\n  lcd.print(now.hour());\n  lcd.print(":");\n  lcd.print(now.minute());\n  lcd.print(":");\n  lcd.print(now.second());\n  delay(1000);\n}',
      explanation: 'DS3231 RTC keeps time even when power is off. Displays HH:MM:SS on LCD.',
    },
    alternatives: [], warnings: ['RTC needs CR2032 backup battery'], estimatedTime: '15 min', difficulty: 'intermediate',
  };
}

function generateMatrixAnimation(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const matrix = { id: crypto.randomUUID(), type: 'MATRIX' as ComponentType, x: 100, y: 150, pin: 10, rotation: 0 };
  const components = [mc, matrix];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 10, toComponentId: matrix.id, toPin: 10, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// LED Matrix Animation\nbyte smiley[] = {\n  B00111100,\n  B01000010,\n  B10100101,\n  B10000001,\n  B10100101,\n  B10011001,\n  B01000010,\n  B00111100\n};\nvoid setup() { matrix.drawBitmap(0, 0, smiley, 8, 8, 1); }',
      explanation: 'MAX7219 drives 8×8 LED matrix. Can display patterns, text, animations.',
    },
    alternatives: [], warnings: [], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generatePiano(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const speaker = { id: crypto.randomUUID(), type: 'SPEAKER' as ComponentType, x: 100, y: 100, pin: 8, rotation: 0 };
  const buttons = [2,3,4,5].map(pin => ({
    id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 80 + (pin-2) * 40, y: 200, pin, rotation: 0
  }));
  const components = [mc, speaker, ...buttons];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: speaker.id, toPin: 8, color: '#fbbf24' },
    ...buttons.map(btn => ({
      id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: btn.pin, toComponentId: btn.id, toPin: btn.pin, color: '#3b82f6'
    })),
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// 4-Key Piano\nint notes[] = {262, 294, 330, 392};\nint pins[] = {2, 3, 4, 5};\nvoid loop() {\n  for (int i = 0; i < 4; i++) {\n    if (digitalRead(pins[i]) == HIGH) tone(8, notes[i], 200);\n  }\n}',
      explanation: '4 buttons play different musical notes (C, D, E, G).',
    },
    alternatives: [], warnings: [], estimatedTime: '10 min', difficulty: 'beginner',
  };
}

function generateAlarmSiren(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 150, pin: 8, rotation: 0 };
  const components = [mc, buzzer];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Alarm Siren\nvoid loop() {\n  for (int f = 500; f < 2000; f += 10) {\n    tone(8, f, 20);\n  }\n  for (int f = 2000; f > 500; f -= 10) {\n    tone(8, f, 20);\n  }\n}',
      explanation: 'Siren sweeps from 500Hz to 2000Hz and back continuously.',
    },
    alternatives: [], warnings: [], estimatedTime: '5 min', difficulty: 'beginner',
  };
}

function generateDoorbell(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const btn = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 100, y: 100, pin: 4, rotation: 0 };
  const buzzer = { id: crypto.randomUUID(), type: 'BUZZER' as ComponentType, x: 100, y: 200, pin: 8, rotation: 0 };
  const components = [mc, btn, buzzer];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: btn.id, toPin: 4, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 8, toComponentId: buzzer.id, toPin: 8, color: '#fbbf24' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Doorbell\nvoid loop() {\n  if (digitalRead(4) == HIGH) {\n    tone(8, 800, 200);\n    delay(250);\n    tone(8, 1000, 200);\n    delay(500);\n  }\n}',
      explanation: 'Two-tone doorbell: press button to hear "ding-dong" sound.',
    },
    alternatives: [], warnings: [], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generateBatteryMonitor(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const bat = { id: crypto.randomUUID(), type: 'BATTERY_9V' as ComponentType, x: 100, y: 100, pin: 90, rotation: 0 };
  const lcd = { id: crypto.randomUUID(), type: 'LCD' as ComponentType, x: 100, y: 250, pin: 95, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0, resistance: 10000 };
  const components = [mc, bat, lcd, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: bat.id, fromPin: 90, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: res.id, toPin: 0, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 4, toComponentId: lcd.id, toPin: 95, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Battery Monitor\nvoid loop() {\n  int raw = analogRead(A0);\n  float voltage = raw * (5.0 / 1023.0) * 2; // Voltage divider\n  lcd.setCursor(0, 0);\n  lcd.print("Battery: ");\n  lcd.print(voltage);\n  lcd.print("V");\n  delay(1000);\n}',
      explanation: 'Voltage divider scales battery voltage to safe range for Arduino. Formula: V = raw × (5/1023) × 2.',
    },
    alternatives: [], warnings: ['Use voltage divider to protect Arduino input'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateSolarCharger(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const solar = { id: crypto.randomUUID(), type: 'SOLAR' as ComponentType, x: 100, y: 100, pin: 91, rotation: 0 };
  const bat = { id: crypto.randomUUID(), type: 'BATTERY_AA' as ComponentType, x: 180, y: 100, pin: 91, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 100, y: 200, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, solar, bat, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: solar.id, fromPin: 91, toComponentId: bat.id, toPin: 91, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Solar Charger Indicator\nvoid loop() {\n  int light = analogRead(A0);\n  if (light > 500) digitalWrite(13, HIGH);\n  else digitalWrite(13, LOW);\n  delay(1000);\n}',
      explanation: 'Solar panel charges battery. LED indicates charging status.',
    },
    alternatives: [], warnings: ['Use charge controller for Li-ion batteries'], estimatedTime: '12 min', difficulty: 'intermediate',
  };
}

function generateOpAmpAmplifier(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const opamp = { id: crypto.randomUUID(), type: 'OPAMP_358' as ComponentType, x: 100, y: 150, pin: 95, rotation: 0 };
  const pot = { id: crypto.randomUUID(), type: 'POTENTIOMETER' as ComponentType, x: 100, y: 250, pin: 97, rotation: 0 };
  const components = [mc, opamp, pot];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 14, toComponentId: pot.id, toPin: 97, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: pot.id, fromPin: 97, toComponentId: opamp.id, toPin: 95, color: '#3b82f6' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Op-Amp Amplifier\n// Non-inverting: Gain = 1 + (Rf/Rin)\n// With 10kΩ feedback, Gain = 11\nvoid loop() {\n  int val = analogRead(A0);\n  float amplified = val * 11.0;\n  Serial.println(amplified);\n  delay(100);\n}',
      explanation: 'LM358 amplifies weak signals. Non-inverting gain = 1 + (Rfeedback/Rinput).',
    },
    alternatives: [], warnings: ['Output limited to VCC - 1.5V'], estimatedTime: '15 min', difficulty: 'advanced',
  };
}

function generateZenerRegulator(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const zener = { id: crypto.randomUUID(), type: 'DIODE_ZENER' as ComponentType, x: 100, y: 100, pin: 40, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0, resistance: 470 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 100, y: 200, pin: 0, rotation: 0 };
  const res2 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, zener, res, led, res2];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: zener.id, toPin: 40, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res2.id, toPin: 0, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: res2.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Zener Voltage Regulator\n// 5.1V zener maintains ~5.1V across it\n// Series resistor limits current',
      explanation: 'Zener diode conducts in reverse at breakdown voltage (5.1V). Resistor limits current.',
    },
    alternatives: [], warnings: ['Series resistor is essential to prevent zener destruction'], estimatedTime: '12 min', difficulty: 'advanced',
  };
}

function generateLogicGates(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const andGate = { id: crypto.randomUUID(), type: 'LOGIC_AND' as ComponentType, x: 100, y: 100, pin: 47, rotation: 0 };
  const btn1 = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 50, y: 150, pin: 2, rotation: 0 };
  const btn2 = { id: crypto.randomUUID(), type: 'BUTTON' as ComponentType, x: 150, y: 150, pin: 3, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 100, y: 200, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, andGate, btn1, btn2, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 2, toComponentId: btn1.id, toPin: 2, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 3, toComponentId: btn2.id, toPin: 3, color: '#3b82f6' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// AND Gate Demo\nvoid loop() {\n  int a = digitalRead(2);\n  int b = digitalRead(3);\n  if (a == HIGH && b == HIGH) digitalWrite(13, HIGH);\n  else digitalWrite(13, LOW);\n}',
      explanation: 'LED only lights when BOTH buttons are pressed (AND logic).',
    },
    alternatives: [], warnings: [], estimatedTime: '8 min', difficulty: 'beginner',
  };
}

function generate555Timer(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const timer = { id: crypto.randomUUID(), type: '555_TIMER' as ComponentType, x: 100, y: 150, pin: 49, rotation: 0 };
  const led = { id: crypto.randomUUID(), type: 'LED_RED' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, timer, led, res];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#ef4444' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// 555 Timer Blink\n// NE555 in astable mode\n// f = 1.44 / ((R1 + 2×R2) × C)\n// With R1=1kΩ, R2=10kΩ, C=10µF: f ≈ 6.9Hz',
      explanation: '555 timer generates square wave without Arduino. f = 1.44/((R1+2×R2)×C).',
    },
    alternatives: [], warnings: ['NE555 needs 4.5-16V supply'], estimatedTime: '12 min', difficulty: 'advanced',
  };
}

function generateCapacitorCharge(req: CircuitDesignRequest): CircuitDesignResult {
  const mc = { id: crypto.randomUUID(), type: 'ARDUINO_UNO' as ComponentType, x: 300, y: 200, pin: 13, rotation: 0 };
  const cap = { id: crypto.randomUUID(), type: 'CAPACITOR_ELEC' as ComponentType, x: 100, y: 100, pin: 40, rotation: 0 };
  const res = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 100, pin: 0, rotation: 0, resistance: 10000 };
  const led = { id: crypto.randomUUID(), type: 'LED_GREEN' as ComponentType, x: 100, y: 200, pin: 0, rotation: 0 };
  const res2 = { id: crypto.randomUUID(), type: 'RESISTOR' as ComponentType, x: 180, y: 200, pin: 0, rotation: 0, resistance: 220 };
  const components = [mc, cap, res, led, res2];
  const wires: Wire[] = [
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res.id, toPin: 0, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: res.id, fromPin: 0, toComponentId: cap.id, toPin: 40, color: '#ef4444' },
    { id: crypto.randomUUID(), fromComponentId: mc.id, fromPin: 13, toComponentId: res2.id, toPin: 0, color: '#22c55e' },
    { id: crypto.randomUUID(), fromComponentId: res2.id, fromPin: 0, toComponentId: led.id, toPin: 0, color: '#22c55e' },
  ];
  return {
    success: true,
    circuit: { components, wires,
      code: '// Capacitor Charge/Discharge\n// RC time constant: τ = R × C\n// With R=10kΩ, C=100µF: τ = 1 second\n// Capacitor charges to 63% in 1τ',
      explanation: 'RC circuit demonstrates capacitor charging. Time constant τ = R×C determines charge rate.',
    },
    alternatives: [], warnings: ['Polarized capacitor - observe polarity!'], estimatedTime: '15 min', difficulty: 'advanced',
  };
}

// ============================================================
// AI DESIGN FUNCTION
// ============================================================

export async function designCircuit(request: CircuitDesignRequest): Promise<CircuitDesignResult> {
  const desc = request.description.toLowerCase().trim();

  // Try pattern matching first
  for (const [pattern, generator] of Object.entries(DESIGN_PATTERNS)) {
    if (desc.includes(pattern)) {
      return generator(request);
    }
  }

  // If no pattern matches, try AI generation
  try {
    const prompt = `Design a circuit for: "${request.description}". Return JSON with: components (array of {type, x, y, pin}), wires (array of {fromComponentId, fromPin, toComponentId, toPin}), code (Arduino C++ code), explanation (string). Use real component types from: ARDUINO_UNO, LED_RED, LED_BLUE, LED_GREEN, RESISTOR, BUZZER, SERVO, MOTOR_DC, DHT11, ULTRASONIC, BUTTON, POTENTIOMETER, LCD, OLED, BATTERY_9V, TRANSISTOR_NPN, RELAY, BULB, FAN, SPEAKER, LIGHT_SENSOR, MOTION, GAS_SENSOR, GPS, COMPASS, GYRO.`;

    const response = await generateCodeFromPrompt(prompt, AppMode.HARDWARE);
    // Parse response (simplified - in production would parse JSON)
    return {
      success: true,
      circuit: {
        components: [],
        wires: [],
        code: typeof response === 'string' ? response : '',
        explanation: `AI-generated circuit for: ${request.description}`,
      },
      alternatives: [],
      warnings: ['AI-generated circuit - verify component values'],
      estimatedTime: '15 min',
      difficulty: request.difficulty || 'intermediate',
    };
  } catch (error) {
    return {
      success: false,
      circuit: { components: [], wires: [], code: '', explanation: '' },
      alternatives: [],
      warnings: ['Could not generate circuit. Try a more specific description.'],
      estimatedTime: '',
      difficulty: '',
    };
  }
}
