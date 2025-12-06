
import { AppMode, CommandType, BlockDefinition, ComponentType, Mission } from './types';
import { 
  Gamepad2, Cpu, ArrowUp, Type, Eye, Lightbulb, Music, Repeat, XCircle, Layout, MousePointer2, PaintBucket, MessageSquare, Hand, Moon, GitBranch, Battery, Fan, Terminal, Thermometer, Disc, Zap, Volume2, Image, Eraser, TextCursorInput, Move, ToggleLeft, Gauge, Tv, Split, Image as ImageIcon, Trophy, Target, Palette, Hash, Radar, Activity, Waves, Flame, CloudRain, Droplets, Mic, Lock, Keyboard, Gamepad, Power, Variable, Fingerprint, Box, Sun, Wind, CloudFog, Wifi, Bluetooth, Radio, Network, Smartphone, Speaker, Headphones, Watch, Camera, Printer, HardDrive, Shield, Key, Crosshair, RotateCcw, Settings, Signal, SlidersHorizontal, ToggleRight, CheckSquare, BarChart3, Megaphone, StickyNote, Ghost, Apple, Rocket, ArrowBigUp, Minus, MapPin, Grid, Scan, Heart, Layers, CloudSnow, List, Copy, Video, Trash, PanelTop, BrickWall, Coins, Triangle, Flag, Calendar, Clock, Globe, Link, Share2, AlertTriangle, Play, Pause, Square, Circle, Anchor, ArrowRight, ArrowLeft, RotateCw, RefreshCw, ZoomIn, ZoomOut, EyeOff, Tag, Calculator, Percent, Binary, Sigma, Ruler, Compass, Timer, Hourglass, SmartphoneCharging, FileText, FolderOpen, Save, Download, Upload, Cloud, Server, Database, Truck, Bike, Car, Boxes, Mountain, DoorOpen, Key as KeyIcon, ArrowUpCircle, Sparkles, StopCircle, User, Pencil
} from 'lucide-react';

export const INITIAL_HARDWARE_STATE = {
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
  sensorHistory: []
};

export const INITIAL_SPRITE_STATE = {
  x: 200, 
  y: 200,
  rotation: 0,
  opacity: 1,
  scale: 1,
  emoji: '🤖',
  texture: null,
  frames: [],
  animationSpeed: 5,
  speech: null,
  scene: 'grid',
  weather: 'none' as 'none' | 'rain' | 'snow',
  score: 0,
  keys: 0,
  health: 3,
  maxHealth: 3,
  variables: {},
  // Powerups
  powerups: {
    speed: 0,
    shield: 0,
    ghost: 0
  },
  // Physics & Entities
  vy: 0,
  vx: 0,
  gravity: false,
  gravityForce: 1,
  jumpForce: 15,
  isJumping: false,
  projectiles: [],
  enemies: [],
  items: [],
  platforms: [],
  clones: [],
  cameraFollow: false,
  // Visual Effects
  particles: [],
  floatingTexts: [],
  // Level Data
  tilemap: []
};

export const INITIAL_APP_STATE = {
  title: 'My Cool App',
  backgroundColor: '#ffffff',
  activeScreen: 'main',
  screens: { 'main': [] },
  score: 0,
  variables: {},
  activeLevelTool: undefined
};

export const MODE_CONFIG = {
  [AppMode.APP]: { label: 'App Builder', color: 'bg-blue-500', icon: Layout },
  [AppMode.GAME]: { label: 'Game Maker', color: 'bg-orange-500', icon: Gamepad2 },
  [AppMode.HARDWARE]: { label: 'Circuit Lab', color: 'bg-emerald-500', icon: Cpu }
};

export const UI_PALETTE = [
    { type: CommandType.ADD_BUTTON, label: 'Button', icon: MousePointer2, color: 'bg-blue-600' },
    { type: CommandType.ADD_TEXT_BLOCK, label: 'Text Block', icon: MessageSquare, color: 'bg-indigo-500' },
    { type: CommandType.ADD_INPUT, label: 'Input Field', icon: TextCursorInput, color: 'bg-teal-500' },
    { type: CommandType.ADD_IMAGE, label: 'Image', icon: Image, color: 'bg-fuchsia-500' },
    { type: CommandType.ADD_SWITCH, label: 'Switch', icon: ToggleRight, color: 'bg-emerald-600' },
    { type: CommandType.ADD_CHECKBOX, label: 'Checkbox', icon: CheckSquare, color: 'bg-emerald-500' },
    { type: CommandType.ADD_SLIDER, label: 'Slider', icon: SlidersHorizontal, color: 'bg-cyan-600' },
    { type: CommandType.ADD_PROGRESS, label: 'Progress Bar', icon: BarChart3, color: 'bg-green-600' },
    { type: CommandType.ADD_LIST_VIEW, label: 'List View', icon: List, color: 'bg-amber-500' },
    { type: CommandType.ADD_DRAWING_CANVAS, label: 'Drawing Canvas', icon: Pencil, color: 'bg-purple-600' },
    { type: CommandType.ADD_MAP, label: 'Map', icon: MapPin, color: 'bg-orange-500' },
    { type: CommandType.ADD_VIDEO, label: 'Video Player', icon: Video, color: 'bg-red-500' },
    { type: CommandType.ADD_CAMERA, label: 'Camera View', icon: Camera, color: 'bg-slate-800' },
    { type: CommandType.ADD_CHART, label: 'Chart', icon: Activity, color: 'bg-purple-500' },
    { type: CommandType.ADD_DATE_PICKER, label: 'Date', icon: Calendar, color: 'bg-blue-400' },
    { type: CommandType.ADD_COLOR_PICKER, label: 'Color Picker', icon: Palette, color: 'bg-pink-500' },
    { type: CommandType.ADD_DIVIDER, label: 'Divider', icon: Minus, color: 'bg-slate-400' },
    { type: CommandType.ADD_SPACER, label: 'Spacer', icon: ArrowUp, color: 'bg-slate-300' },
];

