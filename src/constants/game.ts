import { SpriteState } from '../types';
import {
    Square, BrickWall, Waves, Flame, Boxes, ArrowUp, ArrowUpCircle, Coins, Key as KeyIcon, DoorOpen, Triangle, Flag, Eraser, ZoomIn, Eye, Film, Crosshair, Ghost, Sparkles, Copy, MessageSquare, Play, Trash, Music, Wind, Video, Sun, Moon, Activity, Timer, Heart, RotateCcw, RotateCw, Anchor, Trophy, Variable, MousePointer2, Box
} from 'lucide-react';

export const INITIAL_SPRITE_STATE: SpriteState = {
    x: 200,
    y: 200,
    z: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    opacity: 1,
    scale: 1,
    emoji: '🤖',
    texture: null,
    frames: [],
    animations: {},
    currentAnimation: null,
    animationSpeed: 5,
    speech: null,
    scene: 'grid',
    weather: 'none' as 'none' | 'rain' | 'snow',
    score: 0,
    keys: 0,
    health: 3,
    maxHealth: 3,
    variables: {},

    is3D: false,
    cameraMode: 'third_person' as 'first_person' | 'third_person' | 'top_down',

    // Powerups
    powerups: {
        speed: 0,
        shield: 0,
        ghost: 0
    },
    // Physics & Entities
    vy: 0,
    vx: 0,
    vz: 0,
    gravity: false,
    gravityForce: 1,
    jumpForce: 15,
    isJumping: false,
    canDoubleJump: false,
    canDash: false,
    dashCooldown: 0,
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
    tilemap: [],

    // === ENHANCED GAME FEATURES ===
    // Inventory
    inventory: [],
    maxInventorySize: 10,
    equippedItem: undefined,

    // Dialogue
    activeDialogue: undefined,
    dialogueHistory: [],
    isDialogueActive: false,

    // Music & Audio
    backgroundMusic: undefined,
    musicVolume: 0.5,
    ambientSound: undefined,

    // Checkpoints
    checkpoints: [],
    lastCheckpoint: undefined,

    // Cutscenes
    isCutsceneActive: false,
    screenShake: 0,
    screenFreeze: 0,
    timeScale: 1,
    fadeAlpha: 0,

    // Boss Battles
    activeBoss: undefined,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossPhase: 0
};

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
