import { SpriteState, GameEntity, LootDrop } from '../types';
import {
  GAME_LEVELS,
  ENEMY_SPAWN_TABLE,
  LOOT_TABLES,
  DIFFICULTY_MULTIPLIERS,
  LevelDefinition,
  EnemySpawnConfig,
} from '../constants/shadowRealmGame';

/**
 * Shadow Realm RPG Engine
 * Handles: XP/Leveling, Status Effects, Loot Drops, Wave Spawning, Difficulty
 * 
 * SHORTCOMINGS FOUND IN APP:
 * 1. No XP system - added here manually
 * 2. No status effects - added here manually
 * 3. No loot tables - added here manually
 * 4. No wave spawning - added here manually
 * 5. No difficulty scaling - added here manually
 * 6. No armor/defense - added here manually
 */

// ─── XP & Leveling System ───
export interface XPResult {
  leveledUp: boolean;
  newLevel: number;
  xpGained: number;
  statGains: { str: number; def: number; spd: number; maxHP: number };
}

export function calculateXPGain(baseXP: number, difficulty: string): number {
  const mult = DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || DIFFICULTY_MULTIPLIERS.normal;
  return Math.floor(baseXP * mult.xpMultiplier);
}

export function addXP(state: SpriteState, xpAmount: number): { state: SpriteState; result: XPResult } {
  const currentXP = (state.variables.playerXP as number) || 0;
  const currentLevel = (state.variables.playerLevel as number) || 1;
  const xpToLevel = (state.variables.playerXPToLevel as number) || 100;

  const newXP = currentXP + xpAmount;
  let result: XPResult = {
    leveledUp: false,
    newLevel: currentLevel,
    xpGained: xpAmount,
    statGains: { str: 0, def: 0, spd: 0, maxHP: 0 },
  };

  if (newXP >= xpToLevel) {
    // Level up!
    const newLevel = currentLevel + 1;
    const strGain = 2 + Math.floor(Math.random() * 2);
    const defGain = 1 + Math.floor(Math.random() * 2);
    const spdGain = 1 + Math.floor(Math.random() * 2);
    const maxHPGain = 10 + Math.floor(Math.random() * 10);

    result = {
      leveledUp: true,
      newLevel,
      xpGained: xpAmount,
      statGains: { str: strGain, def: defGain, spd: spdGain, maxHP: maxHPGain },
    };

    return {
      state: {
        ...state,
        variables: {
          ...state.variables,
          playerLevel: newLevel,
          playerXP: newXP - xpToLevel, // Carry over excess XP
          playerXPToLevel: Math.floor(xpToLevel * 1.5), // Scale XP requirement
          playerSTR: ((state.variables.playerSTR as number) || 10) + strGain,
          playerDEF: ((state.variables.playerDEF as number) || 5) + defGain,
          playerSPD: ((state.variables.playerSPD as number) || 8) + spdGain,
          maxHealth: ((state.variables.maxHealth as number) || state.maxHealth) + maxHPGain,
        },
        maxHealth: state.maxHealth + maxHPGain,
        health: state.health + maxHPGain, // Heal on level up
      },
      result,
    };
  }

  return {
    state: {
      ...state,
      variables: { ...state.variables, playerXP: newXP },
    },
    result,
  };
}

// ─── Damage Calculation with Defense ───
export function calculateDamage(
  baseDamage: number,
  playerDEF: number,
  shieldPercent: number = 0
): number {
  // Defense reduces damage by a percentage, with diminishing returns
  const defReduction = playerDEF / (playerDEF + 50); // Max ~80% reduction at 200 DEF
  const shieldReduction = shieldPercent / 100;
  const totalReduction = Math.min(0.9, defReduction + shieldReduction); // Cap at 90%
  return Math.max(1, Math.floor(baseDamage * (1 - totalReduction)));
}

// ─── Status Effects ───
export interface StatusEffect {
  type: 'poison' | 'burn' | 'freeze' | 'stun' | 'shield' | 'speed';
  duration: number;
  value: number; // damage per tick, or shield/speed amount
}

