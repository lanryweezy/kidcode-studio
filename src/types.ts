
export enum AppMode {
  APP = 'APP',
  GAME = 'GAME',
  GAME_3D = 'GAME_3D',
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
  
  // --- 3D COMMANDS ---
  MOVE_Z = 'MOVE_Z',
  ROTATE_X = 'ROTATE_X',
  ROTATE_Y = 'ROTATE_Y',
  ROTATE_Z = 'ROTATE_Z',
  SET_VIEW_3D = 'SET_VIEW_3D',
  SPAWN_3D_OBJECT = 'SPAWN_3D_OBJECT',
  SET_LIGHTING = 'SET_LIGHTING',
  GENERATE_ENVIRONMENT = 'GENERATE_ENVIRONMENT',
  
  // --- EVENTS & MESSAGING ---
  ON_COLLIDE = 'ON_COLLIDE',
  ON_CLICK = 'ON_CLICK',
  BROADCAST = 'BROADCAST',
  WHEN_I_RECEIVE = 'WHEN_I_RECEIVE',
  END_EVENT = 'END_EVENT',

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
  ADD_NEWS_FEED = 'ADD_NEWS_FEED',
  ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE',
  ADD_MAP = 'ADD_MAP',
  ADD_CHART = 'ADD_CHART',
  ADD_QR_CODE = 'ADD_QR_CODE',
  ADD_RATING = 'ADD_RATING',
  ADD_DIVIDER = 'ADD_DIVIDER',
  ADD_SPACER = 'ADD_SPACER',
  ADD_ICON = 'ADD_ICON',
  DEFINE_PLUGIN = 'DEFINE_PLUGIN',
  USE_PLUGIN = 'USE_PLUGIN',
  
  // UI Actions
  SPEAK = 'SPEAK', 
  VIBRATE_DEVICE = 'VIBRATE_DEVICE',
  SHOW_ALERT = 'SHOW_ALERT',
  SHOW_TOAST = 'SHOW_TOAST',
  OPEN_URL = 'OPEN_URL',
  SHARE_TEXT = 'SHARE_TEXT',
  CLEAR_UI = 'CLEAR_UI',
  CLOUD_SAVE = 'CLOUD_SAVE',
  CLOUD_LOAD = 'CLOUD_LOAD',
  
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
  
  // --- PHYSICS 2.0 (Matter.js) ---
  SET_PHYSICS_TYPE = 'SET_PHYSICS_TYPE', // Static, Dynamic, Bouncy
  CREATE_JOINT = 'CREATE_JOINT', // Connect two bodies
  APPLY_FORCE = 'APPLY_FORCE', // Push object

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
  PLAY_ANIMATION = 'PLAY_ANIMATION',
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
  NPC_TALK = 'NPC_TALK',
  CREATE_DIALOGUE = 'CREATE_DIALOGUE',
  END_DIALOGUE = 'END_DIALOGUE',
  ADD_PLATFORM = 'ADD_PLATFORM',
  CREATE_CLONE = 'CREATE_CLONE',
  DELETE_CLONE = 'DELETE_CLONE',
  SET_TILE = 'SET_TILE',
  
  // === 3D GAME COMMANDS ===
  SPAWN_3D_MODEL = 'SPAWN_3D_MODEL',
  SET_3D_POSITION = 'SET_3D_POSITION',
  ROTATE_3D_MODEL = 'ROTATE_3D_MODEL',
  SCALE_3D_MODEL = 'SCALE_3D_MODEL',
  PLAY_3D_ANIMATION = 'PLAY_3D_ANIMATION',
  SET_3D_CAMERA = 'SET_3D_CAMERA',
  SET_3D_LIGHTING = 'SET_3D_LIGHTING',
  ENABLE_PHYSICS_3D = 'ENABLE_PHYSICS_3D',
  SWITCH_TO_3D_MODE = 'SWITCH_TO_3D_MODE',
  SWITCH_TO_2D_MODE = 'SWITCH_TO_2D_MODE',
  
