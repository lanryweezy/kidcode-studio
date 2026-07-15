export interface GameEvent {
  id: string;
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedSector: string;
  severity: number;
  timestamp: number;
}

export interface EventTemplate {
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedSector: string;
  baseSeverity: number;
}

// Market events for stock/finance games
export const MARKET_EVENTS: EventTemplate[] = [
  { text: 'Tech earnings beat expectations! 📈', impact: 'positive', affectedSector: 'tech', baseSeverity: 0.15 },
  { text: 'Oil prices surge, energy sector booms! ⛽', impact: 'positive', affectedSector: 'energy', baseSeverity: 0.12 },
  { text: 'Health scare leads to medical stock rally! 🏥', impact: 'positive', affectedSector: 'health', baseSeverity: 0.1 },
  { text: 'Auto recalls shake investor confidence! 🚗', impact: 'negative', affectedSector: 'auto', baseSeverity: -0.12 },
  { text: 'Food safety concerns hit restaurants! 🍔', impact: 'negative', affectedSector: 'food', baseSeverity: -0.1 },
  { text: 'Market-wide panic sell! Everything drops! 📉', impact: 'negative', affectedSector: 'all', baseSeverity: -0.08 },
  { text: 'Bull market rally! Investors celebrate! 🐂', impact: 'positive', affectedSector: 'all', baseSeverity: 0.06 },
  { text: 'Interest rate hike announced! 🏦', impact: 'negative', affectedSector: 'finance', baseSeverity: -0.1 },
  { text: 'Green energy subsidies boost solar stocks! 🌱', impact: 'positive', affectedSector: 'energy', baseSeverity: 0.18 },
  { text: 'Retail spending exceeds forecasts! 🛍️', impact: 'positive', affectedSector: 'retail', baseSeverity: 0.08 },
  { text: 'Tech bubble concerns cause selloff! 💻', impact: 'negative', affectedSector: 'tech', baseSeverity: -0.15 },
  { text: 'New trade deal benefits manufacturing! 🏭', impact: 'positive', affectedSector: 'all', baseSeverity: 0.04 },
];

// Customer events for shop/hotel/service games
export const CUSTOMER_EVENTS: EventTemplate[] = [
  { text: 'Celebrity spotted at your establishment! 🌟', impact: 'positive', affectedSector: 'all', baseSeverity: 0.2 },
  { text: 'Local holiday brings extra customers! 🎉', impact: 'positive', affectedSector: 'all', baseSeverity: 0.15 },
  { text: 'Bad review goes viral! 😰', impact: 'negative', affectedSector: 'all', baseSeverity: -0.15 },
  { text: 'Competitor opens nearby! 🏪', impact: 'negative', affectedSector: 'all', baseSeverity: -0.1 },
  { text: 'Perfect weather day! ☀️', impact: 'positive', affectedSector: 'all', baseSeverity: 0.08 },
  { text: 'Power outage affects service! ⚡', impact: 'negative', affectedSector: 'all', baseSeverity: -0.12 },
  { text: 'Loyal customer brings friends! 👥', impact: 'positive', affectedSector: 'all', baseSeverity: 0.1 },
  { text: 'Supply delivery delayed! 📦', impact: 'negative', affectedSector: 'all', baseSeverity: -0.08 },
];

// Production events for manufacturing/industrial games
export const PRODUCTION_EVENTS: EventTemplate[] = [
  { text: 'New efficiency technology discovered! 🔬', impact: 'positive', affectedSector: 'all', baseSeverity: 0.15 },
  { text: 'Worker strike halts production! ✊', impact: 'negative', affectedSector: 'all', baseSeverity: -0.2 },
  { text: 'Bulk material discount available! 💰', impact: 'positive', affectedSector: 'all', baseSeverity: 0.1 },
  { text: 'Equipment breakdown! 🔧', impact: 'negative', affectedSector: 'all', baseSeverity: -0.12 },
  { text: 'Government contract awarded! 📋', impact: 'positive', affectedSector: 'all', baseSeverity: 0.18 },
  { text: 'Raw material price increase! 📈', impact: 'negative', affectedSector: 'all', baseSeverity: -0.1 },
];

export function generateEvent(
  templates: EventTemplate[],
  difficulty: number = 1,
  chance: number = 0.3
): GameEvent | null {
  if (Math.random() > chance * difficulty) return null;
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: template.text,
    impact: template.impact,
    affectedSector: template.affectedSector,
    severity: template.baseSeverity * difficulty,
    timestamp: Date.now(),
  };
}

export function applyEvent<T extends { price?: number; revenue?: number; satisfaction?: number; sector?: string }>(
  items: T[],
  event: GameEvent
): T[] {
  return items.map(item => {
    if (event.affectedSector === 'all') {
      return applyImpact(item, event.severity);
    }
    const sector = (item as Record<string, unknown>).sector || (item as Record<string, unknown>).type;
    if (sector === event.affectedSector) {
      return applyImpact(item, event.severity);
    }
    return item;
  });
}

function applyImpact<T extends Record<string, unknown>>(item: T, severity: number): T {
  const updated: Record<string, unknown> = { ...item };
  if ('price' in updated && typeof updated.price === 'number') {
    updated.price = Math.max(1, updated.price * (1 + severity));
  }
  if ('revenue' in updated && typeof updated.revenue === 'number') {
    updated.revenue = Math.max(0, updated.revenue * (1 + severity));
  }
  if ('satisfaction' in updated && typeof updated.satisfaction === 'number') {
    updated.satisfaction = Math.min(100, Math.max(0, updated.satisfaction + severity * 50));
  }
  return updated as T;
}
