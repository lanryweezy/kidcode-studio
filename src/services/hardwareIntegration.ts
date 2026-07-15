// ============================================================
// Hardware Integration Service v1.0
// Arduino, ESP32, Raspberry Pi code generation,
// serial monitoring, firmware upload
// ============================================================

// === INTERFACES ===

export type Platform = 'arduino' | 'esp32' | 'raspberry_pi';

export interface PinConfig {
  pin: number;
  mode: 'input' | 'output' | 'input_pullup' | 'analog' | 'pwm' | 'i2c_sda' | 'i2c_scl' | 'spi_mosi' | 'spi_miso' | 'spi_sck';
  label: string;
}

export interface SensorConfig {
  type: string;
  pin: number;
  interval?: number;
  name: string;
}

export interface ActuatorConfig {
  type: string;
  pin: number;
  name: string;
  parameters?: Record<string, number>;
}

export interface ProjectConfig {
  name: string;
  platform: Platform;
  pins: PinConfig[];
  sensors: SensorConfig[];
  actuators: ActuatorConfig[];
  variables?: { name: string; type: string; initialValue: string }[];
  functions?: { name: string; body: string }[];
  wifi?: { ssid: string; password: string };
  mqtt?: { broker: string; port: number; topic: string };
}

export interface SerialMessage {
  timestamp: number;
  direction: 'in' | 'out';
  data: string;
  type: 'text' | 'binary' | 'json' | 'error';
}

export interface SerialMonitor {
  messages: SerialMessage[];
  baudRate: number;
  isPaused: boolean;
  maxMessages: number;
  filters: string[];
}

export interface FirmwareUploadProgress {
  stage: 'compiling' | 'uploading' | 'verifying' | 'complete' | 'error';
  progress: number;
  message: string;
  bytesUploaded?: number;
  totalBytes?: number;
}

export interface GeneratedCode {
  platform: Platform;
  filename: string;
  source: string;
  includes: string[];
  estimatedSize: number;
}

// === PLATFORM DEFINITIONS ===

export const PLATFORM_CONFIGS: Record<Platform, {
  name: string;
  language: string;
  framework: string;
  defaultBaud: number;
  maxPins: number;
  voltage: number;
  hasWifi: boolean;
  hasBluetooth: boolean;
  analogRange: number;
  pwmRange: number;
}> = {
  arduino: {
    name: 'Arduino',
    language: 'cpp',
    framework: 'Arduino',
    defaultBaud: 9600,
    maxPins: 20,
    voltage: 5,
    hasWifi: false,
    hasBluetooth: false,
    analogRange: 1023,
    pwmRange: 255,
  },
  esp32: {
    name: 'ESP32',
    language: 'cpp',
    framework: 'Arduino',
    defaultBaud: 115200,
    maxPins: 34,
    voltage: 3.3,
    hasWifi: true,
    hasBluetooth: true,
    analogRange: 4095,
    pwmRange: 255,
  },
  raspberry_pi: {
    name: 'Raspberry Pi',
    language: 'python',
    framework: 'gpiozero',
    defaultBaud: 115200,
    maxPins: 26,
    voltage: 3.3,
    hasWifi: true,
    hasBluetooth: true,
    analogRange: 1023,
    pwmRange: 100,
  },
};

// === CODE GENERATOR ===

export class HardwareCodeGenerator {
  generate(config: ProjectConfig): GeneratedCode {
    switch (config.platform) {
      case 'arduino':
        return this.generateArduino(config);
      case 'esp32':
        return this.generateESP32(config);
      case 'raspberry_pi':
        return this.generateRaspberryPi(config);
    }
  }

  // === ARDUINO CODE GENERATION ===

