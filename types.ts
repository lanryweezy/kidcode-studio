
export enum AppMode {
  APP = 'APP',
  GAME = 'GAME',
  HARDWARE = 'HARDWARE'
}

export enum CommandType {
  // Common
  WAIT = 'WAIT',
  REPEAT = 'REPEAT',
  END_REPEAT = 'END_REPEAT',
  
  // Logic
  IF = 'IF', // Generic Condition Block
  ELSE = 'ELSE', // New Branching Block
  WAIT_FOR_PRESS = 'WAIT_FOR_PRESS',
  END_IF = 'END_IF',
  
  // App Maker
  SET_TITLE = 'SET_TITLE',
  SET_BACKGROUND = 'SET_BACKGROUND',
  ADD_BUTTON = 'ADD_BUTTON',
  ADD_TEXT_BLOCK = 'ADD_TEXT_BLOCK',
  ADD_INPUT = 'ADD_INPUT',
  ADD_IMAGE = 'ADD_IMAGE',
  CLEAR_UI = 'CLEAR_UI',
  
  // Game (Sprite)
  MOVE_X = 'MOVE_X',
  MOVE_Y = 'MOVE_Y',
  SAY = 'SAY',
  SET_EMOJI = 'SET_EMOJI',
  SET_SCENE = 'SET_SCENE',
  
  // Score / Variables
  CHANGE_SCORE = 'CHANGE_SCORE',
  SET_SCORE = 'SET_SCORE',

  // Hardware
  LED_ON = 'LED_ON',
  LED_OFF = 'LED_OFF',
  PLAY_TONE = 'PLAY_TONE',
  PLAY_SOUND = 'PLAY_SOUND',
  SET_FAN = 'SET_FAN',
  SET_LCD = 'SET_LCD',
  CLEAR_LCD = 'CLEAR_LCD',
  SET_SERVO = 'SET_SERVO',
  SET_RGB = 'SET_RGB',
  SET_SEGMENT = 'SET_SEGMENT',
  SET_VIBRATION = 'SET_VIBRATION',
  
  // Hardware "Power/Brains"
  SLEEP = 'SLEEP',
  LOG_DATA = 'LOG_DATA'
}

export interface CommandBlock {
  id: string;
  type: CommandType;
  params: {
    value?: number;
    text?: string;
    message?: string;
    color?: string;
    pin?: number;
    duration?: number;
    speed?: number;
    angle?: number;
    condition?: 'IS_PRESSED' | 'IS_DARK' | 'IS_TEMP_HIGH' | 'IS_SWITCH_ON' | 'FAN_SPEED_GT' | 'PIN_HIGH' | 'IS_TOUCHING_EDGE' | 'IS_MOTION' | 'DIST_LESS_THAN'; 
  };
}

export interface BlockDefinition {
  type: CommandType;
  label: string;
  icon: any;
  defaultParams: any;
  color: string;
  category?: string;
}

export interface ExecutionContext {
  canvasContext: CanvasRenderingContext2D | null;
  setHardwareState: (pin: number, value: boolean) => void;
  spriteState: SpriteState;
  setSpriteState: (s: SpriteState) => void;
  appState: AppState;
  setAppState: (s: AppState) => void;
  stopSignal: { current: boolean };
}

export interface SpriteState {
  x: number;
  y: number;
  rotation: number;
  emoji: string;
  speech: string | null;
  scene?: string;
  score: number;
}

export interface HardwareState {
  pins: boolean[]; // 0-3 LEDs, 4 Button, 5 Light
  buzzerActive: boolean;
  fanSpeed: number; // 0 to 100
  temperature: number; // Simulated temperature value
  servoAngle: number; // 0-180
  lcdText: string;
  potentiometerValue: number; // 0-100
  speakerVolume: number; // 0-100
  
  // New States
  rgbColor: string;
  sevenSegmentValue: number | null; // null means off
  distance: number; // cm
  motionDetected: boolean;
  vibrationActive: boolean;
}

export interface AppElement {
  id: string;
  type: 'button' | 'text' | 'input' | 'image';
  content: string;
  actionMessage?: string;
}

export interface AppState {
  title: string;
  backgroundColor: string;
  elements: AppElement[];
  score: number;
}

// --- VISUAL CIRCUIT BUILDER TYPES ---

export type ComponentType = 
  'LED_RED' | 'LED_BLUE' | 'LED_GREEN' | 
  'BUTTON' | 'SWITCH' | 'LIGHT_SENSOR' | 'POTENTIOMETER' | 'TEMP_SENSOR' | 
  'FAN' | 'SERVO' | 'SPEAKER' | 'LCD' |
  'RGB_LED' | 'SEVEN_SEGMENT' | 'ULTRASONIC' | 'MOTION' | 'VIBRATION' |
  // NEW SENSORS
  'GAS_SENSOR' | 'FLAME_SENSOR' | 'SOUND_SENSOR' | 'RAIN_SENSOR' | 'SOIL_SENSOR' |
  // NEW INPUTS
  'KEYPAD' | 'JOYSTICK' |
  // NEW OUTPUTS
  'RELAY' | 'SOLENOID' | 'MOTOR_DC';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation?: number; // 0, 90, 180, 270
  pin: number; // The logical pin it is connected to
}
