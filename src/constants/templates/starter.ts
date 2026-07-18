import { AppMode, CommandType, CircuitComponent, CommandBlock } from '../../types';
import { Gamepad2, Smartphone, Cpu, Pickaxe, PenTool, type LucideIcon } from 'lucide-react';

export interface StarterTemplate {
    id: string;
    mode: AppMode;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    commands: CommandBlock[];
    circuitComponents?: CircuitComponent[];
}

export const STARTER_TEMPLATES: Record<AppMode, StarterTemplate> = {
    [AppMode.GAME]: {
        id: 'starter_game',
        mode: AppMode.GAME,
        name: 'My First Game',
        description: 'A wizard walks across a world with a coin and a flag!',
        icon: Gamepad2,
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        commands: [
            { id: 'sg1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
            { id: 'sg2', type: CommandType.SET_EMOJI, params: { text: '🧙' } },
            { id: 'sg3', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } },
            { id: 'sg4', type: CommandType.FOREVER, params: {} },
            { id: 'sg5', type: CommandType.MOVE_X, params: { value: 3 } },
            { id: 'sg6', type: CommandType.CHANGE_SCORE, params: { value: 1 } },
            { id: 'sg7', type: CommandType.END_FOREVER, params: {} },
        ],
    },
    [AppMode.APP]: {
        id: 'starter_app',
        mode: AppMode.APP,
        name: 'My First App',
        description: 'A simple calculator with buttons you can tap!',
        icon: Smartphone,
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        commands: [
            { id: 'sa1', type: CommandType.SET_TITLE, params: { text: 'Calculator' } },
            { id: 'sa2', type: CommandType.SET_BACKGROUND, params: { color: '#f8fafc' } },
            { id: 'sa3', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Enter a number:', textSize: 'lg' } },
            { id: 'sa4', type: CommandType.ADD_INPUT, params: { varName: 'number1', text: 'First number' } },
            { id: 'sa5', type: CommandType.ADD_INPUT, params: { varName: 'number2', text: 'Second number' } },
            { id: 'sa6', type: CommandType.ADD_SPACER, params: { value: 12 } },
            { id: 'sa7', type: CommandType.ADD_BUTTON, params: { text: 'Add +', message: 'add' } },
            { id: 'sa8', type: CommandType.ADD_BUTTON, params: { text: 'Subtract -', message: 'sub' } },
            { id: 'sa9', type: CommandType.ADD_SPACER, params: { value: 16 } },
            { id: 'sa10', type: CommandType.ADD_TEXT_BLOCK, params: { text: 'Result will appear here!', textSize: 'md' } },
        ],
    },
    [AppMode.HARDWARE]: {
        id: 'starter_hardware',
        mode: AppMode.HARDWARE,
        name: 'Blinking LED',
        description: 'Make an LED blink on and off like a heartbeat!',
        icon: Cpu,
        color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        commands: [
            { id: 'sh1', type: CommandType.FOREVER, params: {} },
            { id: 'sh2', type: CommandType.LED_ON, params: { pin: 0 } },
            { id: 'sh3', type: CommandType.WAIT, params: { value: 1 } },
            { id: 'sh4', type: CommandType.LED_OFF, params: { pin: 0 } },
            { id: 'sh5', type: CommandType.WAIT, params: { value: 1 } },
            { id: 'sh6', type: CommandType.END_FOREVER, params: {} },
        ],
        circuitComponents: [
            { id: 'sc1', type: 'LED_RED', x: 120, y: 120, pin: 0 },
            { id: 'sc2', type: 'RESISTOR', x: 120, y: 240, pin: 0 },
        ] as CircuitComponent[],
    },
    [AppMode.MINECRAFT]: {
        id: 'starter_minecraft',
        mode: AppMode.MINECRAFT,
        name: 'My First Build',
        description: 'Build a small terrain with grass, stone, and a tree!',
        icon: Pickaxe,
        color: 'bg-gradient-to-r from-green-500 to-green-700',
        commands: [
            { id: 'smc1', type: CommandType.MC_SET_BLOCK, params: { x: 0, y: 0, z: 0, blockType: 'grass_block' } },
            { id: 'smc2', type: CommandType.MC_SET_BLOCK, params: { x: 1, y: 0, z: 0, blockType: 'grass_block' } },
            { id: 'smc3', type: CommandType.MC_SET_BLOCK, params: { x: 2, y: 0, z: 0, blockType: 'grass_block' } },
            { id: 'smc4', type: CommandType.MC_SET_BLOCK, params: { x: 0, y: -1, z: 0, blockType: 'stone' } },
            { id: 'smc5', type: CommandType.MC_SET_BLOCK, params: { x: 1, y: -1, z: 0, blockType: 'stone' } },
            { id: 'smc6', type: CommandType.MC_SET_BLOCK, params: { x: 2, y: -1, z: 0, blockType: 'stone' } },
            { id: 'smc7', type: CommandType.MC_SET_BLOCK, params: { x: 1, y: 1, z: 0, blockType: 'oak_log' } },
            { id: 'smc8', type: CommandType.MC_SET_BLOCK, params: { x: 1, y: 2, z: 0, blockType: 'oak_leaves' } },
        ],
    },
    [AppMode.CAD]: {
        id: 'starter_cad',
        mode: AppMode.CAD,
        name: 'My First 3D Model',
        description: 'Create a simple 3D object ready for 3D printing!',
        icon: PenTool,
        color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
        commands: [
            { id: 'scad1', type: CommandType.CREATE_BOX, params: { width: 30, height: 30, depth: 30 } },
        ],
    },
};
