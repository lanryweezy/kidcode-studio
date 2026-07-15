/**
 * Enhanced Game Templates - Using ALL new RPG systems
 * These templates showcase the full power of the improved KidCode Studio
 */

import { CommandType, CommandBlock } from '../types';

function cmd(type: CommandType, params: Record<string, unknown> = {}): CommandBlock {
  return { id: crypto.randomUUID(), type, params };
}

// ═══════════════════════════════════════════════════════════
// GAME 1: SHADOW REALM RPG (Complete RPG with all systems)
// ═══════════════════════════════════════════════════════════

export const SHADOW_REALM_RPG: CommandBlock[] = [
  // === INTRO CUTSCENE ===
  cmd(CommandType.TRIGGER_CUTSCENE, { text: 'intro' }),
  cmd(CommandType.FADE_OUT, { value: 1 }),
  cmd(CommandType.SAY, { text: 'In the realm of shadows...' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.SAY, { text: 'A hero rises to defeat the Dragon Lord!' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.FADE_IN, { value: 1 }),

  // === SETUP ===
  cmd(CommandType.SET_SCENE, { text: 'forest' }),
  cmd(CommandType.SET_EMOJI, { text: '🧙' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_WEATHER, { text: 'rain' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),

  // === RPG INITIALIZATION ===
  cmd(CommandType.SET_DIFFICULTY, { text: 'normal' }),
  cmd(CommandType.ADD_XP, { value: 0 }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 12 }),
  cmd(CommandType.SET_STAT, { text: 'defense', value: 8 }),
  cmd(CommandType.SET_STAT, { text: 'speed', value: 10 }),
  cmd(CommandType.APPLY_STATUS, { text: 'shield', value: 5 }),

  // === START QUEST ===
  cmd(CommandType.ACCEPT_QUEST, { text: 'Slime Slayer' }),

  // === GIVE STARTER ITEMS ===
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Health Potion', value: 3 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Bread', value: 5 }),

  // === NPC DIALOGUE ===
  cmd(CommandType.NPC_TALK, { text: 'Elder', message: 'Welcome, hero! The forest is dangerous. Take these supplies!' }),
  cmd(CommandType.PLAY_SOUND, { text: 'powerup' }),

  // === SPAWN ENEMIES (Wave 1) ===
  cmd(CommandType.START_WAVE, { value: 1 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),

  // === SPAWN COLLECTIBLES ===
  cmd(CommandType.SPAWN_ITEM, { text: '🪙' }),
  cmd(CommandType.SPAWN_ITEM, { text: '🪙' }),
  cmd(CommandType.SPAWN_ITEM, { text: '🪙' }),
  cmd(CommandType.SPAWN_ITEM, { text: '❤️' }),

  // === BACKGROUND MUSIC ===
  cmd(CommandType.SET_BACKGROUND_MUSIC, { text: 'adventure' }),
  cmd(CommandType.SET_MUSIC_VOLUME, { value: 30 }),

  // === MAIN GAME LOOP ===
  cmd(CommandType.FOREVER, { text: 'game_loop' }),

  // --- MOVEMENT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 15 }),
  cmd(CommandType.PLAY_SOUND, { text: 'jump' }),
  cmd(CommandType.END_IF, {}),

  // --- ATTACK (with combat engine) ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.ATTACK_ENEMY, { text: 'nearest', value: 15 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hit' }),
  cmd(CommandType.SPAWN_PARTICLES, { value: 5 }),
  cmd(CommandType.END_IF, {}),

  // --- COLLECT COINS (with XP) ---
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🪙' }),
  cmd(CommandType.CHANGE_SCORE, { value: 10 }),
  cmd(CommandType.ADD_XP, { value: 5 }),
  cmd(CommandType.PLAY_SOUND, { text: 'coin' }),
  cmd(CommandType.END_IF, {}),

  // --- USE HEALTH POTION ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 33 }),
  cmd(CommandType.USE_ITEM, { text: 'Health Potion' }),
  cmd(CommandType.PLAY_SOUND, { text: 'powerup' }),
  cmd(CommandType.END_IF, {}),

  // --- ENEMY CONTACT (with defense) ---
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🟢' }),
  cmd(CommandType.CHANGE_HEALTH, { value: -10 }),
  cmd(CommandType.APPLY_STATUS, { text: 'stun', value: 1 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hurt' }),
  cmd(CommandType.SHAKE_SCREEN, { value: 0.5 }),
  cmd(CommandType.END_IF, {}),

  // --- DROP LOOT ON KILL ---
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.DROP_LOOT, { text: 'slime' }),
  cmd(CommandType.ADD_XP, { value: 15 }),
  cmd(CommandType.UPDATE_QUEST, { text: 'kill', value: 1 }),
  cmd(CommandType.PLAY_SOUND, { text: 'explosion' }),
  cmd(CommandType.END_IF, {}),

  // --- WAVE PROGRESSION ---
  cmd(CommandType.IF, { condition: 'ALL_ENEMIES_DEFEATED' }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: 'Wave cleared! Next wave incoming...' }),
  cmd(CommandType.WAIT, { value: 3 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👻' }),
  cmd(CommandType.END_IF, {}),

  // --- BOSS TRIGGER (Wave 5) ---
  cmd(CommandType.IF, { condition: 'WAVE_EQUALS', value: 5 }),
  cmd(CommandType.SAY, { text: '⚠️ BOSS INCOMING!' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.SPAWN_BOSS, { text: 'Dragon Lord', value: 500 }),
  cmd(CommandType.SET_WEATHER, { text: 'storm' }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 1 }),
  cmd(CommandType.PLAY_SOUND, { text: 'explosion' }),
  cmd(CommandType.END_IF, {}),

  // --- BOSS PHASE TRANSITIONS ---
  cmd(CommandType.IF, { condition: 'BOSS_HP_LOW', value: 60 }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 2 }),
  cmd(CommandType.SAY, { text: 'Dragon Lord enters Phase 2!' }),
  cmd(CommandType.APPLY_STATUS, { text: 'burn', value: 3 }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'BOSS_HP_LOW', value: 30 }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 3 }),
  cmd(CommandType.SAY, { text: 'Dragon Lord is enraged!' }),
  cmd(CommandType.APPLY_STATUS, { text: 'speed', value: 5 }),
  cmd(CommandType.END_IF, {}),

  // --- WIN CONDITION ---
  cmd(CommandType.IF, { condition: 'BOSS_DEFEATED' }),
  cmd(CommandType.SAY, { text: '🎉 You defeated the Dragon Lord!' }),
  cmd(CommandType.COMPLETE_QUEST, { text: 'Slime Slayer' }),
  cmd(CommandType.ADD_XP, { value: 200 }),
  cmd(CommandType.PLAY_SOUND, { text: 'victory' }),
  cmd(CommandType.WIN_GAME, {}),
  cmd(CommandType.END_IF, {}),

  // --- DEATH ---
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.SAY, { text: '💀 You have fallen...' }),
  cmd(CommandType.PLAY_SOUND, { text: 'death' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.LOAD_CHECKPOINT, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'game_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 2: DUNGEON CRAWLER (Wave survival with crafting)
// ═══════════════════════════════════════════════════════════

export const DUNGEON_CRAWLER: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'cave' }),
  cmd(CommandType.SET_EMOJI, { text: '🥷' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'hard' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),

  // === STATS ===
  cmd(CommandType.SET_STAT, { text: 'strength', value: 15 }),
  cmd(CommandType.SET_STAT, { text: 'defense', value: 10 }),
  cmd(CommandType.SET_STAT, { text: 'speed', value: 12 }),

  // === STARTER GEAR ===
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Iron Sword', value: 1 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Health Potion', value: 5 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Bread', value: 10 }),

  // === WAVE SYSTEM ===
  cmd(CommandType.START_WAVE, { value: 1 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),

  // === MAIN LOOP ===
  cmd(CommandType.FOREVER, { text: 'dungeon_loop' }),

  // --- MOVEMENT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 16 }),
  cmd(CommandType.END_IF, {}),

  // --- ATTACK ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.ATTACK_ENEMY, { text: 'nearest', value: 20 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hit' }),
  cmd(CommandType.END_IF, {}),

  // --- DODGE ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 33 }),
  cmd(CommandType.DASH, { value: 15 }),
  cmd(CommandType.APPLY_STATUS, { text: 'shield', value: 2 }),
  cmd(CommandType.PLAY_SOUND, { text: 'dash' }),
  cmd(CommandType.END_IF, {}),

  // --- USE POTION ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 34 }),
  cmd(CommandType.USE_ITEM, { text: 'Health Potion' }),
  cmd(CommandType.PLAY_SOUND, { text: 'powerup' }),
  cmd(CommandType.END_IF, {}),

  // --- KILL REWARDS ---
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.DROP_LOOT, { text: 'skeleton' }),
  cmd(CommandType.ADD_XP, { value: 20 }),
  cmd(CommandType.CHANGE_SCORE, { value: 15 }),
  cmd(CommandType.END_IF, {}),

  // --- WAVE CLEAR ---
  cmd(CommandType.IF, { condition: 'ALL_ENEMIES_DEFEATED' }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: 'Wave cleared! Preparing next wave...' }),
  cmd(CommandType.WAIT, { value: 2 }),
  // Spawn harder enemies each wave
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👻' }),
  cmd(CommandType.END_IF, {}),

  // --- DEATH ---
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.SAY, { text: '💀 Game Over!' }),
  cmd(CommandType.PLAY_SOUND, { text: 'death' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'dungeon_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 3: SPACE SHOOTER (Wave survival with powerups)
// ═══════════════════════════════════════════════════════════

export const SPACE_SHOOTER: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'space' }),
  cmd(CommandType.SET_EMOJI, { text: '🚀' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'normal' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),

  cmd(CommandType.SET_STAT, { text: 'strength', value: 10 }),
  cmd(CommandType.START_WAVE, { value: 1 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👾' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👾' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),

  cmd(CommandType.FOREVER, { text: 'space_loop' }),

  // --- MOVEMENT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -8 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 8 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.MOVE_Y, { value: -8 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 40 }),
  cmd(CommandType.MOVE_Y, { value: 8 }),
  cmd(CommandType.END_IF, {}),

  // --- SHOOT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.SHOOT, { text: '🔥' }),
  cmd(CommandType.PLAY_SOUND, { text: 'laser' }),
  cmd(CommandType.END_IF, {}),

  // --- KILL REWARDS ---
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 10 }),
  cmd(CommandType.CHANGE_SCORE, { value: 25 }),
  cmd(CommandType.DROP_LOOT, { text: 'bat' }),
  cmd(CommandType.PLAY_SOUND, { text: 'explosion' }),
  cmd(CommandType.END_IF, {}),

  // --- WAVE CLEAR ---
  cmd(CommandType.IF, { condition: 'ALL_ENEMIES_DEFEATED' }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: 'Wave cleared!' }),
  cmd(CommandType.WAIT, { value: 1 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👾' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👾' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'space_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 4: PLATFORMER ADVENTURE (Classic with RPG elements)
// ═══════════════════════════════════════════════════════════

export const PLATFORMER_ADVENTURE: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'forest' }),
  cmd(CommandType.SET_EMOJI, { text: '🧑‍🔧' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_WEATHER, { text: 'rain' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),

  cmd(CommandType.SET_STAT, { text: 'strength', value: 10 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Health Potion', value: 3 }),

  cmd(CommandType.FOREVER, { text: 'platform_loop' }),

  // --- MOVEMENT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 15 }),
  cmd(CommandType.PLAY_SOUND, { text: 'jump' }),
  cmd(CommandType.END_IF, {}),

  // --- ATTACK ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.SHOOT, { text: '⚡' }),
  cmd(CommandType.PLAY_SOUND, { text: 'laser' }),
  cmd(CommandType.END_IF, {}),

  // --- COLLECT ---
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🪙' }),
  cmd(CommandType.CHANGE_SCORE, { value: 10 }),
  cmd(CommandType.ADD_XP, { value: 5 }),
  cmd(CommandType.PLAY_SOUND, { text: 'coin' }),
  cmd(CommandType.END_IF, {}),

  // --- ENEMY CONTACT ---
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '👾' }),
  cmd(CommandType.CHANGE_HEALTH, { value: -10 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hurt' }),
  cmd(CommandType.END_IF, {}),

  // --- KILL REWARDS ---
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 10 }),
  cmd(CommandType.CHANGE_SCORE, { value: 15 }),
  cmd(CommandType.DROP_LOOT, { text: 'slime' }),
  cmd(CommandType.END_IF, {}),

  // --- WIN ---
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🚩' }),
  cmd(CommandType.SAY, { text: '🎉 Level Complete!' }),
  cmd(CommandType.PLAY_SOUND, { text: 'victory' }),
  cmd(CommandType.WIN_GAME, {}),
  cmd(CommandType.END_IF, {}),

  // --- DEATH ---
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'platform_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 5: BOSS RUSH (Pure combat challenge)
// ═══════════════════════════════════════════════════════════

export const BOSS_RUSH: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'volcano' }),
  cmd(CommandType.SET_EMOJI, { text: '⚔️' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),

  cmd(CommandType.SET_DIFFICULTY, { text: 'hard' }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 20 }),
  cmd(CommandType.SET_STAT, { text: 'defense', value: 15 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Health Potion', value: 10 }),

  cmd(CommandType.START_WAVE, { value: 1 }),

  cmd(CommandType.FOREVER, { text: 'boss_loop' }),

  // --- MOVEMENT ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 16 }),
  cmd(CommandType.END_IF, {}),

  // --- ATTACK ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.ATTACK_ENEMY, { text: 'nearest', value: 25 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hit' }),
  cmd(CommandType.END_IF, {}),

  // --- HEAL ---
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 33 }),
  cmd(CommandType.USE_ITEM, { text: 'Health Potion' }),
  cmd(CommandType.PLAY_SOUND, { text: 'powerup' }),
  cmd(CommandType.END_IF, {}),

  // --- BOSS PHASES ---
  cmd(CommandType.IF, { condition: 'BOSS_HP_LOW', value: 75 }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 2 }),
  cmd(CommandType.SAY, { text: 'Boss enters Phase 2!' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'BOSS_HP_LOW', value: 50 }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 3 }),
  cmd(CommandType.SAY, { text: 'Boss is enraged!' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'BOSS_HP_LOW', value: 25 }),
  cmd(CommandType.TRIGGER_BOSS_PHASE, { value: 4 }),
  cmd(CommandType.SAY, { text: 'Final phase!' }),
  cmd(CommandType.APPLY_STATUS, { text: 'speed', value: 10 }),
  cmd(CommandType.END_IF, {}),

  // --- BOSS DEFEATED ---
  cmd(CommandType.IF, { condition: 'BOSS_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 500 }),
  cmd(CommandType.CHANGE_SCORE, { value: 1000 }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: '🎉 Boss defeated! Next boss incoming...' }),
  cmd(CommandType.WAIT, { value: 3 }),
  cmd(CommandType.SPAWN_BOSS, { text: 'Next Boss', value: 750 }),
  cmd(CommandType.END_IF, {}),

  // --- DEATH ---
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'boss_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 6: METROIDVANIA (Exploration + abilities)
// ═══════════════════════════════════════════════════════════

export const METROIDVANIA: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'cave' }),
  cmd(CommandType.SET_EMOJI, { text: '🥷' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'normal' }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 12 }),
  cmd(CommandType.SET_STAT, { text: 'speed', value: 15 }),
  cmd(CommandType.ADD_TO_INVENTORY, { text: 'Health Potion', value: 3 }),
  cmd(CommandType.ACCEPT_QUEST, { text: 'Explore the Cave' }),

  cmd(CommandType.FOREVER, { text: 'metroid_loop' }),

  // Movement with wall jump feel
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 6 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 16 }),
  cmd(CommandType.PLAY_SOUND, { text: 'jump' }),
  cmd(CommandType.END_IF, {}),

  // Attack
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.ATTACK_ENEMY, { text: 'nearest', value: 18 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hit' }),
  cmd(CommandType.END_IF, {}),

  // Dash
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 33 }),
  cmd(CommandType.DASH, { value: 20 }),
  cmd(CommandType.APPLY_STATUS, { text: 'speed', value: 3 }),
  cmd(CommandType.PLAY_SOUND, { text: 'dash' }),
  cmd(CommandType.END_IF, {}),

  // Kill rewards
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 15 }),
  cmd(CommandType.DROP_LOOT, { text: 'slime' }),
  cmd(CommandType.UPDATE_QUEST, { text: 'kill', value: 1 }),
  cmd(CommandType.END_IF, {}),

  // Exploration rewards
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '💎' }),
  cmd(CommandType.ADD_XP, { value: 50 }),
  cmd(CommandType.CHANGE_SCORE, { value: 100 }),
  cmd(CommandType.SAY, { text: 'Found a rare gem!' }),
  cmd(CommandType.PLAY_SOUND, { text: 'powerup' }),
  cmd(CommandType.END_IF, {}),

  // Death
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'metroid_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 7: ROGUELIKE (Procedural + permadeath)
// ═══════════════════════════════════════════════════════════

