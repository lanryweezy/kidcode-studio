export interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: (level: number) => Record<string, number>;
}

export interface UpgradeState {
  [upgradeId: string]: number; // current level
}

export function getUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function purchaseUpgrade(
  upgrade: Upgrade,
  state: UpgradeState,
  cash: number
): { newState: UpgradeState; cost: number } | null {
  const currentLevel = state[upgrade.id] || 0;
  if (currentLevel >= upgrade.maxLevel) return null;

  const cost = getUpgradeCost(upgrade, currentLevel);
  if (cash < cost) return null;

  return {
    newState: { ...state, [upgrade.id]: currentLevel + 1 },
    cost,
  };
}

export function getUpgradeEffects(
  upgrades: Upgrade[],
  state: UpgradeState
): Record<string, number> {
  const effects: Record<string, number> = {};
  
  for (const upgrade of upgrades) {
    const level = state[upgrade.id] || 0;
    if (level > 0) {
      const upgradeEffects = upgrade.effect(level);
      for (const [key, value] of Object.entries(upgradeEffects)) {
        effects[key] = (effects[key] || 0) + value;
      }
    }
  }

  return effects;
}

export const COMMON_UPGRADES: Upgrade[] = [
  {
    id: 'storage',
    name: 'Storage',
    emoji: '📦',
    description: 'Increase storage capacity',
    baseCost: 500,
    costMultiplier: 1.5,
    maxLevel: 10,
    effect: (level) => ({ capacity: level * 20 }),
  },
  {
    id: 'speed',
    name: 'Efficiency',
    emoji: '⚡',
    description: 'Increase processing speed',
    baseCost: 1000,
    costMultiplier: 1.8,
    maxLevel: 8,
    effect: (level) => ({ speed: level * 0.1 }),
  },
  {
    id: 'marketing',
    name: 'Marketing',
    emoji: '📢',
    description: 'Attract more customers',
    baseCost: 800,
    costMultiplier: 1.6,
    maxLevel: 10,
    effect: (level) => ({ spawnRate: level * 0.05 }),
  },
  {
    id: 'quality',
    name: 'Quality',
    emoji: '⭐',
    description: 'Improve product quality',
    baseCost: 1200,
    costMultiplier: 2.0,
    maxLevel: 7,
    effect: (level) => ({ quality: level * 5, satisfaction: level * 3 }),
  },
  {
    id: 'automation',
    name: 'Automation',
    emoji: '🤖',
    description: 'Automate routine tasks',
    baseCost: 2000,
    costMultiplier: 2.5,
    maxLevel: 5,
    effect: (level) => ({ automation: level * 0.15 }),
  },
];