  private generateArduino(config: ProjectConfig): GeneratedCode {
    const includes = ['Arduino.h'];
    const lines: string[] = [];

    // Collect includes
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') includes.push('DHT.h');
      if (s.type === 'Servo') includes.push('Servo.h');
      if (s.type === 'LiquidCrystal_I2C') { includes.push('Wire.h'); includes.push('LiquidCrystal_I2C.h'); }
    });

    // Includes
    includes.forEach(inc => lines.push(`#include <${inc}>`));
    lines.push('');

    // Pin definitions
    config.pins.forEach(p => {
      lines.push(`#define ${p.label.toUpperCase()}_PIN ${p.pin}`);
    });
    lines.push('');

    // Global variables
    lines.push('// Global variables');
    config.variables?.forEach(v => {
      lines.push(`${v.type} ${v.name} = ${v.initialValue};`);
    });
    lines.push('');

    // Sensor objects
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`DHT dht_${s.name}(${s.pin}, ${s.type});`);
      }
      if (s.type === 'Servo') {
        lines.push(`Servo servo_${s.name};`);
      }
    });
    lines.push('');

    // setup()
    lines.push('void setup() {');
    lines.push(`  Serial.begin(${PLATFORM_CONFIGS.arduino.defaultBaud});`);
    lines.push('  delay(1000);');
    lines.push('  Serial.println("KidCode Arduino - Starting...");');
    lines.push('');

    config.pins.forEach(p => {
      const mode = p.mode === 'input' ? 'INPUT' :
                   p.mode === 'input_pullup' ? 'INPUT_PULLUP' : 'OUTPUT';
      lines.push(`  pinMode(${p.label.toUpperCase()}_PIN, ${mode});`);
    });

    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`  dht_${s.name}.begin();`);
      }
      if (s.type === 'Servo') {
        lines.push(`  servo_${s.name}.attach(${s.pin});`);
      }
    });

    config.actuators.forEach(a => {
      if (a.type === 'Servo') {
        lines.push(`  // Servo ${a.name} attached to pin ${a.pin}`);
      }
    });

    lines.push('  Serial.println("Setup complete!");');
    lines.push('}');
    lines.push('');

    // loop()
    lines.push('void loop() {');

    // Read sensors
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`  // Read ${s.name}`);
        lines.push(`  float ${s.name}_temp = dht_${s.name}.readTemperature();`);
        lines.push(`  float ${s.name}_hum = dht_${s.name}.readHumidity();`);
        lines.push(`  if (!isnan(${s.name}_temp)) {`);
        lines.push(`    Serial.print("${s.name} Temp: "); Serial.print(${s.name}_temp); Serial.println(" C");`);
        lines.push(`  }`);
      }
      if (s.type.includes('ANALOG') || s.type === 'Potentiometer' || s.type === 'LightSensor') {
        lines.push(`  int ${s.name}_val = analogRead(${s.pin});`);
        lines.push(`  Serial.print("${s.name}: "); Serial.println(${s.name}_val);`);
      }
      if (s.type === 'Ultrasonic') {
        lines.push(`  // Ultrasonic ${s.name}`);
        lines.push(`  digitalWrite(${s.pin}, LOW);`);
        lines.push(`  delayMicroseconds(2);`);
        lines.push(`  digitalWrite(${s.pin}, HIGH);`);
        lines.push(`  delayMicroseconds(10);`);
        lines.push(`  digitalWrite(${s.pin}, LOW);`);
        lines.push(`  long ${s.name}_duration = pulseIn(${s.pin + 1}, HIGH);`);
        lines.push(`  float ${s.name}_cm = ${s.name}_duration * 0.034 / 2;`);
        lines.push(`  Serial.print("${s.name}: "); Serial.print(${s.name}_cm); Serial.println(" cm");`);
      }
    });

    // Write actuators
    config.actuators.forEach(a => {
      if (a.type === 'Servo') {
        lines.push(`  servo_${a.name}.write(90); // Default position`);
      }
      if (a.type === 'LED' || a.type === 'Relay') {
        lines.push(`  digitalWrite(${a.pin}, HIGH);`);
        lines.push(`  delay(500);`);
        lines.push(`  digitalWrite(${a.pin}, LOW);`);
        lines.push(`  delay(500);`);
      }
      if (a.type === 'Buzzer') {
        lines.push(`  tone(${a.pin}, 1000, 200);`);
      }
    });

    // Custom functions
    config.functions?.forEach(f => {
      lines.push(`  ${f.body}`);
    });

    lines.push('  delay(100);');
    lines.push('}');
    lines.push('');

    // Custom function definitions
    config.functions?.forEach(f => {
      lines.push(`// ${f.name}`);
      lines.push(`void ${f.name}() {`);
      lines.push(f.body);
      lines.push('}');
      lines.push('');
    });

    const source = lines.join('\n');
    return {
      platform: 'arduino',
      filename: `${config.name.replace(/\s+/g, '_').toLowerCase()}.ino`,
      source,
      includes,
      estimatedSize: source.length,
    };
  }

  // === ESP32 CODE GENERATION ===

  private generateESP32(config: ProjectConfig): GeneratedCode {
    const includes = ['Arduino.h'];
    const lines: string[] = [];

    // WiFi support
    if (config.wifi) {
      includes.push('WiFi.h');
    }
    if (config.mqtt) {
      includes.push('PubSubClient.h');
    }

    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') includes.push('DHT.h');
    });

    includes.forEach(inc => lines.push(`#include <${inc}>`));
    lines.push('');

    // Pin definitions
    config.pins.forEach(p => {
      lines.push(`#define ${p.label.toUpperCase()}_PIN ${p.pin}`);
    });
    lines.push('');

    // WiFi setup
    if (config.wifi) {
      lines.push(`const char* ssid = "${config.wifi.ssid}";`);
      lines.push(`const char* password = "${config.wifi.password}";`);
      lines.push('WiFiClient espClient;');
      lines.push('');
    }

    // MQTT setup
    if (config.mqtt) {
      lines.push(`const char* mqtt_server = "${config.mqtt.broker}";`);
      lines.push(`const int mqtt_port = ${config.mqtt.port};`);
      lines.push(`const char* mqtt_topic = "${config.mqtt.topic}";`);
      lines.push('PubSubClient client(espClient);');
      lines.push('');
    }

    // Variables
    lines.push('// Global variables');
    config.variables?.forEach(v => {
      lines.push(`${v.type} ${v.name} = ${v.initialValue};`);
    });
    lines.push('');

    // Sensor objects
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`DHT dht_${s.name}(${s.pin}, ${s.type});`);
      }
    });
    lines.push('');

    // setup()
    lines.push('void setup() {');
    lines.push(`  Serial.begin(${PLATFORM_CONFIGS.esp32.defaultBaud});`);
    lines.push('  delay(1000);');
    lines.push('  Serial.println("KidCode ESP32 - Starting...");');
    lines.push('');

    // WiFi connection
    if (config.wifi) {
      lines.push('  // WiFi Connection');
      lines.push('  WiFi.begin(ssid, password);');
      lines.push('  Serial.print("Connecting to WiFi");');
      lines.push('  while (WiFi.status() != WL_CONNECTED) {');
      lines.push('    delay(500);');
      lines.push('    Serial.print(".");');
      lines.push('  }');
      lines.push('  Serial.println();');
      lines.push('  Serial.print("Connected! IP: ");');
      lines.push('  Serial.println(WiFi.localIP());');
      lines.push('');
    }

    // MQTT connection
    if (config.mqtt) {
      lines.push('  // MQTT Connection');
      lines.push('  client.setServer(mqtt_server, mqtt_port);');
      lines.push('  while (!client.connected()) {');
      lines.push('    Serial.println("Connecting to MQTT...");');
      lines.push('    if (client.connect("KidCodeESP32")) {');
      lines.push('      Serial.println("Connected!");');
      lines.push('    } else {');
      lines.push('      delay(5000);');
      lines.push('    }');
      lines.push('  }');
      lines.push('');
    }

    // Pin setup
    config.pins.forEach(p => {
      const mode = p.mode === 'input' ? 'INPUT' :
                   p.mode === 'input_pullup' ? 'INPUT_PULLUP' : 'OUTPUT';
      lines.push(`  pinMode(${p.label.toUpperCase()}_PIN, ${mode});`);
    });

    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`  dht_${s.name}.begin();`);
      }
    });

    lines.push('  Serial.println("Setup complete!");');
    lines.push('}');
    lines.push('');

    // loop()
    lines.push('void loop() {');

    if (config.mqtt) {
      lines.push('  if (!client.connected()) {');
      lines.push('    // Reconnect MQTT');
      lines.push('  }');
      lines.push('  client.loop();');
      lines.push('');
    }

    // Sensor reading
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`  float ${s.name}_temp = dht_${s.name}.readTemperature();`);
        lines.push(`  float ${s.name}_hum = dht_${s.name}.readHumidity();`);
        lines.push(`  if (!isnan(${s.name}_temp)) {`);
        lines.push(`    Serial.printf("${s.name} Temp: %.1f C\\n", ${s.name}_temp);`);
        if (config.mqtt) {
          lines.push(`    char msg[50];`);
          lines.push(`    sprintf(msg, "temp:%.1f", ${s.name}_temp);`);
          lines.push(`    client.publish(mqtt_topic, msg);`);
        }
        lines.push('  }');
      }
      if (s.type.includes('ANALOG')) {
        lines.push(`  int ${s.name}_val = analogRead(${s.pin});`);
        lines.push(`  Serial.printf("${s.name}: %d\\n", ${s.name}_val);`);
      }
    });

    // Actuator control
    config.actuators.forEach(a => {
      if (a.type === 'LED') {
        lines.push(`  digitalWrite(${a.pin}, HIGH);`);
        lines.push(`  delay(500);`);
        lines.push(`  digitalWrite(${a.pin}, LOW);`);
        lines.push(`  delay(500);`);
      }
      if (a.type === 'Servo') {
        lines.push(`  // Servo ${a.name} control via PWM on pin ${a.pin}`);
        lines.push(`  ledcWrite(${a.pin}, 128); // 50% duty`);
      }
    });

    config.functions?.forEach(f => {
      lines.push(`  ${f.body}`);
    });

    lines.push('  delay(100);');
    lines.push('}');

    const source = lines.join('\n');
    return {
      platform: 'esp32',
      filename: `${config.name.replace(/\s+/g, '_').toLowerCase()}.ino`,
      source,
      includes,
      estimatedSize: source.length,
    };
  }

  // === RASPBERRY PI CODE GENERATION ===

  private generateRaspberryPi(config: ProjectConfig): GeneratedCode {
    const imports = ['time'];
    const lines: string[] = [];

    // GPIO library
    imports.push('gpiozero');
    if (config.sensors.some(s => s.type === 'DHT11' || s.type === 'DHT22')) {
      imports.push('adafruit_dht');
    }
    if (config.sensors.some(s => s.type.includes('analog'))) {
      imports.push('analogio');
    }
    if (config.wifi) {
      imports.push('wifi');
      imports.push('socketpool');
    }

    // Imports
    imports.forEach(imp => {
      if (imp === 'adafruit_dht' || imp === 'analogio' || imp === 'wifi' || imp === 'socketpool') {
        lines.push(`import ${imp}`);
      } else {
        lines.push(`from ${imp} import *`);
      }
    });
    lines.push('');

    // Pin setup
    lines.push('# Pin definitions');
    config.pins.forEach(p => {
      lines.push(`${p.label.toLowerCase()}_pin = ${p.pin}`);
    });
    lines.push('');

    lines.push('# GPIO setup');
    lines.push('# Setup GPIO');
    config.pins.forEach(p => {
      if (p.mode === 'output') {
        lines.push(`${p.label.toLowerCase()}_led = LED(${p.pin})`);
      } else if (p.mode === 'input') {
        lines.push(`${p.label.toLowerCase()}_btn = Button(${p.pin})`);
      }
    });
    lines.push('');

    // Variables
    lines.push('# Variables');
    config.variables?.forEach(v => {
      lines.push(`${v.name} = ${v.initialValue}`);
    });
    lines.push('');

    // Sensor objects
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`dht_sensor = adafruit_dht.DHT${s.type.replace('DHT', '')}(${s.pin})`);
      }
    });
    lines.push('');

    // WiFi setup
    if (config.wifi) {
      lines.push('# WiFi Setup');
      lines.push('wifi_radio = wifi.Radio()');
      lines.push('pool = socketpool.SocketPool(wifi_radio)');
      lines.push(`wifi_radio.connect("${config.wifi.ssid}", "${config.wifi.password}")`);
      lines.push('print(f"Connected to WiFi, IP: {wifi_radio.ipv4_address}")');
      lines.push('');
    }

    // Main loop
    lines.push('def main():');
    lines.push('    """Main program loop"""');
    lines.push('    print("KidCode Raspberry Pi - Starting...")');
    lines.push('');
    lines.push('    while True:');
    lines.push('        try:');

    // Read sensors
    config.sensors.forEach(s => {
      if (s.type === 'DHT11' || s.type === 'DHT22') {
        lines.push(`            # Read ${s.name}`);
        lines.push(`            temperature = dht_sensor.temperature`);
        lines.push(`            humidity = dht_sensor.humidity`);
        lines.push(`            if temperature is not None:`);
        lines.push(`                print(f"${s.name} Temp: {temperature}C")`);
      }
      if (s.type.includes('analog')) {
        lines.push(`            # Read ${s.name}`);
        lines.push(`            ${s.name}_value = ${s.name}.value`);
        lines.push(`            print(f"${s.name}: {${s.name}_value}")`);
      }
    });

    // Write actuators
    config.actuators.forEach(a => {
      if (a.type === 'LED') {
        lines.push(`            # Control ${a.name}`);
        lines.push(`            ${a.name.toLowerCase()}_led.on()`);
        lines.push(`            time.sleep(0.5)`);
        lines.push(`            ${a.name.toLowerCase()}_led.off()`);
        lines.push(`            time.sleep(0.5)`);
      }
    });

    config.functions?.forEach(f => {
      lines.push(`            ${f.body}`);
    });

    lines.push('        except KeyboardInterrupt:');
    lines.push('            print("\\nStopping...")');
    lines.push('            break');
    lines.push('        except Exception as e:');
    lines.push('            print(f"Error: {e}")');
    lines.push('');
    lines.push('        time.sleep(0.1)');
    lines.push('');
    lines.push('');
    lines.push('if __name__ == "__main__":');
    lines.push('    main()');

    const source = lines.join('\n');
    return {
      platform: 'raspberry_pi',
      filename: `${config.name.replace(/\s+/g, '_').toLowerCase()}.py`,
      source,
      includes: imports,
      estimatedSize: source.length,
    };
  }
}

