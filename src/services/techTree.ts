export interface TechNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  researchTime: number;
  prerequisites: string[];
  effects: Record<string, number>;
  category: string;
}

export interface TechState {
  unlocked: string[];
  researching: string | null;
  researchProgress: number;
  researchSpeed: number;
}

export const TECH_TREE: TechNode[] = [
  // Basic Tech
  { id: 'efficiency_1', name: 'Basic Efficiency', emoji: '⚡', description: 'Improve basic operations', cost: 1000, researchTime: 10, prerequisites: [], effects: { efficiency: 5 }, category: 'operations' },
  { id: 'efficiency_2', name: 'Advanced Efficiency', emoji: '⚡', description: 'Further improve operations', cost: 3000, researchTime: 20, prerequisites: ['efficiency_1'], effects: { efficiency: 10 }, category: 'operations' },
  { id: 'automation_1', name: 'Basic Automation', emoji: '🤖', description: 'Automate simple tasks', cost: 2000, researchTime: 15, prerequisites: ['efficiency_1'], effects: { automation: 10 }, category: 'automation' },
  { id: 'automation_2', name: 'Advanced Automation', emoji: '🤖', description: 'Automate complex tasks', cost: 5000, researchTime: 30, prerequisites: ['automation_1'], effects: { automation: 20 }, category: 'automation' },
  
  // Marketing Tech
  { id: 'marketing_1', name: 'Basic Marketing', emoji: '📢', description: 'Attract more customers', cost: 1500, researchTime: 12, prerequisites: [], effects: { customerRate: 10 }, category: 'marketing' },
  { id: 'marketing_2', name: 'Social Media', emoji: '📱', description: 'Leverage social platforms', cost: 4000, researchTime: 25, prerequisites: ['marketing_1'], effects: { customerRate: 20, reputation: 5 }, category: 'marketing' },
  { id: 'marketing_3', name: 'Brand Building', emoji: '⭐', description: 'Build strong brand identity', cost: 8000, researchTime: 40, prerequisites: ['marketing_2'], effects: { customerRate: 30, reputation: 15, price: 10 }, category: 'marketing' },
  
  // Quality Tech
  { id: 'quality_1', name: 'Quality Control', emoji: '🔍', description: 'Improve product quality', cost: 2000, researchTime: 15, prerequisites: [], effects: { quality: 10 }, category: 'quality' },
  { id: 'quality_2', name: 'Premium Products', emoji: '💎', description: 'Create premium product lines', cost: 6000, researchTime: 35, prerequisites: ['quality_1'], effects: { quality: 20, price: 15 }, category: 'quality' },
  
  // Finance Tech
  { id: 'finance_1', name: 'Better Accounting', emoji: '📊', description: 'Improve financial tracking', cost: 1000, researchTime: 8, prerequisites: [], effects: { revenue: 5 }, category: 'finance' },
  { id: 'finance_2', name: 'Investment', emoji: '📈', description: 'Learn to invest wisely', cost: 3000, researchTime: 18, prerequisites: ['finance_1'], effects: { revenue: 10, interest: 2 }, category: 'finance' },
  { id: 'finance_3', name: 'Diversification', emoji: '🎯', description: 'Diversify income streams', cost: 7000, researchTime: 35, prerequisites: ['finance_2'], effects: { revenue: 15, risk: -10 }, category: 'finance' },
  
  // Logistics Tech
  { id: 'logistics_1', name: 'Better Routes', emoji: '🗺️', description: 'Optimize delivery routes', cost: 1500, researchTime: 10, prerequisites: [], effects: { deliverySpeed: 10 }, category: 'logistics' },
  { id: 'logistics_2', name: 'Warehouse System', emoji: '🏭', description: 'Improve warehouse management', cost: 4000, researchTime: 22, prerequisites: ['logistics_1'], effects: { storage: 20, deliverySpeed: 15 }, category: 'logistics' },
];

export function createTechState(): TechState {
  return {
    unlocked: [],
    researching: null,
    researchProgress: 0,
    researchSpeed: 1,
  };
}

export function canResearch(state: TechState, techId: string): boolean {
  if (state.researching !== null) return false;
  if (state.unlocked.includes(techId)) return false;

  const tech = TECH_TREE.find(t => t.id === techId);
  if (!tech) return false;

  return tech.prerequisites.every(p => state.unlocked.includes(p));
}

export function startResearch(state: TechState, techId: string): TechState | null {
  if (!canResearch(state, techId)) return null;
  return { ...state, researching: techId, researchProgress: 0 };
}

export function updateResearch(state: TechState, dt: number): TechState {
  if (!state.researching) return state;

  const tech = TECH_TREE.find(t => t.id === state.researching);
  if (!tech) return { ...state, researching: null, researchProgress: 0 };

  const newProgress = state.researchProgress + dt * state.researchSpeed;

  if (newProgress >= tech.researchTime) {
    return {
      ...state,
      unlocked: [...state.unlocked, tech.id],
      researching: null,
      researchProgress: 0,
    };
  }

  return { ...state, researchProgress: newProgress };
}

export function getResearchEffects(state: TechState): Record<string, number> {
  const effects: Record<string, number> = {};

  for (const techId of state.unlocked) {
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) continue;

    for (const [key, value] of Object.entries(tech.effects)) {
      effects[key] = (effects[key] || 0) + value;
    }
  }

  return effects;
}

export function getAvailableTechs(state: TechState): TechNode[] {
  return TECH_TREE.filter(t => canResearch(state, t.id));
}

export function getUnlockedTechs(state: TechState): TechNode[] {
  return TECH_TREE.filter(t => state.unlocked.includes(t.id));
}