  // Inventory & Items
  ADD_TO_INVENTORY = 'ADD_TO_INVENTORY',
  REMOVE_FROM_INVENTORY = 'REMOVE_FROM_INVENTORY',
  USE_ITEM = 'USE_ITEM',
  SHOW_INVENTORY = 'SHOW_INVENTORY',
  CRAFT_ITEM = 'CRAFT_ITEM',
  
  // Audio & Music
  SET_BACKGROUND_MUSIC = 'SET_BACKGROUND_MUSIC',
  PLAY_MUSIC = 'PLAY_MUSIC',
  STOP_MUSIC = 'STOP_MUSIC',
  SET_MUSIC_VOLUME = 'SET_MUSIC_VOLUME',
  PLAY_AMBIENT = 'PLAY_AMBIENT',
  
  // Cutscenes & Events
  TRIGGER_CUTSCENE = 'TRIGGER_CUTSCENE',
  FADE_IN = 'FADE_IN',
  FADE_OUT = 'FADE_OUT',
  SHAKE_SCREEN = 'SHAKE_SCREEN',
  SLOW_MOTION = 'SLOW_MOTION',
  FREEZE_FRAME = 'FREEZE_FRAME',
  
  // Boss Battles
  SPAWN_BOSS = 'SPAWN_BOSS',
  SET_BOSS_HEALTH = 'SET_BOSS_HEALTH',
  BOSS_ATTACK = 'BOSS_ATTACK',
  BOSS_PHASE = 'BOSS_PHASE',
  
  // Advanced Movement
  DASH = 'DASH',
  WALL_JUMP = 'WALL_JUMP',
  DOUBLE_JUMP = 'DOUBLE_JUMP',
  GRAPPLE = 'GRAPPLE',
  
  // Checkpoints & Saves
  CREATE_CHECKPOINT = 'CREATE_CHECKPOINT',
  LOAD_CHECKPOINT = 'LOAD_CHECKPOINT',
  AUTO_SAVE = 'AUTO_SAVE',
  
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
  
  // --- HARDWARE: LOGIC ---
  LOGIC_AND = 'LOGIC_AND',
  LOGIC_OR = 'LOGIC_OR',
  LOGIC_NOT = 'LOGIC_NOT',
  
  READ_FILE = 'READ_FILE',
  WRITE_FILE = 'WRITE_FILE'
}

export interface CommandBlock {
  id: string;
  type: CommandType;
  hasBreakpoint?: boolean;
  screenId?: string; // For organizing blocks by screen/page
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

// New interface for organized page code
export interface PageCode {
  screenId: string;
  screenName: string;
  blocks: CommandBlock[];
  generatedCode: {
    python: string;
    javascript: string;
    arduino: string;
  };
  lastEdited: number;
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
  z?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  width?: number;
  height?: number;
  depth?: number;
  emoji?: string;
  modelUrl?: string; // For 3D GLTF
  animations?: Record<string, number[]>;
  currentAnimation?: string;
  type: 'enemy' | 'item' | 'projectile' | 'platform' | 'clone' | 'powerup' | 'object3d';
  vx?: number;
  vy?: number;
  vz?: number;
  color?: string;
  lifeTime?: number;
  physicsType?: 'static' | 'dynamic' | 'bouncy'; // Physics 2.0
  // AI/Behavior
  initialX?: number;
  initialY?: number;
  initialZ?: number;
  range?: number;
  behavior?: 'patrol' | 'chase' | 'float_h' | 'float_v' | 'orbit';
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
  z: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  emoji: string;
  texture: string | null;
  frames: string[]; // Animation Frames
  animations: Record<string, number[]>; // Named animation sequences
  currentAnimation: string | null;
  animationSpeed: number; // FPS-like
  speech: string | null;
  scene?: string;
  weather: 'none' | 'rain' | 'snow';
  score: number;
  keys: number; // Inventory
  health: number;
  maxHealth: number;
  variables: Record<string, any>;

