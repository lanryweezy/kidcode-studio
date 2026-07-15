import { CircuitComponent, Wire } from '../types';

export function exportCircuitAsSVG(
  components: CircuitComponent[],
  wires: Wire[],
  pcbColor: string = '#059669'
): string {
  const width = 600;
  const height = 400;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
  svg += `<rect width="${width}" height="${height}" fill="${pcbColor}" rx="8"/>`;
  svg += `<rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.3"/>`;
  svg += `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.15)"/></pattern></defs>`;

  // Draw wires
  wires.forEach(wire => {
    const from = components.find(c => c.id === wire.fromComponentId);
    const to = components.find(c => c.id === wire.toComponentId);
    if (!from || !to) return;
    const fx = from.x + 10, fy = from.y + 10;
    const tx = to.x + 10, ty = to.y + 10;
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;
    svg += `<path d="M ${fx} ${fy} Q ${fx} ${my}, ${mx} ${my} Q ${tx} ${my}, ${tx} ${ty}" fill="none" stroke="${wire.color || '#fbbf24'}" stroke-width="2" stroke-linecap="round"/>`;
  });

  // Draw components as simple boxes with labels
  const typeLabels: Record<string, string> = {
    ARDUINO_UNO: 'Arduino Uno', ARDUINO_NANO: 'Nano', ARDUINO_MEGA: 'Mega',
    LED_RED: 'Red LED', LED_BLUE: 'Blue LED', LED_GREEN: 'Green LED',
    LED_YELLOW: 'Yellow LED', LED_ORANGE: 'Orange LED', LED_WHITE: 'White LED',
    RGB_LED: 'RGB LED', BULB: 'Bulb', BUZZER: 'Buzzer', RESISTOR: 'Resistor',
    MOTOR_DC: 'DC Motor', SERVO: 'Servo', FAN: 'Fan', BUTTON: 'Button',
    POTENTIOMETER: 'Pot', BATTERY_9V: '9V', BATTERY_AA: 'AA',
    LCD: 'LCD', OLED: 'OLED', DHT11: 'DHT11', ULTRASONIC: 'Ultrasonic',
    LIGHT_SENSOR: 'LDR', TRANSISTOR_NPN: 'NPN', TRANSISTOR_PNP: 'PNP',
    DIODE: 'Diode', CAPACITOR_ELEC: 'Cap', VREG_7805: '7805',
    OPAMP_358: 'OpAmp', NEOPIXEL_RING: 'NeoPixel', ESP32_DEVKIT: 'ESP32',
  };

  components.forEach(comp => {
    const x = comp.x, y = comp.y;
    const label = typeLabels[comp.type] || comp.type.slice(0, 8);
    svg += `<g transform="translate(${x}, ${y}) rotate(${comp.rotation || 0} 10 10)">`;
    svg += `<rect x="0" y="0" width="20" height="20" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>`;
    svg += `<text x="10" y="11" text-anchor="middle" font-size="4" fill="white" font-family="monospace">${label}</text>`;
    svg += `<circle cx="20" cy="0" r="3" fill="#fbbf24" stroke="#000" stroke-width="0.5"/>`;
    svg += `<text x="20" y="1.5" text-anchor="middle" font-size="3" fill="#000" font-weight="bold">${comp.pin}</text>`;
    svg += `</g>`;
  });

  svg += `</svg>`;
  return svg;
}

