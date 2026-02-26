import { AppMode, BlockDefinition, CommandType } from '../types';
import {
    PanelTop, ArrowRight, Type, PaintBucket, Minus, ArrowUp, MessageSquare, MousePointer2, TextCursorInput, Image, ToggleRight, SlidersHorizontal, CheckSquare, BarChart3, List, Pencil, MapPin, Video, Camera, Calendar, Palette, Box, AlertTriangle, Megaphone, Waves, Link, Eraser, Cloud, Download, Variable, Calculator, Hash, GitBranch, Split, XCircle, Repeat, Clock, StickyNote, ArrowUpCircle, ArrowBigUp, RefreshCw, Compass, Activity, Film, Crosshair, Ghost, Coins, Sparkles, Copy, Trash, Play, Square, Music, Wind, Sun, Moon, Timer, Heart, RotateCcw, RotateCw, Anchor, Trophy, Lightbulb, Fan, Settings, Zap, Volume2, Maximize, Terminal, Wifi, Globe, Scan, User, ZoomIn, Eye, Layers, Flag, Hand, CloudRain, Save, Move, Grid, ToggleLeft, Gauge, Thermometer, Droplets, Flame, Target, Magnet
} from 'lucide-react';

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
        { type: CommandType.ADD_DRAWING_CANVAS, label: 'Drawing Pad', icon: Pencil, defaultParams: {}, color: 'bg-purple-600', category: 'Widgets', description: 'Area for drawing with finger.' },
        { type: CommandType.ADD_MAP, label: 'Map View', icon: MapPin, defaultParams: { text: 'New York' }, color: 'bg-orange-500', category: 'Widgets', description: 'Show a map location.' },
        { type: CommandType.ADD_VIDEO, label: 'Video Player', icon: Video, defaultParams: { text: 'video_url' }, color: 'bg-red-500', category: 'Widgets', description: 'Play a video.' },
        { type: CommandType.ADD_CAMERA, label: 'Camera View', icon: Camera, defaultParams: {}, color: 'bg-slate-800', category: 'Widgets', description: 'Display live camera feed.' },
        { type: CommandType.ADD_DATE_PICKER, label: 'Date Picker', icon: Calendar, defaultParams: { varName: 'date1' }, color: 'bg-blue-400', category: 'Widgets', description: 'Pick a date from a calendar.' },
        { type: CommandType.ADD_COLOR_PICKER, label: 'Color Picker', icon: Palette, defaultParams: { varName: 'color1' }, color: 'bg-pink-500', category: 'Widgets', description: 'Pick a color.' },
        { type: CommandType.DEFINE_PLUGIN, label: 'Define Widget', icon: Box, defaultParams: { text: 'MyWidget' }, color: 'bg-violet-700', category: 'Plugins', description: 'Save current screen as a reusable widget.' },
        { type: CommandType.USE_PLUGIN, label: 'Use Widget', icon: Box, defaultParams: { text: 'MyWidget' }, color: 'bg-violet-600', category: 'Plugins', description: 'Add a custom widget to screen.' },
        { type: CommandType.ADD_NEWS_FEED, label: 'News Feed', icon: Globe, defaultParams: { text: 'Latest Updates' }, color: 'bg-sky-500', category: 'Social', description: 'Display a list of posts.' },
        { type: CommandType.ADD_CHAT_MESSAGE, label: 'Chat Bubble', icon: MessageSquare, defaultParams: { text: 'Hi!', message: 'left' }, color: 'bg-indigo-400', category: 'Social', description: 'Add a chat message bubble.' },
        { type: CommandType.ADD_CHART, label: 'Chart', icon: Activity, defaultParams: { text: 'Data', varName: 'data1' }, color: 'bg-purple-500', category: 'Widgets', description: 'Show a data chart.' },
        { type: CommandType.ADD_AUDIO_PLAYER, label: 'Audio Player', icon: Music, defaultParams: {}, color: 'bg-rose-500', category: 'Widgets', description: 'Play an audio file.' },
        { type: CommandType.ADD_QR_CODE, label: 'QR Code', icon: Scan, defaultParams: {}, color: 'bg-slate-700', category: 'Widgets', description: 'Display a QR code.' },

        // --- ACTIONS & ALERTS ---
        { type: CommandType.SHOW_ALERT, label: 'Show Alert', icon: AlertTriangle, defaultParams: { text: 'Warning!' }, color: 'bg-red-600', category: 'Actions', description: 'Pop up a message box.' },
        { type: CommandType.SHOW_TOAST, label: 'Show Toast', icon: MessageSquare, defaultParams: { text: 'Saved!' }, color: 'bg-slate-700', category: 'Actions', description: 'Show a small message at the bottom.' },
        { type: CommandType.SPEAK, label: 'Text to Speech', icon: Megaphone, defaultParams: { text: 'Hello' }, color: 'bg-rose-500', category: 'Actions', description: 'Make the device speak text.' },
        { type: CommandType.VIBRATE_DEVICE, label: 'Vibrate', icon: Waves, defaultParams: { value: 0.5 }, color: 'bg-orange-600', category: 'Actions', description: 'Vibrate the device (if supported).' },
        { type: CommandType.OPEN_URL, label: 'Open Website', icon: Link, defaultParams: { text: 'https://google.com' }, color: 'bg-blue-700', category: 'Actions', description: 'Open a website in a new tab.' },
        { type: CommandType.CLEAR_UI, label: 'Clear Screen', icon: Eraser, defaultParams: {}, color: 'bg-red-400', category: 'Actions', description: 'Remove all widgets from the screen.' },
        { type: CommandType.CLOUD_SAVE, label: 'Cloud Save', icon: Cloud, defaultParams: {}, color: 'bg-blue-500', category: 'Actions', description: 'Save variables to the cloud.' },
        { type: CommandType.CLOUD_LOAD, label: 'Cloud Load', icon: Download, defaultParams: {}, color: 'bg-blue-400', category: 'Actions', description: 'Load variables from the cloud.' },

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

        { type: CommandType.SET_BOUNCINESS, label: 'Set Bounciness', icon: Activity, defaultParams: { value: 0.8 }, color: 'bg-blue-400', category: 'Physics', description: 'Make object bouncy.' },

        // --- PHYSICS 2.0 ---
        { type: CommandType.SET_PHYSICS_TYPE, label: 'Physics Body', icon: Box, defaultParams: { text: 'dynamic' }, color: 'bg-cyan-600', category: 'Physics', description: 'Static, Dynamic, or Bouncy.' },
        { type: CommandType.CREATE_JOINT, label: 'Connect Joint', icon: Link, defaultParams: { text: 'wheel' }, color: 'bg-cyan-700', category: 'Physics', description: 'Connect two objects.' },
        { type: CommandType.APPLY_FORCE, label: 'Push Force', icon: ArrowBigUp, defaultParams: { x: 10, y: -10 }, color: 'bg-cyan-500', category: 'Physics', description: 'Apply physics force.' },

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
        { type: CommandType.PLAY_ANIMATION, label: 'Play Animation', icon: Film, defaultParams: { text: 'walk' }, color: 'bg-purple-600', category: 'Looks', description: 'Play a named animation.' },

        // --- ACTIONS ---
        { type: CommandType.SHOOT, label: 'Shoot', icon: Crosshair, defaultParams: { text: '⚡' }, color: 'bg-red-500', category: 'Actions', description: 'Fire a projectile.' },
        { type: CommandType.SPAWN_ENEMY, label: 'Spawn Enemy', icon: Ghost, defaultParams: { text: '👾' }, color: 'bg-red-600', category: 'Actions', description: 'Create a bad guy.' },
        { type: CommandType.SPAWN_ITEM, label: 'Spawn Item', icon: Coins, defaultParams: { text: '💎' }, color: 'bg-yellow-500', category: 'Actions', description: 'Create a collectable.' },
        { type: CommandType.SPAWN_PARTICLES, label: 'Explosion', icon: Sparkles, defaultParams: { value: 10 }, color: 'bg-orange-500', category: 'Actions', description: 'Make cool effects.' },
        { type: CommandType.NPC_TALK, label: 'NPC Chat', icon: MessageSquare, defaultParams: { text: 'Guard', message: 'Stop right there!' }, color: 'bg-indigo-600', category: 'Actions', description: 'Open an AI dialogue box.' },
        { type: CommandType.CREATE_CLONE, label: 'Clone Self', icon: Copy, defaultParams: {}, color: 'bg-orange-400', category: 'Actions', description: 'Make a copy of player.' },
        { type: CommandType.CLOUD_SAVE, label: 'Save Progress', icon: Cloud, defaultParams: {}, color: 'bg-indigo-500', category: 'Data', description: 'Save score and health to cloud.' },
        { type: CommandType.CLOUD_LOAD, label: 'Load Progress', icon: Download, defaultParams: {}, color: 'bg-indigo-400', category: 'Data', description: 'Load saved stats.' },

        // --- SOUND ---
        { type: CommandType.PLAY_SOUND, label: 'Play Sound', icon: Volume2, defaultParams: { text: 'coin' }, color: 'bg-pink-500', category: 'Sound', description: 'Play a sound effect.' },

        // === ENHANCED GAME FEATURES ===
        // Dialogue System
        { type: CommandType.CREATE_DIALOGUE, label: 'Start Dialogue', icon: MessageSquare, defaultParams: { text: 'Elder', message: 'Welcome, hero!' }, color: 'bg-indigo-600', category: 'Dialogue', description: 'Open dialogue with choices.' },
        { type: CommandType.END_DIALOGUE, label: 'End Dialogue', icon: XCircle, defaultParams: {}, color: 'bg-indigo-500', category: 'Dialogue', description: 'Close dialogue box.' },

        // Inventory
        { type: CommandType.ADD_TO_INVENTORY, label: 'Add to Inventory', icon: Box, defaultParams: { text: 'Health Potion', value: 1 }, color: 'bg-amber-600', category: 'Inventory', description: 'Add item to inventory.' },
        { type: CommandType.REMOVE_FROM_INVENTORY, label: 'Remove from Inventory', icon: Trash, defaultParams: { text: 'Health Potion' }, color: 'bg-amber-700', category: 'Inventory', description: 'Remove item from inventory.' },
        { type: CommandType.USE_ITEM, label: 'Use Item', icon: Play, defaultParams: { text: 'Health Potion' }, color: 'bg-green-600', category: 'Inventory', description: 'Use an item.' },
        { type: CommandType.SHOW_INVENTORY, label: 'Show Inventory', icon: Box, defaultParams: {}, color: 'bg-amber-500', category: 'Inventory', description: 'Open inventory UI.' },
        { type: CommandType.CRAFT_ITEM, label: 'Craft Item', icon: Sparkles, defaultParams: { text: 'Sword', value: 2 }, color: 'bg-orange-600', category: 'Inventory', description: 'Craft item from materials.' },

        // Music & Audio
        { type: CommandType.SET_BACKGROUND_MUSIC, label: 'Set BGM', icon: Music, defaultParams: { text: 'adventure.mp3' }, color: 'bg-purple-600', category: 'Audio', description: 'Set background music.' },
        { type: CommandType.PLAY_MUSIC, label: 'Play Music', icon: Play, defaultParams: { text: 'battle.mp3' }, color: 'bg-purple-500', category: 'Audio', description: 'Play music track.' },
        { type: CommandType.STOP_MUSIC, label: 'Stop Music', icon: Square, defaultParams: {}, color: 'bg-purple-700', category: 'Audio', description: 'Stop music.' },
        { type: CommandType.SET_MUSIC_VOLUME, label: 'Music Volume', icon: SlidersHorizontal, defaultParams: { value: 50 }, color: 'bg-purple-400', category: 'Audio', description: 'Set music volume.' },
        { type: CommandType.PLAY_AMBIENT, label: 'Play Ambient', icon: Wind, defaultParams: { text: 'forest' }, color: 'bg-cyan-600', category: 'Audio', description: 'Play ambient sound.' },

        // Cutscenes
        { type: CommandType.TRIGGER_CUTSCENE, label: 'Trigger Cutscene', icon: Video, defaultParams: { text: 'intro' }, color: 'bg-slate-700', category: 'Cutscene', description: 'Start cutscene.' },
        { type: CommandType.FADE_IN, label: 'Fade In', icon: Sun, defaultParams: { value: 1 }, color: 'bg-slate-600', category: 'Cutscene', description: 'Fade screen in.' },
        { type: CommandType.FADE_OUT, label: 'Fade Out', icon: Moon, defaultParams: { value: 1 }, color: 'bg-slate-600', category: 'Cutscene', description: 'Fade screen out.' },
        { type: CommandType.SHAKE_SCREEN, label: 'Shake Screen', icon: Activity, defaultParams: { value: 0.5 }, color: 'bg-red-600', category: 'Cutscene', description: 'Shake the screen.' },
        { type: CommandType.SLOW_MOTION, label: 'Slow Motion', icon: Timer, defaultParams: { value: 0.5 }, color: 'bg-blue-600', category: 'Cutscene', description: 'Slow down time.' },

        // Boss Battles
        { type: CommandType.SPAWN_BOSS, label: 'Spawn Boss', icon: Ghost, defaultParams: { text: 'Dragon', value: 100 }, color: 'bg-red-700', category: 'Boss', description: 'Spawn boss enemy.' },
        { type: CommandType.SET_BOSS_HEALTH, label: 'Set Boss HP', icon: Heart, defaultParams: { value: 100 }, color: 'bg-red-600', category: 'Boss', description: 'Set boss health.' },
        { type: CommandType.BOSS_ATTACK, label: 'Boss Attack', icon: Crosshair, defaultParams: { text: 'fireball' }, color: 'bg-orange-700', category: 'Boss', description: 'Boss performs attack.' },
        { type: CommandType.BOSS_PHASE, label: 'Boss Phase', icon: Layers, defaultParams: { value: 2 }, color: 'bg-purple-700', category: 'Boss', description: 'Change boss phase.' },

        // Advanced Movement
        { type: CommandType.DASH, label: 'Dash', icon: Zap, defaultParams: { value: 10 }, color: 'bg-cyan-600', category: 'Motion', description: 'Quick dash movement.' },
        { type: CommandType.DOUBLE_JUMP, label: 'Enable Double Jump', icon: ArrowUpCircle, defaultParams: { condition: 'true' }, color: 'bg-blue-500', category: 'Motion', description: 'Enable double jump.' },
        { type: CommandType.WALL_JUMP, label: 'Enable Wall Jump', icon: ArrowUp, defaultParams: { condition: 'true' }, color: 'bg-blue-500', category: 'Motion', description: 'Enable wall jumping.' },
        { type: CommandType.GRAPPLE, label: 'Grapple', icon: Anchor, defaultParams: { value: 100 }, color: 'bg-amber-600', category: 'Motion', description: 'Grapple to position.' },

        // Checkpoints
        { type: CommandType.CREATE_CHECKPOINT, label: 'Create Checkpoint', icon: Flag, defaultParams: { text: 'Save Point' }, color: 'bg-green-600', category: 'Progress', description: 'Create save point.' },
        { type: CommandType.LOAD_CHECKPOINT, label: 'Load Checkpoint', icon: RotateCcw, defaultParams: {}, color: 'bg-green-500', category: 'Progress', description: 'Load last checkpoint.' },
        { type: CommandType.AUTO_SAVE, label: 'Auto Save', icon: Save, defaultParams: {}, color: 'bg-blue-600', category: 'Progress', description: 'Auto-save progress.' },

        // --- DATA ---
        { type: CommandType.CHANGE_SCORE, label: 'Change Score', icon: Trophy, defaultParams: { value: 1 }, color: 'bg-yellow-600', category: 'Data', description: 'Add points.' },
        { type: CommandType.SET_VAR, label: 'Set Var', icon: Variable, defaultParams: { varName: 'hp', value: 100 }, color: 'bg-orange-500', category: 'Data', description: 'Set a variable.' },
        { type: CommandType.CHANGE_VAR, label: 'Change Var', icon: Variable, defaultParams: { varName: 'hp', value: -10 }, color: 'bg-orange-600', category: 'Data', description: 'Change a variable.' },
        { type: CommandType.GAME_OVER, label: 'Game Over', icon: XCircle, defaultParams: {}, color: 'bg-slate-800', category: 'Control', description: 'End the game.' },
        { type: CommandType.WIN_GAME, label: 'Win Game', icon: Trophy, defaultParams: {}, color: 'bg-yellow-500', category: 'Control', description: 'Win the level!' },

        // --- EVENTS ---
        { type: CommandType.BROADCAST, label: 'Broadcast', icon: Megaphone, defaultParams: { text: 'message1' }, color: 'bg-amber-500', category: 'Events', description: 'Send a message to other objects.' },
        { type: CommandType.WHEN_I_RECEIVE, label: 'When I Receive', icon: MessageSquare, defaultParams: { text: 'message1' }, color: 'bg-amber-600', category: 'Events', description: 'Run blocks when message is received.' },
        { type: CommandType.ON_CLICK, label: 'When Clicked', icon: MousePointer2, defaultParams: {}, color: 'bg-amber-600', category: 'Events', description: 'Run blocks when clicked.' },
        { type: CommandType.ON_COLLIDE, label: 'When I Collide', icon: Zap, defaultParams: { text: 'any' }, color: 'bg-amber-600', category: 'Events', description: 'Run blocks on collision.' },
        { type: CommandType.END_EVENT, label: 'End Event', icon: XCircle, defaultParams: {}, color: 'bg-amber-700', category: 'Events', description: 'Mark end of event blocks.' },

        // --- 3D ---
        { type: CommandType.SET_VIEW_3D, label: '3D Mode', icon: Box, defaultParams: { condition: 'true' }, color: 'bg-cyan-600', category: '3D', description: 'Toggle 3D View.' },
        { type: CommandType.MOVE_Z, label: 'Move Z', icon: ArrowUpCircle, defaultParams: { value: 10 }, color: 'bg-cyan-500', category: '3D', description: 'Move forward/backward in 3D.' },
        { type: CommandType.ROTATE_Y, label: 'Turn 3D', icon: RotateCw, defaultParams: { value: 15 }, color: 'bg-cyan-500', category: '3D', description: 'Rotate character in 3D.' },
        { type: CommandType.GENERATE_ENVIRONMENT, label: 'AI World', icon: Sparkles, defaultParams: { text: 'Snowy Mountains' }, color: 'bg-gradient-to-r from-cyan-500 to-blue-500', category: '3D', description: 'AI Generate a 3D environment.' },
        { type: CommandType.SPAWN_3D_MODEL, label: 'Spawn 3D Model', icon: Box, defaultParams: { text: 'Robot', x: 0, y: 0, z: 0 }, color: 'bg-cyan-600', category: '3D', description: 'Create a 3D model.' },
        { type: CommandType.SET_3D_POSITION, label: 'Position 3D', icon: Move, defaultParams: { x: 0, y: 0, z: 0 }, color: 'bg-cyan-500', category: '3D', description: 'Move object in 3D.' },
        { type: CommandType.ROTATE_3D_MODEL, label: 'Rotate 3D', icon: RotateCw, defaultParams: { x: 0, y: 0, z: 0 }, color: 'bg-cyan-500', category: '3D', description: 'Rotate object in 3D.' },
        { type: CommandType.SCALE_3D_MODEL, label: 'Scale 3D', icon: Maximize, defaultParams: { value: 1 }, color: 'bg-cyan-500', category: '3D', description: 'Resize object in 3D.' },
        { type: CommandType.PLAY_3D_ANIMATION, label: '3D Action', icon: Play, defaultParams: { text: 'idle' }, color: 'bg-cyan-500', category: '3D', description: 'Play 3D animation.' },
        { type: CommandType.SET_3D_CAMERA, label: '3D Camera', icon: Camera, defaultParams: { text: 'third_person' }, color: 'bg-slate-700', category: '3D', description: 'Move 3D camera.' },
        { type: CommandType.SET_3D_LIGHTING, label: '3D Lighting', icon: Sun, defaultParams: { color: '#ffffff', intensity: 1 }, color: 'bg-amber-500', category: '3D', description: 'Set 3D world lights.' },
        { type: CommandType.ENABLE_PHYSICS_3D, label: '3D Physics', icon: Zap, defaultParams: { condition: 'true' }, color: 'bg-orange-600', category: '3D', description: 'Turn on 3D gravity.' },
    ],
    [AppMode.HARDWARE]: [

        // --- OUTPUT ---
        { type: CommandType.LED_ON, label: 'LED On', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-blue-500', category: 'Output', description: 'Turn light on.' },
        { type: CommandType.LED_OFF, label: 'LED Off', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-blue-500', category: 'Output', description: 'Turn light off.' },
        { type: CommandType.LED_TOGGLE, label: 'LED Toggle', icon: Lightbulb, defaultParams: { pin: 0 }, color: 'bg-blue-400', category: 'Output', description: 'Flip LED state.' },
        { type: CommandType.SET_RGB, label: 'Set RGB Color', icon: Palette, defaultParams: { color: '#ff0000' }, color: 'bg-fuchsia-500', category: 'Output', description: 'Change RGB LED color.' },
        { type: CommandType.SET_RGB_BRIGHTNESS, label: 'RGB Brightness', icon: Palette, defaultParams: { value: 100 }, color: 'bg-fuchsia-600', category: 'Output', description: 'Set RGB brightness.' },
        { type: CommandType.SET_FAN, label: 'Set Fan Speed', icon: Fan, defaultParams: { speed: 50 }, color: 'bg-cyan-500', category: 'Output', description: 'Spin the motor.' },
        { type: CommandType.SET_SERVO, label: 'Servo Angle', icon: Move, defaultParams: { angle: 90 }, color: 'bg-orange-500', category: 'Output', description: 'Rotate servo arm.' },
        { type: CommandType.SET_MOTOR_SPEED, label: 'Motor Speed', icon: Settings, defaultParams: { speed: 50 }, color: 'bg-yellow-600', category: 'Output', description: 'Set DC motor speed.' },
        { type: CommandType.SET_MOTOR_DIR, label: 'Motor Direction', icon: ArrowUp, defaultParams: { direction: 'cw' }, color: 'bg-yellow-700', category: 'Output', description: 'Set motor direction.' },
        { type: CommandType.SET_STEPPER, label: 'Stepper Steps', icon: Settings, defaultParams: { steps: 100 }, color: 'bg-emerald-600', category: 'Output', description: 'Set stepper position.' },
        { type: CommandType.SET_RELAY, label: 'Relay Switch', icon: Zap, defaultParams: { state: true }, color: 'bg-violet-600', category: 'Output', description: 'Control relay.' },
        { type: CommandType.SET_SOLENOID, label: 'Solenoid', icon: Zap, defaultParams: { state: true }, color: 'bg-rose-600', category: 'Output', description: 'Control solenoid.' },
        { type: CommandType.SET_LASER, label: 'Laser', icon: Zap, defaultParams: { state: true }, color: 'bg-red-600', category: 'Output', description: 'Control laser.' },
        { type: CommandType.SET_VIBRATION, label: 'Vibrate', icon: Waves, defaultParams: { duration: 0.5 }, color: 'bg-indigo-500', category: 'Output', description: 'Vibrate motor.' },
        { type: CommandType.SET_OLED_TEXT, label: 'OLED Text', icon: Type, defaultParams: { text: 'Hello', row: 0, col: 0 }, color: 'bg-cyan-700', category: 'Display', description: 'Write to OLED.' },
        { type: CommandType.DRAW_OLED_SHAPE, label: 'Draw Shape', icon: PaintBucket, defaultParams: { shape: 'rect', x: 10, y: 10, width: 20, height: 20 }, color: 'bg-cyan-600', category: 'Display', description: 'Draw on OLED.' },
        { type: CommandType.SET_MATRIX_ROW, label: 'Matrix Row', icon: Grid, defaultParams: { row: 0, pattern: '10101010' }, color: 'bg-red-500', category: 'Display', description: 'Set matrix row.' },
        { type: CommandType.CLEAR_MATRIX, label: 'Clear Matrix', icon: Eraser, defaultParams: {}, color: 'bg-red-700', category: 'Display', description: 'Clear matrix.' },
        { type: CommandType.PLAY_TONE, label: 'Play Tone', icon: Music, defaultParams: { duration: 0.5 }, color: 'bg-pink-500', category: 'Sound', description: 'Beep the buzzer.' },
        { type: CommandType.PLAY_NOTE, label: 'Play Note', icon: Music, defaultParams: { note: 'C4', duration: 0.5 }, color: 'bg-pink-600', category: 'Sound', description: 'Play musical note.' },
        { type: CommandType.PLAY_SOUND, label: 'Play Effect', icon: Volume2, defaultParams: { text: 'siren' }, color: 'bg-pink-600', category: 'Sound', description: 'Play sound effect.' },
        { type: CommandType.STOP_SOUND, label: 'Stop Sound', icon: Volume2, defaultParams: {}, color: 'bg-pink-700', category: 'Sound', description: 'Stop sounds.' },
        { type: CommandType.SET_LCD, label: 'LCD Print', icon: Type, defaultParams: { text: 'Hello', row: 0, col: 0 }, color: 'bg-lime-600', category: 'Display', description: 'Show text on screen.' },
        { type: CommandType.CLEAR_LCD, label: 'Clear LCD', icon: Eraser, defaultParams: {}, color: 'bg-lime-700', category: 'Display', description: 'Wipe screen.' },
        { type: CommandType.SCROLL_LCD, label: 'Scroll LCD', icon: ArrowUp, defaultParams: { text: 'Scrolling text' }, color: 'bg-lime-500', category: 'Display', description: 'Scroll text on LCD.' },
        { type: CommandType.SET_SEGMENT, label: '7-Segment', icon: Hash, defaultParams: { value: 0 }, color: 'bg-slate-700', category: 'Display', description: 'Set segment display.' },
        // --- INPUT ---
        { type: CommandType.READ_DIGITAL, label: 'Read Digital', icon: ToggleLeft, defaultParams: { pin: 4, varName: 'btnState' }, color: 'bg-indigo-500', category: 'Input', description: 'Read Button/Switch.' },
        { type: CommandType.READ_ANALOG, label: 'Read Analog', icon: Gauge, defaultParams: { pin: 97, varName: 'val' }, color: 'bg-indigo-500', category: 'Input', description: 'Read Sensor value.' },
        { type: CommandType.READ_TEMPERATURE, label: 'Read Temp', icon: Thermometer, defaultParams: { varName: 'temp' }, color: 'bg-red-500', category: 'Input', description: 'Read temperature.' },
        { type: CommandType.READ_HUMIDITY, label: 'Read Humidity', icon: Droplets, defaultParams: { varName: 'humidity' }, color: 'bg-blue-500', category: 'Input', description: 'Read humidity.' },
        { type: CommandType.READ_DISTANCE, label: 'Read Distance', icon: Wifi, defaultParams: { varName: 'distance' }, color: 'bg-blue-400', category: 'Input', description: 'Read ultrasonic sensor.' },
        { type: CommandType.READ_GAS_LEVEL, label: 'Read Gas', icon: Wind, defaultParams: { varName: 'gas' }, color: 'bg-indigo-500', category: 'Input', description: 'Read gas sensor.' },
        { type: CommandType.READ_FLAME, label: 'Read Flame', icon: Flame, defaultParams: { varName: 'flame' }, color: 'bg-red-600', category: 'Input', description: 'Read flame sensor.' },
        { type: CommandType.READ_RAIN, label: 'Read Rain', icon: CloudRain, defaultParams: { varName: 'rain' }, color: 'bg-blue-400', category: 'Input', description: 'Read rain sensor.' },
        { type: CommandType.READ_SOIL, label: 'Read Soil', icon: Droplets, defaultParams: { varName: 'soil' }, color: 'bg-amber-800', category: 'Input', description: 'Read soil moisture.' },
        { type: CommandType.READ_HEARTBEAT, label: 'Read Pulse', icon: Heart, defaultParams: { varName: 'pulse' }, color: 'bg-red-500', category: 'Input', description: 'Read heartbeat sensor.' },
        { type: CommandType.READ_COMPASS, label: 'Read Compass', icon: Target, defaultParams: { varName: 'heading' }, color: 'bg-sky-500', category: 'Input', description: 'Read compass heading.' },
        { type: CommandType.READ_GYRO, label: 'Read Gyro', icon: Activity, defaultParams: { varName: 'gyro' }, color: 'bg-teal-500', category: 'Input', description: 'Read gyro data.' },
        { type: CommandType.READ_GPS, label: 'Read GPS', icon: MapPin, defaultParams: { varName: 'location' }, color: 'bg-emerald-600', category: 'Input', description: 'Read GPS coordinates.' },
        { type: CommandType.READ_COLOR, label: 'Read Color', icon: Palette, defaultParams: { varName: 'color' }, color: 'bg-pink-500', category: 'Input', description: 'Read color sensor.' },
        { type: CommandType.READ_PRESSURE, label: 'Read Pressure', icon: Gauge, defaultParams: { varName: 'pressure' }, color: 'bg-cyan-500', category: 'Input', description: 'Read pressure sensor.' },
        { type: CommandType.READ_FLEX, label: 'Read Flex', icon: Move, defaultParams: { varName: 'flex' }, color: 'bg-purple-500', category: 'Input', description: 'Read flex sensor.' },
        { type: CommandType.READ_MAGNETIC, label: 'Read Mag Field', icon: Magnet, defaultParams: { varName: 'magnetic' }, color: 'bg-blue-600', category: 'Input', description: 'Read hall sensor.' },
        // --- LOGIC ---
        { type: CommandType.LOGIC_AND, label: 'AND Gate', icon: GitBranch, defaultParams: { varName: 'out', value: true, value2: true }, color: 'bg-indigo-600', category: 'Logic', description: 'True if both inputs are true.' },
        { type: CommandType.LOGIC_OR, label: 'OR Gate', icon: GitBranch, defaultParams: { varName: 'out', value: true, value2: false }, color: 'bg-indigo-600', category: 'Logic', description: 'True if either input is true.' },
        { type: CommandType.LOGIC_NOT, label: 'NOT Gate', icon: GitBranch, defaultParams: { varName: 'out', value: true }, color: 'bg-indigo-600', category: 'Logic', description: 'Inverts the input.' },
        // --- DATA ---
        { type: CommandType.LOG_DATA, label: 'Log Data', icon: Terminal, defaultParams: { text: 'Value' }, color: 'bg-slate-600', category: 'Data', description: 'Print to console.' },
        { type: CommandType.SET_VAR, label: 'Set Var', icon: Variable, defaultParams: { varName: 'x', value: 0 }, color: 'bg-orange-500', category: 'Data', description: 'Save a value.' },
        { type: CommandType.CALC_ADD, label: 'Calculate', icon: Calculator, defaultParams: { varName: 'res', value: 1, value2: 1 }, color: 'bg-orange-700', category: 'Math', description: 'Do math.' },
        { type: CommandType.RESET_BOARD, label: 'Reset Board', icon: RotateCcw, defaultParams: {}, color: 'bg-slate-600', category: 'System', description: 'Reset hardware state.' },
        { type: CommandType.CONNECT_WIFI, label: 'Connect WiFi', icon: Wifi, defaultParams: { ssid: 'network', password: 'password' }, color: 'bg-blue-500', category: 'System', description: 'Connect to WiFi.' },
        { type: CommandType.SEND_HTTP, label: 'HTTP Request', icon: Cloud, defaultParams: { url: 'http://api.example.com', method: 'GET' }, color: 'bg-blue-400', category: 'System', description: 'Send HTTP request.' },
    ],
};