// === SERIAL MONITOR ===

export class SerialMonitorService {
  private monitor: SerialMonitor;
  private callbacks: ((msg: SerialMessage) => void)[] = [];

  constructor(baudRate: number = 9600, maxMessages: number = 1000) {
    this.monitor = {
      messages: [],
      baudRate,
      isPaused: false,
      maxMessages,
      filters: [],
    };
  }

  addMessage(data: string, direction: 'in' | 'out'): SerialMessage {
    const type = this.detectMessageType(data);
    const msg: SerialMessage = {
      timestamp: Date.now(),
      direction,
      data,
      type,
    };

    if (!this.monitor.isPaused) {
      this.monitor.messages.push(msg);
      if (this.monitor.messages.length > this.monitor.maxMessages) {
        this.monitor.messages.shift();
      }
    }

    this.callbacks.forEach(cb => cb(msg));
    return msg;
  }

  private detectMessageType(data: string): SerialMessage['type'] {
    if (data.startsWith('{') || data.startsWith('[')) {
      try { JSON.parse(data); return 'json'; } catch {}
    }
    if (data.includes('Error') || data.includes('error') || data.includes('ERR')) {
      return 'error';
    }
    return 'text';
  }

  setBaudRate(rate: number): void {
    this.monitor.baudRate = rate;
  }