export const LEVEL_PALETTE = [
    { type: 'brick', label: 'Brick', icon: BrickWall, color: 'text-amber-800' },
    { type: 'grass', label: 'Grass', icon: Square, color: 'text-green-500' },
    { type: 'dirt', label: 'Dirt', icon: Square, color: 'text-yellow-800' },
    { type: 'stone', label: 'Stone', icon: Square, color: 'text-stone-500' },
    { type: 'water', label: 'Water', icon: Waves, color: 'text-blue-400' },
    { type: 'lava', label: 'Lava', icon: Flame, color: 'text-orange-600' },
    { type: 'crate', label: 'Crate', icon: Boxes, color: 'text-amber-600' },
    { type: 'ladder', label: 'Ladder', icon: ArrowUp, color: 'text-amber-900' },
    { type: 'spring', label: 'Spring', icon: ArrowUpCircle, color: 'text-pink-500' },
    { type: 'coin', label: 'Coin', icon: Coins, color: 'text-yellow-500' },
    { type: 'key', label: 'Key', icon: KeyIcon, color: 'text-yellow-400' },
    { type: 'door', label: 'Door', icon: DoorOpen, color: 'text-slate-800' },
    { type: 'spike', label: 'Spike', icon: Triangle, color: 'text-red-600' },
    { type: 'flag', label: 'Finish', icon: Flag, color: 'text-green-600' },
    { type: 'eraser', label: 'Eraser', icon: Eraser, color: 'text-slate-400' },
];

export const CHARACTER_PALETTE = [
    { emoji: '🤖', label: 'Robot' },
    { emoji: '👾', label: 'Alien' },
    { emoji: '👦', label: 'Boy' },
    { emoji: '👧', label: 'Girl' },
    { emoji: '👨', label: 'Man' },
    { emoji: '👩', label: 'Woman' },
    { emoji: '👸', label: 'Princess' },
    { emoji: '🤴', label: 'Prince' },
    { emoji: '🥷', label: 'Ninja' },
    { emoji: '🧛', label: 'Vampire' },
    { emoji: '🧟', label: 'Zombie' },
    { emoji: '🧙', label: 'Wizard' },
    { emoji: '🧚', label: 'Fairy' },
    { emoji: '😎', label: 'Cool Hero' },
    { emoji: '🤠', label: 'Cowboy' },
    { emoji: '👮', label: 'Officer' },
    { emoji: '💃', label: 'Dancer' },
    { emoji: '🕺', label: 'Disco' },
    { emoji: '🐱', label: 'Cat' },
    { emoji: '🐶', label: 'Dog' },
    { emoji: '🐯', label: 'Tiger' },
    { emoji: '🦄', label: 'Unicorn' },
    { emoji: '🐲', label: 'Dragon' },
    { emoji: '👻', label: 'Ghost' },
];

export const VEHICLE_PALETTE = [
    { emoji: '🚗', label: 'Car' },
    { emoji: '🏎️', label: 'Racer' },
    { emoji: '🚓', label: 'Police' },
    { emoji: '🚑', label: 'Ambulance' },
    { emoji: '🚌', label: 'Bus' },
    { emoji: '🚛', label: 'Truck' },
    { emoji: '🚜', label: 'Tractor' },
    { emoji: '🚲', label: 'Bike' },
    { emoji: '🏍️', label: 'Motorcycle' },
    { emoji: '🚀', label: 'Rocket' },
    { emoji: '🛸', label: 'UFO' },
    { emoji: '🚁', label: 'Helicopter' },
    { emoji: '✈️', label: 'Plane' },
    { emoji: '⛵', label: 'Boat' },
];

