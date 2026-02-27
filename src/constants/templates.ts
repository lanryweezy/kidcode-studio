import { AppMode, CommandType, CircuitComponent, CommandBlock } from '../types';
import {
    ArrowUpCircle, Megaphone, Zap, MessageSquare, User, Lock, Box
} from 'lucide-react';

export const EXAMPLE_TEMPLATES: {
    id: string,
    mode: AppMode,
    name: string,
    description: string,
    icon: any,
    color: string,
    commands: CommandBlock[],
    circuitComponents?: CircuitComponent[]
}[] = [
        {
            id: 'tpl_game_jump',
            mode: AppMode.GAME,
            name: 'Jumping Bot',
            description: 'A platformer starter with gravity and jump logic.',
            icon: ArrowUpCircle,
            color: 'bg-orange-500',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
                { id: '2', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: '3', type: CommandType.FOREVER, params: {} },
                { id: '4', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, // Up Arrow code usually
                { id: '5', type: CommandType.JUMP, params: { value: 15 } },
                { id: '6', type: CommandType.END_IF, params: {} },
                { id: '7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, // Right
                { id: '8', type: CommandType.MOVE_X, params: { value: 5 } },
                { id: '9', type: CommandType.END_IF, params: {} },
                { id: '10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, // Left
                { id: '11', type: CommandType.MOVE_X, params: { value: -5 } },
                { id: '12', type: CommandType.END_IF, params: {} },
                { id: '13', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_app_talk',
            mode: AppMode.APP,
            name: 'Talk to Me',
            description: 'Type text and hear the robot speak it!',
            icon: Megaphone,
            color: 'bg-blue-500',
            commands: [
                { id: '1', type: CommandType.SET_TITLE, params: { text: 'Voice App' } },
                { id: '2', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'What should I say?', textSize: 'lg' as const } },
                { id: '3', type: CommandType.ADD_INPUT, params: { varName: 'speech', text: 'Type here...' } },
                { id: '4', type: CommandType.ADD_SPACER, params: { value: 20 } },
                { id: '5', type: CommandType.ADD_BUTTON, params: { text: 'Speak Now', message: '' } },
                { id: '6', type: CommandType.IF, params: { condition: 'true' } }, // Usually button trigger logic needs improving, simplified here
                { id: '7', type: CommandType.SPEAK, params: { text: 'Hello World' } }, // Placeholder for var usage
                { id: '8', type: CommandType.END_IF, params: {} }
            ]
        },
        {
            id: 'hw_siren',
            mode: AppMode.HARDWARE,
            name: 'Police Siren',
            description: 'Flashing Red/Blue LEDs with sound.',
            icon: Zap,
            color: 'bg-emerald-500',
            commands: [
                { id: '1', type: CommandType.FOREVER, params: {} },
                { id: '2', type: CommandType.LED_ON, params: { pin: 0 } }, // Red
                { id: '3', type: CommandType.LED_OFF, params: { pin: 1 } }, // Blue
                { id: '4', type: CommandType.PLAY_TONE, params: { duration: 0.5 } },
                { id: '5', type: CommandType.LED_OFF, params: { pin: 0 } },
                { id: '6', type: CommandType.LED_ON, params: { pin: 1 } },
                { id: '7', type: CommandType.PLAY_TONE, params: { duration: 0.5 } },
                { id: '8', type: CommandType.END_FOREVER, params: {} }
            ],
            circuitComponents: [
                { id: 'c1', type: 'LED_RED', x: 100, y: 100, pin: 0 },
                { id: 'c2', type: 'LED_BLUE', x: 200, y: 100, pin: 1 },
                { id: 'c3', type: 'SPEAKER', x: 150, y: 300, pin: 8 }
            ] as CircuitComponent[]
        },
        {
            id: 'tpl_game_quest',
            mode: AppMode.GAME,
            name: 'AI Quest RPG',
            description: 'Talk to an NPC to start your adventure!',
            icon: MessageSquare,
            color: 'bg-indigo-600',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
                { id: '2', type: CommandType.NPC_TALK, params: { text: 'Wizard', message: 'The forest is dangerous! Take this fireball!' } },
                { id: '3', type: CommandType.SPAWN_PARTICLES, params: { text: 'sparkle', color: '#fbbf24' } },
                { id: '4', type: CommandType.SET_VAR, params: { varName: 'has_spell', value: 1 } }
            ]
        },
        {
            id: 'tpl_app_social',
            mode: AppMode.APP,
            name: 'Profile Bio',
            description: 'Uses Global Variables to share your name.',
            icon: User,
            color: 'bg-blue-600',
            commands: [
                { id: '1', type: CommandType.CREATE_SCREEN, params: { text: 'login' } },
                { id: '2', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Welcome!', textSize: 'xl' } },
                { id: '3', type: CommandType.ADD_INPUT, params: { varName: 'global_username', text: 'Enter your name' } },
                { id: '4', type: CommandType.ADD_BUTTON, params: { text: 'Go to Profile', screenName: 'main' } },
                { id: '5', type: CommandType.CREATE_SCREEN, params: { text: 'main' } },
                { id: '6', type: CommandType.ADD_CHAT_MESSAGE, params: { text: 'Hello, User!', message: 'left' } }
            ]
        },
        {
            id: 'tpl_hw_logic',
            mode: AppMode.HARDWARE,
            name: 'Smart Security',
            description: 'Unlock with Logic AND (Switch + Light).',
            icon: Lock,
            color: 'bg-emerald-600',
            commands: [
                { id: '1', type: CommandType.FOREVER, params: {} },
                { id: '2', type: CommandType.READ_DIGITAL, params: { pin: 4, varName: 'sw' } },
                { id: '3', type: CommandType.READ_ANALOG, params: { pin: 5, varName: 'light' } },
                { id: '4', type: CommandType.LOGIC_AND, params: { varName: 'safe', value: 1, value2: 1 } },
                { id: '5', type: CommandType.IF, params: { condition: 'true' } },
                { id: '6', type: CommandType.LED_ON, params: { pin: 2 } },
                { id: '7', type: CommandType.END_IF, params: {} },
                { id: '8', type: CommandType.END_FOREVER, params: {} }
            ],
            circuitComponents: [
                { id: 'c1', type: 'SWITCH_SLIDE', x: 50, y: 100, pin: 4 },
                { id: 'c2', type: 'LIGHT_SENSOR', x: 150, y: 100, pin: 5 },
                { id: 'c3', type: 'LED_GREEN', x: 100, y: 300, pin: 2 }
            ] as CircuitComponent[]
        },
        {
            id: 'tpl_game_3d',
            mode: AppMode.GAME,
            name: '3D World Explorer',
            description: 'Build and walk through a 3D world!',
            icon: Box,
            color: 'bg-cyan-600',
            commands: [
                { id: '1', type: CommandType.SET_VIEW_3D, params: { condition: 'true' } },
                { id: '2', type: CommandType.GENERATE_ENVIRONMENT, params: { text: 'Sci-fi Moon Base' } },
                { id: '3', type: CommandType.SET_EMOJI, params: { text: '👨‍🚀' } },
                { id: '4', type: CommandType.SAY, params: { text: 'One small step for a kid...' } },
                { id: '5', type: CommandType.FOREVER, params: {} },
                { id: '6', type: CommandType.MOVE_Z, params: { value: 1 } },
                { id: '7', type: CommandType.ROTATE_Y, params: { value: 5 } },
                { id: '8', type: CommandType.END_FOREVER, params: {} }
            ]
        },

        // === HERO MARKETING TEMPLATES ===

        {
            id: 'hero_parkour_3d',
            mode: AppMode.GAME,
            name: '3D Parkour Runner',
            description: '🏆 A complete 3D obstacle course game with AI world generation!',
            icon: Box,
            color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
            commands: [
                { id: '1', type: CommandType.SET_VIEW_3D, params: { condition: 'true' } },
                { id: '2', type: CommandType.GENERATE_ENVIRONMENT, params: { text: 'Neon Cyberpunk City' } },
                { id: '3', type: CommandType.SET_EMOJI, params: { text: '🥷' } },
                { id: '4', type: CommandType.SAY, params: { text: 'Ready... GO!' } },
                { id: '5', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: '6', type: CommandType.FOREVER, params: {} },
                { id: '7', type: CommandType.MOVE_Z, params: { value: 3 } },
                { id: '8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: '9', type: CommandType.JUMP, params: { value: 18 } },
                { id: '10', type: CommandType.END_IF, params: {} },
                { id: '11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: '12', type: CommandType.MOVE_X, params: { value: 4 } },
                { id: '13', type: CommandType.END_IF, params: {} },
                { id: '14', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: '15', type: CommandType.MOVE_X, params: { value: -4 } },
                { id: '16', type: CommandType.END_IF, params: {} },
                { id: '17', type: CommandType.CHANGE_SCORE, params: { value: 1 } },
                { id: '18', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'hero_smart_home',
            mode: AppMode.HARDWARE,
            name: 'IoT Smart Home',
            description: '🏠 Auto-lights, temperature monitoring, and security alarm!',
            icon: Zap,
            color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
            commands: [
                { id: '1', type: CommandType.SET_LCD, params: { text: '🏠 Smart Home', row: 0, col: 0 } },
                { id: '2', type: CommandType.FOREVER, params: {} },
                { id: '3', type: CommandType.READ_TEMPERATURE, params: { varName: 'temp' } },
                { id: '4', type: CommandType.READ_ANALOG, params: { pin: 5, varName: 'light' } },
                { id: '5', type: CommandType.READ_DIGITAL, params: { pin: 4, varName: 'motion' } },
                { id: '6', type: CommandType.SET_LCD, params: { text: 'Temp: ${temp}°C', row: 1, col: 0 } },
                { id: '7', type: CommandType.IF, params: { varName: 'light', condition: '<30' } },
                { id: '8', type: CommandType.LED_ON, params: { pin: 0 } },
                { id: '9', type: CommandType.LED_ON, params: { pin: 1 } },
                { id: '10', type: CommandType.ELSE, params: {} },
                { id: '11', type: CommandType.LED_OFF, params: { pin: 0 } },
                { id: '12', type: CommandType.LED_OFF, params: { pin: 1 } },
                { id: '13', type: CommandType.END_IF, params: {} },
                { id: '14', type: CommandType.IF, params: { varName: 'motion', condition: '=1' } },
                { id: '15', type: CommandType.SET_RGB, params: { color: '#ff0000' } },
                { id: '16', type: CommandType.PLAY_TONE, params: { duration: 0.3 } },
                { id: '17', type: CommandType.END_IF, params: {} },
                { id: '18', type: CommandType.IF, params: { varName: 'temp', condition: '>28' } },
                { id: '19', type: CommandType.SET_FAN, params: { speed: 80 } },
                { id: '20', type: CommandType.ELSE, params: {} },
                { id: '21', type: CommandType.SET_FAN, params: { speed: 0 } },
                { id: '22', type: CommandType.END_IF, params: {} },
                { id: '23', type: CommandType.WAIT, params: { duration: 1 } },
                { id: '24', type: CommandType.END_FOREVER, params: {} }
            ],
            circuitComponents: [
                { id: 'c1', type: 'LED_WHITE', x: 80, y: 80, pin: 0 },
                { id: 'c2', type: 'LED_YELLOW', x: 180, y: 80, pin: 1 },
                { id: 'c3', type: 'TEMP_SENSOR', x: 280, y: 80, pin: 3 },
                { id: 'c4', type: 'LIGHT_SENSOR', x: 80, y: 250, pin: 5 },
                { id: 'c5', type: 'MOTION', x: 180, y: 250, pin: 4 },
                { id: 'c6', type: 'FAN', x: 280, y: 250, pin: 6 },
                { id: 'c7', type: 'RGB_LED', x: 380, y: 80, pin: 7 },
                { id: 'c8', type: 'LCD', x: 380, y: 250, pin: 8 },
                { id: 'c9', type: 'BUZZER', x: 480, y: 80, pin: 9 }
            ] as CircuitComponent[]
        },
        {
            id: 'hero_habit_tracker',
            mode: AppMode.APP,
            name: 'Daily Habit Tracker',
            description: '📱 A real mobile app with multiple screens and data!',
            icon: User,
            color: 'bg-gradient-to-r from-violet-500 to-purple-600',
            commands: [
                { id: '1', type: CommandType.SET_TITLE, params: { text: '✨ My Habits' } },
                { id: '2', type: CommandType.SET_BACKGROUND, params: { color: '#f8fafc' } },
                { id: '3', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Good Morning! 🌅', textSize: 'xl' } },
                { id: '4', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Track your daily habits', textSize: 'sm' } },
                { id: '5', type: CommandType.ADD_SPACER, params: { value: 16 } },
                { id: '6', type: CommandType.ADD_CHECKBOX, params: { text: '💧 Drink 8 glasses of water', varName: 'water' } },
                { id: '7', type: CommandType.ADD_CHECKBOX, params: { text: '📚 Read for 30 minutes', varName: 'read' } },
                { id: '8', type: CommandType.ADD_CHECKBOX, params: { text: '🏃 Exercise or play outside', varName: 'exercise' } },
                { id: '9', type: CommandType.ADD_CHECKBOX, params: { text: '🧹 Clean my room', varName: 'clean' } },
                { id: '10', type: CommandType.ADD_CHECKBOX, params: { text: '💻 Practice coding', varName: 'code' } },
                { id: '11', type: CommandType.ADD_SPACER, params: { value: 24 } },
                { id: '12', type: CommandType.ADD_PROGRESS, params: { varName: 'progress', max: 5 } },
                { id: '13', type: CommandType.ADD_SPACER, params: { value: 16 } },
                { id: '14', type: CommandType.ADD_BUTTON, params: { text: '🎉 Complete Day!', message: 'complete' } },
                { id: '15', type: CommandType.ADD_SPACER, params: { value: 8 } },
                { id: '16', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Keep going — you are doing great! 💪', textSize: 'sm' } }
            ]
        }
    ];