export function applyStatusEffect(state: SpriteState, effect: StatusEffect): SpriteState {
  switch (effect.type) {
    case 'poison':
      return { ...state, variables: { ...state.variables, poisonTimer: effect.duration } };
    case 'burn':
      return { ...state, variables: { ...state.variables, burnTimer: effect.duration } };
    case 'freeze':
      return { ...state, variables: { ...state.variables, freezeTimer: effect.duration } };
    case 'stun':
      return { ...state, variables: { ...state.variables, stunTimer: effect.duration } };
    case 'shield':
      return { ...state, variables: { ...state.variables, shieldTimer: effect.duration } };
    case 'speed':
      return { ...state, variables: { ...state.variables, speedBoostTimer: effect.duration } };
    default:
      return state;
  }
}

export function processStatusEffects(state: SpriteState): SpriteState {
  const vars = { ...state.variables };
  let newHealth = state.health;

  // Poison: 2 damage per tick
  if ((vars.poisonTimer as number) > 0) {
    newHealth -= 2;
    vars.poisonTimer = (vars.poisonTimer as number) - 1;
  }

  // Burn: 3 damage per tick
  if ((vars.burnTimer as number) > 0) {
    newHealth -= 3;
    vars.burnTimer = (vars.burnTimer as number) - 1;
  }

  // Freeze: no movement (handled in physics)
  if ((vars.freezeTimer as number) > 0) {
    vars.freezeTimer = (vars.freezeTimer as number) - 1;
  }

  // Stun: no action (handled in interpreter)
  if ((vars.stunTimer as number) > 0) {
    vars.stunTimer = (vars.stunTimer as number) - 1;
  }

  // Shield: reduce damage (handled in damage calc)
  if ((vars.shieldTimer as number) > 0) {
    vars.shieldTimer = (vars.shieldTimer as number) - 1;
  }

  // Speed boost: increase movement (handled in physics)
  if ((vars.speedBoostTimer as number) > 0) {
    vars.speedBoostTimer = (vars.speedBoostTimer as number) - 1;
  }

  return {
    ...state,
    health: Math.max(0, newHealth),
    variables: vars,
  };
}

export function isStunned(state: SpriteState): boolean {
  return (state.variables.stunTimer as number) > 0;
}

export function isFrozen(state: SpriteState): boolean {
  return (state.variables.freezeTimer as number) > 0;
}

export function hasShield(state: SpriteState): boolean {
  return (state.variables.shieldTimer as number) > 0;
}

export function hasSpeedBoost(state: SpriteState): boolean {
  return (state.variables.speedBoostTimer as number) > 0;
}

// ─── Loot Drop System ───
export function rollLoot(enemyType: string): LootDrop[] {
  const table = LOOT_TABLES[enemyType] || LOOT_TABLES['slime'];
  const drops: LootDrop[] = [];

  for (const loot of table) {
    if (Math.random() < loot.chance) {
      const quantity = loot.minQuantity + Math.floor(Math.random() * (loot.maxQuantity - loot.minQuantity + 1));
      drops.push({ ...loot, minQuantity: quantity, maxQuantity: quantity });
    }
  }

  return drops;
}

// ─── Wave Spawning System ───
export interface WaveConfig {
  waveNumber: number;
  enemies: { type: string; count: number; spawnDelay: number }[];
  bossWave: boolean;
}

export function generateWaves(levelId: string, difficulty: string): WaveConfig[] {
  const spawnTable = ENEMY_SPAWN_TABLE[levelId] || ENEMY_SPAWN_TABLE['dark_forest'];
  const mult = DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || DIFFICULTY_MULTIPLIERS.normal;

  const waves: WaveConfig[] = [];

  // Wave 1-3: Easy enemies
  for (let i = 1; i <= 3; i++) {
    waves.push({
      waveNumber: i,
      enemies: [
        { type: spawnTable[0].type, count: Math.floor(2 + i * mult.enemyHP), spawnDelay: 2000 },
      ],
      bossWave: false,
    });
  }

  // Wave 4-6: Medium enemies
  for (let i = 4; i <= 6; i++) {
    waves.push({
      waveNumber: i,
      enemies: [
        { type: spawnTable[0].type, count: Math.floor(1 + i * mult.enemyHP), spawnDelay: 1500 },
        { type: spawnTable[1 % spawnTable.length].type, count: Math.floor(1 + (i - 3) * mult.enemyHP), spawnDelay: 2000 },
      ],
      bossWave: false,
    });
  }

  // Wave 7+: Mixed enemies
  for (let i = 7; i <= 10; i++) {
    waves.push({
      waveNumber: i,
      enemies: spawnTable.map(s => ({
        type: s.type,
        count: Math.floor(1 + (i - 5) * mult.enemyHP),
        spawnDelay: 1500,
      })),
      bossWave: false,
    });
  }

  // Final wave: Boss
  if (levelId === 'dragon_lair') {
    waves.push({
      waveNumber: 11,
      enemies: [{ type: 'dragon', count: 1, spawnDelay: 0 }],
      bossWave: true,
    });
  }

  return waves;
}

