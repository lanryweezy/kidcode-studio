export interface DifficultyConfig {
  name: string;
  label: string;
  emoji: string;
  description: string;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  enemySpeedMultiplier: number;
  enemyCountMultiplier: number;
  xpMultiplier: number;
  scoreMultiplier: number;
  fuelDrainMultiplier: number;
  itemDropRateMultiplier: number;
  spawnRateMultiplier: number;
}

export const DIFFICULTY_PRESETS: DifficultyConfig[] = [
  {
    name: 'casual',
    label: 'Casual',
    emoji: '😊',
    description: 'Relaxed gameplay, great for beginners',
    enemyHealthMultiplier: 0.6,
    enemyDamageMultiplier: 0.5,
    enemySpeedMultiplier: 0.7,
    enemyCountMultiplier: 0.5,
    xpMultiplier: 0.8,
    scoreMultiplier: 0.7,
    fuelDrainMultiplier: 0.6,
    itemDropRateMultiplier: 1.3,
    spawnRateMultiplier: 0.6,
  },
  {
    name: 'normal',
    label: 'Normal',
    emoji: '😐',
    description: 'Balanced challenge for most players',
    enemyHealthMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyCountMultiplier: 1.0,
    xpMultiplier: 1.0,
    scoreMultiplier: 1.0,
    fuelDrainMultiplier: 1.0,
    itemDropRateMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
  },
  {
    name: 'hard',
    label: 'Hard',
    emoji: '😠',
    description: 'Challenging for experienced players',
    enemyHealthMultiplier: 1.5,
    enemyDamageMultiplier: 1.4,
    enemySpeedMultiplier: 1.3,
    enemyCountMultiplier: 1.4,
    xpMultiplier: 1.5,
    scoreMultiplier: 1.5,
    fuelDrainMultiplier: 1.3,
    itemDropRateMultiplier: 0.8,
    spawnRateMultiplier: 1.3,
  },
  {
    name: 'insane',
    label: 'Insane',
    emoji: '🤯',
    description: 'Extreme difficulty, only for the brave',
    enemyHealthMultiplier: 2.5,
    enemyDamageMultiplier: 2.0,
    enemySpeedMultiplier: 1.8,
    enemyCountMultiplier: 2.0,
    xpMultiplier: 2.5,
    scoreMultiplier: 3.0,
    fuelDrainMultiplier: 1.8,
    itemDropRateMultiplier: 0.5,
    spawnRateMultiplier: 1.8,
  },
];

const STORAGE_KEY = 'kidcode_difficulty';

export function getCurrentDifficulty(): DifficultyConfig {
  try {
    const name = localStorage.getItem(STORAGE_KEY);
    return DIFFICULTY_PRESETS.find(d => d.name === name) || DIFFICULTY_PRESETS[1];
  } catch {
    return DIFFICULTY_PRESETS[1];
  }
}

export function setDifficulty(name: string) {
  try { localStorage.setItem(STORAGE_KEY, name); } catch { /* localStorage unavailable */ }
}

export function scaleEnemyHealth(baseHp: number, difficulty: DifficultyConfig): number {
  return Math.floor(baseHp * difficulty.enemyHealthMultiplier);
}

export function scaleEnemyDamage(baseDmg: number, difficulty: DifficultyConfig): number {
  return Math.floor(baseDmg * difficulty.enemyDamageMultiplier);
}

export function scaleEnemySpeed(baseSpeed: number, difficulty: DifficultyConfig): number {
  return +(baseSpeed * difficulty.enemySpeedMultiplier).toFixed(1);
}

export function scaleScore(baseScore: number, difficulty: DifficultyConfig): number {
  return Math.floor(baseScore * difficulty.scoreMultiplier);
}

export function scaleXP(baseXP: number, difficulty: DifficultyConfig): number {
  return Math.floor(baseXP * difficulty.xpMultiplier);
}
