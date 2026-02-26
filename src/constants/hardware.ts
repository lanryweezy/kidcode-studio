import { HardwareState, CircuitComponent } from '../types';

export const INITIAL_HARDWARE_STATE: HardwareState = {
    // 0-3: LEDs, 4: Button, 5: Light, 6: Switch
    pins: Array(50).fill(false).map((_, i) => i === 5),
    buzzerActive: false,
    fanSpeed: 0,
    temperature: 25,
    servoAngle: 90,
    lcdLines: ["Ready...", ""],
    potentiometerValue: 0,
    speakerVolume: 50,
    rgbColor: '#ff0000',
    rgbLedColor: '#FF0000', // For RGB LED
    sevenSegmentValue: null,
    distance: 100,
    motionDetected: false,
    vibrationActive: false,
    keypadValue: null,
    joystick: { x: 0, y: 0 },
    pressure: 0,
    flex: 0,
    tilt: false,
    magneticField: 0,
    detectedColor: '#ffffff',

    // Enhanced States for New Components
    humidity: 50, // For DHT sensors
    gasLevel: 0, // For gas sensors
    flameDetected: false, // For flame sensors
    rainLevel: 0, // For rain sensors
    soilMoisture: 50, // For soil sensors
    heartbeatRate: 0, // For heartbeat sensors
    compassHeading: 0, // For compass
    gyroData: { x: 0, y: 0, z: 0 }, // For gyro/accel
    gpsLocation: { lat: 0, lng: 0 }, // For GPS
    fingerprintMatch: false, // For fingerprint sensor
    rfidTag: null, // For RFID reader
    stepperPosition: 0, // For stepper motor
    pumpFlowRate: 0, // For water pump
    solenoidActive: false, // For solenoid
    relayState: false, // For relay
    laserActive: false, // For laser
    bulbOn: false, // For light bulb
    continuousServoSpeed: 0, // For continuous servo
    rgbStripColors: ['#ff0000', '#00ff00', '#0000ff'], // For RGB strip
    sdCardData: [], // For SD card
    rtcTime: new Date(), // For RTC
    logicGateOutput: false, // For logic gates
    timerOutput: false, // For 555 timer

    // Microcontroller-specific features
    wifiConnected: false, // For ESP32, ESP8266, Pi, etc.
    bluetoothConnected: false, // For ESP32, Pi, etc.
    cpuTemperature: 35, // CPU temperature for microcontrollers
    freeMemory: 100, // Available memory percentage
    uptime: 0, // Time since last reset in seconds

    variables: {}, // Variables for hardware state

    sensorHistory: []
};

