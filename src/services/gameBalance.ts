/**
 * Game Balance System (Loops 61-65)
 * Difficulty scaling, XP curve, drop rates, damage formulas, economy balancing
 */

// ═══════════════════════════════════════════════════════════
// DIFFICULTY SCALING (#61)
// ═══════════════════════════════════════════════════════════

export interface DifficultyConfig {
  baseEnemyHP: number;
  baseEnemyDamage: number;
  baseEnemySpeed: number;
  scalingFactor: number;
  waveMultiplier: number;
  bossMultiplier: number;
}

export const DIFFICULTY_PRESETS: Record<string, DifficultyConfig> = {
  easy: {
    baseEnemyHP: 30,
    baseEnemyDamage: 5,
    baseEnemySpeed: 0.8,
    scalingFactor: 0.08,
    waveMultiplier: 1.1,
    bossMultiplier: 1.5,
  },
  normal: {
    baseEnemyHP: 50,
    baseEnemyDamage: 10,
    baseEnemySpeed: 1.0,
    scalingFactor: 0.12,
    waveMultiplier: 1.2,
    bossMultiplier: 2.0,
  },
  hard: {
    baseEnemyHP: 80,
    baseEnemyDamage: 15,
    baseEnemySpeed: 1.2,
    scalingFactor: 0.18,
    waveMultiplier: 1.35,
    bossMultiplier: 2.5,
  },
  insane: {
    baseEnemyHP: 120,
    baseEnemyDamage: 25,
    baseEnemySpeed: 1.5,
    scalingFactor: 0.25,
    waveMultiplier: 1.5,
    bossMultiplier: 3.0,
  },
};

export function getScaledEnemyStats(
  difficulty: string,
  waveNumber: number,
  playerLevel: number,
  isBoss: boolean = false
): {
  hp: number;
  damage: number;
  speed: number;
} {
  const config = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
  const waveScale = Math.pow(config.waveMultiplier, waveNumber - 1);
  const levelScale = 1 + (playerLevel - 1) * 0.05;
  const bossScale = isBoss ? config.bossMultiplier : 1;

  return {
    hp: Math.round(config.baseEnemyHP * waveScale * levelScale * bossScale),
    damage: Math.round(config.baseEnemyDamage * waveScale * levelScale * bossScale),
    speed: config.baseEnemySpeed * Math.min(2, 1 + (waveNumber - 1) * 0.02),
  };
}

export function getDifficultyModifier(difficulty: string): number {
  const modifiers: Record<string, number> = {
    easy: 0.7,
    normal: 1.0,
    hard: 1.4,
    insane: 2.0,
  };
  return modifiers[difficulty] || 1.0;
}

// ═══════════════════════════════════════════════════════════
// XP CURVE (#62)
// ═══════════════════════════════════════════════════════════

export interface XPConfig {
  baseXP: number;
  growthRate: number;
  maxLevel: number;
  softCap: number;
  softCapPenalty: number;
}

export const XP_CURVE_CONFIG: XPConfig = {
  baseXP: 100,
  growthRate: 1.5,
  maxLevel: 100,
  softCap: 50,
  softCapPenalty: 0.5,
};

export function getXPForLevel(level: number, config: XPConfig = XP_CURVE_CONFIG): number {
  if (level <= 1) return 0;
  const baseXP = config.baseXP * Math.pow(config.growthRate, level - 2);
  
  if (level > config.softCap) {
    return Math.round(baseXP * (1 + (level - config.softCap) * config.softCapPenalty));
  }
  
  return Math.round(baseXP);
}

export function getLevelFromXP(totalXP: number, config: XPConfig = XP_CURVE_CONFIG): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  let accumulatedXP = 0;

  while (level < config.maxLevel) {
    const requiredXP = getXPForLevel(level + 1, config);
    if (accumulatedXP + requiredXP > totalXP) {
      break;
    }
    accumulatedXP += requiredXP;
    level++;
  }

  const nextLevelXP = getXPForLevel(level + 1, config);
  const currentLevelXP = totalXP - accumulatedXP;

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progress: nextLevelXP > 0 ? currentLevelXP / nextLevelXP : 1,
  };
}