export const ROGUELIKE: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'dungeon' }),
  cmd(CommandType.SET_EMOJI, { text: '💀' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'hard' }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 8 }),
  cmd(CommandType.SET_STAT, { text: 'defense', value: 5 }),
  cmd(CommandType.START_WAVE, { value: 1 }),

  cmd(CommandType.FOREVER, { text: 'rogue_loop' }),

  // Movement
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 14 }),
  cmd(CommandType.END_IF, {}),

  // Attack
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.ATTACK_ENEMY, { text: 'nearest', value: 12 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hit' }),
  cmd(CommandType.END_IF, {}),

  // Kill = XP + loot
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 20 }),
  cmd(CommandType.DROP_LOOT, { text: 'skeleton' }),
  cmd(CommandType.CHANGE_SCORE, { value: 25 }),
  cmd(CommandType.END_IF, {}),

  // Wave clear = harder enemies
  cmd(CommandType.IF, { condition: 'ALL_ENEMIES_DEFEATED' }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: 'Deeper into the dungeon...' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '👻' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),
  cmd(CommandType.END_IF, {}),

  // Permadeath
  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.SAY, { text: '💀 Permadeath! Run over.' }),
  cmd(CommandType.PLAY_SOUND, { text: 'death' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'rogue_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 8: TOWER DEFENSE (Strategic wave defense)
// ═══════════════════════════════════════════════════════════

export const TOWER_DEFENSE: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'forest' }),
  cmd(CommandType.SET_EMOJI, { text: '🏰' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'false' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'normal' }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 8 }),
  cmd(CommandType.START_WAVE, { value: 1 }),

  // Spawn initial enemies
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🟢' }),

  cmd(CommandType.FOREVER, { text: 'tower_loop' }),

  // Movement (turret rotation feel)
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -4 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 4 }),
  cmd(CommandType.END_IF, {}),

  // Shoot projectiles
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.SHOOT, { text: '⚡' }),
  cmd(CommandType.PLAY_SOUND, { text: 'laser' }),
  cmd(CommandType.END_IF, {}),

  // Kill rewards
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 10 }),
  cmd(CommandType.CHANGE_SCORE, { value: 20 }),
  cmd(CommandType.DROP_LOOT, { text: 'slime' }),
  cmd(CommandType.END_IF, {}),

  // Wave clear = more enemies
  cmd(CommandType.IF, { condition: 'ALL_ENEMIES_DEFEATED' }),
  cmd(CommandType.NEXT_WAVE, {}),
  cmd(CommandType.SAY, { text: 'Wave cleared! Enemies incoming!' }),
  cmd(CommandType.WAIT, { value: 2 }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '💀' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),
  cmd(CommandType.SPAWN_ENEMY, { text: '🦇' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'tower_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 9: PUZZLE RPG (Logic + combat)
// ═══════════════════════════════════════════════════════════

export const PUZZLE_RPG: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'cave' }),
  cmd(CommandType.SET_EMOJI, { text: '🧩' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'normal' }),
  cmd(CommandType.SET_STAT, { text: 'strength', value: 10 }),
  cmd(CommandType.ACCEPT_QUEST, { text: 'Solve the Puzzles' }),

  cmd(CommandType.FOREVER, { text: 'puzzle_loop' }),

  // Movement
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 5 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 14 }),
  cmd(CommandType.END_IF, {}),

  // Interact with puzzle elements
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.SHOOT, { text: '💡' }),
  cmd(CommandType.PLAY_SOUND, { text: 'click' }),
  cmd(CommandType.END_IF, {}),

  // Collect puzzle pieces
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🔑' }),
  cmd(CommandType.ADD_XP, { value: 25 }),
  cmd(CommandType.CHANGE_SCORE, { value: 50 }),
  cmd(CommandType.UPDATE_QUEST, { text: 'collect', value: 1 }),
  cmd(CommandType.PLAY_SOUND, { text: 'coin' }),
  cmd(CommandType.END_IF, {}),

  // Enemy contact
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '👾' }),
  cmd(CommandType.CHANGE_HEALTH, { value: -10 }),
  cmd(CommandType.PLAY_SOUND, { text: 'hurt' }),
  cmd(CommandType.END_IF, {}),

  // Kill enemies
  cmd(CommandType.IF, { condition: 'ENEMY_DEFEATED' }),
  cmd(CommandType.ADD_XP, { value: 15 }),
  cmd(CommandType.DROP_LOOT, { text: 'slime' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.IF, { condition: 'HEALTH_ZERO' }),
  cmd(CommandType.GAME_OVER, {}),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'puzzle_loop' }),
];