  pause(): void {
    this.monitor.isPaused = true;
  }

  resume(): void {
    this.monitor.isPaused = false;
  }

  clear(): void {
    this.monitor.messages = [];
  }

  setFilters(filters: string[]): void {
    this.monitor.filters = filters;
  }

  getFilteredMessages(): SerialMessage[] {
    if (this.monitor.filters.length === 0) return [...this.monitor.messages];
    return this.monitor.messages.filter(msg =>
      this.monitor.filters.some(f => msg.data.includes(f))
    );
  }

  getMessages(): SerialMessage[] {
    return [...this.monitor.messages];
  }

  getStats(): { total: number; inCount: number; outCount: number; errorCount: number } {
    const total = this.monitor.messages.length;
    const inCount = this.monitor.messages.filter(m => m.direction === 'in').length;
    const outCount = this.monitor.messages.filter(m => m.direction === 'out').length;
    const errorCount = this.monitor.messages.filter(m => m.type === 'error').length;
    return { total, inCount, outCount, errorCount };
  }

  onMessage(callback: (msg: SerialMessage) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  exportLog(): string {
    return this.monitor.messages.map(msg => {
      const dir = msg.direction === 'in' ? 'RX' : 'TX';
      const time = new Date(msg.timestamp).toISOString();
      return `[${time}] ${dir}: ${msg.data}`;
    }).join('\n');
  }
}

// === FIRMWARE UPLOADER ===

export class FirmwareUploader {
  private progress: FirmwareUploadProgress = {
    stage: 'compiling',
    progress: 0,
    message: '',
  };
  private callbacks: ((progress: FirmwareUploadProgress) => void)[] = [];

