
export enum AppMode {
  APP = 'APP',
  GAME = 'GAME',
  HARDWARE = 'HARDWARE'
}

export enum CommandType {
  // --- COMMON FLOW ---
  WAIT = 'WAIT',
  REPEAT = 'REPEAT',
  END_REPEAT = 'END_REPEAT',
  FOREVER = 'FOREVER',
  END_FOREVER = 'END_FOREVER',
  BREAK = 'BREAK',
  COMMENT = 'COMMENT', 
  
  // --- LOGIC & CONDITIONS ---
  IF = 'IF', 
  ELSE = 'ELSE', 
  END_IF = 'END_IF',
  WAIT_FOR_PRESS = 'WAIT_FOR_PRESS',
  LISTEN_FOR = 'LISTEN_FOR', // Voice command
  
  // --- VARIABLES & DATA ---
  SET_VAR = 'SET_VAR',
  CHANGE_VAR = 'CHANGE_VAR',
  CALC_RANDOM = 'CALC_RANDOM', // Set var to random(min, max)
  
  // --- MATH & CALCULATION (Stored in Variable) ---
  CALC_ADD = 'CALC_ADD', // var = val1 + val2
  CALC_SUB = 'CALC_SUB',
  CALC_MUL = 'CALC_MUL',
  CALC_DIV = 'CALC_DIV',
  CALC_MOD = 'CALC_MOD',
  CALC_ROUND = 'CALC_ROUND',
  CALC_ABS = 'CALC_ABS',
  CALC_SIN = 'CALC_SIN',
  CALC_COS = 'CALC_COS',

  // --- STRING OPERATIONS ---
  STR_JOIN = 'STR_JOIN', // var = str1 + str2
  STR_LENGTH = 'STR_LENGTH',
  STR_UPPER = 'STR_UPPER',
  STR_LOWER = 'STR_LOWER',
  
  // --- LISTS / ARRAYS ---
  LIST_ADD = 'LIST_ADD',
  LIST_REMOVE = 'LIST_REMOVE',
  LIST_INSERT = 'LIST_INSERT',
  LIST_REPLACE = 'LIST_REPLACE',
  LIST_GET = 'LIST_GET',
  LIST_CLEAR = 'LIST_CLEAR',
  LIST_CONTAINS = 'LIST_CONTAINS',
  
  // --- APP MAKER: UI ---
  CREATE_SCREEN = 'CREATE_SCREEN', 
  NAVIGATE = 'NAVIGATE',
  SET_TITLE = 'SET_TITLE',
  SET_BACKGROUND = 'SET_BACKGROUND',
  SET_THEME = 'SET_THEME',
  
  // UI Elements
  ADD_BUTTON = 'ADD_BUTTON',
  ADD_TEXT_BLOCK = 'ADD_TEXT_BLOCK',
  ADD_INPUT = 'ADD_INPUT',
  ADD_PASSWORD = 'ADD_PASSWORD',
  ADD_TEXTAREA = 'ADD_TEXTAREA',
  ADD_IMAGE = 'ADD_IMAGE',
  ADD_VIDEO = 'ADD_VIDEO',
  ADD_CAMERA = 'ADD_CAMERA', 
  ADD_DRAWING_CANVAS = 'ADD_DRAWING_CANVAS', 
  ADD_LIST_VIEW = 'ADD_LIST_VIEW',
  ADD_AUDIO_PLAYER = 'ADD_AUDIO_PLAYER',
  ADD_AUDIO_RECORDER = 'ADD_AUDIO_RECORDER', // New
  ADD_SWITCH = 'ADD_SWITCH',
  ADD_SLIDER = 'ADD_SLIDER',
  ADD_CHECKBOX = 'ADD_CHECKBOX', 
  ADD_RADIO = 'ADD_RADIO',
  ADD_DROPDOWN = 'ADD_DROPDOWN',
  ADD_DATE_PICKER = 'ADD_DATE_PICKER',
  ADD_TIME_PICKER = 'ADD_TIME_PICKER',
  ADD_COLOR_PICKER = 'ADD_COLOR_PICKER',
  ADD_PROGRESS = 'ADD_PROGRESS', 
  ADD_MAP = 'ADD_MAP',
  ADD_CHART = 'ADD_CHART',
  ADD_QR_CODE = 'ADD_QR_CODE',
  ADD_RATING = 'ADD_RATING',
  ADD_DIVIDER = 'ADD_DIVIDER',
  ADD_SPACER = 'ADD_SPACER',
  ADD_ICON = 'ADD_ICON',
  