export const CIRCUIT_PALETTE: any[] = [
    // --- MICROCONTROLLERS ---
    { type: 'ARDUINO_UNO', label: 'Arduino Uno', color: 'text-orange-600', category: 'Microcontrollers', defaultPin: 13, description: 'ATmega328P, 14 digital I/O pins, 6 analog inputs' },
    { type: 'ARDUINO_NANO', label: 'Arduino Nano', color: 'text-orange-700', category: 'Microcontrollers', defaultPin: 13, description: 'ATmega328P, 22 I/O pins, compact breadboard-friendly form factor' },
    { type: 'ARDUINO_MEGA', label: 'Arduino Mega', color: 'text-orange-800', category: 'Microcontrollers', defaultPin: 13, description: 'ATmega2560, 54 digital I/O pins, 16 analog inputs' },
    { type: 'ESP32_DEVKIT', label: 'ESP32 DevKit', color: 'text-red-600', category: 'Microcontrollers', defaultPin: 2, description: 'ESP32 dual-core, Wi-Fi + Bluetooth, 36 GPIO pins' },
    { type: 'ESP32_CAM', label: 'ESP32-CAM', color: 'text-red-500', category: 'Microcontrollers', defaultPin: 2, description: 'ESP32 with camera module' },
    { type: 'ESP8266', label: 'ESP8266', color: 'text-red-500', category: 'Microcontrollers', defaultPin: 2, description: 'ESP8266 Wi-Fi module, 17 GPIO pins' },
    { type: 'NODEMCU', label: 'NodeMCU', color: 'text-red-700', category: 'Microcontrollers', defaultPin: 2, description: 'ESP8266 dev board with USB, breadboard-friendly' },
    { type: 'RASPBERRY_PI_ZERO', label: 'Raspberry Pi Zero', color: 'text-green-600', category: 'Microcontrollers', defaultPin: 18, description: 'ARM11, 40-pin GPIO header, compact single-board computer' },
    { type: 'RASPBERRY_PI_4', label: 'Raspberry Pi 4', color: 'text-green-700', category: 'Microcontrollers', defaultPin: 18, description: 'Quad-core ARM Cortex-A72, 40-pin GPIO header' },
    { type: 'MICROBIT', label: 'micro:bit', color: 'text-blue-600', category: 'Microcontrollers', defaultPin: 0, description: 'ARM Cortex-M0+, 25-pin edge connector, educational board' },

    // --- OUTPUTS ---
    { type: 'LED_RED', label: 'Red LED', color: 'text-red-500', category: 'Outputs', defaultPin: 0, description: 'Lights up red.' },
    { type: 'LED_BLUE', label: 'Blue LED', color: 'text-blue-500', category: 'Outputs', defaultPin: 1, description: 'Lights up blue.' },
    { type: 'LED_GREEN', label: 'Green LED', color: 'text-green-500', category: 'Outputs', defaultPin: 2, description: 'Lights up green.' },
    { type: 'LED_YELLOW', label: 'Yellow LED', color: 'text-yellow-500', category: 'Outputs', defaultPin: 3, description: 'Lights up yellow.' },
    { type: 'LED_ORANGE', label: 'Orange LED', color: 'text-orange-500', category: 'Outputs', defaultPin: 4, description: 'Lights up orange.' },
    { type: 'LED_WHITE', label: 'White LED', color: 'text-gray-200', category: 'Outputs', defaultPin: 5, description: 'Lights up white.' },
    { type: 'RGB_LED', label: 'RGB LED', color: 'text-purple-500', category: 'Outputs', defaultPin: 10, description: 'Changes colors.' },
    { type: 'RGB_STRIP', label: 'RGB Strip', color: 'text-pink-500', category: 'Outputs', defaultPin: 11, description: 'Addressable LED strip.' },
    { type: 'LASER', label: 'Laser', color: 'text-red-600', category: 'Outputs', defaultPin: 13, description: 'Laser beam.' },
    { type: 'BULB', label: 'Light Bulb', color: 'text-yellow-300', category: 'Outputs', defaultPin: 12, description: 'Incandescent bulb.' },
    { type: 'RELAY', label: 'Relay', color: 'text-red-700', category: 'Outputs', defaultPin: 14, description: 'Electronic switch.' },
    { type: 'SOLENOID', label: 'Solenoid', color: 'text-amber-600', category: 'Outputs', defaultPin: 15, description: 'Linear actuator.' },
    { type: 'STEPPER', label: 'Stepper Motor', color: 'text-violet-600', category: 'Outputs', defaultPin: 16, description: 'Precise rotation motor.' },
    { type: 'PUMP', label: 'Water Pump', color: 'text-blue-500', category: 'Outputs', defaultPin: 17, description: 'Liquid pump.' },
    { type: 'FAN', label: 'Fan Motor', color: 'text-cyan-500', category: 'Outputs', defaultPin: 9, description: 'Spins when ON.' },
    { type: 'SERVO', label: 'Servo', color: 'text-orange-500', category: 'Outputs', defaultPin: 11, description: 'Rotates to 180°.' },
    { type: 'SPEAKER', label: 'Speaker', color: 'text-slate-600', category: 'Outputs', defaultPin: 8, description: 'Plays tones.' },
    { type: 'MOTOR_DC', label: 'DC Motor', color: 'text-yellow-600', category: 'Outputs', defaultPin: 6, description: 'Basic motor.' },
    { type: 'BUZZER', label: 'Piezo Buzzer', color: 'text-stone-700', category: 'Outputs', defaultPin: 8, description: 'Basic beeps.' },
    { type: 'VIBRATION', label: 'Vibration Motor', color: 'text-indigo-500', category: 'Outputs', defaultPin: 7, description: 'Shakes the device.' },

    // --- INPUTS ---
    { type: 'BUTTON', label: 'Push Button', color: 'text-red-600', category: 'Inputs', defaultPin: 4, description: 'Push to activate.' },
    { type: 'BUTTON_TACTILE', label: 'Tactile Button', color: 'text-red-700', category: 'Inputs', defaultPin: 5, description: 'Small tactile switch.' },
    { type: 'SWITCH_SLIDE', label: 'Slide Switch', color: 'text-slate-500', category: 'Inputs', defaultPin: 7, description: 'On/Off toggle.' },
    { type: 'SWITCH_TOGGLE', label: 'Toggle Switch', color: 'text-slate-600', category: 'Inputs', defaultPin: 20, description: 'Maintained on/off.' },
    { type: 'SWITCH_DIP', label: 'DIP Switch', color: 'text-slate-700', category: 'Inputs', defaultPin: 21, description: 'Multiple switches.' },
    { type: 'SWITCH_ROTARY', label: 'Rotary Switch', color: 'text-slate-800', category: 'Inputs', defaultPin: 22, description: 'Multi-position switch.' },
    { type: 'POTENTIOMETER', label: 'Rotary Knob', color: 'text-orange-600', category: 'Inputs', defaultPin: 97, description: 'Adjustable dial.' },
    { type: 'SLIDE_POT', label: 'Slide Pot', color: 'text-amber-600', category: 'Inputs', defaultPin: 23, description: 'Linear adjustable.' },
    { type: 'JOYSTICK', label: 'Joystick', color: 'text-slate-700', category: 'Inputs', defaultPin: 13, description: 'X/Y control.' },
    { type: 'KEYPAD', label: 'Keypad 4x4', color: 'text-slate-800', category: 'Inputs', defaultPin: 12, description: 'Number pad.' },
    { type: 'ENCODER', label: 'Rotary Encoder', color: 'text-slate-600', category: 'Inputs', defaultPin: 5, description: 'Infinite dial.' },

    // --- SENSORS ---
    { type: 'LIGHT_SENSOR', label: 'Light Sensor', color: 'text-yellow-500', category: 'Sensors', defaultPin: 5, description: 'Detects brightness.' },
    { type: 'TEMP_SENSOR', label: 'Temp Sensor', color: 'text-red-500', category: 'Sensors', defaultPin: 99, description: 'Reads temperature.' },
    { type: 'THERMISTOR', label: 'Thermistor', color: 'text-orange-600', category: 'Sensors', defaultPin: 27, description: 'Temperature sensor.' },
    { type: 'DHT11', label: 'DHT11', color: 'text-teal-500', category: 'Sensors', defaultPin: 28, description: 'Temp/Humidity sensor.' },
    { type: 'DHT22', label: 'DHT22', color: 'text-teal-600', category: 'Sensors', defaultPin: 29, description: 'Temp/Humidity sensor.' },
    { type: 'ULTRASONIC', label: 'Distance Sensor', color: 'text-blue-500', category: 'Sensors', defaultPin: 92, description: 'Measures distance.' },
    { type: 'MOTION', label: 'Motion PIR', color: 'text-emerald-500', category: 'Sensors', defaultPin: 3, description: 'Detects movement.' },
    { type: 'SOUND_SENSOR', label: 'Mic Sensor', color: 'text-slate-700', category: 'Sensors', defaultPin: 94, description: 'Detects noise.' },
    { type: 'GAS_SENSOR', label: 'Gas Sensor', color: 'text-amber-600', category: 'Sensors', defaultPin: 30, description: 'Detects gas levels.' },
    { type: 'FLAME_SENSOR', label: 'Flame Sensor', color: 'text-red-600', category: 'Sensors', defaultPin: 31, description: 'Detects fire/flames.' },
    { type: 'RAIN_SENSOR', label: 'Rain Sensor', color: 'text-blue-400', category: 'Sensors', defaultPin: 32, description: 'Detects water/rain.' },
    { type: 'SOIL_SENSOR', label: 'Soil Sensor', color: 'text-amber-800', category: 'Sensors', defaultPin: 33, description: 'Moisture detector.' },
    { type: 'PRESSURE_SENSOR', label: 'Pressure Sensor', color: 'text-cyan-500', category: 'Sensors', defaultPin: 34, description: 'Pressure measurement.' },
    { type: 'FLEX_SENSOR', label: 'Flex Sensor', color: 'text-purple-500', category: 'Sensors', defaultPin: 35, description: 'Bend detection.' },
    { type: 'TILT_SENSOR', label: 'Tilt Switch', color: 'text-purple-500', category: 'Sensors', defaultPin: 93, description: 'Detects orientation.' },
    { type: 'HALL_SENSOR', label: 'Hall Sensor', color: 'text-blue-600', category: 'Sensors', defaultPin: 36, description: 'Magnetic field sensor.' },
    { type: 'COMPASS', label: 'Digital Compass', color: 'text-sky-500', category: 'Sensors', defaultPin: 37, description: 'Direction sensor.' },
    { type: 'GYRO', label: 'Gyro/Accel', color: 'text-teal-500', category: 'Sensors', defaultPin: 38, description: 'Motion/angle sensor.' },
    { type: 'GPS', label: 'GPS Module', color: 'text-emerald-600', category: 'Sensors', defaultPin: 39, description: 'Location sensor.' },
    { type: 'HEARTBEAT', label: 'Heartbeat', color: 'text-red-500', category: 'Sensors', defaultPin: 40, description: 'Pulse sensor.' },

    // --- DISPLAYS ---
    { type: 'LCD', label: 'LCD Screen', color: 'text-green-700', category: 'Displays', defaultPin: 95, description: 'Displays text.' },
    { type: 'OLED', label: 'OLED Screen', color: 'text-cyan-400', category: 'Displays', defaultPin: 11, description: 'Graphics display.' },
    { type: 'SEVEN_SEGMENT', label: '7-Segment', color: 'text-red-600', category: 'Displays', defaultPin: 96, description: 'Shows numbers.' },
    { type: 'MATRIX', label: 'LED Matrix', color: 'text-red-500', category: 'Displays', defaultPin: 10, description: 'Dot display.' },

    // --- COMMUNICATION ---
    { type: 'WIFI', label: 'WiFi Module', color: 'text-blue-400', category: 'Comms', defaultPin: 2, description: 'Connect internet.' },
    { type: 'BLUETOOTH', label: 'Bluetooth', color: 'text-blue-500', category: 'Comms', defaultPin: 43, description: 'Wireless comms.' },
    { type: 'RADIO', label: 'Radio Module', color: 'text-purple-500', category: 'Comms', defaultPin: 44, description: 'RF communication.' },

    // --- STORAGE ---
    { type: 'SD_CARD', label: 'SD Card', color: 'text-slate-500', category: 'Storage', defaultPin: 45, description: 'Memory card.' },
    { type: 'RTC', label: 'RTC', color: 'text-slate-600', category: 'Components', defaultPin: 46, description: 'Real-time clock.' },

    // --- POWER ---
    { type: 'BATTERY_9V', label: '9V Battery', color: 'text-orange-500', category: 'Power', defaultPin: 90, description: 'Power source.' },
    { type: 'BATTERY_AA', label: 'AA Battery', color: 'text-orange-600', category: 'Power', defaultPin: 91, description: 'Standard battery.' },
    { type: 'SOLAR', label: 'Solar Panel', color: 'text-blue-600', category: 'Power', defaultPin: 91, description: 'Sun power.' },

    // --- COMPONENTS ---
    { type: 'BREADBOARD', label: 'Breadboard', color: 'text-slate-400', category: 'Misc', defaultPin: 98, description: 'Prototyping base.' },
    { type: 'RESISTOR', label: 'Resistor', color: 'text-amber-800', category: 'Components', defaultPin: 40, description: 'Electrical resistor.' },
    { type: 'RFID', label: 'RFID Reader', color: 'text-violet-500', category: 'Components', defaultPin: 41, description: 'RFID card reader.' },
    { type: 'FINGERPRINT', label: 'Fingerprint', color: 'text-indigo-600', category: 'Components', defaultPin: 42, description: 'Biometric scanner.' },

    // --- LOGIC ---
    { type: 'LOGIC_AND', label: 'AND Gate', color: 'text-amber-500', category: 'Logic', defaultPin: 47, description: 'Logical AND gate.' },
    { type: 'LOGIC_OR', label: 'OR Gate', color: 'text-emerald-500', category: 'Logic', defaultPin: 48, description: 'Logical OR gate.' },
    { type: '555_TIMER', label: '555 Timer', color: 'text-cyan-600', category: 'Logic', defaultPin: 49, description: 'Timer IC.' },

    // --- MISC ---
    { type: 'KEYPAD_MATRIX', label: 'Matrix Keypad', color: 'text-slate-700', category: 'Inputs', defaultPin: 12, description: 'Advanced matrix keypad.' },
    { type: 'SERVO_CONTINUOUS', label: 'Continuous Servo', color: 'text-orange-400', category: 'Outputs', defaultPin: 11, description: '360° rotation servo.' },
    { type: 'MOTOR_STEPPER', label: 'Stepper Motor', color: 'text-violet-700', category: 'Outputs', defaultPin: 16, description: 'Precise step motor.' },
    { type: 'MOTOR_PUMP', label: 'Water Pump', color: 'text-blue-400', category: 'Outputs', defaultPin: 17, description: 'Liquid pump.' },
    { type: 'MOTOR_SOL', label: 'Solenoid', color: 'text-amber-700', category: 'Outputs', defaultPin: 15, description: 'Linear actuator.' },
    { type: 'RELAY_MODULE', label: 'Relay Module', color: 'text-red-600', category: 'Outputs', defaultPin: 14, description: 'Electronic switch.' },
    { type: 'LASER_DIODE', label: 'Laser Diode', color: 'text-red-500', category: 'Outputs', defaultPin: 13, description: 'Laser beam.' },
];