  is3D: boolean;
  cameraMode: 'first_person' | 'third_person' | 'top_down';
  skyboxUrl?: string;

  // Powerups (active duration)
  powerups: {
    speed?: number; // Frames remaining
    shield?: number;
    ghost?: number;
  };

  // Physics & Entities
  vy: number;
  vx: number;
  vz: number;
  opacity: number;
  scale: number;
  gravity: boolean;
  gravityForce: number;
  jumpForce: number;
  isJumping: boolean;
  canDoubleJump: boolean;
  canDash: boolean;
  dashCooldown: number;
  projectiles: GameEntity[];
  enemies: GameEntity[];
  items: GameEntity[];
  platforms: GameEntity[];
  clones: GameEntity[];
  cameraFollow: boolean;

  // Visual Effects
  effectTrigger?: { type: 'explosion' | 'sparkle' | 'poof', x: number, y: number, z?: number, color?: string };
  particles: ParticleEffect[];
  floatingTexts: FloatingText[];

  // Level Data
  tilemap: Tile[];
  
  // === ENHANCED GAME FEATURES ===
  
  // Inventory System
  inventory: InventoryItem[];
  maxInventorySize: number;
  equippedItem?: InventoryItem;
  
  // Dialogue System
  activeDialogue?: DialogueNode;
  dialogueHistory: string[];
  isDialogueActive: boolean;
  
  // Music & Audio
  backgroundMusic?: string;
  musicVolume: number;
  ambientSound?: string;
  
  // Checkpoints
  checkpoints: Checkpoint[];
  lastCheckpoint?: Checkpoint;
  
  // Cutscenes
  isCutsceneActive: boolean;
  screenShake: number;
  screenFreeze: number;
  timeScale: number;
  fadeAlpha: number;
  
  // Boss Battles
  activeBoss?: BossState;
  bossHealth: number;
  bossMaxHealth: number;
  bossPhase: number;
}

// === NEW INTERFACES FOR ENHANCED FEATURES ===

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'weapon' | 'consumable' | 'key' | 'material' | 'quest';
  quantity: number;
  maxStack: number;
  effect?: {
    type: 'heal' | 'damage' | 'speed' | 'shield' | 'teleport';
    value: number;
    duration?: number;
  };
  craftable?: boolean;
  recipe?: { itemId: string; quantity: number }[];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerEmoji: string;
  text: string;
  choices?: DialogueChoice[];
  nextId?: string;
  onChoose?: { itemId?: string; condition?: string };
}

export interface DialogueChoice {
  text: string;
  nextId: string;
  condition?: string; // e.g., "hasItem:key"
  effect?: { type: string; value: any };
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  name: string;
  unlocked: boolean;
}

export interface BossState {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  phase: number;
  attackPattern: string;
  isInvulnerable: boolean;
  attackCooldown: number;
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

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  xpReward?: number;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  progress?: number;
  maxProgress?: number;
}

export interface Trophy {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward?: number;
  unlockedAt?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirements: string[];
  category: 'coding' | 'creativity' | 'community' | 'mastery';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
}

export interface Cosmetic {
  id: string;
  type: 'avatar' | 'theme' | 'effect';
  name: string;
  unlocked: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  plan: PlanType;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  badges: Badge[];
  quests: Quest[];
  trophies?: Trophy[];
  projects: string[]; // IDs
  creatorScore?: number;
  skillTree?: SkillNode[];
  cosmetics?: Cosmetic[];
  leaderboards?: LeaderboardEntry[];
}

// === 3D ASSET TYPES ===
export interface Model3D {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  format: 'glb' | 'gltf' | 'fbx' | 'obj';
  vertices: number;
  textures: string[];
  isRigged: boolean;
  animations?: string[];
  category: 'character' | 'prop' | 'vehicle' | 'building' | 'environment';
  style: 'cartoon' | 'realistic' | 'lowpoly' | 'anime' | 'voxel';
  aiGenerated: boolean;
  createdAt: number;
}