export function getStatBonusesForLevel(level: number): {
  maxHP: number;
  damage: number;
  defense: number;
  speed: number;
} {
  return {
    maxHP: 100 + (level - 1) * 10,
    damage: 10 + (level - 1) * 2,
    defense: 5 + (level - 1) * 1,
    speed: 1 + Math.min(0.5, (level - 1) * 0.01),
  };
}

// ═══════════════════════════════════════════════════════════
// DROP RATES (#63)
// ═══════════════════════════════════════════════════════════

export interface DropTable {
  itemId: string;
  baseChance: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  minQuantity: number;
  maxQuantity: number;
  levelRequirement?: number;
}

export interface DropModifiers {
  luckBonus: number;
  playerLevel: number;
  enemyLevel: number;
  comboMultiplier: number;
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070ff',
  epic: '#a335ee',
  legendary: '#ff8000',
};

export function calculateDropChance(
  baseChance: number,
  modifiers: DropModifiers
): number {
  const luckBonus = 1 + modifiers.luckBonus * 0.01;
  const levelBonus = modifiers.playerLevel > modifiers.enemyLevel
    ? 1 + (modifiers.playerLevel - modifiers.enemyLevel) * 0.02
    : 1;
  const comboBonus = modifiers.comboMultiplier;

  return Math.min(1, baseChance * luckBonus * levelBonus * comboBonus);
}

export function rollDrops(
  dropTable: DropTable[],
  modifiers: DropModifiers,
  count: number = 1
): { itemId: string; quantity: number; rarity: string }[] {
  const drops: { itemId: string; quantity: number; rarity: string }[] = [];

  for (let i = 0; i < count; i++) {
    for (const entry of dropTable) {
      if (entry.levelRequirement && modifiers.playerLevel < entry.levelRequirement) {
        continue;
      }

      const chance = calculateDropChance(entry.baseChance, modifiers);
      if (Math.random() < chance) {
        const quantity = entry.minQuantity +
          Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1));
        drops.push({
          itemId: entry.itemId,
          quantity,
          rarity: entry.rarity,
        });
      }
    }
  }

  return drops;
}

export function getDropChanceByRarity(rarity: string): number {
  const chances: Record<string, number> = {
    common: 0.5,
    uncommon: 0.25,
    rare: 0.1,
    epic: 0.03,
    legendary: 0.01,
  };
  return chances[rarity] || 0.5;
}

// ═══════════════════════════════════════════════════════════
// DAMAGE FORMULAS (#64)
// ═══════════════════════════════════════════════════════════

export interface CombatStats {
  attack: number;
  defense: number;
  critChance: number;
  critDamage: number;
  elementalDamage?: number;
  elementalResist?: number;
}

export function calculateDamage(
  attacker: CombatStats,
  defender: CombatStats,
  options: {
    isCritical?: boolean;
    isElemental?: boolean;
    comboBonus?: number;
  } = {}
): {
  baseDamage: number;
  mitigatedDamage: number;
  finalDamage: number;
  wasCritical: boolean;
} {
  const { comboBonus = 1 } = options;
  
  const baseDamage = attacker.attack * comboBonus;
  const defenseReduction = defender.defense / (defender.defense + 100);
  const mitigatedDamage = baseDamage * (1 - defenseReduction);

  let isCritical = options.isCritical ?? (Math.random() < attacker.critChance);
  const critMultiplier = isCritical ? attacker.critDamage : 1;

  let finalDamage = mitigatedDamage * critMultiplier;

  if (options.isElemental && attacker.elementalDamage) {
    const elementalReduction = defender.elementalResist
      ? defender.elementalResist / (defender.elementalResist + 50)
      : 0;
    finalDamage += attacker.elementalDamage * (1 - elementalReduction);
  }

  return {
    baseDamage: Math.round(baseDamage),
    mitigatedDamage: Math.round(mitigatedDamage),
    finalDamage: Math.round(Math.max(1, finalDamage)),
    wasCritical: isCritical,
  };
}

export function calculateHealAmount(
  healPower: number,
  bonusHealing: number = 0,
  multiplier: number = 1
): number {
  return Math.round((healPower + bonusHealing) * multiplier);
}