// ═══════════════════════════════════════════════════════════
// GAME 10: FARMING SIMULATOR (Relaxed gameplay)
// ═══════════════════════════════════════════════════════════

export const FARMING_SIM: CommandBlock[] = [
  cmd(CommandType.SET_SCENE, { text: 'forest' }),
  cmd(CommandType.SET_EMOJI, { text: '🧑‍🌾' }),
  cmd(CommandType.SET_GRAVITY, { condition: 'true' }),
  cmd(CommandType.SET_CAMERA, { condition: 'true' }),
  cmd(CommandType.SET_WEATHER, { text: 'rain' }),
  cmd(CommandType.SET_DIFFICULTY, { text: 'easy' }),
  cmd(CommandType.ACCEPT_QUEST, { text: 'Farm Life' }),

  cmd(CommandType.FOREVER, { text: 'farm_loop' }),

  // Movement
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 37 }),
  cmd(CommandType.MOVE_X, { value: -3 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 39 }),
  cmd(CommandType.MOVE_X, { value: 3 }),
  cmd(CommandType.END_IF, {}),
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 38 }),
  cmd(CommandType.JUMP, { value: 12 }),
  cmd(CommandType.END_IF, {}),

  // Plant/Harvest
  cmd(CommandType.IF, { condition: 'IS_PRESSED', pin: 32 }),
  cmd(CommandType.SPAWN_ITEM, { text: '🌾' }),
  cmd(CommandType.PLAY_SOUND, { text: 'click' }),
  cmd(CommandType.END_IF, {}),

  // Collect crops
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '🌾' }),
  cmd(CommandType.ADD_XP, { value: 5 }),
  cmd(CommandType.CHANGE_SCORE, { value: 10 }),
  cmd(CommandType.UPDATE_QUEST, { text: 'collect', value: 1 }),
  cmd(CommandType.PLAY_SOUND, { text: 'coin' }),
  cmd(CommandType.END_IF, {}),

  // Water plants
  cmd(CommandType.IF, { condition: 'IS_TOUCHING', text: '💧' }),
  cmd(CommandType.ADD_XP, { value: 3 }),
  cmd(CommandType.PLAY_SOUND, { text: 'splash' }),
  cmd(CommandType.END_IF, {}),

  cmd(CommandType.END_FOREVER, { text: 'farm_loop' }),
];