  // UI Actions
  SPEAK = 'SPEAK', 
  VIBRATE_DEVICE = 'VIBRATE_DEVICE',
  SHOW_ALERT = 'SHOW_ALERT',
  SHOW_TOAST = 'SHOW_TOAST',
  OPEN_URL = 'OPEN_URL',
  SHARE_TEXT = 'SHARE_TEXT',
  CLEAR_UI = 'CLEAR_UI',
  
  // --- GAME MAKER: MOVEMENT ---
  MOVE_X = 'MOVE_X',
  MOVE_Y = 'MOVE_Y',
  GO_TO_XY = 'GO_TO_XY',
  GLIDE_TO_XY = 'GLIDE_TO_XY',
  POINT_DIR = 'POINT_DIR',
  POINT_TOWARDS = 'POINT_TOWARDS',
  TURN_RIGHT = 'TURN_RIGHT',
  TURN_LEFT = 'TURN_LEFT',
  SET_ROTATION_STYLE = 'SET_ROTATION_STYLE',
  BOUNCE_ON_EDGE = 'BOUNCE_ON_EDGE',
  
  // Physics
  JUMP = 'JUMP', 
  SET_GRAVITY = 'SET_GRAVITY', 
  SET_VELOCITY_X = 'SET_VELOCITY_X',
  SET_VELOCITY_Y = 'SET_VELOCITY_Y',
  SET_MASS = 'SET_MASS',
  SET_FRICTION = 'SET_FRICTION',
  SET_BOUNCINESS = 'SET_BOUNCINESS',

  // Looks
  SAY = 'SAY',
  THINK = 'THINK',
  SET_EMOJI = 'SET_EMOJI',
  SET_SIZE = 'SET_SIZE',
  CHANGE_SIZE = 'CHANGE_SIZE',
  SHOW = 'SHOW',
  HIDE = 'HIDE',
  SET_OPACITY = 'SET_OPACITY',
  CHANGE_EFFECT = 'CHANGE_EFFECT', // Color, Ghost, etc.
  GO_TO_FRONT = 'GO_TO_FRONT',
  GO_TO_BACK = 'GO_TO_BACK',
  
  // World
  SET_SCENE = 'SET_SCENE',
  SET_WEATHER = 'SET_WEATHER', 
  SET_CAMERA = 'SET_CAMERA', 
  SHAKE_CAMERA = 'SHAKE_CAMERA',
  
  // Game Objects
  SHOOT = 'SHOOT', 
  SPAWN_ENEMY = 'SPAWN_ENEMY', 
  SPAWN_ITEM = 'SPAWN_ITEM', 
  SPAWN_PARTICLES = 'SPAWN_PARTICLES',
  ADD_PLATFORM = 'ADD_PLATFORM', 
  CREATE_CLONE = 'CREATE_CLONE', 
  DELETE_CLONE = 'DELETE_CLONE',
  SET_TILE = 'SET_TILE',
  
  // Game Data
  CHANGE_SCORE = 'CHANGE_SCORE',
  SET_SCORE = 'SET_SCORE',
  SET_HEALTH = 'SET_HEALTH',
  CHANGE_HEALTH = 'CHANGE_HEALTH',
  GAME_OVER = 'GAME_OVER',
  WIN_GAME = 'WIN_GAME',

  // --- HARDWARE: OUTPUTS ---
  LED_ON = 'LED_ON',
  LED_OFF = 'LED_OFF',
  LED_TOGGLE = 'LED_TOGGLE',
  SET_RGB = 'SET_RGB',
  SET_RGB_BRIGHTNESS = 'SET_RGB_BRIGHTNESS',
  
  PLAY_TONE = 'PLAY_TONE',
  PLAY_NOTE = 'PLAY_NOTE',
  PLAY_SOUND = 'PLAY_SOUND',
  STOP_SOUND = 'STOP_SOUND',
  
  SET_FAN = 'SET_FAN',
  SET_SERVO = 'SET_SERVO',
  SET_MOTOR_SPEED = 'SET_MOTOR_SPEED',
  SET_MOTOR_DIR = 'SET_MOTOR_DIR',
  SET_STEPPER = 'SET_STEPPER',
  
  SET_RELAY = 'SET_RELAY',
  SET_SOLENOID = 'SET_SOLENOID',
  SET_LASER = 'SET_LASER',
  
  // Displays
  SET_LCD = 'SET_LCD',
  CLEAR_LCD = 'CLEAR_LCD',
  SCROLL_LCD = 'SCROLL_LCD',
  SET_OLED_TEXT = 'SET_OLED_TEXT',
  DRAW_OLED_SHAPE = 'DRAW_OLED_SHAPE',
  SET_SEGMENT = 'SET_SEGMENT',
  SET_MATRIX_ROW = 'SET_MATRIX_ROW',
  CLEAR_MATRIX = 'CLEAR_MATRIX',
  