export function calculateDOTDamage(
  baseDamage: number,
  duration: number,
  tickRate: number = 1
): { damagePerTick: number; totalDamage: number; ticks: number } {
  const ticks = Math.floor(duration / tickRate);
  const damagePerTick = Math.round(baseDamage / ticks);
  return {
    damagePerTick,
    totalDamage: damagePerTick * ticks,
    ticks,
  };
}

// ═══════════════════════════════════════════════════════════
// ECONOMY BALANCING (#65)
// ═══════════════════════════════════════════════════════════

export interface EconomyConfig {
  startingGold: number;
  goldPerKill: number;
  goldPerQuest: number;
  shopMarkup: number;
  sellDiscount: number;
  inflationRate: number;
}

export const ECONOMY_PRESETS: Record<string, EconomyConfig> = {
  easy: {
    startingGold: 200,
    goldPerKill: 15,
    goldPerQuest: 100,
    shopMarkup: 1.2,
    sellDiscount: 0.6,
    inflationRate: 1.0,
  },
  normal: {
    startingGold: 100,
    goldPerKill: 10,
    goldPerQuest: 75,
    shopMarkup: 1.5,
    sellDiscount: 0.5,
    inflationRate: 1.0,
  },
  hard: {
    startingGold: 50,
    goldPerKill: 7,
    goldPerQuest: 50,
    shopMarkup: 1.8,
    sellDiscount: 0.4,
    inflationRate: 1.1,
  },
};

export function getGoldForKill(
  enemyLevel: number,
  config: EconomyConfig = ECONOMY_PRESETS.normal
): number {
  return Math.round(config.goldPerKill * (1 + enemyLevel * 0.1));
}

export function getShopPrice(
  basePrice: number,
  playerLevel: number,
  config: EconomyConfig = ECONOMY_PRESETS.normal
): number {
  const levelMultiplier = 1 + (playerLevel - 1) * 0.05;
  return Math.round(basePrice * config.shopMarkup * levelMultiplier * config.inflationRate);
}

export function getSellPrice(
  buyPrice: number,
  config: EconomyConfig = ECONOMY_PRESETS.normal
): number {
  return Math.round(buyPrice * config.sellDiscount);
}

export function calculateItemValue(
  rarity: string,
  level: number,
  baseValue: number
): number {
  const rarityMultipliers: Record<string, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 8,
  };
  const rarityMult = rarityMultipliers[rarity] || 1;
  const levelMult = 1 + (level - 1) * 0.1;
  return Math.round(baseValue * rarityMult * levelMult);
}

export function getQuestReward(
  questDifficulty: string,
  playerLevel: number,
  config: EconomyConfig = ECONOMY_PRESETS.normal
): { gold: number; xp: number; items: string[] } {
  const difficultyMultipliers: Record<string, number> = {
    easy: 0.7,
    normal: 1.0,
    hard: 1.5,
    epic: 2.5,
  };
  const mult = difficultyMultipliers[questDifficulty] || 1.0;
  const levelBonus = 1 + (playerLevel - 1) * 0.1;

  return {
    gold: Math.round(config.goldPerQuest * mult * levelBonus),
    xp: Math.round(50 * mult * levelBonus),
    items: [],
  };
}

// ═══════════════════════════════════════════════════════════
// BALANCE UTILITIES
// ═══════════════════════════════════════════════════════════

export function getBalanceSummary(difficulty: string, waveNumber: number, playerLevel: number): {
  enemyHP: number;
  enemyDamage: number;
  xpToNextLevel: number;
  goldPerKill: number;
  playerMaxHP: number;
  playerDamage: number;
} {
  const enemyStats = getScaledEnemyStats(difficulty, waveNumber, playerLevel);
  const xpInfo = getLevelFromXP(0);
  const xpToNext = getXPForLevel(playerLevel + 1);
  const playerStats = getStatBonusesForLevel(playerLevel);
  const economyConfig = ECONOMY_PRESETS[difficulty] || ECONOMY_PRESETS.normal;

  return {
    enemyHP: enemyStats.hp,
    enemyDamage: enemyStats.damage,
    xpToNextLevel: xpToNext,
    goldPerKill: getGoldForKill(waveNumber, economyConfig),
    playerMaxHP: playerStats.maxHP,
    playerDamage: playerStats.damage,
  };
}
