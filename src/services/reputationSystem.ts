export interface ReputationState {
  score: number;
  maxScore: number;
  level: number;
  title: string;
  bonuses: Record<string, number>;
}

const REPUTATION_LEVELS: { level: number; title: string; minScore: number; bonuses: Record<string, number> }[] = [
  { level: 1, title: 'Unknown', minScore: 0, bonuses: {} },
  { level: 2, title: 'Promising', minScore: 100, bonuses: { customerRate: 0.05 } },
  { level: 3, title: 'Growing', minScore: 250, bonuses: { customerRate: 0.1, price: 0.02 } },
  { level: 4, title: 'Established', minScore: 500, bonuses: { customerRate: 0.15, price: 0.05 } },
  { level: 5, title: 'Trusted', minScore: 800, bonuses: { customerRate: 0.2, price: 0.08, satisfaction: 5 } },
  { level: 6, title: 'Respected', minScore: 1200, bonuses: { customerRate: 0.25, price: 0.1, satisfaction: 10 } },
  { level: 7, title: 'Famous', minScore: 1800, bonuses: { customerRate: 0.3, price: 0.15, satisfaction: 15 } },
  { level: 8, title: 'Legendary', minScore: 2500, bonuses: { customerRate: 0.4, price: 0.2, satisfaction: 20 } },
  { level: 9, title: 'Icon', minScore: 3500, bonuses: { customerRate: 0.5, price: 0.25, satisfaction: 25 } },
  { level: 10, title: 'Tycoon', minScore: 5000, bonuses: { customerRate: 0.6, price: 0.3, satisfaction: 30 } },
];

export function createReputation(): ReputationState {
  return {
    score: 0,
    maxScore: 5000,
    level: 1,
    title: 'Unknown',
    bonuses: {},
  };
}

export function addReputation(state: ReputationState, amount: number): ReputationState {
  const newScore = Math.min(state.maxScore, Math.max(0, state.score + amount));
  const newLevel = getLevel(newScore);
  
  return {
    ...state,
    score: newScore,
    level: newLevel.level,
    title: newLevel.title,
    bonuses: newLevel.bonuses,
  };
}

function getLevel(score: number): { level: number; title: string; bonuses: Record<string, number> } {
  for (let i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
    if (score >= REPUTATION_LEVELS[i].minScore) {
      return { level: REPUTATION_LEVELS[i].level, title: REPUTATION_LEVELS[i].title, bonuses: REPUTATION_LEVELS[i].bonuses as Record<string, number> };
    }
  }
  return { level: 1, title: 'Unknown', bonuses: {} };
}

export function getReputationMultiplier(state: ReputationState): number {
  return 1 + (state.bonuses.customerRate || 0);
}

export function getPriceBonus(state: ReputationState): number {
  return state.bonuses.price || 0;
}

export function getSatisfactionBonus(state: ReputationState): number {
  return state.bonuses.satisfaction || 0;
}