  // --- HARDWARE: SENSORS / INPUT ---
  READ_DIGITAL = 'READ_DIGITAL',
  READ_ANALOG = 'READ_ANALOG',
  READ_TEMPERATURE = 'READ_TEMPERATURE',
  READ_HUMIDITY = 'READ_HUMIDITY',
  READ_DISTANCE = 'READ_DISTANCE',
  READ_GAS_LEVEL = 'READ_GAS_LEVEL',
  READ_FLAME = 'READ_FLAME',
  READ_RAIN = 'READ_RAIN',
  READ_SOIL = 'READ_SOIL',
  READ_HEARTBEAT = 'READ_HEARTBEAT',
  READ_COMPASS = 'READ_COMPASS',
  READ_GYRO = 'READ_GYRO',
  READ_GPS = 'READ_GPS',
  READ_COLOR = 'READ_COLOR',
  READ_PRESSURE = 'READ_PRESSURE',
  READ_FLEX = 'READ_FLEX',
  READ_MAGNETIC = 'READ_MAGNETIC',
  SET_VIBRATION = 'SET_VIBRATION',
  
  // --- SYSTEM ---
  SLEEP = 'SLEEP',
  LOG_DATA = 'LOG_DATA',
  RESET_BOARD = 'RESET_BOARD',
  CONNECT_WIFI = 'CONNECT_WIFI',
  SEND_HTTP = 'SEND_HTTP',
  READ_FILE = 'READ_FILE',
  WRITE_FILE = 'WRITE_FILE'
}

export interface CommandBlock {
  id: string;
  type: CommandType;
  hasBreakpoint?: boolean;
  params: {
    // Basic values
    value?: number;
    value2?: number; // For binary math/logic
    text?: string;
    text2?: string;
    message?: string;
    color?: string;
    
    // Hardware params
    pin?: number;
    duration?: number;
    speed?: number;
    angle?: number;
    row?: number; 
    col?: number; 
    
    // Logic/Vars
    condition?: string; 
    varName?: string;
    listName?: string;
    
    // App/UI
    screenName?: string; 
    textSize?: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'; 
    url?: string;
    
    // Game/Physics
    x?: number; 
    y?: number; 
    width?: number; 
    height?: number;
    direction?: 'cw' | 'ccw';
    effect?: 'color' | 'fisheye' | 'whirl' | 'pixelate' | 'mosaic' | 'brightness' | 'ghost';
    
    // Additional params for new components
    steps?: number; // For stepper motors
    state?: boolean; // For relays, solenoids, lasers, etc.
    note?: string; // For musical notes
    shape?: string; // For OLED shapes
    pattern?: string; // For matrix patterns
    ssid?: string; // For WiFi
    password?: string; // For WiFi
    method?: string; // For HTTP requests
  };
}

export interface BlockDefinition {
  type: CommandType;
  label: string;
  icon: any;
  defaultParams: any;
  color: string;
  category?: string;
  description?: string;
}

export interface GameEntity {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  emoji?: string;
  type: 'enemy' | 'item' | 'projectile' | 'platform' | 'clone' | 'powerup';
  vx?: number;
  vy?: number;
  color?: string;
  lifeTime?: number;
  // AI/Behavior
  initialX?: number;
  initialY?: number;
  range?: number;
  behavior?: 'patrol' | 'chase' | 'float_h' | 'float_v';
  subtype?: 'speed' | 'shield' | 'ghost'; // for powerups
}

export interface Tile {
  x: number;
  y: number;
  type: 'brick' | 'coin' | 'spike' | 'flag' | 'water' | 'grass' | 'dirt' | 'stone' | 'lava' | 'crate' | 'ladder' | 'spring' | 'key' | 'door';
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
  rotation?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  vy: number;
}

export interface SpriteState {
  x: number;
  y: number;
  rotation: number;
  emoji: string;
  texture: string | null;
  frames: string[]; // Animation Frames
  animationSpeed: number; // FPS-like
  speech: string | null;
  scene?: string;
  weather: 'none' | 'rain' | 'snow'; 
  score: number;
  keys: number; // Inventory
  health: number;
  maxHealth: number;
  variables: Record<string, any>;
  
  // Powerups (active duration)
  powerups: {
    speed?: number; // Frames remaining
    shield?: number;
    ghost?: number;
  };

  // Physics & Entities
  vy: number; 
  vx: number;
  opacity: number;
  scale: number;
  gravity: boolean; 
  gravityForce: number;
  jumpForce: number;
  isJumping: boolean;
  projectiles: GameEntity[];
  enemies: GameEntity[];
  items: GameEntity[];
  platforms: GameEntity[];
  clones: GameEntity[]; 
  cameraFollow: boolean;
  
