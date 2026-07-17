
export interface SensorDataPoint {
  time: number;
  temperature: number;
  light: boolean;
  distance: number;
}

export interface HardwareState {
  pins: boolean[];
  buzzerActive: boolean;
  fanSpeed: number;
  temperature: number;
  servoAngle: number;
  lcdLines: string[];
  cursorRow: number;
  cursorCol: number;
  potentiometerValue: number;
  speakerVolume: number;
  motorLoad?: number;

  // New States
  rgbColor: string;
  sevenSegmentValue: number | null;
  distance: number;
  motionDetected: boolean;
  vibrationActive: boolean;
  keypadValue: string | null;
  joystick: { x: number; y: number };

  multimeterVoltage?: number;
  multimeterCurrent?: number;
  multimeterResistance?: number;
  powerDraw?: number;
  isShortCircuit?: boolean;

  // Interactive Oscilloscope (20)
  oscilloscopePin?: number;
  oscilloscopeData?: number[];
  oscilloscopeTrigger?: 'rising' | 'falling' | 'any';
  oscilloscopeTimebase?: number;
  oscilloscopeScale?: number;

  // Voltmeter Probes (21)
  voltmeterProbeA?: { componentId: string; pin: number } | null;
  voltmeterProbeB?: { componentId: string; pin: number } | null;
  voltmeterReading?: number;

  // Advanced Sensors
  pressure: number;
  flex: number;
  tilt: boolean;
  magneticField: number;
  detectedColor: string;

  // Enhanced States for New Components
  humidity: number; // For DHT sensors
  gasLevel: number; // For gas sensors
  flameDetected: boolean; // For flame sensors
  rainLevel: number; // For rain sensors
  soilMoisture: number; // For soil sensors
  heartbeatRate: number; // For heartbeat sensors
  compassHeading: number; // For compass
  gyroData: { x: number; y: number; z: number }; // For gyro/accel
  gpsLocation: { lat: number; lng: number }; // For GPS
  fingerprintMatch: boolean; // For fingerprint sensor
  rfidTag: string | null; // For RFID reader
  stepperPosition: number; // For stepper motor
  pumpFlowRate: number; // For water pump
  solenoidActive: boolean; // For solenoid
  relayState: boolean; // For relay
  laserActive: boolean; // For laser
  bulbOn: boolean; // For light bulb
  continuousServoSpeed: number; // For continuous servo
  rgbLedColor: string; // For RGB LED
  rgbStripColors: string[]; // For RGB strip
  sdCardData: string[]; // For SD card
  rtcTime: Date; // For RTC
  logicGateOutput: boolean; // For logic gates
  timerOutput: boolean; // For 555 timer

  // Microcontroller-specific features
  wifiConnected: boolean; // For ESP32, ESP8266, Pi, etc.
  bluetoothConnected: boolean; // For ESP32, Pi, etc.
  cpuTemperature: number; // CPU temperature for microcontrollers
  freeMemory: number; // Available memory
  uptime: number; // Time since last reset

  variables: Record<string, any>; // Variables for hardware state

  // Data Logging
  sensorHistory: SensorDataPoint[];

  // Simulated sensor readings (componentId -> value)
  sensorReadings?: Map<string, number>;
}

export type ComponentType =
  // MICROCONTROLLERS
  'ARDUINO_UNO' | 'ARDUINO_NANO' | 'ARDUINO_MEGA' | 'ESP32_DEVKIT' | 'ESP8266' | 'NODEMCU' | 'RASPBERRY_PI_ZERO' | 'RASPBERRY_PI_4' | 'MICROBIT' |

  // OUTPUTS
  'LED_RED' | 'LED_BLUE' | 'LED_GREEN' | 'LED_WHITE' | 'LED_YELLOW' | 'LED_ORANGE' |
  'RGB_LED' | 'RGB_STRIP' | 'LASER' | 'LASER_DIODE' | 'BULB' |

  // INPUTS
  'BUTTON' | 'BUTTON_TACTILE' | 'SWITCH_SLIDE' | 'SWITCH_TOGGLE' | 'SWITCH_DIP' | 'SWITCH_ROTARY' |
  'POTENTIOMETER' | 'SLIDE_POT' | 'JOYSTICK' | 'KEYPAD' | 'KEYPAD_MATRIX' | 'ENCODER' |

  // SENSORS
  'LIGHT_SENSOR' | 'TEMP_SENSOR' | 'DHT11' | 'DHT22' | 'THERMISTOR' |
  'ULTRASONIC' | 'MOTION' | 'SOUND_SENSOR' | 'GAS_SENSOR' | 'FLAME_SENSOR' | 'RAIN_SENSOR' |
  'SOIL_SENSOR' | 'PRESSURE_SENSOR' | 'FLEX_SENSOR' | 'TILT_SENSOR' | 'HALL_SENSOR' | 'COMPASS' |
  'GYRO' | 'GPS' | 'HEARTBEAT' | 'COLOR_SENSOR' |

  // COMPONENTS
  'RESISTOR' | 'RFID' | 'FINGERPRINT' | 'BUZZER' | 'SPEAKER' | 'RELAY' | 'RELAY_MODULE' | 'SOLENOID' | 'MOTOR_SOL' |
  'SERVO' | 'SERVO_CONTINUOUS' | 'MOTOR_DC' | 'FAN' | 'STEPPER' | 'PUMP' | 'MOTOR_PUMP' | 'VIBRATION' |
  'LCD' | 'LCD_2004' | 'LCD_12864' | 'OLED' | 'SEVEN_SEGMENT' | 'MATRIX' |
  'WIFI' | 'BLUETOOTH' | 'RADIO' | 'SD_CARD' | 'RTC' |
  'BATTERY_9V' | 'BATTERY_AA' | 'SOLAR' | 'BREADBOARD' |
  'LOGIC_AND' | 'LOGIC_OR' | '555_TIMER' |

  // PASSIVE COMPONENTS (13-19)
  'CAPACITOR_ELEC' | 'CAPACITOR_CERAMIC' | 'CAPACITOR_TANTALUM' |
  'TRANSISTOR_NPN' | 'TRANSISTOR_PNP' | 'MOSFET_N' | 'MOSFET_P' |
  'DIODE' | 'DIODE_SCHOTTKY' | 'DIODE_ZENER' | 'LED_INFRARED' |
  'VREG_7805' | 'VREG_317' | 'VREG_LDO' |
  'OPAMP_358' | 'OPAMP_072' |
  'NEOPIXEL_RING' | 'TM1637' | 'MAX7219' | 'EINK' | 'COLOR_SENSOR' |
  'WIRE_SPOOL';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  pin: number;
  rotation?: number;
  wireColor?: string;
  resistance?: number;
  capacitance?: number;
  forwardVoltage?: number;
  voltage?: number;
  gain?: number;
  threshold?: number;
}

export interface Wire {
  id: string;
  fromComponentId: string;
  fromPin: number;
  toComponentId: string;
  toPin: number;
  color?: string;
}