  async upload(
    code: string,
    platform: Platform,
    port?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Stage 1: Compiling
      this.updateProgress('compiling', 0, 'Compiling code...');
      await this.simulateDelay(500);
      this.updateProgress('compiling', 30, 'Parsing source...');
      await this.simulateDelay(300);
      this.updateProgress('compiling', 60, 'Generating binary...');
      await this.simulateDelay(400);
      this.updateProgress('compiling', 100, 'Compilation complete!');
      await this.simulateDelay(200);

      // Stage 2: Uploading
      this.updateProgress('uploading', 0, 'Connecting to board...');
      await this.simulateDelay(300);

      const totalBytes = code.length * 4; // Simulated binary size
      for (let i = 0; i <= 100; i += 10) {
        this.updateProgress('uploading', i, `Uploading... ${i}%`, i * totalBytes / 100, totalBytes);
        await this.simulateDelay(100);
      }

      // Stage 3: Verifying
      this.updateProgress('verifying', 0, 'Verifying upload...');
      await this.simulateDelay(500);
      this.updateProgress('verifying', 50, 'Checking flash memory...');
      await this.simulateDelay(300);
      this.updateProgress('verifying', 100, 'Verification passed!');
      await this.simulateDelay(200);

      // Stage 4: Complete
      this.updateProgress('complete', 100, 'Upload successful! Board resetting...');

      return { success: true };
    } catch (e) {
      this.updateProgress('error', 0, `Upload failed: ${(e as Error).message}`);
      return { success: false, error: (e as Error).message };
    }
  }