export const AVAILABLE_BLOCKS: Record<AppMode, BlockDefinition[]> = {
  [AppMode.APP]: [
    // --- NAVIGATION ---
    { type: CommandType.CREATE_SCREEN, label: 'New Screen', icon: PanelTop, defaultParams: { text: 'main' }, color: 'bg-slate-800', category: 'Navigation', description: 'Creates a new screen for your app.' },
    { type: CommandType.NAVIGATE, label: 'Navigate To', icon: ArrowRight, defaultParams: { text: 'screen2' }, color: 'bg-blue-600', category: 'Navigation', description: 'Switch to a different screen.' },
    
    // --- UI DESIGN ---
    { type: CommandType.SET_TITLE, label: 'Set Title', icon: Type, defaultParams: { text: 'My App' }, color: 'bg-indigo-500', category: 'Design', description: 'Change the title bar text.' },
    { type: CommandType.SET_BACKGROUND, label: 'Background', icon: PaintBucket, defaultParams: { color: '#ffffff' }, color: 'bg-indigo-400', category: 'Design', description: 'Change the screen background color.' },
    { type: CommandType.ADD_DIVIDER, label: 'Divider', icon: Minus, defaultParams: {}, color: 'bg-slate-400', category: 'Design', description: 'Horizontal line separator.' },
    { type: CommandType.ADD_SPACER, label: 'Spacer', icon: ArrowUp, defaultParams: { value: 20 }, color: 'bg-slate-300', category: 'Design', description: 'Add empty space.' },
    
    // --- WIDGETS ---
    { type: CommandType.ADD_TEXT_BLOCK, label: 'Text', icon: MessageSquare, defaultParams: { text: 'Hello', color: '#000000' }, color: 'bg-slate-500', category: 'Widgets', description: 'Add a block of text to the screen.' },
    { type: CommandType.ADD_BUTTON, label: 'Button', icon: MousePointer2, defaultParams: { text: 'Click Me', message: 'Hello!' }, color: 'bg-blue-500', category: 'Widgets', description: 'A button that shows a message or switches screens.' },
    { type: CommandType.ADD_INPUT, label: 'Input', icon: TextCursorInput, defaultParams: { text: 'Type here...', varName: 'input1' }, color: 'bg-teal-500', category: 'Widgets', description: 'A box where the user can type text.' },
    { type: CommandType.ADD_IMAGE, label: 'Image', icon: Image, defaultParams: { text: 'https://placehold.co/200' }, color: 'bg-pink-500', category: 'Widgets', description: 'Display an image from a URL.' },
    { type: CommandType.ADD_SWITCH, label: 'Switch', icon: ToggleRight, defaultParams: { text: 'Toggle', varName: 'sw1' }, color: 'bg-emerald-600', category: 'Widgets', description: 'An on/off toggle switch.' },
    { type: CommandType.ADD_SLIDER, label: 'Slider', icon: SlidersHorizontal, defaultParams: { text: 'Value', varName: 'sl1' }, color: 'bg-cyan-600', category: 'Widgets', description: 'A slider to select a number.' },
    { type: CommandType.ADD_CHECKBOX, label: 'Checkbox', icon: CheckSquare, defaultParams: { text: 'Check', varName: 'cb1' }, color: 'bg-emerald-500', category: 'Widgets', description: 'A box to check or uncheck.' },
    { type: CommandType.ADD_PROGRESS, label: 'Progress', icon: BarChart3, defaultParams: { text: 'Loading', value: 50 }, color: 'bg-green-600', category: 'Widgets', description: 'Show a progress bar.' },
    { type: CommandType.ADD_LIST_VIEW, label: 'List View', icon: List, defaultParams: { varName: 'items' }, color: 'bg-amber-500', category: 'Widgets', description: 'Display items from a list variable.' },
    { type: CommandType.ADD_DRAWING_CANVAS, label: 'Drawing Pad', icon: Pencil, defaultParams: { }, color: 'bg-purple-600', category: 'Widgets', description: 'Area for drawing with finger.' },
    { type: CommandType.ADD_MAP, label: 'Map View', icon: MapPin, defaultParams: { text: 'New York' }, color: 'bg-orange-500', category: 'Widgets', description: 'Show a map location.' },
    { type: CommandType.ADD_VIDEO, label: 'Video Player', icon: Video, defaultParams: { text: 'video_url' }, color: 'bg-red-500', category: 'Widgets', description: 'Play a video.' },
    { type: CommandType.ADD_CAMERA, label: 'Camera View', icon: Camera, defaultParams: {}, color: 'bg-slate-800', category: 'Widgets', description: 'Display live camera feed.' },
    { type: CommandType.ADD_DATE_PICKER, label: 'Date Picker', icon: Calendar, defaultParams: { varName: 'date1' }, color: 'bg-blue-400', category: 'Widgets', description: 'Pick a date from a calendar.' },
    { type: CommandType.ADD_COLOR_PICKER, label: 'Color Picker', icon: Palette, defaultParams: { varName: 'color1' }, color: 'bg-pink-500', category: 'Widgets', description: 'Pick a color.' },
    { type: CommandType.ADD_CHART, label: 'Chart', icon: Activity, defaultParams: { text: 'Data', varName: 'data1' }, color: 'bg-purple-500', category: 'Widgets', description: 'Show a data chart.' },
    { type: CommandType.ADD_AUDIO_PLAYER, label: 'Audio Player', icon: Music, defaultParams: { }, color: 'bg-rose-500', category: 'Widgets', description: 'Play an audio file.' },
    { type: CommandType.ADD_QR_CODE, label: 'QR Code', icon: Scan, defaultParams: { }, color: 'bg-slate-700', category: 'Widgets', description: 'Display a QR code.' },

    // --- ACTIONS & ALERTS ---
    { type: CommandType.SHOW_ALERT, label: 'Show Alert', icon: AlertTriangle, defaultParams: { text: 'Warning!' }, color: 'bg-red-600', category: 'Actions', description: 'Pop up a message box.' },
    { type: CommandType.SHOW_TOAST, label: 'Show Toast', icon: MessageSquare, defaultParams: { text: 'Saved!' }, color: 'bg-slate-700', category: 'Actions', description: 'Show a small message at the bottom.' },
    { type: CommandType.SPEAK, label: 'Text to Speech', icon: Megaphone, defaultParams: { text: 'Hello' }, color: 'bg-rose-500', category: 'Actions', description: 'Make the device speak text.' },
    { type: CommandType.VIBRATE_DEVICE, label: 'Vibrate', icon: Waves, defaultParams: { value: 0.5 }, color: 'bg-orange-600', category: 'Actions', description: 'Vibrate the device (if supported).' },
    { type: CommandType.OPEN_URL, label: 'Open Website', icon: Link, defaultParams: { text: 'https://google.com' }, color: 'bg-blue-700', category: 'Actions', description: 'Open a website in a new tab.' },
    { type: CommandType.CLEAR_UI, label: 'Clear Screen', icon: Eraser, defaultParams: {}, color: 'bg-red-400', category: 'Actions', description: 'Remove all widgets from the screen.' },
    
    // --- LOGIC & DATA ---
    { type: CommandType.SET_VAR, label: 'Set Variable', icon: Variable, defaultParams: { varName: 'x', value: 0 }, color: 'bg-orange-500', category: 'Data', description: 'Save a value to a variable.' },
    { type: CommandType.CHANGE_VAR, label: 'Change Var', icon: Variable, defaultParams: { varName: 'x', value: 1 }, color: 'bg-orange-600', category: 'Data', description: 'Add or subtract from a variable.' },
    { type: CommandType.CALC_ADD, label: 'Calc: Add', icon: Calculator, defaultParams: { varName: 'sum', value: 1, value2: 2 }, color: 'bg-orange-700', category: 'Math', description: 'Add two numbers and save.' },
    { type: CommandType.CALC_SUB, label: 'Calc: Subtract', icon: Minus, defaultParams: { varName: 'res', value: 10, value2: 5 }, color: 'bg-orange-700', category: 'Math', description: 'Subtract two numbers and save.' },
    { type: CommandType.CALC_RANDOM, label: 'Random #', icon: Hash, defaultParams: { varName: 'rand', value: 1, value2: 10 }, color: 'bg-orange-700', category: 'Math', description: 'Generate a random number.' },
    { type: CommandType.LIST_ADD, label: 'Add to List', icon: List, defaultParams: { varName: 'items', value: 'apple' }, color: 'bg-yellow-600', category: 'Data', description: 'Add an item to a list.' },
    { type: CommandType.IF, label: 'If Condition', icon: GitBranch, defaultParams: { condition: 'true' }, color: 'bg-yellow-500', category: 'Control', description: 'Run blocks only if true.' },
    { type: CommandType.ELSE, label: 'Else', icon: Split, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'Run if condition is false.' },
    { type: CommandType.END_IF, label: 'End If', icon: XCircle, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'End of condition block.' },
    { type: CommandType.REPEAT, label: 'Repeat Loop', icon: Repeat, defaultParams: { value: 3 }, color: 'bg-violet-500', category: 'Control', description: 'Repeat blocks X times.' },
    { type: CommandType.END_REPEAT, label: 'End Loop', icon: XCircle, defaultParams: {}, color: 'bg-violet-500', category: 'Control', description: 'End of loop.' },
    { type: CommandType.WAIT, label: 'Wait', icon: Clock, defaultParams: { value: 1 }, color: 'bg-slate-400', category: 'Control', description: 'Wait for X seconds.' },
    { type: CommandType.COMMENT, label: 'Note', icon: StickyNote, defaultParams: { text: '' }, color: 'bg-yellow-200', category: 'Other', description: 'Add a comment.' },
  ],
  [AppMode.GAME]: [
    // --- CONTROL ---
    { type: CommandType.REPEAT, label: 'Repeat', icon: Repeat, defaultParams: { value: 10 }, color: 'bg-violet-500', category: 'Control', description: 'Repeat actions multiple times.' },
    { type: CommandType.END_REPEAT, label: 'End Repeat', icon: XCircle, defaultParams: {}, color: 'bg-violet-500', category: 'Control', description: 'End of repeat loop.' },
    { type: CommandType.IF, label: 'If', icon: GitBranch, defaultParams: { condition: 'IS_TOUCHING_EDGE' }, color: 'bg-yellow-500', category: 'Control', description: 'Check a condition.' },
    { type: CommandType.ELSE, label: 'Else', icon: Split, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'Run if condition is false.' },
    { type: CommandType.END_IF, label: 'End If', icon: XCircle, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'End of check.' },
    { type: CommandType.WAIT, label: 'Wait', icon: Clock, defaultParams: { value: 0.5 }, color: 'bg-slate-400', category: 'Control', description: 'Pause for a moment.' },

    // --- MOVEMENT ---
    { type: CommandType.MOVE_X, label: 'Move X', icon: ArrowRight, defaultParams: { value: 10 }, color: 'bg-blue-500', category: 'Motion', description: 'Move left or right.' },
    { type: CommandType.MOVE_Y, label: 'Move Y', icon: ArrowUp, defaultParams: { value: 10 }, color: 'bg-blue-500', category: 'Motion', description: 'Move up or down.' },
    { type: CommandType.JUMP, label: 'Jump', icon: ArrowUpCircle, defaultParams: { value: 15 }, color: 'bg-blue-600', category: 'Motion', description: 'Make character jump.' },
    { type: CommandType.SET_GRAVITY, label: 'Set Gravity', icon: ArrowBigUp, defaultParams: { condition: 'true' }, color: 'bg-blue-700', category: 'Motion', description: 'Enable falling physics.' },
    { type: CommandType.BOUNCE_ON_EDGE, label: 'Bounce on Edge', icon: RefreshCw, defaultParams: {}, color: 'bg-blue-400', category: 'Motion', description: 'Bounce off screen edges.' },
    { type: CommandType.POINT_DIR, label: 'Point Direction', icon: Compass, defaultParams: { value: 90 }, color: 'bg-blue-500', category: 'Motion', description: 'Rotate character.' },

    // --- LOOKS & SCENE ---
    { type: CommandType.SAY, label: 'Say', icon: MessageSquare, defaultParams: { text: 'Hello!' }, color: 'bg-purple-500', category: 'Looks', description: 'Show a speech bubble.' },
    { type: CommandType.SET_SCENE, label: 'Set Scene', icon: Image, defaultParams: { text: 'grid' }, color: 'bg-purple-500', category: 'Looks', description: 'Change the background.' },
    { type: CommandType.SET_WEATHER, label: 'Set Weather', icon: CloudRain, defaultParams: { text: 'rain' }, color: 'bg-blue-400', category: 'Looks', description: 'Make it rain or snow.' },
    { type: CommandType.SET_EMOJI, label: 'Set Character', icon: User, defaultParams: { text: '🤖' }, color: 'bg-purple-600', category: 'Looks', description: 'Change your avatar.' },
    { type: CommandType.SET_CAMERA, label: 'Camera Follow', icon: Video, defaultParams: { condition: 'true' }, color: 'bg-slate-600', category: 'Looks', description: 'Make camera follow player.' },
    { type: CommandType.SHAKE_CAMERA, label: 'Shake Camera', icon: Activity, defaultParams: { value: 0.5 }, color: 'bg-orange-500', category: 'Looks', description: 'Shake the screen.' },
    { type: CommandType.SET_SIZE, label: 'Set Size %', icon: ZoomIn, defaultParams: { value: 100 }, color: 'bg-purple-400', category: 'Looks', description: 'Set character size.' },
    { type: CommandType.CHANGE_SIZE, label: 'Change Size', icon: ZoomIn, defaultParams: { value: 10 }, color: 'bg-purple-400', category: 'Looks', description: 'Grow or shrink.' },
    { type: CommandType.SET_OPACITY, label: 'Set Opacity', icon: Eye, defaultParams: { value: 100 }, color: 'bg-purple-400', category: 'Looks', description: 'Set transparency.' },

    // --- ACTIONS ---
    { type: CommandType.SHOOT, label: 'Shoot', icon: Crosshair, defaultParams: { text: '⚡' }, color: 'bg-red-500', category: 'Actions', description: 'Fire a projectile.' },
    { type: CommandType.SPAWN_ENEMY, label: 'Spawn Enemy', icon: Ghost, defaultParams: { text: '👾' }, color: 'bg-red-600', category: 'Actions', description: 'Create a bad guy.' },
    { type: CommandType.SPAWN_ITEM, label: 'Spawn Item', icon: Coins, defaultParams: { text: '💎' }, color: 'bg-yellow-500', category: 'Actions', description: 'Create a collectable.' },
    { type: CommandType.SPAWN_PARTICLES, label: 'Explosion', icon: Sparkles, defaultParams: { value: 10 }, color: 'bg-orange-500', category: 'Actions', description: 'Make cool effects.' },
    { type: CommandType.CREATE_CLONE, label: 'Clone Self', icon: Copy, defaultParams: {}, color: 'bg-orange-400', category: 'Actions', description: 'Make a copy of player.' },

    // --- SOUND ---
    { type: CommandType.PLAY_SOUND, label: 'Play Sound', icon: Volume2, defaultParams: { text: 'coin' }, color: 'bg-pink-500', category: 'Sound', description: 'Play a sound effect.' },

    // --- DATA ---
    { type: CommandType.CHANGE_SCORE, label: 'Change Score', icon: Trophy, defaultParams: { value: 1 }, color: 'bg-yellow-600', category: 'Data', description: 'Add points.' },
    { type: CommandType.SET_VAR, label: 'Set Var', icon: Variable, defaultParams: { varName: 'hp', value: 100 }, color: 'bg-orange-500', category: 'Data', description: 'Set a variable.' },
    { type: CommandType.CHANGE_VAR, label: 'Change Var', icon: Variable, defaultParams: { varName: 'hp', value: -10 }, color: 'bg-orange-600', category: 'Data', description: 'Change a variable.' },
    { type: CommandType.GAME_OVER, label: 'Game Over', icon: XCircle, defaultParams: {}, color: 'bg-slate-800', category: 'Control', description: 'End the game.' },
    { type: CommandType.WIN_GAME, label: 'Win Game', icon: Trophy, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'Win the level!' },
  ],
  [AppMode.HARDWARE]: [
    // --- CONTROL ---
    { type: CommandType.REPEAT, label: 'Repeat', icon: Repeat, defaultParams: { value: 5 }, color: 'bg-violet-500', category: 'Control', description: 'Repeat actions.' },
    { type: CommandType.END_REPEAT, label: 'End Repeat', icon: XCircle, defaultParams: {}, color: 'bg-violet-500', category: 'Control', description: 'End loop.' },
    { type: CommandType.IF, label: 'If', icon: GitBranch, defaultParams: { condition: 'IS_PRESSED' }, color: 'bg-yellow-500', category: 'Control', description: 'Check sensor.' },
    { type: CommandType.ELSE, label: 'Else', icon: Split, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'Run if false.' },
    { type: CommandType.END_IF, label: 'End If', icon: XCircle, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'End check.' },
    { type: CommandType.WAIT, label: 'Wait (sec)', icon: Clock, defaultParams: { value: 1 }, color: 'bg-slate-400', category: 'Control', description: 'Delay.' },
    { type: CommandType.WAIT_FOR_PRESS, label: 'Wait for Press', icon: Hand, defaultParams: { pin: 4 }, color: 'bg-orange-400', category: 'Control', description: 'Pause until button press.' },

    // --- OUTPUT ---
    { type: CommandType.LED_ON, label: 'LED On', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-blue-500', category: 'Output', description: 'Turn light on.' },
    { type: CommandType.LED_OFF, label: 'LED Off', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-blue-500', category: 'Output', description: 'Turn light off.' },
    { type: CommandType.SET_RGB, label: 'Set RGB Color', icon: Palette, defaultParams: { color: '#ff0000' }, color: 'bg-fuchsia-500', category: 'Output', description: 'Change RGB LED color.' },
    { type: CommandType.SET_FAN, label: 'Set Fan Speed', icon: Fan, defaultParams: { speed: 50 }, color: 'bg-cyan-500', category: 'Output', description: 'Spin the motor.' },
    { type: CommandType.SET_SERVO, label: 'Servo Angle', icon: Move, defaultParams: { angle: 90 }, color: 'bg-orange-500', category: 'Output', description: 'Rotate servo arm.' },
    { type: CommandType.PLAY_TONE, label: 'Play Tone', icon: Music, defaultParams: { duration: 0.5 }, color: 'bg-pink-500', category: 'Sound', description: 'Beep the buzzer.' },
    { type: CommandType.PLAY_SOUND, label: 'Play Effect', icon: Volume2, defaultParams: { text: 'siren' }, color: 'bg-pink-600', category: 'Sound', description: 'Play sound effect.' },
    { type: CommandType.SET_LCD, label: 'LCD Print', icon: Type, defaultParams: { text: 'Hello', row: 0, col: 0 }, color: 'bg-lime-600', category: 'Display', description: 'Show text on screen.' },
    { type: CommandType.CLEAR_LCD, label: 'Clear LCD', icon: Eraser, defaultParams: {}, color: 'bg-lime-700', category: 'Display', description: 'Wipe screen.' },
    { type: CommandType.SET_SEGMENT, label: 'Show Number', icon: Binary, defaultParams: { value: 0 }, color: 'bg-red-600', category: 'Display', description: 'Display digit.' },

    // --- INPUT ---
    { type: CommandType.READ_DIGITAL, label: 'Read Digital', icon: ToggleLeft, defaultParams: { pin: 4, varName: 'btnState' }, color: 'bg-indigo-500', category: 'Input', description: 'Read Button/Switch.' },
    { type: CommandType.READ_ANALOG, label: 'Read Analog', icon: Gauge, defaultParams: { pin: 97, varName: 'val' }, color: 'bg-indigo-500', category: 'Input', description: 'Read Sensor value.' },
    
    // --- DATA ---
    { type: CommandType.LOG_DATA, label: 'Log Data', icon: Terminal, defaultParams: { text: 'Value' }, color: 'bg-slate-600', category: 'Data', description: 'Print to console.' },
    { type: CommandType.SET_VAR, label: 'Set Var', icon: Variable, defaultParams: { varName: 'x', value: 0 }, color: 'bg-orange-500', category: 'Data', description: 'Save a value.' },
    { type: CommandType.CALC_ADD, label: 'Calculate', icon: Calculator, defaultParams: { varName: 'res', value: 1, value2: 1 }, color: 'bg-orange-700', category: 'Math', description: 'Do math.' },
  ]
};

export const CIRCUIT_PALETTE = [
  // --- OUTPUTS ---
  { type: 'LED_RED', label: 'Red LED', icon: Lightbulb, color: 'text-red-500', category: 'Outputs', defaultPin: 0, description: 'Lights up red.' },
  { type: 'LED_BLUE', label: 'Blue LED', icon: Lightbulb, color: 'text-blue-500', category: 'Outputs', defaultPin: 1, description: 'Lights up blue.' },
  { type: 'LED_GREEN', label: 'Green LED', icon: Lightbulb, color: 'text-green-500', category: 'Outputs', defaultPin: 2, description: 'Lights up green.' },
  { type: 'RGB_LED', label: 'RGB LED', icon: Palette, color: 'text-purple-500', category: 'Outputs', defaultPin: 10, description: 'Changes colors.' },
  { type: 'FAN', label: 'Fan Motor', icon: Fan, color: 'text-cyan-500', category: 'Outputs', defaultPin: 9, description: 'Spins when ON.' },
  { type: 'SERVO', label: 'Servo', icon: Move, color: 'text-orange-500', category: 'Outputs', defaultPin: 11, description: 'Rotates to 180°.' },
  { type: 'SPEAKER', label: 'Speaker', icon: Volume2, color: 'text-slate-600', category: 'Outputs', defaultPin: 8, description: 'Plays tones.' },
  { type: 'MOTOR_DC', label: 'DC Motor', icon: Settings, color: 'text-yellow-600', category: 'Outputs', defaultPin: 6, description: 'Basic motor.' },
  
  // --- INPUTS ---
  { type: 'BUTTON', label: 'Button', icon: MousePointer2, color: 'text-red-600', category: 'Inputs', defaultPin: 4, description: 'Push to activate.' },
  { type: 'SWITCH_SLIDE', label: 'Switch', icon: ToggleLeft, color: 'text-slate-500', category: 'Inputs', defaultPin: 7, description: 'On/Off toggle.' },
  { type: 'POTENTIOMETER', label: 'Knob', icon: RotateCcw, color: 'text-orange-600', category: 'Inputs', defaultPin: 97, description: 'Adjustable dial.' },
  { type: 'JOYSTICK', label: 'Joystick', icon: Gamepad, color: 'text-slate-700', category: 'Inputs', defaultPin: 13, description: 'X/Y control.' },
  { type: 'KEYPAD', label: 'Keypad', icon: Grid, color: 'text-slate-800', category: 'Inputs', defaultPin: 12, description: 'Number pad.' },

  // --- SENSORS ---
  { type: 'LIGHT_SENSOR', label: 'Light Sensor', icon: Sun, color: 'text-yellow-500', category: 'Sensors', defaultPin: 5, description: 'Detects brightness.' },
  { type: 'TEMP_SENSOR', label: 'Temp Sensor', icon: Thermometer, color: 'text-red-500', category: 'Sensors', defaultPin: 99, description: 'Reads temperature.' },
  { type: 'ULTRASONIC', label: 'Distance', icon: Wifi, color: 'text-blue-500', category: 'Sensors', defaultPin: 92, description: 'Measures distance.' },
  { type: 'MOTION', label: 'Motion PIR', icon: Activity, color: 'text-emerald-500', category: 'Sensors', defaultPin: 3, description: 'Detects movement.' },
  
  // --- DISPLAYS ---
  { type: 'LCD', label: 'LCD Screen', icon: Type, color: 'text-green-700', category: 'Displays', defaultPin: 95, description: 'Displays text.' },
  { type: 'SEVEN_SEGMENT', label: 'Number Display', icon: Binary, color: 'text-red-600', category: 'Displays', defaultPin: 96, description: 'Shows numbers.' },
  
  // --- POWER / OTHER ---
  { type: 'BATTERY_9V', label: '9V Battery', icon: Battery, color: 'text-orange-500', category: 'Power', defaultPin: 90, description: 'Power source.' },
  { type: 'SOLAR', label: 'Solar Panel', icon: Sun, color: 'text-blue-600', category: 'Power', defaultPin: 91, description: 'Sun power.' },
  { type: 'BREADBOARD', label: 'Breadboard', icon: Layout, color: 'text-slate-400', category: 'Misc', defaultPin: 98, description: 'Prototyping base.' },
];

export const AVAILABLE_MISSIONS: Mission[] = [
  // --- APP MISSIONS ---
  {
    id: 'app-1', mode: AppMode.APP, title: 'Hello World', description: 'Create your first app with a title and a button.', completed: false,
    steps: [
      { id: 's1', text: 'Set the App Title to "My First App"', isCompleted: false, criteria: { requiredBlock: CommandType.SET_TITLE } },
      { id: 's2', text: 'Add a "Hello" Button', isCompleted: false, criteria: { requiredBlock: CommandType.ADD_BUTTON } },
      { id: 's3', text: 'Make the button show an alert', isCompleted: false, criteria: { requiredBlock: CommandType.SHOW_ALERT } }
    ]
  },
  {
    id: 'app-2', mode: AppMode.APP, title: 'Input Magic', description: 'Create a form that speaks what you type.', completed: false,
    steps: [
      { id: 's1', text: 'Add an Input Field', isCompleted: false, criteria: { requiredBlock: CommandType.ADD_INPUT } },
      { id: 's2', text: 'Add a Button labeled "Speak"', isCompleted: false, criteria: { requiredBlock: CommandType.ADD_BUTTON } },
      { id: 's3', text: 'Use "Text to Speech" block', isCompleted: false, criteria: { requiredBlock: CommandType.SPEAK } }
    ]
  },

  // --- GAME MISSIONS ---
  {
    id: 'game-1', mode: AppMode.GAME, title: 'Moving Hero', description: 'Make your character move with arrow keys.', completed: false,
    steps: [
      { id: 's1', text: 'Add a "Forever" Loop', isCompleted: false, criteria: { requiredBlock: CommandType.FOREVER } },
      { id: 's2', text: 'Add "If Key Pressed" block', isCompleted: false, criteria: { requiredBlock: CommandType.IF } },
      { id: 's3', text: 'Use "Move X" to walk', isCompleted: false, criteria: { requiredBlock: CommandType.MOVE_X } }
    ]
  },
  {
    id: 'game-2', mode: AppMode.GAME, title: 'Coin Collector', description: 'Create a game where you collect coins for points.', completed: false,
    steps: [
      { id: 's1', text: 'Spawn a Coin Item', isCompleted: false, criteria: { requiredBlock: CommandType.SPAWN_ITEM } },
      { id: 's2', text: 'Check if touching Item', isCompleted: false, criteria: { requiredBlock: CommandType.IF } },
      { id: 's3', text: 'Change Score by 1', isCompleted: false, criteria: { requiredBlock: CommandType.CHANGE_SCORE } }
    ]
  },

  // --- HARDWARE MISSIONS ---
  {
    id: 'hw-1', mode: AppMode.HARDWARE, title: 'Blinky Light', description: 'Make an LED blink on and off.', completed: false,
    steps: [
      { id: 's1', text: 'Turn LED On (Pin 0)', isCompleted: false, criteria: { requiredBlock: CommandType.LED_ON } },
      { id: 's2', text: 'Wait for 1 second', isCompleted: false, criteria: { requiredBlock: CommandType.WAIT } },
      { id: 's3', text: 'Turn LED Off', isCompleted: false, criteria: { requiredBlock: CommandType.LED_OFF } },
      { id: 's4', text: 'Put it inside a Loop', isCompleted: false, criteria: { requiredBlock: CommandType.REPEAT } }
    ]
  },
  {
    id: 'hw-2', mode: AppMode.HARDWARE, title: 'Security Alarm', description: 'Sound the alarm when motion is detected!', completed: false,
    steps: [
      { id: 's1', text: 'Add a Motion Sensor', isCompleted: false },
      { id: 's2', text: 'Check "If Motion Detected"', isCompleted: false, criteria: { requiredBlock: CommandType.IF } },
      { id: 's3', text: 'Play a Siren Sound', isCompleted: false, criteria: { requiredBlock: CommandType.PLAY_SOUND } }
    ]
  }
];