  // Visual Effects
  // NOTE: particles are managed locally in GameCanvas for performance, 
  // but we use this trigger to signal a burst.
  effectTrigger?: { type: 'explosion' | 'sparkle' | 'poof', x: number, y: number, color?: string };
  particles: ParticleEffect[]; // Keep for legacy/save
  floatingTexts: FloatingText[];
  
  // Level Data
  tilemap: Tile[];
}

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
  potentiometerValue: number; 
  speakerVolume: number; 
  
  // New States
  rgbColor: string;
  sevenSegmentValue: number | null; 
  distance: number; 
  motionDetected: boolean;
  vibrationActive: boolean;
  keypadValue: string | null; 
  joystick: { x: number; y: number }; 
  
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
}

export interface AppElement {
  id: string;
  blockId?: string; 
  type: 'button' | 'text' | 'input' | 'image' | 'switch' | 'slider' | 'checkbox' | 'progress' | 'video' | 'map' | 'chart' | 'date' | 'camera' | 'drawing_canvas' | 'list' | 'divider' | 'spacer' | 'color_picker' | 'qr_code' | 'audio_recorder';
  content: string;
  actionMessage?: string;
  targetScreen?: string; 
  // Styling & Binding
  color?: string;
  textSize?: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl';
  variableName?: string; 
  max?: number; 
  value?: number;
  placeholder?: string;
}

export interface AppState {
  title: string;
  backgroundColor: string;
  activeScreen: string; 
  screens: Record<string, AppElement[]>; 
  score: number;
  variables: Record<string, any>;
  // UI State
  isCollapsed?: boolean;
  activeLevelTool?: string; // Relaxed type to allow new entities
}

export type ComponentType = 
  // MICROCONTROLLERS
  'ARDUINO_UNO' | 'ARDUINO_NANO' | 'ARDUINO_MEGA' | 'ESP32_DEVKIT' | 'ESP8266' | 'NODEMCU' | 'RASPBERRY_PI_ZERO' | 'RASPBERRY_PI_4' | 'MICROBIT' |
  
  // OUTPUTS
  'LED_RED' | 'LED_BLUE' | 'LED_GREEN' | 'LED_WHITE' | 'LED_YELLOW' | 'LED_ORANGE' |
  'RGB_LED' | 'RGB_STRIP' | 'LASER' | 'BULB' |
  
  // INPUTS
  'BUTTON' | 'BUTTON_TACTILE' | 'SWITCH_SLIDE' | 'SWITCH_TOGGLE' | 'SWITCH_DIP' | 'SWITCH_ROTARY' |
  'POTENTIOMETER' | 'SLIDE_POT' | 'JOYSTICK' | 'KEYPAD' | 'KEYPAD_MATRIX' | 'ENCODER' |
  
  // SENSORS
  'LIGHT_SENSOR' | 'TEMP_SENSOR' | 'DHT11' | 'DHT22' | 'THERMISTOR' |
  'ULTRASONIC' | 'MOTION' | 'SOUND_SENSOR' | 'GAS_SENSOR' | 'FLAME_SENSOR' | 'RAIN_SENSOR' | 
  'SOIL_SENSOR' | 'PRESSURE_SENSOR' | 'FLEX_SENSOR' | 'TILT_SENSOR' | 'HALL_SENSOR' | 'COMPASS' |
  'GYRO' | 'GPS' | 'HEARTBEAT' | 'COLOR_SENSOR' |
  
  // COMPONENTS
  'RESISTOR' | 'RFID' | 'FINGERPRINT' | 'BUZZER' | 'SPEAKER' | 'RELAY' | 'SOLENOID' |
  'SERVO' | 'SERVO_CONTINUOUS' | 'MOTOR_DC' | 'FAN' | 'STEPPER' | 'PUMP' | 'VIBRATION' |
  'LCD' | 'OLED' | 'SEVEN_SEGMENT' | 'MATRIX' |
  'WIFI' | 'BLUETOOTH' | 'RADIO' | 'SD_CARD' | 'RTC' |
  'BATTERY_9V' | 'BATTERY_AA' | 'SOLAR' | 'BREADBOARD' |
  'LOGIC_AND' | 'LOGIC_OR' | '555_TIMER';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  pin: number;
  rotation?: number;
  wireColor?: string;
}

export interface MissionStep {
    id: string;
    text: string;
    isCompleted: boolean;
    criteria?: {
        requiredBlock?: CommandType;
    };
}

export interface Mission {
    id: string;
    mode: AppMode;
    title: string;
    description: string;
    completed: boolean;
    steps: MissionStep[];
}

export type PlanType = 'free' | 'maker' | 'inventor';

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  plan: PlanType;
  badges: string[]; // IDs of badges
}