export function generateArduinoCode(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let code = `// KidCode Studio - Arduino Sketch\n`;
  code += `// Generated circuit with ${components.length} components\n\n`;

  const mc = components.find(c => c.type.includes('ARDUINO') || c.type.includes('ESP'));
  if (mc) {
    code += `// Board: ${mc.type}\n\n`;
  }

  // Find output pins
  const outputPins = new Set<number>();
  const inputPins = new Set<number>();
  components.forEach(comp => {
    if (comp.type.startsWith('LED') || comp.type === 'BULB' || comp.type === 'BUZZER' ||
        comp.type === 'MOTOR_DC' || comp.type === 'SERVO' || comp.type === 'FAN') {
      outputPins.add(comp.pin);
    }
    if (comp.type === 'BUTTON' || comp.type === 'LIGHT_SENSOR' || comp.type === 'DHT11' ||
        comp.type === 'ULTRASONIC' || comp.type === 'POTENTIOMETER') {
      inputPins.add(comp.pin);
    }
  });

  code += `void setup() {\n`;
  outputPins.forEach(pin => {
    code += `  pinMode(${pin}, OUTPUT);\n`;
  });
  inputPins.forEach(pin => {
    code += `  pinMode(${pin}, INPUT);\n`;
  });
  code += `  Serial.begin(9600);\n`;
  code += `}\n\n`;

  code += `void loop() {\n`;

  // Auto-generate based on components
  const leds = components.filter(c => c.type.startsWith('LED') && c.type !== 'RGB_LED');
  if (leds.length > 0) {
    code += `  // LED blink pattern\n`;
    leds.forEach(led => {
      code += `  digitalWrite(${led.pin}, HIGH);\n`;
    });
    code += `  delay(500);\n`;
    leds.forEach(led => {
      code += `  digitalWrite(${led.pin}, LOW);\n`;
    });
    code += `  delay(500);\n`;
  }

  const sensors = components.filter(c => c.type === 'LIGHT_SENSOR' || c.type === 'DHT11');
  if (sensors.length > 0) {
    code += `\n  // Sensor reading\n`;
    sensors.forEach(sen => {
      if (sen.type === 'LIGHT_SENSOR') {
        code += `  int lightValue = analogRead(${sen.pin});\n`;
        code += `  Serial.print("Light: ");\n  Serial.println(lightValue);\n`;
      }
      if (sen.type === 'DHT11') {
        code += `  // Read DHT11 on pin ${sen.pin}\n`;
        code += `  // Use DHT library for temperature/humidity\n`;
      }
    });
  }

  const motors = components.filter(c => c.type === 'SERVO');
  if (motors.length > 0) {
    code += `\n  // Servo sweep\n`;
    code += `  // Include <Servo.h> and use Servo.write()\n`;
  }

  code += `}\n`;
  return code;
}