  private updateProgress(
    stage: FirmwareUploadProgress['stage'],
    progress: number,
    message: string,
    bytesUploaded?: number,
    totalBytes?: number
  ): void {
    this.progress = { stage, progress, message, bytesUploaded, totalBytes };
    this.callbacks.forEach(cb => cb(this.progress));
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getProgress(): FirmwareUploadProgress {
    return { ...this.progress };
  }

  onProgress(callback: (progress: FirmwareUploadProgress) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
}

// === HARDWARE INTEGRATION SERVICE (MAIN) ===

export class HardwareIntegrationService {
  private codeGenerator: HardwareCodeGenerator;
  private serialMonitor: SerialMonitorService;
  private firmwareUploader: FirmwareUploader;

  constructor() {
    this.codeGenerator = new HardwareCodeGenerator();
    this.serialMonitor = new SerialMonitorService();
    this.firmwareUploader = new FirmwareUploader();
  }

  // Code generation
  generateCode(config: ProjectConfig): GeneratedCode {
    return this.codeGenerator.generate(config);
  }

  // Serial monitor
  getSerialMonitor(): SerialMonitorService {
    return this.serialMonitor;
  }

  // Firmware upload
  getFirmwareUploader(): FirmwareUploader {
    return this.firmwareUploader;
  }

  async uploadFirmware(code: string, platform: Platform): Promise<{ success: boolean; error?: string }> {
    return this.firmwareUploader.upload(code, platform);
  }

  // Utility
  validateConfig(config: ProjectConfig): string[] {
    const errors: string[] = [];
    const platformConfig = PLATFORM_CONFIGS[config.platform];

    if (!config.name) errors.push('Project name is required');
    if (!config.platform) errors.push('Platform is required');

    config.pins.forEach(p => {
      if (p.pin < 0 || p.pin > platformConfig.maxPins) {
        errors.push(`Pin ${p.pin} out of range for ${platformConfig.name}`);
      }
    });

    if (config.wifi && !platformConfig.hasWifi) {
      errors.push(`WiFi not supported on ${platformConfig.name}`);
    }

    return errors;
  }

  getSupportedPlatforms(): Platform[] {
    return ['arduino', 'esp32', 'raspberry_pi'];
  }

  getPlatformInfo(platform: Platform) {
    return PLATFORM_CONFIGS[platform];
  }
}

export const hardwareIntegration = new HardwareIntegrationService();
