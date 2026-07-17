import {
  SpriteState, GameEntity, StatusEffect, StatusEffectType,
  Difficulty, DifficultyMultipliers, LootDrop, WaveConfig,
  RPGQuest, RPGQuestObjective, CharacterStats, BossPhaseConfig, InventoryItem
} from '../types';

/**
 * RPG Engine Service
 * Core game systems for pro-level games
 * 
 * Addresses these critical shortcomings:
 * 1. XP/Leveling System
 * 2. Status Effects
 * 3. Damage/Defense Calculation
 * 4. Wave Spawning
 * 5. Loot Drop Tables
 * 6. Difficulty Settings
 * 7. Quest Tracking
 * 8. Boss Phase System
 * 9. Character Stats
 * 10. Shop System
 */

// ─── XP & Leveling ───

export const XP_TABLE: Record<number, number> = {
  1: 100, 2: 250, 3: 500, 4: 800, 5: 1200,
  6: 1700, 7: 2300, 8: 3000, 9: 3800, 10: 5000,
  11: 6500, 12: 8200, 13: 10000, 14: 12000, 15: 15000,
};

export function getXPForLevel(level: number): number {
  return XP_TABLE[level] || Math.floor(15000 * Math.pow(1.3, level - 15));
}

export function calculateXPGain(baseXP: number, difficulty: Difficulty): number {
  const mult = DIFFICULTY_MULTIPLIERS[difficulty];
  return Math.floor(baseXP * mult.xpMultiplier);
}

export function addXP(state: SpriteState, xpAmount: number): {
  state: SpriteState;
  leveledUp: boolean;
  newLevel: number;
  statGains: { str: number; def: number; spd: number; maxHP: number };
} {
  const stats = getCharacterStats(state);
  const newXP = stats.xp + xpAmount;
  
  if (newXP >= stats.xpToLevel) {
    // Level up!
    const newLevel = stats.level + 1;
    const strGain = 2 + Math.floor(Math.random() * 2);
    const defGain = 1 + Math.floor(Math.random() * 2);
    const spdGain = 1 + Math.floor(Math.random() * 2);
    const maxHPGain = 10 + Math.floor(Math.random() * 10);

    const newStats: CharacterStats = {
      level: newLevel,
      xp: newXP - stats.xpToLevel,
      xpToLevel: getXPForLevel(newLevel),
      maxHP: stats.maxHP + maxHPGain,
      strength: stats.strength + strGain,
      defense: stats.defense + defGain,
      speed: stats.speed + spdGain,
      criticalChance: Math.min(50, stats.criticalChance + 1),
      criticalDamage: stats.criticalDamage + 0.1,
    };

    return {
      state: {
        ...state,
        health: Math.min(state.health + maxHPGain, state.maxHealth + maxHPGain),
        maxHealth: state.maxHealth + maxHPGain,
        variables: {
          ...state.variables,
          characterStats: newStats,
        },
      },
      leveledUp: true,
      newLevel,
      statGains: { str: strGain, def: defGain, spd: spdGain, maxHP: maxHPGain },
    };
  }

  return {
    state: {
      ...state,
      variables: {
        ...state.variables,
        characterStats: { ...stats, xp: newXP },
      },
    },
    leveledUp: false,
    newLevel: stats.level,
    statGains: { str: 0, def: 0, spd: 0, maxHP: 0 },
  };
}

// ─── Character Stats ───

export function getCharacterStats(state: SpriteState): CharacterStats {
  return (state.variables.characterStats as CharacterStats) || {
    level: 1,
    xp: 0,
    xpToLevel: 100,
    maxHP: 100,
    strength: 10,
    defense: 5,
    speed: 8,
    criticalChance: 5,
    criticalDamage: 1.5,
  };
}

export function setCharacterStat(
  state: SpriteState,
  stat: keyof CharacterStats,
  value: number
): SpriteState {
  const stats = getCharacterStats(state);
  return {
    ...state,
    variables: {
      ...state.variables,
      characterStats: { ...stats, [stat]: value },
    },
  };
}

// ─── Damage Calculation ───

