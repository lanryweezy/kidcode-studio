
import { AppMode, CommandType, BlockDefinition, ComponentType } from './types';
import { Gamepad2, Cpu, ArrowUp, Type, Eye, Lightbulb, Music, Repeat, XCircle, Layout, MousePointer2, PaintBucket, MessageSquare, Hand, Moon, GitBranch, Battery, Fan, Terminal, Thermometer, Disc, Zap, Volume2, Image, Eraser, TextCursorInput, Move, ToggleLeft, Gauge, Tv, Split, Image as ImageIcon, Trophy, Target, Palette, Hash, Radar, Activity, Waves, Flame, CloudRain, Droplets, Mic, Lock, Keyboard, Gamepad, Power } from 'lucide-react';

export const INITIAL_HARDWARE_STATE = {
  // 0-3: LEDs, 4: Button (Input), 5: Light Sensor (Input, default true/light), 6: Switch
  pins: [false, false, false, false, false, true, false],
  buzzerActive: false,
  fanSpeed: 0,
  temperature: 25, // 25 degrees Celsius default
  servoAngle: 90,
  lcdText: "Hello World",
  potentiometerValue: 0,
  speakerVolume: 50,
  rgbColor: '#ff0000',
  sevenSegmentValue: null,
  distance: 100, // cm
  motionDetected: false,
  vibrationActive: false
};

export const INITIAL_SPRITE_STATE = {
  x: 200, // Center of 400x400 canvas
  y: 200,
  rotation: 0,
  emoji: '🤖',
  speech: null,
  scene: 'grid',
  score: 0
};

export const INITIAL_APP_STATE = {
  title: 'My Cool App',
  backgroundColor: '#ffffff',
  elements: [],
  score: 0
};