export function generatePythonCode(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let code = `# KidCode Studio - MicroPython Code\n`;
  code += `# Generated circuit with ${components.length} components\n\n`;

  code += `from machine import Pin, PWM, ADC\n`;
  code += `import time\n\n`;

  const mc = components.find(c => c.type.includes('ESP') || c.type.includes('RASPBERRY'));
  if (mc) {
    code += `# Board: ${mc.type}\n\n`;
  }

  const leds = components.filter(c => c.type.startsWith('LED'));
  leds.forEach(led => {
    code += `led_${led.pin} = Pin(${led.pin}, Pin.OUT)\n`;
  });

  const sensors = components.filter(c => c.type === 'POTENTIOMETER' || c.type === 'LIGHT_SENSOR');
  sensors.forEach(sen => {
    code += `sensor_${sen.pin} = ADC(Pin(${sen.pin}))\n`;
    code += `sensor_${sen.pin}.atten(ADC.ATTN_11DB)\n`;
  });

  code += `\nwhile True:\n`;
  if (leds.length > 0) {
    code += `    led_${leds[0].pin}.on()\n`;
    code += `    time.sleep(0.5)\n`;
    code += `    led_${leds[0].pin}.off()\n`;
    code += `    time.sleep(0.5)\n`;
  } else {
    code += `    time.sleep(1)\n`;
  }

  return code;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateESP32Code(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let code = `// KidCode Studio - ESP32 MicroPython Code\n`;
  code += `# Generated circuit with ${components.length} components\n\n`;

  code += `from machine import Pin, PWM, ADC\n`;
  code += `import time\n\n`;

  const mc = components.find(c => c.type.includes('ESP32'));
  if (mc) {
    code += `# Board: ESP32 DevKit\n\n`;
  }

  const leds = components.filter(c => c.type.startsWith('LED'));
  leds.forEach(led => {
    code += `led_${led.pin} = Pin(${led.pin}, Pin.OUT)\n`;
  });

  const sensors = components.filter(c => c.type === 'POTENTIOMETER' || c.type === 'LIGHT_SENSOR');
  sensors.forEach(sen => {
    code += `sensor_${sen.pin} = ADC(Pin(${sen.pin}))\n`;
    code += `sensor_${sen.pin}.atten(ADC.ATTN_11DB)\n`;
  });

  const servos = components.filter(c => c.type === 'SERVO');
  servos.forEach(servo => {
    code += `servo_${servo.pin} = PWM(Pin(${servo.pin}), freq=50)\n`;
  });

  code += `\nwhile True:\n`;
  if (leds.length > 0) {
    code += `    led_${leds[0].pin}.on()\n`;
    code += `    time.sleep(0.5)\n`;
    code += `    led_${leds[0].pin}.off()\n`;
    code += `    time.sleep(0.5)\n`;
  } else {
    code += `    time.sleep(1)\n`;
  }

  return code;
}

export function generateRaspberryPiCode(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let code = `# KidCode Studio - Raspberry Pi Pico Code\n`;
  code += `# Generated circuit with ${components.length} components\n\n`;

  code += `from machine import Pin, PWM, ADC\n`;
  code += `import time\n\n`;

  const mc = components.find(c => c.type.includes('RASPBERRY'));
  if (mc) {
    code += `# Board: Raspberry Pi Pico\n\n`;
  }

  const leds = components.filter(c => c.type.startsWith('LED'));
  leds.forEach(led => {
    code += `led_${led.pin} = Pin(${led.pin}, Pin.OUT)\n`;
  });

  const sensors = components.filter(c => c.type === 'POTENTIOMETER' || c.type === 'LIGHT_SENSOR');
  sensors.forEach(sen => {
    code += `sensor_${sen.pin} = ADC(Pin(${sen.pin}))\n`;
  });

  const servos = components.filter(c => c.type === 'SERVO');
  servos.forEach(servo => {
    code += `servo_${servo.pin} = PWM(Pin(${servo.pin}))\n`;
    code += `servo_${servo.pin}.freq(50)\n`;
  });

  code += `\nwhile True:\n`;
  if (leds.length > 0) {
    code += `    led_${leds[0].pin}.on()\n`;
    code += `    time.sleep(0.5)\n`;
    code += `    led_${leds[0].pin}.off()\n`;
    code += `    time.sleep(0.5)\n`;
  } else {
    code += `    time.sleep(1)\n`;
  }

  return code;
}

export function generateKiCadSchematic(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let kicad = `(kicad_sch\n  (version 20230121)\n  (generator "kidcode_studio")\n\n`;

  kicad += `  (lib_symbols\n`;

  const symbolTypes: Record<string, string> = {
    LED_RED: 'LED', LED_GREEN: 'LED', LED_BLUE: 'LED', LED_YELLOW: 'LED',
    RESISTOR: 'R', CAPACITOR_ELEC: 'C', BATTERY_9V: 'Battery', BATTERY_AA: 'Battery',
    ARDUINO_UNO: 'MCU_ST_ATmega328P', ESP32_DEVKIT: 'MCU_ESP32',
    SERVO: 'Motor', MOTOR_DC: 'Motor', BUTTON: 'SW_Push', POTENTIOMETER: 'R_Potentiometer',
    BUZZER: 'Buzzer', DHT11: 'Sensor', ULTRASONIC: 'Sensor',
  };

  components.forEach(comp => {
    const symbol = symbolTypes[comp.type] || 'Device';
    kicad += `    (${symbol} "${comp.type}"\n`;
    kicad += `      (pin_names (offset 1.016))\n`;
    kicad += `      (exclude_from_sim no)\n`;
    kicad += `      (in_bom yes)\n`;
    kicad += `      (on_board yes)\n`;
    kicad += `    )\n`;
  });

  kicad += `  )\n\n`;

  components.forEach(comp => {
    kicad += `  (symbol "${comp.type}" (lib_id "${symbolTypes[comp.type] || 'Device'}:${comp.type}")\n`;
    kicad += `    (at ${comp.x} ${comp.y} ${comp.rotation || 0})\n`;
    kicad += `    (unit 1)\n`;
    kicad += `  )\n`;
  });

  kicad += `\n  (wire\n`;
  wires.forEach(wire => {
    const from = components.find(c => c.id === wire.fromComponentId);
    const to = components.find(c => c.id === wire.toComponentId);
    if (from && to) {
      kicad += `    (pts (xy ${from.x} ${from.y}) (xy ${to.x} ${to.y}))\n`;
    }
  });

  kicad += `  )\n\n`;
  kicad += `)`;

  return kicad;
}

export function generateEagleSchematic(
  components: CircuitComponent[],
  wires: Wire[]
): string {
  let eagle = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  eagle += `<eagle version="9.6.2">\n`;
  eagle += `  <schematic>\n`;
  eagle += `    <sheets>\n`;
  eagle += `      <sheet>\n`;
  eagle += `        <plain>\n`;

  components.forEach(comp => {
    const pkg = getEaglePackage(comp.type);
    eagle += `          <part name="${comp.id}" library="${getEagleLibrary(comp.type)}" deviceset="${comp.type}" value="${comp.type}">\n`;
    eagle += `            <instance x="${comp.x}" y="${comp.y}" rot="R${comp.rotation || 0}"/>\n`;
    eagle += `          </part>\n`;
  });

  eagle += `        </plain>\n`;
  eagle += `        <nets>\n`;

  wires.forEach((wire, idx) => {
    const from = components.find(c => c.id === wire.fromComponentId);
    const to = components.find(c => c.id === wire.toComponentId);
    if (from && to) {
      eagle += `          <net name="N$${idx + 1}">\n`;
      eagle += `            <segment>\n`;
      eagle += `              <pinref part="${from.id}" gate="${from.type}" pin="1"/>\n`;
      eagle += `              <pinref part="${to.id}" gate="${to.type}" pin="1"/>\n`;
      eagle += `            </segment>\n`;
      eagle += `          </net>\n`;
    }
  });

  eagle += `        </nets>\n`;
  eagle += `      </sheet>\n`;
  eagle += `    </sheets>\n`;
  eagle += `  </schematic>\n`;
  eagle += `</eagle>`;

  return eagle;
}

function getEaglePackage(type: string): string {
  const packageMap: Record<string, string> = {
    RESISTOR: 'R0805', CAPACITOR_ELEC: 'CPOL-EUE2.5-6', LED_RED: 'LED-3MM',
    ARDUINO_UNO: 'ARDUINO_UNO', ESP32_DEVKIT: 'ESP32_DEVKIT', BUTTON: '6MM_SW',
    SERVO: 'SERVO', MOTOR_DC: 'MOTOR_DC', BATTERY_9V: 'BATTERY_9V',
  };
  return packageMap[type] || 'R0805';
}

function getEagleLibrary(type: string): string {
  if (type.startsWith('LED') || type === 'RGB_LED') return 'opto';
  if (type === 'RESISTOR' || type === 'CAPACITOR_ELEC') return 'rcl';
  if (type === 'ARDUINO_UNO' || type === 'ESP32_DEVKIT') return 'mcu';
  if (type === 'BUTTON' || type === 'POTENTIOMETER') return 'switches';
  return 'device';
}

export function exportCircuitAsPNG(
  svgString: string,
  callback: (dataUrl: string) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1200, 800);
    ctx.drawImage(img, 0, 0, 1200, 800);
    callback(canvas.toDataURL('image/png'));
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