export function calculateDamage(
  attackerStats: CharacterStats,
  baseDamage: number,
  defenderDEF: number,
  shieldPercent: number = 0
): { damage: number; isCritical: boolean } {
  // Check for critical hit
  const isCritical = Math.random() * 100 < attackerStats.criticalChance;
  const critMultiplier = isCritical ? attackerStats.criticalDamage : 1;
  
  // Apply strength bonus
  const strengthBonus = 1 + (attackerStats.strength / 100);
  
  // Calculate raw damage
  const rawDamage = baseDamage * strengthBonus * critMultiplier;
  
  // Apply defense reduction (diminishing returns)
  const defReduction = defenderDEF / (defenderDEF + 50);
  const shieldReduction = shieldPercent / 100;
  const totalReduction = Math.min(0.9, defReduction + shieldReduction);
  
  const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - totalReduction)));
  
  return { damage: finalDamage, isCritical };
}

// ─── Status Effects ───

export function createStatusEffect(
  type: StatusEffectType,
  duration: number,
  value: number,
  source?: string
): StatusEffect {
  return {
    id: `status_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    duration,
    maxDuration: duration,
    value,
    source,
  };
}

export function applyStatusEffect(
  state: SpriteState,
  effect: StatusEffect
): SpriteState {
  const currentEffects = getStatusEffects(state);
  
  // Remove existing effect of same type (refresh)
  const filtered = currentEffects.filter(e => e.type !== effect.type);
  
  return {
    ...state,
    variables: {
      ...state.variables,
      statusEffects: [...filtered, effect],
    },
  };
}

export function removeStatusEffect(
  state: SpriteState,
  effectId: string
): SpriteState {
  const currentEffects = getStatusEffects(state);
  return {
    ...state,
    variables: {
      ...state.variables,
      statusEffects: currentEffects.filter(e => e.id !== effectId),
    },
  };
}

export function removeStatusEffectByType(
  state: SpriteState,
  type: StatusEffectType
): SpriteState {
  const currentEffects = getStatusEffects(state);
  return {
    ...state,
    variables: {
      ...state.variables,
      statusEffects: currentEffects.filter(e => e.type !== type),
    },
  };
}

export function getStatusEffects(state: SpriteState): StatusEffect[] {
  return (state.variables.statusEffects as StatusEffect[]) || [];
}

export function hasStatusEffect(state: SpriteState, type: StatusEffectType): boolean {
  return getStatusEffects(state).some(e => e.type === type);
}

export function processStatusEffects(state: SpriteState): SpriteState {
  const effects = getStatusEffects(state);
  let newHealth = state.health;
  const remainingEffects: StatusEffect[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case 'poison':
        newHealth -= effect.value;
        break;
      case 'burn':
        newHealth -= effect.value;
        break;
      case 'regen':
        newHealth = Math.min(state.maxHealth, newHealth + effect.value);
        break;
      // freeze, stun, shield, speed, blind are checked elsewhere
    }

    // Decrement duration
    if (effect.duration > 1) {
      remainingEffects.push({ ...effect, duration: effect.duration - 1 });
    }
  }

  return {
    ...state,
    health: Math.max(0, newHealth),
    variables: {
      ...state.variables,
      statusEffects: remainingEffects,
    },
  };
}

// ─── Difficulty ───

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, DifficultyMultipliers> = {
  easy: { enemyHP: 0.7, enemyDamage: 0.7, enemySpeed: 0.8, xpMultiplier: 0.8, goldMultiplier: 0.8 },
  normal: { enemyHP: 1.0, enemyDamage: 1.0, enemySpeed: 1.0, xpMultiplier: 1.0, goldMultiplier: 1.0 },
  hard: { enemyHP: 1.5, enemyDamage: 1.5, enemySpeed: 1.3, xpMultiplier: 1.5, goldMultiplier: 1.5 },
  insane: { enemyHP: 2.0, enemyDamage: 2.0, enemySpeed: 1.5, xpMultiplier: 2.0, goldMultiplier: 2.0 },
};

export function getDifficulty(state: SpriteState): Difficulty {
  return (state.variables.difficulty as Difficulty) || 'normal';
}

export function setDifficulty(state: SpriteState, difficulty: Difficulty): SpriteState {
  return {
    ...state,
    variables: {
      ...state.variables,
      difficulty,
      difficultyMultipliers: DIFFICULTY_MULTIPLIERS[difficulty],
    },
  };
}

// ─── Wave System ───

export function getWaveConfigs(state: SpriteState): WaveConfig[] {
  return (state.variables.waveConfigs as WaveConfig[]) || [];
}

export function setWaveConfigs(state: SpriteState, configs: WaveConfig[]): SpriteState {
  return {
    ...state,
    variables: {
      ...state.variables,
      waveConfigs: configs,
      totalWaves: configs.length,
    },
  };
}

export function getCurrentWave(state: SpriteState): number {
  return (state.variables.currentWave as number) || 1;
}

export function nextWave(state: SpriteState): { state: SpriteState; wave: WaveConfig | null } {
  const current = getCurrentWave(state);
  const configs = getWaveConfigs(state);
  
  if (current >= configs.length) {
    return { state, wave: null }; // All waves complete
  }

  const nextWaveConfig = configs[current]; // 0-indexed, current is 1-indexed
  
  return {
    state: {
      ...state,
      variables: {
        ...state.variables,
        currentWave: current + 1,
      },
    },
    wave: nextWaveConfig,
  };
}

// ─── Loot System ───

export function rollLoot(
  lootTable: LootDrop[],
  difficulty: Difficulty
): { item: LootDrop; quantity: number }[] {
  const mult = DIFFICULTY_MULTIPLIERS[difficulty];
  const drops: { item: LootDrop; quantity: number }[] = [];

  for (const loot of lootTable) {
    if (Math.random() < loot.chance) {
      const quantity = Math.floor(
        (loot.minQuantity + Math.random() * (loot.maxQuantity - loot.minQuantity + 1)) * mult.goldMultiplier
      );
      drops.push({ item: loot, quantity: Math.max(1, quantity) });
    }
  }

  return drops;
}

export function addLootToInventory(
  state: SpriteState,
  drops: { item: LootDrop; quantity: number }[]
): SpriteState {
  const newInventory = [...state.inventory];

  for (const drop of drops) {
    const existing = newInventory.find(i => i.id === drop.item.itemId);
    if (existing && existing.quantity < existing.maxStack) {
      // Stack existing item
      existing.quantity = Math.min(existing.maxStack, existing.quantity + drop.quantity);
    } else if (newInventory.length < state.maxInventorySize) {
      // Add new item
      newInventory.push({
        id: drop.item.itemId,
        name: drop.item.name,
        icon: drop.item.icon,
        type: drop.item.type as InventoryItem['type'],
        description: '',
        quantity: drop.quantity,
        maxStack: 99,
      });
    }
  }

  return { ...state, inventory: newInventory };
}

// ─── Quest System ───

export function getActiveQuests(state: SpriteState): RPGQuest[] {
  return (state.variables.activeQuests as RPGQuest[]) || [];
}

export function acceptQuest(state: SpriteState, quest: RPGQuest): SpriteState {
  const active = getActiveQuests(state);
  if (active.find(q => q.id === quest.id)) return state; // Already active
  
  return {
    ...state,
    variables: {
      ...state.variables,
      activeQuests: [...active, { ...quest, isActive: true, isCompleted: false, isTurnedIn: false }],
    },
  };
}

export function updateQuestObjective(
  state: SpriteState,
  questId: string,
  objectiveId: string,
  amount: number = 1
): SpriteState {
  const active = getActiveQuests(state);
  const questIndex = active.findIndex(q => q.id === questId);
  if (questIndex === -1) return state;

  const quest = { ...active[questIndex] };
  quest.objectives = quest.objectives.map(obj => {
    if (obj.id === objectiveId) {
      return { ...obj, current: Math.min(obj.required, obj.current + amount) };
    }
    return obj;
  });

  // Check if all objectives complete
  quest.isCompleted = quest.objectives.every(obj => obj.current >= obj.required);

  const newActive = [...active];
  newActive[questIndex] = quest;

  return {
    ...state,
    variables: {
      ...state.variables,
      activeQuests: newActive,
    },
  };
}

export function completeQuest(state: SpriteState, questId: string): {
  state: SpriteState;
  xpReward: number;
  goldReward: number;
} {
  const active = getActiveQuests(state);
  const quest = active.find(q => q.id === questId);
  if (!quest || !quest.isCompleted) return { state, xpReward: 0, goldReward: 0 };

  // Remove from active, add to completed
  const newActive = active.filter(q => q.id !== questId);
  const completed = (state.variables.completedQuests as string[]) || [];

  // Apply rewards
  let newState: SpriteState = {
    ...state,
    variables: {
      ...state.variables,
      activeQuests: newActive,
      completedQuests: [...completed, questId],
      gold: ((state.variables.gold as number) || 0) + quest.goldReward,
    },
  };

  // Add XP
  const xpResult = addXP(newState, quest.xpReward);
  newState = xpResult.state;

  return { state: newState, xpReward: quest.xpReward, goldReward: quest.goldReward };
}

// ─── Boss Phase System ───

export function getBossPhaseConfig(
  bossHealthPercent: number,
  phases: BossPhaseConfig[]
): BossPhaseConfig | null {
  // Find the phase based on health threshold
  for (let i = phases.length - 1; i >= 0; i--) {
    if (bossHealthPercent <= phases[i].healthThreshold) {
      return phases[i];
    }
  }
  return phases[0] || null;
}

export function processBossPhases(
  state: SpriteState,
  bossPhases: BossPhaseConfig[]
): SpriteState {
  if (!state.activeBoss) return state;

  const healthPercent = (state.activeBoss.health / state.activeBoss.maxHealth) * 100;
  const currentPhase = state.activeBoss.phase;
  
  const newPhaseConfig = getBossPhaseConfig(healthPercent, bossPhases);
  if (!newPhaseConfig) return state;

  if (newPhaseConfig.phase !== currentPhase) {
    // Phase transition!
    return {
      ...state,
      activeBoss: {
        ...state.activeBoss,
        phase: newPhaseConfig.phase,
        isInvulnerable: newPhaseConfig.isInvulnerable,
        attackPattern: newPhaseConfig.attackPatterns[0] || state.activeBoss.attackPattern,
      },
      variables: {
        ...state.variables,
        bossPhase: newPhaseConfig.phase,
      },
    };
  }

  return state;
}

// ─── Gold & Economy ───

export function addGold(state: SpriteState, amount: number): SpriteState {
  const currentGold = (state.variables.gold as number) || 0;
  const mult = DIFFICULTY_MULTIPLIERS[getDifficulty(state)];
  return {
    ...state,
    variables: {
      ...state.variables,
      gold: currentGold + Math.floor(amount * mult.goldMultiplier),
    },
  };
}

export function spendGold(state: SpriteState, amount: number): {
  success: boolean;
  state: SpriteState;
} {
  const currentGold = (state.variables.gold as number) || 0;
  if (currentGold >= amount) {
    return {
      success: true,
      state: {
        ...state,
        variables: { ...state.variables, gold: currentGold - amount },
      },
    };
  }
  return { success: false, state };
}

// ─── Minimap Data ───

export interface MinimapTile {
  x: number;
  y: number;
  type: 'ground' | 'hazard' | 'enemy' | 'item' | 'player' | 'boss' | 'npc';
}

export function generateMinimapData(state: SpriteState): MinimapTile[] {
  const tiles: MinimapTile[] = [];

  if (state.tilemap) {
    for (const tile of state.tilemap) {
      if (['brick', 'grass', 'dirt', 'stone', 'crate'].includes(tile.type)) {
        tiles.push({ x: tile.x, y: tile.y, type: 'ground' });
      } else if (['spike', 'lava', 'water'].includes(tile.type)) {
        tiles.push({ x: tile.x, y: tile.y, type: 'hazard' });
      }
    }
  }

  for (const enemy of state.enemies) {
    tiles.push({ x: enemy.x, y: enemy.y, type: 'enemy' });
  }

  for (const item of state.items) {
    tiles.push({ x: item.x, y: item.y, type: 'item' });
  }

  tiles.push({ x: state.x, y: state.y, type: 'player' });

  if (state.activeBoss) {
    tiles.push({ x: state.activeBoss.x, y: state.activeBoss.y, type: 'boss' });
  }

  return tiles;
}