// Typed as Record<AppMode, BlockDefinition[]>
export const AVAILABLE_BLOCKS: Record<AppMode, BlockDefinition[]> = {
  [AppMode.APP]: [
    { type: CommandType.SET_TITLE, label: 'Set Title', icon: Type, defaultParams: { text: 'Hello World' }, color: 'bg-pink-500', category: 'UI' },
    { type: CommandType.SET_BACKGROUND, label: 'Background', icon: PaintBucket, defaultParams: { color: '#ffffff' }, color: 'bg-pink-400', category: 'UI' },
    { type: CommandType.ADD_TEXT_BLOCK, label: 'Add Text', icon: MessageSquare, defaultParams: { text: 'Welcome!' }, color: 'bg-indigo-500', category: 'Content' },
    { type: CommandType.ADD_INPUT, label: 'Add Input', icon: TextCursorInput, defaultParams: { text: 'Enter name...' }, color: 'bg-teal-500', category: 'Content' },
    { type: CommandType.ADD_IMAGE, label: 'Add Image', icon: Image, defaultParams: { text: 'https://placehold.co/150' }, color: 'bg-fuchsia-500', category: 'Content' },
    { type: CommandType.ADD_BUTTON, label: 'Add Button', icon: MousePointer2, defaultParams: { text: 'Click Me', message: 'You clicked it!' }, color: 'bg-blue-600', category: 'Interactivity' },
    { type: CommandType.CHANGE_SCORE, label: 'Change Score', icon: Trophy, defaultParams: { value: 1 }, color: 'bg-yellow-500', category: 'Logic' },
    { type: CommandType.CLEAR_UI, label: 'Clear Screen', icon: Eraser, defaultParams: {}, color: 'bg-rose-500', category: 'Logic' },
    { type: CommandType.REPEAT, label: 'Start Loop', icon: Repeat, defaultParams: { value: 3 }, color: 'bg-violet-600', category: 'Logic' },
    { type: CommandType.END_REPEAT, label: 'End Loop', icon: XCircle, defaultParams: {}, color: 'bg-violet-400', category: 'Logic' },
    { type: CommandType.WAIT, label: 'Wait (sec)', icon: Eye, defaultParams: { value: 1 }, color: 'bg-slate-500', category: 'Logic' },
  ],
  [AppMode.GAME]: [
    { type: CommandType.MOVE_X, label: 'Move X', icon: ArrowUp, defaultParams: { value: 10 }, color: 'bg-orange-500', category: 'Movement' },
    { type: CommandType.MOVE_Y, label: 'Move Y', icon: ArrowUp, defaultParams: { value: 10 }, color: 'bg-orange-500', category: 'Movement' },
    { type: CommandType.SAY, label: 'Say Message', icon: Type, defaultParams: { text: 'Hello!' }, color: 'bg-green-500', category: 'Actions' },
    { type: CommandType.SET_EMOJI, label: 'Change Char', icon: Gamepad2, defaultParams: { text: '👽' }, color: 'bg-purple-500', category: 'Looks' },
    { type: CommandType.SET_SCENE, label: 'Set Scene', icon: ImageIcon, defaultParams: { text: 'space' }, color: 'bg-purple-600', category: 'Looks' },
    { type: CommandType.CHANGE_SCORE, label: 'Change Score', icon: Trophy, defaultParams: { value: 1 }, color: 'bg-yellow-500', category: 'Data' },
    { type: CommandType.SET_SCORE, label: 'Set Score', icon: Target, defaultParams: { value: 0 }, color: 'bg-yellow-600', category: 'Data' },
    { type: CommandType.IF, label: 'If Condition', icon: GitBranch, defaultParams: { condition: 'IS_TOUCHING_EDGE', value: 0 }, color: 'bg-indigo-600', category: 'Logic' },
    { type: CommandType.ELSE, label: 'Else', icon: Split, defaultParams: {}, color: 'bg-indigo-500', category: 'Logic' },
    { type: CommandType.END_IF, label: 'End If', icon: GitBranch, defaultParams: {}, color: 'bg-indigo-400', category: 'Logic' },
    { type: CommandType.REPEAT, label: 'Start Loop', icon: Repeat, defaultParams: { value: 4 }, color: 'bg-violet-600', category: 'Logic' },
    { type: CommandType.END_REPEAT, label: 'End Loop', icon: XCircle, defaultParams: {}, color: 'bg-violet-400', category: 'Logic' },
    { type: CommandType.WAIT, label: 'Wait (sec)', icon: Eye, defaultParams: { value: 1 }, color: 'bg-slate-500', category: 'Logic' },
  ],
  [AppMode.HARDWARE]: [
    // --- POWER ---
    { type: CommandType.SLEEP, label: 'Power Save', icon: Battery, defaultParams: { value: 1 }, color: 'bg-emerald-600', category: '⚡ Power' },
    
    // --- BRAINS ---
    { type: CommandType.LOG_DATA, label: 'Print Data', icon: Terminal, defaultParams: { text: 'System OK' }, color: 'bg-slate-800', category: '🧠 Brains' },

    // --- INPUTS (Tools for sensing) ---
    { type: CommandType.WAIT_FOR_PRESS, label: 'Wait Button', icon: Hand, defaultParams: {}, color: 'bg-blue-500', category: '👀 Inputs' },
    
    // --- OUTPUTS (Tools for acting) ---
    { type: CommandType.LED_ON, label: 'LED On', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-yellow-500', category: '💪 Outputs' },
    { type: CommandType.LED_OFF, label: 'LED Off', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-stone-500', category: '💪 Outputs' },
    { type: CommandType.SET_RGB, label: 'RGB Color', icon: Palette, defaultParams: { color: '#ff0000' }, color: 'bg-pink-600', category: '💪 Outputs' },
    { type: CommandType.SET_SEGMENT, label: 'Show Number', icon: Hash, defaultParams: { value: 5 }, color: 'bg-red-600', category: '💪 Outputs' },
    { type: CommandType.PLAY_TONE, label: 'Beep', icon: Music, defaultParams: { duration: 0.5 }, color: 'bg-teal-500', category: '💪 Outputs' },
    { type: CommandType.PLAY_SOUND, label: 'Play FX', icon: Volume2, defaultParams: { text: 'siren' }, color: 'bg-fuchsia-600', category: '💪 Outputs' },
    { type: CommandType.SET_FAN, label: 'Set Fan', icon: Fan, defaultParams: { speed: 100 }, color: 'bg-cyan-600', category: '💪 Outputs' },
    { type: CommandType.SET_SERVO, label: 'Servo Motor', icon: Move, defaultParams: { angle: 90 }, color: 'bg-orange-600', category: '💪 Outputs' },
    { type: CommandType.SET_VIBRATION, label: 'Vibrate', icon: Waves, defaultParams: { value: 1 }, color: 'bg-purple-600', category: '💪 Outputs' },
    { type: CommandType.SET_LCD, label: 'Write to LCD', icon: Tv, defaultParams: { text: 'Hello!' }, color: 'bg-lime-600', category: '💪 Outputs' },
    { type: CommandType.CLEAR_LCD, label: 'Clear LCD', icon: Eraser, defaultParams: {}, color: 'bg-lime-700', category: '💪 Outputs' },

    // --- LOGIC (Clean & Engineered) ---
    { type: CommandType.IF, label: 'If Condition', icon: GitBranch, defaultParams: { condition: 'IS_PRESSED', value: 30, pin: 0 }, color: 'bg-indigo-600', category: '🔀 Logic' },
    { type: CommandType.ELSE, label: 'Else', icon: Split, defaultParams: {}, color: 'bg-indigo-500', category: '🔀 Logic' },
    { type: CommandType.END_IF, label: 'End If', icon: GitBranch, defaultParams: {}, color: 'bg-indigo-400', category: '🔀 Logic' },
    
    // --- CONTROL FLOW ---
    { type: CommandType.REPEAT, label: 'Loop', icon: Repeat, defaultParams: { value: 4 }, color: 'bg-violet-600', category: '🔄 Control' },
    { type: CommandType.END_REPEAT, label: 'End Loop', icon: XCircle, defaultParams: {}, color: 'bg-violet-400', category: '🔄 Control' },
    { type: CommandType.WAIT, label: 'Wait (sec)', icon: Eye, defaultParams: { value: 1 }, color: 'bg-slate-500', category: '🔄 Control' },
  ]
};

export const MODE_CONFIG = {
  [AppMode.APP]: { name: 'App Maker', icon: Layout, color: 'text-pink-500', bg: 'bg-pink-50' },
  [AppMode.GAME]: { name: 'Game Maker', icon: Gamepad2, color: 'text-orange-500', bg: 'bg-orange-50' },
  [AppMode.HARDWARE]: { name: 'Circuit Lab', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-50' },
};

// --- CIRCUIT BUILDER PALETTE ---

export const CIRCUIT_PALETTE: { type: ComponentType; label: string; icon: any; color: string; defaultPin: number; category?: string }[] = [
  // SENSORS
  { type: 'LIGHT_SENSOR', label: 'Light Sensor', icon: Moon, color: 'text-yellow-600', defaultPin: 5, category: 'Sensors' },
  { type: 'MOTION', label: 'Motion Sensor', icon: Activity, color: 'text-emerald-600', defaultPin: 91, category: 'Sensors' },
  { type: 'ULTRASONIC', label: 'Dist. Sensor', icon: Radar, color: 'text-blue-600', defaultPin: 92, category: 'Sensors' },
  { type: 'TEMP_SENSOR', label: 'Heat Sensor', icon: Thermometer, color: 'text-slate-600', defaultPin: 99, category: 'Sensors' },
  { type: 'GAS_SENSOR', label: 'Gas Sensor', icon: Waves, color: 'text-gray-500', defaultPin: 7, category: 'Sensors' },
  { type: 'FLAME_SENSOR', label: 'Flame Sensor', icon: Flame, color: 'text-orange-500', defaultPin: 8, category: 'Sensors' },
  { type: 'SOUND_SENSOR', label: 'Sound Sensor', icon: Mic, color: 'text-indigo-500', defaultPin: 9, category: 'Sensors' },
  { type: 'RAIN_SENSOR', label: 'Rain Sensor', icon: CloudRain, color: 'text-blue-400', defaultPin: 10, category: 'Sensors' },
  { type: 'SOIL_SENSOR', label: 'Soil Moisture', icon: Droplets, color: 'text-amber-700', defaultPin: 11, category: 'Sensors' },

  // INPUTS
  { type: 'BUTTON', label: 'Button', icon: Disc, color: 'text-rose-600', defaultPin: 4, category: 'Inputs' },
  { type: 'SWITCH', label: 'Switch', icon: ToggleLeft, color: 'text-slate-500', defaultPin: 6, category: 'Inputs' },
  { type: 'POTENTIOMETER', label: 'Knob', icon: Gauge, color: 'text-amber-600', defaultPin: 97, category: 'Inputs' },
  { type: 'KEYPAD', label: 'Keypad 4x4', icon: Keyboard, color: 'text-slate-700', defaultPin: 12, category: 'Inputs' },
  { type: 'JOYSTICK', label: 'Joystick', icon: Gamepad, color: 'text-slate-800', defaultPin: 13, category: 'Inputs' },

  // OUTPUTS
  { type: 'LED_RED', label: 'Red LED', icon: Lightbulb, color: 'text-red-500', defaultPin: 0, category: 'Outputs' },
  { type: 'LED_BLUE', label: 'Blue LED', icon: Lightbulb, color: 'text-blue-500', defaultPin: 1, category: 'Outputs' },
  { type: 'LED_GREEN', label: 'Green LED', icon: Lightbulb, color: 'text-green-500', defaultPin: 2, category: 'Outputs' },
  { type: 'RGB_LED', label: 'RGB LED', icon: Palette, color: 'text-pink-500', defaultPin: 94, category: 'Outputs' },
  { type: 'SEVEN_SEGMENT', label: 'Display', icon: Hash, color: 'text-red-600', defaultPin: 93, category: 'Outputs' },
  { type: 'FAN', label: 'Cooling Fan', icon: Fan, color: 'text-cyan-500', defaultPin: 98, category: 'Outputs' },
  { type: 'SERVO', label: 'Servo Motor', icon: Move, color: 'text-orange-600', defaultPin: 96, category: 'Outputs' },
  { type: 'VIBRATION', label: 'Vibration', icon: Waves, color: 'text-purple-600', defaultPin: 90, category: 'Outputs' },
  { type: 'LCD', label: 'LCD Screen', icon: Tv, color: 'text-lime-600', defaultPin: 95, category: 'Outputs' },
  { type: 'SPEAKER', label: 'Speaker', icon: Volume2, color: 'text-violet-500', defaultPin: 100, category: 'Outputs' },
  { type: 'RELAY', label: 'Relay Module', icon: Power, color: 'text-blue-800', defaultPin: 14, category: 'Outputs' },
  { type: 'SOLENOID', label: 'Solenoid Lock', icon: Lock, color: 'text-stone-600', defaultPin: 15, category: 'Outputs' },
  { type: 'MOTOR_DC', label: 'DC Motor', icon: Fan, color: 'text-yellow-500', defaultPin: 16, category: 'Outputs' },
];