// ─── Spawn Enemy from Config ───
export function createEnemyFromConfig(
  config: EnemySpawnConfig,
  x: number,
  y: number,
  difficulty: string
): GameEntity {
  const mult = DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || DIFFICULTY_MULTIPLIERS.normal;

  return {
    id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'enemy',
    emoji: config.emoji,
    x,
    y,
    vx: config.behavior === 'patrol' ? config.speed * mult.enemySpeed : 0,
    vy: config.behavior === 'fly' ? config.speed * mult.enemySpeed : 0,
    behavior: config.behavior === 'fly' ? 'float_h' : config.behavior as any,
    range: config.behavior === 'patrol' ? 100 : undefined,
    initialX: x,
  };
}

// ─── Level Progression ───
export function getCurrentLevel(state: SpriteState): LevelDefinition | null {
  const currentLevel = (state.variables.playerLevel as number) || 1;

  // Find the highest level the player qualifies for
  let eligibleLevel: LevelDefinition | null = null;
  for (const level of GAME_LEVELS) {
    if (currentLevel >= level.requiredLevel) {
      eligibleLevel = level;
    }
  }

  return eligibleLevel;
}

export function getNextLevel(currentLevelId: string): LevelDefinition | null {
  const idx = GAME_LEVELS.findIndex(l => l.id === currentLevelId);
  if (idx >= 0 && idx < GAME_LEVELS.length - 1) {
    return GAME_LEVELS[idx + 1];
  }
  return null;
}

// ─── Gold & Shop ───
export function addGold(state: SpriteState, amount: number): SpriteState {
  const currentGold = (state.variables.gold as number) || 0;
  return {
    ...state,
    variables: { ...state.variables, gold: currentGold + amount },
  };
}

export function spendGold(state: SpriteState, amount: number): { success: boolean; state: SpriteState } {
  const currentGold = (state.variables.gold as number) || 0;
  if (currentGold >= amount) {
    return {
      success: true,
      state: { ...state, variables: { ...state.variables, gold: currentGold - amount } },
    };
  }
  return { success: false, state };
}

// ─── Minimap Data Generator ───
export interface MinimapTile {
  x: number;
  y: number;
  type: 'ground' | 'hazard' | 'enemy' | 'item' | 'player' | 'boss';
}

export function generateMinimapData(state: SpriteState): MinimapTile[] {
  const tiles: MinimapTile[] = [];

  // Ground tiles
  if (state.tilemap) {
    for (const tile of state.tilemap) {
      if (['brick', 'grass', 'dirt', 'stone', 'crate'].includes(tile.type)) {
        tiles.push({ x: tile.x, y: tile.y, type: 'ground' });
      } else if (['spike', 'lava', 'water'].includes(tile.type)) {
        tiles.push({ x: tile.x, y: tile.y, type: 'hazard' });
      }
    }
  }

  // Enemy positions
  for (const enemy of state.enemies) {
    tiles.push({ x: enemy.x, y: enemy.y, type: 'enemy' });
  }

  // Item positions
  for (const item of state.items) {
    tiles.push({ x: item.x, y: item.y, type: 'item' });
  }

  // Player position
  tiles.push({ x: state.x, y: state.y, type: 'player' });

  // Boss
  if (state.activeBoss) {
    tiles.push({ x: state.activeBoss.x, y: state.activeBoss.y, type: 'boss' });
  }

  return tiles;
}

// ─── Game Stats Tracker ───
export interface GameStats {
  totalXP: number;
  totalGold: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  itemsCollected: number;
  deaths: number;
  playTime: number;
  levelsCompleted: number;
}

export function updateGameStats(
  state: SpriteState,
  updates: Partial<GameStats>
): SpriteState {
  const currentStats = (state.variables.gameStats as GameStats) || {
    totalXP: 0,
    totalGold: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    itemsCollected: 0,
    deaths: 0,
    playTime: 0,
    levelsCompleted: 0,
  };

  return {
    ...state,
    variables: {
      ...state.variables,
      gameStats: { ...currentStats, ...updates },
    },
  };
}
