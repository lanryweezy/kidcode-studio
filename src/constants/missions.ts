import { AppMode, Mission, CommandType } from '../types';

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