// ═══════════════════════════════════════════════════════════
// Export all enhanced games
// ═══════════════════════════════════════════════════════════

export const ENHANCED_GAMES = [
  { id: 'shadow_realm_rpg', name: 'Shadow Realm RPG', description: 'Complete RPG with XP, equipment, quests, waves, and boss fights!', commands: SHADOW_REALM_RPG },
  { id: 'dungeon_crawler', name: 'Dungeon Crawler', description: 'Wave survival with crafting, dodging, and loot drops!', commands: DUNGEON_CRAWLER },
  { id: 'space_shooter', name: 'Space Shooter', description: 'Classic space shooter with wave system and powerups!', commands: SPACE_SHOOTER },
  { id: 'platformer_adventure', name: 'Platformer Adventure', description: 'Classic platformer with RPG elements and quests!', commands: PLATFORMER_ADVENTURE },
  { id: 'boss_rush', name: 'Boss Rush', description: 'Pure combat challenge with multi-phase boss fights!', commands: BOSS_RUSH },
  { id: 'metroidvania', name: 'Metroidvania', description: 'Exploration-based platformer with abilities and secrets!', commands: METROIDVANIA },
  { id: 'roguelike', name: 'Roguelike', description: 'Permadeath dungeon crawler with procedural difficulty!', commands: ROGUELIKE },
  { id: 'tower_defense', name: 'Tower Defense', description: 'Strategic wave defense with turret-style combat!', commands: TOWER_DEFENSE },
  { id: 'puzzle_rpg', name: 'Puzzle RPG', description: 'Logic puzzles combined with RPG combat!', commands: PUZZLE_RPG },
  { id: 'farming_sim', name: 'Farming Simulator', description: 'Relaxed farming gameplay with quests!', commands: FARMING_SIM },
];
